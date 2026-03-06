import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import "../fullcalendar.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminCalendar() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL / TODAY
  const [searchClient, setSearchClient] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Protect Calendar Page (Admin Only)
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) {
      alert("❌ Please login first!");
      navigate("/admin-login");
    }
  }, [navigate]);

  // ✅ Fetch appointments
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

  // ✅ Status Color
  const getStatusColor = (status) => {
    if (status === "Pending") return "#facc15";
    if (status === "Confirmed") return "#22c55e";
    if (status === "Completed") return "#3b82f6";
    if (status === "Cancelled") return "#ef4444";
    return "#9ca3af";
  };

  // ✅ Status Short Badge
  const getStatusBadge = (status) => {
    if (status === "Pending") return "P";
    if (status === "Confirmed") return "C";
    if (status === "Completed") return "D";
    if (status === "Cancelled") return "X";
    return "?";
  };

  // ✅ Convert CAPS to Title Case
  const toTitleCase = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // ✅ Format time (remove seconds)
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5); // HH:MM
  };

  // ✅ Get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ✅ Service dropdown options
  const serviceOptions = useMemo(() => {
    const services = appointments
      .map((a) => (a.service || "").trim())
      .filter(Boolean);

    return ["ALL", ...Array.from(new Set(services))];
  }, [appointments]);

  // ✅ Filtered appointments
  const filteredAppointments = useMemo(() => {
    const today = getTodayDate();

    return appointments.filter((a) => {
      const clientName = toTitleCase(a.client_name || "");
      const service = (a.service || "").trim();
      const status = a.status || "";
      const apptDate = a.date || "";

      // Status filter
      const statusOk = statusFilter === "ALL" ? true : status === statusFilter;

      // Today filter
      const dateOk = dateFilter === "ALL" ? true : apptDate === today;

      // Search filter
      const search = searchClient.trim().toLowerCase();
      const searchOk = search
        ? clientName.toLowerCase().includes(search) ||
          service.toLowerCase().includes(search)
        : true;

      // Service filter
      const serviceOk = serviceFilter === "ALL" ? true : service === serviceFilter;

      // Date range
      const fromOk = fromDate ? apptDate >= fromDate : true;
      const toOk = toDate ? apptDate <= toDate : true;

      return statusOk && dateOk && searchOk && serviceOk && fromOk && toOk;
    });
  }, [
    appointments,
    statusFilter,
    dateFilter,
    searchClient,
    serviceFilter,
    fromDate,
    toDate,
  ]);

  // ✅ Convert appointments -> calendar events
  const calendarEvents = useMemo(() => {
    return filteredAppointments.map((a) => {
      const startDateTime = `${a.date}T${formatTime(a.time)}`;

      const clientName = toTitleCase(a.client_name || "Client");
      const service = a.service || "Service";
      const status = a.status || "Pending";

      return {
        id: a.id,
        title: `${clientName} (${service})`,
        start: startDateTime,
        backgroundColor: getStatusColor(status),
        borderColor: getStatusColor(status),
        textColor: "#111827",
        extendedProps: {
          client_name: clientName,
          phone: a.client_phone || "-",
          association: a.client_association || "-",
          service: service,
          status: status,
          notes: a.notes || "-",
          mom_url: a.mom_url || null,
          date: a.date || "-",
          time: formatTime(a.time) || "-",
        },
      };
    });
  }, [filteredAppointments]);

  // ✅ Download Filtered PDF
  const downloadFilteredPDF = () => {
    if (filteredAppointments.length === 0) {
      alert("⚠️ No appointments found for selected filters!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Appointments Report", 14, 15);

    doc.setFontSize(11);
    doc.text(
      `Status: ${statusFilter} | Date: ${dateFilter} | Service: ${serviceFilter}`,
      14,
      22
    );
    doc.text(
      `From: ${fromDate || "-"} | To: ${toDate || "-"} | Search: ${
        searchClient || "None"
      }`,
      14,
      28
    );

    autoTable(doc, {
      startY: 35,
      head: [["#", "Client", "Phone", "Date", "Time", "Service", "Status"]],
      body: filteredAppointments.map((a, index) => [
        index + 1,
        toTitleCase(a.client_name) || "-",
        a.client_phone || "-",
        a.date || "-",
        formatTime(a.time) || "-",
        a.service || "-",
        a.status || "-",
      ]),
    });

    doc.save("appointments_report.pdf");
  };

  // ✅ Reset Filters
  const resetFilters = () => {
    setStatusFilter("ALL");
    setDateFilter("ALL");
    setSearchClient("");
    setServiceFilter("ALL");
    setFromDate("");
    setToDate("");
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    alert("✅ Logged out successfully!");
    navigate("/admin-login");
  };

  // ✅ Close Modal
  const closeModal = () => setSelectedEvent(null);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div>
          <h2 style={styles.heading}>🗓️ Calendar View</h2>
          <p style={styles.subHeading}>
            View, filter and download appointment reports professionally.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={{ ...styles.btn, ...styles.btnLight }}
            onClick={() => navigate("/admin-dashboard")}
          >
            ⬅ Back
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnLight }}
            onClick={fetchAppointments}
            disabled={loading}
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnBlue }}
            onClick={downloadFilteredPDF}
          >
            📄 Download PDF
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnGray }}
            onClick={resetFilters}
          >
            ♻ Reset
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          {/* Status */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Status</label>
            <select
              style={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Date</label>
            <select
              style={styles.select}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
            </select>
          </div>

          {/* Service */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Service</label>
            <select
              style={styles.select}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Services" : s}
                </option>
              ))}
            </select>
          </div>

          {/* From */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>From</label>
            <input
              type="date"
              style={styles.input}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>To</label>
            <input
              type="date"
              style={styles.input}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Search */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Search</label>
            <input
              style={styles.input}
              placeholder="Search client / service..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
            />
          </div>

          {/* Result */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Result</label>
            <div style={styles.resultBox}>{filteredAppointments.length}</div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div style={styles.calendarCard}>
        {loading ? (
          <p style={styles.infoText}>Loading calendar...</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            events={calendarEvents}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            nowIndicator={true}
            displayEventEnd={false}
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short",
              hour12: true,
            }}
            eventDidMount={(info) => {
              const p = info.event.extendedProps;

              info.el.title =
                `Client: ${p.client_name}\n` +
                `Phone: ${p.phone}\n` +
                `Service: ${p.service}\n` +
                `Status: ${p.status}\n` +
                `Date: ${p.date}\n` +
                `Time: ${p.time}`;

              const badge = document.createElement("span");
              badge.className = "vconnect-badge";
              badge.innerText = getStatusBadge(p.status);
              info.el.prepend(badge);
            }}
            eventClick={(info) => {
              setSelectedEvent({
                title: info.event.title,
                ...info.event.extendedProps,
              });
            }}
          />
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📌 Appointment Details</h3>
              <button style={styles.closeBtn} onClick={closeModal}>
                ✖
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={styles.modalLine}>
                <b>Client:</b> {selectedEvent.client_name}
              </p>
              <p style={styles.modalLine}>
                <b>Phone:</b> {selectedEvent.phone}
              </p>
              <p style={styles.modalLine}>
                <b>Association:</b> {selectedEvent.association}
              </p>
              <p style={styles.modalLine}>
                <b>Service:</b> {selectedEvent.service}
              </p>
              <p style={styles.modalLine}>
                <b>Date:</b> {selectedEvent.date}
              </p>
              <p style={styles.modalLine}>
                <b>Time:</b> {selectedEvent.time}
              </p>
              <p style={styles.modalLine}>
                <b>Status:</b> {selectedEvent.status}
              </p>
              <p style={styles.modalLine}>
                <b>Notes:</b> {selectedEvent.notes}
              </p>

              {selectedEvent.mom_url && (
                <a
                  href={selectedEvent.mom_url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.momBtn}
                >
                  📄 View MOM PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ Styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #7b2ff7, #ff4fd8)",
    padding: "22px",
    fontFamily: "Segoe UI, Arial, sans-serif",
    width: "100%",
    overflowX: "hidden",
    boxSizing: "border-box",
  },

  headerCard: {
    background: "white",
    padding: "18px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "14px",
    width: "100%",
    boxSizing: "border-box",
  },

  heading: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "900",
    color: "#111827",
  },

  subHeading: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "600",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  btn: {
    padding: "9px 14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "13px",
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

  btnGray: {
    background: "#f3f4f6",
    color: "#111827",
  },

  btnDanger: {
    background: "#ff4fd8",
    color: "white",
  },

  filterCard: {
    background: "white",
    padding: "14px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
    marginBottom: "14px",
    width: "100%",
    boxSizing: "border-box",
  },

  /* ✅ RESPONSIVE FILTER GRID */
  filterRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    alignItems: "end",
  },

  filterItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },

  filterLabel: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#374151",
  },

  select: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.12)",
    fontWeight: "800",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.12)",
    fontWeight: "800",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  resultBox: {
    padding: "10px 12px",
    borderRadius: "12px",
    background: "#f3f4f6",
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  calendarCard: {
    background: "white",
    padding: "16px",
    borderRadius: "18px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    boxSizing: "border-box",
  },

  infoText: {
    marginTop: "14px",
    color: "#374151",
    fontWeight: "700",
  },

  /* Modal */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
    zIndex: 9999,
  },

  modalCard: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0px 20px 60px rgba(0,0,0,0.35)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "900",
    color: "#111827",
  },

  closeBtn: {
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    borderRadius: "10px",
    padding: "6px 10px",
    fontWeight: "900",
  },

  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  modalLine: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    lineHeight: "1.6",
  },

  momBtn: {
    marginTop: "10px",
    display: "inline-block",
    textAlign: "center",
    background: "#2563eb",
    color: "white",
    padding: "10px 12px",
    borderRadius: "12px",
    fontWeight: "900",
    textDecoration: "none",
  },
};
