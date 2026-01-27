import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { statisticsApi } from '@/features/statistics/api/statistics.api';
import type { StatisticsResponseDto } from '@/features/statistics/types/statistics.types';
import {
  UserStatisticsSection,
  PromptStatisticsSection,
  AiCallStatisticsSection,
} from './DashboardTab/components';

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
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
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

      {userStats && <UserStatisticsSection userStats={userStats} />}
      {promptStats && <PromptStatisticsSection promptStats={promptStats} />}
      {aiStats && <AiCallStatisticsSection aiStats={aiStats} />}
    </div>
  );
}
