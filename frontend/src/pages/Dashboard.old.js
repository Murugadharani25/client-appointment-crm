import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  // ✅ Protect Dashboard (Admin Only)
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) {
      alert("❌ Please login first!");
      navigate("/admin-login");
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAppointments();
      setAppointments(res.data || []);
    } catch (error) {
      console.log(error);
      alert("❌ Failed to load appointments. Check backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ✅ Filter Search
  const filteredAppointments = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return appointments;

    return appointments.filter((a) => {
      const name = (a.client_name || "").toLowerCase();
      const phone = (a.client_phone || "").toLowerCase();
      const service = (a.service || "").toLowerCase();
      const association = (a.client_association || "").toLowerCase();

      return (
        name.includes(s) ||
        phone.includes(s) ||
        service.includes(s) ||
        association.includes(s)
      );
    });
  }, [appointments, search]);

  // ✅ Update Status
  const updateStatus = async (appointmentId, newStatus) => {
    try {
      setSavingId(appointmentId);

      // 🔥 Backend API should update DB
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus);

      // Update UI immediately
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: newStatus } : a
        )
      );
    } catch (error) {
      console.error("❌ STATUS UPDATE FAILED:");
      console.error("Error Message:", error.message);
      console.error("Backend Response:", error.response?.data);
      console.error("Status Code:", error.response?.status);
      console.error("Full Error:", error);

      alert(`❌ Failed to update status: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  };

  // ✅ Upload Minutes of Meeting PDF
  const uploadMoM = async (appointmentId, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("❌ Only PDF files allowed");
      return;
    }

    try {
      setUploadingId(appointmentId);

      const formData = new FormData();
      formData.append("mom_pdf", file);

      // 🔥 Backend API should save PDF and return URL
      const res = await appointmentAPI.uploadMinutesOfMeeting(
        appointmentId,
        formData
      );

      const momUrl = res?.data?.mom_url;

      // Update UI
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, mom_url: momUrl } : a))
      );

      alert("✅ Minutes of Meeting PDF uploaded successfully!");
    } catch (error) {
      console.error("❌ PDF UPLOAD FAILED:");
      console.error("Error Message:", error.message);
      console.error("Backend Response:", error.response?.data);
      console.error("Status Code:", error.response?.status);
      console.error("Full Error:", error);

      alert(`❌ Failed to upload PDF: ${error.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  // ✅ Export Table as PDF
  const exportAppointmentsPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Appointments Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "#",
          "Name",
          "Phone",
          "Association",
          "Service",
          "Date",
          "Time",
          "Status",
        ],
      ],
      body: filteredAppointments.map((a, index) => [
        index + 1,
        a.client_name || "-",
        a.client_phone || "-",
        a.client_association || "N/A",
        a.service || "-",
        a.date || "-",
        a.time || "-",
        a.status || "Pending",
      ]),
    });

    doc.save("appointments_report.pdf");
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    alert("✅ Logged out successfully!");
    navigate("/admin-login");
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div>
          <h2 style={styles.heading}>📌 Admin Dashboard</h2>
          <p style={styles.subHeading}>
            Update status, upload MoM PDF, export report, and view calendar.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={{ ...styles.btn, ...styles.btnLight }}
            onClick={fetchAppointments}
            disabled={loading}
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>

          {/* ✅ Calendar View */}
          <button
            style={{ ...styles.btn, ...styles.btnBlue }}
            onClick={() => navigate("/admin-calendar")}
          >
            🗓️ Calendar View
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnBlue }}
            onClick={exportAppointmentsPDF}
          >
            📄 Export PDF
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div style={styles.tableCard}>
        <div style={styles.tableTop}>
          <h3 style={styles.tableTitle}>📅 Appointments List</h3>

          <input
            type="text"
            placeholder="Search by name / phone / service / association..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p style={styles.infoText}>Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <p style={styles.infoText}>No appointments found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Association</th>
                  <th style={styles.th}>Service</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>MoM PDF</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((a, index) => (
                  <tr key={a.id || index} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{a.client_name || "-"}</td>
                    <td style={styles.td}>{a.client_phone || "-"}</td>
                    <td style={styles.td}>{a.client_association || "N/A"}</td>
                    <td style={styles.td}>{a.service || "-"}</td>
                    <td style={styles.td}>{a.date || "-"}</td>
                    <td style={styles.td}>{a.time || "-"}</td>

                    {/* ✅ Status Update */}
                    <td style={styles.td}>
                      <select
                        value={a.status || "Pending"}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        style={styles.statusSelect}
                        disabled={savingId === a.id}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* ✅ MoM Upload */}
                    <td style={styles.td}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => uploadMoM(a.id, e.target.files?.[0])}
                          disabled={uploadingId === a.id}
                        />

                        {a.mom_url && (
                          <a
                            href={a.mom_url}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.pdfLink}
                          >
                            📎 View PDF
                          </a>
                        )}

                        {uploadingId === a.id && (
                          <span style={{ fontSize: "12px" }}>Uploading...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ✅ Styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #7b2ff7, #ff4fd8)",
    padding: "24px",
    fontFamily: "Arial",
  },

  headerCard: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "18px",
  },

  heading: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
  },

  subHeading: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  btn: {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0px 6px 16px rgba(0,0,0,0.12)",
  },

  btnLight: {
    background: "#ffffff",
    color: "#111827",
  },

  btnBlue: {
    background: "#2563eb",
    color: "white",
  },

  btnDanger: {
    background: "#ff4fd8",
    color: "white",
  },

  tableCard: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
  },

  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },

  tableTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
  },

  searchInput: {
    minWidth: "280px",
    flex: 1,
    maxWidth: "420px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },

  infoText: {
    marginTop: "14px",
    color: "#374151",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  tableHeadRow: {
    background: "#f9fafb",
  },

  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#111827",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  tr: {
    background: "white",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#111827",
    fontWeight: "600",
    whiteSpace: "nowrap",
    verticalAlign: "top",
  },

  statusSelect: {
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    cursor: "pointer",
    fontWeight: "700",
  },

  pdfLink: {
    marginTop: "6px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563eb",
    textDecoration: "none",
  },
};
