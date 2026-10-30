import React, { useState, useEffect } from 'react';
import API from '../services/api';

const EmergencySOS = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [donorBloodGroup, setDonorBloodGroup] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [sosForm, setSosForm] = useState({
    bloodGroup: 'O-',
    unitsNeeded: 2,
    hospitalName: '',
    city: '',
    contactPhone: '',
    message: ''
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sos');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching SOS alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUserRole(parsed.role);
        setUserId(parsed._id);
        setDonorBloodGroup(parsed.bloodGroup || '');
        setSosForm(prev => ({
          ...prev,
          hospitalName: parsed.name || '',
          city: parsed.city || '',
          contactPhone: parsed.phone || ''
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const visibleAlerts = userRole === 'donor'
    ? alerts.filter((alert) => alert.status === 'Active' && alert.bloodGroup === donorBloodGroup)
    : alerts;

  const handleChange = (e) => {
    setSosForm({ ...sosForm, [e.target.name]: e.target.value });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.post('/sos', sosForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchAlerts();
      alert('Emergency SOS Broadcast Sent Successfully!');
    } catch (err) {
      console.error('Error sending SOS:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to broadcast SOS');
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this emergency as resolved?')) return;
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.put(`/sos/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
      alert('SOS marked as resolved.');
    } catch (err) {
      console.error('Error resolving SOS:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to resolve');
    }
  };

  // Donor Commit Handler for Donor Tracking Integration
  const handleDonorCommit = async (sosItem) => {
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    if (!token) {
      alert('Please log in as a donor to respond to this SOS alert.');
      return;
    }

    try {
      await API.post('/commitments', {
        sosId: sosItem._id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Thank you! Your response is confirmed. You and the hospital can follow its status from your dashboards.');
    } catch (err) {
      console.error('Error recording donor commitment:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to submit commitment.');
    }
  };

  return (
    <div className="min-h-screen bg-red-50/30 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Emergency SOS Broadcasts</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Critical real-time blood requirement alerts for immediate donor response.</p>
          </div>

          {userRole === 'hospital' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 animate-pulse"
            >
              🚨 Broadcast Emergency SOS
            </button>
          )}
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading emergency alerts...</div>
        ) : visibleAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-600 font-medium">{userRole === 'donor' ? `No active SOS alerts for ${donorBloodGroup || 'your blood group'} right now.` : 'No active emergency SOS requests right now. All clear!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleAlerts.map((item) => {
              const isResolved = item.status === 'Resolved';
              const isOwner = userRole === 'hospital' && item.hospital === userId;

              return (
                <div key={item._id} className={`bg-white rounded-2xl p-6 shadow-sm border transition flex flex-col justify-between ${isResolved ? 'border-gray-200 opacity-70 bg-gray-50' : 'border-red-200 border-l-8 border-l-red-600 shadow-red-100'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isResolved ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                          {item.status} SOS
                        </span>
                        <h3 className="text-xl font-extrabold text-gray-900 mt-2">{item.hospitalName}</h3>
                      </div>
                      <span className="bg-red-600 text-white text-sm font-black px-3.5 py-1.5 rounded-xl shadow">
                        {item.bloodGroup}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      <p><strong>Units Required:</strong> <span className="text-red-600 font-bold">{item.unitsNeeded} Units</span></p>
                      <p><strong>City:</strong> {item.city}</p>
                      <p><strong>Emergency Message:</strong> <span className="text-gray-800 italic">"{item.message}"</span></p>
                      <p><strong>Contact Helpline:</strong> <a href={`tel:${item.contactPhone}`} className="text-red-600 font-bold underline">{item.contactPhone}</a></p>
                      <p className="text-xs text-gray-400">Broadcasted on: {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {isOwner && !isResolved && (
                      <button
                        onClick={() => handleResolve(item._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow"
                      >
                        Mark as Resolved / Fulfilled
                      </button>
                    )}

                    {/* Donor Action Button */}
                    {userRole === 'donor' && !isResolved && (
                      <button
                        onClick={() => handleDonorCommit(item)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                      >
                        🙋 I Want to Donate / Respond to SOS
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">🚨 Broadcast Emergency SOS</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Blood Group Needed</label>
                    <select
                      name="bloodGroup"
                      value={sosForm.bloodGroup}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Units Required</label>
                    <input
                      type="number"
                      name="unitsNeeded"
                      min="1"
                      value={sosForm.unitsNeeded}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={sosForm.hospitalName}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={sosForm.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Emergency Helpline Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={sosForm.contactPhone}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Emergency Message / Details</label>
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="e.g. Critical accident case in ICU, immediate requirement of O- blood units."
                    value={sosForm.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-5 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg"
                  >
                    Broadcast Now 🚨
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySOS;
