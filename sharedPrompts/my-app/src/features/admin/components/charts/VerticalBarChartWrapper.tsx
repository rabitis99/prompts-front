import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VerticalBarChartWrapperProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  yKey: string;
  height?: number;
  color?: string;
  label?: string;
}

export function VerticalBarChartWrapper({
  data,
  dataKey,
  yKey,
  height = 300,
  color = '#8b5cf6',
  label,
}: VerticalBarChartWrapperProps) {
  return (
    <>
      {label && <h4 className="text-sm font-medium text-neutral-700 mb-3">{label}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" fontSize={12} />
          <YAxis dataKey={yKey} type="category" stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 8, 8, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </>
  );
}

