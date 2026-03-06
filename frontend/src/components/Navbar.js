import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <div style={styles.nav}>
      <div style={styles.left}>
        <img src={logo} alt="Vienstereoptic" style={styles.logo} />
        <span style={styles.brand}>Vconnect</span>
      </div>

      <div style={styles.right}>
        <Link style={styles.link} to="/">
          Home
        </Link>

        <Link style={styles.link} to="/book-appointment">
          Give an Appointment
        </Link>

        <Link style={styles.link} to="/admin-login">
          Admin Login
        </Link>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    height: "90px",
    background: "linear-gradient(90deg, #6D28D9, #EC4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    height: "65px",
    width: "auto",
    background: "#fff",
    padding: "8px",
    borderRadius: "12px",
    objectFit: "contain",
  },
  brand: {
    color: "white",
    fontSize: "24px",
    fontWeight: "700",
  },
  right: {
    display: "flex",
    gap: "26px",
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "17px",
  },
};
