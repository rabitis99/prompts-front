import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useSettingsPage } from '../model/useSettingsPage';
import { TABS } from '../constants/settings.constants';
import { ProfileTab } from './ProfileTab';
import { SecurityTab } from './SecurityTab';
import { NotificationsTab } from './NotificationsTab';
import { AppearanceTab } from './AppearanceTab';
import { ReportsTab } from './ReportsTab';
import { DeleteUserModal } from './DeleteUserModal';
import { LogoutModal } from './LogoutModal';

export function SettingsView() {
  const {
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
    stats,
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
    handleSaveProfile,
    handleChangePassword,
    handleDeleteUser,
    handleLogout,
  } = useSettingsPage();

  const tabContent: Record<string, React.ReactElement> = {
    profile: (
      <ProfileTab
        profile={profile}
        isEditing={isEditing}
        isSaving={isSaving}
        stats={stats}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSaveProfile}
        onProfileChange={setProfile}
      />
    ),
    security: (
      <SecurityTab
        profile={profile}
        passwords={passwords}
        showPassword={showPassword}
        isSaving={isSaving}
        onPasswordChange={setPasswords}
        onShowPasswordChange={setShowPassword}
        onChangePassword={handleChangePassword}
        onShowLogoutModal={() => setShowLogoutModal(true)}
        onShowDeleteModal={() => setShowDeleteModal(true)}
      />
    ),
    notifications: (
      <NotificationsTab
        notifications={notifications}
        onNotificationsChange={setNotifications}
      />
    ),
    appearance: (
      <AppearanceTab
        appearance={appearance}
        onAppearanceChange={setAppearance}
      />
    ),
    reports: <ReportsTab />,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-bold text-neutral-900">설정</h1>
        </div>
      </header>

      {saveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          저장되었습니다
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:bg-red-600 rounded p-1"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
            <p className="mt-4 text-sm text-neutral-600">로딩 중...</p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1">{tabContent[activeTab]}</div>
        </div>
      </main>

      <DeleteUserModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

