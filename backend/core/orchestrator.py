import logging
import json
import os
from .agents import (
    VisualIdentificationAgent,
    KnowledgeEnrichmentAgent,
    UseCaseAgent,
    ImpactAnalysisAgent,
    RecommendationAgent,
    BuyLinkAgent
)

from .web_extract import fetch_url_html, extract_price_from_html

logger = logging.getLogger(__name__)


class Orchestrator:
    """Central orchestrator that controls the AI agent pipeline."""
    
    def __init__(self):
        self.visual_agent = VisualIdentificationAgent()
        self.knowledge_agent = KnowledgeEnrichmentAgent()
        self.use_case_agent = UseCaseAgent()
        self.impact_agent = ImpactAnalysisAgent()
        self.recommendation_agent = RecommendationAgent()
        self.buy_agent = BuyLinkAgent()

    def process(self, image_path, product_urls=None):
        """
        Main execution flow.
        Returns: Final structured JSON report.
        """
        logger.info(f"Starting analysis for image: {image_path}, URLs: {product_urls}")

        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY is missing. Set it in environment or .env.")
        
        report = {
            "status": "processing",
            "steps_completed": [],
            "data": {},
            "errors": []
        }

        if product_urls:
            report['data']['input_urls'] = list(product_urls)

        # Step 1: Visual Identification
        logger.info("Step 1: Running Visual Identification Agent...")
        try:
            visual_data = self.visual_agent.run(image_path, product_urls=product_urls)
            web_context = None
            if isinstance(visual_data, dict) and '_web_context' in visual_data:
                web_context = visual_data.pop('_web_context', None)
            logger.info(f"Visual ID result: {visual_data}")
            
            # Check for API errors in response
            if "error" in visual_data:
                raise ValueError(visual_data["error"])
            
            report['data']['product_summary'] = visual_data
            report['steps_completed'].append("visual_id")

            if web_context:
                report['data']['web_context'] = web_context
                report['steps_completed'].append("web_context")
            
            # Confidence handling: be lenient when running URL-only (no image)
            confidence = visual_data.get('confidence', 0)
            has_image_input = bool(image_path)
            if has_image_input and confidence < 0.5:
                report['status'] = "aborted"
                report['confidence_notice'] = "Low confidence in identification. Stopping analysis to save cost."
                logger.warning(f"Aborting due to low confidence with image: {confidence}")
                return report
            if (not has_image_input) and confidence < 0.35:
                # Do not abort for URL-only; just record notice and continue with best-effort downstream
                report['confidence_notice'] = "Low confidence from URL-only analysis; downstream steps may be less accurate."
                logger.warning(f"Proceeding despite low confidence (URL-only): {confidence}")
                # Boost minimal confidence to avoid downstream hard stops
                visual_data['confidence'] = max(confidence, 0.35)
                report['data']['product_summary'] = visual_data
            
            product_name = visual_data.get('product_name', 'Unknown Product')
            product_category = visual_data.get('category', 'General')
            logger.info(f"Identified: {product_name} ({product_category})")
            
        except Exception as e:
            logger.error(f"Visual ID failed: {e}")
            report['errors'].append(f"Visual ID error: {str(e)}")
            report['status'] = "failed"
            report['data']['product_summary'] = {
                "product_name": "Analysis Failed",
                "category": "Error",
                "confidence": 0,
                "error": str(e)
            }
            return report

        # Step 2: Knowledge Enrichment
        logger.info("Step 2: Running Knowledge Enrichment Agent...")
        try:
            enrichment_data = self.knowledge_agent.run({
                "product_name": product_name, 
                "category": product_category
            })
            if "error" not in enrichment_data:
                report['data']['knowledge'] = enrichment_data
                report['steps_completed'].append("knowledge")
            else:
                logger.warning(f"Knowledge enrichment error: {enrichment_data['error']}")
                report['errors'].append(f"Knowledge: {enrichment_data['error']}")
        except Exception as e:
            logger.error(f"Knowledge error: {e}")
            report['errors'].append(f"Knowledge error: {str(e)}")

        # Step 3: Use Case Analysis
        logger.info("Step 3: Running Use Case Agent...")
        try:
            use_case_data = self.use_case_agent.run(product_name)
            if "error" not in use_case_data:
                report['data']['usage'] = use_case_data
                report['steps_completed'].append("usage")
            else:
                logger.warning(f"Use case error: {use_case_data['error']}")
                report['errors'].append(f"Usage: {use_case_data['error']}")
        except Exception as e:
            logger.error(f"Use case error: {e}")
            report['errors'].append(f"Use case error: {str(e)}")

        # Step 4: Impact Analysis
        logger.info("Step 4: Running Impact Analysis Agent...")
        impact_data = {}
        try:
            product_details = {
                "name": product_name,
                "category": product_category,
                "features": report['data'].get('knowledge', {}).get('key_features', [])
            }
            impact_data = self.impact_agent.run(product_details)
            if "error" not in impact_data:
                report['data']['impact'] = impact_data
                report['steps_completed'].append("impact")
            else:
                logger.warning(f"Impact error: {impact_data['error']}")
                report['errors'].append(f"Impact: {impact_data['error']}")
        except Exception as e:
            logger.error(f"Impact error: {e}")
            report['errors'].append(f"Impact error: {str(e)}")

        # Step 5: Recommendations
        logger.info("Step 5: Running Recommendation Agent...")
        rec_data = {}
        try:
            rec_data = self.recommendation_agent.run(impact_data, product_name)
            if "error" not in rec_data:
                report['data']['recommendations'] = rec_data
                report['steps_completed'].append("recommendations")
            else:
                logger.warning(f"Recommendation error: {rec_data['error']}")
                report['errors'].append(f"Recommendations: {rec_data['error']}")
        except Exception as e:
            logger.error(f"Recommendation error: {e}")
            report['errors'].append(f"Recommendation error: {str(e)}")

        # Step 6: Buy Links (Conditional on risk level)
        logger.info("Step 6: Running Buy Link Agent...")
        risk_level = report['data'].get('impact', {}).get('risk_level', 'low')

        if risk_level == 'high':
            report['data']['buy_guidance'] = {
                "purchase_recommended": False,
                "purchase_reason": "High risk detected. Purchase links are disabled for safety.",
                "buy_links": []
            }
            report['steps_completed'].append("buy_link_skipped_safety")
            logger.info("Buy links skipped due to high risk")
        else:
            try:
                buy_request = {
                    "product_name": product_name,
                    "product_category": product_category,
                    "brand": report['data'].get('knowledge', {}).get('brand') or report['data'].get('product_summary', {}).get('brand'),
                    "recommendations": rec_data,
                    "impact": impact_data,
                }
                buy_data = self.buy_agent.run(buy_request)
                if "error" not in buy_data:
                    # Best-effort: enrich each buy link with a price (scraped from the PDP)
                    try:
                        links = buy_data.get('buy_links') or []
                        for link in links:
                            url = link.get('link')
                            if not url:
                                continue
                            html = fetch_url_html(url)
                            price = extract_price_from_html(html or '') if html else None
                            if price:
                                link['price'] = price.get('display')
                                link['price_amount'] = price.get('amount')
                                link['price_currency'] = price.get('currency')
                    except Exception as e:
                        logger.info("Price enrichment failed: %s", e)

                    report['data']['buy_guidance'] = buy_data
                    report['steps_completed'].append("buy_link")
                else:
                    logger.warning(f"Buy link error: {buy_data['error']}")
                    report['errors'].append(f"Buy: {buy_data['error']}")
                    report['data']['buy_guidance'] = {
                        "purchase_recommended": False,
                        "purchase_reason": "Could not generate trustworthy direct purchase links.",
                        "buy_links": []
                    }
            except Exception as e:
                logger.error(f"Buy link error: {e}")
                report['errors'].append(f"Buy link error: {str(e)}")

        report['status'] = "complete"
        
        # Inject mandatory disclaimer
        report['disclaimer'] = (
            "IMPORTANT: This report is generated by AI for informational purposes only. "
            "It does not constitute medical, legal, or financial advice. "
            "Always verify product safety labels and consult professionals."
        )
        
        logger.info(f"Analysis complete. Steps: {report['steps_completed']}")
        if report['errors']:
            logger.warning(f"Errors encountered: {report['errors']}")
        
        return report
