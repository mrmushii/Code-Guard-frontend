// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import StudentDashboard from "./pages/StudentDashboard";
import ExaminerDashboard from "./pages/ExaminerDashboard";
import { LoginForm } from "./components/auth/LoginForm";
import MonitoringDashboardPage from "./pages/MonitoringDashboardPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/examiner-dashboard" element={<ExaminerDashboard />} />
        {/* This route now points to your new monitoring page */}
        <Route path="/monitoring/:roomId" element={<MonitoringDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;