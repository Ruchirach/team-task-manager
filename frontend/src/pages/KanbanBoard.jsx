import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, Calendar, User } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const KanbanBoard = () => {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState({
    'To Do': [],
    'In Progress': [],
    'Done': []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', assignedTo: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [projectId, user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setUsers(response.data.teamMembers || []);
    } catch (error) {
      console.error('Failed to fetch project members', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      const data = response.data;
      
      const grouped = {
        'To Do': data.filter(t => t.status === 'To Do'),
        'In Progress': data.filter(t => t.status === 'In Progress'),
        'Done': data.filter(t => t.status === 'Done'),
      };
      setTasks(grouped);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const sourceItems = [...sourceColumn];
      const destItems = [...destColumn];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      });

      // Update backend
      try {
        await api.put(`/tasks/${removed._id}`, { status: destination.droppableId });
      } catch (error) {
        toast.error('Failed to update task status');
        fetchTasks(); // Revert on failure
      }
    } else {
      const column = tasks[source.droppableId];
      const copiedItems = [...column];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setTasks({
        ...tasks,
        [source.droppableId]: copiedItems
      });
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...newTask, projectId };
      if (!taskData.assignedTo) delete taskData.assignedTo;
      
      await api.post('/tasks', taskData);
      toast.success('Task created');
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', dueDate: '', assignedTo: '' });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'bg-primary' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-warning' },
    { id: 'Done', title: 'Done', color: 'bg-success' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Board</h1>
          <p className="text-textMuted text-sm">Drag and drop tasks to update status.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map(column => (
            <div key={column.id} className="flex-1 min-w-[300px] flex flex-col glass p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-white">{column.title}</h3>
                <span className="text-xs font-medium text-textMuted bg-surface px-2 py-1 rounded-full ml-auto">
                  {tasks[column.id].length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 min-h-[150px] p-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                  >
                    {tasks[column.id].map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={`p-4 mb-3 rounded-xl bg-surface border border-white/10 hover:border-white/20 transition-colors shadow-lg ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl shadow-black/50 z-50' : ''
                            }`}
                          >
                            <h4 className="text-white font-medium mb-2">{item.title}</h4>
                            {item.description && (
                              <p className="text-textMuted text-sm line-clamp-2 mb-3">{item.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-textMuted mt-3 pt-3 border-t border-white/10">
                              {item.assignedTo ? (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{item.assignedTo.name}</span>
                                </div>
                              ) : (
                                <span>Unassigned</span>
                              )}
                              
                              {item.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Assign To</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none appearance-none"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="" className="bg-surface text-white">Unassigned</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id} className="bg-surface text-white">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
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

export default KanbanBoard;
