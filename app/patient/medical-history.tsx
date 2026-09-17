import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  INITIAL_MEDICAL_HISTORY,
} from "../../data/medicalHistory";

const API_URL = "http://localhost:5000";

export default function MedicalHistoryScreen() {
  const [search, setSearch] = useState("");
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD MEDICAL HISTORY FROM NEON / BACKEND
  // ==========================================

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/medical-history`
      );

      console.log(
        "Medical history loaded:",
        response.data
      );

      setMedicalHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err: any) {
      console.error(
        "Medical history fetch error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.error ||
          "Failed to load medical history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  // ==========================================
  // COMBINE DATABASE HISTORY WITH OLD STATIC DATA
  // ==========================================

  const allHistory = useMemo(() => {
    return [
      ...medicalHistory,
      ...INITIAL_MEDICAL_HISTORY,
    ];
  }, [medicalHistory]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredHistory = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return allHistory;
    }

    return allHistory.filter((item: any) =>
      String(item.diagnosis || "")
        .toLowerCase()
        .includes(searchText)
    );
  }, [search, allHistory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
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
          Medical History
        </Text>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search diagnosis..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Loading */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />

            <Text style={styles.loadingText}>
              Loading medical history...
            </Text>
          </View>
        ) : error ? (
          /* Error */
          <View style={styles.center}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={fetchMedicalHistory}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : filteredHistory.length === 0 ? (
          /* Empty */
          <Text style={styles.emptyText}>
            No records found
          </Text>
        ) : (
          /* History List */
          filteredHistory.map(
            (record: any, index: number) => {
              const recordId =
                record.id ??
                `history-${index}`;

              // Medicines formatting
              let prescriptionText =
                record.prescription || "";

              if (
                Array.isArray(record.medicines)
              ) {
                prescriptionText =
                  record.medicines
                    .map((medicine: any) => {
                      if (
                        typeof medicine ===
                        "string"
                      ) {
                        return medicine;
                      }

                      return `${medicine.name || ""}${
                        medicine.dosage
                          ? ` - ${medicine.dosage}`
                          : ""
                      }`;
                    })
                    .filter(Boolean)
                    .join(", ");
              }

              return (
                <View
                  key={String(recordId)}
                  style={styles.card}
                >
                  <Text style={styles.label}>
                    Diagnosis:{" "}
                    {record.diagnosis ||
                      "N/A"}
                  </Text>

                  <Text
                    style={styles.infoText}
                  >
                    Prescription:{" "}
                    {prescriptionText ||
                      "N/A"}
                  </Text>

                  <Text
                    style={styles.infoText}
                  >
                    Visit Date:{" "}
                    {record.visitDate ||
                      record.date ||
                      "N/A"}
                  </Text>

                  {record.doctorName ? (
                    <Text
                      style={styles.infoText}
                    >
                      Doctor:{" "}
                      {record.doctorName}
                    </Text>
                  ) : null}

                  {record.instructions ? (
                    <Text
                      style={styles.infoText}
                    >
                      Instructions:{" "}
                      {record.instructions}
                    </Text>
                  ) : null}

                  {record.notes ? (
                    <Text
                      style={styles.infoText}
                    >
                      Notes: {record.notes}
                    </Text>
                  ) : null}

                  {/* Details */}
                  <Pressable
                    style={styles.detailsButton}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/patient/medical-history-details",
                        params: {
                          id: String(
                            recordId
                          ),
                        },
                      })
                    }
                  >
                    <Text
                      style={
                        styles.detailsButtonText
                      }
                    >
                      View Details
                    </Text>
                  </Pressable>
                </View>
              );
            }
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
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
    marginBottom: 16,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  errorText: {
    color: "red",
    textAlign: "center",
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

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  label: {
    fontWeight: "700",
    marginBottom: 8,
  },

  infoText: {
    marginBottom: 5,
    color: "#333",
  },

  detailsButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  detailsButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});