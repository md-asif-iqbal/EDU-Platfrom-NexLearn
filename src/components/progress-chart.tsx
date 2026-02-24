"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ProgressChartProps {
  data: Record<string, unknown>[];
  type?: "line" | "bar";
  color?: string;
  height?: number;
  label?: string;
  dataKey?: string;
  xKey?: string;
}

export default function ProgressChart({
  data,
  type = "line",
  color = "#2563EB",
  height = 300,
  label = "Value",
  dataKey = "value",
  xKey = "name",
}: ProgressChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8 }}
              name={label}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[8, 8, 0, 0]}
              name={label}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
