import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePromptDetail } from './usePromptDetail';
import { useComments } from './useComments';
import { useRelatedPrompts } from './useRelatedPrompts';
import { usePromptActions } from './usePromptActions';
import { promptApi } from '@/features/prompt/api/prompt.api';
import { userApi } from '@/features/auth/api/user.api';
import type { PromptUpdateDto } from '@/features/prompt/types/prompt.types';
import { PromptCategory } from '@/features/prompt/types/prompt.types';
import type { ReportType } from '@/features/report/types/report.types';

export function usePromptDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const promptId = id ? parseInt(id, 10) : null;

  const [showMore, setShowMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [reportType, setReportType] = useState<ReportType | null>(null);

  // 프롬프트 상세 조회
  const { prompt, setPrompt, isLoading, error } = usePromptDetail(promptId);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await userApi.getMyInfo();
        setCurrentUserId(response.data.data.id);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // 댓글 관련 로직
  const {
    comments,
    allCommentsCount,
    commentText,
    setCommentText,
    showAllComments,
    setShowAllComments,
    likedComments,
    isSubmittingComment,
    handleSubmitComment,
    toggleCommentLike,
    editingCommentId,
    editingText,
    isUpdatingComment,
    isDeletingComment,
    setEditingText,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    handleDeleteComment,
    isCommentOwner,
  } = useComments(promptId);

  // 관련 프롬프트 조회
  const { relatedPrompts } = useRelatedPrompts(prompt);

  // 프롬프트 액션 (좋아요, 북마크, 복사)
  const { liked, bookmarked, copied, toggleLike, toggleBookmark, handleCopy } = usePromptActions(
    promptId,
    prompt,
    setPrompt
  );

  // 댓글 작성 후 프롬프트 댓글 수 업데이트
  const handleSubmitCommentWithUpdate = async () => {
    const success = await handleSubmitComment();
    if (success && prompt) {
      setPrompt({
        ...prompt,
        comment_count: prompt.comment_count + 1,
      });
    }
  };

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  // 프롬프트 삭제
  const handleDeletePrompt = async () => {
    if (!promptId) return;

    setIsDeleting(true);
    try {
      await promptApi.deletePrompt(promptId);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      alert('프롬프트 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 프롬프트 수정
  const handleUpdatePrompt = async (updateData: { title?: string; description?: string; is_public?: boolean; prompt_category?: string; tags?: string[] }) => {
    if (!promptId) return;

    try {
      const updateDto: PromptUpdateDto = {
        title: updateData.title,
        description: updateData.description,
        is_public: updateData.is_public,
        prompt_category: updateData.prompt_category ? (updateData.prompt_category as PromptCategory) : undefined,
        tags: updateData.tags,
      };
      const response = await promptApi.updatePrompt(promptId, updateDto);
      setPrompt(response.data.data);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update prompt:', err);
      alert('프롬프트 수정에 실패했습니다.');
    }
  };

  // 작성자 본인 확인
  const isOwner = prompt && currentUserId ? prompt.user_response_dto.id === currentUserId : false;

  // 신고 모달 열기 (프롬프트)
  const handleOpenReportModal = () => {
    if (promptId) {
      setReportTargetId(promptId);
      setReportType('PROMPT');
      setShowReportModal(true);
      setShowMore(false);
    }
  };

  // 신고 모달 열기 (댓글)
  const handleOpenCommentReportModal = (commentId: number) => {
    setReportTargetId(commentId);
    setReportType('COMMENT');
    setShowReportModal(true);
  };

  // 신고 모달 닫기
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportTargetId(null);
    setReportType(null);
  };

  return {
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
    setShowMore,
    setCommentText,
    setShowAllComments,
    toggleLike,
    toggleBookmark,
    handleCopy,
    handleSubmitComment: handleSubmitCommentWithUpdate,
    toggleCommentLike,
    handleBack,
    allCommentsCount,
    isOwner,
    showEditModal,
    showDeleteModal,
    isDeleting,
    setShowEditModal,
    setShowDeleteModal,
    handleDeletePrompt,
    handleUpdatePrompt,
    editingCommentId,
    editingText,
    isUpdatingComment,
    isDeletingComment,
    setEditingText,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    handleDeleteComment,
    isCommentOwner,
    showReportModal,
    reportTargetId,
    reportType,
    handleOpenReportModal,
    handleOpenCommentReportModal,
    handleCloseReportModal,
  };
}

