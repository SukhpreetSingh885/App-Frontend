import { Course } from "@/types/course";

export const categories = [
  "All",
  "Development",
  "Design",
  "Marketing",
  "Business",
  "AI",
];

export const courses: Course[] = [
  {
       id: "6aaba798647d09c86289ca06",
    title: "Full Stack Web Development",
    instructor: "Viralstan Academy",
    category: "Development",
    description:
      "Learn modern web development step by step and build real projects from frontend to backend.",

    price: 1499,
    originalPrice: 3999,

    rating: 4.8,
    students: 1280,

    lessons: 42,
    duration: "10 Hours",

    level: "Beginner",
    language: "English / Hindi",

    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",

    featured: true,
    popular: true,

    modules: [
      {
        id: "full-stack-module-1",
        title: "Introduction",
        lessons: [
          {
            id: "full-stack-lesson-1",
            title: "Course Introduction",
            duration: "05:20",
            isPreview: true,
          },
          {
            id: "full-stack-lesson-2",
            title: "How the Web Works",
            duration: "09:15",
          },
          {
            id: "full-stack-lesson-3",
            title: "Development Environment Setup",
            duration: "11:40",
          },
        ],
      },

      {
        id: "full-stack-module-2",
        title: "HTML & CSS",
        lessons: [
          {
            id: "full-stack-lesson-4",
            title: "HTML Fundamentals",
            duration: "14:10",
          },
          {
            id: "full-stack-lesson-5",
            title: "CSS Fundamentals",
            duration: "16:45",
          },
          {
            id: "full-stack-lesson-6",
            title: "Responsive Web Design",
            duration: "18:20",
          },
        ],
      },

      {
        id: "full-stack-module-3",
        title: "JavaScript",
        lessons: [
          {
            id: "full-stack-lesson-7",
            title: "JavaScript Introduction",
            duration: "12:30",
          },
          {
            id: "full-stack-lesson-8",
            title: "Variables and Data Types",
            duration: "15:25",
          },
          {
            id: "full-stack-lesson-9",
            title: "Functions and Events",
            duration: "19:10",
          },
        ],
      },
    ],
  },

  {
    id: "ui-ux",
    title: "UI/UX Design Fundamentals",
    instructor: "Viralstan Academy",
    category: "Design",
    description:
      "Understand layout, typography, color, wireframes and modern product design fundamentals.",

    price: 999,
    originalPrice: 2499,

    rating: 4.7,
    students: 860,

    lessons: 28,
    duration: "7 Hours",

    level: "Beginner",
    language: "English / Hindi",

    thumbnail:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200",

    featured: true,

    modules: [
      {
        id: "ui-ux-module-1",
        title: "Introduction to UI/UX",
        lessons: [
          {
            id: "ui-ux-lesson-1",
            title: "Course Introduction",
            duration: "04:45",
            isPreview: true,
          },
          {
            id: "ui-ux-lesson-2",
            title: "What is UI Design?",
            duration: "08:20",
          },
          {
            id: "ui-ux-lesson-3",
            title: "What is UX Design?",
            duration: "09:10",
          },
        ],
      },

      {
        id: "ui-ux-module-2",
        title: "Design Fundamentals",
        lessons: [
          {
            id: "ui-ux-lesson-4",
            title: "Color in UI Design",
            duration: "12:40",
          },
          {
            id: "ui-ux-lesson-5",
            title: "Typography",
            duration: "11:25",
          },
          {
            id: "ui-ux-lesson-6",
            title: "Spacing and Layout",
            duration: "14:30",
          },
        ],
      },

      {
        id: "ui-ux-module-3",
        title: "Wireframes & Prototypes",
        lessons: [
          {
            id: "ui-ux-lesson-7",
            title: "Understanding Wireframes",
            duration: "10:20",
          },
          {
            id: "ui-ux-lesson-8",
            title: "Creating User Flows",
            duration: "13:40",
          },
          {
            id: "ui-ux-lesson-9",
            title: "Prototype Basics",
            duration: "15:15",
          },
        ],
      },
    ],
  },

  {
    id: "digital-marketing",
    title: "Digital Marketing Mastery",
    instructor: "Viralstan Academy",
    category: "Marketing",
    description:
      "Build practical skills in social media, content, performance marketing and campaign strategy.",

    price: 1299,
    originalPrice: 2999,

    rating: 4.6,
    students: 640,

    lessons: 34,
    duration: "8 Hours",

    level: "Beginner",
    language: "English / Hindi",

    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",

    popular: true,

    modules: [
      {
        id: "marketing-module-1",
        title: "Digital Marketing Basics",
        lessons: [
          {
            id: "marketing-lesson-1",
            title: "Course Introduction",
            duration: "05:10",
            isPreview: true,
          },
          {
            id: "marketing-lesson-2",
            title: "What is Digital Marketing?",
            duration: "09:20",
          },
          {
            id: "marketing-lesson-3",
            title: "Understanding Your Audience",
            duration: "12:15",
          },
        ],
      },

      {
        id: "marketing-module-2",
        title: "Social Media Marketing",
        lessons: [
          {
            id: "marketing-lesson-4",
            title: "Social Media Strategy",
            duration: "14:30",
          },
          {
            id: "marketing-lesson-5",
            title: "Creating Better Content",
            duration: "16:10",
          },
          {
            id: "marketing-lesson-6",
            title: "Growing Your Audience",
            duration: "13:25",
          },
        ],
      },

      {
        id: "marketing-module-3",
        title: "Campaigns & Performance",
        lessons: [
          {
            id: "marketing-lesson-7",
            title: "Campaign Planning",
            duration: "15:40",
          },
          {
            id: "marketing-lesson-8",
            title: "Understanding Analytics",
            duration: "17:20",
          },
          {
            id: "marketing-lesson-9",
            title: "Improving Campaign Performance",
            duration: "18:35",
          },
        ],
      },
    ],
  },
];

export const getCourseById = (id: string) =>
  courses.find((course) => course.id === id);