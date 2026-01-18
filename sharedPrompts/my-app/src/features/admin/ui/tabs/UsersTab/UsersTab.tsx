import { useState } from 'react';
import { useUsersTab } from '../../../model/useUsersTab';
import { SearchBar, LoadingState, EmptyState, ErrorAlert, LoadMoreButton } from '../../../components';
import { UserTable } from './components/UserTable';

export function UsersTab() {
  const {
    items: users,
    isLoading,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleBlock,
    handleRoleChange,
    loadMore,
  } = useUsersTab();

  const [actionError, setActionError] = useState<string | null>(null);

  const handleBlockWithError = async (userId: number, isBlocked: boolean) => {
    try {
      setActionError(null);
      await handleBlock(userId, isBlocked);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleRoleChangeWithError = async (userId: number, role: 'USER' | 'ADMIN') => {
    try {
      setActionError(null);
      await handleRoleChange(userId, role);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">사용자 관리</h2>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="이메일 또는 닉네임으로 검색..."
        />
      </div>

      {error && <ErrorAlert message={error} />}
      {actionError && <ErrorAlert message={actionError} />}

      {isLoading && users.length === 0 ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState message="사용자가 없습니다." />
      ) : (
        <>
          <UserTable users={users} onBlock={handleBlockWithError} onRoleChange={handleRoleChangeWithError} />
          <LoadMoreButton onClick={loadMore} isLoading={isLoading} hasMore={hasMore} />
        </>
      )}
    </div>
  );
}

