// Production / Artifact 관련 타입들
// 백엔드 module.dto.response.production.* 및 module.dto.request.production.* 기준

// JobStatus (org.example.sharedprompts.module.domain.production.model.job.JobStatus)
export type JobStatus =
  | 'PENDING'
  | 'RETRYING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'UNKNOWN';

// ArtifactType (org.example.sharedprompts.module.domain.production.model.contract.result.ArtifactType)
// 백엔드 enum: TEXT, FILE, IMAGE, HTML, MARKDOWN, JSON
export type ArtifactType = 'TEXT' | 'FILE' | 'IMAGE' | 'HTML' | 'MARKDOWN' | 'JSON';

// TextProductionRequestDto (TextProductionRequestDto.java)
export interface TextProductionRequestDto {
  userInput: string;
}

// ImageProductionRequestDto (ImageProductionRequestDto.java)
export interface ImageProductionRequestDto {
  width: number;
  height: number;
  userInput?: string;
}

// EmailProductionRequestDto (EmailProductionRequestDto.java)
export interface EmailProductionRequestDto {
  subject: string;
  recipient: string;
  userInput?: string;
}

// BlogProductionRequestDto (BlogProductionRequestDto.java)
export interface BlogProductionRequestDto {
  title: string;
  tags: string[];
  userInput?: string;
}

// DocumentProductionRequestDto (DocumentProductionRequestDto.java)
export interface DocumentProductionRequestDto {
  fileName: string;
  format: string;
  userInput?: string;
}

// LiteraryProductionRequestDto (LiteraryProductionRequestDto.java)
// LiteraryType 그대로 매핑
export type LiteraryType = 'NOVEL' | 'POEM' | 'SHORT_STORY' | 'SCRIPT';
// LiteraryFormat enum은 현재 STANDARD 하나뿐이므로 여기도 동일하게 맞춘다
export type LiteraryFormat = 'STANDARD';

export interface LiteraryProductionRequestDto {
  literaryType: LiteraryType;
  fileName: string;
  format: LiteraryFormat;
  userInput?: string | null;
}

// JobResponseDto (JobResponseDto.java)
export interface ProductionJobResponseDto {
  job_id: string;
  status: JobStatus;
  artifact_id: string | null;
  production_id?: number | null;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
}

// ArtifactSummaryDto (ArtifactSummaryDto.java)
export interface ArtifactSummaryDto {
  artifact_id: number;
  type: ArtifactType;
  is_primary: boolean;
  file_name: string;
  content_type: string;
}

// ArtifactDetailResponseDto (ArtifactDetailResponseDto.java)
export interface ArtifactDetailResponseDto {
  artifact_id: number;
  production_id: number;
  type: ArtifactType;
  is_primary: boolean;
  file_name: string;
  content_type: string;
  storage_location: string; // 항상 "S3"
  presigned_url: string;
  cdn_url?: string | null;
  thumbnail_urls?: Record<string, string> | null;
  content?: string | null;
  created_at: string;
}

// ArtifactDto (polymorphic; 간단히 유니온 타입으로 표현)
export type TextArtifactDto = {
  type: 'TEXT';
  content: string;
};

export type FileArtifactDto = {
  type: 'FILE';
  file_name: string;
  content_type: string;
  storage_location: string;
  cdn_url?: string | null;
};

export type ImageArtifactDto = {
  type: 'IMAGE';
  file_name: string;
  content_type: string;
  thumbnail_urls?: Record<string, string> | null;
  cdn_url?: string | null;
};

export type HtmlArtifactDto = {
  type: 'HTML';
  content: string;
};

export type MarkdownArtifactDto = {
  type: 'MARKDOWN';
  content: string;
};

export type JsonArtifactDto = {
  type: 'JSON';
  content: string;
};

export type ArtifactDto =
  | TextArtifactDto
  | FileArtifactDto
  | ImageArtifactDto
  | HtmlArtifactDto
  | MarkdownArtifactDto
  | JsonArtifactDto;

// ProductionResponseDto (ProductionResponseDto.java)
export type ProductionStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

export interface ProductionResponseDto {
  production_id: number;
  status: ProductionStatus;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  artifact: ArtifactDto | null;
  artifacts: ArtifactSummaryDto[];
}

