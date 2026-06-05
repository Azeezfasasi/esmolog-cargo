import { NextResponse } from 'next/server';

/**
 * SMS API Routes - Main entry point
 * This file serves as a router for SMS-related endpoints
 */

export async function GET(request) {
  return NextResponse.json(
    { 
      message: 'SMS API - Use specific endpoints',
      endpoints: {
        settings: '/api/sms/settings',
        balance: '/api/sms/balance',
        testSms: '/api/sms/test-sms',
        logs: '/api/sms/logs',
        statistics: '/api/sms/statistics',
        templates: '/api/sms/templates',
      }
    }
  );
}
