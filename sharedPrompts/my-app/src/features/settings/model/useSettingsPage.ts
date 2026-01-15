import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/features/auth/api/user.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserUpdateRequestDto, PasswordChangeRequestDto } from '@/features/auth/types/user';
import type { ProfileData, PasswordData, NotificationSettings, AppearanceSettings } from '../types/settings.types';

export function useSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    id: 0,
    nickname: '',
    email: '',
    job: undefined,
    age: undefined,
    bio: undefined,
    provider: 'LOCAL',
  });

  const [passwords, setPasswords] = useState<PasswordData>({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    likes: true,
    comments: true,
    follows: true,
    marketing: false,
    newsletter: true,
  });
  const [appearance, setAppearance] = useState<AppearanceSettings>({ theme: 'light', language: 'ko' });

  // 사용자 정보 로드
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userApi.getMyInfo();
        const userData = response.data.data;
        setProfile({
          id: userData.id,
          nickname: userData.nickname,
          email: userData.email,
          job: userData.job as string | undefined,
          age: userData.age,
          bio: undefined,
          provider: userData.provider,
        });
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const updateData: UserUpdateRequestDto = {
        nickname: profile.nickname,
        age: profile.age,
        job: profile.job,
      };

      const response = await userApi.updateMyInfo(updateData);
      const updatedUser = response.data.data;
      
      setProfile({
        ...profile,
        nickname: updatedUser.nickname,
        age: updatedUser.age,
        job: updatedUser.job as string | undefined,
      });
      
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.error?.message || '프로필 수정에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwords.new.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const passwordData: PasswordChangeRequestDto = {
        current_password: passwords.current,
        new_password: passwords.new,
      };

      await userApi.changePassword(passwordData);
      
      setPasswords({ current: '', new: '', confirm: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const errorMessage = err.response?.data?.error?.message || '비밀번호 변경에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await userApi.deleteUser(profile.id);
      await logout();
      navigate('/login');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      const errorMessage = err.response?.data?.error?.message || '회원 탈퇴에 실패했습니다.';
      setError(errorMessage);
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
      setError('로그아웃에 실패했습니다.');
      setIsLoggingOut(false);
    }
  };

  return {
    // State
    activeTab,
    isEditing,
    isSaving,
    isLoading,
    showPassword,
    showDeleteModal,
    showLogoutModal,
    saveSuccess,
    error,
    isDeleting,
    isLoggingOut,
    profile,
    passwords,
    notifications,
    appearance,
    
    // Setters
    setActiveTab,
    setIsEditing,
    setShowPassword,
    setShowDeleteModal,
    setShowLogoutModal,
    setError,
    setProfile,
    setPasswords,
    setNotifications,
    setAppearance,
    
    // Handlers
    handleSaveProfile,
    handleChangePassword,
    handleDeleteUser,
    handleLogout,
  };
}

