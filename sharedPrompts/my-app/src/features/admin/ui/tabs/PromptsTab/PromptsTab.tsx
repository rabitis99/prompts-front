import { useState } from 'react';
import { usePromptsTab } from '../../../model/usePromptsTab';
import { SearchBar, LoadingState, EmptyState, ErrorAlert, LoadMoreButton } from '../../../components';
import { PromptCard } from './components/PromptCard';

export function PromptsTab() {
  const {
    items: prompts,
    isLoading,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleDelete,
    handleToggleVisibility,
    loadMore,
  } = usePromptsTab();

  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeleteWithConfirm = async (promptId: number) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setActionError(null);
      await handleDelete(promptId);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleToggleVisibilityWithError = async (promptId: number, isPublic: boolean) => {
    try {
      setActionError(null);
      await handleToggleVisibility(promptId, isPublic);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">프롬프트 관리</h2>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="제목 또는 내용으로 검색..."
        />
      </div>

      {error && <ErrorAlert message={error} />}
      {actionError && <ErrorAlert message={actionError} />}

      {isLoading && prompts.length === 0 ? (
        <LoadingState />
      ) : prompts.length === 0 ? (
        <EmptyState message="프롬프트가 없습니다." />
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onDelete={handleDeleteWithConfirm}
              onToggleVisibility={handleToggleVisibilityWithError}
            />
          ))}
          <LoadMoreButton onClick={loadMore} isLoading={isLoading} hasMore={hasMore} />
        </div>
      )}
    </div>
  );
}

