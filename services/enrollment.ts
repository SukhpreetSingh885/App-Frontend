import { apiRequest } from "./api";
import type { Course } from "@/types/course";

type ApiCourse = Partial<Course> & {
  _id: string;
};

export async function getEnrolledCourse(
  courseId: string,
): Promise<Course> {
  const course = await apiRequest<ApiCourse>(
    `/enrollments/courses/${courseId}/learn`,
  );

  return {
    ...course,
    id: course._id,
  } as Course;
}

export async function getEnrollments(): Promise<string[]> {
  const response = await apiRequest<any[]>("/enrollments/me");

  return response.map(
    (item) => item.enrollment.courseId,
  );
}

export async function isCourseEnrolled(
  courseId: string,
): Promise<boolean> {
  const ids = await getEnrollments();
  return ids.includes(courseId);
}

export async function enrollInFreeCourse(courseId: string): Promise<void> {
  await apiRequest("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
}
