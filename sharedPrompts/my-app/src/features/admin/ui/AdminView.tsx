import React from 'react';
import { useAdminView } from '../model/useAdminView';
import { ADMIN_TABS } from '../constants/admin.constants';
import { DashboardTab } from './tabs/DashboardTab';
import { UsersTab } from './tabs/UsersTab/UsersTab';
import { PromptsTab } from './tabs/PromptsTab/PromptsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { AuditLogsTab } from './tabs/AuditLogsTab';

export function AdminView() {
  const { activeTab, setActiveTab } = useAdminView();

  const tabContent: Record<string, React.ReactElement> = {
    dashboard: <DashboardTab />,
    users: <UsersTab />,
    prompts: <PromptsTab />,
    reports: <ReportsTab />,
    'audit-logs': <AuditLogsTab />,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-bold text-neutral-900">관리자 페이지</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-2 sticky top-24">
              {ADMIN_TABS.map((tab) => {
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
    </div>
  );
}

