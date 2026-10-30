import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Droplet,
  HeartPulse,
  MapPin,
  Search,
  Users,
} from 'lucide-react';

const compatibilityMap = {
  'A+': { give: ['A+', 'AB+'], receive: ['A+', 'A-', 'O+', 'O-'] },
  'A-': { give: ['A+', 'A-', 'AB+', 'AB-'], receive: ['A-', 'O-'] },
  'B+': { give: ['B+', 'AB+'], receive: ['B+', 'B-', 'O+', 'O-'] },
  'B-': { give: ['B+', 'B-', 'AB+', 'AB-'], receive: ['B-', 'O-'] },
  'AB+': { give: ['AB+'], receive: ['Universal Recipient (All Groups)'] },
  'AB-': { give: ['AB+', 'AB-'], receive: ['A-', 'B-', 'AB-', 'O-'] },
  'O+': { give: ['A+', 'B+', 'AB+', 'O+'], receive: ['O+', 'O-'] },
  'O-': { give: ['Universal Donor (All Groups)'], receive: ['O-'] },
};

const activityCards = [
  { label: 'Urgent Need', accent: 'rose', icon: AlertCircle, title: 'Critical demand for O-Negative & B-Negative donors', description: 'Respond to emergency requests from the network.', action: 'View Requests', to: '/requests' },
  { label: 'Donor Directory', accent: 'blue', icon: Users, title: 'Find Verified Donors', description: 'Search nearby voluntary donors by blood group and city.', action: 'Search Directory', to: '/donors' },
  { label: 'Blood Stock', accent: 'emerald', icon: Building2, title: 'Blood Bank Inventory', description: 'Check available units across partner hospitals and blood banks.', action: 'Check Inventory', to: '/inventory' },
  { label: 'Donation Camps', accent: 'amber', icon: MapPin, title: 'Find a Donation Camp', description: 'Explore community blood drives and donation camps.', action: 'Explore Camps', to: '/camps' },
];

const activityStyles = {
  rose: { tag: 'bg-rose-50 text-rose-700', icon: 'text-rose-600' },
  blue: { tag: 'bg-blue-50 text-blue-700', icon: 'text-blue-600' },
  emerald: { tag: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' },
  amber: { tag: 'bg-amber-50 text-amber-700', icon: 'text-amber-600' },
};

const Home = () => {
  const [selectedGroup, setSelectedGroup] = useState('O+');

  return (
    <main className="min-h-screen space-y-14 bg-slate-50 pb-16 sm:space-y-20">
      {/* Urgent request ticker */}
      <div className="relative flex h-16 items-center overflow-hidden border-b border-slate-700 bg-slate-950 text-white shadow-sm">
        <div className="z-10 flex h-full shrink-0 items-center bg-slate-950 px-4 sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] shadow-lg shadow-rose-950/30 sm:text-xs">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" /></span>
            Live Emergency Ticker
          </span>
        </div>
        <div className="ticker-viewport min-w-0 flex-1" aria-label="Urgent donor need: Critical demand for O-Negative and B-Negative donors">
          <div className="ticker-track flex w-max items-center">
            {[0, 1, 2].map((copy) => (
              <div className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12" key={copy} aria-hidden={copy > 0}>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-slate-100 sm:text-base">
                  <span className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-1 font-extrabold text-rose-300">O-Negative &amp; B-Negative</span>
                  Critical demand for donors
                </span>
                <Link to="/requests" tabIndex={copy > 0 ? -1 : undefined} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-white/15 hover:text-white sm:text-sm">
                  Respond Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-rose-100 bg-linear-to-br from-rose-50 via-white to-red-50 px-6 py-10 shadow-sm sm:px-12 sm:py-14 lg:px-16 lg:py-16" style={{ color: '#0f172a' }}>
          <div className="absolute -right-24 -top-28 -z-10 h-96 w-96 rounded-full bg-rose-200/45 blur-3xl" />
          <div className="absolute -bottom-36 right-1/4 -z-10 h-80 w-80 rounded-full bg-red-100/70 blur-3xl" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">
                <HeartPulse className="h-4 w-4 animate-pulse text-rose-600" />
                Real-Time Emergency Network
              </div>
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl" style={{ color: '#0f172a' }}>
                Connecting Blood Donors <span className="text-rose-600" style={{ color: '#e11d48' }}>With Urgent Needs</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg" style={{ color: '#475569' }}>
                Bridge the gap between life-saving voluntary donors and emergency ICU requirements. Instant contact, zero middlemen.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/donors" className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-rose-600 to-red-700 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:from-rose-700 hover:to-red-800">
                  <Search className="h-5 w-5 text-white" /> Find Donors Now
                </Link>
                <Link to="/requests" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-700">
                  <AlertCircle className="h-5 w-5" /> Post Emergency Need
                </Link>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-[370px] items-center justify-center">
              <div className="absolute inset-5 rounded-full border border-rose-200/70" />
              <div className="absolute inset-12 rounded-full border border-rose-200/60" />
              <div className="absolute h-64 w-64 rounded-full bg-linear-to-br from-rose-200/80 to-red-100/30 blur-sm" />
              <div className="relative flex h-52 w-52 items-center justify-center rounded-[3.5rem] border border-rose-200/70 bg-linear-to-br from-rose-500 to-red-700 shadow-2xl shadow-rose-700/25 sm:h-60 sm:w-60">
                <div className="absolute inset-3 rounded-[3rem] border border-white/20" />
                <Droplet className="h-28 w-28 fill-white/10 text-white drop-shadow-lg sm:h-32 sm:w-32" strokeWidth={1.4} />
              </div>
              <div className="absolute right-0 top-12 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10 sm:right-2">
                <HeartPulse className="h-5 w-5 text-rose-600" />
              </div>
              <div className="absolute bottom-10 left-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10 sm:left-2">
                <Users className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network activity cards: use the existing services and urgency message */}
      <section className="overflow-hidden border-y border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-rose-600">
            <Activity className="h-4 w-4" /> Live Activity Radar
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Emergency help and donor services</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">Explore the tools available through the BloodConnect network.</p>
        </div>
        <div className="activity-viewport mt-8 overflow-hidden px-4 pb-3 sm:px-6 lg:px-8">
          <div className="activity-track flex w-max gap-4">
            {[0, 1].map((copy) => (
              <div className="flex gap-4" key={copy} aria-hidden={copy === 1}>
                {activityCards.map((card) => {
                  const Icon = card.icon;
                  const colors = activityStyles[card.accent];
                  return (
                    <Link key={card.label} to={card.to} tabIndex={copy === 1 ? -1 : undefined} className="w-[min(78vw,340px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between gap-3"><span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${colors.tag}`}>{card.label}</span><Icon className={`h-5 w-5 ${colors.icon}`} /></div>
                      <h3 className="mt-4 font-bold text-slate-900">{card.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose-600">{card.action} <ArrowRight className="h-4 w-4" /></span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact strip uses counts based on this page's real content */}
      <section className="border-y border-slate-200 bg-white py-10 sm:py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ['8', 'Blood Groups'],
            ['4', 'Network Services'],
            ['2', 'Urgent Blood Groups'],
            ['1', 'Compatibility Guide'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{value}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Existing project features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-rose-600">One Purpose</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Intuitive tools built for every emergency</h2>
          <p className="mt-3 text-slate-500">Whether you are seeking blood, organizing a drive, or donating, BloodConnect guides you smoothly.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/donors" className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:scale-105"><Users className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-slate-900">Find Verified Donors</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">Search nearby voluntary blood donors filterable by exact blood group and city location.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-600">Search Directory <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>

          <Link to="/requests" className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-105"><AlertCircle className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-slate-900">Emergency Requests</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">Post urgent requirements for surgery or ICU patients with direct contact details.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-600">View Active Requests <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>

          <Link to="/inventory" className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105"><Building2 className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-slate-900">Blood Bank Inventory</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">Check real-time unit stock levels available across partner hospitals and blood banks.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Check Hospital Stock <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>

          <Link to="/camps" className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-105"><MapPin className="h-6 w-6" /></div>
            <h3 className="text-lg font-bold text-slate-900">Donation Camps</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">Participate in local community drives, university blood camps, and mobile donor vans.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-600">Find camp drives <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>

      {/* Existing interactive compatibility guide */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-8 text-center sm:px-10">
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Blood Compatibility Matrix</h2>
            <p className="mt-2 text-sm text-slate-500">Select a blood group to see valid recipient and donor groups.</p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-7 flex flex-wrap justify-center gap-2">
              {Object.keys(compatibilityMap).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  aria-pressed={selectedGroup === group}
                  className={`rounded-xl px-5 py-2.5 text-sm font-extrabold transition ${selectedGroup === group ? 'scale-105 bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {group}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Can Give Blood To</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {compatibilityMap[selectedGroup].give.map((group) => <span key={group} className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-bold text-emerald-800">{group}</span>)}
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><Activity className="h-5 w-5 text-blue-600" /> Can Receive Blood From</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {compatibilityMap[selectedGroup].receive.map((group) => <span key={group} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-bold text-blue-800">{group}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community stories from the supplied design reference */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-rose-600">Community Voices</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Real Stories, Real Lives Saved</h2>
          <p className="mt-3 text-slate-500">Hear from patients, families, and everyday donor heroes across the network.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm leading-7 text-slate-600">“When my mother underwent emergency surgery, we needed 3 units of B+ within 45 minutes. BloodConnect matched us with two nearby donors who arrived directly at the hospital.”</p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-sm font-extrabold text-rose-600">RD</span>
              <div><p className="font-bold text-slate-900">Rohan Deshmukh</p><p className="text-xs text-slate-500">Recipient Family · Mumbai</p></div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm leading-7 text-slate-600">“I've donated 8 times over 3 years. The notifications are precise, respectful of my time, and knowing your blood directly helped a patient is the best feeling in the world.”</p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">PS</span>
              <div><p className="font-bold text-slate-900">Priya Sharma</p><p className="text-xs text-slate-500">Regular Donor (O−) · Delhi</p></div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm leading-7 text-slate-600">“Our hospital blood bank inventory coordination improved by 40% since connecting our verified drives. BloodConnect is indispensable in healthcare logistics.”</p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">DR</span>
              <div><p className="font-bold text-slate-900">Dr. Arvind Rao</p><p className="text-xs text-slate-500">Medical Superintendent · Bangalore</p></div>
            </div>
          </article>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-4 overflow-hidden rounded-[2rem] bg-linear-to-r from-rose-600 via-red-600 to-rose-800 px-6 py-10 text-white shadow-xl shadow-rose-900/15 sm:mx-auto sm:max-w-7xl sm:px-10 sm:py-12 lg:px-14">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em]">Be Someone's Hope Today</span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">Every single second counts. Join the life-saving chain.</h2>
            <p className="mt-3 text-sm text-rose-50 sm:text-base">Register as a volunteer donor or organize a blood camp in your institution today.</p>
          </div>
          <Link to="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-rose-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-50">Get Started Now <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="text-xl font-extrabold tracking-tight"><span className="text-rose-600">Blood</span><span className="text-slate-900">Connect</span></Link>
            <p className="mt-1 text-sm text-slate-500">Connecting blood donors with people who need them.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
            <Link to="/donors" className="hover:text-rose-600">Find Donors</Link>
            <Link to="/camps" className="hover:text-rose-600">Donation Camps</Link>
            <Link to="/requests" className="hover:text-rose-600">Request Blood</Link>
            <Link to="/emergency-sos" className="hover:text-rose-600">Emergency SOS</Link>
          </nav>
        </div>
        <div className="mx-auto mt-6 max-w-7xl border-t border-slate-100 pt-4 text-xs text-slate-400">© 2026 BloodConnect</div>
      </footer>
    </main>
  );
};

export default Home;
