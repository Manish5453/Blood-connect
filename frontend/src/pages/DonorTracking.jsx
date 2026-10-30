import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Truck, CheckCircle, Clock, Phone, User, ShieldAlert } from 'lucide-react';

const DonorTracking = () => {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  const fetchCommitments = async () => {
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      setLoading(true);
      const res = await API.get('/commitments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommitments(res.data);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitments();
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUserRole(JSON.parse(userInfo).role);
      } catch (e) {}
    }
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.put(`/commitments/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCommitments();
      alert(`Status updated to: ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8 text-red-600" /> Donor Dispatch & Live Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-1">Coordinate active donor arrivals and fulfillment milestones.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading coordination records...</div>
        ) : commitments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-600 font-medium">No active donor commitments found right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commitments.map((item) => {
              const badgeColor = 
                item.status === 'Donated' ? 'bg-green-100 text-green-700' :
                item.status === 'On the Way' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';

              return (
                <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
                          {item.status}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mt-2">{item.donorName}</h3>
                      </div>
                      <span className="bg-red-50 text-red-700 text-sm font-extrabold px-3 py-1 rounded-full border border-red-100">
                        {item.bloodGroup}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <p><strong>Hospital / Venue:</strong> {item.hospitalName}</p>
                      {item.referenceLabel && <p><strong>{item.referenceType === 'SOS' ? 'Emergency' : 'Blood request'}:</strong> {item.referenceLabel}</p>}
                      <p className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-red-600" /> 
                        <strong>Contact:</strong> <a href={`tel:${item.donorPhone}`} className="text-red-600 underline">{item.donorPhone}</a>
                      </p>
                      <p className="text-xs text-gray-400">Initiated: {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Status Action Controls */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    {userRole === 'donor' && item.status === 'Accepted' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'On the Way')}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow"
                      >
                        🚗 I am On the Way
                      </button>
                    )}
                    {userRole === 'hospital' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'Donated')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow"
                      >
                        ✅ Mark as Donated
                      </button>
                    )}
                    {item.status !== 'Donated' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'Cancelled')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorTracking;
