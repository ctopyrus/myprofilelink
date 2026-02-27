import { FC } from "react";

interface PlanUpgradeModalProps {
  onClose: () => void;
}

const PlanUpgradeModal: FC<PlanUpgradeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
        <p className="text-gray-600 mb-6">
          Upgrade to Pro or Enterprise to unlock advanced features.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Pro Plan</h3>
            <p className="text-gray-600 text-sm">$29/month</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Enterprise Plan</h3>
            <p className="text-gray-600 text-sm">Custom pricing</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;