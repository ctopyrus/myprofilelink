import { useAuth } from "../hooks/useAuth";

const UpgradePage = () => {
  const { subscription } = useAuth();

  return (
    <div>
      <h2>Upgrade Required</h2>
      <p>
        Current Plan: {subscription?.plan || "Free"}
      </p>
      <a href="/checkout">Upgrade Now</a>
    </div>
  );
};

export default UpgradePage;