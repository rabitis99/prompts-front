import { useState } from 'react';
import { PaymentHistoryView } from './PaymentHistoryView';
import { PointHistoryView } from './PointHistoryView';
import { CashbackHistoryView } from './CashbackHistoryView';
import { TierInfoView } from './TierInfoView';

type TabType = 'tier' | 'payment' | 'point' | 'cashback';

export function PaymentManagementView() {
  const [activeTab, setActiveTab] = useState<TabType>('tier');

  const tabs = [
    { id: 'tier' as TabType, label: '티어 정보', icon: '⭐' },
    { id: 'payment' as TabType, label: '결제 내역', icon: '💳' },
    { id: 'point' as TabType, label: '포인트', icon: '🎁' },
    { id: 'cashback' as TabType, label: '캐시백', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 탭 네비게이션 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'tier' && <TierInfoView />}
        {activeTab === 'payment' && <PaymentHistoryView />}
        {activeTab === 'point' && <PointHistoryView />}
        {activeTab === 'cashback' && <CashbackHistoryView />}
      </div>
    </div>
  );
}

