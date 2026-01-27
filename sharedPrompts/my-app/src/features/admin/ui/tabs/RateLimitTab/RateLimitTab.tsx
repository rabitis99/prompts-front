import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '../../../api';
import type { RateLimitLogStatisticsResponseDto } from '../../../types/admin.types';
import { BarChartWrapper, PieChartWrapper, VerticalBarChartWrapper } from '../../../components/charts';
import { DateRangeFilter, TopViolatorsList } from './components';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981', '#ef4444'];

export function RateLimitTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<RateLimitLogStatisticsResponseDto | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getRateLimitLogStatistics(params);
      setStatistics(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Rate Limit 통계를 불러오는데 실패했습니다.');
      console.error('Failed to load rate limit statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = () => {
    loadStatistics();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
    );
  }

  // 시간대별 통계 데이터 변환 (0-23시)
  const hourlyData = statistics?.hourly_stats
    ? Object.entries(statistics.hourly_stats)
        .map(([hour, count]) => ({
          hour: `${hour}시`,
          count,
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    : [];

  // 규칙별 통계 데이터
  const ruleData = statistics?.rule_stats
    ? Object.entries(statistics.rule_stats).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  // 타입별 통계 데이터
  const typeData = statistics?.type_stats
    ? Object.entries(statistics.type_stats).map(([type, count]) => ({
        type,
        count,
      }))
    : [];

  // 규칙별 통계 데이터 (색상 포함)
  const ruleDataWithColors = ruleData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Rate Limit 통계</h2>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleDateChange}
        />
      </div>

      {statistics && (
        <>
          {/* 시간대별 통계 */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">시간대별 Rate Limit 위반</h3>
            <BarChartWrapper data={hourlyData} dataKey="count" xKey="hour" height={400} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 규칙별 통계 */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">규칙별 위반 통계</h3>
              <PieChartWrapper
                data={ruleDataWithColors}
                height={300}
                outerRadius={100}
                labelFormatter={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
              />
            </div>

            {/* 타입별 통계 */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">타입별 위반 통계</h3>
              <VerticalBarChartWrapper data={typeData} dataKey="count" yKey="type" height={300} />
            </div>
          </div>

          {/* 최다 위반 IP 및 사용자 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopViolatorsList
              title="최다 위반 IP"
              violators={statistics.top_violating_ips || []}
            />
            <TopViolatorsList
              title="최다 위반 사용자"
              violators={statistics.top_violating_users || []}
              identifierLabel="사용자 ID"
            />
          </div>
        </>
      )}
    </div>
  );
}

