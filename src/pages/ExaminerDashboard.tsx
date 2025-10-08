import { useLocation, useNavigate } from "react-router-dom";

import type { User } from "@/types";
import { ExaminerDashboardContent } from "@/components/dashboard/ExaminerDashboardContent";

// Define the shape of the state we expect to receive
interface LocationState {
  user: User;
}

export default function ExaminerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Safely retrieve user from location state
  const { user } = (location.state as LocationState) || {};

  if (!user || user.role !== "examiner") {
    navigate("/", { replace: true });
    return null;
  }

  return <ExaminerDashboardContent username={user.username} />;
}
