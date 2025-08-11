import { useState } from "react";
import { storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditUserProfile = ({ user, onSave }) => {
  // Firebase storage initialization
  // const storage = getStorage(app);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    mobile: user?.mobile || "",
    alternatemobile: user?.alternatemobile || "",
    photoURLFront: user?.photoURLFront || "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const storageRef = ref(storage, `user_photos/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setFormData({ ...formData, photoURLFront: downloadURL });
        alert("Photo uploaded successfully!");
      } catch (error) {
        console.error("Error uploading photo:", error);
        alert("Failed to upload photo. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        onSave(data); // Update parent component with new user data
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-gray-500 rounded-lg shadow-lg max-w-md mx-auto text-white"
    >
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-800 text-white"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-800 text-white"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-800 text-white"
          placeholder="Leave blank to keep current password"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Mobile</label>
        <input
          type="text"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-800 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Alternate Mobile</label>
        <input
          type="text"
          name="alternatemobile"
          value={formData.alternatemobile}
          onChange={handleChange}
          className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-800 text-white"
        />
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-2">Front ID Photo</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full text-gray-200"
        />
        {uploading && (
          <p className="text-orange-300 mt-2">Uploading photo...</p>
        )}
        {formData.photoURLFront && (
          <div className="mt-4">
            <img
              src={formData.photoURLFront}
              alt="Profile Preview"
              className="w-20 h-20 rounded-full mx-auto border border-gray-500"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        className={`w-full p-3 rounded bg-green-500 text-white font-semibold ${
          saving && "opacity-50 cursor-not-allowed"
        }`}
        disabled={saving}
      >
        {saving ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
};

export default EditUserProfile;
