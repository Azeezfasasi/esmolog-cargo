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
    <div className={`rounded-lg shadow p-3 sm:p-6 text-white ${
      error ? 'bg-red-600' : isCached ? 'bg-amber-600' : 'bg-gradient-to-r from-green-600 to-green-700'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {error ? (
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 opacity-80 flex-shrink-0" />
          ) : (
            <Wallet className="w-8 h-8 sm:w-12 sm:h-12 opacity-80 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-xs sm:text-sm ${error ? 'text-red-100' : isCached ? 'text-amber-100' : 'text-green-100'}`}>
              {error ? 'Balance - Error' : isCached ? 'Balance - Cached' : 'Current Balance'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold break-words">
              {isLoading && !data ? 'Loading...' : displayBalance.toLocaleString()}
            </p>
            {data?.currency && !error && (
              <p className={`text-xs sm:text-sm ${isCached ? 'text-amber-100' : 'text-green-100'}`}>
                {data.currency}
                {isCached && ` (${Math.floor((Date.now() - data.cacheAge) / 60000)}m old)`}
              </p>
            )}
            {error && (
              <p className="text-red-100 text-xs sm:text-sm">
                {error.message === 'Request failed with status code 401' ? 'Unauthorized' : 'Server unavailable'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className={`p-2 rounded-full disabled:opacity-50 transition-colors flex-shrink-0 mt-1 sm:mt-0 ${
            error ? 'bg-red-400/30 hover:bg-red-400/50' : isCached ? 'bg-amber-400/30 hover:bg-amber-400/50' : 'bg-white/20 hover:bg-white/30'
          }`}
          title="Refresh balance"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {data?.balance && !error && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-opacity-30 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {data.balance.universal_wallet && (
            <div>
              <span className={`block text-xs mb-1 ${isCached ? 'text-amber-100' : 'text-green-100'}`}>Universal Wallet</span>
              <p className="font-medium text-sm break-words">{parseFloat(data.balance.universal_wallet).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
          {data.balance.sms_bonus && (
            <div>
              <span className={`block text-xs mb-1 ${isCached ? 'text-amber-100' : 'text-green-100'}`}>SMS Bonus</span>
              <p className="font-medium text-sm break-words">{parseFloat(data.balance.sms_bonus).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
          {data.balance.sms_wallet && (
            <div>
              <span className={`block text-xs mb-1 ${isCached ? 'text-amber-100' : 'text-green-100'}`}>SMS Wallet</span>
              <p className="font-medium text-sm break-words">{parseFloat(data.balance.sms_wallet).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
