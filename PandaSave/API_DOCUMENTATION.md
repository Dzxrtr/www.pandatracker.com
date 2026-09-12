# 📚 PandaSave API Documentation

## Overview

PandaSave Backend API provides RESTful endpoints for money tracking, savings goals, and user management.

**Base URL:** `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses are in JSON format:

**Success Response:**
```json
{
    "message": "Success message",
    "data": { /* response data */ }
}
```

**Error Response:**
```json
{
    "message": "Error message"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Endpoints

### Health Check

#### GET `/api/health`
Check if API is running.

**Response:**
```json
{
    "status": "healthy",
    "service": "PandaSave Backend",
    "timestamp": "2024-01-15T10:30:00.000000"
}
```

---

## Authentication Endpoints

### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "subscribe_newsletter": true
}
```

**Response:** `201 Created`
```json
{
    "message": "Account created successfully",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "subscribe_newsletter": true,
        "created_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Email already registered
- `500` - Server error

---

### POST `/api/auth/signin`
Sign in to existing account.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
    "message": "Signed in successfully",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "subscribe_newsletter": true,
        "created_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

## Transaction Endpoints

### GET `/api/transactions/<user_id>`
Get all transactions for a user. **(Requires Auth)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
    "transactions": [
        {
            "id": 1,
            "type": "income",
            "category": "salary",
            "amount": 5000.00,
            "date": "2024-01-15",
            "description": "Monthly salary",
            "created_at": "2024-01-15T10:30:00.000000"
        },
        {
            "id": 2,
            "type": "expense",
            "category": "food",
            "amount": 50.00,
            "date": "2024-01-15",
            "description": "Groceries",
            "created_at": "2024-01-15T10:35:00.000000"
        }
    ],
    "goals": [
        {
            "id": 1,
            "name": "Vacation",
            "targetAmount": 5000.00,
            "currentAmount": 1000.00,
            "deadline": "2024-12-31",
            "created_at": "2024-01-15T10:30:00.000000"
        }
    ]
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (accessing other user's data)
- `404` - User not found

---

### POST `/api/transactions/add`
Add a new transaction. **(Requires Auth)**

**Request Body:**
```json
{
    "type": "expense",
    "category": "food",
    "amount": 50.00,
    "date": "2024-01-15",
    "description": "Lunch"
}
```

**Required Fields:**
- `type`: "income" | "expense" | "savings"
- `category`: Category name
- `amount`: Number > 0
- `date`: ISO date string (YYYY-MM-DD)

**Optional Fields:**
- `description`: String

**Response:** `201 Created`
```json
{
    "message": "Transaction added successfully",
    "transaction": {
        "id": 3,
        "type": "expense",
        "category": "food",
        "amount": 50.00,
        "date": "2024-01-15",
        "description": "Lunch",
        "created_at": "2024-01-15T11:00:00.000000"
    }
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

### DELETE `/api/transactions/<trans_id>`
Delete a transaction. **(Requires Auth)**

**Response:** `200 OK`
```json
{
    "message": "Transaction deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not transaction owner)
- `404` - Transaction not found

---

## Goal Endpoints

### POST `/api/goals/add`
Create a new savings goal. **(Requires Auth)**

**Request Body:**
```json
{
    "name": "Vacation",
    "targetAmount": 5000.00,
    "deadline": "2024-12-31",
    "currentAmount": 0
}
```

**Required Fields:**
- `name`: Goal name
- `targetAmount`: Number > 0
- `deadline`: ISO date string (YYYY-MM-DD)

**Optional Fields:**
- `currentAmount`: Number (default: 0)

**Response:** `201 Created`
```json
{
    "message": "Goal added successfully",
    "goal": {
        "id": 1,
        "name": "Vacation",
        "targetAmount": 5000.00,
        "currentAmount": 0,
        "deadline": "2024-12-31",
        "created_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

### PUT `/api/goals/<goal_id>`
Update a savings goal. **(Requires Auth)**

**Request Body:**
```json
{
    "name": "Vacation",
    "targetAmount": 6000.00,
    "currentAmount": 1500.00,
    "deadline": "2024-12-31"
}
```

**Response:** `200 OK`
```json
{
    "message": "Goal updated successfully",
    "goal": {
        "id": 1,
        "name": "Vacation",
        "targetAmount": 6000.00,
        "currentAmount": 1500.00,
        "deadline": "2024-12-31",
        "created_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not goal owner)
- `404` - Goal not found
- `500` - Server error

---

### DELETE `/api/goals/<goal_id>`
Delete a savings goal. **(Requires Auth)**

**Response:** `200 OK`
```json
{
    "message": "Goal deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not goal owner)
- `404` - Goal not found

---

## Newsletter Endpoints

### POST `/api/newsletter/subscribe`
Subscribe to the newsletter.

**Request Body:**
```json
{
    "email": "john@example.com"
}
```

**Response:** `201 Created`
```json
{
    "message": "Successfully subscribed to newsletter",
    "subscriber": {
        "email": "john@example.com",
        "subscribed_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `400` - Email is required
- `409` - Email already subscribed
- `500` - Server error

---

### POST `/api/newsletter/unsubscribe/<email>`
Unsubscribe from the newsletter.

**Response:** `200 OK`
```json
{
    "message": "Successfully unsubscribed from newsletter"
}
```

**Errors:**
- `404` - Email not found
- `500` - Server error

---

## User Profile Endpoints

### GET `/api/user/profile`
Get user profile. **(Requires Auth)**

**Response:** `200 OK`
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "subscribe_newsletter": true,
        "created_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `401` - Unauthorized

---

### PUT `/api/user/profile`
Update user profile. **(Requires Auth)**

**Request Body:**
```json
{
    "name": "Jane Doe",
    "subscribe_newsletter": false
}
```

**Response:** `200 OK`
```json
{
    "message": "Profile updated successfully",
    "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "john@example.com",
        "subscribe_newsletter": false,
        "created_at": "2024-01-15T10:30:00.000000"
    }
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

## Statistics Endpoints

### GET `/api/statistics/<user_id>`
Get user financial statistics. **(Requires Auth)**

**Response:** `200 OK`
```json
{
    "total_income": 5000.00,
    "total_expenses": 500.00,
    "total_savings": 1000.00,
    "balance": 5500.00,
    "categories": {
        "food": 150.00,
        "transport": 100.00,
        "entertainment": 250.00
    },
    "transaction_count": 25
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (accessing other user's data)

---

## Examples

### Complete Workflow

**1. Sign Up**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

**2. Add Transaction**
```bash
curl -X POST http://localhost:5000/api/transactions/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type":"income","category":"salary","amount":5000,"date":"2024-01-15"}'
```

**3. Create Goal**
```bash
curl -X POST http://localhost:5000/api/goals/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Vacation","targetAmount":5000,"deadline":"2024-12-31"}'
```

**4. Get Statistics**
```bash
curl -X GET http://localhost:5000/api/statistics/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limiting

Currently no rate limiting. In production, implement:
- Max 100 requests per minute per user
- Max 10 failed login attempts per hour
- Max 1000 transactions per day

---

## Error Handling

Always check response status code and message:

```javascript
fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
})
.then(res => {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
})
.then(data => console.log(data))
.catch(err => console.error('Error:', err.message));
```

---

## Versioning

Current API Version: **1.0.0**

Future versions will maintain backward compatibility with v1 endpoints.

---

## Support

For API issues, check:
1. Logs in terminal running Flask
2. Browser console (F12)
3. Response status and messages
4. Token validity and expiration

---

Happy coding with PandaSave! 🐼
