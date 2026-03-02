import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import PaymentModal from "../components/PayModal";
import LimitInfoModal from "../components/LimitInfoModal";

const Loans = ({ darkMode }) => {
  const [loans, setLoans] = useState([]);
  const [loanData, setLoanData] = useState({
    amount: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitInfo, setLimitInfo] = useState({
    maxLoanAmountPerRequest: 0,
    maxTotalLoanAmount: 0,
    maxActiveLoans: 0,
  });
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Calculate days remaining
  const daysRemaining = (dateString) => {
    if (!dateString) return 0;
    try {
      const today = new Date();
      const dueDate = new Date(dateString);
      const diffTime = dueDate - today;
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch (e) {
      return 0;
    }
  };

  // Safely parse number with fallback
  const safeParseNumber = (value, fallback = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? fallback : num;
  };

  // Fetch loans with limit info
  const fetchLoans = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/loans/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        if (response.status === 401) navigate("/login");
        throw new Error("Failed to fetch loans");
      }

      const data = await response.json();

      // Ensure loans is always an array
      const loansData = Array.isArray(data?.loans) ? data.loans : [];

      // Ensure limit info has proper defaults
      const limitData = data?.limitInfo || {
        maxLoanAmountPerRequest: 0,
        maxTotalLoanAmount: 0,
        maxActiveLoans: 0,
      };

      setLoans(loansData);
      setLimitInfo(limitData);
    } catch (error) {
      toast.error(error.message);
      setLoans([]);
      setLimitInfo({
        maxLoanAmountPerRequest: 0,
        maxTotalLoanAmount: 0,
        maxActiveLoans: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const amount = safeParseNumber(loanData.amount);

    if (!loanData.amount || amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (
      limitInfo?.maxLoanAmountPerRequest &&
      amount > limitInfo.maxLoanAmountPerRequest
    ) {
      newErrors.amount = "Amount exceeds your loan limit";
      setIsLimitModalOpen(true);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const token = localStorage.getItem("token");
    const endpoint = editingId
      ? `/api/loans/update/${editingId}`
      : "/api/loans/apply";

    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app${endpoint}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            loanAmount: safeParseNumber(loanData.amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "LOAN_LIMIT_EXCEEDED") {
          setIsLimitModalOpen(true);
        }
        throw new Error(data.message || "Request failed");
      }

      toast.success(data.message);
      fetchLoans();
      resetForm();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setLoanData({ amount: "" });
    setEditingId(null);
  };

  // Handle edit
  const handleEdit = (loan) => {
    if (!loan) return;

    if (loan.status !== "pending" && loan.status !== "rejected") {
      toast.error("Only pending or rejected loans can be edited");
      return;
    }
    setLoanData({
      amount: loan.loanAmount?.toString() || "",
    });
    setEditingId(loan._id || null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure you want to delete this loan?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/loans/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete loan");

      toast.success("Loan deleted successfully");
      fetchLoans();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status details
  const getStatusDetails = (status) => {
    if (!status) {
      return { color: "bg-gray-100 text-gray-800", icon: <FiInfo /> };
    }

    switch (status.toLowerCase()) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <FiAlertTriangle />,
        };
      case "approved":
        return { color: "bg-blue-100 text-blue-800", icon: <FiInfo /> };
      case "fully paid":
        return {
          color: "bg-green-100 text-green-800",
          icon: <FiCheckCircle />,
        };
      case "rejected":
        return { color: "bg-red-100 text-red-800", icon: <FiXCircle /> };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: <FiInfo /> };
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              My Loans
            </h1>
            <p
              className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Manage your loan applications and payments
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Loan Application Card */}
        <div
          className={`rounded-xl shadow-md overflow-hidden mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div
            className={`p-6 ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } border-b`}
          >
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {editingId ? "Update Loan Application" : "New Loan Application"}
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="amount"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Loan Amount (Ksh)
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <span>Ksh</span>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      placeholder="e.g. 5000"
                      value={loanData.amount}
                      onChange={(e) =>
                        setLoanData({ ...loanData, amount: e.target.value })
                      }
                      className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                  )}
                  {limitInfo?.maxLoanAmountPerRequest && (
                    <p
                      className={`mt-1 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Your limit: Ksh{" "}
                      {safeParseNumber(
                        limitInfo.maxLoanAmountPerRequest
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <ImSpinner8 className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {editingId ? (
                        <>
                          <FiEdit2 className="mr-2" />
                          Update Loan
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="mr-2" />
                          Apply Now
                        </>
                      )}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Loans List */}
        <div
          className={`rounded-xl shadow-md overflow-hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div
            className={`p-6 ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } border-b`}
          >
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              My Loan Applications
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex justify-center">
              <ImSpinner8 className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : !Array.isArray(loans) || loans.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                You don't have any loan applications yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loans.map((loan) => {
                if (!loan) return null;

                const status = getStatusDetails(loan.status);
                const days = daysRemaining(loan.repaymentDate);
                const loanAmount = safeParseNumber(loan.loanAmount);
                const interest = safeParseNumber(loan.interest);
                const totalRepayment = safeParseNumber(loan.totalRepayment);

                return (
                  <div
                    key={loan._id || Math.random().toString(36).substring(2, 9)}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.icon}
                            <span className="ml-1">
                              {loan.status || "Unknown"}
                            </span>
                          </span>
                          <h3
                            className={`text-lg font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Ksh {loanAmount.toLocaleString()}
                          </h3>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4">
                          <div
                            className={`flex items-center text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <FiCalendar className="mr-1.5" />
                            Due {formatDate(loan.repaymentDate)}
                            {days > 0 && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                                {days} {days === 1 ? "day" : "days"} left
                              </span>
                            )}
                          </div>
                          <div
                            className={`flex items-center text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <FiDollarSign className="mr-1.5" />
                            Total repayment: Ksh{" "}
                            {totalRepayment.toLocaleString()}
                            <span className="ml-1.5">
                              (Principal: Ksh {loanAmount.toLocaleString()},
                              Interest: Ksh {interest.toLocaleString()})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {loan.status === "approved" && (
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
                          >
                            Make Payment
                          </button>
                        )}

                        {(loan.status === "pending" ||
                          loan.status === "rejected") && (
                          <>
                            <button
                              onClick={() => handleEdit(loan)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(loan._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          loan={selectedLoan}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={() => {
            fetchLoans();
            setIsPaymentModalOpen(false);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Limit Info Modal */}
      {isLimitModalOpen && limitInfo && (
        <LimitInfoModal
          limitInfo={limitInfo}
          onClose={() => setIsLimitModalOpen(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default Loans;
