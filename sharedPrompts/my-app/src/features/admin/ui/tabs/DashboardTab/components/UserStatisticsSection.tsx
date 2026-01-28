import type { UserStatisticsResponseDto } from '@/features/statistics/types/statistics.types';
import { StatCard } from '@/features/admin/components/StatCard';
import { BarChartWrapper } from '@/features/admin/components/charts';
import { PieChartWrapper } from '@/features/admin/components/charts';

interface UserStatisticsSectionProps {
  userStats: UserStatisticsResponseDto;
}

export function UserStatisticsSection({ userStats }: UserStatisticsSectionProps) {
  // 사용자 가입 추이 데이터
  const userTrendData = [
    { period: '오늘', 가입: userStats.new_users_today },
    { period: '이번 주', 가입: userStats.new_users_this_week },
    { period: '이번 달', 가입: userStats.new_users_this_month },
  ];

  // 사용자 상태 분포
  const userStatusData = [
    { name: '활성', value: userStats.active_users, color: '#10b981' },
    { name: '차단', value: userStats.blocked_users, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">사용자 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="전체 사용자" value={userStats.total_users} />
        <StatCard label="활성 사용자" value={userStats.active_users} />
        <StatCard label="차단된 사용자" value={userStats.blocked_users} />
        <StatCard label="오늘 가입" value={userStats.new_users_today} />
        <StatCard label="이번 주 가입" value={userStats.new_users_this_week} />
        <StatCard label="이번 달 가입" value={userStats.new_users_this_month} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChartWrapper
          data={userTrendData}
          dataKey="가입"
          label="사용자 가입 추이"
          height={200}
        />
        <PieChartWrapper
          data={userStatusData}
          label="사용자 상태 분포"
          height={200}
          outerRadius={70}
          labelFormatter={({ name, percent }) =>
            `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
          }
        />
      </div>
    </div>
  );
}

