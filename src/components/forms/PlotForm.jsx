import { useState, useEffect } from "react";
import Button from "../UI/Button";

const PlotForm = ({ onSubmit, initialData, onCancel, locations }) => {
  const [formData, setFormData] = useState({
    plotNumber: "",
    location: "",
    owners: [
      { name: "", mobileNumber: "", sharePercentage: 100, isPrimary: true },
    ],
    bagsPerCollection: 1,
    expectedAmount: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        plotNumber: initialData.plotNumber || "",
        location: initialData.location?._id || initialData.location || "",
        owners: initialData.owners?.length
          ? initialData.owners.map((owner) => ({
              name: owner.name || "",
              mobileNumber: owner.mobileNumber || "",
              sharePercentage: owner.sharePercentage || 100,
              isPrimary: owner.isPrimary || false,
            }))
          : [
              {
                name: "",
                mobileNumber: "",
                sharePercentage: 100,
                isPrimary: true,
              },
            ],
        bagsPerCollection: initialData.bagsPerCollection || 1,
        expectedAmount: initialData.expectedAmount || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (index, field, value) => {
    const updatedOwners = [...formData.owners];
    updatedOwners[index][field] = value;

    if (field === "isPrimary" && value) {
      updatedOwners.forEach((owner, i) => {
        if (i !== index) owner.isPrimary = false;
      });
    }

    setFormData((prev) => ({ ...prev, owners: updatedOwners }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate owner shares
    const totalShare = formData.owners.reduce(
      (sum, owner) => sum + (owner.sharePercentage || 0),
      0
    );

    if (totalShare !== 100) {
      alert("Owner shares must total 100%");
      return;
    }

    if (!formData.plotNumber) {
      alert("Plot number is required");
      return;
    }

    if (!formData.location) {
      alert("Location is required");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plot Number *
          </label>
          <input
            type="text"
            name="plotNumber"
            value={formData.plotNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bags Per Collection
          </label>
          <input
            type="number"
            name="bagsPerCollection"
            min="1"
            value={formData.bagsPerCollection}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expected Amount
          </label>
          <input
            type="number"
            name="expectedAmount"
            min="0"
            value={formData.expectedAmount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Owners</h3>
        {formData.owners.map((owner, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={owner.name}
                  onChange={(e) =>
                    handleOwnerChange(index, "name", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={owner.mobileNumber}
                  onChange={(e) =>
                    handleOwnerChange(index, "mobileNumber", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Share % *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={owner.sharePercentage}
                  onChange={(e) =>
                    handleOwnerChange(
                      index,
                      "sharePercentage",
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={owner.isPrimary}
                  onChange={(e) =>
                    handleOwnerChange(index, "isPrimary", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Primary Owner
                </span>
              </label>
              {formData.owners.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newOwners = [...formData.owners];
                    newOwners.splice(index, 1);
                    setFormData({ ...formData, owners: newOwners });
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Owner
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              owners: [
                ...formData.owners,
                {
                  name: "",
                  mobileNumber: "",
                  sharePercentage: 0,
                  isPrimary: false,
                },
              ],
            });
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Add Another Owner
        </button>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Plot" : "Create Plot"}
        </Button>
      </div>
    </form>
  );
};

export default PlotForm;
