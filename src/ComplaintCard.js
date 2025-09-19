import React, { useState } from 'react';
import { StreetlightIcon, PotholeIcon, WasteIcon, WaterIcon, OtherIcon } from './Icons';

const ComplaintCard = ({ complaint, onCardClick, isAdmin = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUpdates, setShowUpdates] = useState(false);

  const statusStyles = {
    Submitted: 'bg-red-100 text-red-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Resolved: 'bg-green-100 text-green-800',
  };

  const categoryIcons = {
    Streetlight: <StreetlightIcon />, Pothole: <PotholeIcon />, 'Waste Management': <WasteIcon />,
    'Water Supply': <WaterIcon />, Other: <OtherIcon />,
  };

  const ImagePreviewModal = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
      <img src={imageUrl} alt="Complaint full size" className="max-w-[90vw] max-h-[90vh]" loading="lazy" />
    </div>
  );

  return (
    <>
      <div onClick={isAdmin ? onCardClick : undefined} className={`bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 ${isAdmin ? 'cursor-pointer' : ''}`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-12 h-12 flex-shrink-0 mr-4">{categoryIcons[complaint.category] || <OtherIcon />}</div>
              <div className="min-w-0">
                <p className="font-bold text-lg text-text-main leading-tight truncate">{complaint.title}</p>
                <p className="text-sm text-text-light truncate">{complaint.location}</p>
              </div>
            </div>
            <span className={`text-xs ml-2 font-bold px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[complaint.status]}`}>{complaint.status}</span>
          </div>
          <p className="text-text-light text-sm my-4 break-words">{complaint.description}</p>
          {complaint.imageUrls && complaint.imageUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-text-light mb-2">Attached Images:</p>
              <div className="flex space-x-2">
                {complaint.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Complaint attachment ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(url); }} loading="lazy" />
                ))}
              </div>
            </div>
          )}
          {complaint.updates && complaint.updates.length > 0 && (
            <div className="mt-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowUpdates(!showUpdates); }}
                className="text-sm text-blue-600 hover:underline"
              >
                {showUpdates ? 'Hide Updates' : `View Updates (${complaint.updates.length})`}
              </button>
              {showUpdates && (
                <ul className="mt-2 space-y-2 text-sm text-text-light">
                  {complaint.updates.map((update, idx) => (
                    <li key={idx} className="border-t pt-2">
                      <p><strong>By {update.by} on {new Date(update.timestamp?.toDate()).toLocaleString()}:</strong></p>
                      <p>{update.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 text-xs text-text-light">
          {isAdmin && <p className="font-semibold mb-1 text-text-main truncate">Filed by: {complaint.userEmail}</p>}
          <p>Filed on: {complaint.createdAt ? new Date(complaint.createdAt.toDate()).toLocaleString() : 'N/A'}</p>
          {complaint.assignedTo && <p>Assigned to: <span className="font-semibold text-text-main">{complaint.assignedTo}</span></p>}
        </div>
      </div>
      {selectedImage && <ImagePreviewModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </>
  );
};

export default ComplaintCard;