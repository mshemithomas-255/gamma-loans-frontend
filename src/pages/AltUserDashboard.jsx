import { useState, useEffect } from "react";

const UserDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [editingid, setEditingid] = useState(null);
  const [newLoanAmount, setNewLoanAmount] = useState("");

  useEffect(() => {
    // Fetch loans data from the backend
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => setLoans(data));
  }, []);

  const handleChangePassword = () => {
    // Send password change request to backend
    fetch("/api/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const handleEditLoan = (id) => {
    // Send loan update request to backend
    fetch(`/api/edit-loan/${id}`, {
      method: "POST",
      body: JSON.stringify({ amount: newLoanAmount }),
      headers: { "Content-Type": "application/json" },
    }).then(() => {
      setEditingid(null);
      // Update loan amount in the UI
      setLoans(
        loans.map((loan) =>
          loan.id === id ? { ...loan, amount: newLoanAmount } : loan
        )
      );
    });
  };
  const handleLogout = () => {
    alert("Logged out");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

      {/* Password Change Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <input
          type="password"
          placeholder="Current Password"
          className="border p-2 mb-2"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="border p-2 mb-4"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={handleChangePassword}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Change Password
        </button>
      </div>

      {/* Loans List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Loans</h2>
        {loans.map((loan) => (
          <div key={loan.id} className="border p-4 mb-4">
            <p>
              <strong>Loan Amount:</strong> ${loan.amount}
            </p>
            <p>
              <strong>Status:</strong> {loan.status}
            </p>

            {loan.status === "pending" && (
              <div>
                {editingid === loan.id ? (
                  <>
                    <input
                      type="number"
                      value={newLoanAmount}
                      onChange={(e) => setNewLoanAmount(e.target.value)}
                      className="border p-2"
                    />
                    <button
                      onClick={() => handleEditLoan(loan.id)}
                      className="bg-green-500 text-white px-4 py-2 ml-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingid(null)}
                      className="bg-red-500 text-white px-4 py-2 ml-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingid(loan.id)}
                    className="bg-yellow-500 text-white px-4 py-2"
                  >
                    Edit Loan Amount
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logout Link */}
      <button
        className="bg-red-500 text-white px-4 py-2"
        onClick={() => handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
