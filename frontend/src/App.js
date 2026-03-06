import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import AdminCalendar from "./pages/AdminCalendar";

function App() {
  return (
    <Router>
      <div style={styles.layout}>
        {/* ✅ Navbar always top */}
        <Navbar />

        {/* ✅ Page Content */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/admin-calendar" element={<AdminCalendar />} />
          </Routes>
        </div>

        {/* ✅ Footer always bottom */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

const styles = {
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
  },
};
