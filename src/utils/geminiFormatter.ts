import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyBqGxNRyMZrl1gFwclJSvgwp5sOeqQ3lNc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Cache để lưu kết quả đã format (tránh gọi lại Gemini cho cùng nội dung)
const formatCache = new Map<string, { data: FormattedReadingTest; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting: Track last request time to avoid too many requests
// Gemini free tier typically allows 15 requests per minute = 1 request every 4 seconds minimum
// We use 10 seconds to be safe and avoid 429 errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // Minimum 10 seconds between requests (safe for free tier)

// Request queue to ensure only one request at a time
let requestQueue: Array<{
  resolve: (value: FormattedReadingTest) => void;
  reject: (error: any) => void;
  prompt: string;
}> = [];
let isProcessingQueue = false;

// Use latest Gemini model (not deprecated)
// Note: gemini-1.5-pro and gemini-1.5-flash are deprecated
// Using gemini-2.0-flash as it's the latest available model
const GEMINI_MODEL = "gemini-2.0-flash"; // Latest available model

export interface FormattedReadingTest {
  passage: string;
  questions: FormattedQuestion[];
}

export interface FormattedQuestion {
  type: "multiple_choice" | "true_false" | "short_answer" | "fill_in_the_blank";
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[]; // Hidden from students
  explanation?: string;
  points: number;
}

/**
 * Sleep/delay function for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is a rate limit error (429)
 */
function isRateLimitError(error: any): boolean {
  if (!error) return false;
  const errorMessage = error.message || error.toString() || "";
  const errorStatus = error.status || error.statusCode || "";
  return (
    errorStatus === 429 ||
    errorMessage.includes("429") ||
    errorMessage.includes("Too Many Requests") ||
    errorMessage.includes("Resource exhausted") ||
    errorMessage.includes("quota")
  );
}

/**
 * Process request queue - ensures only one API call at a time
 * Processes requests sequentially with rate limiting
 */
async function processRequestQueue() {
  // Prevent concurrent processing
  if (isProcessingQueue) {
    return;
  }

  isProcessingQueue = true;

  // Process all requests in queue sequentially
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (!request) break;

    try {
      // Rate limiting: Ensure minimum interval between requests
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && lastRequestTime > 0) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${Math.round(waitTime / 1000)}s before Gemini API call (${requestQueue.length} requests in queue)`);
        await delay(waitTime);
      }
      lastRequestTime = Date.now();

      console.log(`Calling Gemini API with model: ${GEMINI_MODEL} (${requestQueue.length} requests remaining in queue)`);

      const model = genAI.getGenerativeModel({ 
        model: GEMINI_MODEL,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096, // Increased for longer content
        },
      });

      const result = await model.generateContent(request.prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (handle potential markdown code blocks)
      let jsonText = text.trim();
      
      // Remove markdown code blocks
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/i, "").replace(/\s*```$/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/g, "").replace(/\s*```$/g, "");
      }

      // Try to parse JSON
      let formatted: FormattedReadingTest;
      try {
        formatted = JSON.parse(jsonText);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from the text
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          formatted = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse JSON from Gemini response. Response: " + jsonText.substring(0, 200));
        }
      }

      // Validate the format
      if (!formatted.passage || !formatted.questions || !Array.isArray(formatted.questions)) {
        throw new Error("Invalid format returned from Gemini: missing passage or questions");
      }

      request.resolve(formatted);
      console.log("Successfully formatted with Gemini API");
    } catch (error: any) {
      console.error("Error in Gemini API call:", error);
      request.reject(error);
    }
  }

  isProcessingQueue = false;
  
  // Check if new requests were added while processing
  // This handles the case where a request was added after the while loop ended
  if (requestQueue.length > 0) {
    // Recursively process remaining requests
    processRequestQueue().catch((error) => {
      console.error("Error processing remaining requests:", error);
    });
  }
}

/**
 * Call Gemini API once to format the reading test
 * Only called after receiving raw response from AI generator
 * Uses request queue to ensure only one request at a time
 */
async function callGeminiAPI(
  prompt: string
): Promise<FormattedReadingTest> {
  return new Promise((resolve, reject) => {
    // Add request to queue
    requestQueue.push({ resolve, reject, prompt });
    
    // Process queue if not already processing
    // This ensures requests are processed even if queue was empty before
    if (!isProcessingQueue) {
      processRequestQueue().catch((error) => {
        console.error("Error processing request queue:", error);
      });
    }
  });
}

/**
 * Use Gemini to format and structure the AI-generated reading test
 * Only calls Gemini ONCE after receiving raw response from AI generator
 * Falls back to manual parsing if Gemini fails
 */
export async function formatReadingTestWithGemini(
  rawContent: string,
  topic: string
): Promise<FormattedReadingTest> {
  // Check cache first
  const cacheKey = `${topic}-${rawContent.substring(0, 100)}`;
  const cached = formatCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Using cached formatted result");
    return cached.data;
  }

  const prompt = `You are a reading test formatter and editor. Given the following raw reading test content about "${topic}", please clean up and format it into a structured JSON format.

CRITICAL FORMATTING REQUIREMENTS:
1. **Clean up the reading passage:**
   - Fix all spacing issues (add spaces between words that are stuck together)
   - Fix capitalization (proper sentence case, capitalize first word of sentences)
   - Add proper paragraph breaks (split into logical paragraphs, each 3-5 sentences)
   - Remove duplicate words or phrases
   - Fix grammar and punctuation errors
   - Make the text readable and professional
   
2. **Extract and format questions properly:**
   - Fix spacing in questions
   - Fix capitalization in questions
   - Identify question types: multiple_choice, true_false, short_answer, or fill_in_the_blank
   - For multiple choice questions, extract all options (A, B, C, D) with proper formatting
   - Extract the correct answer for each question
   - Assign appropriate points to each question (1-5 points based on difficulty)
   - Remove any formatting errors or duplicate content

RAW CONTENT TO FORMAT:
${rawContent}

CRITICAL: You MUST return ONLY valid JSON format, no markdown, no explanations, no additional text. The response must be a valid JSON object with this exact structure:
{
  "passage": "cleaned and formatted reading passage text",
  "questions": [
    {
      "type": "multiple_choice" | "true_false" | "short_answer" | "fill_in_the_blank",
      "question": "question text",
      "options": ["option1", "option2", ...], // only for multiple_choice and true_false
      "correctAnswer": "correct answer",
      "points": 2
    }
  ]
}`;

  // Call Gemini API once (no retry, no multiple models)
  try {
    const formatted = await callGeminiAPI(prompt);

    // Cache successful result
    formatCache.set(cacheKey, {
      data: formatted,
      timestamp: Date.now(),
    });

    console.log("Successfully formatted using Gemini");
    return formatted;
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    
    // If it's a rate limit error, log warning but still fallback
    if (isRateLimitError(error)) {
      console.warn("Rate limit hit. Falling back to manual parsing to avoid further API calls.");
    }
    
    // Fallback to manual parsing immediately (no retry, no trying other models)
    console.warn("Falling back to manual parsing...");
    try {
      const manualResult = formatReadingTestManually(rawContent, topic);
      
      // Cache manual result
      formatCache.set(cacheKey, {
        data: manualResult,
        timestamp: Date.now(),
      });
      
      return manualResult;
    } catch (fallbackError) {
      console.error("Manual parsing also failed, returning minimal structure:", fallbackError);
      
      // Absolute last resort - return something that works
      const minimalResult = {
        passage: `Reading Comprehension Test: ${topic}\n\nPlease read the following content and answer the questions.\n\n${rawContent}`,
        questions: [
          {
            type: "short_answer" as const,
            question: "What is the main topic of this passage?",
            correctAnswer: topic,
            points: 10,
          }
        ],
      };
      
      // Cache even the minimal result
      formatCache.set(cacheKey, {
        data: minimalResult,
        timestamp: Date.now(),
      });
      
      return minimalResult;
    }
  }
}

/**
 * Clean up text by fixing spacing and capitalization issues
 */
function cleanupText(text: string): string {
  return text
    // Fix words stuck together (add space before capital letters in middle of words)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Fix missing spaces after punctuation
    .replace(/([.!?])([A-Z])/g, '$1 $2')
    // Fix multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Fix excessive newlines but keep paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Add proper paragraph breaks to a passage
 */
function formatParagraphs(passage: string): string {
  // Split by sentences
  const sentences = passage.match(/[^.!?]+[.!?]+/g) || [passage];
  
  // Group into paragraphs (4-5 sentences each)
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 4) {
    const paragraph = sentences.slice(i, i + 4).join(' ').trim();
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  }
  
  return paragraphs.join('\n\n');
}

/**
 * Fallback: Manual parsing when Gemini API fails
 * Always returns a result, never throws
 */
function formatReadingTestManually(
  rawContent: string,
  topic: string
): FormattedReadingTest {
  try {
    // Split content into passage and questions
    const sections = rawContent.split(/Questions?:\s*/i);
    
    let passage = "";
    let questionsText = rawContent;
    
    if (sections.length >= 2) {
      // Has both passage and questions
      passage = sections[0]
        .replace(/Reading Passage:\s*/i, "")
        .trim();
      passage = cleanupText(passage);
      passage = formatParagraphs(passage);
      questionsText = sections[1].trim();
    } else {
      // No clear separation, try to extract passage from beginning
      const lines = rawContent.split('\n');
      const passageLines: string[] = [];
      let foundQuestions = false;
      
      for (const line of lines) {
        if (/^\d+\.\s*/.test(line.trim())) {
          foundQuestions = true;
          break;
        }
        passageLines.push(line);
      }
      
      if (passageLines.length > 0) {
        passage = cleanupText(passageLines.join('\n').replace(/Reading Passage:\s*/i, "").trim());
        passage = formatParagraphs(passage);
      }
      
      // Use all content as questions section
      questionsText = rawContent;
    }
    
    // Ensure we have at least some passage
    if (!passage || passage.trim().length === 0) {
      passage = `This is a reading comprehension test about ${topic}. The reading passage will help you answer the questions below.`;
    }

    // Parse questions
    const questionPattern = /(\d+)\.\s*([^\n]+(?:\n(?!\d+\.)[^\n]+)*)\s*(?:Answer[:\s]*([^\n]+))?/gi;
    const questions: FormattedQuestion[] = [];
    
    let match;
    while ((match = questionPattern.exec(questionsText)) !== null) {
      const questionNumber = parseInt(match[1]);
      let questionText = cleanupText(match[2].trim());
      let answer = match[3]?.trim() || "";

      // Extract answer if it's on the next line
      if (!answer) {
        const nextLineMatch = questionText.match(/\n\s*(?:Answer[:\s]*|Response[:\s]*)(.+)/i);
        if (nextLineMatch) {
          answer = cleanupText(nextLineMatch[1].trim());
          questionText = questionText.replace(/\n\s*(?:Answer[:\s]*|Response[:\s]*)(.+)/i, "").trim();
        }
      }
      
      // Clean up answer
      answer = cleanupText(answer);

      // Detect question type and extract options
      let type: FormattedQuestion["type"] = "short_answer";
      let options: string[] | undefined;

      // Check for multiple choice (A), B), C), D)
      const mcPattern = /([A-D][\).])\s*([^\n]+?)(?=\s*[A-D][\).]|\n\s*Answer|$)/gi;
      const mcMatches = questionText.match(mcPattern);
      
      if (mcMatches && mcMatches.length >= 2) {
        type = "multiple_choice";
        options = mcMatches.map((opt) => cleanupText(opt.replace(/^[A-D][\).]?\s*/i, "").trim()));
        questionText = cleanupText(questionText.split(/[A-D][\).]/i)[0].trim());
      }
      // Check for True/False
      else if (
        /true|false/i.test(answer) ||
        questionText.toLowerCase().includes("true or false")
      ) {
        type = "true_false";
        options = ["True", "False"];
      }
      // Check for fill in the blank (has ___ or blank)
      else if (questionText.includes("___") || /fill.*blank|complete.*sentence/i.test(questionText)) {
        type = "fill_in_the_blank";
      }

      // Assign points based on type and difficulty
      let points = 1;
      if (type === "multiple_choice") points = 2;
      else if (type === "short_answer") points = 3;
      else if (type === "fill_in_the_blank") points = 2;

      questions.push({
        type,
        question: questionText,
        options,
        correctAnswer: answer || "Answer not provided",
        points,
      });
    }

    // If no questions found, create a default one
    if (questions.length === 0) {
      console.warn("No questions found, creating default question");
      questions.push({
        type: "short_answer",
        question: "Based on the reading passage, what is the main topic?",
        correctAnswer: topic,
        points: 5,
      });
    }

    return {
      passage,
      questions,
    };
  } catch (error) {
    console.error("Manual parsing failed, returning minimal structure:", error);
    
    // Return minimal structure that allows assignment creation
    return {
      passage: `This is a reading comprehension test about ${topic}. Please read the content carefully and answer the questions.\n\n${rawContent.substring(0, 1000)}`,
      questions: [
        {
          type: "short_answer",
          question: "Based on the reading passage, what is the main topic?",
          correctAnswer: topic,
          points: 5,
        },
        {
          type: "short_answer", 
          question: "What are the key points discussed in the passage?",
          correctAnswer: "Various aspects related to " + topic,
          points: 5,
        }
      ],
    };
  }
}

/**
 * Convert formatted questions to Quiz assignment question format
 */
export function convertToQuizQuestions(formattedQuestions: FormattedQuestion[]) {
  return formattedQuestions.map((q, index) => {
    const baseQuestion = {
      id: `q-${Date.now()}-${index}`,
      type: q.type,
      order: index + 1,
      question: q.question,
      points: q.points,
      explanation: q.explanation,
    };

    switch (q.type) {
      case "multiple_choice":
      case "true_false":
        return {
          ...baseQuestion,
          options: q.options?.map((opt, idx) => ({
            id: `opt-${index}-${idx}`,
            label: String.fromCharCode(65 + idx), // A, B, C, D
            text: opt,
          })),
          correctAnswer: q.options?.findIndex(opt => opt === q.correctAnswer),
          shuffleOptions: false,
        };

      case "fill_in_the_blank":
        // Parse blanks from question text
        const blanks = Array.isArray(q.correctAnswer)
          ? q.correctAnswer.map((ans, idx) => ({
              id: `blank-${index}-${idx}`,
              position: idx,
              correctAnswers: [ans],
              caseSensitive: false,
            }))
          : [
              {
                id: `blank-${index}-0`,
                position: 0,
                correctAnswers: [q.correctAnswer as string],
                caseSensitive: false,
              },
            ];
        return {
          ...baseQuestion,
          blanks,
        };

      case "short_answer":
        return {
          ...baseQuestion,
          correctAnswer: q.correctAnswer,
          maxLength: 500,
          keywords: Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [q.correctAnswer as string],
          requiresManualGrading: true,
        };

      default:
        return baseQuestion;
    }
  });
}

