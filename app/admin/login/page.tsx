// Placeholder for login page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, otpCode }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/dashboard'); // Redirect to protected dashboard
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSetup = async () => {
    setLoading(true);
    setMessage('');
    try {
        const res = await fetch('/api/admin/totp-setup');
        const data = await res.json();
        if(data.success) {
            setQrCodeDataUrl(data.qrCodeDataUrl);
            setTotpSecret(data.secret);
            setMessage("Scan QR code and then add TOTP to your .env.local file. Remember to restart your server.");
        } else {
            setMessage(data.message || "Failed to generate TOTP secret.");
        }
    } catch (error) {
        console.error("TOTP setup error:", error);
        setMessage("An error occurred during TOTP setup.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#fdfbf7] dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md border border-gray-200 dark:border-gray-800 transition-colors">
        <h1 className="font-sans text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">TOTP Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {message && (
          <p className={`mt-4 text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'} dark:${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
            <h2 className="font-sans text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">TOTP Setup (Development Only)</h2>
            {!qrCodeDataUrl ? (
                <button
                    onClick={handleTotpSetup}
                    className="flex items-center justify-center mx-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-800"
                    disabled={loading}
                >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate TOTP Secret & QR Code
                </button>
            ) : (
                <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Scan with authenticator app (e.g., Google Authenticator).
                    </p>
                    <div className="bg-white p-2 rounded-md mb-2">
                        <Image src={qrCodeDataUrl} alt="TOTP QR Code" width={150} height={150} />
                    </div>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        Secret: <strong>{totpSecret}</strong>
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                        Add this secret to your .env.local as TOTP_SECRET and restart server.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
