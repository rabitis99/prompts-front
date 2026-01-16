import {
  Search,
  Heart,
  MessageCircle,
  Copy,
  Check,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useHomeFeedView } from '@/features/prompt/model/useHomeFeedView';
import { DOMAIN_OPTIONS, SORT_OPTIONS } from '@/features/prompt/model/homeFeed.constants';
import { useNavigate } from 'react-router-dom';

export function HomeFeedView() {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    selectedDomain,
    setSelectedDomain,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    copiedId,
    likedIds,
    filteredPrompts,
    totalCount,
    isLoading,
    hasMore,
    error,
    handleCopy,
    toggleLike,
    handleResetFilters,
    handleLoadMore,
  } = useHomeFeedView();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프롬프트 검색..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Domain Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {DOMAIN_OPTIONS.map((domain) => {
              const Icon = domain.icon;
              const isActive = selectedDomain === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {domain.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort & Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-slate-600">
            {searchQuery ? filteredPrompts.length : (totalCount ?? 0)}개의 프롬프트
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-400 cursor-pointer"
              >
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all ${
                showFilters
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-900">상세 필터</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">태그</label>
                <input
                  placeholder="예: react, SEO"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">기간</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400">
                  <option>전체 기간</option>
                  <option>오늘</option>
                  <option>이번 주</option>
                  <option>이번 달</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">좋아요 수</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400">
                  <option>전체</option>
                  <option>100개 이상</option>
                  <option>500개 이상</option>
                  <option>1000개 이상</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && filteredPrompts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">프롬프트를 불러오는 중...</p>
          </div>
        )}

        {/* Prompt Grid */}
        {!isLoading || filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrompts.map((prompt) => {
            const isLiked = likedIds.includes(prompt.id);
            const isCopied = copiedId === prompt.id;

            return (
              <div
                key={prompt.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/prompts/${prompt.id}`)}
              >
                {/* Domain Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                    {prompt.prompt_category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">
                  {prompt.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                  {prompt.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-5 flex-wrap pb-5 border-b border-slate-100">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(prompt.id);
                      }}
                      className={`flex items-center gap-1.5 transition-colors ${
                        isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                      <span className="text-xs font-semibold">
                        {isLiked ? prompt.like_count + 1 : prompt.like_count}
                      </span>
                    </button>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">{prompt.comment_count}</span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(prompt.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isCopied
                        ? 'bg-green-50 text-green-600'
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        ) : null}

        {/* Empty State */}
        {!isLoading && filteredPrompts.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-sm text-slate-500 mb-6">다른 키워드로 검색해보세요</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredPrompts.length > 0 && hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

