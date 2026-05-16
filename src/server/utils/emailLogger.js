/**
 * Email Logger Utility
 * Tracks all email sends (successful and failed) to a JSON log file
 * Provides methods to view, filter, and manage email logs
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
const emailLogsFile = path.join(logsDir, 'email-logs.json');
const emailStatsFile = path.join(logsDir, 'email-stats.json');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Initialize log files if they don't exist
 */
const initializeLogFiles = () => {
  if (!fs.existsSync(emailLogsFile)) {
    fs.writeFileSync(emailLogsFile, JSON.stringify({ logs: [], lastUpdated: new Date().toISOString() }, null, 2));
  }
  if (!fs.existsSync(emailStatsFile)) {
    fs.writeFileSync(emailStatsFile, JSON.stringify({
      totalSent: 0,
      totalFailed: 0,
      byType: {},
      byStatus: { success: 0, failed: 0 },
      lastUpdated: new Date().toISOString()
    }, null, 2));
  }
};

// Initialize on module load
initializeLogFiles();

/**
 * Log an email send event
 * @param {Object} emailData - Email information
 * @returns {boolean} - Success status
 */
const logEmail = (emailData) => {
  try {
    const {
      to,
      subject,
      emailType = 'general', // contact-form, shipment-status, contact-reply, shipment-reply, newsletter, etc.
      success = true,
      messageId = null,
      error = null,
      timestamp = new Date().toISOString(),
      userId = null,
      metadata = {}
    } = emailData;

    // Validate required fields
    if (!to || !subject) {
      console.error('❌ Email Logger: Missing required fields (to, subject)');
      return false;
    }

    // Read existing logs
    let logData = { logs: [], lastUpdated: new Date().toISOString() };
    if (fs.existsSync(emailLogsFile)) {
      const content = fs.readFileSync(emailLogsFile, 'utf-8');
      logData = JSON.parse(content);
    }

    // Create log entry
    const logEntry = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      to,
      subject,
      emailType,
      success,
      messageId,
      error,
      userId,
      metadata,
      loggedAt: new Date().toISOString()
    };

    // Add to logs
    logData.logs.push(logEntry);
    logData.lastUpdated = new Date().toISOString();

    // Keep only last 10,000 logs (prevent file from getting too large)
    if (logData.logs.length > 10000) {
      logData.logs = logData.logs.slice(-10000);
    }

    // Write back to file
    fs.writeFileSync(emailLogsFile, JSON.stringify(logData, null, 2));

    // Update statistics
    updateStats(emailType, success);

    // Console log for immediate visibility
    const icon = success ? '✅' : '❌';
    console.log(`${icon} EMAIL LOG [${emailType.toUpperCase()}]:`, {
      to,
      subject: subject.substring(0, 50) + (subject.length > 50 ? '...' : ''),
      success,
      messageId,
      timestamp
    });

    return true;
  } catch (error) {
    console.error('❌ Error logging email:', error.message);
    return false;
  }
};

/**
 * Update email statistics
 */
const updateStats = (emailType, success) => {
  try {
    let statsData = {
      totalSent: 0,
      totalFailed: 0,
      byType: {},
      byStatus: { success: 0, failed: 0 },
      lastUpdated: new Date().toISOString()
    };

    if (fs.existsSync(emailStatsFile)) {
      const content = fs.readFileSync(emailStatsFile, 'utf-8');
      statsData = JSON.parse(content);
    }

    // Update totals
    if (success) {
      statsData.totalSent++;
      statsData.byStatus.success++;
    } else {
      statsData.totalFailed++;
      statsData.byStatus.failed++;
    }

    // Update by type
    if (!statsData.byType[emailType]) {
      statsData.byType[emailType] = { sent: 0, failed: 0 };
    }
    if (success) {
      statsData.byType[emailType].sent++;
    } else {
      statsData.byType[emailType].failed++;
    }

    statsData.lastUpdated = new Date().toISOString();

    fs.writeFileSync(emailStatsFile, JSON.stringify(statsData, null, 2));
  } catch (error) {
    console.error('❌ Error updating stats:', error.message);
  }
};

/**
 * Get all email logs
 * @param {Object} options - Filter options
 * @returns {Array} - Email logs
 */
const getAllLogs = (options = {}) => {
  try {
    if (!fs.existsSync(emailLogsFile)) {
      return [];
    }

    const content = fs.readFileSync(emailLogsFile, 'utf-8');
    let logs = JSON.parse(content).logs || [];

    // Apply filters
    if (options.emailType) {
      logs = logs.filter(log => log.emailType === options.emailType);
    }

    if (options.success !== undefined) {
      logs = logs.filter(log => log.success === options.success);
    }

    if (options.recipient) {
      logs = logs.filter(log => log.to.toLowerCase().includes(options.recipient.toLowerCase()));
    }

    if (options.limit) {
      logs = logs.slice(-options.limit);
    }

    return logs;
  } catch (error) {
    console.error('❌ Error retrieving logs:', error.message);
    return [];
  }
};

/**
 * Get email statistics
 * @returns {Object} - Email statistics
 */
const getStats = () => {
  try {
    if (!fs.existsSync(emailStatsFile)) {
      return null;
    }

    const content = fs.readFileSync(emailStatsFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Error retrieving stats:', error.message);
    return null;
  }
};

/**
 * Get logs by email type
 * @param {string} emailType - Type of email
 * @returns {Array} - Logs filtered by type
 */
const getLogsByType = (emailType) => {
  return getAllLogs({ emailType });
};

/**
 * Get failed emails
 * @returns {Array} - Failed email logs
 */
const getFailedEmails = () => {
  return getAllLogs({ success: false });
};

/**
 * Get successful emails count
 * @returns {number} - Count of successful emails
 */
const getSuccessfulEmailsCount = () => {
  try {
    if (!fs.existsSync(emailLogsFile)) {
      return 0;
    }

    const content = fs.readFileSync(emailLogsFile, 'utf-8');
    const logs = JSON.parse(content).logs || [];
    return logs.filter(log => log.success).length;
  } catch (error) {
    console.error('❌ Error counting successful emails:', error.message);
    return 0;
  }
};

/**
 * Get logs from last N hours
 * @param {number} hours - Number of hours to look back
 * @returns {Array} - Recent logs
 */
const getRecentLogs = (hours = 24) => {
  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const logs = getAllLogs();
    return logs.filter(log => new Date(log.timestamp) > cutoffTime);
  } catch (error) {
    console.error('❌ Error retrieving recent logs:', error.message);
    return [];
  }
};

/**
 * Export logs to CSV format
 * @returns {string} - CSV formatted logs
 */
const exportLogsAsCSV = () => {
  try {
    const logs = getAllLogs();
    if (logs.length === 0) {
      return 'No logs available';
    }

    const headers = ['ID', 'Timestamp', 'Recipient', 'Subject', 'Email Type', 'Status', 'Message ID', 'Error'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.to,
      log.subject,
      log.emailType,
      log.success ? 'SUCCESS' : 'FAILED',
      log.messageId || 'N/A',
      log.error || 'N/A'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  } catch (error) {
    console.error('❌ Error exporting logs:', error.message);
    return '';
  }
};

/**
 * Clear old logs (older than N days)
 * @param {number} days - Days to keep
 * @returns {number} - Number of logs removed
 */
const clearOldLogs = (days = 30) => {
  try {
    if (!fs.existsSync(emailLogsFile)) {
      return 0;
    }

    const content = fs.readFileSync(emailLogsFile, 'utf-8');
    let logData = JSON.parse(content);
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const originalCount = logData.logs.length;
    logData.logs = logData.logs.filter(log => new Date(log.timestamp) > cutoffTime);
    const removedCount = originalCount - logData.logs.length;

    logData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(emailLogsFile, JSON.stringify(logData, null, 2));

    console.log(`🗑️ Cleared ${removedCount} email logs older than ${days} days`);
    return removedCount;
  } catch (error) {
    console.error('❌ Error clearing old logs:', error.message);
    return 0;
  }
};

module.exports = {
  logEmail,
  getAllLogs,
  getStats,
  getLogsByType,
  getFailedEmails,
  getSuccessfulEmailsCount,
  getRecentLogs,
  exportLogsAsCSV,
  clearOldLogs,
  emailLogsFile,
  emailStatsFile
};
