import API from "../services/api";

const CheckoutPage = () => {
  const handleCheckout = async (plan: string) => {
    try {
      const res = await API.post("/payment/checkout", { plan });
      window.location.href = res.data.url;
    } catch {
      alert("Failed to initiate payment.");
    }
  };

  return (
    <div>
      <h2>Select Plan</h2>
      <button onClick={() => handleCheckout("pro")}>Upgrade to Pro</button>
      <button onClick={() => handleCheckout("business")}>
        Upgrade to Business
      </button>
    </div>
  );
};

export default CheckoutPage;
