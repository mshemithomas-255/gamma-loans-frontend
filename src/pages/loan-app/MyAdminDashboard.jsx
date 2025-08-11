import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Loans from "../../components/AdminLoans";
import Users from "../../components/AdminUsers";
import GarbageCollectionList from "../../components/GarbageCollectionList";
import AdminTransportRequests from "../../components/AdminTransportRequests";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalBorrowed: 0,
    totalUsers: 0,
    totalInterest: 0,
  });
  const [loans, setLoans] = useState([]);
  // const [activityLogs, setActivityLogs] = useState([]);
  // const [loanStats, setLoanStats] = useState({
  //   approved: 0,
  //   pending: 0,
  //   fullyPaid: 0,
  // });
  const [users, setUsers] = useState([]);
  // const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({ username: "", password: "" });

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/admin/summary",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch summary data.");
    }
  };

  // Fetch all loans
  const fetchLoans = async () => {
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/admin/loans",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch loans.");
    }
  };

  // Fetch activity logs
  // const fetchActivityLogs = async () => {
  //   try {
  //     const response = await fetch(
  //       "https://gamma-loans-backend.vercel.app/api/admin/activity-logs",
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );
  //     const data = await response.json();
  //     setActivityLogs(data);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to fetch activity logs.");
  //   }
  // };

  // Fetch loan statistics
  // const fetchLoanStats = async () => {
  //   try {
  //     const response = await fetch(
  //       "https://gamma-loans-backend.vercel.app/api/admin/loan-stats",
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );
  //     const data = await response.json();
  //     setLoanStats(data);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to fetch loan statistics.");
  //   }
  // };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/admin/users",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users.");
    }
  };

  // Fetch notifications
  // const fetchNotifications = async () => {
  //   try {
  //     const response = await fetch(
  //       "https://gamma-loans-backend.vercel.app/api/admin/notifications",
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );
  //     const data = await response.json();
  //     setNotifications(data);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to fetch notifications.");
  //   }
  // };

  // Update admin credentials
  const updateCredentials = async () => {
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/admin/update-credentials",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );
      if (response.ok) {
        toast.success("Credentials updated successfully.");
      } else {
        toast.error("Failed to update credentials.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update credentials.");
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchLoans();
    // fetchActivityLogs();
    // fetchLoanStats();
    fetchUsers();
    // fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <h1 className="text-3xl font-bold mb-6">
        Welcome to the Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Borrowed</h2>
          <p className="text-2xl">Ksh {summary.totalBorrowed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-2xl">{summary.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Interest</h2>
          <p className="text-2xl">Ksh {summary.totalInterest}</p>
        </div>
      </div>

      {/* Loan Statistics */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Loan Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Approved Loans</h3>
            <p className="text-2xl">{loanStats.approved}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Pending Loans</h3>
            <p className="text-2xl">{loanStats.pending}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Fully Paid Loans</h3>
            <p className="text-2xl">{loanStats.fullyPaid}</p>
          </div>
        </div>
      </div> */}

      {/* Loans Table */}
      <Loans
        loans={loans}
        fetchLoans={fetchLoans}
        // fetchLoanStats={fetchLoanStats}
      />

      {/* User Activity Logs */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log) => (
              <tr key={log._id} className="border-b">
                <td className="px-4 py-2">{log.userId?.fullName}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* User Management */}
      <div className="bg-gray-200 p-6 rounded-lg shadow-md mb-6">
        <Users users={users} fetchUsers={fetchUsers} />
      </div>

      {/* Notifications */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <ul>
          {notifications.map((notification) => (
            <li key={notification._id} className="border-b py-2">
              <p>{notification.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div> */}

      {/* Garbage collection Requests */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Garbage Collection Summary
        </h2>
        <div className="space-y-4">
          <GarbageCollectionList />
        </div>
      </div> */}

      {/* Transport Requests */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <AdminTransportRequests />
      </div> */}

      {/* Settings Tab */}
      <div className="bg-gray-300 p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) =>
                setSettings({ ...settings, username: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={settings.password}
              onChange={(e) =>
                setSettings({ ...settings, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={updateCredentials}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Update Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
