import axios from "axios";

const API_URL = "https://gamma-loans-backend.vercel.app/api/locations";

// Get all locations
const getLocations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Create new location
const createLocation = async (locationData) => {
  const response = await axios.post(API_URL, locationData);
  return response.data;
};

// update location
const updateLocation = async (locationId, locationData) => {
  const response = await axios.put(`${API_URL}/${locationId}`, locationData);
  return response.data;
};

// Delete location
const deleteLocation = async (locationId) => {
  const response = await axios.delete(`${API_URL}/${locationId}`);
  return response.data;
};

const locationService = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};

export default locationService;
