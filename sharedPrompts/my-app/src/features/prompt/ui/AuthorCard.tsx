import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollowActions } from '@/features/follow/hooks/useFollowActions';

interface AuthorCardProps {
  authorId: number;
  authorName: string;
  authorJob?: string;
  currentUserId?: number | null;
  getAvatarGradient: (userId: number) => string;
}

export function AuthorCard({
  authorId,
  authorName,
  authorJob,
  currentUserId,
  getAvatarGradient,
}: AuthorCardProps) {
  const navigate = useNavigate();
  const {
    followStatus,
    isLoading,
    isChecking,
    checkFollowStatus,
    requestFollow,
    unfollow,
  } = useFollowActions({
    userId: authorId,
  });

  // 작성자 정보 로드 시 팔로우 상태 확인
  useEffect(() => {
    if (authorId && currentUserId && authorId !== currentUserId) {
      checkFollowStatus();
    }
  }, [authorId, currentUserId, checkFollowStatus]);

  // 본인인 경우 팔로우 버튼 숨김
  const isOwnProfile = currentUserId && authorId === currentUserId;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/users/${authorId}`);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!followStatus) {
      requestFollow();
    } else if (followStatus === 'FOLLOWING' || followStatus === 'PENDING') {
      unfollow();
    }
  };

  const getFollowButtonText = () => {
    if (isChecking) return '';
    switch (followStatus) {
      case 'FOLLOWING':
        return '팔로잉';
      case 'PENDING':
        return '요청됨';
      case 'BLOCKED':
        return '';
      default:
        return '팔로우';
    }
  };

  const getFollowButtonClass = () => {
    const baseClass = 'px-4 py-1.5 rounded-lg text-sm font-medium transition-all';
    switch (followStatus) {
      case 'FOLLOWING':
        return `${baseClass} bg-slate-100 text-slate-700 hover:bg-slate-200`;
      case 'PENDING':
        return `${baseClass} bg-slate-100 text-slate-600 hover:bg-slate-200`;
      default:
        return `${baseClass} bg-slate-900 text-white hover:bg-slate-800`;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
          aria-label={`${authorName} 프로필 보기`}
        >
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(
              authorId
            )} shadow-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}
          >
            {authorName[0]}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-lg truncate">{authorName}</h3>
            <p className="text-sm text-slate-500 truncate">{authorJob || '사용자'}</p>
          </div>
        </button>
        
        {/* 팔로우 버튼 - 유저 정보 옆에 작게 배치 */}
        {!isOwnProfile && !isChecking && followStatus !== 'BLOCKED' && (
          <button
            onClick={handleFollowClick}
            disabled={isLoading}
            className={`${getFollowButtonClass()} flex-shrink-0 disabled:opacity-50 flex items-center gap-1.5`}
            type="button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : followStatus === 'FOLLOWING' ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{getFollowButtonText()}</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-around py-4 border-y border-slate-100">
        <div className="text-center">
          <div className="text-xl font-bold text-slate-900">-</div>
          <div className="text-xs text-slate-500 font-medium">프롬프트</div>
        </div>
        <div className="w-px h-10 bg-slate-200" />
        <div className="text-center">
          <div className="text-xl font-bold text-slate-900">-</div>
          <div className="text-xs text-slate-500 font-medium">팔로워</div>
        </div>
      </div>
    </div>
  );
}
