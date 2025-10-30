"use client";

import { trpc } from "@/app/utils/trpc";

export default function TrpcTestPage() {
  const me = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-2xl">tRPC Test Page</h1>
      <div className="mb-4 rounded border bg-gray-50 p-4">
        <h2 className="mb-2 font-medium text-lg">Current User</h2>
        {me.isLoading ? (
          <p>Loading...</p>
        ) : me.error ? (
          <p className="text-red-500">Error: {me.error.message}</p>
        ) : (
          <pre className="overflow-auto rounded bg-black p-4 text-green-400">
            {JSON.stringify(me.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
