import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <section style={styles.hero}>
        {/* Background Video */}
        <video autoPlay muted loop playsInline style={styles.video}>
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Light overlay only for readability */}
        <div style={styles.overlay} />

        {/* Content */}
        <div style={styles.container}>
          <div style={styles.left}>
            <div style={styles.badge}>✨ Smart & Secure Booking</div>

            <h1 style={styles.title}>
              Book Your IT Services <br />
              <span style={styles.titleHighlight}>In Minutes</span>
            </h1>

            <p style={styles.subtitle}>
              Schedule appointments for <b>IT Software</b>, <b>IT Hardware</b>,{" "}
              <b>AMC Services</b> and <b>Website Development</b>.
              <br />
              Fast confirmation • Professional support • Transparent service.
            </p>

            <div style={styles.btnRow}>
              <button style={styles.primaryBtn} onClick={() => navigate("/book-appointment")}>
                📅 Give an Appointment
              </button>

               <button
    style={styles.secondaryBtn}
    onClick={() => window.open("https://www.vienstereoptic.com/", "_blank")}
  >
    🚀 View Services
  </button>
</div>

            <div style={styles.stats}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>24/7</div>
                <div style={styles.statLabel}>Online Booking</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statValue}>1 Min</div>
                <div style={styles.statLabel}>Quick Form</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statValue}>100%</div>
                <div style={styles.statLabel}>Secure Process</div>
              </div>
            </div>
          </div>

          <div style={styles.right}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📌 Why Choose Us?</h3>
              <ul style={styles.list}>
                <li>✔ Quick appointment confirmation</li>
                <li>✔ Professional IT consultation</li>
                <li>✔ Transparent service process</li>
                <li>✔ Customer-first support</li>
              </ul>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💡 Services We Offer</h3>

              <div style={styles.serviceGrid}>
                {[
                  "IT Software",
                  "IT Hardware",
                  "Academy",
                  "HRMS",
                  "Event Management",
                  "Industrial Solutions",
                ].map((s) => (
                  <div key={s} style={styles.serviceItem}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },

  hero: {
    position: "relative",
    minHeight: "calc(100vh - 70px)", // navbar space
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "40px 18px",
  },

  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
    filter: "saturate(1.1) contrast(1.05)",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    background:
      "linear-gradient(120deg, rgba(106,0,255,0.45), rgba(255,63,181,0.25))",
  },

  container: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "1200px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: "26px",
    alignItems: "center",
  },

  left: {
    color: "white",
    padding: "10px",
  },

  badge: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "16px",
    backdropFilter: "blur(10px)",
  },

  title: {
    margin: 0,
    fontSize: "54px",
    lineHeight: "1.05",
    fontWeight: 900,
    textShadow: "0px 12px 30px rgba(0,0,0,0.35)",
  },

  titleHighlight: {
    color: "#fff",
    opacity: 0.95,
  },

  subtitle: {
    marginTop: "16px",
    marginBottom: "22px",
    fontSize: "15px",
    lineHeight: "1.7",
    maxWidth: "520px",
    background: "rgba(0,0,0,0.18)",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  btnRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },

  primaryBtn: {
    background: "white",
    color: "#6a00ff",
    border: "none",
    padding: "13px 18px",
    borderRadius: "14px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0px 14px 30px rgba(0,0,0,0.25)",
    transition: "0.2s",
  },

  secondaryBtn: {
    background: "rgba(255,255,255,0.12)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.40)",
    padding: "13px 18px",
    borderRadius: "14px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: "14px",
    backdropFilter: "blur(10px)",
  },

  stats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  statCard: {
    minWidth: "160px",
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.20)",
    backdropFilter: "blur(12px)",
  },

  statValue: {
    fontSize: "20px",
    fontWeight: 900,
    color: "white",
  },

  statLabel: {
    fontSize: "12px",
    marginTop: "4px",
    opacity: 0.9,
    color: "white",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  card: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0px 18px 40px rgba(0,0,0,0.25)",
    color: "white",
  },

  cardTitle: {
    margin: "0 0 10px",
    fontSize: "16px",
    fontWeight: 900,
  },

  list: {
    margin: 0,
    paddingLeft: "18px",
    lineHeight: "1.9",
    fontSize: "13px",
  },

  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "10px",
  },

  serviceItem: {
    padding: "12px 10px",
    borderRadius: "14px",
    textAlign: "center",
    fontWeight: 800,
    fontSize: "13px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
};
