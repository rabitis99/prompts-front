import { User, Mail, Briefcase, Camera, Check, Loader2 } from 'lucide-react';
import { JOBS } from '../constants/settings.constants';
import type { ProfileData } from '../types/settings.types';

interface ProfileTabProps {
  profile: ProfileData;
  isEditing: boolean;
  isSaving: boolean;
  stats: { prompts: number; likes: number };
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onProfileChange: (profile: ProfileData) => void;
}

export function ProfileTab({
  profile,
  isEditing,
  isSaving,
  stats,
  onEdit,
  onCancel,
  onSave,
  onProfileChange,
}: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
              {profile.nickname ? profile.nickname[0].toUpperCase() : 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center text-neutral-700 shadow-sm hover:shadow-md transition-shadow">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">{profile.nickname}</h2>
            <p className="text-neutral-600 mb-4">{profile.bio}</p>
            <div className="flex items-center gap-6 justify-center sm:justify-start text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-neutral-900">{stats.prompts}</div>
                <div className="text-neutral-500">프롬프트</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-neutral-900">{stats.likes.toLocaleString()}</div>
                <div className="text-neutral-500">좋아요</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">기본 정보</h3>
          {!isEditing ? (
            <button onClick={onEdit} className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors">
              수정
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                취소
              </button>
              <button 
                onClick={onSave} 
                disabled={isSaving} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl disabled:opacity-50 transition-opacity"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    저장
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">닉네임</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text" 
                value={profile.nickname} 
                onChange={(e) => onProfileChange({ ...profile, nickname: e.target.value })} 
                disabled={!isEditing} 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">이메일</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="email" 
                value={profile.email} 
                disabled 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">직업</label>
            {isEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {JOBS.map((job) => (
                  <button 
                    key={job.id} 
                    onClick={() => onProfileChange({ ...profile, job: job.id })} 
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                      profile.job === job.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span>{job.icon}</span>
                    <span className="text-sm font-medium">{job.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input 
                  type="text" 
                  value={JOBS.find(j => j.id === profile.job)?.label || ''} 
                  disabled 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500" 
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">소개</label>
            <textarea 
              value={profile.bio || ''} 
              onChange={(e) => onProfileChange({ ...profile, bio: e.target.value })} 
              disabled={!isEditing} 
              rows={3} 
              maxLength={100} 
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 resize-none disabled:bg-neutral-50 disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

