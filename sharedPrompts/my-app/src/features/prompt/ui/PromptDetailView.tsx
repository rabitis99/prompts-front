import { useRef } from 'react';
import { usePromptDetailView } from '@/features/prompt/model/detail/usePromptDetailView';
import { PromptDetailHeader } from './PromptDetailHeader';
import { PromptDetailCard } from './PromptDetailCard';
import { CommentsSection } from './CommentsSection';
import { RelatedPrompts } from './RelatedPrompts';
import { formatDate, getAvatarGradient } from './utils';
import { EditPromptModal } from './EditPromptModal';
import { DeletePromptModal } from './DeletePromptModal';
import { ReportModal } from '@/features/report/ui/ReportModal';
import { PromptProductionSection } from '@/features/production/ui/PromptProductionSection';

export function PromptDetailView() {
  const {
    prompt,
    comments,
    relatedPrompts,
    isLoading,
    error,
    liked,
    bookmarked,
    copied,
    showMore,
    commentText,
    showAllComments,
    likedComments,
    isSubmittingComment,
    isOwner,
    currentUserId,
    showEditModal,
    showDeleteModal,
    isDeleting,
    editingCommentId,
    editingText,
    isUpdatingComment,
    isDeletingComment,
    setShowMore,
    setCommentText,
    setShowAllComments,
    setShowEditModal,
    setShowDeleteModal,
    setEditingText,
    toggleLike,
    toggleBookmark,
    handleCopy,
    handleSubmitComment,
    toggleCommentLike,
    handleBack,
    handleDeletePrompt,
    handleUpdatePrompt,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    handleDeleteComment,
    isCommentOwner,
    allCommentsCount,
    showReportModal,
    reportTargetId,
    reportType,
    handleOpenReportModal,
    handleOpenCommentReportModal,
    handleCloseReportModal,
    isLiking,
  } = usePromptDetailView();

  const productionSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToProductionSection = () => {
    if (productionSectionRef.current) {
      productionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-slate-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error?.message || '프롬프트를 찾을 수 없습니다.'}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PromptDetailHeader
        bookmarked={bookmarked}
        showMore={showMore}
        isOwner={isOwner}
        onBack={handleBack}
        onToggleBookmark={toggleBookmark}
        onToggleShowMore={() => setShowMore(!showMore)}
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        onReport={handleOpenReportModal}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PromptDetailCard
              prompt={prompt}
              liked={liked}
              isLiking={isLiking}
              copied={copied}
              currentUserId={currentUserId}
              onToggleLike={toggleLike}
              onCopy={handleCopy}
              formatDate={formatDate}
              onUseWithAi={scrollToProductionSection}
            />

            {/* Production 모듈 연동 섹션 (텍스트 생성 베타) */}
            <div ref={productionSectionRef} id="prompt-production-section">
              <PromptProductionSection promptId={prompt.id} />
            </div>

            <CommentsSection
              prompt={prompt}
              comments={comments}
              allCommentsCount={allCommentsCount}
              commentText={commentText}
              showAllComments={showAllComments}
              likedComments={likedComments}
              isSubmittingComment={isSubmittingComment}
              editingCommentId={editingCommentId}
              editingText={editingText}
              isUpdatingComment={isUpdatingComment}
              isDeletingComment={isDeletingComment}
              formatDate={formatDate}
              getAvatarGradient={getAvatarGradient}
              onCommentTextChange={setCommentText}
              onSubmitComment={handleSubmitComment}
              onToggleShowAllComments={() => setShowAllComments(!showAllComments)}
              onToggleCommentLike={toggleCommentLike}
              onStartEditComment={startEditComment}
              onCancelEditComment={cancelEditComment}
              onSaveEditComment={saveEditComment}
              onDeleteComment={handleDeleteComment}
              onEditingTextChange={setEditingText}
              isCommentOwner={isCommentOwner}
              onReportComment={handleOpenCommentReportModal}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RelatedPrompts relatedPrompts={relatedPrompts} />
          </div>
        </div>
      </main>

      <EditPromptModal
        isOpen={showEditModal}
        prompt={prompt}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdatePrompt}
      />

      <DeletePromptModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePrompt}
      />

      {showReportModal && reportTargetId && reportType && (
        <ReportModal
          isOpen={showReportModal}
          onClose={handleCloseReportModal}
          reportType={reportType}
          targetId={reportTargetId}
          onSuccess={() => {
            // 신고 성공 시 추가 처리 (필요시)
          }}
        />
      )}
    </div>
  );
}

