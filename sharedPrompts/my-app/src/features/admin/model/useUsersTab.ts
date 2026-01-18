import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api';
import { usePagination } from '../hooks/usePagination';
import type { AdminUserResponseDto, UserBlockRequestDto, UserRoleChangeRequestDto } from '../types/admin.types';
import type { PageResponse } from '@/shared/types/api';

const PAGE_SIZE = 20;

export function useUsersTab() {
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(
    async (page: number, searchKeyword?: string): Promise<PageResponse<AdminUserResponseDto>> => {
      const response = await adminApi.getUsers(searchKeyword || undefined, page, PAGE_SIZE);
      return response.data.data;
    },
    []
  );

  const pagination = usePagination({
    loadData: loadUsers,
    keyword,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = useCallback(() => {
    setKeyword(searchQuery);
    // keyword 변경을 위해 useEffect가 reload를 트리거하도록 함
  }, [searchQuery]);

  // keyword가 변경되면 리로드
  useEffect(() => {
    // 초기 로드 이후에만 실행 (초기 keyword는 ''이므로 첫 로드는 제외)
    const timeoutId = setTimeout(() => {
      pagination.reload();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [keyword]);

  const handleBlock = useCallback(
    async (userId: number, isBlocked: boolean, reason?: string) => {
      try {
        const data: UserBlockRequestDto = {
          blocked: !isBlocked,
          block_reason: reason,
        };
        await adminApi.blockUser(userId, data);
        pagination.setItems((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, is_blocked: !isBlocked, block_reason: reason }
              : user
          )
        );
      } catch (err: any) {
        throw new Error(err?.response?.data?.error?.message || '차단 처리에 실패했습니다.');
      }
    },
    [pagination]
  );

  const handleRoleChange = useCallback(
    async (userId: number, role: 'USER' | 'ADMIN') => {
      try {
        const data: UserRoleChangeRequestDto = { role };
        await adminApi.changeUserRole(userId, data);
        pagination.setItems((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, role } : user))
        );
      } catch (err: any) {
        throw new Error(err?.response?.data?.error?.message || '권한 변경에 실패했습니다.');
      }
    },
    [pagination]
  );

  return {
    ...pagination,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleBlock,
    handleRoleChange,
  };
}

