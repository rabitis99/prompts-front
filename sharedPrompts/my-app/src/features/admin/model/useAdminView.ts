import { useState } from 'react';
import type { AdminTabId } from '../constants/admin.constants';

export function useAdminView() {
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');

  return {
    activeTab,
    setActiveTab,
  };
}

