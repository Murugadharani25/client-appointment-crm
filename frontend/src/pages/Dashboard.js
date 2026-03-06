import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [stats, setStats] = useState(null);
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

  // ✅ Fetch Appointments AND Stats on load
  useEffect(() => {
    fetchAppointments();
    fetchDashboardStats();
  }, []);

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

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const res = await appointmentAPI.getDashboardStats();
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

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
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: newStatus } : a
        )
      );

      // Refresh stats
      fetchDashboardStats();
    } catch (error) {
      console.error("❌ STATUS UPDATE FAILED:", error);
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

      const res = await appointmentAPI.uploadMinutesOfMeeting(
        appointmentId,
        formData
      );

      const momUrl = res?.data?.mom_url;

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, mom_url: momUrl } : a))
      );

      alert("✅ Minutes of Meeting PDF uploaded successfully!");
    } catch (error) {
      console.error("❌ PDF UPLOAD FAILED:", error);
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
            System statistics, today's appointments, and management tools.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={{ ...styles.btn, ...styles.btnLight }}
            onClick={() => {
              fetchAppointments();
              fetchDashboardStats();
            }}
            disabled={loading || statsLoading}
          >
            {loading || statsLoading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>

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

      {/* Statistics Cards Section */}
      {statsLoading ? (
        <div style={styles.loadingCard}>Loading statistics...</div>
      ) : stats ? (
        <>
          {/* Summary Statistics */}
          <div style={styles.statsGrid}>
            <StatCard
              title="Total Clients"
              value={stats.total_clients}
              icon="👥"
              bgColor="#e3f2fd"
              textColor="#1976d2"
            />
            <StatCard
              title="Total Appointments"
              value={stats.total_appointments}
              icon="📅"
              bgColor="#f3e5f5"
              textColor="#7b1fa2"
            />
            <StatCard
              title="Pending"
              value={stats.pending_count}
              icon="⏳"
              bgColor="#fff3e0"
              textColor="#f57c00"
            />
            <StatCard
              title="Confirmed"
              value={stats.confirmed_count}
              icon="✅"
              bgColor="#e8f5e9"
              textColor="#388e3c"
            />
            <StatCard
              title="Completed"
              value={stats.completed_count}
              icon="🎉"
              bgColor="#f1f8e9"
              textColor="#689f38"
            />
            <StatCard
              title="Cancelled"
              value={stats.cancelled_count}
              icon="❌"
              bgColor="#ffebee"
              textColor="#d32f2f"
            />
          </div>

          {/* Analytics Row: Chart + Today's Appointments */}
          <div style={styles.analyticsRow}>
            {/* Appointment Status Chart */}
            <div style={styles.chartCard}>
              <h3 style={styles.cardTitle}>📊 Appointment Status Distribution</h3>
              {stats.status_distribution && stats.status_distribution.some(s => s.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.status_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} appointment(s)`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={styles.noDataText}>No appointment data available</p>
              )}
            </div>

            {/* Today's Appointments */}
            <div style={styles.todayCard}>
              <h3 style={styles.cardTitle}>📅 Today's Appointments ({stats.today_count})</h3>
              {stats.todays_appointments && stats.todays_appointments.length > 0 ? (
                <div style={styles.appointmentList}>
                  {stats.todays_appointments.map((apt, index) => (
                    <div key={index} style={styles.appointmentItem}>
                      <div style={styles.aptTime}>{apt.time}</div>
                      <div style={styles.aptDetails}>
                        <span style={styles.aptName}>{apt.client_name}</span>
                        <span style={styles.aptService}>{apt.service}</span>
                      </div>
                      <span style={{...styles.aptStatus, background: getStatusColor(apt.status)}}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noDataText}>No appointments scheduled for today</p>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div style={styles.sectionCard}>
            <h3 style={styles.cardTitle}>🚀 Upcoming Appointments (Next 10)</h3>
            {stats.upcoming_appointments && stats.upcoming_appointments.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.miniTable}>
                  <thead>
                    <tr style={styles.miniTableHead}>
                      <th style={styles.miniTh}>Date</th>
                      <th style={styles.miniTh}>Time</th>
                      <th style={styles.miniTh}>Client</th>
                      <th style={styles.miniTh}>Service</th>
                      <th style={styles.miniTh}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upcoming_appointments.map((apt, index) => (
                      <tr key={index} style={styles.miniTableRow}>
                        <td style={styles.miniTd}>{apt.date}</td>
                        <td style={styles.miniTd}>{apt.time}</td>
                        <td style={styles.miniTd}>{apt.client_name}</td>
                        <td style={styles.miniTd}>{apt.service}</td>
                        <td style={{ ...styles.miniTd, background: getStatusColor(apt.status), color: "white", borderRadius: "4px" }}>{apt.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noDataText}>No upcoming appointments</p>
            )}
          </div>

          {/* Recent Clients */}
          <div style={styles.sectionCard}>
            <h3 style={styles.cardTitle}>🆕 Recent Clients (Last 5)</h3>
            {stats.recent_clients && stats.recent_clients.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.miniTable}>
                  <thead>
                    <tr style={styles.miniTableHead}>
                      <th style={styles.miniTh}>Name</th>
                      <th style={styles.miniTh}>Phone</th>
                      <th style={styles.miniTh}>Association</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_clients.map((client, index) => (
                      <tr key={index} style={styles.miniTableRow}>
                        <td style={styles.miniTd}>{client.name}</td>
                        <td style={styles.miniTd}>{client.phone}</td>
                        <td style={styles.miniTd}>{client.association || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noDataText}>No recent clients</p>
            )}
          </div>
        </>
      ) : null}

      {/* Main Appointments Table Card */}
      <div style={styles.tableCard}>
        <div style={styles.tableTop}>
          <h3 style={styles.tableTitle}>📅 All Appointments List</h3>

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

// ✅ Reusable Stat Card Component
function StatCard({ title, value, icon, bgColor, textColor }) {
  return (
    <div style={{ ...styles.statCard, background: bgColor }}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <p style={styles.statValue}>{value}</p>
        <p style={{ ...styles.statTitle, color: textColor }}>{title}</p>
      </div>
    </div>
  );
}

// ✅ Helper function to get status color
function getStatusColor(status) {
  switch (status) {
    case "Pending":
      return "#f59e0b";
    case "Confirmed":
      return "#3b82f6";
    case "Completed":
      return "#10b981";
    case "Cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
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

  loadingCard: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "18px",
    fontWeight: "600",
  },

  // ✅ STATISTICS CARDS GRID
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  statCard: {
    padding: "16px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0px 6px 16px rgba(0,0,0,0.08)",
  },

  statIcon: {
    fontSize: "28px",
  },

  statValue: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#111827",
  },

  statTitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    fontWeight: "600",
  },

  // ✅ ANALYTICS ROW (Chart + Today's)
  analyticsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginBottom: "18px",
  },

  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
  },

  todayCard: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
  },

  cardTitle: {
    margin: "0 0 14px",
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
  },

  appointmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  appointmentItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "10px",
    borderLeft: "4px solid #3b82f6",
  },

  aptTime: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    minWidth: "50px",
  },

  aptDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  aptName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111827",
  },

  aptService: {
    fontSize: "11px",
    color: "#6b7280",
  },

  aptStatus: {
    fontSize: "11px",
    fontWeight: "700",
    color: "white",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  noDataText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
    margin: "10px 0",
  },

  // ✅ SECTION CARDS
  sectionCard: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    marginBottom: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  miniTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "100%",
  },

  miniTableHead: {
    background: "#f9fafb",
  },

  miniTh: {
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "12px",
    color: "#111827",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  miniTableRow: {
    background: "white",
  },

  miniTd: {
    padding: "10px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "12px",
    color: "#111827",
    fontWeight: "600",
  },

  // ✅ MAIN APPOINTMENTS TABLE
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
