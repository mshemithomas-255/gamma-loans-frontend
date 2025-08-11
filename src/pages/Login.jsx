import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="text-white max-w-6xl justify-between mx-auto">
      <div className="flex flex-col md:flex-row mt-5">
        <div className="md:block md:w-[600px] px-4">
          <p className="md:text-6xl text-4xl justify-center mb-2 mt-2">
            Welcome Back to <span className="text-[#b9283b]">Gammaridge!</span>
          </p>
          <p className="mb-2 md:text-xl text-lg">
            We’re glad to see you again. Log in to access your dashboard, manage
            your loans, and stay on top of your financial journey.
          </p>
        </div>

        <div className="flex flex-col p-6 w-full lg:w-[600px]">
          {/* form side */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <button
              type="submit"
              className="bg-[#b9283b] rounded-md text-white py-2 px-4"
            >
              Login
            </button>
          </form>

          <div className="">
            <p className="mt-4">
              Don&apos;t have an account?
              <Link to="/register">
                <span className="text-[#b9283b]"> register</span>
              </Link>
            </p>
            <Link to="/forgot-password">
              <p>Forgot password? </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
