import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api';
import { usePagination } from '../hooks/usePagination';
import type { AdminPromptResponseDto, PromptVisibilityRequestDto } from '../types/admin.types';
import type { PageResponse } from '@/shared/types/api';

const PAGE_SIZE = 20;

export function usePromptsTab() {
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadPrompts = useCallback(
    async (page: number, searchKeyword?: string): Promise<PageResponse<AdminPromptResponseDto>> => {
      const response = await adminApi.getPrompts(searchKeyword || undefined, page, PAGE_SIZE);
      return response.data.data;
    },
    []
  );

  const pagination = usePagination({
    loadData: loadPrompts,
    keyword,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = useCallback(() => {
    setKeyword(searchQuery);
  }, [searchQuery]);

  // keyword가 변경되면 리로드
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      pagination.reload();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [keyword]);

  const handleDelete = useCallback(
    async (promptId: number) => {
      try {
        await adminApi.deletePrompt(promptId);
        pagination.setItems((prev) => prev.filter((prompt) => prompt.id !== promptId));
      } catch (err: any) {
        throw new Error(err?.response?.data?.error?.message || '프롬프트 삭제에 실패했습니다.');
      }
    },
    [pagination]
  );

  const handleToggleVisibility = useCallback(
    async (promptId: number, isPublic: boolean) => {
      try {
        const data: PromptVisibilityRequestDto = {
          is_public: !isPublic,
        };
        await adminApi.togglePromptVisibility(promptId, data);
        pagination.setItems((prev) =>
          prev.map((prompt) =>
            prompt.id === promptId ? { ...prompt, is_public: !isPublic } : prompt
          )
        );
      } catch (err: any) {
        throw new Error(err?.response?.data?.error?.message || '공개/비공개 전환에 실패했습니다.');
      }
    },
    [pagination]
  );

  return {
    ...pagination,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleDelete,
    handleToggleVisibility,
  };
}

