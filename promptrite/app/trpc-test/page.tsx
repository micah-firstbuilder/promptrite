'use client';

import { trpc } from '@/app/utils/trpc';

export default function TrpcTestPage() {
  const me = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">tRPC Test Page</h1>
      <div className="p-4 border rounded bg-gray-50 mb-4">
        <h2 className="text-lg font-medium mb-2">Current User</h2>
        {me.isLoading ? (
          <p>Loading...</p>
        ) : me.error ? (
          <p className="text-red-500">Error: {me.error.message}</p>
        ) : (
          <pre className="bg-black text-green-400 p-4 rounded overflow-auto">
            {JSON.stringify(me.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
