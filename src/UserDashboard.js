import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import ComplaintForm from './ComplaintForm';
import ComplaintCard from './ComplaintCard';

const UserDashboard = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "complaints"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userComplaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      userComplaints.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setComplaints(userComplaints);
      setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-main">My Dashboard</h1>
          <p className="mt-1 text-text-light">View and manage your complaints here.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          {showForm ? 'Cancel' : '＋ File New Complaint'}
        </button>
      </div>
      {showForm && <ComplaintForm user={user} onComplaintSubmitted={() => setShowForm(false)} />}
      {loading ? <p className="text-center text-text-light">Loading complaints...</p> :
        complaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map(c => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        ) : (
          !showForm && <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-text-main">You haven't filed any complaints yet.</h3>
            <p className="text-text-light mt-2">Click 'File New Complaint' to get started.</p>
          </div>
        )}
    </div>
  );
};
export default UserDashboard;