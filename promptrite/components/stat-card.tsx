import type { LucideIcon } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  children?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  children,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        {trend && (
          <div
            className={`flex items-center gap-2 text-sm ${trend.positive ? "text-success" : "text-muted-foreground"}`}
          >
            {Icon && <Icon className="size-4" />}
            <span>{trend.value}</span>
          </div>
        )}
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
