import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { JSX } from "react/jsx-runtime";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  const hasToken = Boolean(localStorage.getItem("mpl_token") || localStorage.getItem("token"));

  if (isLoading && hasToken) return null;
  return user || hasToken ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
