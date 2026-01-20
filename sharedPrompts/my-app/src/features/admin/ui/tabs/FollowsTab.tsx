import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { adminApi } from '../../api';
import type { AdminFollowUserDto } from '../../types/admin.types';
import type { PageResponse } from '@/shared/types/api';
import type { FollowStatus } from '@/features/follow/types/follow.types';

const PAGE_SIZE = 20;

type RelationFilter = 'all' | 'follower' | 'following';

const FOLLOW_STATUS_OPTIONS: { value: FollowStatus; label: string }[] = [
  { value: 'PENDING', label: '대기(PENDING)' },
  { value: 'FOLLOWING', label: '팔로잉(FOLLOWING)' },
  { value: 'REJECTED', label: '거절(REJECTED)' },
  { value: 'CANCELLED', label: '취소(CANCELLED)' },
  { value: 'BLOCKED', label: '차단(BLOCKED)' },
];

function parseNumericId(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function FollowsTab() {
  const [items, setItems] = useState<AdminFollowUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [status, setStatus] = useState<FollowStatus>('FOLLOWING');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>('all');
  const [followerIdQuery, setFollowerIdQuery] = useState<string>('');
  const [followingIdQuery, setFollowingIdQuery] = useState<string>('');

  const requestIdRef = useRef(0);

  const loadFollows = useCallback(
    async (targetPage: number, reset = false) => {
      const isReset = reset || targetPage === 0;
      const currentRequestId = isReset ? ++requestIdRef.current : requestIdRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const followerId =
          relationFilter === 'following' ? undefined : parseNumericId(followerIdQuery);
        const followingId =
          relationFilter === 'follower' ? undefined : parseNumericId(followingIdQuery);

        const response = await adminApi.getFollows({
          status,
          followerId,
          followingId,
          page: targetPage,
          size: PAGE_SIZE,
        });

        if (currentRequestId !== requestIdRef.current) return;

        const pageData = response.data?.data as PageResponse<AdminFollowUserDto> | undefined;
        if (!pageData) {
          setError('응답 데이터 형식이 올바르지 않습니다.');
          return;
        }

        const newItems = Array.isArray(pageData.content) ? pageData.content : [];

        if (reset) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }

        setHasMore(!pageData.last);
      } catch (err: any) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(err?.response?.data?.error?.message || '팔로우 목록을 불러오는데 실패했습니다.');
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [status, followerIdQuery, followingIdQuery, relationFilter],
  );

  useEffect(() => {
    loadFollows(0, true);
  }, [loadFollows]);

  useEffect(() => {
    if (page > 0) {
      loadFollows(page, false);
    }
  }, [page, loadFollows]);

  const handleApplyFilters = () => {
    setPage(0);
    loadFollows(0, true);
  };

  const relationLabelMap: Record<RelationFilter, string> = {
    all: '전체',
    follower: '팔로워 기준',
    following: '팔로잉 기준',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-violet-600" />
          팔로우 관리
        </h2>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                팔로우 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FollowStatus)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {FOLLOW_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                조회 기준
              </label>
              <select
                value={relationFilter}
                onChange={(e) => setRelationFilter(e.target.value as RelationFilter)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">전체</option>
                <option value="follower">팔로워 기준 (followerId만 사용)</option>
                <option value="following">팔로잉 기준 (followingId만 사용)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  followerId
                </label>
                <input
                  type="number"
                  value={followerIdQuery}
                  onChange={(e) => setFollowerIdQuery(e.target.value)}
                  disabled={relationFilter === 'following'}
                  placeholder={
                    relationFilter === 'following' ? '조회 기준: 팔로잉' : '팔로워 사용자 ID'
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-neutral-100 disabled:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  followingId
                </label>
                <input
                  type="number"
                  value={followingIdQuery}
                  onChange={(e) => setFollowingIdQuery(e.target.value)}
                  disabled={relationFilter === 'follower'}
                  placeholder={
                    relationFilter === 'follower' ? '조회 기준: 팔로워' : '팔로잉 사용자 ID'
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-neutral-100 disabled:text-neutral-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              현재 상태: {FOLLOW_STATUS_OPTIONS.find((s) => s.value === status)?.label} / 조회 기준:{' '}
              {relationLabelMap[relationFilter]}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
              >
                필터 적용
              </button>
              <button
                onClick={() => {
                  setStatus('FOLLOWING');
                  setRelationFilter('all');
                  setFollowerIdQuery('');
                  setFollowingIdQuery('');
                  setPage(0);
                }}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
          해당 조건에 맞는 팔로우 관계가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                    사용자 ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                    닉네임 / 이메일
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                    팔로우 상태
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                    기준
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">{user.id}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.nickname}</span>
                        <span className="text-xs text-neutral-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <FollowStatusBadge status={user.follow_status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <RelationTypeBadge type={user.relation_type} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString('ko-KR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isLoading}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  '더 보기'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FollowStatusBadge({ status }: { status: FollowStatus }) {
  const styles: Record<FollowStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    FOLLOWING: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-neutral-100 text-neutral-700',
    BLOCKED: 'bg-orange-100 text-orange-700',
  };

  const labels: Record<FollowStatus, string> = {
    PENDING: '대기 중',
    FOLLOWING: '팔로잉',
    REJECTED: '거절됨',
    CANCELLED: '취소됨',
    BLOCKED: '차단됨',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function RelationTypeBadge({ type }: { type: 'follower' | 'following' }) {
  const styles: Record<'follower' | 'following', string> = {
    follower: 'bg-blue-100 text-blue-700',
    following: 'bg-violet-100 text-violet-700',
  };

  const labels: Record<'follower' | 'following', string> = {
    follower: '팔로워',
    following: '팔로잉',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}


