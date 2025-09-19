import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { StreetlightIcon, PotholeIcon, WasteIcon, WaterIcon, OtherIcon } from './Icons';
import LocationPicker from './LocationPicker';

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

  // NEW: Cloudinary upload function (unsigned preset; create 'complaints' preset in Cloudinary Dashboard)
  const uploadToCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'complaints'); // Unsigned preset name (set in Cloudinary settings)
    formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
    formData.append('folder', 'complaints'); // Optional: Organize in folder
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.secure_url; // Returns secure HTTPS URL
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location.address || !category || location.lat === null || location.lng === null) {
      setError('Please fill out all fields, including selecting a location.');
      return;
    }
    if (images.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    for (const image of images) {
      if (image.size > 10 * 1024 * 1024) { // Cloudinary free tier: 10MB
        setError('Each image must be under 10MB.');
        return;
      }
    }
    setSubmitting(true);
    setError('');
    try {
      const docRef = await addDoc(collection(db, "complaints"), {
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
        imageUrls: []
      });

      let imageUrls = [];
      if (images.length > 0) {
        const uploadPromises = images.map(async (image) => await uploadToCloudinary(image));
        imageUrls = await Promise.all(uploadPromises);
        await updateDoc(docRef, { imageUrls });
      }

      onComplaintSubmitted();
      setTitle('');
      setDescription('');
      setLocation({ address: '', lat: null, lng: null });
      setCategory('');
      setImages([]);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Failed to submit complaint. ' + (err.message.includes('Upload failed') ? 'Image upload failed, but complaint saved without images.' : ''));
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
          <label className="block text-sm font-bold text-text-light mb-2">5. Attach Images (optional, max 5, under 10MB each)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setImages(Array.from(e.target.files))}
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