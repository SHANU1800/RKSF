import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
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
} from 'recharts';
import { API_BASE_URL } from '../../utils/apiConfig';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from '../icons/IconTypes';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

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
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Format revenue data for charts
  const formattedRevenueData = revenueData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
  }));

  // Service performance data
  const topServices = serviceData.slice(0, 5);
  const serviceChartData = topServices.map((s) => ({
    name: s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title,
    revenue: s.revenue,
    orders: s.orderCount,
    views: s.views,
  }));

  // Revenue by category
  const categoryRevenue = serviceData.reduce((acc, service) => {
    const cat = service.category || 'General';
    acc[cat] = (acc[cat] || 0) + service.revenue;
    return acc;
  }, {});

  const pieData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));

  // Order status distribution
  const orderStatusData = orderData.length > 0 ? orderData : [
    { date: 'Mon', count: 0 },
    { date: 'Tue', count: 0 },
    { date: 'Wed', count: 0 },
    { date: 'Thu', count: 0 },
    { date: 'Fri', count: 0 },
    { date: 'Sat', count: 0 },
    { date: 'Sun', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white flex items-center gap-3">
            Analytics & Insights
          </h3>
          <p className="text-gray-400 text-sm mt-2">Track your performance, revenue, and growth</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? 'bg-[#0a0a0a] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`₹${overview.totalRevenue.toLocaleString()}`}
            change={overview.revenueGrowth}
            trend={overview.revenueGrowth >= 0 ? 'up' : 'down'}
            icon={<DollarSignIcon size={24} />}
            color="from-emerald-500 to-green-600"
          />
          <MetricCard
            label="Total Orders"
            value={overview.totalOrders}
            change={`${overview.completionRate.toFixed(1)}% completion`}
            trend="up"
            icon={<TrendingUpIcon size={24} />}
            color="bg-[#F7D047]"
          />
          <MetricCard
            label="Avg Order Value"
            value={`₹${overview.averageOrderValue.toLocaleString()}`}
            change={`${overview.totalServices} services`}
            trend="neutral"
            icon={<DollarSignIcon size={24} />}
            color="bg-purple-500"
          />
          <MetricCard
            label="Completion Rate"
            value={`${overview.completionRate.toFixed(1)}%`}
            change={`${overview.completedOrders} completed`}
            trend="up"
            icon={<TrendingUpIcon size={24} />}
            color="from-orange-500 to-red-600"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend - Line Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-white/10 p-6">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            Revenue Trend
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedRevenueData.length > 0 ? formattedRevenueData : [{ date: 'No Data', revenue: 0 }]}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Performance - Bar Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-white/10 p-6">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            Top Services Performance
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceChartData.length > 0 ? serviceChartData : [{ name: 'No Data', revenue: 0, orders: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill={COLORS.success} name="Revenue (₹)" />
              <Bar dataKey="orders" fill={COLORS.info} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category - Pie Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-white/10 p-6">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
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
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Volume - Composed Chart */}
        <div className="glass-panel card-premium rounded-2xl border border-white/10 p-6">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            Order Volume Trend
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="count" fill={COLORS.secondary} name="Orders" />
              <Line type="monotone" dataKey="count" stroke={COLORS.warning} strokeWidth={2} name="Trend" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Performance Table */}
      {serviceData.length > 0 && (
        <div className="glass-panel card-premium rounded-2xl border border-white/10 p-6">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            Service Performance Details
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Service</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Orders</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Views</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Conversion</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Rating</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.map((service) => (
                  <tr key={service.serviceId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{service.title}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-semibold">₹{service.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{service.orderCount}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{service.views}</td>
                    <td className="py-3 px-4 text-right text-[#F7D047]">{service.conversionRate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right text-yellow-400">⭐ {service.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Metrics */}
      {customerData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl border border-white/10 p-4">
            <p className="text-gray-400 text-sm mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-white">{customerData.totalCustomers}</p>
          </div>
          <div className="glass-panel rounded-xl border border-white/10 p-4">
            <p className="text-gray-400 text-sm mb-1">New Customers</p>
            <p className="text-2xl font-bold text-emerald-400">{customerData.newCustomers}</p>
          </div>
          <div className="glass-panel rounded-xl border border-white/10 p-4">
            <p className="text-gray-400 text-sm mb-1">Returning Customers</p>
            <p className="text-2xl font-bold text-[#F7D047]">{customerData.returningCustomers}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon, color }) {
  return (
    <div className={`glass-panel card-premium rounded-2xl border border-white/10 p-6 card-hover group relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${color} opacity-60`} />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-semibold mb-2">{label}</p>
          <p className="text-white text-2xl font-bold mb-1">{value}</p>
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUpIcon size={14} className="text-emerald-400" />
            ) : trend === 'down' ? (
              <TrendingDownIcon size={14} className="text-red-400" />
            ) : null}
            <span className={`text-xs font-semibold ${
              trend === 'up' ? 'text-emerald-400' : 
              trend === 'down' ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color} opacity-20 group-hover:opacity-30 transition-opacity`}>
          {icon}
        </div>
      </div>
    </div>
  );
}












