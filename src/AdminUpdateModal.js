import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const AdminUpdateModal = ({ complaint, onClose, onUpdate }) => {
  const [status, setStatus] = useState(complaint.status);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || '');
  const [updateMessage, setUpdateMessage] = useState('');
  const [admins, setAdmins] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "admins"), (snapshot) => {
      setAdmins(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(complaint.id, status, assignedTo, updateMessage);
    setUpdateMessage('');
  };

  const ImagePreviewModal = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
      <img src={imageUrl} alt="Complaint full size" className="max-w-[90vw] max-h-[90vh]" loading="lazy" />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4" onClick={onClose}>
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4 text-text-main">Update Complaint: {complaint.title}</h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
             <h4 className="font-bold text-md text-text-main mb-3">Complaint Details</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p><strong>Filed by:</strong> {complaint.userEmail}</p>
                <p><strong>Filed on:</strong> {complaint.createdAt ? new Date(complaint.createdAt.toDate()).toLocaleString() : 'N/A'}</p>
                <p className="col-span-full"><strong>Location:</strong> {complaint.location}</p>
                <p className="col-span-full pt-2"><strong>Description:</strong> {complaint.description}</p>
             </div>
          </div>

          {complaint.imageUrls && complaint.imageUrls.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-md text-text-main mb-2">Attached Images</h4>
              <div className="flex flex-wrap gap-2">
                {complaint.imageUrls.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Complaint attachment ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity border"
                    onClick={() => setSelectedImage(url)} 
                    loading="lazy" 
                  />
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
             <h4 className="font-bold text-md text-text-main mb-2">Update Status & Assignment</h4>
            <div>
              <label className="block font-semibold mb-1 text-text-light">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border bg-gray-50 border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary">
                <option>Submitted</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-text-light">Assign To</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full border bg-gray-50 border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary">
                <option value="">Unassigned</option>
                {admins.map((admin, idx) => (
                  <option key={idx} value={`${admin.fullName || 'Unnamed'} (${admin.department})`}>
                    {admin.fullName || 'Unnamed'} ({admin.department}) - {admin.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-text-light">Add Update (optional)</label>
              <textarea
                value={updateMessage}
                onChange={e => setUpdateMessage(e.target.value)}
                rows="3"
                className="w-full border bg-gray-50 border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., Site inspected, repair scheduled for tomorrow."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-text-main">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold">Update</button>
            </div>
          </form>
        </div>
      </div>
      {selectedImage && <ImagePreviewModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </>
  );
};

export default AdminUpdateModal;