"use client";

import type { ChartProps } from "@/lib/a2ui-schemas";
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
    <div className="p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-violet-500">
        {data.title}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <ChartComponent
          data={data.data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f5f5f4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#a8a29e" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#a8a29e" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              data.unit ? `${v}${data.unit}` : `${v}`
            }
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e7e5e4",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            formatter={(v) => (data.unit ? `${v}${data.unit}` : `${v}`)}
            cursor={{ fill: "rgba(139, 92, 246, 0.06)" }}
          />
          {data.chartType === "bar" ? (
            <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#8b5cf6" }}
              activeDot={{ r: 5 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
