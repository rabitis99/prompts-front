import { useEffect } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollowActions } from '@/features/follow/hooks/useFollowActions';
import type { UserResponseDto } from '@/features/auth/types/user';
import { getAvatarGradient } from '../utils';

interface AuthorInfoProps {
  author: UserResponseDto;
  currentUserId?: number | null;
}

export function AuthorInfo({ author, currentUserId }: AuthorInfoProps) {
  const {
    followStatus,
    isLoading,
    isChecking,
    checkFollowStatus,
    requestFollow,
    unfollow,
  } = useFollowActions({
    userId: author.id,
  });

  // 작성자 정보 로드 시 팔로우 상태 확인
  useEffect(() => {
    if (author.id) {
      // currentUserId가 없어도 상태 확인 (로그인하지 않은 경우에도 버튼은 보여야 함)
      if (!currentUserId || author.id !== currentUserId) {
        checkFollowStatus();
      }
    }
  }, [author.id, currentUserId, checkFollowStatus]);

  // 본인인 경우 팔로우 버튼 숨김
  const isOwnProfile = currentUserId && author.id === currentUserId;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || isChecking) return;
    
    try {
      // followStatus가 null이거나 REJECTED, CANCELLED 상태면 팔로우 요청/재요청
      if (!followStatus || followStatus === 'REJECTED' || followStatus === 'CANCELLED') {
        await requestFollow();
      } else if (followStatus === 'FOLLOWING' || followStatus === 'PENDING') {
        await unfollow();
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    }
  };

  const getFollowButtonText = () => {
    if (isChecking) return '확인 중...';
    if (!followStatus) return '팔로우';
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
    const baseClass = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 flex-shrink-0';
    if (!followStatus) return `${baseClass} bg-slate-900 text-white hover:bg-slate-800`;
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
    <div className="flex items-center gap-2 ml-auto">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(
            author.id
          )} shadow-sm flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
        >
          {author.nickname?.[0] || '?'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-slate-900 truncate">{author.nickname}</span>
          {author.job && (
            <span className="text-xs text-slate-500 truncate">{author.job}</span>
          )}
        </div>
      </div>
      
      {/* 팔로우 버튼 */}
      {!isOwnProfile && followStatus !== 'BLOCKED' && (followStatus || !isChecking) && (
        <button
          onClick={handleFollowClick}
          disabled={isLoading || isChecking}
          className={`${getFollowButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
          type="button"
        >
          {isLoading || isChecking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : followStatus === 'FOLLOWING' ? (
            <UserCheck className="w-3.5 h-3.5" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          <span>{getFollowButtonText()}</span>
        </button>
      )}
    </div>
  );
}

