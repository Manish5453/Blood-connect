import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ClipboardList, Plus, User, FileText, Activity } from 'lucide-react';

const PatientIssuanceLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patientName: '',
    patientAge: '',
    gender: 'Male',
    bloodGroup: 'A+',
    unitsIssued: 1,
    doctorName: '',
    reason: ''
  });

  const fetchLogs = async () => {
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get('/issuance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.post('/issuance', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchLogs();
      alert('Patient issuance log recorded successfully!');
    } catch (err) {
      console.error('Error recording issuance:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to record issuance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-red-600" /> Patient Issuance History Log
            </h1>
            <p className="text-sm text-gray-500 mt-1">Audit record of blood units issued to patients.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Issue Blood to Patient
          </button>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading issuance history...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-600 font-medium">No blood issuance records found for your hospital yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Patient Name</th>
                    <th className="py-4 px-6">Age / Gender</th>
                    <th className="py-4 px-6">Blood Group</th>
                    <th className="py-4 px-6">Units</th>
                    <th className="py-4 px-6">Attending Doctor</th>
                    <th className="py-4 px-6">Reason / Diagnosis</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900">{log.patientName}</td>
                      <td className="py-4 px-6 text-gray-600">{log.patientAge} Yrs / {log.gender}</td>
                      <td className="py-4 px-6">
                        <span className="bg-red-50 text-red-700 text-xs font-extrabold px-3 py-1 rounded-full border border-red-100">
                          {log.bloodGroup}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-red-600">{log.unitsIssued} Units</td>
                      <td className="py-4 px-6 text-gray-700">{log.doctorName}</td>
                      <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{log.reason}</td>
                      <td className="py-4 px-6 text-gray-500 text-xs">{new Date(log.issueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Log Patient Blood Issuance</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    name="patientName"
                    value={form.patientName}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Patient Age</label>
                    <input
                      type="number"
                      name="patientAge"
                      min="1"
                      value={form.patientAge}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={form.bloodGroup}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Units Issued</label>
                    <input
                      type="number"
                      name="unitsIssued"
                      min="1"
                      value={form.unitsIssued}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Attending Doctor Name</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={form.doctorName}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Reason / Diagnosis</label>
                  <textarea
                    name="reason"
                    rows="2"
                    placeholder="e.g. Major surgery requirement, severe anemia, accident trauma."
                    value={form.reason}
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
                    Record Issuance
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

export default PatientIssuanceLog;