import type { PromptStatisticsResponseDto } from '@/features/statistics/types/statistics.types';
import { StatCard } from '@/features/admin/components/StatCard';
import { LineChartWrapper } from '@/features/admin/components/charts';
import { PieChartWrapper } from '@/features/admin/components/charts';

interface PromptStatisticsSectionProps {
  promptStats: PromptStatisticsResponseDto;
}

export function PromptStatisticsSection({ promptStats }: PromptStatisticsSectionProps) {
  // 프롬프트 생성 추이 데이터
  const promptTrendData = [
    { period: '오늘', 생성: promptStats.new_prompts_today },
    { period: '이번 주', 생성: promptStats.new_prompts_this_week },
    { period: '이번 달', 생성: promptStats.new_prompts_this_month },
  ];

  // 프롬프트 공개/비공개 비율
  const promptVisibilityData = [
    { name: '공개', value: promptStats.public_prompts, color: '#8b5cf6' },
    { name: '비공개', value: promptStats.private_prompts, color: '#a78bfa' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">프롬프트 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="전체 프롬프트" value={promptStats.total_prompts} />
        <StatCard label="공개 프롬프트" value={promptStats.public_prompts} />
        <StatCard label="비공개 프롬프트" value={promptStats.private_prompts} />
        <StatCard label="오늘 생성" value={promptStats.new_prompts_today} />
        <StatCard label="이번 주 생성" value={promptStats.new_prompts_this_week} />
        <StatCard label="이번 달 생성" value={promptStats.new_prompts_this_month} />
        <StatCard label="총 좋아요" value={promptStats.total_likes} />
        <StatCard label="총 조회수" value={promptStats.total_views} />
        <StatCard label="총 댓글" value={promptStats.total_comments} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LineChartWrapper
          data={promptTrendData}
          dataKey="생성"
          label="프롬프트 생성 추이"
          height={200}
        />
        <PieChartWrapper
          data={promptVisibilityData}
          label="프롬프트 공개/비공개 비율"
          height={200}
          outerRadius={70}
          labelFormatter={({ name, value, percent }) =>
            `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`
          }
        />
      </div>
    </div>
  );
}

