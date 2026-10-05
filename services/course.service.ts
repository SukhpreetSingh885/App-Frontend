import { apiRequest } from "./api";
import type { Course } from "@/types/course";

type ApiCourse = Partial<Course> & {
  _id: string;
};

type CoursesResponse = {
  data: ApiCourse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export async function getCourses(): Promise<Course[]> {
  const response = await apiRequest<CoursesResponse>("/courses");

  return response.data.map((course) => ({
    ...course,
    id: course._id,
  })) as Course[];
}

export async function getCourseById(
  id: string,
): Promise<Course> {
  const course = await apiRequest<ApiCourse>(
    `/courses/${id}`,
  );

  return {
    ...course,
    id: course._id,
  } as Course;
}