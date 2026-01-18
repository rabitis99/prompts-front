import { useState, useEffect } from 'react';
import { commentApi } from '@/features/comment/api/comment.api';
import { likeApi } from '@/features/like/api/like.api';
import { userApi } from '@/features/auth/api/user.api';
import type { CommentResponseDto, CommentRequestDto, CommentUpdateDto } from '@/features/comment/types/comment.types';

export function useComments(promptId: number | null) {
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [togglingLikeIds, setTogglingLikeIds] = useState<Set<number>>(new Set());

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

  // 댓글 목록 조회
  useEffect(() => {
    if (!promptId) return;

    const fetchComments = async () => {
      try {
        const response = await commentApi.getComments(promptId);
        const commentsData = response.data.data;
        
        // 댓글과 답글을 분리하여 구조화
        const mainComments = commentsData.filter((c) => !c.parent_id);
        const repliesMap = new Map<number, CommentResponseDto[]>();
        
        commentsData.forEach((comment) => {
          if (comment.parent_id) {
            const replies = repliesMap.get(comment.parent_id) || [];
            replies.push(comment);
            repliesMap.set(comment.parent_id, replies);
          }
        });
        
        const structuredComments = mainComments.map((comment) => ({
          ...comment,
          replies: repliesMap.get(comment.id) || [],
        }));
        
        setComments(structuredComments);
        
        // 각 댓글의 좋아요 상태 확인
        const checkCommentLikes = async () => {
          try {
            const allCommentIds = [
              ...mainComments.map((c) => c.id),
              ...commentsData.filter((c) => c.parent_id).map((c) => c.id),
            ];

            const likeStatuses = await Promise.allSettled(
              allCommentIds.map((commentId) =>
                likeApi.checkCommentLike(commentId).then((res) => ({
                  commentId,
                  isLiked: res.data.data.isLiked,
                }))
              )
            );

            const likedIds = likeStatuses
              .filter((result) => result.status === 'fulfilled')
              .map((result) => {
                if (result.status === 'fulfilled') {
                  return result.value;
                }
                return null;
              })
              .filter((item): item is { commentId: number; isLiked: boolean } => item !== null)
              .filter((item) => item.isLiked)
              .map((item) => item.commentId);

            setLikedComments(likedIds);
          } catch (err) {
            console.error('Failed to check comment like statuses:', err);
            setLikedComments([]);
          }
        };

        checkCommentLikes();
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    };

    fetchComments();
  }, [promptId]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!promptId || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const commentData: CommentRequestDto = {
        content: commentText.trim(),
      };

      const response = await commentApi.createComment(promptId, commentData);
      const newComment = response.data.data;

      // 댓글 목록에 추가
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error('Failed to create comment:', error);
      return false;
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 댓글 좋아요 토글
  const toggleCommentLike = async (commentId: number) => {
    // 중복 요청 방지
    if (togglingLikeIds.has(commentId)) {
      return;
    }

    const wasLiked = likedComments.includes(commentId);

    // 처리 중 플래그 설정
    setTogglingLikeIds((prev) => new Set(prev).add(commentId));

    // 낙관적 업데이트
    setLikedComments((prev) =>
      wasLiked ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );

    // 댓글 목록의 좋아요 수 업데이트
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            like_count: wasLiked ? comment.like_count - 1 : comment.like_count + 1,
          };
        }
        // 답글도 업데이트
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    like_count: wasLiked ? reply.like_count - 1 : reply.like_count + 1,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );

    try {
      if (wasLiked) {
        await likeApi.unlikeComment(commentId);
      } else {
        await likeApi.likeComment(commentId);
      }
    } catch (error: any) {
      const status = error.response?.status;
      
      // 409 Conflict: 이미 좋아요를 눌렀거나 취소한 상태 - 현재 상태 유지 (에러 무시)
      // 404 Not Found: 좋아요가 이미 존재하지 않거나 취소된 상태 - 현재 상태 유지 (에러 무시)
      if (status === 409 || status === 404) {
        // 이미 처리된 상태이므로 롤백하지 않음
        console.warn('Comment like already processed or not found:', commentId, status);
        return;
      }

      // 400 Bad Request 등 다른 에러: 롤백
      setLikedComments((prev) =>
        wasLiked ? [...prev, commentId] : prev.filter((id) => id !== commentId)
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              like_count: wasLiked ? comment.like_count + 1 : comment.like_count - 1,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      like_count: wasLiked ? reply.like_count + 1 : reply.like_count - 1,
                    }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
      console.error('Failed to toggle comment like:', error);
    } finally {
      // 처리 중 플래그 해제
      setTogglingLikeIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // 댓글 수정 시작
  const startEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentContent);
  };

  // 댓글 수정 취소
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  // 댓글 수정 저장
  const saveEditComment = async (commentId: number) => {
    if (!promptId || !editingText.trim() || isUpdatingComment) return;

    setIsUpdatingComment(true);
    try {
      const updateData: CommentUpdateDto = {
        content: editingText.trim(),
      };

      const response = await commentApi.updateComment(promptId, commentId, updateData);
      const updatedComment = response.data.data;

      // 댓글 목록 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return updatedComment;
          }
          // 답글도 업데이트
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId ? updatedComment : reply
              ),
            };
          }
          return comment;
        })
      );

      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('댓글 수정에 실패했습니다.');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!promptId || isDeletingComment) return;

    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    setIsDeletingComment(true);
    try {
      await commentApi.deleteComment(promptId, commentId);

      // 댓글 목록에서 제거
      setComments((prev) =>
        prev
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies?.filter((reply) => reply.id !== commentId) || [],
          }))
      );
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setIsDeletingComment(false);
    }
  };

  // 댓글 작성자 본인 확인
  const isCommentOwner = (commentUserId: number) => {
    return currentUserId !== null && commentUserId === currentUserId;
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  return {
    comments: displayedComments,
    allCommentsCount: comments.length,
    commentText,
    setCommentText,
    showAllComments,
    setShowAllComments,
    likedComments,
    isSubmittingComment,
    handleSubmitComment,
    toggleCommentLike,
    currentUserId,
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
  };
}

