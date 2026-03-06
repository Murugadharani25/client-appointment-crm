import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

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

    // Ensure CAPTCHA is answered
    if (!captchaAnswer.trim()) {
      setError("Invalid CAPTCHA. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...loginData,
        captcha_token: captchaToken,
        captcha_answer: captchaAnswer,
      };

      const res = await fetch("http://127.0.0.1:8000/api/admin-login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store admin login flag
        localStorage.setItem("adminLoggedIn", "true");

        // ✅ Redirect without popup
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Invalid admin credentials");
        // Reload CAPTCHA on error
        if (data.message && data.message.toLowerCase().includes("captcha")) {
          loadCaptcha();
          setCaptchaAnswer("");
        }
      }
    } catch (err) {
      setError("Server not connected. Please check backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch CAPTCHA when component mounts and on refresh
  const loadCaptcha = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/captcha/");
      const data = await res.json();
      setCaptchaQuestion(data.question || "");
      setCaptchaToken(data.token || "");
      setCaptchaAnswer("");
    } catch (err) {
      console.error("Failed to load CAPTCHA", err);
    }
  };

  // Load CAPTCHA on mount
  useEffect(() => {
    loadCaptcha();
  }, []);

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

          {/* CAPTCHA Section */}
          {captchaQuestion && (
            <>
              <label style={labelStyle}>CAPTCHA</label>
              <div style={styles.captchaContainer}>
                <div style={styles.captchaBox}>{captchaQuestion}</div>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  style={styles.refreshButton}
                  title="Generate new CAPTCHA"
                >
                  🔄
                </button>
              </div>
              <input
                type="text"
                name="captcha"
                placeholder="Enter the characters shown above"
                value={captchaAnswer}
                onChange={(e) => {
                  setCaptchaAnswer(e.target.value.toUpperCase());
                  setError("");
                }}
                required
                style={inputStyle}
              />
            </>
          )}

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

const captchaContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
};

const captchaBoxStyle = {
  flex: 1,
  padding: "12px",
  background: "#f3f4f6",
  border: "2px solid #d1d5db",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "20px",
  fontWeight: "bold",
  letterSpacing: "3px",
  textAlign: "center",
  userSelect: "none",
  color: "#111827",
};

const refreshButtonStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "2px solid #3b82f6",
  background: "#ffffff",
  color: "#3b82f6",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s ease",
  minWidth: "44px",
  minHeight: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const styles = {
  captchaContainer: captchaContainerStyle,
  captchaBox: captchaBoxStyle,
  refreshButton: refreshButtonStyle,
};
