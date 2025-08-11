import React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiX,
  FiTrash2,
  FiImage,
  FiDollarSign,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiSliders,
} from "react-icons/fi";
import profile from "../assets/img/profile.jpg";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [editingLimits, setEditingLimits] = useState(null);
  const [limitChanges, setLimitChanges] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);

  // Fetch current admin ID on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentAdminId(payload.userId);
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    }
  }, []);

  // Fetch users with loan limits
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/admin/users",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      // Filter out admin users from the list
      setUsers(data.filter((user) => user.role !== "admin"));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle delete request
  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete) {
      toast.error("No user selected for deletion.");
      return;
    }

    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/users/delete/${userToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToDelete)
      );

      toast.success(data.message || "User deleted successfully.");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete user.");
    }
  }, [userToDelete]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.idNumber?.toString().includes(searchQuery) ||
        user.mobileNumber?.toString().includes(searchQuery) ||
        user.alternateMobileNumber?.toString().includes(searchQuery)
    );
  }, [users, searchQuery]);

  // Close image modal when clicking outside or pressing Escape
  const handleImageModalClick = useCallback((e) => {
    if (e.target === e.currentTarget || e.key === "Escape") {
      setSelectedImage(null);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle delete button click
  const handleDeleteClick = useCallback((userId) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  }, []);

  // Handle edit limits click
  const handleEditLimits = useCallback((user) => {
    setEditingLimits(user._id);
    setLimitChanges({
      maxTotalLoanAmount: user.loanLimits?.maxTotalLoanAmount || 0,
      maxActiveLoans: user.loanLimits?.maxActiveLoans || 0,
      maxLoanAmountPerRequest: user.loanLimits?.maxLoanAmountPerRequest || 0,
      changeReason: "",
    });
  }, []);

  // Handle limit change
  const handleLimitChange = useCallback((field, value) => {
    setLimitChanges((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Save limit changes
  const saveLimitChanges = useCallback(async () => {
    if (!editingLimits) return;

    try {
      const response = await fetch(
        `https://gamma-loans-backend.vercel.app/api/admin/users/${editingLimits}/loan-limits`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(limitChanges),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update limits");
      }

      // Update the user in our local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === editingLimits
            ? {
                ...user,
                loanLimits: {
                  ...user.loanLimits,
                  maxTotalLoanAmount: limitChanges.maxTotalLoanAmount,
                  maxActiveLoans: limitChanges.maxActiveLoans,
                  maxLoanAmountPerRequest: limitChanges.maxLoanAmountPerRequest,
                  lastUpdated: new Date(),
                  updatedBy: currentAdminId,
                },
                limitHistory: [
                  ...(user.limitHistory || []),
                  {
                    limitType: "maxTotalLoanAmount",
                    oldValue: user.loanLimits?.maxTotalLoanAmount || 0,
                    newValue: limitChanges.maxTotalLoanAmount,
                    changedBy: currentAdminId,
                    changeReason: limitChanges.changeReason,
                    changedAt: new Date(),
                  },
                  {
                    limitType: "maxActiveLoans",
                    oldValue: user.loanLimits?.maxActiveLoans || 0,
                    newValue: limitChanges.maxActiveLoans,
                    changedBy: currentAdminId,
                    changeReason: limitChanges.changeReason,
                    changedAt: new Date(),
                  },
                  {
                    limitType: "maxLoanAmountPerRequest",
                    oldValue: user.loanLimits?.maxLoanAmountPerRequest || 0,
                    newValue: limitChanges.maxLoanAmountPerRequest,
                    changedBy: currentAdminId,
                    changeReason: limitChanges.changeReason,
                    changedAt: new Date(),
                  },
                ],
              }
            : user
        )
      );

      toast.success("Loan limits updated successfully");
      setEditingLimits(null);
      setLimitChanges({});
    } catch (error) {
      console.error("Error updating limits:", error);
      toast.error(error.message || "Failed to update limits");
    }
  }, [editingLimits, limitChanges, currentAdminId]);

  // Toggle user details expansion
  const toggleExpandUser = useCallback((userId) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-8 py-2 w-full border rounded-lg text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <React.Fragment key={`user-${user._id}`}>
                    {/* Main User Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full cursor-pointer"
                            src={user.profilePhoto || profile}
                            alt="Profile"
                            onClick={() => setSelectedImage(user.profilePhoto)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = profile;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.mobileNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>
                            Ksh{" "}
                            {user.loanLimits?.maxLoanAmountPerRequest?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleExpandUser(user._id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View details"
                          >
                            {expandedUser === user._id ? (
                              <FiChevronUp size={18} />
                            ) : (
                              <FiChevronDown size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditLimits(user)}
                            className="text-yellow-500 hover:text-yellow-700"
                            title="Edit limits"
                          >
                            <FiSliders size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete user"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedUser === user._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                                <FiDollarSign className="mr-2" />
                                Loan Limits
                              </h3>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Max per loan
                                  </label>
                                  <p className="font-medium">
                                    {user.loanLimits?.maxLoanAmountPerRequest?.toLocaleString() ||
                                      "0"}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Max total loans
                                  </label>
                                  <p className="font-medium">
                                    {user.loanLimits?.maxTotalLoanAmount?.toLocaleString() ||
                                      "0"}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Max active loans
                                  </label>
                                  <p className="font-medium">
                                    {user.loanLimits?.maxActiveLoans || "0"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="font-medium text-gray-700 mb-2">
                                ID Documents
                              </h3>
                              <div className="flex space-x-4">
                                {user.idFrontPhoto ? (
                                  <button
                                    onClick={() =>
                                      setSelectedImage(user.idFrontPhoto)
                                    }
                                    className="text-blue-500 hover:text-blue-700 flex flex-col items-center"
                                  >
                                    <FiImage size={24} />
                                    <span className="text-xs mt-1">Front</span>
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    No front ID
                                  </span>
                                )}
                                {user.idBackPhoto ? (
                                  <button
                                    onClick={() =>
                                      setSelectedImage(user.idBackPhoto)
                                    }
                                    className="text-blue-500 hover:text-blue-700 flex flex-col items-center"
                                  >
                                    <FiImage size={24} />
                                    <span className="text-xs mt-1">Back</span>
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    No back ID
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="font-medium text-gray-700 mb-2">
                                Contact Info
                              </h3>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs text-gray-500">
                                    Alternate Mobile
                                  </label>
                                  <p className="font-medium">
                                    {user.alternateMobileNumber || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">
                                    ID Number
                                  </label>
                                  <p className="font-medium">
                                    {user.idNumber || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Edit Limits Row */}
                    {editingLimits === user._id && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
                            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                              <FiEdit className="mr-2 text-blue-500" />
                              Edit Loan Limits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Max per loan (KSh)
                                </label>
                                <input
                                  type="number"
                                  value={limitChanges.maxLoanAmountPerRequest}
                                  onChange={(e) =>
                                    handleLimitChange(
                                      "maxLoanAmountPerRequest",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Max total loans (KSh)
                                </label>
                                <input
                                  type="number"
                                  value={limitChanges.maxTotalLoanAmount}
                                  onChange={(e) =>
                                    handleLimitChange(
                                      "maxTotalLoanAmount",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Max active loans
                                </label>
                                <input
                                  type="number"
                                  value={limitChanges.maxActiveLoans}
                                  onChange={(e) =>
                                    handleLimitChange(
                                      "maxActiveLoans",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for change
                              </label>
                              <input
                                type="text"
                                value={limitChanges.changeReason}
                                onChange={(e) =>
                                  handleLimitChange(
                                    "changeReason",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter reason for limit changes"
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => setEditingLimits(null)}
                                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveLimitChanges}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                              >
                                <FiCheck className="mr-1" />
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {users.length === 0
                      ? "No users available"
                      : "No users match your search"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={handleImageModalClick}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FiX size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[80vh] object-contain"
              onError={(e) => {
                e.target.src = profile;
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
