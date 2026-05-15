"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const colors = ["#39b980", "#d69b2d", "#d45555", "#c9a64d"];

export function VerdictDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#101621", border: "1px solid #243044", color: "#f4f7fb" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreTrendChart({ data }: { data: { name: string; score: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#243044" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#8b98ad" fontSize={12} />
          <YAxis domain={[0, 5]} stroke="#8b98ad" fontSize={12} />
          <Tooltip contentStyle={{ background: "#101621", border: "1px solid #243044", color: "#f4f7fb" }} />
          <Line type="monotone" dataKey="score" stroke="#c9a64d" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBarChart({
  data,
  labelKey,
  valueKey
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
}) {
  const trimmed = data.map((item) => ({
    ...item,
    shortLabel: String(item[labelKey]).slice(0, 36)
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trimmed} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid stroke="#243044" strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis dataKey="shortLabel" type="category" stroke="#8b98ad" width={170} fontSize={11} />
          <Tooltip contentStyle={{ background: "#101621", border: "1px solid #243044", color: "#f4f7fb" }} />
          <Bar dataKey={valueKey} fill="#c9a64d" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinLossChart({
  data
}: {
  data: { verdict: string; won: number; lost: number; pending: number }[];
}) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#243044" strokeDasharray="3 3" />
          <XAxis dataKey="verdict" stroke="#8b98ad" fontSize={12} />
          <YAxis stroke="#8b98ad" fontSize={12} />
          <Tooltip contentStyle={{ background: "#101621", border: "1px solid #243044", color: "#f4f7fb" }} />
          <Bar dataKey="won" stackId="a" fill="#39b980" />
          <Bar dataKey="lost" stackId="a" fill="#d45555" />
          <Bar dataKey="pending" stackId="a" fill="#c9a64d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
