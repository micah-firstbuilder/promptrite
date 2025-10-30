"use client";

interface DayEntry {
  date: string; // YYYY-MM-DD
  count: number; // submissions that day
}

interface HeatmapProps {
  data: DayEntry[]; // 365 entries
}

function intensity(count: number) {
  if (count === 0) return "bg-muted";
  if (count < 2) return "bg-emerald-100";
  if (count < 4) return "bg-emerald-300";
  if (count < 6) return "bg-emerald-500";
  return "bg-emerald-700";
}

export function Heatmap({ data }: HeatmapProps) {
  // Render 53 columns x 7 rows grid
  return (
    <div
      aria-label="Activity in the last year"
      className="grid grid-flow-col grid-rows-7 gap-1"
      role="grid"
    >
      {data.map((d, idx) => (
        <div
          aria-label={`${d.date}: ${d.count} submissions`}
          className={`h-3 w-3 rounded ${intensity(d.count)}`}
          key={idx}
          role="gridcell"
          title={`${d.date}: ${d.count}`}
        />
      ))}
    </div>
  );
}
