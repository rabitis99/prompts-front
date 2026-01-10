// Comment 관련 타입 정의

import type { UserResponseDto } from '@/features/auth/types/user';
import type { CustomResponse } from '@/features/auth/types/user';

// Comment Response DTO
export interface CommentResponseDto {
  id: number;
  content: string;
  user_response_dto: UserResponseDto;
  created_at: string;
  updated_at: string;
  reply_count: number;
  parent_id?: number;
  replies?: CommentResponseDto[];
  like_count: number;
}

// Comment Request DTO
export interface CommentRequestDto {
  content: string;
  parent_id?: number;
}

// Comment Update DTO
export interface CommentUpdateDto {
  content: string;
}

