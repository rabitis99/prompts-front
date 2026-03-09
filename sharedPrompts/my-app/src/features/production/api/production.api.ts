import { api } from '@/shared/api/axios';
import type {
  TextProductionRequestDto,
  ImageProductionRequestDto,
  EmailProductionRequestDto,
  BlogProductionRequestDto,
  DocumentProductionRequestDto,
  LiteraryProductionRequestDto,
  ProductionJobResponseDto,
  ProductionResponseDto,
  ArtifactSummaryDto,
  ArtifactDetailResponseDto,
} from '../types/production.types';
import type { CustomResponse } from '@/shared/types/api';

/**
 * Production API
 * 백엔드:
 * - ProductionController (/prompts/{promptId}/production/*)
 * - ProductionResultController (/production/{id}, /jobs/*, /productions/{id}/artifacts*)
 */
export const productionApi = {
  /**
   * 프롬프트 생산 실행 (TEXT)
   * POST /prompts/{promptId}/production/text
   */
  produceText: (promptId: number, data: TextProductionRequestDto) =>
    api.post<CustomResponse<ProductionJobResponseDto>>(
      `/prompts/${promptId}/production/text`,
      data,
    ),

  /**
   * 프롬프트 생산 실행 (IMAGE)
   * POST /prompts/{promptId}/production/image
   */
  produceImage: (promptId: number, data: ImageProductionRequestDto) =>
    api.post<CustomResponse<ProductionJobResponseDto>>(
      `/prompts/${promptId}/production/image`,
      data,
    ),

  /**
   * 프롬프트 생산 실행 (EMAIL)
   * POST /prompts/{promptId}/production/email
   */
  produceEmail: (promptId: number, data: EmailProductionRequestDto) =>
    api.post<CustomResponse<ProductionJobResponseDto>>(
      `/prompts/${promptId}/production/email`,
      data,
    ),

  /**
   * 프롬프트 생산 실행 (BLOG)
   * POST /prompts/{promptId}/production/blog
   */
  produceBlog: (promptId: number, data: BlogProductionRequestDto) =>
    api.post<CustomResponse<ProductionJobResponseDto>>(
      `/prompts/${promptId}/production/blog`,
      data,
    ),

  /**
   * 프롬프트 생산 실행 (DOCUMENT)
   * POST /prompts/{promptId}/production/document
   */
  produceDocument: (promptId: number, data: DocumentProductionRequestDto) =>
    api.post<CustomResponse<ProductionJobResponseDto>>(
      `/prompts/${promptId}/production/document`,
      data,
    ),

  /**
   * 프롬프트 생산 실행 (LITERARY)
   * POST /prompts/{promptId}/production/literary
   */
  produceLiterary: (promptId: number, data: LiteraryProductionRequestDto) =>
    api.post<CustomResponse<ProductionJobResponseDto>>(
      `/prompts/${promptId}/production/literary`,
      data,
    ),

  /**
   * 생산 결과 조회
   * GET /production/{productionId}
   */
  getProductionResult: (productionId: number) =>
    api.get<CustomResponse<ProductionResponseDto>>(
      `/production/${productionId}`,
    ),

  /**
   * 작업 상태 조회
   * GET /jobs/{jobId}
   */
  getJobStatus: (jobId: string) =>
    api.get<CustomResponse<ProductionJobResponseDto>>(`/jobs/${jobId}`),

  /**
   * 작업 재시도
   * POST /jobs/{jobId}/retry
   */
  retryJob: (jobId: string) =>
    api.post<CustomResponse<string>>(`/jobs/${jobId}/retry`),

  /**
   * 아티팩트 목록 조회
   * GET /productions/{productionId}/artifacts
   */
  getArtifacts: (productionId: number) =>
    api.get<CustomResponse<ArtifactSummaryDto[]>>(
      `/productions/${productionId}/artifacts`,
    ),

  /**
   * 아티팩트 상세 조회
   * GET /productions/{productionId}/artifacts/{artifactId}
   */
  getArtifact: (productionId: number, artifactId: number) =>
    api.get<CustomResponse<ArtifactDetailResponseDto>>(
      `/productions/${productionId}/artifacts/${artifactId}`,
    ),
};

