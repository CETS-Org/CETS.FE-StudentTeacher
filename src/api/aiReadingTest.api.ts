import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// AI Reading Test API endpoint
const AI_READING_TEST_API_URL = 'http://localhost:5002';

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

