import { File, Directory, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  markDownloading,
  markDownloaded,
  markFailed,
  getMediaRecord,
} from "./offlineMedia";
import type { MediaType } from "./offlineMedia";

let isDownloadInProgress = false;

async function getCurrentStudentId(): Promise<string> {
  const savedUser = await AsyncStorage.getItem("user");
  if (!savedUser) throw new Error("No logged-in user found");
  return JSON.parse(savedUser).id;
}

function getExtension(mediaType: MediaType, remoteUrl: string): string {
  if (mediaType === "pdf") return "pdf";
  const match = remoteUrl.match(/\.(\w+)(\?|$)/);
  return match ? match[1] : "mp4";
}

export async function downloadMedia(
  lessonId: string,
  mediaType: MediaType,
  remoteUrl: string,
  sourceUpdatedAt: string | null
): Promise<void> {
  if (isDownloadInProgress) {
    throw new Error("Another download is already in progress. Please wait for it to finish.");
  }

  const existing = await getMediaRecord(lessonId, mediaType);
  if (existing?.status === "downloading") {
    throw new Error("This item is already downloading.");
  }

  isDownloadInProgress = true;

  try {
    const studentId = await getCurrentStudentId();

    await markDownloading(lessonId, mediaType, remoteUrl, sourceUpdatedAt);

    const studentDir = new Directory(Paths.document, "nabhalearn-media", studentId);
    if (!studentDir.exists) {
      studentDir.create({ intermediates: true });
    }

    const extension = getExtension(mediaType, remoteUrl);
    const fileName = `${lessonId}-${mediaType}.${extension}`;

    const downloadedFile = await File.downloadFileAsync(remoteUrl, studentDir, {
      idempotent: true,
    });

    if (!downloadedFile.exists || downloadedFile.size === 0) {
      throw new Error("Downloaded file is invalid or empty.");
    }

    await markDownloaded(lessonId, mediaType, downloadedFile.uri, downloadedFile.size);
  } catch (err) {
    await markFailed(lessonId, mediaType);
    throw err;
  } finally {
    isDownloadInProgress = false;
  }
}

export function isAnyDownloadInProgress(): boolean {
  return isDownloadInProgress;
}