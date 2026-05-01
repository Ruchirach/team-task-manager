import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import KanbanBoard from './pages/KanbanBoard';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Layout with Sidebar
const Layout = ({ children }) => (
  <div className="flex h-screen bg-background p-4 gap-4">
    <Sidebar />
    <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden relative">
      <Navbar />
      <div className="flex-1 overflow-auto p-8 custom-scrollbar relative z-0">
        {children}
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
