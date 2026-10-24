import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar, MapPin, Clock, Phone, Plus, Trash2 } from 'lucide-react';

const DonationCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [campForm, setCampForm] = useState({
    title: '',
    venue: '',
    city: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    contactPhone: '',
    description: '',
    hospitalName: ''
  });

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await API.get('/camps');
      setCamps(res.data);
    } catch (err) {
      console.error('Error fetching camps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUserRole(parsed.role);
        setUserId(parsed._id);
        setCampForm(prev => ({
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

  const handleChange = (e) => {
    setCampForm({ ...campForm, [e.target.name]: e.target.value });
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.post('/camps', campForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchCamps();
      alert('Blood Donation Camp Organized Successfully!');
    } catch (err) {
      console.error('Error organizing camp:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to organize camp');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel/delete this donation camp?')) return;
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.delete(`/camps/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCamps();
      alert('Camp deleted successfully.');
    } catch (err) {
      console.error('Error deleting camp:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to delete camp');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Blood Donation Camps</h1>
            <p className="text-sm text-gray-500 mt-1">Upcoming community blood drive events and collection drives.</p>
          </div>

          {userRole === 'hospital' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Schedule New Camp
            </button>
          )}
        </div>

        {/* Camps Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading upcoming donation camps...</div>
        ) : camps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-600 font-medium">No donation camps scheduled at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => {
              const isOwner = userRole === 'hospital' && camp.hospital === userId;

              return (
                <div key={camp._id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
                      {camp.city}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-3">{camp.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 mb-4">Organized by: {camp.hospitalName}</p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <strong>Date:</strong> {new Date(camp.date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <strong>Time:</strong> {camp.startTime} - {camp.endTime}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <strong>Venue:</strong> {camp.venue}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-red-600" />
                        <strong>Helpline:</strong> {camp.contactPhone}
                      </p>
                      {camp.description && (
                        <p className="text-gray-500 text-xs italic mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "{camp.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(camp._id)}
                      className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Cancel Camp
                    </button>
                  )}
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
                <h2 className="text-xl font-bold text-gray-900">Schedule Blood Donation Camp</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
              </div>

              <form onSubmit={handleCreateCamp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Camp Title / Event Name</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Mega City Blood Drive 2026"
                    value={campForm.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Venue / Address</label>
                    <input
                      type="text"
                      name="venue"
                      placeholder="e.g. Community Hall Sector 12"
                      value={campForm.venue}
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
                      value={campForm.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={campForm.date}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={campForm.startTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={campForm.endTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={campForm.contactPhone}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Description / Guidelines</label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="e.g. Free health checkup for all donors. Bring photo ID."
                    value={campForm.description}
                    onChange={handleChange}
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
                    Publish Camp
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

export default DonationCamps;