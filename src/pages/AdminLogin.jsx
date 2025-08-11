import { useState } from "react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/admin";
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center">
      <div className="text-white items-center">
        <p className="text-3xl mb-4">
          This is a restricted page. Do not share the link
        </p>
        <p className="mb-4">
          Enter your credentials to access the admin dashboard
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border p-2 w-full"
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
