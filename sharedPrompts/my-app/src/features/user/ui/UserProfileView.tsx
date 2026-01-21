import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { userApi } from '@/features/auth/api/user.api';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { UserPublicProfileDto } from '@/features/auth/types/user';
import type { PromptResponseDto, PromptSearchCondition } from '@/features/prompt/types/prompt.types';
import type { PageResponse } from '@/shared/types/api';
import { PromptCard } from '@/features/prompt/ui/components/PromptCard';
import { usePromptActions } from '@/features/prompt/model/usePromptActions';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useFollowActions } from '@/features/follow/hooks/useFollowActions';
import { getAvatarGradient } from '@/features/prompt/ui/utils';

export function UserProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [profile, setProfile] = useState<UserPublicProfileDto | null>(null);
  const [prompts, setPrompts] = useState<PromptResponseDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLiked, isCopied, handleToggleLike, handleCopy } = usePromptActions();

  const {
    followStatus,
    isLoading: isFollowLoading,
    isChecking,
    checkFollowStatus,
    requestFollow,
    unfollow,
  } = useFollowActions({
    userId: userId ? Number(userId) : null,
  });

  // 프로필 정보 로드
  useEffect(() => {
    if (!userId) {
      setError('유저 ID가 없습니다.');
      setIsLoadingProfile(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setError(null);
        const response = await userApi.getPublicProfile(Number(userId));
        setProfile(response.data.data);

        // 팔로우 상태 확인
        if (currentUserId && Number(userId) !== currentUserId) {
          checkFollowStatus();
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err.response?.data?.error?.message || '프로필을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [userId, currentUserId, checkFollowStatus]);

  // 프롬프트 목록 로드
  useEffect(() => {
    if (!userId || isLoadingProfile) return;

    const loadPrompts = async () => {
      try {
        setIsLoadingPrompts(true);
        const condition: PromptSearchCondition = {
          page,
          size: 20,
          sort: 'LATEST',
        };

        const response = await promptApi.getUserPrompts(Number(userId), condition);
        const data: PageResponse<PromptResponseDto> = response.data.data;

        if (page === 0) {
          setPrompts(data.content);
        } else {
          setPrompts((prev) => [...prev, ...data.content]);
        }

        setHasMore(!data.last && data.content.length > 0);
      } catch (err: any) {
        console.error('Failed to load prompts:', err);
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    loadPrompts();
  }, [userId, page, isLoadingProfile]);

  const handleFollowClick = async () => {
    if (isFollowLoading || isChecking) return;

    try {
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
      default:
        return '팔로우';
    }
  };

  const getFollowButtonClass = () => {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2';
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

  const isOwnProfile = currentUserId && userId && Number(userId) === currentUserId;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{error || '프로필을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로가기</span>
        </button>

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarGradient(
                  profile.userId
                )} shadow-lg flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}
              >
                {profile.nickname?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{profile.nickname}</h1>
                {profile.bio && (
                  <p className="text-slate-600 mb-4">{profile.bio}</p>
                )}
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{profile.promptCount}</span>
                    <span className="text-slate-500 ml-1">프롬프트</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{profile.followerCount}</span>
                    <span className="text-slate-500 ml-1">팔로워</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{profile.followingCount}</span>
                    <span className="text-slate-500 ml-1">팔로잉</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 팔로우 버튼 */}
            {!isOwnProfile && followStatus !== 'BLOCKED' && (followStatus || !isChecking) && (
              <button
                onClick={handleFollowClick}
                disabled={isFollowLoading || isChecking}
                className={`${getFollowButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                type="button"
              >
                {isFollowLoading || isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                <span>{getFollowButtonText()}</span>
              </button>
            )}
          </div>
        </div>

        {/* 프롬프트 목록 */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">프롬프트</h2>
          {prompts.length === 0 && !isLoadingPrompts ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">작성한 프롬프트가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isLiked={isLiked(prompt.id)}
                    isCopied={isCopied(prompt.id)}
                    onToggleLike={handleToggleLike}
                    onCopy={handleCopy}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isLoadingPrompts}
                    className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingPrompts ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      '더보기'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


