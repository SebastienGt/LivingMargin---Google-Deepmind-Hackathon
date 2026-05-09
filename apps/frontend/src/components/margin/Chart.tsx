"use client";

import type { ChartProps } from "@/lib/a2ui-catalog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function Chart({ data }: { data: ChartProps }) {
  const ChartComponent = data.chartType === "bar" ? BarChart : LineChart;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-purple-600">
        {data.title}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <ChartComponent data={data.data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (data.unit ? `${v}${data.unit}` : `${v}`)}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v) => (data.unit ? `${v}${data.unit}` : `${v}`)}
          />
          {data.chartType === "bar" ? (
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          ) : (
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
