import React, { useState } from 'react';
import { StreetlightIcon, PotholeIcon, WasteIcon, WaterIcon, OtherIcon } from './Icons';

const ComplaintCard = ({ complaint, onCardClick, isAdmin = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUpdates, setShowUpdates] = useState(false);

  const statusStyles = {
    Submitted: {
      border: 'border-l-status-submitted',
      bg: 'bg-red-50',
      text: 'text-status-submitted'
    },
    'In Progress': {
      border: 'border-l-status-progress',
      bg: 'bg-amber-50',
      text: 'text-status-progress'
    },
    Resolved: {
      border: 'border-l-status-resolved',
      bg: 'bg-green-50',
      text: 'text-status-resolved'
    },
  };

  const currentStatus = statusStyles[complaint.status] || { border: 'border-l-gray-400', bg: 'bg-gray-50', text: 'text-gray-500' };

  const categoryIcons = {
    Streetlight: <StreetlightIcon />, Pothole: <PotholeIcon />, 'Waste Management': <WasteIcon />,
    'Water Supply': <WaterIcon />, Other: <OtherIcon />,
  };

  const ImagePreviewModal = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
      <img src={imageUrl} alt="Complaint full size" className="max-w-[90vw] max-h-[90vh] rounded-lg" loading="lazy" />
    </div>
  );

  return (
    <>
      <div 
        onClick={isAdmin ? onCardClick : undefined} 
        className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-l-4 ${currentStatus.border} ${isAdmin ? 'cursor-pointer' : ''}`}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                {categoryIcons[complaint.category] || <OtherIcon />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-lg text-text-main leading-tight truncate" title={complaint.title}>{complaint.title}</p>
                <p className="text-sm text-text-light truncate">{complaint.location}</p>
              </div>
            </div>
            <span className={`text-xs ml-2 font-bold whitespace-nowrap px-2 py-1 rounded-full ${currentStatus.bg} ${currentStatus.text}`}>{complaint.status}</span>
          </div>

          <p className="text-text-light text-sm my-4 break-words">{complaint.description}</p>
          
          {complaint.imageUrls && complaint.imageUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-text-light mb-2 uppercase tracking-wider">Attached Images:</p>
              <div className="flex space-x-2">
                {complaint.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Complaint attachment ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity border"
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(url); }} loading="lazy" />
                ))}
              </div>
            </div>
          )}

          {complaint.updates && complaint.updates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowUpdates(!showUpdates); }}
                className="text-sm text-primary hover:underline font-semibold w-full text-left"
              >
                {showUpdates ? '▾ Hide Updates' : `▸ View Updates (${complaint.updates.length})`}
              </button>
              {showUpdates && (
                <div className="mt-3 space-y-3 text-sm text-text-light">
                  {complaint.updates.slice().reverse().map((update, idx) => (
                    <div key={idx} className={`p-3 rounded-md ${currentStatus.bg}`}>
                      <p className="font-semibold text-text-main flex justify-between items-center text-xs">
                        <span>Update by {update.by}</span>
                        <span className="font-normal text-text-light">
                          {new Date(update.timestamp?.toDate ? update.timestamp.toDate() : update.timestamp).toLocaleString()}
                        </span>
                      </p>
                      <p className="mt-1 text-sm">{update.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={`bg-gray-50 px-5 py-3 border-t text-xs text-text-light`}>
          <div className="flex justify-between items-center">
             <p>Filed on: {complaint.createdAt ? new Date(complaint.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
             {complaint.assignedTo && <p>Assigned: <span className="font-semibold text-text-main">{complaint.assignedTo}</span></p>}
          </div>
          {isAdmin && <p className="font-semibold truncate text-text-main pt-1">Filed by: {complaint.userEmail}</p>}
        </div>
      </div>
      {selectedImage && <ImagePreviewModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </>
  );
};

export default ComplaintCard;