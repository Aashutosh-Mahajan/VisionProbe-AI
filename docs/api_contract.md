# API Contract - VPIP

## Endpoints

### 1. Analyze Image
**URL**: `/api/v1/analyze/`
**Method**: `POST`
**Content-Type**: `multipart/form-data`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `image` | File | Yes | The product image (JPG/PNG). Max 5MB. |

#### Response (Success - 200 OK)
```json
{
  "status": "success",
  "data": {
    "product_summary": {
      "product_name": "Diet Coke Can",
      "category": "Beverage",
      "confidence": 0.98,
      "visual_clues": ["Silver can", "Red text", "Condensation"]
    },
    "knowledge": {
      "overview": "A sugar-free carbonated soft drink...",
      "key_features": ["0 Calories", "Caffeine"]
    },
    "usage": {
      "intended_users": ["Adults restricted from sugar"],
      "misuse_warnings": ["Do not shake before opening"]
    },
    "impact": {
      "health_impact": "Contains aspartame...",
      "risk_level": "medium",
      "environmental_impact": "Aluminum is recyclable..."
    },
    "recommendations": {
      "alternatives": [
        {
          "type": "Water",
          "reason": "Healthier hydration"
        }
      ]
    },
    "buy_guidance": {
      "purchase_recommended": true,
      "buy_options": [...]
    },
    "meta": {
      "processed_at": "2025-10-27T10:00:00Z",
      "cost_incurred": 0.045
    }
  }
}
```

#### Response (Error - 400/500)
```json
{
  "status": "error",
  "error_code": "IMAGE_UNCLEAR",
  "message": "The active agent could not identify a product with sufficient confidence (>80%).",
  "details": "Confidence score was 0.42"
}
```

### 2. Health Check
**URL**: `/api/health/`
**Method**: `GET`
**Response**: `{"status": "ok"}`
