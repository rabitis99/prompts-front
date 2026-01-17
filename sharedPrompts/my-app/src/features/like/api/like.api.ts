import { api } from '@/shared/api/axios';
import type { CustomResponse } from '@/shared/types/api';

export const likeApi = {
  // 프롬프트 좋아요
  likePrompt: (promptId: number) =>
    api.post<CustomResponse<void>>(`/prompts/${promptId}/likes`),

  // 프롬프트 좋아요 취소
  unlikePrompt: (promptId: number) =>
    api.delete<CustomResponse<void>>(`/prompts/${promptId}/likes`),

  // 댓글 좋아요
  likeComment: (commentId: number) =>
    api.post<CustomResponse<void>>(`/comments/${commentId}/likes`),

  // 댓글 좋아요 취소
  unlikeComment: (commentId: number) =>
    api.delete<CustomResponse<void>>(`/comments/${commentId}/likes`),
};

