# Message Slides API - Implementation Guide

## 📁 File Structure

```
src/app/api/message-slides/
├── route.js                      # GET & POST endpoints
├── [id]/
│   ├── route.js                  # GET, PUT, DELETE endpoints
│   └── toggle/
│       └── route.js              # PATCH toggle endpoint
└── API_DOCUMENTATION.md          # Full API documentation
```

## 📋 Features Implemented

### ✅ Complete CRUD Operations

1. **READ (GET)**
   - List all slides with filtering, pagination, and sorting
   - Get individual slide by ID
   - Public access (no auth required)

2. **CREATE (POST)**
   - Create new message slides
   - Automatic title generation from message
   - Configurable display order and styling
   - ✅ Admin authentication required

3. **UPDATE (PUT)**
   - Update any slide fields
   - Partial updates supported
   - Validator for all fields
   - ✅ Admin authentication required

4. **DELETE**
   - Delete slides by ID
   - Soft delete not implemented (permanent deletion)
   - ✅ Admin authentication required

5. **PATCH (Toggle)**
   - Toggle active/inactive status
   - ✅ Admin authentication required

### 🔐 Security Features

- JWT-based authentication
- Role-based access control (admin only for modifications)
- Input validation for all fields
- MongoDB ObjectId validation
- Error handling with detailed logging

### 📊 Data Validation

```javascript
// Message validation
- Required, non-empty string
- 1-500 characters max
- Auto-trimmed whitespace

// Title validation
- Optional string
- 0-100 characters max
- Auto-generated if not provided

// Display order validation
- Optional number
- Defaults to 0

// Colors validation
- Optional hex color strings
- Defaults to #1976D2

// Boolean fields
- isActive (defaults to true)
```

## 🚀 API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/message-slides` | ❌ | List all slides |
| POST | `/api/message-slides` | ✅ | Create new slide |
| GET | `/api/message-slides/[id]` | ❌ | Get single slide |
| PUT | `/api/message-slides/[id]` | ✅ | Update slide |
| DELETE | `/api/message-slides/[id]` | ✅ | Delete slide |
| PATCH | `/api/message-slides/[id]/toggle` | ✅ | Toggle status |

## 🔧 Usage Examples

### Create a Message Slide
```javascript
const response = await fetch('/api/message-slides', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Important system update',
    title: 'System Update',
    displayOrder: 1,
    isActive: true
  })
});

const { data } = await response.json();
console.log(data._id); // Use this ID for updates
```

### Update a Slide
```javascript
await fetch(`/api/message-slides/${slideId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Updated message content'
  })
});
```

### Toggle Active Status
```javascript
await fetch(`/api/message-slides/${slideId}/toggle`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Fetch with Filters
```javascript
// Get only active slides, sorted by display order
const response = await fetch(
  '/api/message-slides?isActive=true&sort=displayOrder&limit=10'
);

const { data, pagination } = await response.json();
console.log(pagination.hasMore); // Check if more results available
```

## 📦 Database Schema

```javascript
{
  _id: ObjectId,
  title: String (0-100 chars),
  message: String (1-500 chars, required),
  isActive: Boolean (default: true),
  displayOrder: Number (default: 0),
  icon: String | null,
  backgroundColor: String (default: #1976D2),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### Indexes
- `{ isActive: 1, displayOrder: 1 }` - For efficient filtering
- Single index on `isActive` for quick filtering

## 🧪 Testing the API

### Using cURL

```bash
# List all slides
curl http://localhost:3000/api/message-slides

# Create a slide (requires token)
curl -X POST http://localhost:3000/api/message-slides \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "displayOrder": 1
  }'

# Get specific slide
curl http://localhost:3000/api/message-slides/607f1f77bcf86cd799439011

# Update slide
curl -X PUT http://localhost:3000/api/message-slides/607f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Updated message"}'

# Delete slide
curl -X DELETE http://localhost:3000/api/message-slides/607f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Toggle status
curl -X PATCH http://localhost:3000/api/message-slides/607f1f77bcf86cd799439011/toggle \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Create a new collection "Message Slides API"
2. Set base URL: `{{baseUrl}}/api/message-slides`
3. Add environment variable: `baseUrl = http://localhost:3000`
4. Create requests for each endpoint
5. Use Authorization tab for Bearer token

## 🔌 Integration with Frontend

The API is already integrated with:
- **MessageSlidesManager.jsx** - Admin dashboard for CRUD operations
- **MessageSlides.jsx** - Public display component for active slides

### Response Structure
All responses follow a consistent format:

**Success (2xx)**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* slide object */ },
  "pagination": { /* if applicable */ }
}
```

**Error (4xx/5xx)**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "errors": [ /* validation errors if any */ ]
}
```

## ⚙️ Configuration

### Environment Variables Required
```env
MONGODB_URI=mongodb://... # Database connection string
JWT_SECRET=your_secret_key # JWT signing secret
```

### Connection Settings (in db.js)
- Server selection timeout: 5 seconds
- Buffer commands: disabled
- Auto-reconnect enabled

## 📈 Performance Considerations

1. **Indexes**: Database queries use `isActive + displayOrder` index
2. **Pagination**: Implemented for scalability
3. **Field Selection**: `__v` field excluded from responses
4. **Caching**: Not implemented - consider adding for public GET endpoint

## 🐛 Error Handling

All errors are caught and logged with:
- Error message
- Stack trace (in console)
- User-friendly error response
- HTTP status codes following REST conventions

### Common Error Codes
- `400` - Validation failed or invalid input
- `401` - Missing or invalid authentication token
- `403` - Insufficient permissions (non-admin)
- `404` - Resource not found
- `500` - Server error

## 🔄 Workflow

1. User authenticates and gets JWT token
2. Token stored in localStorage (frontend handles this)
3. Dashboard component makes authenticated requests
4. API validates token and user role
5. MongoDB operations performed
6. Response returned with appropriate status code

## 📝 Notes

- The component `MessageSlidesManager` handles form state and API integration
- Component uses localStorage for authentication token
- Auto-refresh interval: 30 seconds for public slides display
- Maximum 500 character message limit enforced at both API and UI level

## 🚨 Future Enhancements

- [ ] Add soft delete functionality
- [ ] Implement response caching
- [ ] Add batch operations support
- [ ] Implement audit logging
- [ ] Add scheduled publishing
- [ ] Implement slide templates
- [ ] Add rich text editor support
- [ ] Implement version history
