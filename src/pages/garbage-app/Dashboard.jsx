import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ForwardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import paymentService from "../../api/payments";
import Button from "../../components/UI/Button";
import PaymentForm from "../../components/forms/PaymentsForm";
import Modal from "../../components/UI/Modal";
import ScheduleTable from "../../components/forms/ScheduleTable";

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState({
    plot: { plotNumber: "" },
    expectedAmount: 0,
    paidAmount: 0,
    status: "pending",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getPaymentSchedules(
          currentMonth,
          currentYear
        );

        let schedulesData = [];
        if (Array.isArray(response)) {
          schedulesData = response;
        } else if (response && Array.isArray(response.data)) {
          schedulesData = response.data;
        } else if (response && response.schedules) {
          schedulesData = response.schedules;
        }

        const validSchedules = schedulesData.filter((s) => s?.plot?.plotNumber);
        setSchedules(validSchedules);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch payment schedules:", error);
        toast.error("Failed to load payment schedules");
        setLoading(false);
        setSchedules([]);
      }
    };

    fetchSchedules();
  }, [currentMonth, currentYear]);

  // In your groupSchedulesByLocation function
  const groupSchedulesByLocation = () => {
    const grouped = {};

    schedules.forEach((schedule) => {
      const locationName = schedule.plot.location?.name || "Unknown Location";

      if (!grouped[locationName]) {
        grouped[locationName] = {
          all: [],
          paid: [],
          partial: [],
          pending: [],
        };
      }

      grouped[locationName].all.push(schedule);

      // Group by status
      if (schedule.status === "paid") {
        grouped[locationName].paid.push(schedule);
      } else if (schedule.status === "partial") {
        grouped[locationName].partial.push(schedule);
      } else {
        grouped[locationName].pending.push(schedule);
      }
    });

    return grouped;
  };

  const groupedSchedules = groupSchedulesByLocation();

  const toggleLocation = (location) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  const toggleGroup = (location, groupType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [`${location}-${groupType}`]: !prev[`${location}-${groupType}`],
    }));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  const handleCarryForward = async () => {
    try {
      const { message } = await paymentService.carryForwardSchedules(
        currentMonth,
        currentYear
      );
      toast.success(message);
      const data = await paymentService.getPaymentSchedules(
        currentMonth,
        currentYear
      );
      setSchedules(data.filter((s) => s?.plot?.plotNumber));
    } catch (error) {
      console.error("Failed to carry forward schedules:", error);
      toast.error("Failed to carry forward schedules");
    }
  };

  const handleMarkPaid = (schedule) => {
    if (!schedule?.plot?.plotNumber) {
      toast.error("Invalid plot data");
      return;
    }
    setSelectedSchedule(schedule);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paidAmount) => {
    try {
      await paymentService.markScheduleAsPaid(selectedSchedule._id, paidAmount);
      toast.success("Payment recorded successfully");
      setShowPaymentModal(false);
      const data = await paymentService.getPaymentSchedules(
        currentMonth,
        currentYear
      );
      setSchedules(data.filter((s) => s?.plot?.plotNumber));
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      toast.error("Failed to record payment");
    }
  };

  // Calculate totals
  const totalExpected = schedules.reduce(
    (sum, s) => sum + (s?.expectedAmount || 0),
    0
  );
  const totalPaid = schedules.reduce((sum, s) => sum + (s?.paidAmount || 0), 0);
  const totalPending = totalExpected - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={handlePreviousMonth}
            icon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Previous
          </Button>
          <Button
            variant="success"
            onClick={handleCarryForward}
            icon={<ForwardIcon className="h-4 w-4" />}
          >
            Carry Forward
          </Button>
          <Button
            onClick={handleNextMonth}
            icon={<ArrowRightIcon className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">
              Total Expected
            </div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              Ksh {totalExpected.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">
              Total Collected
            </div>
            <div className="mt-1 text-3xl font-semibold text-green-600">
              Ksh {totalPaid.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">
              Pending
            </div>
            <div className="mt-1 text-3xl font-semibold text-red-600">
              Ksh {totalPending.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Grouped schedules */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-6 text-center">Loading payment schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="p-6 text-center">
            No payment schedules found for this month
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(groupedSchedules).map(([location, groups]) => (
              <div key={location} className="py-4 px-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleLocation(location)}
                >
                  <h3 className="text-lg font-medium">{location}</h3>
                  {expandedLocations[location] ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </div>

                {expandedLocations[location] && (
                  <div className="mt-4 space-y-4">
                    {/* All Schedules Group */}
                    <div className="border rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                        onClick={() => toggleGroup(location, "all")}
                      >
                        <div className="flex items-center">
                          {expandedGroups[`${location}-all`] ? (
                            <ChevronDownIcon className="h-5 w-5 mr-2" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                          )}
                          <span>All Schedules ({groups.all.length})</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Balance: Ksh{" "}
                          {groups.all
                            .reduce(
                              (sum, s) =>
                                sum + (s.expectedAmount - (s.paidAmount || 0)),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>

                      {expandedGroups[`${location}-all`] && (
                        <div className="p-3">
                          <ScheduleTable
                            schedules={groups.all}
                            handleMarkPaid={handleMarkPaid}
                          />
                        </div>
                      )}
                    </div>

                    {/* Fully Paid Schedules Group */}
                    <div className="border rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                        onClick={() => toggleGroup(location, "paid")}
                      >
                        <div className="flex items-center">
                          {expandedGroups[`${location}-paid`] ? (
                            <ChevronDownIcon className="h-5 w-5 mr-2" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                          )}
                          <span>
                            Fully Paid Schedules ({groups.paid.length})
                          </span>
                        </div>
                        <span className="text-sm text-green-600">
                          Total: Ksh{" "}
                          {groups.paid
                            .reduce((sum, s) => sum + (s.paidAmount || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>

                      {expandedGroups[`${location}-paid`] && (
                        <div className="p-3">
                          <ScheduleTable
                            schedules={groups.paid}
                            handleMarkPaid={handleMarkPaid}
                            showActions={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Partial Payments Group */}
                    <div className="border rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                        onClick={() => toggleGroup(location, "partial")}
                      >
                        <div className="flex items-center">
                          {expandedGroups[`${location}-partial`] ? (
                            <ChevronDownIcon className="h-5 w-5 mr-2" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                          )}
                          <span>
                            Partial Payments ({groups.partial.length})
                          </span>
                        </div>
                        <span className="text-sm text-yellow-600">
                          Balance: Ksh{" "}
                          {groups.partial
                            .reduce(
                              (sum, s) =>
                                sum + (s.expectedAmount - (s.paidAmount || 0)),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>

                      {expandedGroups[`${location}-partial`] && (
                        <div className="p-3">
                          <ScheduleTable
                            schedules={groups.partial}
                            handleMarkPaid={handleMarkPaid}
                          />
                        </div>
                      )}
                    </div>

                    {/* Pending Payments Group */}
                    <div className="border rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                        onClick={() => toggleGroup(location, "pending")}
                      >
                        <div className="flex items-center">
                          {expandedGroups[`${location}-pending`] ? (
                            <ChevronDownIcon className="h-5 w-5 mr-2" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                          )}
                          <span>
                            Pending Payments ({groups.pending.length})
                          </span>
                        </div>
                        <span className="text-sm text-red-600">
                          Total: Ksh{" "}
                          {groups.pending
                            .reduce((sum, s) => sum + s.expectedAmount, 0)
                            .toFixed(2)}
                        </span>
                      </div>

                      {expandedGroups[`${location}-pending`] && (
                        <div className="p-3">
                          <ScheduleTable
                            schedules={groups.pending}
                            handleMarkPaid={handleMarkPaid}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {showPaymentModal && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title={`Payment for Plot #${selectedSchedule.plot.plotNumber}`}
        >
          <PaymentForm
            expectedAmount={selectedSchedule.expectedAmount}
            currentBalance={
              selectedSchedule.expectedAmount -
              (selectedSchedule.paidAmount || 0)
            }
            onSubmit={handlePaymentSubmit}
            onCancel={() => setShowPaymentModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
