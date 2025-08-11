import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaTimes,
  FaPercentage,
  FaMoneyBillWave,
  FaMobileAlt,
} from "react-icons/fa";

const PaymentModal = ({ loan, onClose, onPaymentSuccess }) => {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("254");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(null); // 'initiated', 'pending', 'completed'

  // Auto-format phone number and validate
  useEffect(() => {
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, "");
      const withoutLeadingZero = digitsOnly.startsWith("0")
        ? digitsOnly.substring(1)
        : digitsOnly;
      setFormattedPhone(`254${withoutLeadingZero.substring(0, 9)}`);
    } else {
      setFormattedPhone("254");
    }
  }, [phone]);

  // Validate amount input
  const validateAmount = (value) => {
    if (!value) return "Amount is required";
    if (isNaN(value) || value <= 0) return "Amount must be greater than 0";
    if (value > loan.remainingBalance)
      return `Amount cannot exceed Ksh ${loan.remainingBalance}`;
    return null;
  };

  // Validate phone number
  const validatePhone = () => {
    if (!phone) return "Phone number is required";
    if (formattedPhone.length !== 12)
      return "Please enter a valid 10-digit phone number (07...)";
    return null;
  };

  const handlePayment = async () => {
    const amountError = validateAmount(amount);
    const phoneError = validatePhone();

    if (amountError) {
      toast.error(amountError);
      return;
    }

    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    setIsLoading(true);
    setPaymentProgress("initiated");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You need to be logged in to make payments");
      }

      const response = await fetch(
        "http://localhost:5000/api/payments/stkpush",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: formattedPhone,
            amount: Number(amount),
            loanId: loan._id,
            accountReference: `LOAN-${loan._id.slice(-6)}-${Date.now()
              .toString()
              .slice(-4)}`,
          }),
        }
      );

      const data = await response.json();
      console.log(data.message);

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      setPaymentProgress("pending");
      toast.success(
        `Payment initiated! Check your phone ${formattedPhone} to complete`,
        {
          duration: 8000,
        }
      );

      // Start polling for payment status
      await pollPaymentStatus(loan._id, formattedPhone, Number(amount));
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setPaymentProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (loanId, phoneNumber, paymentAmount) => {
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 3000; // 3 seconds between attempts

    const checkStatus = async () => {
      attempts++;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://gamma-loans-backend.vercel.app/api/loans/${loanId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to check payment status");

        const updatedLoan = await response.json();
        const newPayment = updatedLoan.payments?.find(
          (p) => p.amount === paymentAmount && p.phone === phoneNumber
        );

        if (newPayment) {
          setPaymentProgress("completed");
          toast.success(`Payment of Ksh ${paymentAmount} confirmed!`);
          onPaymentSuccess(updatedLoan);
          setTimeout(onClose, 2000); // Close modal after 2 seconds
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(checkStatus, delay);
        } else {
          toast.error(
            "Payment confirmation timeout. Please check your transaction history."
          );
          setPaymentProgress(null);
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, delay);
        } else {
          toast.error("Unable to confirm payment status. Please check later.");
          setPaymentProgress(null);
        }
      }
    };

    setTimeout(checkStatus, delay);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setAmount("");
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setAmount(Math.min(numValue, loan.remainingBalance));
    }
  };

  const applyPercentage = (percent) => {
    const calculatedAmount = Math.floor(
      loan.remainingBalance * (percent / 100)
    );
    setAmount(calculatedAmount > 0 ? calculatedAmount : 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden ${
          paymentProgress === "completed" ? "border-2 border-green-500" : ""
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {paymentProgress === "completed"
              ? "Payment Successful!"
              : "Make Payment"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        {paymentProgress && (
          <div className="bg-blue-50 p-2">
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  paymentProgress === "initiated"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              ></div>
              <div
                className={`h-3 w-3 rounded-full ${
                  paymentProgress === "pending"
                    ? "bg-blue-500"
                    : paymentProgress === "completed"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-3 w-3 rounded-full ${
                  paymentProgress === "completed"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <span className="text-sm ml-2">
                {paymentProgress === "initiated" && "Processing..."}
                {paymentProgress === "pending" && "Awaiting confirmation..."}
                {paymentProgress === "completed" && "Payment confirmed!"}
              </span>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="p-6">
          {paymentProgress !== "completed" ? (
            <>
              {/* Loan summary */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Repayment</p>
                  <p className="font-bold text-lg">
                    Ksh {loan.totalRepayment.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining Balance</p>
                  <p className="font-bold text-lg">
                    Ksh {loan.remainingBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Amount input */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaMoneyBillWave className="mr-2" /> Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Ksh
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    min="1"
                    max={loan.remainingBalance}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => applyPercentage(25)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    disabled={isLoading}
                  >
                    25%
                  </button>
                  <button
                    onClick={() => applyPercentage(50)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    disabled={isLoading}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => applyPercentage(75)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    disabled={isLoading}
                  >
                    75%
                  </button>
                  <button
                    onClick={() => setAmount(loan.remainingBalance)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    disabled={isLoading}
                  >
                    Full Amount
                  </button>
                </div>
              </div>

              {/* Phone input */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaMobileAlt className="mr-2" /> M-Pesa Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 py-3 bg-gray-100 text-gray-700">
                    254
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 p-3 focus:outline-none"
                    placeholder="7XXXXXXXX"
                    maxLength={9}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Will be converted to:{" "}
                  <span className="font-mono">{formattedPhone}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isLoading || !amount || !phone}
                  className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${
                    isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Ksh {amount} has been paid towards your loan.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm font-medium text-green-800">
                  Transaction Details:
                </p>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>Loan ID: {loan._id.slice(-6)}</li>
                  <li>Amount Paid: Ksh {Number(amount).toLocaleString()}</li>
                  <li>
                    New Balance: Ksh{" "}
                    {(loan.remainingBalance - Number(amount)).toLocaleString()}
                  </li>
                </ul>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
