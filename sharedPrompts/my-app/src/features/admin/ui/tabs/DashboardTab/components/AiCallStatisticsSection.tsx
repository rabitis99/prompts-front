import { useMemo } from 'react';
import type { AiCallStatisticsResponseDto } from '@/features/statistics/types/statistics.types';
import { StatCard } from '@/features/admin/components/StatCard';
import { BarChartWrapper } from '@/features/admin/components/charts';

interface AiCallStatisticsSectionProps {
  aiStats: AiCallStatisticsResponseDto;
}

export function AiCallStatisticsSection({ aiStats }: AiCallStatisticsSectionProps) {
  // AI 호출 추이 데이터
  const aiCallTrendData = useMemo(
    () => [
      { period: '오늘', 호출: aiStats.calls_today },
      { period: '이번 주', 호출: aiStats.calls_this_week },
      { period: '이번 달', 호출: aiStats.calls_this_month },
    ],
    [aiStats.calls_today, aiStats.calls_this_week, aiStats.calls_this_month]
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI 호출 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="전체 호출" value={aiStats.total_calls} />
        <StatCard label="오늘 호출" value={aiStats.calls_today} />
        <StatCard label="이번 주 호출" value={aiStats.calls_this_week} />
        <StatCard label="이번 달 호출" value={aiStats.calls_this_month} />
        {aiStats.average_response_time != null && (
          <StatCard label="평균 응답 시간" value={`${aiStats.average_response_time}ms`} />
        )}
      </div>

      <BarChartWrapper
        data={aiCallTrendData}
        dataKey="호출"
        label="AI 호출 추이"
        height={250}
      />
    </div>
  );
}

