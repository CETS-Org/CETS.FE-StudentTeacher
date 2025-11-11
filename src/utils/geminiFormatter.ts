const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // Replace with your Groq API key
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

// Cache để lưu kết quả đã format
const formatCache = new Map<string, { data: FormattedReadingTest; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;

export interface FormattedReadingTest {
  passage: string;
  questions: FormattedQuestion[];
}

export interface FormattedQuestion {
  type: "multiple_choice" | "true_false" | "short_answer" | "fill_in_the_blank";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

async function callGroqAPI(prompt: string): Promise<FormattedReadingTest> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && lastRequestTime > 0) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  console.log("Calling Groq API...");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a reading test formatter. Return ONLY valid JSON, no markdown, no explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  if (!text) {
    throw new Error("Empty response from Groq");
  }

  // Extract JSON from markdown code blocks if present
  let jsonText = text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/\s*```$/g, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```\s*/g, "").replace(/\s*```$/g, "");
  }

  // Parse JSON
  let formatted: FormattedReadingTest;
  try {
    formatted = JSON.parse(jsonText);
  } catch (parseError) {
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      formatted = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Could not parse JSON: " + jsonText.substring(0, 200));
    }
  }

  // Validate
  if (!formatted.passage || !formatted.questions || !Array.isArray(formatted.questions)) {
    throw new Error("Invalid format: missing passage or questions");
  }

  console.log("✓ Successfully formatted with Groq");
  return formatted;
}

export async function formatReadingTestWithGemini(
  rawContent: string,
  topic: string
): Promise<FormattedReadingTest> {
  // Check cache
  const cacheKey = `${topic}-${rawContent.substring(0, 100)}`;
  const cached = formatCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("✓ Using cached result");
    return cached.data;
  }

  const prompt = `Format this reading test about "${topic}" into structured JSON.

CRITICAL REQUIREMENTS:

1. PASSAGE FORMATTING (VERY IMPORTANT):
   - Split the passage into clear paragraphs using \\n\\n (double newline)
   - Each paragraph should be 3-5 sentences
   - Fix spacing between words
   - Fix capitalization
   - Remove duplicates
   - Fix grammar and punctuation
   - MUST have paragraph breaks, not one long block of text

2. QUESTIONS FORMATTING:
   - Fix spacing and capitalization
   - Identify types: multiple_choice, true_false, short_answer, fill_in_the_blank
   - Extract all options for multiple choice
   - Extract correct answers
   - Assign points (1-5 based on difficulty)

RAW CONTENT:
${rawContent}

Return ONLY this JSON structure (passage MUST have \\n\\n between paragraphs):
{
  "passage": "First paragraph here.\\n\\nSecond paragraph here.\\n\\nThird paragraph here.",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "points": 2
    }
  ]
}`;

  try {
    const formatted = await callGroqAPI(prompt);
    formatCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
    return formatted;
  } catch (error: any) {
    console.error("❌ Groq API failed, returning raw content:", error);
    
    // Fallback: trả về đề gốc không format
    const fallbackResult: FormattedReadingTest = {
      passage: rawContent,
      questions: [{
        type: "short_answer",
        question: "Please answer the questions based on the reading passage above.",
        correctAnswer: "Answer based on passage",
        points: 10,
      }],
    };
    
    return fallbackResult;
  }
}

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
            label: String.fromCharCode(65 + idx),
            text: opt,
          })),
          correctAnswer: q.options?.findIndex(opt => opt === q.correctAnswer),
          shuffleOptions: false,
        };

      case "fill_in_the_blank":
        const blanks = Array.isArray(q.correctAnswer)
          ? q.correctAnswer.map((ans, idx) => ({
              id: `blank-${index}-${idx}`,
              position: idx,
              correctAnswers: [ans],
              caseSensitive: false,
            }))
          : [{
              id: `blank-${index}-0`,
              position: 0,
              correctAnswers: [q.correctAnswer as string],
              caseSensitive: false,
            }];
        return { ...baseQuestion, blanks };

      case "short_answer":
        return {
          ...baseQuestion,
          correctAnswer: q.correctAnswer,
          maxLength: 500,
          keywords: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as string],
          requiresManualGrading: true,
        };

      default:
        return baseQuestion;
    }
  });
}