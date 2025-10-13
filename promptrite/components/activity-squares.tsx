interface ActivitySquaresProps {
  count: number;
  total?: number;
}

export function ActivitySquares({ count, total = 10 }: ActivitySquaresProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          className={`h-2.5 w-2.5 rounded-sm ${i < count ? "bg-foreground" : "bg-muted"}`}
          key={i}
        />
      ))}
    </div>
  );
}
