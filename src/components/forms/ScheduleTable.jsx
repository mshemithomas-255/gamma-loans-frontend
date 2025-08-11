import Button from "../UI/Button";

const ScheduleTable = ({ schedules, handleMarkPaid, showActions = true }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Plot
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Owner
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Expected
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Paid
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Balance
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          {showActions && (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {schedules.map((schedule) => {
          const balance = schedule.expectedAmount - (schedule.paidAmount || 0);
          const isFullyPaid = balance <= 0;

          return (
            <tr key={schedule._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                  Plot #{schedule.plot.plotNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {schedule.plot.ownerName}
                </div>
                <div className="text-sm text-gray-500">
                  {schedule.plot.mobileNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Ksh {schedule.expectedAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Ksh {(schedule.paidAmount || 0).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span
                  className={balance > 0 ? "text-red-600" : "text-green-600"}
                >
                  Ksh {Math.max(balance, 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isFullyPaid
                      ? "bg-green-100 text-green-800"
                      : schedule.paidAmount > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isFullyPaid
                    ? "Paid"
                    : schedule.paidAmount > 0
                    ? "Partial"
                    : "Unpaid"}
                </span>
              </td>
              {showActions && !isFullyPaid && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleMarkPaid(schedule)}
                  >
                    {schedule.paidAmount > 0 ? "Add Payment" : "Pay"}
                  </Button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ScheduleTable;
