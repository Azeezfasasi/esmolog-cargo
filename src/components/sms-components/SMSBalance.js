import React from 'react';
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';


export default function SMSBalance() {
  const token = localStorage.getItem('token');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['smsBalance'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/sms/balance`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000, // 8 second timeout on client side too
        });
        return response.data;
      } catch (error) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Request timeout. Server may be temporarily unavailable.');
        }
        throw error;
      }
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes (reduced from 5)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });

  const handleManualRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Manual refresh failed:', err);
    }
  };

  // Show stale cached data if available
  const isCached = data?.cached;
  const displayBalance = data?.balance?.total_balance || 0;
  
  return (
    <div className={`rounded-lg shadow p-6 text-white ${
      error ? 'bg-red-600' : isCached ? 'bg-amber-600' : 'bg-gradient-to-r from-green-600 to-green-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {error ? (
            <AlertCircle className="w-12 h-12 opacity-80" />
          ) : (
            <Wallet className="w-12 h-12 opacity-80" />
          )}
          <div>
            <p className={`text-sm ${error ? 'text-red-100' : isCached ? 'text-amber-100' : 'text-green-100'}`}>
              {error ? 'Balance - Error' : isCached ? 'Balance - Cached' : 'Current Balance'}
            </p>
            <p className="text-3xl font-bold">
              {isLoading && !data ? 'Loading...' : displayBalance.toLocaleString()}
            </p>
            {data?.currency && !error && (
              <p className={`text-sm ${isCached ? 'text-amber-100' : 'text-green-100'}`}>
                {data.currency}
                {isCached && ` (${Math.floor((Date.now() - data.cacheAge) / 60000)}m old)`}
              </p>
            )}
            {error && (
              <p className="text-red-100 text-sm">
                {error.message === 'Request failed with status code 401' ? 'Unauthorized' : 'Server unavailable'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className={`p-2 rounded-full disabled:opacity-50 transition-colors ${
            error ? 'bg-red-400/30 hover:bg-red-400/50' : isCached ? 'bg-amber-400/30 hover:bg-amber-400/50' : 'bg-white/20 hover:bg-white/30'
          }`}
          title="Refresh balance"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {data?.balance && !error && (
        <div className="mt-4 pt-4 border-t border-opacity-30 grid grid-cols-3 gap-4 text-xs">
          {data.balance.universal_wallet && (
            <div>
              <span className={`block mb-1 ${isCached ? 'text-amber-100' : 'text-green-100'}`}>Universal Wallet</span>
              <p className="font-medium">{parseFloat(data.balance.universal_wallet).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
          {data.balance.sms_bonus && (
            <div>
              <span className={`block mb-1 ${isCached ? 'text-amber-100' : 'text-green-100'}`}>SMS Bonus</span>
              <p className="font-medium">{parseFloat(data.balance.sms_bonus).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
          {data.balance.sms_wallet && (
            <div>
              <span className={`block mb-1 ${isCached ? 'text-amber-100' : 'text-green-100'}`}>SMS Wallet</span>
              <p className="font-medium">{parseFloat(data.balance.sms_wallet).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
