# VisionProbe-AI

> **Visual Product Intelligence Platform** - Analyze products, assess impact, and make informed decisions with AI.

**VisionProbe-AI** is an advanced multi-agent AI system designed to analyze product images and provide deep insights. Leveraged by **OpenAI GPT-5.1**, it moves beyond simple object detection to offer health impact analysis, environmental sustainability scores, and ethical purchase recommendations.

---

---

## 🏗️ System Architecture

VisionProbe acts as a pipeline of intelligent systems functioning in unison. The architecture is built on a **Micro-Agent Orchestrator Pattern** where a central "Brain" (The Orchestrator) manages state, directs data flow, and handles failures throughout the analysis lifecycle.

### 🧩 High-Level Architecture Components

The system architecture is composed of the following key modules connected in a secure pipeline:

*   **Client Layer**:
    *   **Frontend**: A React application (Vite) that handles user interaction and image uploads.
    *   **Authentication**: **Neon Auth** validates user sessions before requests reach the API.
*   **Backend Layer**:
    *   **API**: A Django Rest Framework application that exposes endpoints for analysis.
    *   **Database**: **Neon Postgres** stores user history, product reports, and authentication data.
*   **AI Core (Orchestrator)**:
    *   The central brain that directs the analysis logic. It communicates sequentially with specific agents (Visual, Knowledge, Usage, Impact, Buy Link) to build the final report.

---

## 🔄 End-to-End Data Flow

From the moment a user uploads an image to the delivery of the intelligence report, the data flows as follows:

1.  **User Initiation**: The user selects a product image on the frontend dashboard.
2.  **Security Check**: Neon Auth validates the user's session token.
3.  **Submission**: The image is sent to the Django Backend via a secure POST request.
4.  **AI Orchestration**:
    *   **Phase 1: Identification**: The **Visual Agent** scans the image. *Constraint: If confidence is < 50%, analysis aborts immediately.*
    *   **Phase 2: Context**: If identified, **Knowledge** and **Use Case** agents enrich the data with facts and demographics.
    *   **Phase 3: Analysis**: The **Impact Agent** calculates Health and Environmental scores.
    *   **Phase 4: Commerce**: The **Buy Link Agent** finds purchase options. *Constraint: If Risk is High, this step is skipped to protect the user.*
5.  **Delivery**: The Orchestrator compiles a JSON report, saves it to Neon Postgres, and returns it to the frontend for display.

---

## 🤖 AI Agents & Orchestration

The core of VisionProbe-AI is its modular agent system. Each agent has a specific responsibility (Single Responsibility Principle) and contributes to the final report.

### The Orchestrator
*   **Role**: Conductor.
*   **Function**: It does not "think" about the product; it thinks about the *process*. It manages the order of agent execution, passes data from one agent to the next (e.g., passing the "Product Name" from Visual Agent to the Context Agent), and handles error states.

### Component Agents

1.  **👁️ Visual Identification Agent**
    *   **Input**: Raw Image.
    *   **Task**: Identifies the primary object, brand detection, and text extraction (OCR).
    *   **Output**: Structured JSON `{ "product_name": "Coke Zero", "brand": "Coca-Cola", "category": "Beverage", "confidence": 0.98 }`.

2.  **🧠 Knowledge Enrichment Agent**
    *   **Input**: Product Name & Brand.
    *   **Task**: Retrieves factual data like ingredients (for food), specs (for tech), or material composition.
    *   **Output**: Detailed factual summary.

3.  **👥 Use Case Agent**
    *   **Input**: Product Context.
    *   **Task**: Identifies who the product is for (Demographics) and how it should be used.
    *   **Output**: `{ "target_audience": ["Gamers", "Students"], "use_cases": ["Energy boost", "Late night study"] }`.

4.  **🌍 Impact Analysis Agent**
    *   **Input**: Product Ingredients/Materials.
    *   **Task**:
        *   **Health**: Checks for processed sugars, allergens, or carcinogens.
        *   **Environment**: Analyzing packaging recyclability and carbon footprint.
    *   **Output**: Risk Score (0-100) and Sustainability Rating.

5.  **🛒 Buy Link Agent**
    *   **Input**: Product Name + Risk Level.
    *   **Task**: Searches for purchase links.
    *   **Logic**: If `Risk Level > High`, it suppresses purchase links to avoid promoting harmful products.
    *   **Output**: List of URLs or "Purchase disabled due to high risk".

---

## 📂 Project Structure
    
```text
VisionProbe-AI/
├── backend/                # Django Backend API
│   ├── config/             # Project Logic & Settings
│   ├── core/               # Main Application Logic
│   │   ├── agents/         # AI Agents & Orchestrator Logic
│   │   ├── models.py       # Database Models
│   │   └── views.py        # API Views
│   ├── manage.py           # Django Entry Point
│   ├── .env.example        # Environment Variables Template
│   └── requirements.txt    # Python Dependencies
├── frontend/               # React Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Application Pages
│   │   ├── lib/            # Utilities & Helpers
│   │   ├── api.js          # API Integration
│   │   ├── App.jsx         # Main Component
│   │   └── main.jsx        # Entry Point
│   ├── package.json        # Node.js Dependencies
│   └── vite.config.ts      # Vite Configuration
├── docs/                   # Additional Documentation
├── render.yaml             # Render Deployment Config
└── README.md               # Project Documentation
```

---

## 🛠️ Tech Stack

### Backend
*   **Framework**: [Django 5.0](https://www.djangoproject.com/) & [Django Rest Framework](https://www.django-rest-framework.org/)
*   **Authentication**: **Neon Auth** (Serverless Postgres Authentication)
*   **AI Engine**: [OpenAI API](https://openai.com/) (GPT-5.1 Preview)
*   **Database**: [Neon Postgres](https://neon.tech/) (Serverless)
*   **Image Processing**: Pillow (PIL)
*   **Server**: Gunicorn with Whitenoise for static files
*   **HTTP Client**: Requests

### Frontend
*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **HTTP Client**: Axios
*   **Routing**: React Router DOM

### Infrastructure
*   **Hosting**: [Render](https://render.com/)
*   **Versioning**: Git

---

## ✨ Key Features

*   **Multi-Agent Orchestration**: Sequential processing by Visual, Knowledge, Impact, and Recommendation agents.
*   **Fail-Safe Mechanism**: Automatically aborts analysis if product identification confidence is low.
*   **Health & Environment Scoring**: detailed breakdown of product risks and sustainability.
*   **Ethical Shopping**: Suggests alternatives and disables buy links for high-risk items.
*   **Real-time Status**: Live updates on the frontend as each agent completes its task.
*   **Responsive Dashboard**: Modern, glassmorphism-inspired UI built for all devices.

---

## 🚀 Getting Started

Follow these steps to set up VisionProbe-AI locally.

### Prerequisites

*   **Python** 3.10 or higher
*   **Node.js** 18 or higher
*   **Git**

### Backend Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/VisionProbe-AI.git
    cd VisionProbe-AI/backend
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run migrations**:
    ```bash
    python manage.py migrate
    ```

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

---

## 🔑 Environment Variables

To run the project, you need to configure environment variables.

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SECRET_KEY` | Django Secret Key | `django-insecure-...` |
| `DEBUG` | Debug Mode (True/False) | `True` |
| `OPENAI_API_KEY` | Your OpenAI API Key | `sk-...` |
| `DATABASE_URL` | (Optional) Postgres URL | `postgres://user:pass@host/db` |

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |

---

## ⚡ Usage

### Running Locally

1.  **Start the Backend**:
    ```bash
    # In backend/ terminal
    python manage.py runserver
    ```
    The API will be available at `http://localhost:8000`.

2.  **Start the Frontend**:
    ```bash
    # In frontend/ terminal
    npm run dev
    ```
    The application will launch at `http://localhost:5173`.

### Using the Dashboard
1.  Navigate to `http://localhost:5173`.
2.  Upload a product image (e.g., a soda can, a gadget, a snack).
3.  Watch the "Agent Status" panel as analysis progresses.
4.  Review the final report for Health, Environment, and Purchase recommendations.

---

## ☁️ Deployment

This project is configured for easy deployment on **Render**.

1.  **Push code to GitHub**.
2.  **Create a New Web Service** on Render.
3.  **Connect your repository**.
4.  **Configuration**:
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r backend/requirements.txt`
    *   **Start Command**: `cd backend && gunicorn config.wsgi:application`
5.  **Environment Variables**: Add your `OPENAI_API_KEY`, `SECRET_KEY`, and `DATABASE_URL` in the Render dashboard.

_Note: For the Frontend, create a separate **Static Site** on Render with Build Command `npm run build` and Publish Directory `dist`._

---

## 📡 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login/` | User authentication |
| `POST` | `/api/v1/analysis/analyze/` | Upload image for multi-agent analysis |
| `GET` | `/api/v1/analysis/history/` | specific user's analysis history |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

© 2025 VisionProbe-AI. Built with ❤️ and Passion.
