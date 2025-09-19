// src/AdminUpdateModal.js

import React, { useState } from 'react';

const AdminUpdateModal = ({ complaint, onClose, onUpdate }) => {
  const [status, setStatus] = useState(complaint.status);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(complaint.id, status, assignedTo);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-text-main">Update Complaint</h3>
        <p className="text-sm text-text-light mb-2"><strong>Title:</strong> {complaint.title}</p>
        <p className="text-sm text-text-light mb-4"><strong>Filed by:</strong> {complaint.userEmail}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-text-light">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg">
              <option>Submitted</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-text-light">Assign To (Government Person)</label>
            <input
              type="text"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Staff member name or department"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-text-main">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdateModal;