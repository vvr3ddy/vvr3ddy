'use client'; // Make this a Client Component

import React from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus'; // Import useAuthStatus

const AdminDashboardPage = () => {
  const { logout } = useAuthStatus(); // Use the logout function from the hook

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#fdfbf7] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <h1 className="font-sans text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="font-serif text-lg mb-8">This is a placeholder for your site statistics.</p>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-800 transition-colors">
        <h2 className="font-sans text-xl font-semibold mb-4">Site Metrics (Coming Soon)</h2>
        <ul className="space-y-2">
          <li><span className="font-mono text-sm text-gray-600 dark:text-gray-400">Total Page Views:</span> <span className="font-bold">N/A</span></li>
          <li><span className="font-mono text-sm text-gray-600 dark:text-gray-400">Unique Visitors:</span> <span className="font-bold">N/A</span></li>
          <li><span className="font-mono text-sm text-gray-600 dark:text-gray-400">Top Posts:</span> <span className="font-bold">N/A</span></li>
          <li><span className="font-mono text-sm text-gray-600 dark:text-gray-400">Traffic by Region:</span> <span className="font-bold">N/A</span></li>
          <li><span className="font-mono text-sm text-gray-600 dark:text-gray-400">Traffic by Time of Day:</span> <span className="font-bold">N/A</span></li>
        </ul>
        <p className="font-serif text-sm italic mt-4 text-gray-500 dark:text-gray-400">
            Real-time analytics integration is a future enhancement.
        </p>
      </div>

      <button onClick={logout} className="mt-8 text-blue-600 hover:underline dark:text-blue-400">Logout</button>
    </div>
  );
};

export default AdminDashboardPage;
