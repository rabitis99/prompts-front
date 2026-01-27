import { api } from '@/shared/api/axios';
import type { CustomResponse, PageResponse } from '@/shared/types/api';
import type { FavoriteResponseDto } from '../types/favorite.types';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

export const favoriteApi = {
  // 즐겨찾기 추가
  addFavorite: (promptId: number) =>
    api.post<CustomResponse<void>>(`/prompts/${promptId}/favorites`),

  // 즐겨찾기 제거
  removeFavorite: (promptId: number) =>
    api.delete<CustomResponse<void>>(`/prompts/${promptId}/favorites`),

  // 즐겨찾기 상태 확인
  checkFavorite: (promptId: number) =>
    api.get<CustomResponse<FavoriteResponseDto>>(`/prompts/${promptId}/favorites`),

  // 즐겨찾기 목록 조회
  getFavoritePrompts: (page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<PromptResponseDto>>>('/favorites', {
      params: { page, size },
    }),
};

