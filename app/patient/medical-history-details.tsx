import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_URL = "http://localhost:5000";

export default function MedicalHistoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MEDICAL HISTORY DETAILS
  // ==========================================

  const fetchMedicalHistoryDetails = async () => {
    if (!id) {
      setError("Medical record ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "Fetching medical history:",
        `${API_URL}/medical-history/${id}`
      );

      const response = await axios.get(
        `${API_URL}/medical-history/${id}`
      );

      console.log(
        "Medical history details:",
        response.data
      );

      setRecord(response.data);
    } catch (err: any) {
      console.error(
        "Medical history details error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.error ||
          "Medical record not found."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistoryDetails();
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Loading medical record...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (error || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.notFound}>
            {error || "Medical record not found."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={fetchMedicalHistoryDetails}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // FORMAT MEDICINES
  // ==========================================

  let prescriptionText =
    record.prescription || "";

  if (Array.isArray(record.medicines)) {
    prescriptionText = record.medicines
      .map((medicine: any) => {
        if (typeof medicine === "string") {
          return medicine;
        }

        const name = medicine.name || "";

        const dosage = medicine.dosage
          ? ` - ${medicine.dosage}`
          : "";

        const timing = medicine.timing
          ? ` (${medicine.timing})`
          : "";

        return `${name}${dosage}${timing}`;
      })
      .filter(Boolean)
      .join(", ");
  }

  // ==========================================
  // DISPLAY
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        {/* Title */}
        <Text style={styles.title}>
          Medical History Details
        </Text>

        <View style={styles.card}>
          {/* Diagnosis */}
          <Text style={styles.label}>
            Diagnosis
          </Text>

          <Text style={styles.text}>
            {record.diagnosis || "N/A"}
          </Text>

          {/* Prescription */}
          <Text style={styles.label}>
            Prescription
          </Text>

          <Text style={styles.text}>
            {prescriptionText || "N/A"}
          </Text>

          {/* Instructions */}
          <Text style={styles.label}>
            Instructions
          </Text>

          <Text style={styles.text}>
            {record.instructions || "N/A"}
          </Text>

          {/* Notes */}
          <Text style={styles.label}>
            Notes
          </Text>

          <Text style={styles.text}>
            {record.notes || "N/A"}
          </Text>

          {/* Visit Date */}
          <Text style={styles.label}>
            Visit Date
          </Text>

          <Text style={styles.text}>
            {record.visitDate ||
              record.date ||
              "N/A"}
          </Text>

          {/* Doctor */}
          <Text style={styles.label}>
            Doctor
          </Text>

          <Text style={styles.text}>
            {record.doctorName || "N/A"}
          </Text>

          {/* Patient */}
          <Text style={styles.label}>
            Patient Name
          </Text>

          <Text style={styles.text}>
            {record.patientName || "N/A"}
          </Text>

          {/* Patient ID */}
          <Text style={styles.label}>
            Patient ID
          </Text>

          <Text style={styles.text}>
            {record.patientId || "N/A"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 15,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 18,
    borderRadius: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
    marginBottom: 4,
  },

  text: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  notFound: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});