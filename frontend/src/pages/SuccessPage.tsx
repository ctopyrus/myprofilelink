import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const SuccessPage = () => {
  const { refreshSubscription } = useAuth();

  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <div>
      <h2>Payment Successful 🎉</h2>
      <p>Your subscription has been activated.</p>
    </div>
  );
};

export default SuccessPage;