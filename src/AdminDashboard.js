import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { arrayUnion, serverTimestamp } from './firebase';
import ComplaintCard from './ComplaintCard';
import AdminUpdateModal from './AdminUpdateModal';
import { db } from './firebase';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "complaints"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setComplaints(data);
      setFilteredComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = complaints;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(lowerTerm) ||
        c.description.toLowerCase().includes(lowerTerm) ||
        c.location.toLowerCase().includes(lowerTerm)
      );
    }
    if (statusFilter !== 'All') filtered = filtered.filter(c => c.status === statusFilter);
    if (categoryFilter !== 'All') filtered = filtered.filter(c => c.category === categoryFilter);
    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, categoryFilter, complaints]);

  const handleUpdate = async (id, status, assignedTo, newUpdate) => {
    const complaintRef = doc(db, "complaints", id);
    try {
      const updateData = { status, assignedTo };
      if (newUpdate) {
        updateData.updates = arrayUnion({ ...newUpdate, timestamp: serverTimestamp() });
      }
      await updateDoc(complaintRef, updateData);
      setSelectedComplaint(null);
    } catch (err) {
      console.error("Error updating complaint:", err);
    }
  };

  if (loading) return <p className="text-center text-text-light">Loading all complaints...</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">Admin Dashboard</h1>
        <p className="mt-1 text-text-light">View and manage all user-submitted complaints.</p>
      </div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title, description, or location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg">
          <option>All Statuses</option>
          <option>Submitted</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg">
          <option>All Categories</option>
          <option>Streetlight</option>
          <option>Pothole</option>
          <option>Waste Management</option>
          <option>Water Supply</option>
          <option>Other</option>
        </select>
      </div>
      {filteredComplaints.length === 0 && <p>No complaints found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.map(c => (
          <ComplaintCard
            key={c.id}
            complaint={c}
            isAdmin
            onCardClick={() => setSelectedComplaint(c)}
          />
        ))}
      </div>
      {selectedComplaint && (
        <AdminUpdateModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;