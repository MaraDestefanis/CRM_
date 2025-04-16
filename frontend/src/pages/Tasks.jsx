import React, { useState } from 'react';

const Tasks = () => {
  const [viewMode, setViewMode] = useState('kanban');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Call Client A',
      description: 'Follow up on recent proposal',
      priority: 'high',
      dueDate: '2025-04-20',
      status: 'todo',
      assignedTo: 'John Doe',
      strategy: 'Increase Product A Sales',
      location: { lat: 40.7128, lng: -74.0060 },
      recurrence: 'none'
    },
    {
      id: 2,
      title: 'Prepare Monthly Report',
      description: 'Create sales analysis report for April',
      priority: 'medium',
      dueDate: '2025-04-30',
      status: 'in-progress',
      assignedTo: 'Jane Smith',
      strategy: 'Client Retention Campaign',
      location: null,
      recurrence: 'monthly'
    },
    {
      id: 3,
      title: 'Client B Meeting',
      description: 'Discuss new product offerings',
      priority: 'high',
      dueDate: '2025-04-18',
      status: 'done',
      assignedTo: 'John Doe',
      strategy: 'Increase Product A Sales',
      location: { lat: 34.0522, lng: -118.2437 },
      recurrence: 'none'
    }
  ]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban');
  };

  return (
    <div className="tasks-page">
      <h1>Task Planning &amp; Tracking</h1>
      
      <div className="tasks-actions">
        <button className="button primary">Create New Task</button>
        <button className="button" onClick={toggleViewMode}>
          Switch to {viewMode === 'kanban' ? 'Calendar' : 'Kanban'} View
        </button>
      </div>
      
      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          <div className="kanban-column">
            <h2>To Do</h2>
            {tasks
              .filter(task => task.status === 'todo')
              .map(task => (
                <div key={task.id} className={`task-card priority-${task.priority}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className="task-priority">{task.priority}</span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-details">
                    <p><strong>Due:</strong> {task.dueDate}</p>
                    <p><strong>Assigned to:</strong> {task.assignedTo}</p>
                    {task.recurrence !== 'none' && (
                      <p><strong>Recurrence:</strong> {task.recurrence}</p>
                    )}
                  </div>
                  <div className="task-actions">
                    <button className="button small">Edit</button>
                    <button className="button small">Move to In Progress</button>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="kanban-column">
            <h2>In Progress</h2>
            {tasks
              .filter(task => task.status === 'in-progress')
              .map(task => (
                <div key={task.id} className={`task-card priority-${task.priority}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className="task-priority">{task.priority}</span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-details">
                    <p><strong>Due:</strong> {task.dueDate}</p>
                    <p><strong>Assigned to:</strong> {task.assignedTo}</p>
                    {task.recurrence !== 'none' && (
                      <p><strong>Recurrence:</strong> {task.recurrence}</p>
                    )}
                  </div>
                  <div className="task-actions">
                    <button className="button small">Edit</button>
                    <button className="button small">Move to Done</button>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="kanban-column">
            <h2>Done</h2>
            {tasks
              .filter(task => task.status === 'done')
              .map(task => (
                <div key={task.id} className={`task-card priority-${task.priority}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className="task-priority">{task.priority}</span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-details">
                    <p><strong>Due:</strong> {task.dueDate}</p>
                    <p><strong>Assigned to:</strong> {task.assignedTo}</p>
                    {task.recurrence !== 'none' && (
                      <p><strong>Recurrence:</strong> {task.recurrence}</p>
                    )}
                  </div>
                  <div className="task-actions">
                    <button className="button small">Edit</button>
                    <button className="button small">Archive</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="calendar-view">
          <h2>Calendar View</h2>
          <p>Calendar implementation placeholder</p>
          <div className="calendar-placeholder">
            {/* Calendar will be implemented here */}
            <p>Tasks will be displayed on a calendar based on their due dates</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
