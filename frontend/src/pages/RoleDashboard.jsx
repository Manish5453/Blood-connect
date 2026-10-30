import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CalendarDays, CheckCircle2, Clock3, HeartHandshake, MapPin, Phone, Plus, ShieldCheck, Users } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const roleCopy = {
  donor: { title: 'Donor dashboard', subtitle: 'Your blood can make a life saving difference. Track every response in one place.' },
  hospital: { title: 'Hospital dashboard', subtitle: 'Manage emergency broadcasts and coordinate every donor who responds.' },
  recipient: { title: 'Recipient dashboard', subtitle: 'Follow active blood requests and get help from your community.' },
};

const statusStyle = {
  Accepted: 'bg-blue-50 text-blue-700 ring-blue-100',
  'On the Way': 'bg-amber-50 text-amber-700 ring-amber-100',
  Donated: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function StatCard({ icon: Icon, label, value, tone = 'rose' }) {
  const tones = {
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export default function RoleDashboard() {
  const { user } = useAuth();
  const role = user?.role || 'recipient';
  const [commitments, setCommitments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      role === 'recipient' ? Promise.resolve({ data: [] }) : API.get('/commitments'),
      API.get('/sos'),
      API.get('/requests'),
    ]);
    if (results[0].status === 'fulfilled') setCommitments(results[0].value.data);
    else setError(results[0].reason.response?.data?.message || 'Could not load your dashboard data.');
    if (results[1].status === 'fulfilled') setAlerts(results[1].value.data);
    if (results[2].status === 'fulfilled') setRequests(results[2].value.data);
    setLoading(false);
  }, [role]);

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(() => loadDashboard(false), 15000);
    return () => window.clearInterval(refreshTimer);
  }, [loadDashboard]);

  const hospitalAlerts = useMemo(
    () => alerts.filter((alert) => String(alert.hospital) === String(user?._id)),
    [alerts, user?._id],
  );
  const activeResponders = commitments.filter((item) => !['Donated', 'Cancelled'].includes(item.status));
  const activeRequests = requests.filter((request) => request.status === 'Pending');

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.put(`/commitments/${id}/status`, { status });
      await loadDashboard(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the response status.');
    } finally {
      setUpdatingId('');
    }
  };

  const copy = roleCopy[role] || roleCopy.recipient;
  const headingBadge = role === 'hospital' ? 'Hospital account · All blood groups' : role === 'donor' ? `Registered donor · ${user?.bloodGroup || 'Blood group not set'}` : 'Recipient account';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-rose-600/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-rose-100"><ShieldCheck className="h-4 w-4" />{headingBadge}</span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{copy.title}, {user?.name?.split(' ')[0] || 'friend'}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{copy.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {role === 'hospital' && <Link to="/emergency-sos" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold shadow-lg shadow-rose-950/30 transition hover:bg-rose-500"><Plus className="h-4 w-4" /> New SOS</Link>}
              {role === 'donor' && <Link to="/emergency-sos" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold shadow-lg shadow-rose-950/30 transition hover:bg-rose-500"><HeartHandshake className="h-4 w-4" /> Find an SOS</Link>}
              {role === 'recipient' && <Link to="/requests" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold shadow-lg shadow-rose-950/30 transition hover:bg-rose-500"><Plus className="h-4 w-4" /> Request blood</Link>}
              <Link to={role === 'hospital' ? '/analytics' : '/requests'} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15">{role === 'hospital' ? 'View analytics' : 'Browse requests'} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center font-medium text-slate-500">Loading your dashboard…</div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {role === 'hospital' ? <>
                <StatCard icon={Users} label="Donors responding" value={activeResponders.length} tone="rose" />
                <StatCard icon={Activity} label="Total responses" value={commitments.length} tone="blue" />
                <StatCard icon={HeartHandshake} label="Active SOS broadcasts" value={hospitalAlerts.filter((item) => item.status === 'Active').length} tone="amber" />
                <StatCard icon={CheckCircle2} label="Completed donations" value={commitments.filter((item) => item.status === 'Donated').length} tone="emerald" />
              </> : role === 'donor' ? <>
                <StatCard icon={HeartHandshake} label="Your responses" value={commitments.length} tone="rose" />
                <StatCard icon={Clock3} label="In progress" value={activeResponders.length} tone="amber" />
                <StatCard icon={CheckCircle2} label="Donations completed" value={commitments.filter((item) => item.status === 'Donated').length} tone="emerald" />
                <StatCard icon={Activity} label="Open blood requests" value={activeRequests.length} tone="blue" />
              </> : <>
                <StatCard icon={Activity} label="Open blood requests" value={activeRequests.length} tone="rose" />
                <StatCard icon={HeartHandshake} label="Active emergency alerts" value={alerts.filter((item) => item.status === 'Active').length} tone="amber" />
                <StatCard icon={MapPin} label="Your city" value={user?.city || 'Not set'} tone="blue" />
                <StatCard icon={CalendarDays} label="Account type" value="Recipient" tone="emerald" />
              </>}
            </section>

            {role === 'hospital' ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div><h2 className="text-lg font-extrabold text-slate-900">Donors who responded</h2><p className="mt-1 text-sm text-slate-500">Contact details are available to your hospital for coordination.</p></div>
                  <Link to="/donor-tracking" className="text-sm font-bold text-rose-600 hover:text-rose-700">Open tracking <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
                </div>
                {commitments.length === 0 ? <div className="px-6 py-14 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">No donor responses yet</p><p className="mt-1 text-sm text-slate-500">When donors accept one of your SOS alerts, they will appear here.</p></div> : (
                  <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                    {commitments.map((item) => {
                      const donor = item.donor || {};
                      const name = donor.name || item.donorName || 'Blood donor';
                      const phone = donor.phone || item.donorPhone;
                      return <article key={item._id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-rose-200 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 font-black text-rose-600">{name.charAt(0).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{name}</h3><p className="truncate text-xs text-slate-500">{donor.city || 'City not provided'}</p></div></div><span className="shrink-0 rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-black text-rose-700">{donor.bloodGroup || item.bloodGroup}</span></div>
                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-800">Responding to:</span> {item.referenceLabel || item.referenceType || 'SOS alert'}</p>
                          {phone && <a className="flex items-center gap-2 font-semibold text-rose-600 hover:underline" href={`tel:${phone}`}><Phone className="h-4 w-4" />{phone}</a>}
                          {donor.email && <a className="block truncate text-blue-700 hover:underline" href={`mailto:${donor.email}`}>{donor.email}</a>}
                          <p className="text-xs text-slate-400">Responded {new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyle[item.status] || statusStyle.Accepted}`}>{item.status}</span>
                          {item.status !== 'Donated' && item.status !== 'Cancelled' && <button disabled={updatingId === item._id} onClick={() => updateStatus(item._id, 'Donated')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{updatingId === item._id ? 'Saving…' : 'Mark donated'}</button>}
                        </div>
                      </article>;
                    })}
                  </div>
                )}
              </section>
            ) : role === 'donor' ? (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="text-lg font-extrabold text-slate-900">Your donation responses</h2><p className="mt-1 text-sm text-slate-500">Track the requests you have accepted and update your arrival status.</p></div>
                {commitments.length === 0 ? <div className="px-6 py-14 text-center"><HeartHandshake className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">No responses yet</p><Link to="/emergency-sos" className="mt-3 inline-flex font-bold text-rose-600">See matching SOS alerts <ArrowRight className="ml-1 h-4 w-4" /></Link></div> : <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">{commitments.map((item) => <article key={item._id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.referenceType === 'SOS' ? 'Emergency SOS' : 'Blood request'}</p><h3 className="mt-1 font-bold text-slate-900">{item.hospitalName}</h3></div><span className="rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-black text-rose-700">{item.bloodGroup}</span></div><p className="mt-3 text-sm text-slate-600">{item.referenceLabel}</p><span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyle[item.status] || statusStyle.Accepted}`}>{item.status}</span><div className="mt-4 flex flex-wrap gap-2">{item.status === 'Accepted' && <button disabled={updatingId === item._id} onClick={() => updateStatus(item._id, 'On the Way')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600">I am on the way</button>}{!['Donated', 'Cancelled'].includes(item.status) && <button disabled={updatingId === item._id} onClick={() => updateStatus(item._id, 'Cancelled')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel response</button>}</div></article>)}</div>}
              </section>
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-lg font-extrabold text-slate-900">Active requests near the network</h2><p className="mt-1 text-sm text-slate-500">See current needs and follow up with the hospital directly.</p></div><Link to="/requests" className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">View all</Link></div>
                {activeRequests.length === 0 ? <div className="px-6 py-14 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" /><p className="mt-3 font-semibold text-slate-700">No active requests right now</p></div> : <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">{activeRequests.slice(0, 6).map((request) => <article key={request._id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-900">{request.patientName}</h3><span className="rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-black text-rose-700">{request.bloodGroup}</span></div><p className="mt-3 text-sm text-slate-600">{request.hospitalName} · {request.city}</p><p className="mt-1 text-sm text-slate-500">{request.unitsNeeded} units · {request.urgencyLevel}</p><a href={`tel:${request.contactPhone}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-rose-600"><Phone className="h-4 w-4" />Contact hospital</a></article>)}</div>}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
