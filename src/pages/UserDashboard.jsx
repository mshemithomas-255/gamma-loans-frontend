import { useState, useEffect } from "react";
import EditUserProfile from "./EditUserProfile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import Modal from "react-modal";
import ProgressBar from "@ramonak/react-progress-bar";

const UserDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [user, setUser] = useState("");
  const [id, setId] = useState(null);
  const [newLoanData, setNewLoanData] = useState({ amount: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      const response = await fetch("/api/users/loans", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setLoans(data);
    };

    const fetchUser = async () => {
      const response = await fetch("/api/users/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setUser(data);
    };

    fetchLoans();
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setNewLoanData({ ...newLoanData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/users/loans/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newLoanData),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.message);
      setNewLoanData({ amount: "" });
      return;
    }
    setLoans([...loans, data]);
    setNewLoanData({ amount: "" });
    toast.success("Loan application submitted successfully!");
  };

  const handleDeleteLoan = (id) => {
    setId(id);
    setModalIsOpen(true);
  };

  const confirmDeleteLoan = async () => {
    setModalIsOpen(false);
    const response = await fetch(`/api/users/loans/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const result = await response.json();
    if (response.ok) {
      setLoans(loans.filter((loan) => loan._id !== id));
      toast.success("Loan deleted successfully!");
    } else {
      toast.error(result.message);
    }
  };

  const cancelDeleteLoan = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="flex flex-col items-center justify-between md:flex-row gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">User Dashboard</h1>
          <p className="text-xl mt-2 text-white">
            Welcome back{" "}
            <span className="text-purple-300 capitalize">{user?.name}</span>!
          </p>
        </div>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
          onClick={() => setEditingProfile(true)}
        >
          Edit Profile
        </button>
      </header>

      {editingProfile ? (
        <EditUserProfile user={user} onSave={() => setEditingProfile(false)} />
      ) : (
        <main className="mt-8">
          {/* Loans Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-purple-700">My Loans</h2>
            {loans.length === 0 ? (
              <p className="mt-4 text-gray-700">
                You don’t have any loans. Apply for one below!
              </p>
            ) : (
              <div className="mt-4 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className="bg-purple-50 border border-purple-200 p-4 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <p>
                      <span className="font-medium text-gray-800">Amount:</span>{" "}
                      Ksh {loan.amount}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Status:</span>{" "}
                      {loan.status}
                    </p>
                    <div className="mt-4">
                      <ProgressBar
                        completed={loan.isPaid ? 100 : 60} // Example progress
                        bgColor="#7e57c2"
                        labelColor="#ffffff"
                        height="15px"
                        labelAlignment="center"
                      />
                    </div>
                    <div className="flex mt-4 space-x-3">
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        onClick={() => handleDeleteLoan(loan._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        data-tooltip-id="pay-tooltip"
                        data-tooltip-content="Mark as paid"
                      >
                        Pay
                      </button>
                      <Tooltip id="pay-tooltip" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Apply for Loan Section */}
          <section>
            <h2 className="text-2xl font-semibold text-purple-700">
              Apply for a New Loan
            </h2>
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col gap-4 max-w-lg"
            >
              <input
                type="number"
                name="amount"
                placeholder="Loan Amount"
                value={newLoanData.amount}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Apply
              </button>
            </form>
          </section>
        </main>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={cancelDeleteLoan}
        className="bg-slate-800 p-8 rounded-lg shadow-md max-w-md mx-auto mt-20"
        overlayClassName="bg-black bg-opacity-50 fixed inset-0"
      >
        <h2 className="text-lg font-semibold text-white">Confirm Deletion</h2>
        <p className="text-white mt-4">
          Are you sure you want to delete this loan? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={cancelDeleteLoan}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteLoan}
            className="px-4 py-2 bg-red-500 text-gray-200 rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserDashboard;
