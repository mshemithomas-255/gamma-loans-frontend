import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const AdminTransportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Fetch all transport requests
  const fetchTransportRequests = async () => {
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/transport/all-requests",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Handle 401 Unauthorized error
      if (response.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        return;
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error("Failed to fetch transport requests.");
      }

      const data = await response.json();

      setRequests(data);
    } catch (error) {
      console.error("Error fetching transport requests:", error);
      setError("Failed to fetch transport requests. Please try again later.");
      toast.error("Failed to fetch transport requests.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Update transport request status
  const updateRequestStatus = async (id, status) => {
    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/transport/request/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        toast.success("Transport request updated successfully.");
        fetchTransportRequests(); // Refresh the list
      } else {
        throw new Error("Failed to update transport request.");
      }
    } catch (error) {
      console.error("Error updating transport request:", error);
      toast.error("Failed to update transport request.");
    }
  };

  useEffect(() => {
    fetchTransportRequests();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Transport Requests</h2>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* No Requests Message */}
      {!loading && !error && requests.length === 0 && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          No transport requests found.
        </div>
      )}

      {/* Table */}
      {!loading && !error && requests.length > 0 && (
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Pickup Location</th>
              <th className="px-4 py-2 text-left">Destination</th>
              <th className="px-4 py-2 text-left">Item Description</th>
              <th className="px-4 py-2 text-left">Date & Time</th>
              <th className="px-4 py-2 text-left">Contact Info</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-b">
                <td className="px-4 py-2">{request.pickupLocation}</td>
                <td className="px-4 py-2">{request.destination}</td>
                <td className="px-4 py-2">{request.itemDescription}</td>
                <td className="px-4 py-2">
                  {new Date(request.dateTime).toLocaleString()}
                </td>
                <td className="px-4 py-2">{request.contactInfo}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-md text-sm ${
                      request.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {request.status === "pending" && (
                    <button
                      onClick={() =>
                        updateRequestStatus(request._id, "Completed")
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                    >
                      Mark as Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTransportRequests;
