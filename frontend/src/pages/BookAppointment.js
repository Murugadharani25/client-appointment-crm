import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../api";

export default function BookAppointment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    association: "None",
    service: "None",
    date: "",
    time: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});
  const [clientStatus, setClientStatus] = useState("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Debounced phone checking function
  const checkPhoneNumber = useCallback(async (phone) => {
    if (!phone || phone.length !== 10 || !phone.match(/^\d{10}$/)) {
      setClientStatus("");
      return;
    }

    setIsCheckingPhone(true);
    try {
      const response = await appointmentAPI.getClientByPhone(phone);
      const data = response.data;

      if (data.exists) {
        // Auto-fill client data
        setFormData(prev => ({
          ...prev,
          name: data.client.name,
          email: data.client.email,
          address: data.client.address,
          association: data.client.association,
        }));
        setClientStatus("existing");
      } else {
        setClientStatus("new");
      }
    } catch (error) {
      console.error("Error checking phone:", error);
      setClientStatus("");
    } finally {
      setIsCheckingPhone(false);
    }
  }, []);

  // Debounce phone number checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkPhoneNumber(formData.phone);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.phone, checkPhoneNumber]);

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email (example@gmail.com)";
    }

    if (!formData.date) newErrors.date = "Appointment date is required";
    if (!formData.time) newErrors.time = "Appointment time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("❌ Please fix the highlighted errors");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await appointmentAPI.bookAppointment(formData);

      setMessage("✅ Appointment booked successfully! Confirmation sent to email.");
      setMessageType("success");

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        association: "None",
        service: "IT Software",
        date: "",
        time: "",
        notes: "",
      });

      setErrors({});

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);

      let errorMsg = "❌ Failed to book appointment. Please try again.";
      if (error.response?.data?.error) {
        errorMsg = `❌ ${error.response.data.error}`;
      } else if (error.response?.data?.message) {
        errorMsg = `❌ ${error.response.data.message}`;
      }

      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>📅 Book Appointment</h2>
          <p style={styles.subTitle}>
            Fill the form below to schedule your appointment.
          </p>
        </div>

        {message && (
          <div
            style={{
              ...styles.messageBox,
              background:
                messageType === "success"
                  ? "#d4edda"
                  : messageType === "error"
                  ? "#f8d7da"
                  : "#d1ecf1",
              color:
                messageType === "success"
                  ? "#155724"
                  : messageType === "error"
                  ? "#721c24"
                  : "#0c5460",
            }}
          >
            {message}
          </div>
        )}

        {clientStatus && (
          <div
            style={{
              ...styles.messageBox,
              background: clientStatus === "existing" ? "#d4edda" : "#fff3cd",
              color: clientStatus === "existing" ? "#155724" : "#856404",
              border: clientStatus === "existing" ? "1px solid #c3e6cb" : "1px solid #ffeaa7",
            }}
          >
            {clientStatus === "existing"
              ? "Existing client details found. Information has been pre-filled and can be updated."
  : "New client. Please enter your details to proceed."

            }
            {isCheckingPhone && <span style={{ marginLeft: "10px" }}>🔄 Checking...</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>
              Full Name <span style={styles.star}>*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.name ? "#e11d48" : "#d1d5db",
              }}
            />
            <p style={styles.errorSpace}>{errors.name || ""}</p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Phone Number <span style={styles.star}>*</span>
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.phone ? "#e11d48" : "#d1d5db",
              }}
            />
            <p style={styles.errorSpace}>{errors.phone || ""}</p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Email <span style={styles.star}>*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.email ? "#e11d48" : "#d1d5db",
              }}
            />
            <p style={styles.errorSpace}>{errors.email || ""}</p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Association</label>
            <select
              name="association"
              value={formData.association}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="None">None</option>
              <option value="YES">YES</option>
              <option value="JCOM">JCOM</option>
              <option value="JCI">JCI</option>
              <option value="Rotary">Rotary</option>
              <option value="THUDITSSIA">THUDITSSIA</option>
              <option value="Builder Association">Builder Association</option>
            </select>
            <p style={styles.errorSpace}></p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Service Type</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="None">None</option>
              <option value="IT Software">IT Software</option>
              <option value="IT Hardware">IT Hardware</option>
              <option value="Academy">Academy</option>
              <option value="HRMS">HRMS</option>
              <option value="Event Management">Event Management</option>
              <option value="Industrial Solutions">Industrial Solutions</option>
            </select>
            <p style={styles.errorSpace}></p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Appointment Date <span style={styles.star}>*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.date ? "#e11d48" : "#d1d5db",
              }}
            />
            <p style={styles.errorSpace}>{errors.date || ""}</p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Appointment Time <span style={styles.star}>*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.time ? "#e11d48" : "#d1d5db",
              }}
            />
            <p style={styles.errorSpace}>{errors.time || ""}</p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Address (Optional)</label>
            <input
              type="text"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
            />
            <p style={styles.errorSpace}></p>
          </div>

          <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
            <label style={styles.label}>Notes (Optional)</label>
            <textarea
              name="notes"
              placeholder="Tell us your requirement..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              style={{ ...styles.input, resize: "none" }}
            />
            <p style={styles.errorSpace}></p>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? "🔄 Booking..." : "✅ Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #7b2ff7, #ff4fd8)",
    padding: "30px",
    fontFamily: "Arial",
  },

  card: {
    background: "white",
    maxWidth: "950px",
    margin: "30px auto",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.25)",
  },

  header: {
    marginBottom: "20px",
    textAlign: "center",
  },

  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "800",
    color: "#111827",
  },

  subTitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  messageBox: {
    padding: "12px",
    marginBottom: "18px",
    borderRadius: "10px",
    textAlign: "center",
    fontWeight: "bold",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontWeight: "700",
    marginBottom: "6px",
    color: "#111827",
    fontSize: "14px",
  },

  star: {
    color: "#e11d48",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  errorSpace: {
    minHeight: "16px",
    marginTop: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#e11d48",
  },

  submitBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#7b2ff7",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    opacity: 1,
  },
};
