import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { API_BASE_URL } from '../../utils/apiConfig';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from '../icons/IconTypes';

/* Cyan + Black theme for charts */
const CHART_COLORS = {
  primary: '#00f0ff',
  secondary: '#33f3ff',
  accent: '#00b8cc',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a78bfa',
};

const CHART_GRID = 'rgba(0, 240, 255, 0.08)';
const CHART_AXIS = 'rgba(148, 163, 184, 0.8)';
const TOOLTIP_BG = 'rgba(10, 10, 10, 0.95)';
const TOOLTIP_BORDER = 'rgba(0, 240, 255, 0.2)';

export default function ProviderAnalytics({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'provider') {
      fetchAnalytics();
    }
  }, [currentUser, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const [overviewRes, revenueRes, servicesRes, ordersRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/overview?period=${period}`, { headers, credentials: 'include' }),
        fetch(`${API_BASE_URL}/analytics/revenue?period=${period}&groupBy=day`, { headers, credentials: 'include' }),
        fetch(`${API_BASE_URL}/analytics/services`, { headers, credentials: 'include' }),
        fetch(`${API_BASE_URL}/analytics/orders?period=${period}`, { headers, credentials: 'include' }),
        fetch(`${API_BASE_URL}/analytics/customers?period=${period}`, { headers, credentials: 'include' }),
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverview(overviewData.data);
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        setRevenueData(revenueData.data.revenueData || []);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServiceData(servicesData.data || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrderData(ordersData.data.orderData || []);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomerData(customersData.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-2 border-[#00f0ff]/20 border-t-[#00f0ff] rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const formattedRevenueData = revenueData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
  }));

  const topServices = serviceData.slice(0, 5);
  const serviceChartData = topServices.map((s) => ({
    name: s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title,
    revenue: s.revenue,
    orders: s.orderCount,
    views: s.views,
  }));

  const categoryRevenue = serviceData.reduce((acc, service) => {
    const cat = service.category || 'General';
    acc[cat] = (acc[cat] || 0) + service.revenue;
    return acc;
  }, {});

  const pieData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.info, CHART_COLORS.purple, CHART_COLORS.warning];

  const orderStatusData = orderData.length > 0 ? orderData : [
    { date: 'Mon', count: 0 },
    { date: 'Tue', count: 0 },
    { date: 'Wed', count: 0 },
    { date: 'Thu', count: 0 },
    { date: 'Fri', count: 0 },
    { date: 'Sat', count: 0 },
    { date: 'Sun', count: 0 },
  ];

  const tooltipStyle = {
    backgroundColor: TOOLTIP_BG,
    border: `1px solid ${TOOLTIP_BORDER}`,
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] bg-clip-text text-transparent">Analytics</span>
            & Insights
          </h3>
          <p className="text-gray-400 text-sm mt-2">Track performance, revenue, and growth</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                period === p
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-lg shadow-[#00f0ff]/10'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-[#00f0ff]/20'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`₹${overview.totalRevenue.toLocaleString()}`}
            change={overview.revenueGrowth}
            trend={overview.revenueGrowth >= 0 ? 'up' : 'down'}
            icon={<DollarSignIcon size={24} />}
            color="from-[#00f0ff] to-[#00b8cc]"
            delay={0}
          />
          <MetricCard
            label="Total Orders"
            value={overview.totalOrders}
            change={`${overview.completionRate.toFixed(1)}% completion`}
            trend="up"
            icon={<TrendingUpIcon size={24} />}
            color="from-[#10b981] to-emerald-600"
            delay={50}
          />
          <MetricCard
            label="Avg Order Value"
            value={`₹${overview.averageOrderValue.toLocaleString()}`}
            change={`${overview.totalServices} services`}
            trend="neutral"
            icon={<DollarSignIcon size={24} />}
            color="from-[#33f3ff] to-[#00f0ff]"
            delay={100}
          />
          <MetricCard
            label="Completion Rate"
            value={`${overview.completionRate.toFixed(1)}%`}
            change={`${overview.completedOrders} completed`}
            trend="up"
            icon={<TrendingUpIcon size={24} />}
            color="from-amber-500 to-orange-500"
            delay={150}
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend - Area Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-[#00f0ff]/10 p-6 animate-scale-in hover:border-[#00f0ff]/20 transition-all duration-300">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#00f0ff] to-[#00b8cc]" />
            Revenue Trend
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedRevenueData.length > 0 ? formattedRevenueData : [{ date: 'No Data', revenue: 0 }]}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="date" stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} fill="url(#revenueGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Performance - Bar Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-[#00f0ff]/10 p-6 animate-scale-in hover:border-[#00f0ff]/20 transition-all duration-300" style={{ animationDelay: '50ms' }}>
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#10b981] to-emerald-600" />
            Top Services
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceChartData.length > 0 ? serviceChartData : [{ name: 'No Data', revenue: 0, orders: 0 }]} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" stroke={CHART_AXIS} fontSize={11} angle={-35} textAnchor="end" height={70} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [name === 'Revenue (₹)' ? `₹${Number(v).toLocaleString()}` : v, name]} />
              <Legend wrapperStyle={{ paddingTop: 16 }} formatter={(v) => <span className="text-gray-300 text-sm">{v}</span>} />
              <Bar dataKey="revenue" fill={CHART_COLORS.success} name="Revenue (₹)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" fill={CHART_COLORS.primary} name="Orders" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category - Pie Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-[#00f0ff]/10 p-6 animate-scale-in hover:border-[#00f0ff]/20 transition-all duration-300" style={{ animationDelay: '100ms' }}>
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#33f3ff] to-[#00f0ff]" />
            Revenue by Category
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={50}
                paddingAngle={2}
                dataKey="value"
                stroke="rgba(10,10,10,0.8)"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Volume - Composed Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-[#00f0ff]/10 p-6 animate-scale-in hover:border-[#00f0ff]/20 transition-all duration-300" style={{ animationDelay: '150ms' }}>
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
            Order Volume
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="date" stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={CHART_COLORS.purple} name="Orders" radius={[4, 4, 0, 0]} opacity={0.9} />
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2} name="Trend" dot={{ fill: CHART_COLORS.primary, r: 4 }} activeDot={{ r: 6, fill: CHART_COLORS.secondary }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Performance Table */}
      {serviceData.length > 0 && (
        <div className="glass-panel card-premium rounded-2xl border border-[#00f0ff]/10 p-6 animate-scale-in overflow-hidden">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#00f0ff] to-[#00b8cc]" />
            Service Details
          </h4>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#00f0ff]/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Service</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Revenue</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Orders</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Views</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Conversion</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Rating</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.map((service, idx) => (
                  <tr key={service.serviceId} className="border-b border-white/5 hover:bg-[#00f0ff]/5 transition-colors duration-200">
                    <td className="py-4 px-4 text-white font-medium">{service.title}</td>
                    <td className="py-4 px-4 text-right text-[#00f0ff] font-semibold">₹{service.revenue.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-gray-300">{service.orderCount}</td>
                    <td className="py-4 px-4 text-right text-gray-300">{service.views}</td>
                    <td className="py-4 px-4 text-right text-[#33f3ff]">{service.conversionRate.toFixed(1)}%</td>
                    <td className="py-4 px-4 text-right text-amber-400">⭐ {service.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Metrics */}
      {customerData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl border border-[#00f0ff]/10 p-5 animate-fade-in hover:border-[#00f0ff]/20 transition-all">
            <p className="text-gray-400 text-sm mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-white">{customerData.totalCustomers}</p>
          </div>
          <div className="glass-panel rounded-xl border border-[#00f0ff]/10 p-5 animate-fade-in hover:border-[#00f0ff]/20 transition-all">
            <p className="text-gray-400 text-sm mb-1">New Customers</p>
            <p className="text-2xl font-bold text-[#00f0ff]">{customerData.newCustomers}</p>
          </div>
          <div className="glass-panel rounded-xl border border-[#00f0ff]/10 p-5 animate-fade-in hover:border-[#00f0ff]/20 transition-all">
            <p className="text-gray-400 text-sm mb-1">Returning</p>
            <p className="text-2xl font-bold text-[#33f3ff]">{customerData.returningCustomers}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon, color, delay = 0 }) {
  return (
    <div
      className="glass-panel card-premium rounded-2xl border border-[#00f0ff]/10 p-6 card-hover group relative overflow-hidden animate-slide-up hover:border-[#00f0ff]/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color}`} />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-semibold mb-2">{label}</p>
          <p className="text-white text-2xl font-bold mb-1">{value}</p>
          <div className="flex items-center gap-1.5">
            {trend === 'up' && <TrendingUpIcon size={14} className="text-[#00f0ff]" />}
            {trend === 'down' && <TrendingDownIcon size={14} className="text-red-400" />}
            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-[#00f0ff]' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {typeof change === 'number' ? (change >= 0 ? '+' : '') + change + '%' : change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
