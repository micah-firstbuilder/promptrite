import { Calendar } from "lucide-react";
import { CategoryBadge } from "./category-badge";

type Category = "design" | "code" | "image" | "video";

interface InvitationCardProps {
  from: {
    name: string;
    role: string;
    initials: string;
    color: string;
  };
  challengeName: string;
  category: Category;
  dueDate: string;
}

function formatDue(dateStr: string) {
  const d = new Date(dateStr);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, opts);
}

export function InvitationCard({
  from,
  challengeName,
  category,
  dueDate,
}: InvitationCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`h-9 w-9 rounded-full ${from.color} flex shrink-0 items-center justify-center font-medium text-white text-xs`}
        >
          {from.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium text-foreground text-sm">
              {challengeName}
            </div>
            <CategoryBadge
              category={category}
              className="shrink-0"
              showIcon={false}
            />
          </div>
          <div className="truncate text-muted-foreground text-xs">
            From {from.name} • {from.role}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
        <Calendar className="size-4" />
        <span>Due {formatDue(dueDate)}</span>
      </div>
    </div>
  );
}
