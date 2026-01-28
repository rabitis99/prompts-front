import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PieData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartWrapperProps {
  data: PieData[];
  height?: number;
  outerRadius?: number;
  label?: string;
  labelFormatter?: (entry: PieData, percent?: number) => string;
}

const DEFAULT_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981', '#ef4444'];

export function PieChartWrapper({
  data,
  height = 200,
  outerRadius = 70,
  label,
  labelFormatter,
}: PieChartWrapperProps) {
  const defaultLabelFormatter = ({ name, value, percent }: any) =>
    `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`;

  return (
    <>
      {label && <h4 className="text-sm font-medium text-neutral-700 mb-3">{label}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={labelFormatter || defaultLabelFormatter}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </>
  );
}

