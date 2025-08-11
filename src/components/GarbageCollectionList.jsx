import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Dashboard from "../pages/garbage-app/Dashboard";
import Locations from "../pages/garbage-app/Locations";
import Plots from "../pages/garbage-app/Plots";

const GarbageCollectionApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Garbage Collection
                </h1>
              </div>
              <nav className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === "dashboard"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("locations")}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === "locations"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Locations
                </button>
                <button
                  onClick={() => setActiveTab("plots")}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === "plots"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Plots
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "locations" && <Locations />}
          {activeTab === "plots" && <Plots />}
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default GarbageCollectionApp;
