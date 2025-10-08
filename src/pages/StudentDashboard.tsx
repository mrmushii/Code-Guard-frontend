import { StudentDashboardContent } from "@/components/dashboard/StudentDashboardContent";
import type { User } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";

// Define the shape of the state we expect to receive
interface LocationState {
  user: User;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Safely retrieve user from location state
  const { user } = (location.state as LocationState) || {};

  if (!user || user.role !== "student") {
    navigate("/", { replace: true });
    return null;
  }

  return <StudentDashboardContent username={user.username} />;
}
