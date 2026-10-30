import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { AlertCircle, Activity, CheckCircle2 } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await API.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Loading blood network analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md">
          <h3 className="text-lg font-bold text-red-600 mb-2">Analytics Error</h3>
          <p className="text-sm text-gray-600">{error || 'Unable to fetch analytics data right now.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-red-600" /> {data.scope === 'hospital' ? 'Hospital Analytics & Shortage Predictor' : 'Blood Network Analytics'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{data.scope === 'hospital' ? 'Real-time stock analysis and shortage forecasting for your hospital.' : 'Live, network-wide blood stock and emergency totals.'}</p>
        </div>

        {/* Shortage Warnings */}
        {data.shortageGroups && data.shortageGroups.length > 0 ? (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-red-900">Critical Blood Shortage Warning</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  The following blood groups have <strong>fewer than 5 units</strong> in stock:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.shortageGroups.map(bg => (
                    <span key={bg} className="bg-red-600 text-white font-black px-3 py-1 rounded-lg text-sm shadow">
                      {bg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-2xl shadow-sm flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-green-900">Optimal Inventory Status</h3>
              <p className="text-sm text-green-700">All blood groups currently exceed minimum threshold safety limits.</p>
            </div>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units in Stock</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{data.totalUnitsInStock || 0} <span className="text-sm text-gray-500 font-normal">Units</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Patients Issued</p>
            <p className="text-3xl font-extrabold text-red-600 mt-2">{data.totalUnitsIssued || 0} <span className="text-sm text-gray-500 font-normal">Units</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active SOS Broadcasts</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{data.activeSosCount || 0} <span className="text-sm text-gray-500 font-normal">Active</span></p>
          </div>
        </div>

        {/* Stock Breakdown per Blood Group */}
        {data.stockByGroup && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Stock Level by Blood Group</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(data.stockByGroup).map(([group, count]) => {
                const isLow = count < 5;
                return (
                  <div key={group} className={`p-4 rounded-xl border flex justify-between items-center ${isLow ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <span className="text-xs font-bold text-gray-500">Group</span>
                      <p className="text-2xl font-black text-gray-900">{group}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-extrabold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{count}</p>
                      <span className="text-xs text-gray-500">Units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
