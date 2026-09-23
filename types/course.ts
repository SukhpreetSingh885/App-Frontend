export type Lesson = {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  duration: string;
  videoSource?: "upload" | "url";
  videoUrl?: string;
  videoPublicId?: string;
  isPreview?: boolean;
};

export type CourseModule = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  _id?: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  thumbnail: string;
  featured?: boolean;
  popular?: boolean;
  modules?: CourseModule[];
};