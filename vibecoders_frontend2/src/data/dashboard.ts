import {
  RecentQuiz,
  PopularTheory,
  PopularQuestion,
  LearningStreak,
  UserProgress,
} from "@/types/dashboard";

export const recentQuizzes: RecentQuiz[] = [
  {
    id: 1,
    title: "React Fundamentals Quiz",
    score: 18,
    totalQuestions: 20,
    completedAt: "2025-11-15T11:00:00",
    subject: "React",
    passed: true,
  },
  {
    id: 2,
    title: "TypeScript Basics",
    score: 8,
    totalQuestions: 10,
    completedAt: "2025-11-14T16:30:00",
    subject: "TypeScript",
    passed: true,
  },
  {
    id: 3,
    title: "JavaScript Advanced Concepts",
    score: 14,
    totalQuestions: 20,
    completedAt: "2025-11-13T10:00:00",
    subject: "JavaScript",
    passed: true,
  },
  {
    id: 4,
    title: "CSS Layout Challenge",
    score: 6,
    totalQuestions: 10,
    completedAt: "2025-11-12T15:00:00",
    subject: "CSS",
    passed: false,
  },
];

export const popularTheories: PopularTheory[] = [
  {
    id: 1,
    title: "React Hooks: useState và useEffect",
    description:
      "Tìm hiểu cách sử dụng hai hooks quan trọng nhất trong React để quản lý state và side effects",
    category: "React",
    views: 1250,
    difficulty: "beginner",
    estimatedTime: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
  },
  {
    id: 2,
    title: "TypeScript Generics Deep Dive",
    description:
      "Khám phá sức mạnh của Generics trong TypeScript để viết code linh hoạt và type-safe hơn",
    category: "TypeScript",
    views: 980,
    difficulty: "intermediate",
    estimatedTime: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
  },
  {
    id: 3,
    title: "CSS Grid vs Flexbox",
    description:
      "So sánh chi tiết hai layout system mạnh mẽ nhất của CSS và khi nào nên dùng cái nào",
    category: "CSS",
    views: 1450,
    difficulty: "beginner",
    estimatedTime: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400",
  },
  {
    id: 4,
    title: "JavaScript Async/Await Patterns",
    description:
      "Nắm vững các pattern xử lý bất đồng bộ trong JavaScript với async/await",
    category: "JavaScript",
    views: 1100,
    difficulty: "intermediate",
    estimatedTime: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400",
  },
  {
    id: 5,
    title: "State Management với Redux Toolkit",
    description:
      "Học cách quản lý state toàn cục trong ứng dụng React một cách hiệu quả với Redux Toolkit",
    category: "React",
    views: 875,
    difficulty: "advanced",
    estimatedTime: 40,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
  },
  {
    id: 6,
    title: "Responsive Web Design Principles",
    description:
      "Nguyên tắc thiết kế responsive từ mobile-first đến adaptive layouts",
    category: "CSS",
    views: 1320,
    difficulty: "beginner",
    estimatedTime: 18,
    imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400",
  },
];

export const popularQuestions: PopularQuestion[] = [
  {
    id: 1,
    question: "Sự khác biệt giữa var, let và const trong JavaScript là gì?",
    answer:
      "var có function scope, let và const có block scope. const không thể reassign, còn let có thể. var được hoisted và có thể redeclare, let/const không.",
    category: "JavaScript",
    askedCount: 245,
    helpfulCount: 189,
    lastAsked: "2025-11-15T09:30:00",
  },
  {
    id: 2,
    question: "Khi nào nên dùng useEffect trong React?",
    answer:
      "Dùng useEffect khi cần thực hiện side effects như: fetch data, subscribe events, thay đổi DOM, hoặc cleanup khi component unmount.",
    category: "React",
    askedCount: 198,
    helpfulCount: 156,
    lastAsked: "2025-11-15T08:15:00",
  },
  {
    id: 3,
    question: "TypeScript Interface vs Type - nên dùng cái nào?",
    answer:
      "Interface mở rộng được và dùng cho object shapes. Type linh hoạt hơn với union, intersection. Ưu tiên Interface cho object, Type cho union/intersection.",
    category: "TypeScript",
    askedCount: 167,
    helpfulCount: 142,
    lastAsked: "2025-11-14T14:20:00",
  },
  {
    id: 4,
    question: "Làm thế nào để center một div bằng CSS?",
    answer:
      "Nhiều cách: Flexbox (display: flex; justify-content: center; align-items: center), Grid (place-items: center), hoặc margin: auto với width cố định.",
    category: "CSS",
    askedCount: 312,
    helpfulCount: 201,
    lastAsked: "2025-11-14T11:45:00",
  },
  {
    id: 5,
    question: "Props drilling là gì và cách giải quyết?",
    answer:
      "Props drilling là truyền props qua nhiều component layers. Giải pháp: Context API, Redux, hoặc component composition patterns.",
    category: "React",
    askedCount: 134,
    helpfulCount: 98,
    lastAsked: "2025-11-13T16:00:00",
  },
  {
    id: 6,
    question: "Promise vs Async/Await - khác biệt gì?",
    answer:
      "Async/await là syntax sugar của Promise, giúp code dễ đọc hơn. Promise dùng .then/.catch chain, async/await dùng try/catch như code đồng bộ.",
    category: "JavaScript",
    askedCount: 189,
    helpfulCount: 145,
    lastAsked: "2025-11-13T10:30:00",
  },
];

export const learningStreak: LearningStreak = {
  currentStreak: 7,
  longestStreak: 15,
  totalDays: 45,
};

export const userProgress: UserProgress = {
  completedCourses: 3,
  inProgressCourses: 2,
  totalQuizzes: 28,
  averageScore: 85,
};
