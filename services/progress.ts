import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

const PROGRESS_KEY = "viralstan_course_progress";

export type CourseProgress = {
  completedLessonIds: string[];
  lastLessonId?: string;
};

type ProgressStore = {
  [courseId: string]: CourseProgress;
};

type BackendProgressRecord = {
  _id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastWatchedPosition: number;
  createdAt?: string;
  updatedAt?: string;
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
  const cached = store[courseId];

  try {
    const records =
      await apiRequest<BackendProgressRecord[]>(
        `/progress/me/course/${courseId}`,
      );

    const completedLessonIds = [
      ...new Set(
        records
          .filter((record) => record.completed)
          .map((record) => record.lessonId),
      ),
    ];

    const syncedProgress: CourseProgress = {
      completedLessonIds,
      ...(cached?.lastLessonId
        ? { lastLessonId: cached.lastLessonId }
        : {}),
    };

    store[courseId] = syncedProgress;
    await saveProgressStore(store);

    return syncedProgress;
  } catch (error) {
    console.log(
      "Error syncing backend progress:",
      error,
    );
  }

  return (
    cached || {
      completedLessonIds: [],
    }
  );
}

export async function markLessonComplete(
  courseId: string,
  lessonId: string
) {
  await apiRequest<BackendProgressRecord>(
    `/progress/${courseId}/${lessonId}/complete`,
    { method: "POST" },
  );

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
