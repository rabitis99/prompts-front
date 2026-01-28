import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartWrapperProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xKey?: string;
  height?: number;
  color?: string;
  label?: string;
}

export function BarChartWrapper({
  data,
  dataKey,
  xKey = 'period',
  height = 200,
  color = '#8b5cf6',
  label,
}: BarChartWrapperProps) {
  return (
    <>
      {label && <h4 className="text-sm font-medium text-neutral-700 mb-3">{label}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </>
  );
}

