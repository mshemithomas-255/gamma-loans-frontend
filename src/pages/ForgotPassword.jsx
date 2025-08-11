import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/users/forgot-password/verify-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idNumber }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("ID verified");
        console.log("Redirecting with userId:", data.userId); // Debugging
        navigate("/update-password", { state: { userId: data.userId } });
      } else {
        toast.error(data.message || "ID verification failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block">ID Number</label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify ID"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
