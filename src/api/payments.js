import axios from "axios";

const API_URL = "https://gamma-loans-backend.vercel.app/api/schedules";

const getPaymentSchedules = async (month, year) => {
  const response = await axios.get(`${API_URL}?month=${month}&year=${year}`);
  return response.data;
};

const carryForwardSchedules = async (month, year) => {
  const response = await axios.post(`${API_URL}/carry`, { month, year });
  return response.data;
};

const markScheduleAsPaid = async (scheduleId, paidAmount) => {
  try {
    const response = await axios.put(`${API_URL}/${scheduleId}/pay`, {
      paidAmount,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.error || "Payment failed");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from server");
    } else {
      // Something happened in setting up the request
      throw new Error("Error setting up payment request");
    }
  }
};

const createPaymentSchedule = async (scheduleData) => {
  const response = await axios.post(API_URL, scheduleData);
  return response.data;
};

export default {
  getPaymentSchedules,
  carryForwardSchedules,
  markScheduleAsPaid,
  createPaymentSchedule,
};
