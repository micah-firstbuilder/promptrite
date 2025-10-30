import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ItemProps {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  created_at: string;
  score: number;
}

export function RecentChallengeItem({
  id,
  title,
  difficulty,
  category,
  created_at,
  score,
}: ItemProps) {
  const age = timeAgo(new Date(created_at));
  return (
    <Card className="border-border">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-muted-foreground text-xs">
            {age} • Score: {score}/100
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-700 text-xs ring-1 ring-amber-500/20">
            {category}
          </span>
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-blue-700 text-xs ring-1 ring-blue-500/20">
            {difficulty}
          </span>
          <Link
            aria-label="Open challenge"
            className="rounded-md border border-border px-2 py-1 text-xs"
            href={`/dashboard/challenges/${id}`}
          >
            Open
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
