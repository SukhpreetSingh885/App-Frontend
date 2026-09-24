import {
  File,
  Paths,
} from "expo-file-system";

import {
  StorageAccessFramework,
} from "expo-file-system/legacy";

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

  const permission =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permission.granted) {
    return {
      saved: false,
      cancelled: true,
    };
  }

  const fileUri =
    await StorageAccessFramework.createFileAsync(
      permission.directoryUri,
      downloaded.fileName,
      "application/pdf",
    );

  const cachedFile = new File(downloaded.uri);

  const base64 = await cachedFile.base64();

  await StorageAccessFramework.writeAsStringAsync(
    fileUri,
    base64,
    {
     encoding: "base64",
    },
  );

  return {
    saved: true,
    cancelled: false,
    uri: fileUri,
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