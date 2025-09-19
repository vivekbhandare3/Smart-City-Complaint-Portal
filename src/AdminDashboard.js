// src/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import ComplaintCard from './ComplaintCard';
import AdminUpdateModal from './AdminUpdateModal';
import { db } from './firebase';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    setLoading(true);
    // This query fetches every document from the "complaints" collection
    const q = query(collection(db, "complaints"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // This function is called from the modal to update the complaint in Firestore
  const handleUpdate = async (id, status, assignedTo) => {
    const complaintRef = doc(db, "complaints", id);
    try {
      await updateDoc(complaintRef, { status, assignedTo });
      setSelectedComplaint(null); // Close the modal on success
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
      {complaints.length === 0 && <p>No complaints found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map(c => (
          <ComplaintCard
            key={c.id}
            complaint={c}
            isAdmin
            // Clicking the card sets it as the 'selectedComplaint' to open the modal
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