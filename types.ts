
export type SupportedLanguage = 'Tamil' | 'English' | 'Hindi' | 'Malayalam' | 'Telugu';

export type ClassificationLabel = 'AI_GENERATED' | 'HUMAN';

export interface DetectionRequest {
  language: SupportedLanguage;
  audioFormat: 'mp3';
  audioBase64: string;
}

export interface DetectionResponse {
  status: 'success' | 'error';
  language?: SupportedLanguage;
  classification?: ClassificationLabel;
  confidenceScore?: number;
  explanation?: string;
  message?: string;
}

export interface AppState {
  language: SupportedLanguage;
  file: File | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
  lastRequest: DetectionRequest | null;
  lastResponse: DetectionResponse | null;
  error: string | null;
}
