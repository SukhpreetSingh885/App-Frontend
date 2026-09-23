import AsyncStorage from "@react-native-async-storage/async-storage";

const VIDEO_PROGRESS_PREFIX = "viralstan_video_progress";

function getVideoProgressKey(courseId: string, lessonId: string) {
  return `${VIDEO_PROGRESS_PREFIX}:${encodeURIComponent(courseId)}:${encodeURIComponent(lessonId)}`;
}

export async function saveVideoPosition(
  courseId: string,
  lessonId: string,
  position: number
) {
  if (!Number.isFinite(position) || position < 0) {
    return;
  }

  await AsyncStorage.setItem(
    getVideoProgressKey(courseId, lessonId),
    String(position)
  );
}

export async function getVideoPosition(
  courseId: string,
  lessonId: string
): Promise<number> {
  try {
    const storedPosition = await AsyncStorage.getItem(
      getVideoProgressKey(courseId, lessonId)
    );
    const position = Number(storedPosition);

    return Number.isFinite(position) && position > 0 ? position : 0;
  } catch (error) {
    console.log("Error loading video position:", error);
    return 0;
  }
}

export async function clearVideoPosition(
  courseId: string,
  lessonId: string
) {
  await AsyncStorage.removeItem(
    getVideoProgressKey(courseId, lessonId)
  );
}
