import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import plotService from "../../api/plots";
import locationService from "../../api/location";
import PlotForm from "../../components/forms/PlotForm";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";

const Plots = () => {
  const [plots, setPlots] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const plotsData = await plotService.getPlots();
      setPlots(plotsData);
    } catch (error) {
      toast.error("Failed to load plots");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await locationService.getLocations();
      setLocations(locationsData);
    } catch (error) {
      toast.error("Failed to load locations");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPlots(), fetchLocations()]);
    };
    loadData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingPlot) {
        await plotService.updatePlot(editingPlot._id, formData);
        toast.success("Plot updated successfully");
      } else {
        await plotService.createPlot(formData);
        toast.success("Plot created successfully");
      }
      fetchPlots();
      setShowForm(false);
      setEditingPlot(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save plot");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Plots</h2>
        <Button onClick={() => setShowForm(true)}>Add Plot</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading plots...</div>
      ) : plots.length === 0 ? (
        <div className="text-center py-8">No plots found</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plot Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primary Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plots.map((plot) => (
                <tr key={plot._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {plot.plotNumber || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plot.location?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plot.owners?.find((o) => o.isPrimary)?.name ||
                        "No owner"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingPlot(plot);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPlot(null);
        }}
        title={editingPlot ? "Edit Plot" : "Add New Plot"}
      >
        <PlotForm
          onSubmit={handleSubmit}
          initialData={editingPlot}
          locations={locations}
          onCancel={() => {
            setShowForm(false);
            setEditingPlot(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Plots;
