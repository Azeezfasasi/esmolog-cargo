"use client";

import React, { useState } from 'react';
import { MessageSquare, Settings, History, BarChart3, Send } from 'lucide-react';
import SMSSettings from '@/components/sms-components/SMSSettings';
import SMSLogs from '@/components/sms-components/SMSLogs';
import SMSStatistics from '@/components/sms-components/SMSStatistics';
import SendTestSMS from '@/components/sms-components/SendTestSMS';
import SMSBalance from '@/components/sms-components/SMSBalance';
import Link from 'next/link';
// import DashHeader from '@/components/DashboardComponents/DashHeader'
// import DashMenu from '@/';

export default function SMSDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', shortLabel: 'Over', icon: BarChart3 },
    { id: 'balance', label: 'Balance & Test', shortLabel: 'Bal', icon: Send },
    { id: 'settings', label: 'Settings', shortLabel: 'Set', icon: Settings },
    { id: 'logs', label: 'SMS Logs', shortLabel: 'Logs', icon: History },
    { id: 'statistics', label: 'Statistics', shortLabel: 'Stats', icon: BarChart3 },
  ];

  return (
    <>
        <div className='flex flex-col justify-start gap-3 sm:gap-4 px-1 sm:px-4 lg:px-0'>
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-bold">SMS Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-none">
                    Configure and monitor SMS notifications for shipment updates
                </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="flex border-b overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1 px-2 sm:px-3 md:px-4 py-3 font-medium border-b-2 transition whitespace-nowrap text-xs sm:text-sm ${
                        activeTab === tab.id
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.shortLabel}</span>
                        <span className="hidden sm:inline md:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                    );
                })}
                </div>

                {/* Tab Content */}
                <div className="p-2 sm:p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-3 sm:space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4">
                        <h3 className="font-semibold text-green-900 mb-2 text-xs sm:text-base">SMS Integration Active</h3>
                        <p className="text-green-800 text-xs sm:text-sm">
                        Your ESMOLOG Worldwide system is connected to <Link href="https://www.bulksmsnigeria.com/" target='_blank' className="text-green-800 font-semibold hover:underline">BulkSMS Nigeria</Link> for automated
                        shipment notifications. SMS messages will be automatically sent to senders and
                        recipients when shipments are created or their status changes.
                        </p>
                    </div>

                    <SMSBalance />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                        <h4 className="font-semibold mb-2 sm:mb-3 text-xs sm:text-base">Quick Actions</h4>
                        <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <li className="flex items-start space-x-2">
                            <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">•</span>
                            <span>
                                <strong>Send Test SMS:</strong> Verify your SMS connection with a test
                                message
                            </span>
                            </li>
                            <li className="flex items-start space-x-2">
                            <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">•</span>
                            <span>
                                <strong>Configure Settings:</strong> Customize when and to whom SMS are sent
                            </span>
                            </li>
                            <li className="flex items-start space-x-2">
                            <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">•</span>
                            <span>
                                <strong>View SMS Logs:</strong> Track all SMS sent to customers
                            </span>
                            </li>
                            <li className="flex items-start space-x-2">
                            <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">•</span>
                            <span>
                                <strong>Monitor Statistics:</strong> Analyze SMS performance and usage
                            </span>
                            </li>
                        </ul>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                        <h4 className="font-semibold mb-2 sm:mb-3 text-xs sm:text-base">Supported Events</h4>
                        <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                            <li>✓ Shipment Creation</li>
                            <li>✓ Status Updates</li>
                            <li>✓ Out for Delivery</li>
                            <li>✓ Delivery Confirmation</li>
                            <li>✓ Shipment Delays</li>
                            <li>✓ Cancellations</li>
                            <li>✓ Exception/Issue Alerts</li>
                        </ul>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'balance' && (
                    <div className="space-y-4 sm:space-y-6">
                    <SMSBalance />
                    <SendTestSMS />
                    </div>
                )}

                {activeTab === 'settings' && <SMSSettings />}

                {activeTab === 'logs' && <SMSLogs />}

                {activeTab === 'statistics' && <SMSStatistics />}
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4 text-xs sm:text-sm text-green-900">
                <p>
                <strong>Note:</strong> SMS charges will be deducted from your BulkSMS Nigeria account
                balance. Monitor your balance and logs regularly to track usage and costs.
                </p>
            </div>
        </div>
    </>
  );
}
