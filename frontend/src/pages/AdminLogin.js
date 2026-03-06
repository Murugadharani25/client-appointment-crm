import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(""); // clear error while typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin-login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store admin login flag
        localStorage.setItem("adminLoggedIn", "true");

        // ✅ Redirect without popup
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Invalid admin credentials");
      }
    } catch (err) {
      setError("Server not connected. Please check backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          🔐 Admin Login
        </h2>

        <form onSubmit={handleLogin}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter admin username"
            value={loginData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter admin password"
            value={loginData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {/* ❌ Error Message (No Popup) */}
          {error && (
            <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          style={{ ...buttonStyle, background: "#7b2ff7", marginTop: "15px" }}
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(to right, #7b2ff7, #ff4fd8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Arial",
};

const cardStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "20px",
  width: "400px",
  boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
};

const labelStyle = {
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "#ff4fd8",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
};
