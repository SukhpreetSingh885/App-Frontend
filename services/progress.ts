import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "viralstan_course_progress";

export type CourseProgress = {
  completedLessonIds: string[];
  lastLessonId?: string;
};

type ProgressStore = {
  [courseId: string]: CourseProgress;
};

async function getProgressStore(): Promise<ProgressStore> {
  try {
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);

    if (!stored) {
      return {};
    }

    return JSON.parse(stored);
  } catch (error) {
    console.log("Error loading progress:", error);
    return {};
  }
}

async function saveProgressStore(store: ProgressStore) {
  await AsyncStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify(store)
  );
}

export async function getCourseProgress(
  courseId: string
): Promise<CourseProgress> {
  const store = await getProgressStore();

  return (
    store[courseId] || {
      completedLessonIds: [],
    }
  );
}

export async function markLessonComplete(
  courseId: string,
  lessonId: string
) {
  const store = await getProgressStore();

  const current =
    store[courseId] || {
      completedLessonIds: [],
    };

  if (
    !current.completedLessonIds.includes(lessonId)
  ) {
    current.completedLessonIds.push(lessonId);
  }

  current.lastLessonId = lessonId;

  store[courseId] = current;

  await saveProgressStore(store);
}

export async function setLastLesson(
  courseId: string,
  lessonId: string
) {
  const store = await getProgressStore();

  const current =
    store[courseId] || {
      completedLessonIds: [],
    };

  current.lastLessonId = lessonId;

  store[courseId] = current;

  await saveProgressStore(store);
}