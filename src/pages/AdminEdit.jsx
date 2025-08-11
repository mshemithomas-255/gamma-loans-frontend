import React, { useState, useEffect } from "react";

const EditAdminPage = () => {
  const [adminDetails, setAdminDetails] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");

  // Fetch current admin details on page load
  useEffect(() => {
    fetch("/api/admin", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAdminDetails({
          name: data.name,
          email: data.email,
          password: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      })
      .catch((error) => {
        setMessage("Error fetching admin details");
      });
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { newPassword, confirmNewPassword } = adminDetails;

    if (newPassword && newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/admin/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(adminDetails),
      });

      const data = await response.json();

      if (data.name) {
        setMessage("Admin details updated successfully");
      } else {
        setMessage("Error updating details");
      }
    } catch (error) {
      setMessage("Error updating admin details");
    }
  };

  return (
    <div>
      <div>
        <Link to={"/admin"}>
          <span>Go to dashboard</span>
        </Link>
      </div>
      <h2>Edit Admin Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={adminDetails.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={adminDetails.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={adminDetails.newPassword}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={adminDetails.confirmNewPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Save Changes</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default EditAdminPage;
