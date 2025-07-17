import { Coins } from "lucide-react";

export default function MemecoinLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Deploy Your Memecoin</h1>
          <p className="text-gray-400">Create and deploy your own memecoin on the Aptos blockchain</p>
        </div>

        {/* Loading State */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading memecoin deployment...</p>
        </div>
      </div>
    </div>
  );
} 