import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationRecord,
} from "@/services/notification.service";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [markingAll, setMarkingAll] =
    useState(false);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const [error, setError] =
    useState("");

  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      }

      try {
        setError("");

        const result =
          await getNotifications();

        setNotifications(
          [...result].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
        );
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load notifications",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read,
      ).length,
    [notifications],
  );

  const handleNotificationPress = async (
    notification: NotificationRecord,
  ) => {
    if (updatingId) {
      return;
    }

    try {
      setError("");

      if (!notification.read) {
        setUpdatingId(notification._id);
        await markNotificationAsRead(
          notification._id,
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item,
          ),
        );
      }

      const courseId =
        notification.data?.courseId;

      if (
        typeof courseId === "string" &&
        courseId
      ) {
        router.push({
          pathname: "/course/[id]",
          params: { id: courseId },
        });
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update notification",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount || markingAll) {
      return;
    }

    try {
      setError("");
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to mark notifications as read",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Notifications
          </Text>
          <Text style={styles.subtitle}>
            {unreadCount
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          disabled={!unreadCount || markingAll}
          onPress={() =>
            void handleMarkAllAsRead()
          }
          style={styles.markAllButton}
        >
          <Text
            style={[
              styles.markAllText,
              (!unreadCount || markingAll) &&
                styles.markAllTextDisabled,
            ]}
          >
            {markingAll
              ? "Marking..."
              : "Mark all as read"}
          </Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>
          <Pressable
            onPress={() =>
              void loadNotifications()
            }
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
          <Text style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.list,
            !notifications.length &&
              styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                void loadNotifications(true)
              }
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.message}`}
              disabled={updatingId === item._id}
              onPress={() =>
                void handleNotificationPress(item)
              }
              style={({ pressed }) => [
                styles.notificationCard,
                !item.read &&
                  styles.unreadCard,
                pressed && styles.pressedCard,
              ]}
            >
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={
                    item.data?.courseId
                      ? "school-outline"
                      : "notifications-outline"
                  }
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.notificationBody}>
                <View style={styles.notificationTitleRow}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !item.read &&
                        styles.unreadTitle,
                    ]}
                  >
                    {item.title}
                  </Text>

                  {!item.read ? (
                    <View style={styles.unreadDot} />
                  ) : null}
                </View>

                <Text style={styles.message}>
                  {item.message}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.date}>
                    {formatDateTime(
                      item.createdAt,
                    )}
                  </Text>

                  {item.data?.courseId ? (
                    <View style={styles.courseLink}>
                      <Text style={styles.courseLinkText}>
                        View course
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={COLORS.primary}
                      />
                    </View>
                  ) : null}
                </View>
              </View>

              {updatingId === item._id ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : null}
            </Pressable>
          )}
          ListEmptyComponent={
            error ? null : (
              <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={34}
                  color={COLORS.muted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                No notifications yet
              </Text>
              <Text style={styles.emptyText}>
                Course, enrollment, and reward updates
                will appear here.
              </Text>
              </View>
            )
          }
        />
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  markAllButton: {
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  markAllTextDisabled: {
    color: COLORS.muted,
  },
  errorBox: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
  },
  retryText: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontWeight: "800",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    borderColor: "#BFDBFE",
    backgroundColor: COLORS.softBlue,
  },
  pressedCard: {
    opacity: 0.72,
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  unreadTitle: {
    fontWeight: "900",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  message: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  date: {
    color: COLORS.muted,
    fontSize: 12,
  },
  courseLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseLinkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
});
