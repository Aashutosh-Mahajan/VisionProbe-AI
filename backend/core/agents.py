import os
import json
import base64
import logging
from openai import OpenAI
from django.conf import settings

from .web_extract import summarize_product_urls

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for all AI agents with OpenAI integration."""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not set. AI agents will not function.")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = os.getenv('GPT_MODEL_NAME', 'gpt-5.1')

    def _get_system_prompt(self):
        raise NotImplementedError("Subclasses must implement _get_system_prompt")

    def _call_gpt(self, messages, response_format={"type": "json_object"}):
        """Make a GPT API call with proper error handling."""
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        if not self.client:
            raise ValueError("OpenAI client not initialized")

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format=response_format,
                temperature=0.2,
                # New OpenAI API uses max_completion_tokens instead of max_tokens
                max_completion_tokens=800,
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            raise ValueError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    def _call_gpt_text(self, messages):
        """Make a GPT API call that returns plain text."""
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        if not self.client:
            raise ValueError("OpenAI client not initialized")

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.2,
                max_completion_tokens=600,
            )
            return (response.choices[0].message.content or '').strip()
        except Exception as e:
            logger.error(f"OpenAI API error (text): {e}")
            raise


class ProductChatAgent(BaseAgent):
    """Chat agent: answer user questions using the current report context."""

    def _get_system_prompt(self):
        return (
            "You are VisionProbe AI Chat Assistant. "
            "Help the user understand the product. "
            "Use the provided report context and web context when relevant. "
            "Be concise, factual, and avoid medical/legal/financial advice. "
            "If info is missing, say what you don't know and suggest what to verify."
        )

    def run(self, message: str, report_context):
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": f"Report context (JSON): {json.dumps(report_context)[:12000]}"},
            {"role": "user", "content": message},
        ]
        return self._call_gpt_text(messages)


class VisualIdentificationAgent(BaseAgent):
    """Agent 1: Identify product from image."""
    
    def _get_system_prompt(self):
                return """
                You are the Visual Identification Agent for VPIP.
                Task: Identify the product in the image with evidence and calibrated confidence.

                Respond ONLY with JSON matching this exact schema:
                {
                    "product_name": string,                // concise name if identifiable, else "Unknown"
                    "category": string,                    // e.g., "Electronics > Headphones"; fallback "General"
                    "brand": string | null,                // null if not visible
                    "confidence": number,                  // 0.0 - 1.0 reflecting actual certainty
                    "visual_clues": [string]               // 2-6 short clues from the image
                }

                Guidance:
                - Base confidence on visual evidence only; low-quality/partial images => confidence < 0.5.
                - Do not guess specifications or internals; stay within what is visible.
                - Keep names short, avoid marketing language.
                - If non-product or ambiguous, use "Unknown" and confidence <= 0.3.
                """

    def _web_context_from_urls(self, product_urls):
        if not product_urls:
            return None

        # Preferred path: OpenAI web_search tool (same pattern as BuyLinkAgent)
        if self.client and self.api_key:
            try:
                response = self.client.responses.create(
                    model=self.model,
                    tools=[{"type": "web_search"}],
                    input=[
                        {
                            "role": "system",
                            "content": (
                                "You are a web research helper. Extract factual product signals from the given URLs. "
                                "Return a short, non-marketing summary including: likely product name, brand (if visible), and any price you can find. "
                                "If the URLs do not contain product details, say so."
                            ),
                        },
                        {
                            "role": "user",
                            "content": "URLs:\n" + "\n".join(product_urls),
                        },
                    ],
                )
                text = (response.output_text or '').strip()
                if text:
                    return {"method": "openai_web_search", "text": text, "urls": list(product_urls)}
            except Exception as e:
                logger.info("Agent1 web_search failed; falling back to requests parsing: %s", e)

        # Fallback: lightweight local extraction
        try:
            summary = summarize_product_urls(product_urls)
            return {"method": "requests_extract", **summary}
        except Exception as e:
            logger.info("Agent1 requests_extract failed: %s", e)
            # Fallback: at least pass through URLs so downstream can attempt inference
            return {"method": "urls_only", "text": "Requests extract failed; using URLs only", "urls": list(product_urls)}

    def run(self, image_path_or_url, product_urls=None):
        """Identify product from image, URLs, or both. Combines all available data sources."""
        product_urls = product_urls or []
        web_context = self._web_context_from_urls(product_urls)

        # Ensure we always have some web_context when URLs are provided, even if fetch/search fails
        if product_urls and not web_context:
            web_context = {"method": "urls_only", "text": "Using raw URLs as context; page fetch/web_search unavailable", "urls": list(product_urls)}

        # Case 1: Only URLs provided (no image)
        if not image_path_or_url:
            # URL-only flow: always attempt identification from web_context (never fall back to "no image")
            messages = [
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": f"Identify the product from these URLs / web signals. Work with what is available; if data is sparse, make the best evidence-based call and keep confidence calibrated.\n\nContext:\n{json.dumps(web_context)[:5000]}\n\nReturn product_name, category, brand, confidence (0.4-0.7 for URL-only), and 2-6 visual_clues summarizing web evidence."}
            ]
            result = self._call_gpt(messages)
            if isinstance(result, dict):
                result["_web_context"] = web_context
                result["visual_clues"] = result.get("visual_clues", []) + ["Analyzed from product URLs only"]
            return result

        # Case 2: Image provided (with or without URLs)
        if os.path.isfile(image_path_or_url):
            with open(image_path_or_url, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                image_url = f"data:image/jpeg;base64,{base64_image}"
        else:
            image_url = image_path_or_url

        # Build prompt that combines image + URLs when both available
        text_prompt = "Identify this product from the image."
        
        if product_urls and web_context:
            text_prompt += f"\n\nADDITIONAL CONTEXT from user-provided URLs:\n{json.dumps(web_context)[:5000]}\n\nUse this web data to cross-validate and enrich your image-based identification. If the image and web data conflict, prioritize the image but note the discrepancy."
        elif product_urls:
            text_prompt += f"\n\nUser also provided these product URLs (for reference):\n" + "\n".join(product_urls)

        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": text_prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url, "detail": "high"},
                    },
                ],
            },
        ]
        result = self._call_gpt(messages)
        if isinstance(result, dict) and web_context:
            result["_web_context"] = web_context
        return result


class KnowledgeEnrichmentAgent(BaseAgent):
    """Agent 2: Provide general factual info."""
    
    def _get_system_prompt(self):
                return """
                You are the Knowledge Enrichment Agent.
                Task: Add concise, factual context about the identified product.

                Respond ONLY with JSON matching this schema:
                {
                    "overview": string,            // 2-3 sentences, factual, no hype
                    "key_features": [string],      // 3-8 bullet-ready items
                    "common_variants": [string],   // typical models/variants; empty if none
                    "uncertainties": [string]      // what is not known or assumed; empty if none
                }

                Guidance:
                - Prefer broadly true statements over speculative details.
                - If the product is unclear, keep overview generic and list uncertainties.
                - Avoid brand opinions or pricing.
                """

    def run(self, product_id_data):
        """Enrich product with factual knowledge."""
        product_name = product_id_data.get("product_name", "Unknown")
        category = product_id_data.get("category", "General")
        
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": f"Enrich knowledge for product: {product_name} (Category: {category})"}
        ]
        return self._call_gpt(messages)


class UseCaseAgent(BaseAgent):
    """Agent 3: Explain usage & users."""
    
    def _get_system_prompt(self):
                return """
                You are the Use-Case Intelligence Agent.
                Task: Describe who should use this product and how, with safety in mind.

                Respond ONLY with JSON matching this schema:
                {
                    "intended_users": [string],      // audience groups; 2-5 items
                    "common_use_cases": [string],    // practical scenarios; 3-6 items
                    "usage_frequency": string,       // concise guidance e.g., "Daily", "Occasional"
                    "misuse_warnings": [string]      // misuse or safety notes; empty if none
                }

                Guidance:
                - Align use cases with the identified category, not speculation.
                - Misuse warnings should be specific and actionable.
                """

    def run(self, product_name):
        """Analyze use cases for product."""
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": f"Analyze use cases for: {product_name}"}
        ]
        return self._call_gpt(messages)


class ImpactAnalysisAgent(BaseAgent):
    """Agent 4: Health & environmental impact."""
    
    def _get_system_prompt(self):
                return """
                You are the Impact & Risk Analysis Agent.
                Task: Assess health and environmental impacts based on product type and typical materials/usage.

                Respond ONLY with JSON matching this schema:
                {
                    "health_impact": string,                 // concise, factual risk/benefit summary
                    "environmental_impact": string,          // concise footprint/waste summary
                    "risk_level": "low" | "medium" | "high", // holistic risk considering typical use
                    "impact_score": number,                  // 0-100, higher = safer/lower impact
                    "limitations": [string]                  // assumptions or missing info
                }

                Guidance:
                - Calibrate risk_level and impact_score consistently: high risk => score < 35; low risk => > 70.
                - If the product is unclear, choose "medium" risk_level with honest limitations.
                - Avoid medical or legal claims; keep wording informational.
                """

    def run(self, product_details):
        """Analyze health and environmental impact."""
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": f"Analyze impact for: {json.dumps(product_details)}"}
        ]
        return self._call_gpt(messages)


class RecommendationAgent(BaseAgent):
    """Agent 5: Suggest safer/better alternatives."""
    
    def _get_system_prompt(self):
                return """
                You are the Recommendation Agent.
                Task: Suggest safer or better alternatives when impact is concerning.

                Respond ONLY with JSON matching this schema:
                {
                    "recommendation_summary": string,   // 1-2 sentences summarizing guidance
                    "alternatives": [
                        {
                            "alternative_type": string,    // product type or material shift
                            "reason": string                // why this is safer/better
                        }
                    ]
                }

                Guidance:
                - If impact is low risk, keep alternatives empty and summary should state current product is acceptable.
                - Reasons must map to impact concerns (e.g., lower toxins, recyclable materials, energy efficiency).
                - Do not list brands; focus on categories/searchable descriptors.
                """

    def run(self, impact_data, product_name):
        """Generate recommendations based on impact analysis."""
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": f"Product: {product_name}. Impact: {json.dumps(impact_data)}"}
        ]
        return self._call_gpt(messages)


class BuyLinkAgent(BaseAgent):
    """Agent 6: Purchase links provider."""
    
    def _get_system_prompt(self):
                return """
                You are the Buy Link Agent.

                ROLE:
                You are responsible for finding and returning REAL, DIRECT product purchase links (actual product pages, not search pages) for the given product.

                OBJECTIVE:
                Provide verified, platform-specific product URLs that directly open the product detail page (PDP) on trusted e-commerce platforms.

                RESPONSE FORMAT:
                Respond ONLY with valid JSON matching this schema:

                {
                  "purchase_recommended": boolean,
                  "purchase_reason": string,
                  "buy_links": [
                    {
                      "platform": string,
                      "link": string,
                      "description": string
                    }
                  ]
                }

                STRICT RULES (MANDATORY):
                1. DO NOT return generic search URLs (❌ /s?k=, /search, query links).
                2. Each link MUST be a direct product page URL (PDP) that:
                   - Contains a product identifier such as:
                     - Amazon ASIN (/dp/ or /gp/product/)
                     - Flipkart PID (/p/)
                     - eBay item ID (/itm/)
                     - Official store product slug
                3. Links must be realistic and platform-correct in structure.
                4. If you cannot confidently infer a real product page:
                   - Set "purchase_recommended" to false
                   - Explain clearly why exact links cannot be guaranteed
                   - Leave "buy_links" as an empty array

                PLATFORMS TO PRIORITIZE:
                - Official brand website (highest priority)
                - Amazon
                - Flipkart (India)
                - eBay
                - Walmart (US)
                - BestBuy (electronics)
                - Nike / Adidas / Apple / Samsung official stores when applicable

                LINK QUALITY GUIDELINES:
                - Prefer official sellers or "Sold by Amazon / Brand"
                - Avoid affiliate parameters and tracking junk
                - Use clean, canonical URLs
                - Prefer latest model/version unless specified otherwise

                RISK HANDLING:
                - If prior agents indicate HIGH RISK, counterfeit risk, or safety concerns:
                  - Set "purchase_recommended" = false
                  - Explain risk clearly
                  - Do NOT provide any buy links

                EXAMPLES OF VALID LINKS:
                ✅ https://www.amazon.in/dp/B0C7Q3ZK7N  
                ✅ https://www.flipkart.com/apple-iphone-15/p/itm123456  
                ✅ https://www.apple.com/in/iphone-15/  
                ❌ https://www.amazon.in/s?k=iphone+15  
                ❌ https://www.flipkart.com/search?q=iphone

                OUTPUT EXPECTATIONS:
                - Provide 3–5 links if available
                - Each link must be platform-diverse
                - Descriptions should clarify trust level (e.g., "Official Apple Store", "Amazon – Fulfilled by Amazon")

                You are not allowed to explain your reasoning outside the JSON.
                """

    def run(self, purchase_context):
        """Generate purchase links for the product."""
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        if not self.client:
            raise ValueError("OpenAI client not initialized")

        try:
            response = self.client.responses.create(
                model=self.model,
                tools=[{"type": "web_search"}],
                input=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": f"Purchase Context: {json.dumps(purchase_context)}"},
                ],
            )
            content = response.output_text
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error (buy links): {e}")
            raise ValueError(f"Failed to parse buy link response as JSON: {e}")
        except Exception as e:
            logger.error(f"OpenAI web_search error: {e}")
            raise
