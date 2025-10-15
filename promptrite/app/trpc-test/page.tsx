'use client';

import { useState } from 'react';
import { trpc } from '../../lib/trpc/client';
import { useAuth } from '@clerk/nextjs';

export default function TrpcTestPage() {
  const [inputText, setInputText] = useState('world');
  const hello = trpc.hello.useQuery({ text: inputText });
  const secretData = trpc.secretData.useQuery(undefined, {
    retry: false,
    enabled: false,
  });
  const { isSignedIn } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">tRPC Test Page</h1>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Enter your name:
        </label>
        <div className="flex items-center space-x-2">
          <input
            id="name"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {isSignedIn && (
        <div className="mb-4">
          <button 
            onClick={() => secretData.refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fetch Protected Data
          </button>
        </div>
      )}

      <div className="p-4 border rounded bg-gray-50 mb-4">
        <h2 className="text-lg font-medium mb-2">Response from tRPC:</h2>
        {hello.isLoading ? (
          <p>Loading...</p>
        ) : hello.error ? (
          <p className="text-red-500">Error: {hello.error.message}</p>
        ) : (
          <pre className="bg-black text-green-400 p-4 rounded overflow-auto">
            {JSON.stringify(hello.data, null, 2)}
          </pre>
        )}
      </div>

      {secretData.isFetched && (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-medium mb-2">Protected Data:</h2>
          {secretData.isLoading ? (
            <p>Loading...</p>
          ) : secretData.error ? (
            <p className="text-red-500">Error: {secretData.error.message}</p>
          ) : (
            <pre className="bg-black text-green-400 p-4 rounded overflow-auto">
              {JSON.stringify(secretData.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
