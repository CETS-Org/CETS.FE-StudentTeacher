import type { Question, AssignmentQuestionData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

export const mockReadingPassage = `
Climate Change: The Global Challenge of Our Time

Climate change represents one of the most pressing challenges facing humanity in the 21st century. The scientific consensus is clear: Earth's climate is warming at an unprecedented rate, primarily due to human activities that release greenhouse gases into the atmosphere. These gases, particularly carbon dioxide (CO2), methane, and nitrous oxide, trap heat and gradually increase global temperatures.

The primary driver of climate change is the burning of fossil fuels—coal, oil, and natural gas—for energy production. Industrial processes, deforestation, and agricultural practices also contribute significantly to greenhouse gas emissions. Since the Industrial Revolution, atmospheric CO2 concentrations have increased by nearly 50%, from approximately 280 parts per million (ppm) to over 420 ppm today.

The consequences of climate change are already evident worldwide. Rising global temperatures have led to melting ice caps and glaciers, resulting in sea-level rise that threatens coastal communities. Extreme weather events—including hurricanes, droughts, wildfires, and floods—have become more frequent and intense. These changes disrupt ecosystems, endanger biodiversity, and pose risks to human health and food security.

However, there is hope. Renewable energy sources such as solar, wind, and hydroelectric power offer sustainable alternatives to fossil fuels. Advances in energy storage technology and grid management are making these alternatives increasingly viable. Additionally, reforestation efforts, sustainable agricultural practices, and carbon capture technologies can help remove existing CO2 from the atmosphere.

International cooperation is essential for addressing this global challenge. The Paris Agreement, signed by nearly 200 countries, represents a significant step toward coordinated action. Nations have committed to limiting global warming to well below 2°C above pre-industrial levels, with efforts to keep it to 1.5°C.

Individual actions also matter. Reducing energy consumption, adopting sustainable transportation options, supporting renewable energy initiatives, and making environmentally conscious consumer choices can collectively contribute to mitigation efforts.

The transition to a sustainable future requires innovation, investment, and political will. While the challenges are significant, the solutions exist. What is needed now is the collective determination to implement them at the scale required to secure a livable planet for future generations.
`;

export const mockAssignmentDetails = {
  id: "assignment-123",
  title: "English Language Skills Assessment",
  description: "This assignment tests your understanding of various English language skills including reading comprehension, vocabulary, and grammar.",
  dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  skillID: "skill-123",
  skillName: "Reading Comprehension",
  totalPoints: 100,
  timeLimitMinutes: 60,
  maxAttempts: 3,
  questionDataUrl: null, // We'll use the mock data directly
  isAutoGradable: true,
  showAnswersAfterSubmission: false,
  showAnswersAfterDueDate: true,
};

export const mockQuestions: Question[] = [
  // Multiple Choice Question
  {
    id: "q1-multiple-choice",
    type: "multiple_choice",
    order: 1,
    question: "What is the main theme of the passage about environmental conservation?",
    points: 10,
    options: [
      { id: "opt1", label: "A", text: "The importance of recycling" },
      { id: "opt2", label: "B", text: "The economic benefits of green energy" },
      { id: "opt3", label: "C", text: "The urgent need for global climate action" },
      { id: "opt4", label: "D", text: "The history of environmental movements" }
    ],
    correctAnswer: "opt3",
    explanation: "The passage emphasizes the immediate need for coordinated global action to address climate change.",
    shuffleOptions: true
  },
  
  // True/False Question
  {
    id: "q2-true-false",
    type: "true_false",
    order: 2,
    question: "The greenhouse effect is primarily caused by natural phenomena rather than human activities.",
    points: 5,
    correctAnswer: false,
    explanation: "While the greenhouse effect is a natural phenomenon, human activities have significantly intensified it."
  },
  
  // Fill in the Blank Question
  {
    id: "q3-fill-blank",
    type: "fill_in_the_blank",
    order: 3,
    question: "Complete the sentence: Renewable energy sources such as _____, _____, and _____ are essential for reducing carbon emissions.",
    points: 15,
    blanks: [
      {
        id: "blank1",
        position: 5,
        correctAnswers: ["solar", "solar power", "solar energy"],
        caseSensitive: false
      },
      {
        id: "blank2",
        position: 7,
        correctAnswers: ["wind", "wind power", "wind energy"],
        caseSensitive: false
      },
      {
        id: "blank3",
        position: 9,
        correctAnswers: ["hydroelectric", "hydropower", "water"],
        caseSensitive: false
      }
    ]
  },
  
  // Short Answer Question
  {
    id: "q4-short-answer",
    type: "short_answer",
    order: 4,
    question: "Explain in your own words why biodiversity is important for ecosystem stability.",
    points: 20,
    maxLength: 200,
    keywords: ["diversity", "stability", "resilience", "interdependence", "balance"],
    requiresManualGrading: true
  },
  
  // Essay Question
  {
    id: "q5-essay",
    type: "essay",
    order: 5,
    question: "Discuss the relationship between economic development and environmental sustainability. In your answer, consider: 1) The conflicts between short-term economic goals and long-term environmental health, 2) Examples of successful sustainable development initiatives, and 3) Policy recommendations for balancing economic growth with environmental protection.",
    points: 30,
    maxLength: 1000,
    keywords: ["sustainability", "development", "policy", "balance", "economy"],
    requiresManualGrading: true
  },
  
  // Matching Question
  {
    id: "q6-matching",
    type: "matching",
    order: 6,
    question: "Match each environmental term with its correct definition:",
    points: 20,
    matching: {
      leftColumn: [
        { id: "left1", text: "Carbon footprint" },
        { id: "left2", text: "Deforestation" },
        { id: "left3", text: "Eutrophication" },
        { id: "left4", text: "Biodegradable" }
      ],
      rightColumn: [
        { id: "right1", text: "Materials that can be broken down by natural processes" },
        { id: "right2", text: "The total amount of greenhouse gases produced by an individual or organization" },
        { id: "right3", text: "Excessive richness of nutrients in water bodies causing dense plant growth" },
        { id: "right4", text: "The clearing of forests for other land uses" }
      ],
      correctMatches: [
        { left: "left1", right: "right2" },
        { left: "left2", right: "right4" },
        { left: "left3", right: "right3" },
        { left: "left4", right: "right1" }
      ],
      shuffleRightColumn: true
    }
  }
];

export const mockAssignmentQuestionData: AssignmentQuestionData = {
  version: "1.0",
  questions: mockQuestions,
  settings: {
    timeLimitMinutes: mockAssignmentDetails.timeLimitMinutes,
  },
  media: {
    audioUrl: "https://example.com/audio.mp3",
    videoUrl: "https://example.com/video.mp4",
    images: [
      { url: "https://example.com/image1.jpg", questionId: "q1-multiple-choice" },
      { url: "https://example.com/image2.jpg", questionId: "q4-short-answer" }
    ]
  },
  readingPassage: mockReadingPassage
};

// Additional mock data for different skill types
export const mockListeningAssignment = {
  ...mockAssignmentDetails,
  id: "assignment-listening",
  title: "Listening Comprehension Test",
  skillName: "Listening",
  timeLimitMinutes: 45,
};

export const mockWritingAssignment = {
  ...mockAssignmentDetails,
  id: "assignment-writing",
  title: "Writing Skills Assessment",
  skillName: "Writing",
  timeLimitMinutes: 90,
};

export const mockSpeakingAssignment = {
  ...mockAssignmentDetails,
  id: "assignment-speaking",
  title: "Speaking Practice Exercise",
  skillName: "Speaking",
  timeLimitMinutes: 30,
};