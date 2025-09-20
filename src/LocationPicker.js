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

// A simple SVG icon for the location button
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const LocationPicker = ({ value, onChange, className }) => {
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default: Center of India
  const [position, setPosition] = useState(null); // Marker position, null initially
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const apiKey = process.env.REACT_APP_GEOAPIFY_API_KEY;

  // Reverse Geocode (lat/lng to address) using Geoapify
  const reverseGeocode = useCallback(async (latLng) => {
    if (!apiKey) return;
    setLoading(true);
    setGeoError('');
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latLng.lat}&lon=${latLng.lng}&apiKey=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Reverse geocoding failed');
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].properties.formatted;
        onChange({ address: address, lat: latLng.lat, lng: latLng.lng });
        setSearchQuery(address);
      } else {
        throw new Error("Could not find address for this location.");
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setGeoError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey, onChange]);

  // Handler for the "Use My Current Location" button
  const handleCurrentLocationClick = () => {
    setGeoError('');
    if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);
                reverseGeocode(newPos); // This will also setLoading(false) and update parent state
            },
            (err) => {
                setLoading(false);
                if (err.code === 1) {
                    setGeoError('Permission denied. Please allow location access in your browser settings.');
                } else {
                    setGeoError('Could not get your location. Please try searching manually.');
                }
                console.warn('Geolocation error:', err);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        setGeoError('Geolocation is not supported by your browser.');
    }
  };


  // Forward Geocoding (search) using Geoapify Autocomplete
  const handleSearch = useCallback(async (query) => {
    if (!apiKey || query.length < 3) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // Handle selecting a search result
  const handleSelectResult = useCallback((result) => {
    const { lat, lon, formatted } = result.properties;
    const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
    setPosition(newPos);
    setSearchQuery(formatted);
    setSearchResults([]);
    onChange({ address: formatted, lat: newPos.lat, lng: newPos.lng });
  }, [onChange]);

  // Debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
        // Only search if the query is different from the already set address
        if(searchQuery && searchQuery !== value.address) {
            handleSearch(searchQuery)
        } else {
            setSearchResults([]);
        }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch, value.address]);

  // Component to handle map interactions
  const MapController = () => {
    const map = useMapEvents({
      click: (e) => {
        const newPos = e.latlng;
        setPosition(newPos);
        reverseGeocode(newPos);
      },
    });

    useEffect(() => {
        if(position) {
            map.flyTo(position, 15); // Animate map to new position
        }
    }, [position, map]);

    return null;
  };
  
  // Draggable Marker Component
  const DraggableMarker = () => {
    const markerRef = React.useRef(null);
    const eventHandlers = React.useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          reverseGeocode(newPos);
        }
      },
    }), [reverseGeocode]);

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    );
  };

  if (!apiKey) {
    return <div className={className + ' p-3 text-red-500 bg-red-50 rounded-lg'}>Geoapify API key is missing. Add REACT_APP_GEOAPIFY_API_KEY to your .env file.</div>;
  }

  return (
    <div className={className}>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
                type="text"
                placeholder="Search for an address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                disabled={loading}
            />
             <button
                type="button"
                onClick={handleCurrentLocationClick}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                <LocationIcon />
                <span>{loading ? 'Locating...' : 'My Location'}</span>
            </button>
        </div>
        
      {searchResults.length > 0 && (
        <ul className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg mb-2 bg-white z-10 shadow-md">
          {searchResults.map((result) => (
            <li
              key={result.properties.place_id}
              onClick={() => handleSelectResult(result)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {result.properties.formatted}
            </li>
          ))}
        </ul>
      )}

      {geoError && <p className="text-sm text-red-600 mb-2">{geoError}</p>}

      <div className="h-[250px] w-full rounded-lg mb-2 z-0 bg-gray-200 text-gray-500 flex items-center justify-center overflow-hidden">
        <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
        >
            <TileLayer
            url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${apiKey}`}
            attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            />
            {position && <DraggableMarker />}
            <MapController />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;
