import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 font-semibold text-4xl text-foreground">
          404 - Page Not Found
        </h1>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
