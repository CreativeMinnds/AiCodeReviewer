import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

// Asks the backend whether the login cookie is valid before showing a private page.
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("checking"); // checking | authed | guest

  useEffect(() => {
    let cancelled = false;
    api
      .get("/auth/me")
      .then(() => !cancelled && setStatus("authed"))
      .catch(() => !cancelled && setStatus("guest"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return <div style={{ color: "#fff", padding: "2rem" }}>Loading...</div>;
  }
  if (status === "guest") return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
