import { useState, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isAfter,
} from "date-fns";
import { FaCheck, FaTimes, FaEdit, FaCalendarAlt, FaTag } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

const Loans = ({ loans, fetchLoans, fetchLoanStats }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [isPartialPaymentModalOpen, setIsPartialPaymentModalOpen] =
    useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isAssignCategoryModalOpen, setIsAssignCategoryModalOpen] =
    useState(false);
  const [isMarkDefaultedModalOpen, setIsMarkDefaultedModalOpen] =
    useState(false);
  const [isEditApplicationDateModalOpen, setIsEditApplicationDateModalOpen] =
    useState(false);
  const [newApplicationDate, setNewApplicationDate] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [defaultReason, setDefaultReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);
  const [newRepaymentDate, setNewRepaymentDate] = useState("");

  // Group loans by category and status, with defaulted loans separated
  const groupLoans = (loans) => {
    const grouped = {
      permanent: {
        pending: [],
        approved: [],
        partiallyPaid: [],
        fullyPaid: [],
      },
      casual: {
        pending: [],
        approved: [],
        partiallyPaid: [],
        fullyPaid: [],
      },
      defaulted: [],
      extended: {}, // New group for extended loans
    };

    loans.forEach((loan) => {
      if (loan.status.toLowerCase() === "defaulted") {
        grouped.defaulted.push(loan);
      } else if (loan.extensionCount > 0) {
        // Group extended loans by extension month
        const month =
          loan.extensionMonth ||
          format(new Date(loan.repaymentDate), "yyyy-MM");

        if (!grouped.extended[month]) {
          grouped.extended[month] = [];
        }
        grouped.extended[month].push(loan);
      } else {
        const category = loan.category === "permanent" ? "permanent" : "casual";
        let status = loan.status.toLowerCase();

        if (status === "partially paid") status = "partiallyPaid";
        else if (status === "fully paid") status = "fullyPaid";

        if (grouped[category][status]) {
          grouped[category][status].push(loan);
        }
      }
    });

    return grouped;
  };

  // Calculate summary for the selected month only
  const monthlySummary = useMemo(() => {
    const summary = {
      loanAmount: 0,
      totalRepayment: 0,
      interest: 0,
      count: 0,
    };

    loans.forEach((loan) => {
      const loanMonth = format(new Date(loan.createdAt), "yyyy-MM");
      if (selectedMonth === "" || loanMonth === selectedMonth) {
        summary.loanAmount += loan.loanAmount;
        summary.totalRepayment += loan.totalRepayment;
        summary.interest += loan.interest;
        summary.count++;
      }
    });

    return summary;
  }, [loans, selectedMonth]);

  // Toggle collapsible sections
  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Filter loans by date
  const filterLoansByDate = useCallback((loans, filter) => {
    const now = new Date();
    switch (filter) {
      case "day":
        return loans.filter((loan) => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= startOfDay(now) && loanDate <= endOfDay(now);
        });
      case "week":
        return loans.filter((loan) => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= startOfWeek(now) && loanDate <= endOfWeek(now);
        });
      case "month":
        return loans.filter((loan) => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= startOfMonth(now) && loanDate <= endOfMonth(now);
        });
      default:
        return loans;
    }
  }, []);

  // Filter loans by status (excluding defaulted from regular filters)
  const filterLoansByStatus = useCallback((loans, status) => {
    if (status === "all")
      return loans.filter((loan) => loan.status !== "defaulted");
    return loans.filter((loan) => loan.status === status);
  }, []);

  // Filter loans by category
  const filterLoansByCategory = useCallback((loans, category) => {
    if (category === "all") return loans;
    return loans.filter((loan) => loan.category === category);
  }, []);

  // Filter loans by search query
  const filterLoansBySearch = useCallback((loans, query) => {
    return loans.filter(
      (loan) =>
        loan.userId?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        loan.loanAmount.toString().includes(query) ||
        loan.status.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // Filter loans by month
  const filterLoansByMonth = useCallback((loans, month) => {
    if (!month) return loans;
    return loans.filter((loan) => {
      const loanDate = new Date(loan.createdAt);
      return format(loanDate, "yyyy-MM") === month;
    });
  }, []);

  // Get unique months from loans
  const getAvailableMonths = (loans) => {
    const months = new Set();
    loans.forEach((loan) => {
      const loanDate = new Date(loan.createdAt);
      months.add(format(loanDate, "yyyy-MM"));
    });
    return Array.from(months).sort((a, b) => new Date(b) - new Date(a));
  };

  // Apply all filters
  const filteredLoans = useMemo(() => {
    return filterLoansBySearch(
      filterLoansByStatus(
        filterLoansByDate(
          filterLoansByMonth(
            filterLoansByCategory(loans, categoryFilter),
            selectedMonth
          ),
          dateFilter
        ),
        statusFilter
      ),
      searchQuery
    );
  }, [
    loans,
    dateFilter,
    statusFilter,
    searchQuery,
    selectedMonth,
    categoryFilter,
    filterLoansByDate,
    filterLoansByStatus,
    filterLoansBySearch,
    filterLoansByMonth,
    filterLoansByCategory,
  ]);

  // Group filtered loans
  const groupedLoans = groupLoans(filteredLoans);

  // Defaulted Loans Table Component
  const DefaultedLoansTable = ({
    loans,
    openMarkPaidModal,
    openPartialPaymentModal,
  }) => {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-red-600">Defaulted Loans</h2>
        {loans.length > 0 ? (
          <table className="w-full striped-table sticky-header text-sm">
            <thead>
              <tr className="bg-red-50">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Loan Amount</th>
                <th className="px-4 py-3 text-left">Interest</th>
                <th className="px-4 py-3 text-left">Total Repayment</th>
                <th className="px-4 py-3 text-left">Paid Amount</th>
                <th className="px-4 py-3 text-left">Remaining Balance</th>
                <th className="px-4 py-3 text-left">Repayment Date</th>
                <th className="px-4 py-3 text-left">Default Reason</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan._id}
                  className="border-b border-gray-200 hover:bg-red-50 bg-red-100"
                >
                  <td className="px-4 py-3">{loan.userId?.fullName}</td>
                  <td className="px-4 py-3">Ksh {loan.loanAmount}</td>
                  <td className="px-4 py-3">Ksh {loan.interest}</td>
                  <td className="px-4 py-3">Ksh {loan.totalRepayment}</td>
                  <td className="px-4 py-3">Ksh {loan.paidAmount}</td>
                  <td className="px-4 py-3">Ksh {loan.remainingBalance}</td>
                  <td className="px-4 py-3">
                    {format(new Date(loan.repaymentDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    {loan.defaultReason || "Not specified"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        data-tooltip-id="partial-pay-tooltip"
                        onClick={() => openPartialPaymentModal(loan)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center"
                      >
                        <FaEdit className="mr-2" /> Partial Pay
                      </button>
                      <button
                        data-tooltip-id="mark-paid-tooltip"
                        onClick={() => openMarkPaidModal(loan)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center"
                      >
                        <FaCheck className="mr-2" /> Mark Paid
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No defaulted loans found
          </div>
        )}
      </div>
    );
  };

  // Approve a loan
  const approveLoan = useCallback(
    async (loanId) => {
      try {
        const response = await fetch(
          `https://gamma-loans-backend.vercel.app/api/admin/approve-loan/${loanId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          toast.success("Loan approved successfully.");
          fetchLoans();
          fetchLoanStats();
        } else {
          toast.error("Failed to approve loan.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to approve loan.");
      }
    },
    [fetchLoans, fetchLoanStats]
  );

  // Reject a loan
  const rejectLoan = useCallback(
    async (loanId) => {
      try {
        const response = await fetch(
          `https://gamma-loans-backend.vercel.app/api/admin/reject-loan/${loanId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          toast.success("Loan rejected successfully.");
          fetchLoans();
          fetchLoanStats();
        } else {
          toast.error("Failed to reject loan.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to reject loan.");
      }
    },
    [fetchLoans, fetchLoanStats]
  );

  // Extend repayment date
  const extendRepaymentDate = useCallback(
    async (loanId) => {
      try {
        const response = await fetch(
          `https://gamma-loans-backend.vercel.app/api/admin/extend-repayment/${loanId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          toast.success("Repayment date extended successfully.");
          fetchLoans();
        } else {
          toast.error("Failed to extend repayment date.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to extend repayment date.");
      }
    },
    [fetchLoans]
  );

  // Edit application date function
  const editApplicationDate = useCallback(async () => {
    if (!newApplicationDate) {
      toast.error("Please select a valid date.");
      return;
    }

    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/edit-application-date/${selectedLoan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ applicationDate: newApplicationDate }),
        }
      );

      if (response.ok) {
        toast.success("Application date updated successfully.");
        fetchLoans();
        closeEditApplicationDateModal();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update application date.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update application date.");
    }
  }, [selectedLoan, newApplicationDate, fetchLoans]);

  // Add this new method to the Loans component
  const renderExtendedLoans = (extendedLoans) => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Extended Loans</h2>
        {Object.entries(extendedLoans).map(([month, loans]) => {
          const sectionId = `extended-${month}`;
          const isExpanded = expandedSection === sectionId;

          return (
            <div key={month} className="mb-4">
              <div
                className="flex justify-between items-center bg-purple-100 p-3 rounded-lg cursor-pointer"
                onClick={() => toggleSection(sectionId)}
              >
                <h3 className="font-semibold">
                  {format(new Date(`${month}-01`), "MMMM yyyy")} ({loans.length}{" "}
                  loans)
                </h3>
                <span>{isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <table className="w-full striped-table sticky-header text-sm mt-2">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Loan Amount</th>
                      <th className="px-4 py-3 text-left">Interest</th>
                      <th className="px-4 py-3 text-left">Total Repayment</th>
                      <th className="px-4 py-3 text-left">Paid Amount</th>
                      <th className="px-4 py-3 text-left">Remaining Balance</th>
                      <th className="px-4 py-3 text-left">Repayment Date</th>
                      <th className="px-4 py-3 text-left">Extensions</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr
                        key={loan._id}
                        className={`border-b border-gray-200 hover:bg-purple-50 ${
                          loan.extensionCount === 1
                            ? "bg-yellow-100"
                            : loan.extensionCount === 2
                            ? "bg-orange-100"
                            : "bg-red-100"
                        }`}
                      >
                        {/* Same table cells as in other tables */}
                        <td className="px-4 py-3">{loan.userId?.fullName}</td>
                        <td className="px-4 py-3">Ksh {loan.loanAmount}</td>
                        <td className="px-4 py-3">Ksh {loan.interest}</td>
                        <td className="px-4 py-3">Ksh {loan.totalRepayment}</td>
                        <td className="px-4 py-3">Ksh {loan.paidAmount}</td>
                        <td className="px-4 py-3">
                          Ksh {loan.remainingBalance}
                        </td>
                        <td className="px-4 py-3">
                          {format(new Date(loan.repaymentDate), "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-3">{loan.extensionCount}</td>
                        <td className="px-4 py-3">
                          {/* Same action buttons as in other tables */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openPartialPaymentModal(loan)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center"
                            >
                              <FaEdit className="mr-2" /> Partial Pay
                            </button>
                            <button
                              onClick={() => openMarkPaidModal(loan)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center"
                            >
                              <FaCheck className="mr-2" /> Mark Paid
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Open partial payment modal
  const openPartialPaymentModal = (loan) => {
    setSelectedLoan(loan);
    setIsPartialPaymentModalOpen(true);
  };

  // Close partial payment modal
  const closePartialPaymentModal = () => {
    setIsPartialPaymentModalOpen(false);
    setPartialPaymentAmount("");
    setValidationError("");
  };

  // Handle partial payment
  const handlePartialPayment = useCallback(async () => {
    if (
      !partialPaymentAmount ||
      isNaN(partialPaymentAmount) ||
      partialPaymentAmount <= 0
    ) {
      setValidationError("Please enter a valid amount.");
      return;
    }
    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/partial-payment/${selectedLoan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: partialPaymentAmount }),
        }
      );
      if (response.ok) {
        toast.success("Partial payment recorded successfully.");
        fetchLoans();
        closePartialPaymentModal();
      } else {
        toast.error("Failed to record partial payment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to record partial payment.");
    }
  }, [partialPaymentAmount, selectedLoan, fetchLoans]);

  // Open mark paid modal
  const openMarkPaidModal = (loan) => {
    setSelectedLoan(loan);
    setIsMarkPaidModalOpen(true);
  };

  // Close mark paid modal
  const closeMarkPaidModal = () => {
    setIsMarkPaidModalOpen(false);
  };

  // Mark loan as fully paid
  const markLoanAsPaid = useCallback(async () => {
    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/mark-paid/${selectedLoan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        toast.success("Loan marked as fully paid.");
        fetchLoans();
        closeMarkPaidModal();
      } else {
        toast.error("Failed to mark loan as paid.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark loan as paid.");
    }
  }, [selectedLoan, fetchLoans]);

  // Open assign category modal
  const openAssignCategoryModal = (loan) => {
    setSelectedLoan(loan);
    setIsAssignCategoryModalOpen(true);
  };

  // Close assign category modal
  const closeAssignCategoryModal = () => {
    setIsAssignCategoryModalOpen(false);
    setSelectedCategory("");
  };

  // Assign category to loan
  const assignCategory = useCallback(async () => {
    if (!selectedCategory) {
      toast.error("Please select a category.");
      return;
    }

    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/assign-category/${selectedLoan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: selectedCategory }),
        }
      );

      if (response.ok) {
        toast.success("Category assigned successfully.");
        fetchLoans();
        closeAssignCategoryModal();
      } else {
        toast.error("Failed to assign category.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign category.");
    }
  }, [selectedCategory, selectedLoan, fetchLoans]);

  // Open mark defaulted modal
  const openMarkDefaultedModal = (loan) => {
    setSelectedLoan(loan);
    setIsMarkDefaultedModalOpen(true);
  };

  // Close mark defaulted modal
  const closeMarkDefaultedModal = () => {
    setIsMarkDefaultedModalOpen(false);
    setDefaultReason("");
  };

  // Mark loan as defaulted
  const markLoanAsDefaulted = useCallback(async () => {
    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/mark-defaulted/${selectedLoan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: defaultReason,
            extensionCount: selectedLoan.extensionCount,
          }),
        }
      );
      if (response.ok) {
        toast.success("Loan marked as defaulted.");
        fetchLoans();
        closeMarkDefaultedModal();
      } else {
        toast.error("Failed to mark loan as defaulted.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark loan as defaulted.");
    }
  }, [selectedLoan, defaultReason, fetchLoans]);

  const openEditApplicationDateModal = (loan) => {
    setSelectedLoan(loan);
    setNewApplicationDate(format(new Date(loan.createdAt), "yyyy-MM-dd"));
    setIsEditApplicationDateModalOpen(true);
  };

  const closeEditApplicationDateModal = () => {
    setIsEditApplicationDateModalOpen(false);
    setNewApplicationDate("");
  };

  // Render collapsible tables for each category and status
  const renderCategoryTable = (category, loansByStatus) => {
    return (
      <div key={category} className="mb-8">
        <h2 className="text-xl font-bold mb-4 capitalize">{category} Loans</h2>
        {Object.entries(loansByStatus).map(([status, loans]) => {
          const sectionId = `${category}-${status}`;
          const isExpanded = expandedSection === sectionId;

          return (
            <div key={status} className="mb-4">
              <div
                className="flex justify-between items-center bg-gray-100 p-3 rounded-lg cursor-pointer"
                onClick={() => toggleSection(sectionId)}
              >
                <h3 className="font-semibold capitalize">{status}</h3>
                <span>{isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <table className="w-full striped-table sticky-header text-sm mt-2">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Loan Amount</th>
                      <th className="px-4 py-3 text-left">Interest</th>
                      <th className="px-4 py-3 text-left">Total Repayment</th>
                      <th className="px-4 py-3 text-left">Paid Amount</th>
                      <th className="px-4 py-3 text-left">Remaining Balance</th>
                      <th className="px-4 py-3 text-left">Repayment Date</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr
                        key={loan._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${
                          loan.extensionCount === 0
                            ? "bg-green-500"
                            : loan.extensionCount === 1
                            ? "bg-yellow-500"
                            : loan.extensionCount === 2
                            ? "bg-red-500"
                            : "bg-red-400"
                        }`}
                      >
                        <td className="px-4 py-3">{loan.userId?.fullName}</td>
                        <td className="px-4 py-3">Ksh {loan.loanAmount}</td>
                        <td className="px-4 py-3">Ksh {loan.interest}</td>
                        <td className="px-4 py-3">Ksh {loan.totalRepayment}</td>
                        <td className="px-4 py-3">Ksh {loan.paidAmount}</td>
                        <td className="px-4 py-3">
                          Ksh {loan.remainingBalance}
                        </td>
                        <td className="px-4 py-3">
                          {format(new Date(loan.repaymentDate), "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {loan.status === "pending" && (
                              <>
                                <button
                                  data-tooltip-id="approve-tooltip"
                                  data-tooltip-content="Approve this loan"
                                  onClick={() => approveLoan(loan._id)}
                                  className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaCheck className="mr-2" /> Approve
                                </button>
                                <button
                                  data-tooltip-id="reject-tooltip"
                                  data-tooltip-content="Reject this loan"
                                  onClick={() => rejectLoan(loan._id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaTimes className="mr-2" /> Reject
                                </button>
                              </>
                            )}
                            {(loan.status === "approved" ||
                              loan.status === "partially paid") && (
                              <>
                                <button
                                  data-tooltip-id="partial-pay-tooltip"
                                  data-tooltip-content="Record partial payment"
                                  onClick={() => openPartialPaymentModal(loan)}
                                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaEdit className="mr-2" /> Partial Pay
                                </button>
                                <button
                                  data-tooltip-id="mark-paid-tooltip"
                                  data-tooltip-content="Mark as fully paid"
                                  onClick={() => openMarkPaidModal(loan)}
                                  className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaCheck className="mr-2" /> Mark Paid
                                </button>
                                <button
                                  data-tooltip-id="edit-application-tooltip"
                                  data-tooltip-content="Edit application date"
                                  onClick={() =>
                                    openEditApplicationDateModal(loan)
                                  }
                                  className="bg-teal-500 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaCalendarAlt className="mr-2" /> Edit App
                                  Date
                                </button>
                                {loan.extensionCount < 3 ? (
                                  <button
                                    data-tooltip-id="extend-tooltip"
                                    data-tooltip-content="Extend repayment date"
                                    onClick={() =>
                                      extendRepaymentDate(loan._id)
                                    }
                                    className="bg-purple-500 text-white px-3 py-1 rounded-lg flex items-center"
                                  >
                                    <FaCalendarAlt className="mr-2" /> Extend
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="bg-gray-400 text-white px-3 py-1 rounded-lg flex items-center cursor-not-allowed"
                                  >
                                    <FaCalendarAlt className="mr-2" /> Extend
                                  </button>
                                )}
                                <button
                                  data-tooltip-id="assign-category-tooltip"
                                  data-tooltip-content="Assign category"
                                  onClick={() => openAssignCategoryModal(loan)}
                                  className="bg-indigo-500 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaTag className="mr-2" /> Assign
                                </button>
                                <button
                                  data-tooltip-id="mark-defaulted-tooltip"
                                  data-tooltip-content="Mark as defaulted"
                                  onClick={() => openMarkDefaultedModal(loan)}
                                  className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center"
                                >
                                  <FaTimes className="mr-2" /> Default
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Loans</h1>

      {/* Monthly Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-2">
            {selectedMonth === format(new Date(), "yyyy-MM")
              ? "Current Month"
              : selectedMonth === ""
              ? "All Time"
              : format(new Date(selectedMonth), "MMMM yyyy")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-600">Total Loans</p>
              <p className="font-semibold">{monthlySummary.count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loan Amount</p>
              <p className="font-semibold">
                Ksh {monthlySummary.loanAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Repayment</p>
              <p className="font-semibold">
                Ksh {monthlySummary.totalRepayment.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interest</p>
              <p className="font-semibold">
                Ksh {monthlySummary.interest.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-lg mb-4 mr-4"
        >
          <option value={format(new Date(), "yyyy-MM")}>Current Month</option>
          <option value="">All Months</option>
          {getAvailableMonths(loans)
            .filter((month) => month !== format(new Date(), "yyyy-MM"))
            .map((month) => (
              <option key={month} value={month}>
                {format(new Date(month), "MMM yyyy")}
              </option>
            ))}
        </select>

        <input
          type="text"
          placeholder="Search loans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border rounded-lg"
        />

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="ml-4 px-3 py-2 border rounded-lg"
        >
          <option value="all">All Time</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ml-4 px-3 py-2 border rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="partially paid">Partially Paid</option>
          <option value="fully paid">Fully Paid</option>
          <option value="defaulted">Defaulted</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="ml-4 px-3 py-2 border rounded-lg"
        >
          <option value="all">All Categories</option>
          <option value="permanent">Permanent</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      {/* Collapsible Tables */}
      {Object.entries(groupedLoans).map(([category, loansByStatus]) => {
        if (category === "defaulted") return null; // Skip defaulted here, we'll render separately
        return renderCategoryTable(category, loansByStatus);
      })}

      {groupedLoans.extended &&
        Object.keys(groupedLoans.extended).length > 0 && (
          <div className="my-8 border-t-2 border-purple-200 pt-6">
            {renderExtendedLoans(groupedLoans.extended)}
          </div>
        )}

      {/* Defaulted Loans Section */}
      <div className="my-8 border-t-2 border-red-200 pt-6">
        {/* Summary Card */}
        {groupedLoans.defaulted.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Defaulted Loans Summary
                </h3>
                <p className="text-red-600">
                  Total: {groupedLoans.defaulted.length} loans | Outstanding:
                  Ksh{" "}
                  {groupedLoans.defaulted
                    .reduce((sum, loan) => sum + loan.remainingBalance, 0)
                    .toLocaleString()}
                </p>
              </div>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                onClick={() => {
                  // Optional: Add export functionality
                  toast.success("Preparing defaulted loans report...");
                }}
              >
                Export Defaulted Loans
              </button>
            </div>
          </div>
        )}

        {/* Defaulted Loans Table */}
        <DefaultedLoansTable
          loans={groupedLoans.defaulted}
          openMarkPaidModal={openMarkPaidModal}
          openPartialPaymentModal={openPartialPaymentModal}
        />
      </div>

      {/* Partial Payment Modal */}
      {isPartialPaymentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Partial Payment</h2>
            <input
              type="number"
              placeholder="Enter amount"
              value={partialPaymentAmount}
              onChange={(e) => setPartialPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            {validationError && (
              <p className="text-red-500">{validationError}</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={closePartialPaymentModal}
                className="mr-2 bg-gray-300 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePartialPayment}
                className="bg-green-500 text-white px-3 py-1 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {isMarkPaidModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Mark Loan as Paid</h2>
            <p>Are you sure you want to mark this loan as fully paid?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeMarkPaidModal}
                className="mr-2 bg-gray-300 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={markLoanAsPaid}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Category Modal */}
      {isAssignCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Assign Category</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            >
              <option value="">Select Category</option>
              <option value="permanent">Permanent</option>
              <option value="casual">Casual</option>
            </select>
            <div className="flex justify-end">
              <button
                onClick={closeAssignCategoryModal}
                className="mr-2 bg-gray-300 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={assignCategory}
                className="bg-indigo-500 text-white px-3 py-1 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Defaulted Modal */}
      {isMarkDefaultedModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Mark Loan as Defaulted</h2>
            <textarea
              placeholder="Reason for default (optional)"
              value={defaultReason}
              onChange={(e) => setDefaultReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                onClick={closeMarkDefaultedModal}
                className="mr-2 bg-gray-300 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={markLoanAsDefaulted}
                className="bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Confirm Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Date Modal */}
      {isEditApplicationDateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Edit Application Date</h2>
            <input
              type="date"
              value={newApplicationDate}
              onChange={(e) => setNewApplicationDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              max={format(new Date(), "yyyy-MM-dd")}
            />
            <div className="flex justify-end">
              <button
                onClick={closeEditApplicationDateModal}
                className="mr-2 bg-gray-300 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={editApplicationDate}
                className="bg-teal-500 text-white px-3 py-1 rounded-lg"
              >
                Update Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltips */}
      <Tooltip id="approve-tooltip" />
      <Tooltip id="reject-tooltip" />
      <Tooltip id="partial-pay-tooltip" />
      <Tooltip id="mark-paid-tooltip" />
      <Tooltip id="extend-tooltip" />
      <Tooltip id="assign-category-tooltip" />
      <Tooltip id="mark-defaulted-tooltip" />
      <Tooltip id="edit-repayment-tooltip" />
    </div>
  );
};

export default Loans;
