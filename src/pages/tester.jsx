import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv"; // For CSV export
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import dayjs from "dayjs"; // For working with dates
import Select from "react-select"; // For searchable dropdowns
import ReactPaginate from "react-paginate"; // For pagination

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, LineElement);

const AdminDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeMonth, setActiveMonth] = useState(dayjs().format("YYYY-MM"));
  const [statusMessage, setStatusMessage] = useState("");
  const [perPage] = useState(10); // Pagination per page
  const [pageNumber, setPageNumber] = useState(0);

  // Fetch loans on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatusMessage("User not authenticated. Please log in.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const loansResponse = await axios.get("/api/admin/loans", { headers });

        setLoans(loansResponse.data);
        setStatusMessage("Loans fetched successfully.");
      } catch (err) {
        setStatusMessage("Error fetching data. Please try again later.");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Handle loan approval, rejection, or marking as paid
  const handleApproval = async (id, status) => {
    try {
      await axios.put(
        `/api/admin/loan/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLoans(
        loans.map((loan) => (loan._id === id ? { ...loan, status } : loan))
      );
      setStatusMessage(
        `Loan ${status === "approved" ? "approved" : "rejected"} successfully.`
      );
    } catch (error) {
      setStatusMessage("Error updating loan. Please try again.");
      console.error(error);
    }
  };

  // Mark loan as paid
  const handleMarkPaid = async (id) => {
    try {
      await axios.put(
        `/api/admin/loan/${id}`,
        { isPaid: true },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLoans(
        loans.map((loan) =>
          loan._id === id ? { ...loan, isPaid: true } : loan
        )
      );
      setStatusMessage("Loan marked as paid successfully.");
    } catch (error) {
      setStatusMessage("Error marking loan as paid. Please try again.");
      console.error(error);
    }
  };

  // Handle CSV export data preparation
  const handleExport = () =>
    loans.map(({ _id, user, amount, status, isPaid }) => ({
      LoanID: _id,
      UserName: user.name,
      Mobile: user.mobile,
      Amount: amount,
      Status: status,
      PaymentStatus: isPaid ? "Paid" : "In Progress",
    }));

  // Filtered and searched loans
  const filteredLoans = loans.filter((loan) =>
    filterStatus === "all"
      ? true
      : loan.status === filterStatus || (filterStatus === "paid" && loan.isPaid)
  );
  const displayedLoans = filteredLoans.filter((loan) =>
    loan.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group loans by month (using the loan created date)
  const groupedLoansByMonth = loans.reduce((acc, loan) => {
    const loanMonth = dayjs(loan.createdAt).format("YYYY-MM");
    if (!acc[loanMonth]) acc[loanMonth] = [];
    acc[loanMonth].push(loan);
    return acc;
  }, {});

  // Pagination data for loans
  const loansPerPage = displayedLoans.slice(
    pageNumber * perPage,
    (pageNumber + 1) * perPage
  );
  const pageCount = Math.ceil(displayedLoans.length / perPage);

  // Pie chart data for overview
  const loanStatuses = ["pending", "approved", "paid"];
  const loanStatusCounts = loanStatuses.map(
    (status) =>
      loans.filter(
        (loan) => loan.status === status || (status === "paid" && loan.isPaid)
      ).length
  );

  const chartData = {
    labels: ["Pending", "Approved", "Paid"],
    datasets: [
      {
        label: "Loan Status",
        data: loanStatusCounts,
        backgroundColor: ["#FBBF24", "#10B981", "#3B82F6"],
      },
    ],
  };

  // Bar chart for loan amounts by month
  const loanAmountsByMonth = Object.entries(groupedLoansByMonth).map(
    ([month, loans]) => ({
      month,
      totalAmount: loans.reduce((total, loan) => total + loan.amount, 0),
    })
  );

  const barChartData = {
    labels: loanAmountsByMonth.map((item) => item.month),
    datasets: [
      {
        label: "Loan Amounts",
        data: loanAmountsByMonth.map((item) => item.totalAmount),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Menu */}
      <aside className="w-64 bg-gray-900 text-white h-full flex-shrink-0">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-blue-500">Admin Dashboard</h1>
        </div>
        <nav className="mt-10 space-y-4">
          <button
            onClick={() => setActiveSection("overview")}
            className={`block w-full text-left px-6 py-3 ${
              activeSection === "overview" ? "bg-gray-800" : "hover:bg-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection("loans")}
            className={`block w-full text-left px-6 py-3 ${
              activeSection === "loans" ? "bg-gray-800" : "hover:bg-gray-700"
            }`}
          >
            Loans
          </button>
          <button
            onClick={() => setActiveSection("transactions")}
            className={`block w-full text-left px-6 py-3 ${
              activeSection === "transactions"
                ? "bg-gray-800"
                : "hover:bg-gray-700"
            }`}
          >
            Transactions
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div>{statusMessage && <div>{statusMessage}</div>}</div>
        {/* Overview Section */}
        {activeSection === "overview" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">
                  Total Loans
                </h3>
                <p className="text-2xl font-bold text-blue-500">
                  {loans.length}
                </p>
              </div>
              <Pie data={chartData} />
            </div>
            <div>
              <Bar data={barChartData} />
            </div>
          </section>
        )}

        {/* Loans Section */}
        {activeSection === "loans" && (
          <section>
            <div className="flex justify-between mb-6">
              <input
                type="text"
                placeholder="Search by user or loan ID..."
                className="p-3 border rounded w-1/3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="p-3 border rounded"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Monthly Tab */}
            <div className="mb-4">
              {Object.keys(groupedLoansByMonth).map((month) => (
                <button
                  key={month}
                  className={`px-4 py-2 rounded ${
                    activeMonth === month ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  onClick={() => setActiveMonth(month)}
                >
                  {dayjs(month).format("MMMM YYYY")}
                </button>
              ))}
            </div>

            {/* Loans by Month */}
            <div className="overflow-auto">
              {groupedLoansByMonth[activeMonth]?.map((loan) => (
                <div
                  key={loan._id}
                  className="bg-white p-4 rounded-lg shadow-md mb-4"
                >
                  <h3 className="text-lg font-semibold">Loan ID: {loan._id}</h3>
                  <p>User: {loan.user.name}</p>
                  <p>Amount: {loan.amount}</p>
                  <p>Status: {loan.status}</p>
                  <div className="flex gap-2 mt-2">
                    {loan.status === "approved" && !loan.isPaid && (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => handleMarkPaid(loan._id)}
                      >
                        Mark as Paid
                      </button>
                    )}
                    {loan.isPaid && (
                      <span className="text-green-500">Paid</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={(data) => setPageNumber(data.selected)}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
