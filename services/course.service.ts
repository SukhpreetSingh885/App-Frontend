import { apiRequest } from "./api";
import type { Course } from "@/types/course";


type ApiCourse = Partial<Course> & {
  _id: string;
};


export async function getCourses(): Promise<Course[]> {

  const response =
    await apiRequest<ApiCourse[]>(
      "/courses",
    );


  return response.map((course) => ({
    ...course,
    id: course._id,
  })) as Course[];

}



export async function getCourseById(
  id: string,
): Promise<Course> {

  const course =
    await apiRequest<ApiCourse>(
      `/courses/${id}`,
    );


  return {
    ...course,
    id: course._id,
  } as Course;

}