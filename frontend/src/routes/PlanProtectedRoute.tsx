import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { JSX } from "react/jsx-runtime";

interface Props {
  requiredPlan: string;
  children: JSX.Element;
}

const PlanProtectedRoute = ({ requiredPlan, children }: Props) => {
  const { subscription, isLoading } = useAuth();
  const hasToken = Boolean(localStorage.getItem("mpl_token") || localStorage.getItem("token"));

  if (isLoading && hasToken) return null;

  if (!subscription || subscription.status !== "active") {
    return <Navigate to="/upgrade" />;
  }

  if (subscription.plan !== requiredPlan) {
    return <Navigate to="/upgrade" />;
  }

  return children;
};

export default PlanProtectedRoute;
