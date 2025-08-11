import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase"; // Ensure Firebase Storage is properly initialized

const Settings = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    idNumber: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    profilePhoto: "",
    idFrontPhoto: "",
    idBackPhoto: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("token"); // Clear invalid token
        toast.error("You must be logged in to view this page.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          "https://gamma-loans-backend.vercel.app/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to fetch user data.");
        }

        const data = await response.json();
        setUser({
          fullName: data.fullName,
          email: data.email,
          idNumber: data.idNumber,
          mobileNumber: data.mobileNumber,
          alternateMobileNumber: data.alternateMobileNumber,
          profilePhoto: data.profilePhoto,
          idFrontPhoto: data.idFrontPhoto,
          idBackPhoto: data.idBackPhoto,
        });
      } catch (error) {
        console.error(error);
        toast.error(error.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/users/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/users/change-password",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordChanged(true);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file, field) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and GIF images are allowed.");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `myusers/${user._id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUser((prevUser) => ({ ...prevUser, [field]: downloadURL }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image.");
      setUser((prevUser) => ({ ...prevUser, [field]: "" })); // Clear the field on error
    } finally {
      setUploading(false);
    }
  };

  // Validate profile fields
  const validateProfile = () => {
    if (!user.fullName || !user.email || !user.mobileNumber || !user.idNumber) {
      toast.error("All fields are required.");
      return false;
    }

    if (!/^\d{10}$/.test(user.mobileNumber)) {
      toast.error("Mobile number must be 10 digits.");
      return false;
    }

    if (!/^\d{8}$/.test(user.idNumber)) {
      toast.error("ID number must be 8 digits.");
      return false;
    }

    return true;
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Profile Update Form */}
      <form onSubmit={handleSubmit} className="max-w-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        {/* Form fields for profile update */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={user.fullName}
            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ID Number</label>
          <input
            type="text"
            value={user.idNumber}
            onChange={(e) => setUser({ ...user, idNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Mobile Number
          </label>
          <input
            type="text"
            value={user.mobileNumber}
            onChange={(e) => setUser({ ...user, mobileNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Alternate Mobile Number
          </label>
          <input
            type="text"
            value={user.alternateMobileNumber}
            onChange={(e) =>
              setUser({ ...user, alternateMobileNumber: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Image Upload Fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Profile Photo
          </label>
          <input
            type="file"
            onChange={(e) =>
              handleImageUpload(e.target.files[0], "profilePhoto")
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          {user.profilePhoto && (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="mt-2 w-20 h-20 rounded-full"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ID Front Photo
          </label>
          <input
            type="file"
            onChange={(e) =>
              handleImageUpload(e.target.files[0], "idFrontPhoto")
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          {user.idFrontPhoto && (
            <img
              src={user.idFrontPhoto}
              alt="ID Front"
              className="mt-2 w-20 h-20"
            />
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            ID Back Photo
          </label>
          <input
            type="file"
            onChange={(e) =>
              handleImageUpload(e.target.files[0], "idBackPhoto")
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          {user.idBackPhoto && (
            <img
              src={user.idBackPhoto}
              alt="ID Back"
              className="mt-2 w-20 h-20"
            />
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handlePasswordChange} className="max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmNewPassword: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
