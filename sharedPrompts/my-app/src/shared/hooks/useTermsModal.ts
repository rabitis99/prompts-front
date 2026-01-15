import { useState } from 'react';

type TermsModalType = 'terms' | 'privacy' | null;

export const useTermsModal = () => {
  const [termsModalType, setTermsModalType] = useState<TermsModalType>(null);

  const openTermsModal = (type: 'terms' | 'privacy') => {
    setTermsModalType(type);
  };

  const closeTermsModal = () => {
    setTermsModalType(null);
  };

  return {
    termsModalType,
    openTermsModal,
    closeTermsModal,
  };
};

