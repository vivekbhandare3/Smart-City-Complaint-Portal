import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { StreetlightIcon, PotholeIcon, WasteIcon, WaterIcon, OtherIcon } from './Icons';
import LocationPicker from './LocationPicker';
import imageCompression from 'browser-image-compression';

const ComplaintForm = ({ user, onComplaintSubmitted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { name: 'Streetlight', icon: <StreetlightIcon /> },
    { name: 'Pothole', icon: <PotholeIcon /> },
    { name: 'Waste Management', icon: <WasteIcon /> },
    { name: 'Water Supply', icon: <WaterIcon /> },
    { name: 'Other', icon: <OtherIcon /> },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    setError('');
    setImages(files);
  };

  const uploadImagesInBackground = async (complaintRef, imageFiles, userId) => {
    try {
      for (const imageFile of imageFiles) {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        // --- THIS IS THE CORRECTED LINE ---
        // It now creates a user-specific folder (e.g., complaint-images/USER_ID/filename.jpg)
        const imageStorageRef = ref(storage, `complaint-images/${userId}/${Date.now()}-${compressedFile.name}`);
        
        await uploadBytes(imageStorageRef, compressedFile);
        const downloadURL = await getDownloadURL(imageStorageRef);

        await updateDoc(complaintRef, {
          imageUrls: arrayUnion(downloadURL)
        });
      }
    } catch (err) {
      console.error('Error uploading images in background:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location.address || !category || location.lat === null || location.lng === null) {
      setError('Please fill out all fields, including selecting a location.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const newComplaintRef = await addDoc(collection(db, "complaints"), {
        userId: user.uid,
        userEmail: user.email,
        title,
        description,
        location: location.address,
        locationLat: location.lat,
        locationLng: location.lng,
        category,
        status: 'Submitted',
        createdAt: serverTimestamp(),
        assignedTo: null,
        updates: [],
        imageUrls: [],
      });

      onComplaintSubmitted(); 
      uploadImagesInBackground(newComplaintRef, images, user.uid);

    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Failed to submit complaint. Please check your network connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-text-main mb-6 border-b pb-4">File a New Complaint</h3>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset>
          <legend className="text-lg font-semibold text-text-main mb-4">Step 1: Choose a Category</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200 
                            ${category === cat.name ? 'border-primary bg-green-50 scale-105 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}
              >
                {cat.icon}
                <span className="mt-2 text-sm font-semibold text-text-main">{cat.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-semibold text-text-main mb-4">Step 2: Provide Details</legend>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Streetlight on Main St is out"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="4"
                placeholder="Please provide details like pole numbers, specific location notes, etc."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              ></textarea>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-semibold text-text-main mb-4">Step 3: Set Location</legend>
          <LocationPicker
            value={location}
            onChange={setLocation}
            className="w-full"
          />
        </fieldset>

        <fieldset>
          <legend className="text-lg font-semibold text-text-main mb-4">Step 4: Attach Images (Optional)</legend>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100"
          />
          <p className="text-xs text-text-light mt-2">You can upload up to 5 images.</p>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-101 shadow-lg"
        >
          {submitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;