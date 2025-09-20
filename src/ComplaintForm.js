import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
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

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    setImages(files);
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
      const compressionOptions = {
        maxSizeMB: 0.15, // Compress each image to be under 150KB
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      const imageProcessingPromises = images.map(async (file) => {
        const compressedFile = await imageCompression(file, compressionOptions);
        return await convertFileToBase64(compressedFile);
      });
      
      const base64Images = await Promise.all(imageProcessingPromises);

      await addDoc(collection(db, "complaints"), {
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
        imageUrls: base64Images,
      });

      onComplaintSubmitted();
      setTitle('');
      setDescription('');
      setLocation({ address: '', lat: null, lng: null });
      setCategory('');
      setImages([]);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Failed to submit complaint. The images may be too large or there was a network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-text-main mb-6">File a New Complaint</h3>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-text-light mb-3">1. Select a Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all duration-200 
                            ${category === cat.name ? 'border-primary bg-blue-50 scale-105 shadow-lg' : 'border-gray-200 hover:border-blue-400 hover:shadow-md'}`}
              >
                {cat.icon}
                <span className="mt-2 text-sm font-semibold text-text-main">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-text-light mb-2">2. Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Streetlight is constantly flickering"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-light mb-2">3. Location</label>
            <LocationPicker
              value={location}
              onChange={setLocation}
              className="w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-text-light mb-2">4. Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
            placeholder="Please provide as much detail as possible..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-text-light mb-2">5. Attach Images (optional, max 5)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-gray-400 transform hover:scale-101"
        >
          {submitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;