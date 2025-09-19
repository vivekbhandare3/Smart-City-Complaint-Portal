import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons in Leaflet (required for React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationPicker = ({ value, onChange, className }) => {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default: San Francisco
  const [position, setPosition] = useState(center); // Marker position
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.REACT_APP_LOCATIONIQ_API_KEY;
  const baseUrl = 'https://us1.locationiq.com/v1'; // Change to 'eu1' if needed

  // Reverse Geocode (lat/lng to address)
  const reverseGeocode = useCallback(async (latLng) => {
    if (!apiKey) return; // Early return if no API key
    setLoading(true);
    try {
      const url = `${baseUrl}/reverse.php?key=${apiKey}&lat=${latLng.lat}&lon=${latLng.lng}&format=json&addressdetails=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Reverse geocoding failed');
      const data = await res.json();
      if (data && data.display_name) {
        onChange({ address: data.display_name, lat: latLng.lat, lng: latLng.lng });
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiKey, baseUrl, onChange]);

  // Option 1: Auto-fetch current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(newPos);
          setPosition(newPos);
          await reverseGeocode(newPos);
        },
        (err) => console.warn('Geolocation denied:', err),
        { enableHighAccuracy: true }
      );
    }
  }, [reverseGeocode]); // Added reverseGeocode to deps

  // Option 3: Forward Geocoding (search)
  const handleSearch = useCallback(async (query) => {
    if (!apiKey || query.length < 3) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const url = `${baseUrl}/search.php?key=${apiKey}&q=${encodeURIComponent(query)}&format=json&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey, baseUrl]);

  const handleSelectResult = useCallback((result) => {
    const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setCenter(newPos);
    setPosition(newPos);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    onChange({ address: result.display_name, lat: newPos.lat, lng: newPos.lng });
  }, [onChange]);

  // "Use Current Location" button handler
  const handleCurrentLocation = useCallback(async () => {
    if (!apiKey || !navigator.geolocation) return;
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(newPos);
      setPosition(newPos);
      await reverseGeocode(newPos);
    } catch (err) {
      console.warn('Geolocation error:', err);
    }
  }, [apiKey, reverseGeocode]);

  // Debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Update from prop
  useEffect(() => {
    if (value.lat && value.lng) {
      setCenter({ lat: value.lat, lng: value.lng });
      setPosition({ lat: value.lat, lng: value.lng });
    }
  }, [value]);

  // Option 2: Draggable marker events
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const newPos = e.latlng;
        setPosition(newPos);
        reverseGeocode(newPos);
      },
      dragend: () => reverseGeocode(position), // On marker drag end
    });
    return null;
  };

  // Render error if no API key
  if (!apiKey) {
    return <div className={className + ' p-3 text-red-500'}>LocationIQ API key missing. Add REACT_APP_LOCATIONIQ_API_KEY to .env.</div>;
  }

  return (
    <div className={className}>
      {/* Option 3: Manual Search Input */}
      <input
        type="text"
        placeholder="Search for address or location..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg mb-2"
        disabled={loading}
      />
      {searchResults.length > 0 && (
        <ul className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg mb-2 bg-white">
          {searchResults.map((result, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectResult(result)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Option 2: Interactive Map */}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '200px', width: '100%' }}
        className="rounded-lg mb-2"
      >
        <TileLayer
          url={`https://tiles.locationiq.com/v3/leaflet/{z}/{x}/{y}.png?key=${apiKey}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://locationiq.com">LocationIQ</a>'
        />
        <Marker position={position} draggable>
          <MapEvents />
        </Marker>
      </MapContainer>

      {/* Display Selected Address */}
      {value.address && (
        <p className="text-sm text-gray-600 mt-1">Selected: {value.address}</p>
      )}

      {/* Option 1: Use Current Location Button */}
      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={loading}
        className="text-xs text-blue-600 underline mt-1 hover:text-blue-800"
      >
        {loading ? 'Loading...' : 'Use Current Location (GPS)'}
      </button>
    </div>
  );
};

export default LocationPicker;