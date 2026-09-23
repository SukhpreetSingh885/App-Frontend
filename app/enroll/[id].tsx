import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { getCourseById } from "@/services/course.service";
import { createPayment } from "@/services/payment";
import { enrollInFreeCourse } from "@/services/enrollment";
import type { Course } from "@/types/course";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";


export default function EnrollScreen() {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (!id) return;

        const data = await getCourseById(id);

        setCourse(data);

      } catch (error) {
        console.log(
          "Enroll course error:",
          error,
        );

        setCourse(null);
      }
    };

    loadCourse();

  }, [id]);


  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>
            Course not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  const discount =
    course.originalPrice - course.price;


  const handleConfirmEnrollment = async () => {
    try {
      setLoading(true);

      if (course.price <= 0) {
        await enrollInFreeCourse(course.id);
        router.replace("/learning");
        return;
      }

      const payment = await createPayment(course.id);

      router.push({
        pathname: "/payment/[id]",
        params: {
          id: payment.paymentId.toString(),
          paymentIntentId: payment.paymentIntentId,
          clientSecret: payment.clientSecret,
        },
      });


    } catch (error) {

      console.log(
        "Payment creation error:",
        error,
      );

    } finally {

      setLoading(false);

    }
  };


  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>

        <Pressable
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>


        <Text style={styles.headerTitle}>
          Enrollment
        </Text>


        <View style={{ width: 42 }} />

      </View>


      <View style={styles.content}>

        <Text style={styles.pageTitle}>
          Review your course
        </Text>


        <Text style={styles.subtitle}>
          Confirm your enrollment below.
        </Text>


        <View style={styles.courseCard}>

          {course.thumbnail ? (
            <Image
              source={{
                uri: course.thumbnail,
              }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                No Image
              </Text>
            </View>
          )}


          <View style={styles.courseContent}>

            <Text style={styles.courseTitle}>
              {course.title}
            </Text>


            <Text style={styles.instructor}>
              {course.instructor}
            </Text>


            <View style={styles.courseMeta}>

              <Text style={styles.meta}>
                {course.lessons} lessons
              </Text>


              <Text style={styles.meta}>
                •
              </Text>


              <Text style={styles.meta}>
                {course.duration}
              </Text>

            </View>

          </View>

        </View>
                <Text style={styles.sectionTitle}>
          Price details
        </Text>


        <View style={styles.priceCard}>

          <PriceRow
            label="Course price"
            value={`₹${course.originalPrice}`}
          />


          <PriceRow
            label="Discount"
            value={`-₹${discount}`}
            discount
          />


          <View style={styles.divider} />


          <PriceRow
            label="Total"
            value={`₹${course.price}`}
            total
          />

        </View>


      </View>


      <View style={styles.bottom}>

        <View>

          <Text style={styles.totalLabel}>
            Total
          </Text>


          <Text style={styles.totalPrice}>
            ₹{course.price}
          </Text>

        </View>


        <Pressable
          disabled={loading}
          onPress={handleConfirmEnrollment}
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <>

              <Text style={styles.confirmText}>
                Continue Payment
              </Text>


              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />

            </>

          )}

        </Pressable>


      </View>

    </SafeAreaView>
  );
}


function PriceRow({
  label,
  value,
  discount = false,
  total = false,
}: {
  label: string;
  value: string;
  discount?: boolean;
  total?: boolean;
}) {

  return (

    <View style={styles.priceRow}>

      <Text
        style={[
          styles.priceLabel,
          total && styles.totalRowText,
        ]}
      >
        {label}
      </Text>


      <Text
        style={[
          styles.priceValue,
          discount && styles.discountText,
          total && styles.totalRowText,
        ]}
      >
        {value}
      </Text>


    </View>

  );
}


const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },


  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },


  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },


  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },


  content: {
    flex: 1,
    padding: SPACING.md,
  },


  pageTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },


  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
  },


  courseCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    marginTop: 24,
  },


  image: {
    width: 100,
    height: 80,
    borderRadius: 10,
  },


  imagePlaceholder: {
    width: 100,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },


  placeholderText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },


  courseContent: {
    flex: 1,
    marginLeft: 12,
  },


  courseTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
  },


  instructor: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },


  courseMeta: {
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
  },


  meta: {
    color: COLORS.muted,
    fontSize: 12,
  },


  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 28,
    marginBottom: 12,
  },


  priceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },


  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
  },


  priceLabel: {
    color: COLORS.muted,
  },


  priceValue: {
    color: COLORS.text,
    fontWeight: "700",
  },


  discountText: {
    color: COLORS.success,
  },


  totalRowText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 17,
  },


  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },


  bottom: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },


  totalLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },


  totalPrice: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },


  confirmButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: RADIUS.md,
  },


  confirmText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },


  buttonPressed: {
    opacity: 0.8,
  },


  buttonDisabled: {
    opacity: 0.6,
  },


  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },


  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },

});