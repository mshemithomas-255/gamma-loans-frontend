import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("User not authenticated. Please log in.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const loansResponse = await axios.get("/api/admin/loans", { headers });

        setLoans(loansResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleApproval = async (id, status) => {
    await fetch(`/api/admin/loan/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    });
    setLoans(
      loans.map((loan) => (loan._id === id ? { ...loan, status } : loan))
    );
  };

  const handlePay = async (id) => {
    await fetch(`/api/admin/loan/repay/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ isPaid: true }),
    });
    setLoans(
      loans.map((loan) => (loan._id === id ? { ...loan, isPaid: true } : loan))
    );
  };

  const sortedLoans = [...loans].sort((a, b) =>
    a.status.localeCompare(b.status)
  );

  const loansByMonth = sortedLoans.reduce((acc, loan) => {
    const month = new Date(loan.createdAt).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    acc[month] = acc[month] || [];
    acc[month].push(loan);
    return acc;
  }, {});

  return (
    <section className="max-w-7xl mx-auto p-6 text-white">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-500">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Manage loans efficiently by approving, rejecting, or marking payments.
        </p>
      </header>

      {Object.entries(loansByMonth).map(([month, loans]) => (
        <div key={month} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">{month}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => (
              <div
                key={loan._id}
                className="p-4 border rounded-lg bg-gray-800 hover:bg-gray-700 transition-shadow shadow-lg"
              >
                {loan.status === "pending" && (
                  <Link to={loan.user.photoURLFront} target="_blank">
                    <img
                      src={loan.user.photoURLFront}
                      alt="ID Front"
                      className="w-full h-40 object-cover mb-4 rounded"
                    />
                  </Link>
                )}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-300">
                    {loan.user.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Mobile: {loan.user.mobile}
                  </p>
                  <p className="text-sm text-gray-400">
                    Alt Mobile: {loan.user.alternatemobile}
                  </p>
                  <p className="text-sm text-gray-400">
                    Loan Amount: Ksh: {loan.totalLoan}
                  </p>
                  <p className="text-sm text-gray-400">
                    Principal Amount: Ksh: {loan.amount}
                  </p>
                  <p className="text-sm text-gray-400">Status: {loan.status}</p>
                  <p className="text-sm text-gray-400">
                    Payment Status: {loan.isPaid ? "Paid" : "In Progress"}
                  </p>
                </div>
                <div className="flex gap-3 mt-3">
                  {loan.status !== "approved" && (
                    <>
                      <button
                        onClick={() => handleApproval(loan._id, "approved")}
                        className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(loan._id, "rejected")}
                        className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {!loan.isPaid && (
                    <button
                      className="bg-blue-500 px-4 py-2 text-white rounded shadow hover:bg-blue-600"
                      onClick={() => handlePay(loan._id)}
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default AdminDashboard;
