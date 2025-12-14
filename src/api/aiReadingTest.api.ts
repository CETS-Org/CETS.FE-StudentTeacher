import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// AI Reading Test API endpoint
// Automatically convert HTTP to HTTPS when page is loaded over HTTPS to avoid Mixed Content errors
const getAIReadingTestApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL_AI_READING_TEST || 'http://localhost:5002';
  
  // If page is loaded over HTTPS and API URL is HTTP, convert to HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
    return envUrl.replace('http://', 'https://');
  }
  
  return envUrl;
};

const AI_READING_TEST_API_URL = getAIReadingTestApiUrl();

export interface GenerateReadingTestRequest {
  topic: string;
}

export interface GeneratedQuestion {
  question: string;
  answer: string;
  type?: string;
}

export interface GenerateReadingTestResponse {
  success: boolean;
  topic: string;
  test_type: string;
  generated_content: string;
  length: number;
}

/**
 * Generate a reading test using AI
 */
export const generateReadingTest = async (
  topic: string,
  config?: AxiosRequestConfig
): Promise<GenerateReadingTestResponse> => {
  const response = await axios.post<GenerateReadingTestResponse>(
    `${AI_READING_TEST_API_URL}/generate`,
    { topic },
    config
  );
  return response.data;
};

