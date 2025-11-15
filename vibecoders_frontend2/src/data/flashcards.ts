import { FlashcardSet } from "@/types/flashcard";

export const sampleFlashcardSets: FlashcardSet[] = [
  {
    id: 1,
    title: "Flashcards Học Tập",
    description: "Học và ghi nhớ kiến thức hiệu quả với flashcards tương tác",
    progress: 17,
    cards: [
      {
        id: 1,
        question: "What is React?",
        answer:
          "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage application state efficiently.",
        category: "Programming",
        isBookmarked: false,
      },
      {
        id: 2,
        question: "What is TypeScript?",
        answer:
          "TypeScript is a strongly typed programming language that builds on JavaScript. It adds optional static typing and helps catch errors during development.",
        category: "Programming",
        isBookmarked: false,
      },
      {
        id: 3,
        question: "What is a Component in React?",
        answer:
          "A component is a reusable piece of UI that can have its own state and logic. Components can be functional or class-based and can be composed together.",
        category: "Programming",
        isBookmarked: false,
      },
      {
        id: 4,
        question: "What is useState Hook?",
        answer:
          "useState is a React Hook that lets you add state to functional components. It returns a state value and a function to update it.",
        category: "Programming",
        isBookmarked: false,
      },
      {
        id: 5,
        question: "What is useEffect Hook?",
        answer:
          "useEffect is a React Hook that lets you perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.",
        category: "Programming",
        isBookmarked: false,
      },
      {
        id: 6,
        question: "What is Tailwind CSS?",
        answer:
          "Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing custom CSS.",
        category: "Programming",
        isBookmarked: false,
      },
    ],
  },
];
