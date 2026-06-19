
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, PlusCircle, BookOpen, BarChart3, CheckCircle2, Circle, AlertCircle, Clock, Tag, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format } from 'date-fns';

const CATEGORIES = ['debugging', 'blocker', 'coordination', 'tooling', 'other'];
const SEVERITIES = [1, 2, 3, 4, 5];

const App = () => {
  const [activeTab, setActiveTab] = useState('log');
  const [problems, setProblems] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterCategory) params.category = filterCategory;
      const res = await axios.get('/api/problems', { params });
      setProblems(res.rows || res.data); // Handle both wrapped and unwrapped response
    } catch (error) {
      console.error('Failed to fetch problems', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await axios.get('/api/problems/insights');
      setInsights(res.data);
    } catch (error) {
      console.error('Failed to fetch insights', error);
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchInsights();
  }, [activeTab, filterDate, filterCategory]);

  const handleCreateProblem = async (formData) => {
    try {
      await axios.post('/api/problems', formData);
      fetchProblems();
      fetchInsights();
      return true;
    } catch (error) {
      console.error('Failed to create problem', error);
      return false;
    }
  };

  const handleResolve = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/problems/${id}`, { resolved: !currentStatus });
      fetchProblems();
      fetchInsights();
    } catch (error) {
      console.error('Failed to update problem', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Layout className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">ProblemPulse</h1>
        </div>
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'log' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <PlusCircle className="w-4 h-4" />
            Log
          </button>
          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'journal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <BookOpen className="w-4 h-4" />
            Journal
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'insights' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Insights
          </button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-6 py-8">
        {activeTab === 'log' && <LogPage onSubmit={handleCreateProblem} recentProblems={problems.slice(0, 5)} onResolve={handleResolve} />}
        {activeTab === 'journal' && (
          <JournalPage 
            problems={problems} 
            loading={loading} 
            onResolve={handleResolve}
            filters={{ filterDate, filterCategory }}
            setFilterDate={setFilterDate}
            setFilterCategory={setFilterCategory}
          />
        )}
        {activeTab === 'insights' && <InsightsPage insights={insights} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-slate-500 text-xs">
        &copy; 2026 ProblemPulse MVP — For Meta Engineers
      </footer>
    </div>
  );
};

const LogPage = ({ onSubmit, recentProblems, onResolve }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'debugging',
    severity: 3,
    time_spent_minutes: 30,
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        title: '',
        description: '',
        category: 'debugging',
        severity: 3,
        time_spent_minutes: 30,
        tags: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PlusCircle className="text-blue-600 w-5 h-5" />
            Log a Problem
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Problem Title</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g., CI pipeline failing on post-commit"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all capitalize"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity (1-5)</label>
                <div className="flex gap-2">
                  {SEVERITIES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, severity: s})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${formData.severity === s ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Spent (min)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.time_spent_minutes}
                  onChange={e => setFormData({...formData, time_spent_minutes: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                placeholder="Details about the blocker, debugging steps taken..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
              <input 
                type="text"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g., ci-cd, dev-infra, networking"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              Log Problem Entry
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            Recent Logs
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">LATEST</span>
          </h2>
          <div className="space-y-3">
            {recentProblems.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No problems logged yet.</p>
              </div>
            ) : (
              recentProblems.map(p => (
                <ProblemItem key={p.id} p={p} onResolve={onResolve} compact />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const JournalPage = ({ problems, loading, onResolve, filters, setFilterDate, setFilterCategory }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Problem Journal</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-sm focus:outline-none capitalize"
              value={filters.filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <input 
              type="date"
              className="bg-transparent text-sm focus:outline-none"
              value={filters.filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          {(filters.filterDate || filters.filterCategory) && (
            <button 
              onClick={() => { setFilterDate(''); setFilterCategory(''); }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No entries found</h3>
            <p className="text-slate-500">Try adjusting your filters or log a new problem.</p>
          </div>
        ) : (
          problems.map(p => (
            <ProblemItem key={p.id} p={p} onResolve={onResolve} />
          ))
        )}
      </div>
    </div>
  );
};

const ProblemItem = ({ p, onResolve, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 transition-all hover:shadow-md ${isExpanded ? 'shadow-lg ring-1 ring-blue-500/20' : 'shadow-sm'}`}>
      <div className={`p-4 flex items-start gap-4 ${compact ? 'py-3' : ''}`}>
        <button 
          onClick={() => onResolve(p.id, p.resolved)}
          className={`mt-1 flex-shrink-0 transition-colors ${p.resolved ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-blue-500'}`}
        >
          {p.resolved ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 
              onClick={() => !compact && setIsExpanded(!isExpanded)}
              className={`font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors ${p.resolved ? 'line-through text-slate-400' : ''}`}
            >
              {p.title}
            </h3>
            <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              p.severity >= 4 ? 'bg-red-50 text-red-600' : p.severity >= 3 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
            }`}>
              Level {p.severity}
            </span>
          </div>
          {!compact && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md capitalize font-medium">
                {p.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {p.time_spent_minutes} min
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {p.date}
              </span>
              {p.tags && (
                <div className="flex items-center gap-1 overflow-hidden">
                  <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{p.tags}</span>
                </div>
              )}
            </div>
          )}
          {compact && (
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span className="capitalize">{p.category}</span>
              <span>{p.date}</span>
            </div>
          )}
        </div>
        {!compact && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>
      {isExpanded && !compact && p.description && (
        <div className="px-13 pb-4 pl-13 pr-4 border-t border-slate-50 bg-slate-50/50 rounded-b-xl">
           <div className="ml-9 mt-3 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
             {p.description}
           </div>
        </div>
      )}
    </div>
  );
};

const InsightsPage = ({ insights }) => {
  if (!insights) return null;

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Problems" 
          value={insights.categoryCounts.reduce((acc, curr) => acc + curr.count, 0)} 
          icon={<AlertCircle className="w-5 h-5 text-blue-600" />}
        />
        <StatCard 
          label="Avg Severity" 
          value={insights.severityAvg.toFixed(1)} 
          icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
        />
        <StatCard 
          label="Time Spent" 
          value={`${Math.round(insights.timeSpentTotal / 60)}h ${insights.timeSpentTotal % 60}m`} 
          icon={<Clock className="w-5 h-5 text-green-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Problems by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  textAnchor="middle"
                  interval={0}
                  tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {insights.categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Daily Activity (Last 7 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="bg-slate-50 p-3 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default App;
