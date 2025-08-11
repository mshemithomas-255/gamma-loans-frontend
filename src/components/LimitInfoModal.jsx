import {
  FiX,
  FiAlertTriangle,
  FiDollarSign,
  FiCreditCard,
  FiBarChart2,
} from "react-icons/fi";

const LimitInfoModal = ({ limitInfo, onClose, darkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-xl shadow-xl w-full max-w-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`p-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <FiAlertTriangle className="inline mr-2 text-yellow-500" />
              Loan Limit Reached
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <FiDollarSign className="text-blue-500 mr-3" size={20} />
                <div>
                  <h4
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Per Loan Limit
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Maximum amount for a single loan
                  </p>
                </div>
                <div className="ml-auto font-bold">
                  Ksh{" "}
                  {limitInfo.maxLoanAmountPerRequest?.toLocaleString() ||
                    "Not set"}
                </div>
              </div>
            </div>

            {/* <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <FiBarChart2 className="text-blue-500 mr-3" size={20} />
                <div>
                  <h4
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Total Loan Limit
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Maximum total outstanding loans
                  </p>
                </div>
                <div className="ml-auto font-bold">
                  Ksh{" "}
                  {limitInfo.maxTotalLoanAmount?.toLocaleString() || "Not set"}
                </div>
              </div>
            </div> */}

            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <FiCreditCard className="text-blue-500 mr-3" size={20} />
                <div>
                  <h4
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Active Loans Limit
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Maximum number of active loans
                  </p>
                </div>
                <div className="ml-auto font-bold">
                  {limitInfo.maxActiveLoans || "Not set"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg font-medium ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitInfoModal;
