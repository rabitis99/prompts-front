import { api } from '@/shared/api/axios';
import type {
  CommentResponseDto,
  CommentRequestDto,
  CommentUpdateDto,
} from '../types/comment.types';
import type { CustomResponse } from '@/features/auth/types/user';

export const commentApi = {
  // 댓글 생성
  createComment: (promptId: number, data: CommentRequestDto) =>
    api.post<CustomResponse<CommentResponseDto>>(
      `/prompts/${promptId}/comments`,
      data
    ),

  // 댓글 목록 조회
  getComments: (promptId: number) =>
    api.get<CustomResponse<CommentResponseDto[]>>(
      `/prompts/${promptId}/comments`
    ),

  // 댓글 수정
  updateComment: (
    promptId: number,
    commentId: number,
    data: CommentUpdateDto
  ) =>
    api.patch<CustomResponse<CommentResponseDto>>(
      `/prompts/${promptId}/comments/${commentId}`,
      data
    ),

  // 댓글 삭제
  deleteComment: (promptId: number, commentId: number) =>
    api.delete<void>(`/prompts/${promptId}/comments/${commentId}`),
};

