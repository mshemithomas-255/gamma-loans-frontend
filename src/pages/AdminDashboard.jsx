import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import ReactPaginate from "react-paginate";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale
);

const AdminDashboard = () => {
  // State Variables
  const [loans, setLoans] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const perPage = 10; // Fixed value, no need for useState

  // Fetch Data
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatusMessage("User not authenticated. Please log in.");
          return;
        }

        const { data } = await axios.get("/api/admin/loans", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLoans(data);
        setStatusMessage("Loans fetched successfully.");
      } catch (error) {
        setStatusMessage("Error fetching data. Please try again later.");
        console.error(error);
      }
    };

    fetchLoans();
  }, []);

  // Update Loan Status
  const updateLoanStatus = async (id, updatedFields, message) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/loan/${id}`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan._id === id ? { ...loan, ...updatedFields } : loan
        )
      );
      setStatusMessage(message);
    } catch (error) {
      setStatusMessage("Error updating loan. Please try again.");
      console.error(error);
    }
  };

  // Handlers
  const handleApproval = (id, status) =>
    updateLoanStatus(id, { status }, `Loan ${status} successfully.`);
  const handleMarkPaid = (id) =>
    updateLoanStatus(id, { isPaid: true }, "Loan marked as paid successfully.");

  const handleExport = () =>
    loans.map(({ _id, user, amount, status, isPaid }) => ({
      LoanID: _id,
      UserName: user.name,
      Mobile: user.mobile,
      Amount: amount,
      Status: status,
      PaymentStatus: isPaid ? "Paid" : "In Progress",
    }));

  // Filter and Paginate Loans
  const filteredLoans = loans.filter((loan) => {
    const matchesStatus =
      filterStatus === "all" ||
      loan.status === filterStatus ||
      (filterStatus === "paid" && loan.isPaid);
    const matchesQuery = loan.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const pageCount = Math.ceil(filteredLoans.length / perPage);
  const loansPerPage = filteredLoans.slice(
    pageNumber * perPage,
    (pageNumber + 1) * perPage
  );

  // Chart Data
  const loanStatuses = ["pending", "approved", "paid"];
  const loanStatusCounts = loanStatuses.map(
    (status) =>
      loans.filter(
        (loan) => loan.status === status || (status === "paid" && loan.isPaid)
      ).length
  );

  const chartData = {
    labels: loanStatuses.map(
      (status) => status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [
      {
        label: "Loan Status",
        data: loanStatusCounts,
        backgroundColor: ["#FBBF24", "#10B981", "#3B82F6"],
      },
    ],
  };

  const loansByMonth = loans.reduce((acc, loan) => {
    const month = dayjs(loan.createdAt).format("YYYY-MM");
    if (!acc[month]) acc[month] = 0;
    acc[month] += loan.amount;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(loansByMonth),
    datasets: [
      {
        label: "Loan Amounts",
        data: Object.values(loansByMonth),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  // Modal Handlers
  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalImage("");
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-red-500 font-bold text-lg"
              onClick={closeModal}
            >
              X
            </button>
            <img
              src={modalImage}
              alt="Loan Document"
              className="w-[500px] h-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Side Menu */}
      <aside className="w-64 bg-gray-900 text-white h-full">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-blue-500">Admin Dashboard</h1>
        </div>
        <nav className="mt-10 space-y-4">
          {["overview", "loans"].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`block w-full text-left px-6 py-3 ${
                activeSection === section ? "bg-gray-800" : "hover:bg-gray-700"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {statusMessage && (
          <div className="mb-4 text-green-500 font-bold">{statusMessage}</div>
        )}

        {activeSection === "overview" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="mb-8">
              <Pie data={chartData} />
            </div>
            <Bar data={barChartData} />
          </section>
        )}

        {activeSection === "loans" && (
          <section>
            <div className="flex justify-between mb-6">
              <input
                type="text"
                placeholder="Search by user..."
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
            <div className="grid grid-cols-1 gap-4">
              {loansPerPage.map((loan) => (
                <div
                  key={loan._id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-row"
                >
                  <div>
                    <img
                      src={loan.user.photoURLFront}
                      alt="ID Front"
                      className="w-[100px] h-40 object-cover rounded cursor-pointer"
                      onClick={() => openModal(loan.user.photoURLFront)}
                    />
                  </div>
                  <div className="w-3/4 p-3">
                    <h3 className="text-lg font-semibold">
                      Loan ID: {loan._id}
                    </h3>
                    <p>User: {loan.user.name}</p>
                    <p>Total Loan Amount: {loan.totalLoan}</p>
                    <p>Principal Amount: {loan.amount}</p>
                    <p>Mobile: {loan.user.mobile}</p>
                    <p>Alternate Mobile: {loan.user.alternatemobile}</p>
                    <p>Status: {loan.status}</p>
                  </div>

                  {/* Conditional Buttons for Pending Loans */}
                  {loan.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => handleApproval(loan._id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => handleApproval(loan._id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Mark as Paid Button for Approved Loans */}
                  {loan.status === "approved" && !loan.isPaid && (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                      onClick={() => handleMarkPaid(loan._id)}
                    >
                      Mark as Paid
                    </button>
                  )}

                  {/* Paid Status */}
                  {loan.isPaid && (
                    <span className="text-green-500 mt-2 block bg-slate-300">
                      Paid
                    </span>
                  )}
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
              containerClassName={
                "flex justify-center items-center space-x-2 mt-6"
              } // Horizontal alignment
              pageClassName={
                "inline-block bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 cursor-pointer"
              } // Style for page items
              activeClassName={
                "bg-blue-500 text-white font-bold" // Highlight the active page
              }
              previousClassName={
                "inline-block bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 cursor-pointer"
              }
              nextClassName={
                "inline-block bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 cursor-pointer"
              }
              breakClassName={
                "inline-block bg-gray-200 rounded-md px-3 py-1 cursor-default"
              }
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
