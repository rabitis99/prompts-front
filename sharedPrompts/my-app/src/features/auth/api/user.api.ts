import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/types/api';
import type {
  User,
  UserResponseDto,
  UserUpdateRequestDto,
  PasswordChangeRequestDto,
  CustomResponse,
} from '@/features/auth/types/user';

// 기존 함수 (호환성 유지)
export const fetchMe = async () => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};

// User API
export const userApi = {
  // 내 정보 조회
  getMyInfo: () =>
    api.get<CustomResponse<UserResponseDto>>('/users/me'),

  // 내 정보 수정
  updateMyInfo: (data: UserUpdateRequestDto) =>
    api.patch<CustomResponse<UserResponseDto>>('/users/me', data),

  // 비밀번호 변경
  changePassword: (data: PasswordChangeRequestDto) =>
    api.patch<CustomResponse<UserResponseDto>>('/users/me/password', data),

  // 회원 탈퇴
  deleteUser: (id: number) =>
    api.delete<void>(`/users/${id}`),
};
