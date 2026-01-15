import { Lock, Eye, EyeOff, LogOut, Trash2, Loader2 } from 'lucide-react';
import type { ProfileData, PasswordData } from '../types/settings.types';

interface SecurityTabProps {
  profile: ProfileData;
  passwords: PasswordData;
  showPassword: { current: boolean; new: boolean; confirm: boolean };
  isSaving: boolean;
  onPasswordChange: (passwords: PasswordData) => void;
  onShowPasswordChange: (show: { current: boolean; new: boolean; confirm: boolean }) => void;
  onChangePassword: () => void;
  onShowLogoutModal: () => void;
  onShowDeleteModal: () => void;
}

export function SecurityTab({
  profile,
  passwords,
  showPassword,
  isSaving,
  onPasswordChange,
  onShowPasswordChange,
  onChangePassword,
  onShowLogoutModal,
  onShowDeleteModal,
}: SecurityTabProps) {
  return (
    <div className="space-y-6">
      {profile.provider === 'LOCAL' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">비밀번호 변경</h3>
          <div className="space-y-4">
            {[
              { key: 'current', label: '현재 비밀번호' },
              { key: 'new', label: '새 비밀번호' },
              { key: 'confirm', label: '새 비밀번호 확인' },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{field.label}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input 
                    type={showPassword[field.key as keyof typeof showPassword] ? 'text' : 'password'} 
                    value={passwords[field.key as keyof PasswordData]} 
                    onChange={(e) => 
                      onPasswordChange({ ...passwords, [field.key]: e.target.value })
                    } 
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow" 
                  />
                  <button 
                    type="button" 
                    onClick={() => 
                      onShowPasswordChange({ 
                        ...showPassword, 
                        [field.key]: !showPassword[field.key as keyof typeof showPassword] 
                      })
                    } 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword[field.key as keyof typeof showPassword] ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={onChangePassword} 
              disabled={!passwords.current || !passwords.new || !passwords.confirm || isSaving} 
              className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                '비밀번호 변경'
              )}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">위험 구역</h3>
        <p className="text-sm text-neutral-500 mb-6">계정 삭제 시 모든 데이터가 영구적으로 삭제됩니다.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onShowLogoutModal} 
            className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
          >
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
          <button 
            onClick={onShowDeleteModal} 
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> 회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}

