import { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useFollowList } from '@/features/follow/hooks/useFollowList';
import { UserListItem } from './components/UserListItem';
import type { UserResponseDto } from '@/features/auth/types/user';

interface FollowTabProps {
  followCount: { followersCount: number; followingCount: number };
  onUserClick: (user: UserResponseDto, actionType: 'follow' | 'follower') => void;
}

export function FollowTab({ followCount, onUserClick }: FollowTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'followers' | 'following'>('followers');

  const followers = useFollowList({
    type: 'followers',
    autoLoad: activeSubTab === 'followers',
  });

  const following = useFollowList({
    type: 'following',
    autoLoad: activeSubTab === 'following',
  });

  const currentList = activeSubTab === 'followers' ? followers : following;
  const activeCount = activeSubTab === 'followers' ? followCount.followersCount : followCount.followingCount;

  const handleTabChange = (tab: 'followers' | 'following') => {
    setActiveSubTab(tab);
    if (tab === 'followers' && followers.users.length === 0) {
      followers.refresh();
    } else if (tab === 'following' && following.users.length === 0) {
      following.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* 통계 카드 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">팔로우 관리</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">{followCount.followersCount}</div>
            <div className="text-sm text-neutral-500 mt-1">팔로워</div>
          </div>
          <div className="w-px h-12 bg-neutral-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">{followCount.followingCount}</div>
            <div className="text-sm text-neutral-500 mt-1">팔로잉</div>
          </div>
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('followers')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeSubTab === 'followers'
                ? 'bg-violet-50 text-violet-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            팔로워 ({followCount.followersCount})
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeSubTab === 'following'
                ? 'bg-violet-50 text-violet-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            팔로잉 ({followCount.followingCount})
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        {currentList.isLoading && currentList.users.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-4" />
            <p className="text-sm text-neutral-500">불러오는 중...</p>
          </div>
        ) : currentList.users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-neutral-900 mb-2">
              {activeSubTab === 'followers' ? '팔로워가 없습니다' : '팔로잉이 없습니다'}
            </h3>
            <p className="text-sm text-neutral-500">
              {activeSubTab === 'followers'
                ? '당신을 팔로우하는 사용자가 없습니다'
                : '아직 팔로우한 사용자가 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.users.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                onClick={() => onUserClick(user, activeSubTab === 'followers' ? 'follower' : 'follow')}
              />
            ))}
          </div>
        )}

        {/* 더 보기 버튼 */}
        {currentList.hasMore && currentList.users.length > 0 && (
          <div className="text-center pt-4 mt-4 border-t border-neutral-100">
            <button
              onClick={currentList.loadMore}
              disabled={currentList.isLoading}
              className="px-6 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentList.isLoading ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
