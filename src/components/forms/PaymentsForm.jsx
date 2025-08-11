import { useState } from "react";
import Button from "../UI/Button";

const PaymentForm = ({
  expectedAmount,
  currentBalance,
  onSubmit,
  onCancel,
}) => {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount");
      return;
    }
    if (Number(amount) <= 0) {
      alert("Payment amount must be positive");
      return;
    }
    onSubmit(Number(amount), paymentDate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Expected Amount
        </label>
        <div className="mt-1 text-lg font-semibold">
          Ksh {expectedAmount.toFixed(2)}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Balance
        </label>
        <div className="mt-1 text-lg font-semibold">
          Ksh {currentBalance.toFixed(2)}
        </div>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Payment Amount
        </label>
        <input
          type="number"
          id="amount"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          max={currentBalance}
          step="0.01"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the amount being paid now (max: Ksh {currentBalance.toFixed(2)})
        </p>
      </div>

      <div>
        <label
          htmlFor="paymentDate"
          className="block text-sm font-medium text-gray-700"
        >
          Payment Date
        </label>
        <input
          type="date"
          id="paymentDate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Record Payment
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
