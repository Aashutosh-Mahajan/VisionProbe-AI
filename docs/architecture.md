# System Architecture - Visual Product Intelligence Platform (VPIP)

## 1. High-Level Architecture
The VPIP system follows a **Event-Driven, Orchestrator-Centric** pattern. The backend serves as a secure gateway and controller, while the core intelligence is derived from a strictly orchestrated multi-agent AI system.

### Layers:
1.  **Frontend (Presentation Layer)**:
    *   **Tech**: React (Vite + TailwindCSS).
    *   **Role**: Handles image inputs, displays loading states with transparency (showing "Analysing..."), and renders the final structured JSON report into a user-friendly UI.
2.  **Backend (Application Layer)**:
    *   **Tech**: Django + Django REST Framework (DRF).
    *   **Role**:
        *   **API Gateway**: Exposes `POST /analyze`.
        *   **Secure Storage**: Handles temporary image storage/caching.
        *   **Orchestrator Host**: Runs the logic that calls AI agents.
        *   **Guardrails**: Implements rate limiting and cost tracking.
3.  **AI Layer (Intelligence Layer)**:
    *   **Tech**: GPT-5.2 API.
    *   **Role**: Stateless execution of specific cognitive tasks (Agents).
    *   **Control**: Agents DO NOT communicate with each other. The Orchestrator passes data between them.

## 2. Component Responsibility Table

| Component | Responsibility | Inputs | Outputs |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | User Interface, Image Pre-processing (resize/compress), State Management. | User Image Upload | API Request (Multipart/Form-Data) |
| **Django API View** | Auth, Rate Limiting, Request Validation, Image Saving. | HTTP Request | HTTP Response (JSON) or Error |
| **Orchestrator** | **The Brain**. Calls agents in order, validates JSON, checks confidence, tracks cost, decides branches. | Image Path/URL | Consolidated Intelligence Report (JSON) |
| **Agent: Visual ID** | Identifies the product from the image. | Image | JSON: { name, category, confidence } |
| **Agent: Knowledge** | Adds features/variants based on ID. | Product Name + Context | JSON: { features, queries } |
| **Agent: Use-Case** | Explains how to use/who it's for. | Product Name | JSON: { users, use_cases } |
| **Agent: Impact** | Health/Eco impact analysis. | Product Details | JSON: { health, eco, risk } |
| **Agent: Recommendations** | Suggests alternatives. | Impact Analysis | JSON: { alternatives } |
| **Agent: Buy Link** | Ethical purchasing guidance. | Recommendation Status | JSON: { buy_recommended, links } |
| **Cache (Redis/DB)** | Stores results for identical images/products to save cost. | Image Hash | Cached Report |

## 3. Data Flow

1.  **User Upload**: User uploads an image via Frontend.
2.  **Validation**: Frontend validates size/type -> Backend API validates auth & rate limits.
3.  **Orchestration Start**: Backend spins up the **Orchestrator**.
4.  **Step 1 - Visual ID**: Orchestrator sends image to *Visual Identification Agent*.
    *   *Check*: If `confidence < threshold`, Abort or ask User for clarification (MVP: Abort with "Unclear Image").
5.  **Step 2 - Enrichment**: Orchestrator sends ID data to *Knowledge Enrichment Agent*.
6.  **Step 3 - Context**: Orchestrator runs *Use-Case* and *Impact* agents (potentially parallel for speed, though serial is safer for context).
7.  **Step 4 - Decision**: Orchestrator checks Impact/Risk scores.
8.  **Step 5 - Action**:
    *   Run *Recommendation Agent* (always).
    *   Run *Buy Link Agent* (ONLY if `purchase_recommended` is not blocked by high risk).
9.  **Aggregation**: Orchestrator merges all valid JSON outputs into one `Final Report`.
10. **Response**: Backend returns `Final Report` to Frontend.

## 4. Trade-offs & Scalability
*   **Monolithic Orchestrator vs. Microservices**: We are keeping the Orchestrator within the Django application (Monolith) for the MVP.
    *   *Pro*: Simpler state management, easier debugging, lower latency (no internal network hops).
    *   *Con*: Heavy load on the Django worker if not async.
    *   *Mitigation*: Use Celery/Asyncio for the orchestration task so the API request doesn't timeout.
*   **Single Model (GPT-5.2)**:
    *   *Pro*: Consistency, high reasoning capability.
    *   *Con*: Cost.
    *   *Mitigation*: Strict prompt engineering to minimize output tokens. Caching is critical.
*   **Strict JSON**:
    *   *Pro*: Easy frontend rendering, predictable.
    *   *Con*: LLMs sometimes break JSON syntax.
    *   *Mitigation*: Orchestrator must have a "Retry with Error" loop (1 retry max for cost).

## 5. Cost Control Strategy (Target < ₹7/req)
*   **Token Limits**: Set `max_tokens` for each agent strictly.
*   **Fail Fast**: If Visual ID fails, stop immediately. 0 cost for subsequent agents.
*   **Caching**: aggressive caching of product explanations. If "Coke Can" is identified, don't re-run Impact/Use-Case agents; serve cached metadata.
