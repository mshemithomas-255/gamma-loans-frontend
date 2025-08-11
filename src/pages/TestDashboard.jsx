import { useState, useEffect } from "react";

import axios from "axios";

const TestDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/users/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/login")); // Redirect if not authenticated

    axios
      .get("/api/users/loans", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLoans(res.data));
  }, []);

  // pending loans
  const pendingLoans = loans.filter((loan) => loan.status === "pending");
  const approvedLoans = loans.filter((loan) => loan.status === "approved");

  //   const applyForLoan = () => {
  //     const token = localStorage.getItem("token");
  //     axios
  //       .post(
  //         "/api/users/loans",
  //         { amount: loanAmount },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       )
  //       .then(() => {
  //         setModalOpen(false);
  //         setLoanAmount("");
  //       });
  //   };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center text-white p-3">
        <h1 className="text-3xl ">
          Hello <span className="text-[#b9283b] capitalize">{user?.name}</span>
        </h1>

        <button
          onClick={() => localStorage.clear() && (window.location.href = "/")}
          className="text-[#b9283b] bg-zinc-700 px-2 py-1 rounded-md hover:opacity-80 shadow-md"
        >
          Logout
        </button>
      </header>
    </div>
  );
};

export default TestDashboard;
