'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api';
    const loginUrl = `${apiUrl}/login`;
    
    console.log('=== LOGIN TEST ===');
    console.log('API Base URL:', apiUrl);
    console.log('Full Login URL:', loginUrl);
    console.log('Sending POST request...');
    
    try {
      // Direct fetch test
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: '123456'
        }),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setResult(data);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const testBackendHealth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api';
    
    console.log('=== HEALTH CHECK TEST ===');
    console.log('Base URL:', baseUrl);
    
    try {
      // Test 1: Root URL
      console.log('Test 1: Testing root URL:', baseUrl);
      const rootResponse = await fetch(baseUrl, { method: 'GET' });
      console.log('Root response status:', rootResponse.status);
      
      // Test 2: Actuator health (if exists)
      const healthUrl = baseUrl.replace('/webapp/api', '') + '/actuator/health';
      console.log('Test 2: Testing health URL:', healthUrl);
      const healthResponse = await fetch(healthUrl, { method: 'GET' });
      console.log('Health response status:', healthResponse.status);
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log('Health data:', data);
        setResult({ health: data, rootStatus: rootResponse.status });
      } else {
        setResult({ 
          message: 'Backend is running but health endpoint not available',
          rootStatus: rootResponse.status,
          healthStatus: healthResponse.status
        });
      }
    } catch (err: any) {
      console.error('Health check error:', err);
      setError(err.message || 'Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <p className="text-sm text-gray-600">
            API URL: <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api'}</code>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Login endpoint: <code className="bg-gray-100 px-2 py-1 rounded">{(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api') + '/login'}</code>
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={testBackendHealth}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Backend Health'}
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login (admin/123456)'}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h3 className="font-semibold mb-2">Error:</h3>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <h3 className="font-semibold mb-2">Success:</h3>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Backend çalışıyor mu? (http://localhost:8080)</li>
            <li>2. CORS ayarları doğru mu? (webapp-local.properties)</li>
            <li>3. .env.local dosyası var mı?</li>
            <li>4. Browser console&apos;da hata var mı? (F12)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
