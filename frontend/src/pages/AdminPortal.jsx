import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowUpRight, BadgeCheck, Building2,
  CalendarDays, Check, Droplets, HeartPulse, LayoutDashboard, LogOut,
  Menu, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users, X,
} from 'lucide-react';
import API from '../services/api';

const sections = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'users', label: 'People', icon: Users },
  { key: 'inventory', label: 'Blood inventory', icon: Droplets },
  { key: 'requests', label: 'Blood requests', icon: HeartPulse },
  { key: 'sos', label: 'Emergency alerts', icon: AlertTriangle },
  { key: 'camps', label: 'Donation camps', icon: CalendarDays },
  { key: 'commitments', label: 'Donor commitments', icon: BadgeCheck },
  { key: 'issuances', label: 'Issuance log', icon: ArrowDownToLine },
];

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const emptyRecords = { users: [], inventory: [], requests: [], camps: [], sos: [], commitments: [], issuances: [] };

const displayDate = (value) => value ? new Date(value).toLocaleDateString() : '—';
const shortId = (value) => value ? String(value).slice(-7).toUpperCase() : '—';
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const fetchAdminDashboard = async () => {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { data } = await API.get('/admin/dashboard');
      return data;
    } catch (requestError) {
      lastError = requestError;
      const status = requestError.response?.status;
      if ((status && status < 500) || attempt === 2) throw requestError;
      await wait(500 * (2 ** attempt));
    }
  }
  throw lastError;
};

const AdminPortal = () => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('adminInfo') || 'null');
      return saved?.role === 'admin' && saved.token ? saved : null;
    } catch {
      localStorage.removeItem('adminInfo');
      return null;
    }
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [section, setSection] = useState('overview');
  const [metrics, setMetrics] = useState({});
  const [records, setRecords] = useState(emptyRecords);
  const [loading, setLoading] = useState(Boolean(admin));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('adminInfo');
    setAdmin(null);
    setRecords(emptyRecords);
  }, []);

  const refresh = useCallback(async () => {
    if (!admin?.token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminDashboard();
      setMetrics(data.metrics || {});
      setRecords({ ...emptyRecords, ...(data.records || {}) });
    } catch (requestError) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        logout();
        setLoginError('Your admin session expired. Sign in again.');
      } else {
        setError(requestError.response?.data?.message || 'Could not load dashboard data. Check that the backend and database are running.');
      }
    } finally {
      setLoading(false);
    }
  }, [admin, logout]);

  useEffect(() => {
    if (!admin?.token) return undefined;
    let active = true;
    fetchAdminDashboard()
      .then((data) => {
        if (!active) return;
        setMetrics(data.metrics || {});
        setRecords({ ...emptyRecords, ...(data.records || {}) });
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401 || requestError.response?.status === 403) {
          logout();
          setLoginError('Your admin session expired. Sign in again.');
        } else {
          setError(requestError.response?.data?.message || 'Could not load dashboard data. Check that the backend and database are running.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [admin, logout]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoginBusy(true);
    try {
      const { data } = await API.post('/admin/auth/login', loginForm);
      localStorage.setItem('adminInfo', JSON.stringify(data));
      setLoading(true);
      setAdmin(data);
      setLoginForm({ username: '', password: '' });
    } catch (requestError) {
      setLoginError(requestError.response?.data?.message || 'Unable to reach admin sign in. Check the backend connection.');
    } finally {
      setLoginBusy(false);
    }
  };

  const updateRecord = async (collection, id, patch) => {
    setNotice('');
    try {
      await API.patch(`/admin/records/${collection}/${id}`, patch);
      setNotice('Changes saved.');
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save changes.');
    }
  };

  const deleteRecord = async (collection, id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    setNotice('');
    try {
      await API.delete(`/admin/records/${collection}/${id}`);
      setNotice('Record deleted.');
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this record.');
    }
  };

  const visibleRows = useMemo(() => {
    const rows = records[section] || [];
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
  }, [records, section, search]);

  const stockByGroup = useMemo(() => records.inventory.reduce((totals, item) => {
    totals[item.bloodGroup] = (totals[item.bloodGroup] || 0) + Number(item.units || 0);
    return totals;
  }, {}), [records.inventory]);

  if (!admin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a1020] px-4 py-12 text-white">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30 md:grid-cols-[1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-[#111c31] via-[#111827] to-[#3e1020] p-12 md:flex">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white"><Droplets /></span>
              <div><p className="text-lg font-black tracking-tight">BloodConnect</p><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Operations</p></div>
            </div>
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1.5 text-xs font-bold text-rose-200"><ShieldCheck className="h-4 w-4" /> SECURE ADMIN ACCESS</p>
              <h1 className="max-w-md text-4xl font-black leading-tight">Every donation. Every connection. One command center.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">Monitor the network, resolve urgent needs, and keep blood moving to the people who need it.</p>
            </div>
            <p className="text-xs text-slate-500">BloodConnect · Administration portal</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col justify-center px-7 py-12 text-slate-900 sm:px-12 md:py-16">
            <div className="mb-8 md:hidden">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Droplets /></span>
              <p className="text-sm font-black text-slate-900">BloodConnect <span className="font-medium text-slate-400">/ Admin</span></p>
            </div>
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Administrator sign in</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Use your secure administrator credentials to continue.</p>
            </div>
            {loginError && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{loginError}</div>}
            <label className="mb-2 text-sm font-bold text-slate-700" htmlFor="admin-username">Username</label>
            <input id="admin-username" autoComplete="username" required value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} className="mb-5 h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
            <label className="mb-2 text-sm font-bold text-slate-700" htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" autoComplete="current-password" required value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
            <button disabled={loginBusy} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70">
              <ShieldCheck className="h-4 w-4" /> {loginBusy ? 'Verifying…' : 'Sign in to admin'}
            </button>
            <p className="mt-6 text-center text-xs text-slate-400">Administrator access is managed by the server.</p>
          </form>
        </div>
      </div>
    );
  }

  const currentSection = sections.find((item) => item.key === section) || sections[0];
  const metricsCards = [
    { label: 'Registered people', value: metrics.users || 0, icon: Users, tone: 'text-blue-600 bg-blue-50', hint: 'Across all roles' },
    { label: 'Blood units in stock', value: metrics.stockUnits || 0, icon: Droplets, tone: 'text-rose-600 bg-rose-50', hint: 'Current network supply' },
    { label: 'Pending requests', value: metrics.pendingRequests || 0, icon: HeartPulse, tone: 'text-amber-600 bg-amber-50', hint: 'Awaiting fulfillment' },
    { label: 'Active emergencies', value: metrics.activeAlerts || 0, icon: AlertTriangle, tone: 'text-red-600 bg-red-50', hint: 'Need attention now' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 lg:flex">
      <aside className={`${mobileMenuOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[260px] lg:shrink-0`}>
        {mobileMenuOpen && <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/50 lg:hidden" />}
        <div className="relative flex h-full w-[280px] flex-col bg-[#0d1526] px-4 py-5 text-white lg:w-full">
          <div className="flex items-center justify-between px-2 pb-8 pt-1">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600"><Droplets className="h-5 w-5" /></span><div><p className="font-extrabold tracking-tight">BloodConnect</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Admin console</p></div></div>
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="lg:hidden"><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <nav className="space-y-1">
            {sections.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => { setSection(key); setSearch(''); setMobileMenuOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === key ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="h-[18px] w-[18px]" /><span className="flex-1">{label}</span>{key === 'sos' && Number(metrics.activeAlerts) > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{metrics.activeAlerts}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/15 text-sm font-black text-rose-300">{(admin.username || 'A').slice(0, 1).toUpperCase()}</div>
            <p className="truncate text-sm font-bold">{admin.username}</p><p className="mt-0.5 text-xs text-slate-500">Administrator</p>
            <button onClick={logout} className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
              <div className="min-w-0"><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span>Workspace</span><span>/</span><span className="truncate text-slate-600">{currentSection.label}</span></div><h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">{section === 'overview' ? 'Operations overview' : currentSection.label}</h1></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${error ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}><span className={`h-2 w-2 rounded-full ${error ? 'bg-amber-500' : 'bg-emerald-500'}`} />{error ? 'Needs attention' : 'System online'}</span>
              <button onClick={refresh} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span></button>
              <button onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-bold text-white transition hover:bg-slate-700"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"><span>{error}</span><div className="flex items-center gap-3"><button onClick={refresh} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-extrabold hover:bg-rose-100 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Retry</button><button onClick={() => setError('')} aria-label="Dismiss" className="shrink-0"><X className="h-4 w-4" /></button></div></div>}
          {notice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><Check className="h-4 w-4" />{notice}</div>}

          {section === 'overview' ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">A live view of your blood donation network.</p><p className="mt-1 text-xs text-slate-400">Review critical activity and manage platform records.</p></div><button onClick={() => { setSection('requests'); setSearch(''); }} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/15 transition hover:bg-rose-700">Review requests <ArrowUpRight className="h-4 w-4" /></button></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metricsCards.map(({ label, value, icon: Icon, tone, hint }) => <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30"><div className="flex items-center justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live</span></div><p className="mt-5 text-3xl font-black tracking-tight">{value.toLocaleString()}</p><p className="mt-1 text-sm font-bold text-slate-700">{label}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div>)}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-extrabold tracking-tight">Blood supply</h2><p className="mt-1 text-xs text-slate-400">Units currently available by blood group</p></div><button onClick={() => setSection('inventory')} className="text-xs font-bold text-rose-600 hover:text-rose-700">Manage stock <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{bloodGroups.map((group) => { const count = stockByGroup[group] || 0; const max = Math.max(10, ...bloodGroups.map((item) => stockByGroup[item] || 0)); return <div key={group} className="rounded-xl bg-slate-50 p-3.5"><div className="mb-3 flex items-center justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-xs font-black text-rose-700">{group}</span><span className="text-xs font-bold text-slate-500">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${count < 5 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.max(4, (count / max) * 100)}%` }} /></div><p className="mt-2 text-[10px] font-medium text-slate-400">{count < 5 ? 'Low stock' : 'Units available'}</p></div>; })}</div></section>
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-extrabold tracking-tight">Network snapshot</h2><p className="mt-1 text-xs text-slate-400">Platform activity at a glance</p></div><Activity className="h-5 w-5 text-slate-300" /></div><div className="space-y-4">{[{ label: 'Donation camps', value: metrics.camps || 0, icon: CalendarDays, color: 'text-indigo-600 bg-indigo-50' }, { label: 'Donor commitments', value: metrics.commitments || 0, icon: BadgeCheck, color: 'text-emerald-600 bg-emerald-50' }, { label: 'Hospital partners', value: records.users.filter((person) => person.role === 'hospital').length, icon: Building2, color: 'text-blue-600 bg-blue-50' }].map(({ label, value, icon: Icon, color }) => <div key={label} className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span><span className="flex-1 text-sm font-semibold text-slate-600">{label}</span><span className="text-lg font-black">{value}</span></div>)}</div><div className="mt-6 rounded-xl border border-rose-100 bg-rose-50/70 p-4"><p className="flex items-center gap-2 text-xs font-extrabold text-rose-800"><AlertTriangle className="h-4 w-4" /> Priority queue</p><p className="mt-1 text-sm text-rose-700">{metrics.activeAlerts || 0} active emergency alert{metrics.activeAlerts === 1 ? '' : 's'} · {metrics.pendingRequests || 0} pending blood request{metrics.pendingRequests === 1 ? '' : 's'}</p></div></section>
              </div>
              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-extrabold tracking-tight">Latest blood requests</h2><p className="mt-1 text-xs text-slate-400">Newest requests across the network</p></div><button onClick={() => setSection('requests')} className="text-xs font-bold text-rose-600">View all <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3">Patient</th><th className="px-6 py-3">Blood group</th><th className="px-6 py-3">Location</th><th className="px-6 py-3">Urgency</th><th className="px-6 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{records.requests.slice(0, 5).map((request) => <tr key={request._id} className="hover:bg-slate-50/70"><td className="px-6 py-3.5 font-bold">{request.patientName}</td><td className="px-6 py-3.5"><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">{request.bloodGroup}</span></td><td className="px-6 py-3.5 text-slate-500">{request.city}</td><td className="px-6 py-3.5 text-slate-500">{request.urgencyLevel}</td><td className="px-6 py-3.5"><StatusPill value={request.status} /></td></tr>)}{records.requests.length === 0 && <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-400">No blood requests yet.</td></tr>}</tbody></table></div></section>
            </>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:px-6"><div><h2 className="font-extrabold tracking-tight">{currentSection.label}</h2><p className="mt-1 text-xs text-slate-400">{visibleRows.length} record{visibleRows.length === 1 ? '' : 's'} shown · up to 200 most recent</p></div><label className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 sm:w-64"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records…" className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></label></div>
              {loading && records[section]?.length === 0 ? <div className="p-14 text-center text-sm font-semibold text-slate-400">Loading records…</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><TableHead section={section} /><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <AdminRow key={row._id} row={row} section={section} onUpdate={updateRecord} onDelete={deleteRecord} />)}{visibleRows.length === 0 && <tr><td colSpan="8" className="px-6 py-14 text-center text-sm text-slate-400">{search ? 'No records match your search.' : 'No records in this section yet.'}</td></tr>}</tbody></table></div>}
            </section>
          )}
          <footer className="flex flex-wrap items-center justify-between gap-2 pb-4 text-[11px] font-medium text-slate-400"><span>BloodConnect Admin Console</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Protected administrator session</span></footer>
        </div>
      </main>
    </div>
  );
};

function StatusPill({ value }) {
  const tone = value === 'Active' || value === 'Pending' ? 'bg-amber-50 text-amber-700' : value === 'Resolved' || value === 'Fulfilled' || value === 'Donated' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${tone}`}>{value || '—'}</span>;
}

function TableHead({ section }) {
  const cols = {
    users: ['Person', 'Email', 'Role', 'City', 'Phone', 'Joined', 'Actions'],
    inventory: ['Blood group', 'Hospital', 'City', 'Units', 'Expires', 'Batch', 'Actions'],
    requests: ['Patient', 'Blood group', 'Location', 'Units', 'Urgency', 'Status', 'Actions'],
    camps: ['Camp', 'Hospital', 'Venue', 'City', 'Date', 'Contact', 'Actions'],
    sos: ['Alert', 'Blood group', 'Location', 'Units', 'Created', 'Status', 'Actions'],
    commitments: ['Donor', 'Blood group', 'Hospital', 'Reference', 'Created', 'Status', 'Actions'],
    issuances: ['Patient', 'Blood group', 'Hospital', 'Units', 'Doctor', 'Issue date', 'Reason'],
  }[section] || [];
  return <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400"><tr>{cols.map((col) => <th key={col} className="whitespace-nowrap px-5 py-3.5">{col}</th>)}</tr></thead>;
}

function AdminRow({ row, section, onUpdate, onDelete }) {
  const cell = 'whitespace-nowrap px-5 py-3.5 text-slate-600';
  const primary = 'font-bold text-slate-900';
  const selectClass = 'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-rose-300';
  const removeButton = (collection) => <button title="Delete record" onClick={() => onDelete(collection, row._id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>;

  if (section === 'users') return <tr className="hover:bg-slate-50/70"><td className={`${cell} ${primary}`}>{row.name}</td><td className={cell}>{row.email}</td><td className={cell}><select aria-label={`Role for ${row.name}`} disabled={row.role === 'admin'} className={selectClass} value={row.role} onChange={(event) => onUpdate('users', row._id, { role: event.target.value })}><option value="donor">Donor</option><option value="recipient">Recipient</option><option value="hospital">Hospital</option></select></td><td className={cell}>{row.city || '—'}</td><td className={cell}>{row.phone || '—'}</td><td className={cell}>{displayDate(row.createdAt)}</td><td className={cell}>{removeButton('users')}</td></tr>;
  if (section === 'inventory') return <tr className="hover:bg-slate-50/70"><td className={cell}><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">{row.bloodGroup}</span></td><td className={`${cell} ${primary}`}>{row.hospitalName}</td><td className={cell}>{row.city}</td><td className={cell}><div className="flex items-center gap-2"><button aria-label="Remove one unit" onClick={() => onUpdate('inventory', row._id, { units: Math.max(0, Number(row.units) - 1) })} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 font-bold hover:border-rose-300 hover:text-rose-600">−</button><span className="min-w-6 text-center font-extrabold text-slate-900">{row.units}</span><button aria-label="Add one unit" onClick={() => onUpdate('inventory', row._id, { units: Number(row.units) + 1 })} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 font-bold hover:border-emerald-300 hover:text-emerald-600"><Plus className="h-3.5 w-3.5" /></button></div></td><td className={cell}>{displayDate(row.expiryDate)}</td><td className={cell}>{row.batchNumber || '—'}</td><td className={cell}>{removeButton('inventory')}</td></tr>;
  if (section === 'requests') return <tr className="hover:bg-slate-50/70"><td className={`${cell} ${primary}`}>{row.patientName}<p className="mt-0.5 text-[10px] font-medium text-slate-400">#{shortId(row._id)}</p></td><td className={cell}><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">{row.bloodGroup}</span></td><td className={cell}>{row.city}</td><td className={cell}>{row.unitsNeeded}</td><td className={cell}><StatusPill value={row.urgencyLevel} /></td><td className={cell}><StatusPill value={row.status} /></td><td className={cell}>{row.status === 'Pending' ? <button onClick={() => onUpdate('requests', row._id, { status: 'Fulfilled' })} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">Fulfill</button> : '—'}</td></tr>;
  if (section === 'camps') return <tr className="hover:bg-slate-50/70"><td className={`${cell} ${primary}`}>{row.title}</td><td className={cell}>{row.hospitalName}</td><td className={cell}>{row.venue}</td><td className={cell}>{row.city}</td><td className={cell}>{displayDate(row.date)}</td><td className={cell}>{row.contactPhone}</td><td className={cell}>{removeButton('camps')}</td></tr>;
  if (section === 'sos') return <tr className="hover:bg-slate-50/70"><td className={`${cell} ${primary}`}>{row.hospitalName}<p className="mt-0.5 max-w-52 truncate text-[10px] font-medium text-slate-400">{row.message}</p></td><td className={cell}><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">{row.bloodGroup}</span></td><td className={cell}>{row.city}</td><td className={cell}>{row.unitsNeeded}</td><td className={cell}>{displayDate(row.createdAt)}</td><td className={cell}><StatusPill value={row.status} /></td><td className={cell}>{row.status === 'Active' ? <button onClick={() => onUpdate('sos', row._id, { status: 'Resolved' })} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">Resolve</button> : '—'}</td></tr>;
  if (section === 'commitments') return <tr className="hover:bg-slate-50/70"><td className={`${cell} ${primary}`}>{row.donorName}<p className="mt-0.5 text-[10px] font-medium text-slate-400">{row.donorPhone}</p></td><td className={cell}><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">{row.bloodGroup}</span></td><td className={cell}>{row.hospitalName}</td><td className={cell}>{row.referenceType}</td><td className={cell}>{displayDate(row.createdAt)}</td><td className={cell}><select aria-label={`Commitment status for ${row.donorName}`} className={selectClass} value={row.status} onChange={(event) => onUpdate('commitments', row._id, { status: event.target.value })}><option>Accepted</option><option>On the Way</option><option>Donated</option><option>Cancelled</option></select></td><td className={cell}>#{shortId(row._id)}</td></tr>;
  return <tr className="hover:bg-slate-50/70"><td className={`${cell} ${primary}`}>{row.patientName}</td><td className={cell}><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">{row.bloodGroup}</span></td><td className={cell}>{row.hospitalName}</td><td className={cell}>{row.unitsIssued}</td><td className={cell}>{row.doctorName}</td><td className={cell}>{displayDate(row.issueDate || row.createdAt)}</td><td className={`${cell} max-w-52 truncate`}>{row.reason}</td></tr>;
}

export default AdminPortal;
