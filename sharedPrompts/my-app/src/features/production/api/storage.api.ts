import { api } from '@/shared/api/axios';
import type { CustomResponse } from '@/shared/types/api';

// StorageController.PresignedUrlResponse
export interface PresignedUrlResponse {
  presignedUrl: string;
}

// StorageController.UploadUrlRequest
export interface UploadUrlRequest {
  jobId: string;
  fileName: string;
  contentType: string;
}

// StorageController.DownloadUrlRequest
export interface DownloadUrlRequest {
  artifactId: number;
}

// StorageController.PreviewUrlRequest
export interface PreviewUrlRequest {
  artifactId: number;
}

/**
 * Storage API
 * 백엔드: StorageController (/storage/*)
 */
export const storageApi = {
  /**
   * 업로드용 Presigned URL 생성
   * POST /storage/upload-url
   */
  generateUploadUrl: (data: UploadUrlRequest) =>
    api.post<CustomResponse<PresignedUrlResponse>>(
      '/storage/upload-url',
      data,
    ),

  /**
   * 다운로드용 Presigned URL 생성
   * POST /storage/download-url
   */
  generateDownloadUrl: (data: DownloadUrlRequest) =>
    api.post<CustomResponse<PresignedUrlResponse>>(
      '/storage/download-url',
      data,
    ),

  /**
   * 미리보기용 Presigned URL 생성
   * POST /storage/preview-url
   */
  generatePreviewUrl: (data: PreviewUrlRequest) =>
    api.post<CustomResponse<PresignedUrlResponse>>(
      '/storage/preview-url',
      data,
    ),
};

