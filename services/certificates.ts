import {
  Directory,
  File,
  Paths,
} from "expo-file-system";
import { Platform } from "react-native";

import * as Sharing from "expo-sharing";

import { apiRequest } from "./api";
import { getToken } from "./auth.storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type CertificateRecord = {
  _id: string;
  studentId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export function getMyCertificates() {
  return apiRequest<CertificateRecord[]>(
    "/certificates",
  );
}

export function getCertificateForCourse(
  courseId: string,
) {
  return apiRequest<CertificateRecord>(
    `/certificates/course/${courseId}`,
  );
}

export async function downloadCertificatePdf(
  certificate: CertificateRecord,
) {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const token = await getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const fileName =
    `viralstan-certificate-${certificate.certificateNumber}.pdf`;

  const destination = new File(
    Paths.cache,
    fileName,
  );

  const url =
    `${API_URL.replace(/\/$/, "")}` +
    `/certificates/${certificate._id}/pdf`;

  if (destination.exists) {
    destination.delete();
  }

  const file = await File.downloadFileAsync(
    url,
    destination,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return {
    uri: file.uri,
    fileName,
  };
}

export async function saveCertificatePdf(
  certificate: CertificateRecord,
) {
  const downloaded =
    await downloadCertificatePdf(certificate);

  if (Platform.OS !== "android") {
    const available =
      await Sharing.isAvailableAsync();

    if (!available) {
      throw new Error(
        "Saving is not available on this device",
      );
    }

    await Sharing.shareAsync(downloaded.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Save Certificate",
      UTI: "com.adobe.pdf",
    });

    return {
      saved: true,
      cancelled: false,
      uri: downloaded.uri,
    };
  }

  let directory: Directory;

  try {
    directory =
      await Directory.pickDirectoryAsync();
  } catch (error) {
    if (
      error instanceof Error &&
      /cancel/i.test(error.message)
    ) {
      return {
        saved: false,
        cancelled: true,
      };
    }

    throw error;
  }

  const cachedFile = new File(downloaded.uri);

  await cachedFile.copy(directory, {
    overwrite: true,
  });

  return {
    saved: true,
    cancelled: false,
    uri: directory.uri,
  };
}

export async function shareCertificatePdf(
  certificate: CertificateRecord,
) {
  const file =
    await downloadCertificatePdf(certificate);

  const available =
    await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error(
      "Sharing is not available on this device",
    );
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Share Certificate",
    UTI: "com.adobe.pdf",
  });

  return file;
}
