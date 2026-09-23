import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  useStripe,
} from "@stripe/stripe-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { apiRequest } from "@/services/api";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";


export default function PaymentScreen() {

  const {
    id,
    clientSecret,
    paymentIntentId,
  } =
    useLocalSearchParams<{
      id: string;
      clientSecret: string;
      paymentIntentId: string;
    }>();


  const {
    initPaymentSheet,
    presentPaymentSheet,
  } = useStripe();


  const [loading, setLoading] =
    useState(false);


useEffect(() => {

  let mounted = true;

  const setupPayment = async () => {

    if (mounted) {
      await initializePayment();
    }

  };

  setupPayment();


  return () => {
    mounted = false;
  };

}, []);


  const initializePayment = async () => {

    if (!clientSecret) {
      return;
    }


    const { error } =
      await initPaymentSheet({

        paymentIntentClientSecret:
          clientSecret,

        merchantDisplayName:
          "Viralstan Academy",

      });


    if (error) {

      console.log(
        "Payment sheet error:",
        error.message,
      );

    }

  };



  const handlePayment = async () => {

    try {

      setLoading(true);


      const { error } =
        await presentPaymentSheet();



      if (error) {

        console.log(
          "Payment failed:",
          error.message,
        );

        return;

      }



      await apiRequest(
        "/payments/verify",
        {
          method: "POST",

          body: JSON.stringify({

            paymentIntentId,

          }),

        },
      );



      router.replace("/learning");


    } finally {

      setLoading(false);

    }

  };



  return (

    <SafeAreaView style={styles.safe}>

      <View style={styles.container}>


        <Text style={styles.title}>
          Complete Payment
        </Text>


        <Text style={styles.message}>
          Payment ID: {id}
        </Text>


        <Text style={styles.info}>
          Secure payment powered by Stripe.
        </Text>



        <Pressable

          disabled={loading}

          onPress={handlePayment}

          style={[
            styles.button,
            loading &&
            styles.disabled,
          ]}

        >

          {
            loading ? (

              <ActivityIndicator
                color="#FFFFFF"
              />

            ) : (

              <Text style={styles.buttonText}>
                Pay Now
              </Text>

            )
          }


        </Pressable>


      </View>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safe: {

    flex: 1,

    backgroundColor:
      COLORS.background,

  },


  container: {

    flex: 1,

    justifyContent:
      "center",

    padding:
      SPACING.lg,

  },


  title: {

    fontSize: 28,

    fontWeight: "900",

    color:
      COLORS.text,

    textAlign:
      "center",

  },


  message: {

    marginTop: 20,

    color:
      COLORS.text,

    textAlign:
      "center",

  },


  info: {

    marginTop: 20,

    color:
      COLORS.muted,

    textAlign:
      "center",

  },


  button: {

    marginTop: 30,

    backgroundColor:
      COLORS.primary,

    paddingVertical:
      15,

    borderRadius:
      RADIUS.md,

    alignItems:
      "center",

  },


  buttonText: {

    color:
      "#FFFFFF",

    fontWeight:
      "900",

  },


  disabled: {

    opacity:
      0.6,

  },

});