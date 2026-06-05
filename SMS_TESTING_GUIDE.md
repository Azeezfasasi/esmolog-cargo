# SMS Features - Testing Guide

## Quick API Endpoint Test URLs

### With Authentication Header (Bearer Token)
All endpoints require either:
1. Cookie: `token=<jwt_token>`  
2. OR Header: `Authorization: Bearer <jwt_token>`

## Test Each Endpoint

### 1. SMS Settings - GET
```bash
curl -X GET http://localhost:3000/api/sms/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Returns current SMS settings object

### 2. SMS Settings - PUT
```bash
curl -X PUT http://localhost:3000/api/sms/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "senderName": "CargoRealm",
    "sendOnCreation": true
  }'
```
**Expected**: Returns updated settings with `message: "SMS settings updated successfully"`

### 3. SMS Balance - GET
```bash
curl -X GET http://localhost:3000/api/sms/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Returns balance object with `total_balance`, `currency`, etc.

### 4. Test SMS - POST
```bash
curl -X POST http://localhost:3000/api/sms/test-sms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "message": "This is a test SMS from CargoRealm"
  }'
```
**Expected**: Returns `{ message: "Test SMS sent successfully", result: {...} }`

### 5. SMS Logs - GET
```bash
curl -X GET "http://localhost:3000/api/sms/logs?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Returns paginated logs array with `pagination` object

### 6. SMS Logs - GET with Filters
```bash
curl -X GET "http://localhost:3000/api/sms/logs?status=sent&eventType=CUSTOM" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Filtered logs matching status and eventType

### 7. SMS Log - DELETE
```bash
curl -X DELETE http://localhost:3000/api/sms/logs/LOG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Returns `{ message: "SMS log deleted successfully" }`

### 8. SMS Statistics - GET
```bash
curl -X GET "http://localhost:3000/api/sms/statistics?startDate=2024-06-01&endDate=2024-06-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Returns summary with total, sent, failed, pending, delivered, successRate

### 9. SMS Templates - GET
```bash
curl -X GET http://localhost:3000/api/sms/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Returns array of template names like `["SHIPMENT_CREATED_SENDER", ...]`

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Token not provided or invalid  
**Solution**: 
1. Verify token is valid with `/api/auth/verify` first
2. Check that Authorization header format is exactly `Bearer <token>` (space required)
3. If using cookies, ensure `token` cookie is set

### Issue: 400 Bad Request on Test SMS
**Cause**: Missing phoneNumber or message  
**Solution**:
```json
{
  "phoneNumber": "+2348012345678",  // Include country code
  "message": "Your message here"
}
```

### Issue: Balance Check Returns Error
**Cause**: BulkSMS API credentials not configured  
**Solution**:
1. Check `.env.local` has these variables:
   - `BULKSMS_TOKEN`
   - `BULKSMS_BASE_URL`
   - `SMS_SENDER_ID`
2. Verify credentials are correct at BulkSMS portal

### Issue: Database Connection Error
**Cause**: MongoDB not running or connection string invalid  
**Solution**:
1. Check `src/lib/db.js` connection string in `.env.local`
2. Ensure MongoDB is running
3. Verify `MONGODB_URI` environment variable is set

## Frontend Component Testing

### Test SMS Dashboard
1. Navigate to `/dashboard/sms-dash`
2. Click "Balance & Test" tab
3. Enter phone number (with country code)
4. Enter test message
5. Click "Send Test SMS"
6. Should see success/error toast

### Check SMS Logs
1. Go to SMS Logs tab
2. Should see paginated list of SMS sent
3. Try filtering by status or event type
4. Try deleting a log (if permission allows)

### View Statistics
1. Go to Statistics tab
2. Select date range
3. Should see:
   - Total SMS, Sent, Failed, Pending, Delivered counts
   - Success rate percentage
   - Breakdown by event type
   - Breakdown by recipient type

## Performance Notes

- Balance API caches for 60 seconds (reduces BulkSMS API calls)
- Logs pagination: 20 items per page by default
- Statistics queries use MongoDB aggregation for efficiency
- All routes implement proper error handling and logging

## Next Steps for Production

1. Add rate limiting on SMS sending endpoints
2. Implement SMS queue for bulk operations
3. Add webhook handlers for delivery reports
4. Set up monitoring for SMS API failures
5. Consider implementing SMS template engine
