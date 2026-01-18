import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { statisticsApi } from '@/features/statistics/api/statistics.api';
import type {
  StatisticsResponseDto,
  UserStatisticsResponseDto,
  PromptStatisticsResponseDto,
  AiCallStatisticsResponseDto,
} from '@/features/statistics/types/statistics.types';

export function DashboardTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState<StatisticsResponseDto | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await statisticsApi.getAllStatistics();
      setOverallStats(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || '통계를 불러오는데 실패했습니다.');
      console.error('Failed to load statistics:', err);
    } finally {
      setIsLoading(false);
    }
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
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    );
  }

  const userStats = overallStats?.user_statistics;
  const promptStats = overallStats?.prompt_statistics;
  const aiStats = overallStats?.ai_call_statistics;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">대시보드</h2>
      </div>

      {/* 사용자 통계 */}
      {userStats && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">사용자 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="전체 사용자" value={userStats.total_users} />
            <StatCard label="활성 사용자" value={userStats.active_users} />
            <StatCard label="차단된 사용자" value={userStats.blocked_users} />
            <StatCard label="오늘 가입" value={userStats.new_users_today} />
            <StatCard label="이번 주 가입" value={userStats.new_users_this_week} />
            <StatCard label="이번 달 가입" value={userStats.new_users_this_month} />
          </div>
        </div>
      )}

      {/* 프롬프트 통계 */}
      {promptStats && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">프롬프트 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        </div>
      )}

      {/* AI 호출 통계 */}
      {aiStats && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI 호출 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="전체 호출" value={aiStats.total_calls} />
            <StatCard label="오늘 호출" value={aiStats.calls_today} />
            <StatCard label="이번 주 호출" value={aiStats.calls_this_week} />
            <StatCard label="이번 달 호출" value={aiStats.calls_this_month} />
            {aiStats.average_response_time && (
              <StatCard
                label="평균 응답 시간"
                value={`${aiStats.average_response_time}ms`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string | null | undefined }) {
  const displayValue = value != null 
    ? (typeof value === 'number' ? value.toLocaleString() : value)
    : '0';
  
  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <div className="text-sm text-neutral-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-neutral-900">{displayValue}</div>
    </div>
  );
}

