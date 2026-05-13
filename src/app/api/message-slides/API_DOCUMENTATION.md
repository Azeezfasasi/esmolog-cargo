# Message Slides API Documentation

## Base URL
```
/api/message-slides
```

## Authentication
All endpoints except GET require admin authentication via JWT token in the Authorization header.

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. GET /api/message-slides
**Fetch all message slides with optional filtering and pagination**

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isActive` | boolean | null | Filter by active status (true/false) |
| `limit` | number | 100 | Number of results to return |
| `skip` | number | 0 | Number of results to skip (for pagination) |
| `sort` | string | -createdAt | Sort order (e.g., `-createdAt`, `displayOrder`) |

#### Example Request
```bash
GET /api/message-slides?isActive=true&limit=10&skip=0&sort=-displayOrder
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Important Update",
      "message": "System maintenance scheduled for tonight",
      "isActive": true,
      "displayOrder": 0,
      "icon": null,
      "backgroundColor": "#1976D2",
      "createdAt": "2024-05-13T10:00:00Z",
      "updatedAt": "2024-05-13T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}
```

#### Error Response (500)
```json
{
  "success": false,
  "error": "Failed to fetch message slides",
  "details": "Database connection error"
}
```

---

### 2. POST /api/message-slides
**Create a new message slide** ✅ Requires Admin Auth

#### Request Body
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `message` | string | ✅ | 1-500 characters, must not be empty |
| `title` | string | ❌ | 0-100 characters, defaults to first 50 chars of message |
| `displayOrder` | number | ❌ | Default: 0 |
| `isActive` | boolean | ❌ | Default: true |
| `backgroundColor` | string | ❌ | Hex color, default: #1976D2 |
| `icon` | string | ❌ | Icon identifier |

#### Example Request
```bash
curl -X POST /api/message-slides \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Update",
    "message": "System maintenance scheduled for tonight",
    "isActive": true,
    "displayOrder": 1,
    "backgroundColor": "#FF6B6B"
  }'
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Message slide created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Important Update",
    "message": "System maintenance scheduled for tonight",
    "isActive": true,
    "displayOrder": 1,
    "backgroundColor": "#FF6B6B",
    "icon": null,
    "createdAt": "2024-05-13T11:30:00Z",
    "updatedAt": "2024-05-13T11:30:00Z"
  }
}
```

#### Error Responses
**400 Validation Failed**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "Message cannot exceed 500 characters"
  ]
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

---

### 3. GET /api/message-slides/[id]
**Fetch a single message slide by ID**

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the slide |

#### Example Request
```bash
GET /api/message-slides/507f1f77bcf86cd799439012
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Important Update",
    "message": "System maintenance scheduled for tonight",
    "isActive": true,
    "displayOrder": 1,
    "backgroundColor": "#FF6B6B",
    "icon": null,
    "createdAt": "2024-05-13T11:30:00Z",
    "updatedAt": "2024-05-13T11:30:00Z"
  }
}
```

#### Error Responses
**400 Invalid ID Format**
```json
{
  "success": false,
  "error": "Invalid slide ID format"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Message slide not found"
}
```

---

### 4. PUT /api/message-slides/[id]
**Update an existing message slide** ✅ Requires Admin Auth

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the slide |

#### Request Body (All fields optional)
```json
{
  "title": "Updated Title",
  "message": "Updated message content",
  "isActive": true,
  "displayOrder": 2,
  "backgroundColor": "#4ECDC4",
  "icon": "info"
}
```

#### Example Request
```bash
curl -X PUT /api/message-slides/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Updated message content",
    "isActive": false
  }'
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Message slide updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Important Update",
    "message": "Updated message content",
    "isActive": false,
    "displayOrder": 1,
    "backgroundColor": "#FF6B6B",
    "icon": null,
    "createdAt": "2024-05-13T11:30:00Z",
    "updatedAt": "2024-05-13T12:00:00Z"
  }
}
```

#### Error Responses
**400 Invalid ID or Validation Failed**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["Message cannot exceed 500 characters"]
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Message slide not found"
}
```

---

### 5. DELETE /api/message-slides/[id]
**Delete a message slide** ✅ Requires Admin Auth

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the slide |

#### Example Request
```bash
curl -X DELETE /api/message-slides/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Message slide deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Important Update",
    "message": "System maintenance scheduled for tonight",
    "isActive": true,
    "displayOrder": 1,
    "backgroundColor": "#FF6B6B",
    "icon": null,
    "createdAt": "2024-05-13T11:30:00Z",
    "updatedAt": "2024-05-13T12:00:00Z"
  }
}
```

#### Error Responses
**400 Invalid ID**
```json
{
  "success": false,
  "error": "Invalid slide ID format"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Message slide not found"
}
```

---

### 6. PATCH /api/message-slides/[id]
**Toggle the active status of a message slide** ✅ Requires Admin Auth

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the slide |

#### Example Request
```bash
curl -X PATCH /api/message-slides/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Message slide activated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Important Update",
    "message": "System maintenance scheduled for tonight",
    "isActive": true,
    "displayOrder": 1,
    "backgroundColor": "#FF6B6B",
    "icon": null,
    "createdAt": "2024-05-13T11:30:00Z",
    "updatedAt": "2024-05-13T12:05:00Z"
  }
}
```

#### Error Responses
**400 Invalid ID**
```json
{
  "success": false,
  "error": "Invalid slide ID format"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Message slide not found"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or format |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - User lacks required permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Server error |

---

## Field Descriptions

### Message Slide Object
```typescript
{
  _id: string;                    // MongoDB ObjectId (auto-generated)
  title: string;                  // Display title (0-100 chars)
  message: string;                // Message content (1-500 chars)
  isActive: boolean;              // Whether slide is active
  displayOrder: number;           // Display priority/order
  icon: string | null;            // Optional icon identifier
  backgroundColor: string;        // Hex color code
  createdAt: ISO8601DateTime;     // Creation timestamp
  updatedAt: ISO8601DateTime;     // Last update timestamp
}
```

---

## Examples

### JavaScript/Fetch
```javascript
// Create a slide
const response = await fetch('/api/message-slides', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Important announcement',
    displayOrder: 1,
    isActive: true
  })
});

const result = await response.json();
console.log(result.data._id); // New slide ID

// Update a slide
await fetch(`/api/message-slides/${slideId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Updated announcement'
  })
});

// Toggle active status
await fetch(`/api/message-slides/${slideId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Delete a slide
await fetch(`/api/message-slides/${slideId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Notes

- All authenticated endpoints require a valid JWT token
- Only users with 'admin' role can modify message slides
- Public users can view active slides via GET endpoint
- Message length is capped at 500 characters
- Slides are indexed on `isActive` and `displayOrder` for efficient querying
- Soft deletes are NOT implemented; deleted slides are permanently removed
