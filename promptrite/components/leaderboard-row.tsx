import { type LucideIcon, Trophy } from "lucide-react";
import Image from "next/image";
import { ActivitySquares } from "./activity-squares";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatar: string;
  badge: string;
  badgeIcon: LucideIcon;
  messages: number;
  score: number;
  activity: number;
  badgeColor: string;
}

export function LeaderboardRow({
  rank,
  name,
  avatar,
  badge,
  badgeIcon: BadgeIcon,
  messages,
  score,
  activity,
  badgeColor,
}: LeaderboardRowProps) {
  return (
    <li className="grid grid-cols-12 items-center px-4 py-3 transition hover:bg-accent sm:px-6">
      <div className="col-span-1 text-muted-foreground text-sm">{rank}</div>

      <div className="col-span-5 flex items-center gap-3 sm:col-span-4">
        <Image
          alt={`${name} avatar`}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
          height={32}
          src={avatar || "/placeholder.svg"}
          width={32}
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-sm">{name}</div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Trophy className="h-3.5 w-3.5" /> Top contributor
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:col-span-2 sm:flex">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${badgeColor}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
        </span>
        <span className="text-foreground text-sm">{badge}</span>
      </div>

      <div className="hidden items-center gap-1 md:col-span-2 md:flex">
        <ActivitySquares count={activity} />
      </div>

      <div className="col-span-2 text-right text-sm">
        {messages.toLocaleString()}
      </div>
      <div className="col-span-2 text-right">
        <span className="font-medium text-success">
          +{score.toLocaleString()}
        </span>
      </div>
    </li>
  );
}
