import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import Pdf from "react-native-pdf";

import { getCourseById } from "@/data/courses";
import {
  CertificateRecord,
  downloadCertificatePdf,
  getCertificateForCourse,
  shareCertificatePdf,
} from "@/services/certificates";
import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";

export default function CertificateScreen() {
  const { courseId } =
    useLocalSearchParams<{ courseId: string }>();

  const course = getCourseById(courseId);

  const [certificate, setCertificate] =
    useState<CertificateRecord | null>(null);

  const [pdfUri, setPdfUri] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [action, setAction] = useState<
    "download" | "share" | null
  >(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadCertificate = async () => {
        setLoading(true);
        setCertificate(null);
        setPdfUri(null);

        if (!courseId || !course) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        try {
          const result =
            await getCertificateForCourse(courseId);

          if (!active) return;

          setCertificate(result);
          setPdfLoading(true);

          try {
            const file =
              await downloadCertificatePdf(result);

            if (active) {
              setPdfUri(file.uri);
            }
          } catch (error) {
            if (active) {
              Alert.alert(
                "Preview unavailable",
                error instanceof Error
                  ? error.message
                  : "Unable to load certificate preview.",
              );
            }
          } finally {
            if (active) {
              setPdfLoading(false);
            }
          }
        } catch {
          if (active) {
            setCertificate(null);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void loadCertificate();

      return () => {
        active = false;
      };
    }, [courseId, course]),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleDownload = async () => {
    if (!certificate || action) return;

    try {
      setAction("download");

      await downloadCertificatePdf(certificate);

      Alert.alert(
        "Certificate ready",
        "Your certificate PDF has been downloaded.",
      );
    } catch (error) {
      Alert.alert(
        "Download failed",
        error instanceof Error
          ? error.message
          : "Unable to download certificate.",
      );
    } finally {
      setAction(null);
    }
  };

  const handleShare = async () => {
    if (!certificate || action) return;

    try {
      setAction("share");

      await shareCertificatePdf(certificate);
    } catch (error) {
      Alert.alert(
        "Share failed",
        error instanceof Error
          ? error.message
          : "Unable to share certificate.",
      );
    } finally {
      setAction(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Course Certificate
        </Text>
      </View>

      {!course ? (
        <View style={styles.message}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.muted}
          />

          <Text style={styles.messageTitle}>
            Course not found
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.message}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.messageText}>
            Loading certificate...
          </Text>
        </View>
      ) : !certificate ? (
        <View style={styles.message}>
          <Ionicons
            name="lock-closed-outline"
            size={48}
            color={COLORS.primary}
          />

          <Text style={styles.messageTitle}>
            Certificate Locked
          </Text>

          <Text style={styles.messageText}>
            Complete all lessons to unlock your certificate.
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.previewCard}>
            {pdfLoading ? (
              <View style={styles.previewLoading}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                />

                <Text style={styles.messageText}>
                  Loading your certificate...
                </Text>
              </View>
            ) : pdfUri ? (
              <Pdf
                source={{ uri: pdfUri }}
                style={styles.pdf}
                trustAllCerts={false}
                enablePaging
                horizontal
                fitPolicy={0}
                onError={(error) => {
                  console.error(
                    "Certificate PDF error:",
                    error,
                  );

                  Alert.alert(
                    "Preview unavailable",
                    "Unable to display the certificate PDF.",
                  );
                }}
              />
            ) : (
              <View style={styles.previewLoading}>
                <Ionicons
                  name="document-outline"
                  size={44}
                  color={COLORS.muted}
                />

                <Text style={styles.messageText}>
                  Certificate preview unavailable.
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.certificateNumber}>
            Certificate No.{" "}
            {certificate.certificateNumber}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.primaryAction,
                action ? styles.disabledAction : null,
              ]}
              onPress={handleDownload}
              disabled={action !== null}
            >
              {action === "download" ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="download-outline"
                  size={19}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.primaryActionText}>
                Download
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryAction,
                action ? styles.disabledAction : null,
              ]}
              onPress={handleShare}
              disabled={action !== null}
            >
              {action === "share" ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <Ionicons
                  name="share-social-outline"
                  size={19}
                  color={COLORS.primary}
                />
              )}

              <Text style={styles.secondaryActionText}>
                Share
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: SPACING.md,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },

  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },

  messageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 18,
  },

  messageText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
  },

  previewCard: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  previewLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },

  pdf: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.surface,
  },

  certificateNumber: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  primaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  secondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  secondaryActionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  disabledAction: {
    opacity: 0.6,
  },
});