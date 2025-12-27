# Product Specification - VPIP (MVP)

## 1. Executive Summary
**Visual Product Intelligence Platform (VPIP)** is a decision-intelligence tool that empowers users to make ethical, safe, and informed product choices. By analyzing a single photo, the system reveals hidden details, health/environmental impacts, and better alternatives.

## 2. MVP Scope & Feature List
The MVP focuses entirely on the "Scan & Learn" loop.

### Core Features
1.  **Smart Image Upload**:
    *   Drag & Drop / File Select.
    *   Client-side preview.
    *   Compression to reduce bandwidth/latency.
2.  **Real-Time Processing Status**:
    *   Visual indicators for "Identifying...", "Analyzing Impact...", "Finding Alternatives...".
    *   Transparency in the AI pipeline.
3.  **The Intelligence Report**:
    *   **Identity Card**: Product Name, Category, Confidence Score.
    *   **Knowledge Graph**: Key features & "Did you know?" facts.
    *   **Usage Guide**: Who is this for? How to use it safely?
    *   **Impact Dashboard**: Health & Environmental risk ratings (Low/Med/High).
    *   **Better Alternatives**: "Don't buy X, buy Y because Z."
    *   **Ethical Buy Options**: Curated search links or ethical vendor suggestions (if applicable).
4.  **Error Handling**:
    *   Graceful failure for unclear images ("We couldn't identify this. Try a closer shot.").
    *   Strict content safety blocks.

## 3. User Flow
1.  **Landing Page**: Minimalist, clean UI. Large "Drop Image Here" zone. Value prop: "Know what you buy."
2.  **Upload Action**: User selects image -> Frontend compresses -> Uploads.
3.  **Analysis State**:
    *   User sees a skeletal loader.
    *   Progress steps light up: `ID` -> `Facts` -> `Impact` -> `Report`.
4.  **Result View**:
    *   Top: Product Image + Verified Name.
    *   Middle: 2-Column Layout (Facts vs. Risks).
    *   Bottom: Alternatives & Purchase Links.
5.  **Action**: User clicks an alternative or a "Buy" link, OR "Scan Another".

## 4. Non-Goals (MVP)
*   **No User Accounts**: Open access for MVP (rate-limited by IP).
*   **No Shopping Cart**: We do not sell products directly.
*   **No History**: Reports are ephemeral (unless we decide to cache widely).
*   **No "Chat with PDF/Image"**: This is a static report, not a chatbot.

## 5. Success Metrics
*   **Accuracy**: > 85% correct identification of common CPG products.
*   **Latency**: < 15 seconds for full report generation.
*   **Cost Efficiency**: Average < ₹7 per request (strict monitoring).
*   **Clarity**: Users rate the report as "Easy to Understand" (proxy metric).

## 6. Assumptions
*   Users will upload decent quality images (not blurry/dark).
*   GPT-5.2 is available and responsive.
*   We can scrape/generate valid buy links without a dedicated separate search API (using GPT's knowledge + formatted search URLs).
