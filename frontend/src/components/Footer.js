import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* 1) Brand */}
        <div style={styles.section}>
          <h3 style={styles.brand}>Vconnect</h3>
          <p style={styles.desc}>
            Smart appointment booking & admin management system for your business.
          </p>

          <div style={styles.socialRow}>
            <span style={styles.socialIcon}>🌐</span>
            <span style={styles.socialIcon}>📷</span>
            <span style={styles.socialIcon}>💼</span>
          </div>
        </div>

        {/* 2) Quick Links */}
        <div style={styles.section}>
          <h4 style={styles.title}>Quick Links</h4>

          <p style={styles.link} onClick={() => navigate("/")}>
            Home
          </p>

          <p style={styles.link} onClick={() => navigate("/book-appointment")}>
            Book Appointment
          </p>

          <p style={styles.link} onClick={() => navigate("/admin-login")}>
            Admin Login
          </p>
        </div>

        {/* 3) Features */}
        <div style={styles.section}>
          <h4 style={styles.title}>Features</h4>
          <p style={styles.text}>✔ Appointment Scheduling</p>
          <p style={styles.text}>✔ Admin Dashboard</p>
          <p style={styles.text}>✔ Client Management</p>
          <p style={styles.text}>✔ PDF Reports</p>
        </div>

        {/* 4) Contact */}
        <div style={styles.section}>
          <h4 style={styles.title}>Contact</h4>

          <p style={styles.text}>
            <b>Head Office:</b>
          </p>
          <p style={styles.text}>
            14B/1, Briyant Nagar 9th Street East, <br />
            Tuticorin – 628008
          </p>

          <p style={{ ...styles.text, marginTop: "10px" }}>
            <b>Branch Office:</b>
          </p>
          <p style={styles.text}>
            52A/2/3, 1st Floor, 3rd Mile, Madathur Road, <br />
            Tuticorin – 628008
          </p>

          <p style={{ ...styles.text, marginTop: "10px" }}>
            📞 +91 8754309295
          </p>
          <p style={styles.text}>✉️ vconnect@vienstereoptic.com</p>
        </div>
      </div>

      {/* Bottom */}
      <div style={styles.bottom}>
        <p style={styles.copy}>© {year} Vconnect. All rights reserved.</p>
        <p style={styles.mini}>Built with ❤️ for better appointment management.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "50px",
    background: "linear-gradient(90deg, #6D28D9, #EC4899)",
    color: "white",
    padding: "40px 20px 18px",
  },

  container: {
    maxWidth: "1150px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "25px",
    alignItems: "start",
  },

  section: {
    minWidth: "220px",
  },

  brand: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "0.3px",
  },

  desc: {
    margin: "10px 0 14px",
    fontSize: "13px",
    color: "#e5e7eb",
    fontWeight: "600",
    lineHeight: "1.6",
  },

  title: {
    margin: "0 0 12px",
    fontSize: "14px",
    fontWeight: "900",
    letterSpacing: "0.2px",
    textTransform: "uppercase",
  },

  text: {
    margin: "8px 0",
    fontSize: "13px",
    color: "#d1d5db",
    fontWeight: "600",
    lineHeight: "1.5",
  },

  link: {
    margin: "9px 0",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    color: "#d1d5db",
    transition: "0.2s",
  },

  socialRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  socialIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.15)",
    fontSize: "16px",
    cursor: "pointer",
  },

  bottom: {
    borderTop: "1px solid rgba(255,255,255,0.15)",
    marginTop: "28px",
    paddingTop: "14px",
    textAlign: "center",
  },

  copy: {
    margin: 0,
    fontSize: "12px",
    color: "#f3f4f6",
    fontWeight: "700",
  },

  mini: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#d1d5db",
    fontWeight: "600",
  },
};
