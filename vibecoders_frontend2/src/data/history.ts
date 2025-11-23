import {
  FlashcardHistory,
  SavedFlashcard,
  QuizHistory,
  Feedback,
} from "@/types/history";

export const flashcardHistory: FlashcardHistory[] = [
  {
    id: 1,
    setTitle: "Flashcards Học Tập - React & TypeScript",
    cardsStudied: 6,
    totalCards: 6,
    completedAt: "2025-11-15T10:30:00",
    score: 100,
  },
  {
    id: 2,
    setTitle: "Web Development Fundamentals",
    cardsStudied: 15,
    totalCards: 20,
    completedAt: "2025-11-14T15:45:00",
    score: 75,
  },
  {
    id: 3,
    setTitle: "JavaScript ES6+ Features",
    cardsStudied: 12,
    totalCards: 12,
    completedAt: "2025-11-13T09:20:00",
    score: 92,
  },
  {
    id: 4,
    setTitle: "CSS Grid & Flexbox",
    cardsStudied: 8,
    totalCards: 10,
    completedAt: "2025-11-12T14:15:00",
    score: 80,
  },
];

export const savedFlashcards: SavedFlashcard[] = [
  {
    id: 1,
    question: "What is React?",
    answer:
      "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage application state efficiently.",
    category: "Programming",
    savedAt: "2025-11-15T10:35:00",
    setTitle: "Flashcards Học Tập",
  },
  {
    id: 2,
    question: "What is useEffect Hook?",
    answer:
      "useEffect is a React Hook that lets you perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.",
    category: "Programming",
    savedAt: "2025-11-15T10:36:00",
    setTitle: "Flashcards Học Tập",
  },
  {
    id: 3,
    question: "What is CSS Grid?",
    answer:
      "CSS Grid is a two-dimensional layout system that allows you to create complex layouts with rows and columns easily.",
    category: "CSS",
    savedAt: "2025-11-12T14:20:00",
    setTitle: "CSS Grid & Flexbox",
  },
];

export const quizHistory: QuizHistory[] = [
  {
    id: 1,
    title: "React Fundamentals Quiz",
    score: 18,
    totalQuestions: 20,
    completedAt: "2025-11-15T11:00:00",
    timeSpent: 15,
    passed: true,
  },
  {
    id: 2,
    title: "TypeScript Basics",
    score: 8,
    totalQuestions: 10,
    completedAt: "2025-11-14T16:30:00",
    timeSpent: 12,
    passed: true,
  },
  {
    id: 3,
    title: "JavaScript Advanced Concepts",
    score: 14,
    totalQuestions: 20,
    completedAt: "2025-11-13T10:00:00",
    timeSpent: 20,
    passed: true,
  },
  {
    id: 4,
    title: "CSS Layout Challenge",
    score: 6,
    totalQuestions: 10,
    completedAt: "2025-11-12T15:00:00",
    timeSpent: 10,
    passed: false,
  },
];

export const feedbackHistory: Feedback[] = [
  {
    id: 1,
    assignmentTitle: "Build a React Todo App",
    submittedAt: "2025-11-14T18:00:00",
    gradedAt: "2025-11-15T09:00:00",
    score: 95,
    maxScore: 100,
    feedback:
      "Excellent work! Your code is clean, well-structured, and follows best practices. The UI is intuitive and responsive. Minor suggestion: consider adding error handling for edge cases.",
    status: "excellent",
  },
  {
    id: 2,
    assignmentTitle: "TypeScript Interface Design",
    submittedAt: "2025-11-13T20:00:00",
    gradedAt: "2025-11-14T10:00:00",
    score: 82,
    maxScore: 100,
    feedback:
      "Good understanding of TypeScript interfaces. Your type definitions are clear and reusable. Could improve by adding more generic types for better flexibility.",
    status: "good",
  },
  {
    id: 3,
    assignmentTitle: "CSS Flexbox Layout Exercise",
    submittedAt: "2025-11-12T16:00:00",
    gradedAt: "2025-11-12T20:00:00",
    score: 70,
    maxScore: 100,
    feedback:
      "The layout works but could be more responsive. Review the use of flex-wrap and consider mobile-first approach. Good start overall.",
    status: "average",
  },
  {
    id: 4,
    assignmentTitle: "JavaScript Async/Await Practice",
    submittedAt: "2025-11-11T14:00:00",
    gradedAt: "2025-11-11T18:00:00",
    score: 55,
    maxScore: 100,
    feedback:
      "You need to work on error handling with async/await. The logic is there but missing try-catch blocks. Please review the async patterns and resubmit.",
    status: "needs-improvement",
  },
];
