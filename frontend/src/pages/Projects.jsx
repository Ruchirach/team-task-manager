import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight, FolderKanban } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', teamMembers: [] });
  const [users, setUsers] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created successfully');
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', teamMembers: [] });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
          <p className="text-textMuted text-sm">Manage your team's projects and boards.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Link key={project._id} to={`/projects/${project._id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass p-6 rounded-2xl group hover:-translate-y-1 transition-transform duration-300 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {project.title.charAt(0).toUpperCase()}
                </div>
                {user?.role === 'Admin' && (
                  <button 
                    onClick={(e) => handleDeleteProject(project._id, e)}
                    className="text-textMuted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
              <p className="text-textMuted text-sm line-clamp-2 mb-6">{project.description}</p>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-textMuted text-sm">
                  <Users className="w-4 h-4" />
                  <span>{project.teamMembers?.length || 0} Members</span>
                </div>
                <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 text-textMuted">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No projects found.</p>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Team Members</label>
                <select
                  multiple
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  value={newProject.teamMembers}
                  onChange={(e) => {
                    const options = [...e.target.selectedOptions];
                    const values = options.map(option => option.value);
                    setNewProject({...newProject, teamMembers: values});
                  }}
                >
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <p className="text-xs text-textMuted mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-textMuted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
