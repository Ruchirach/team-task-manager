import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, LayoutList } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500`} style={{ backgroundColor: color }} />
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-textMuted text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock data for chart
  const chartData = [
    { name: 'Mon', completed: 4, new: 6 },
    { name: 'Tue', completed: 7, new: 3 },
    { name: 'Wed', completed: 5, new: 8 },
    { name: 'Thu', completed: 9, new: 4 },
    { name: 'Fri', completed: 12, new: 7 },
    { name: 'Sat', completed: 3, new: 2 },
    { name: 'Sun', completed: 6, new: 5 },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-textMuted">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={stats?.totalTasks || 0} icon={LayoutList} color="#3b82f6" delay={0.1} />
        <StatCard title="Completed" value={stats?.completedTasks || 0} icon={CheckCircle2} color="#22c55e" delay={0.2} />
        <StatCard title="In Progress" value={stats?.pendingTasks || 0} icon={Clock} color="#eab308" delay={0.3} />
        <StatCard title="Overdue" value={stats?.overdueTasks || 0} icon={AlertCircle} color="#ef4444" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Task Activity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="new" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Recent Tasks</h3>
          <div className="space-y-4">
            {stats?.recentTasks?.length === 0 ? (
              <p className="text-textMuted text-sm">No recent tasks found.</p>
            ) : (
              stats?.recentTasks?.map((task) => (
                <div key={task._id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    task.status === 'Done' ? 'bg-success' : task.status === 'In Progress' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">{task.title}</p>
                    <p className="text-xs text-textMuted mt-1">{task.projectId?.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
