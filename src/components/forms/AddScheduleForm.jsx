import { useState, useEffect } from "react";
import { months } from "../../utils/dateUtils";
import Button from "../UI/Button";

const AddScheduleForm = ({ plot, defaultAmount = 0, onSave, onCancel }) => {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: currentYear,
    expectedAmount: defaultAmount,
    owner: plot.owners.length === 1 ? plot.owners[0]._id : "",
    ownerContact: plot.owners.length === 1 ? plot.owners[0].mobileNumber : "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      plotId: plot._id,
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plot.owners.length > 1 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Owner
            </label>
            <select
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Owner</option>
              {plot.owners.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.name} ({owner.mobileNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            value={formData.month}
            onChange={(e) =>
              setFormData({ ...formData, month: parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <input
            type="number"
            min={currentYear - 1}
            max={currentYear + 5}
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.expectedAmount}
            onChange={(e) =>
              setFormData({
                ...formData,
                expectedAmount: parseFloat(e.target.value),
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {plot.owners.length === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Owner Contact
            </label>
            <input
              type="tel"
              value={formData.ownerContact}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ownerContact: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Schedule</Button>
      </div>
    </form>
  );
};

export default AddScheduleForm;
