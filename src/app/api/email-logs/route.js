import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getAllLogs,
  getStats,
  getFailedEmails,
  getRecentLogs,
  getLogsByType,
  exportLogsAsCSV
} from '@/server/utils/emailLogger';

/**
 * GET /api/email-logs
 * Retrieve email logs with optional filters
 * Admin only
 */
export async function GET(request) {
  try {
    // Check authentication - admin only
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const filter = searchParams.get('filter'); // 'all', 'failed', 'recent', 'stats'
    const limit = parseInt(searchParams.get('limit') || '100');
    const hours = parseInt(searchParams.get('hours') || '24');
    const format = searchParams.get('format'); // 'json', 'csv'

    let response = {};

    // Handle different filters
    if (filter === 'stats') {
      response = {
        stats: getStats(),
        timestamp: new Date().toISOString()
      };
    } else if (filter === 'failed') {
      response = {
        logs: getFailedEmails(),
        timestamp: new Date().toISOString(),
        count: getFailedEmails().length
      };
    } else if (filter === 'recent') {
      response = {
        logs: getRecentLogs(hours),
        timestamp: new Date().toISOString(),
        hours,
        count: getRecentLogs(hours).length
      };
    } else if (type) {
      response = {
        logs: getLogsByType(type),
        timestamp: new Date().toISOString(),
        emailType: type,
        count: getLogsByType(type).length
      };
    } else {
      // Get all logs with limit
      const allLogs = getAllLogs({ limit });
      response = {
        logs: allLogs,
        timestamp: new Date().toISOString(),
        count: allLogs.length
      };
    }

    // Handle CSV export
    if (format === 'csv') {
      const csv = exportLogsAsCSV();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="email-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error retrieving email logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve email logs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email-logs
 * Perform actions on email logs (clear old logs, etc.)
 * Admin only
 */
export async function POST(request) {
  try {
    // Check authentication - admin only
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'clear-old') {
      const days = body.days || 30;
      const { clearOldLogs } = require('@/server/utils/emailLogger');
      const removed = clearOldLogs(days);
      return NextResponse.json({
        success: true,
        message: `Cleared ${removed} email logs older than ${days} days`,
        removed
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('❌ Error processing email logs action:', error);
    return NextResponse.json(
      { error: 'Failed to process action', details: error.message },
      { status: 500 }
    );
  }
}
