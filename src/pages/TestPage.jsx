import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const TestPage = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("User not authenticated. Please log in.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const loansResponse = await axios.get("/api/admin/loans", { headers });

        setLoans(loansResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleApproval = async (id, status) => {
    await axios.put(
      `/api/admin/loan/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setLoans(
      loans.map((loan) => (loan._id === id ? { ...loan, status } : loan))
    );
  };

  const handlePay = async (id) => {
    await axios.put(
      `/api/admin/loan/repay/${id}`,
      { isPaid: true },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setLoans(
      loans.map((loan) => (loan._id === id ? { ...loan, isPaid: true } : loan))
    );
  };

  const renderLoanItem = (loan) => (
    <div
      key={loan._id}
      className="p-4 bg-gray-800 rounded-lg shadow-md text-white"
    >
      <div className="flex flex-col gap-2">
        <span>User: {loan.user.name}</span>
        <span>Mobile: {loan.user.mobile}</span>
        <span>Alternate Mobile: {loan.user.alternatemobile}</span>
        <span>Loan Amount: {loan.totalLoan}</span>
        <span>Principal Amount: {loan.amount}</span>
        <span>Status: {loan.status}</span>
        <span>Payment Status: {loan.isPaid ? "Paid" : "In Progress"}</span>
      </div>
      {loan.status === "pending" && loan.user.photoURLFront && (
        <div className="mt-2">
          <Link to={loan.user.photoURLFront} target="_blank">
            <img
              src={loan.user.photoURLFront}
              alt="ID Front"
              className="w-48 h-auto rounded"
            />
          </Link>
        </div>
      )}
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => handleApproval(loan._id, "approved")}
          className="bg-green-500 hover:bg-green-700 text-white p-2 rounded"
        >
          Approve
        </button>
        <button
          onClick={() => handleApproval(loan._id, "rejected")}
          className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
        >
          Reject
        </button>
        <button
          onClick={() => handlePay(loan._id)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded"
        >
          Mark as Paid
        </button>
      </div>
    </div>
  );

  const groupedLoans = {
    pending: loans.filter((loan) => loan.status === "pending"),
    approved: loans.filter((loan) => loan.status === "approved"),
    rejected: loans.filter((loan) => loan.status === "rejected"),
  };

  return (
    <section className="max-w-6xl mx-auto p-4 text-white">
      <header className="mb-6">
        <Link to={"/admin/edit"} className="text-blue-400 underline">
          Edit Admin Details
        </Link>
        <h1 className="text-3xl font-bold mt-4">Admin Dashboard</h1>
      </header>
      {Object.entries(groupedLoans).map(([status, loans]) => (
        <div key={status} className="mb-8">
          <h2 className="text-2xl font-semibold capitalize mb-4">
            {status} Loans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.length > 0 ? (
              loans.map((loan) => renderLoanItem(loan))
            ) : (
              <p>No loans in this category</p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default TestPage;
