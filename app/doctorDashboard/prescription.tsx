import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useApp } from "../../Context/AppContext";

const API_URL = "http://localhost:5000";

const PrescriptionScreen = () => {
  const router = useRouter();

  const {
    appointments,
    addPrescription,
    addMedicalHistory,
  } = useApp();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * If there is an appointment, use it.
   * If the screen is opened directly for testing,
   * use a temporary fallback appointment.
   */
  const appointment = appointments?.[0] || {
    id: "apt-test",
    patientId: "P-101",
    patientName: "Test Patient",
    doctorId: "d1",
    doctorName: "Dr. Farhana Khan",
  };

  const handleCreatePrescription = async () => {
    // ---------------- VALIDATION ----------------

    if (!medicineName.trim()) {
      Alert.alert("Required", "Please enter medicine name.");
      return;
    }

    if (!dosage.trim()) {
      Alert.alert("Required", "Please enter dosage.");
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // ---------------- PRESCRIPTION OBJECT ----------------

      const newPrescription = {
        id: `prescription-${Date.now()}`,

        appointmentId:
          appointment?.id || null,

        patientId:
          appointment?.patientId ||
          appointment?.patient_id ||
          "P-101",

        patientName:
          appointment?.patientName ||
          appointment?.patient_name ||
          "Test Patient",

        doctorId:
          appointment?.doctorId ||
          appointment?.doctor_id ||
          "d1",

        doctorName:
          appointment?.doctorName ||
          appointment?.doctor_name ||
          "Dr. Farhana Khan",

        medicines: [
          {
            name: medicineName.trim(),
            dosage: dosage.trim(),
          },
        ],

        instructions: instructions.trim(),

        notes: notes.trim(),

        diagnosis:
          notes.trim() || "General consultation",

        date: today,

        createdAt: new Date().toISOString(),
      };

      // ==================================================
      // 1. SAVE PRESCRIPTION TO NEON POSTGRESQL
      // ==================================================

      const response = await axios.post(
        `${API_URL}/prescriptions`,
        {
          appointmentId:
            newPrescription.appointmentId,

          doctorId:
            newPrescription.doctorId,

          doctorName:
            newPrescription.doctorName,

          patientId:
            newPrescription.patientId,

          patientName:
            newPrescription.patientName,

          diagnosis:
            newPrescription.diagnosis,

          medicines:
            newPrescription.medicines,

          notes:
            newPrescription.notes,

          instructions:
            newPrescription.instructions,

          date:
            newPrescription.date,
        }
      );

      console.log(
        "Prescription saved:",
        response.data
      );

      // Backend normally returns:
      // { message: "...", prescription: {...} }

      const savedPrescription =
        response.data?.prescription ||
        response.data;

      // ==================================================
      // 2. UPDATE LOCAL PRESCRIPTION CONTEXT
      // ==================================================

      addPrescription({
        ...newPrescription,
        ...savedPrescription,

        appointmentId:
          savedPrescription?.appointment_id ||
          newPrescription.appointmentId,

        patientId:
          savedPrescription?.patient_id ||
          newPrescription.patientId,

        patientName:
          savedPrescription?.patient_name ||
          newPrescription.patientName,

        doctorId:
          savedPrescription?.doctor_id ||
          newPrescription.doctorId,

        doctorName:
          savedPrescription?.doctor_name ||
          newPrescription.doctorName,

        instructions:
          savedPrescription?.instructions ||
          newPrescription.instructions,
      });

      // ==================================================
      // 3. UPDATE LOCAL MEDICAL HISTORY CONTEXT
      // ==================================================

      addMedicalHistory({
        id:
          savedPrescription?.id ||
          newPrescription.id,

        appointmentId:
          savedPrescription?.appointment_id ||
          newPrescription.appointmentId,

        patientId:
          savedPrescription?.patient_id ||
          newPrescription.patientId,

        patientName:
          savedPrescription?.patient_name ||
          newPrescription.patientName,

        doctorId:
          savedPrescription?.doctor_id ||
          newPrescription.doctorId,

        doctorName:
          savedPrescription?.doctor_name ||
          newPrescription.doctorName,

        diagnosis:
          savedPrescription?.diagnosis ||
          newPrescription.diagnosis,

        medicines:
          savedPrescription?.medicines ||
          newPrescription.medicines,

        prescription:
          `${medicineName.trim()} - ${dosage.trim()}`,

        instructions:
          savedPrescription?.instructions ||
          newPrescription.instructions,

        notes:
          savedPrescription?.notes ||
          newPrescription.notes,

        visitDate:
          savedPrescription?.date ||
          newPrescription.date,

        date:
          savedPrescription?.date ||
          newPrescription.date,

        createdAt:
          savedPrescription?.created_at ||
          newPrescription.createdAt,
      });

      // ==================================================
      // 4. SUCCESS MESSAGE
      // ==================================================

      Alert.alert(
        "Success",
        "Prescription created successfully and Medical History updated.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/doctor");
            },
          },
        ]
      );

      // Clear form
      setMedicineName("");
      setDosage("");
      setInstructions("");
      setNotes("");
    } catch (error: any) {
      console.error(
        "Prescription creation error:",
        error?.response?.data || error
      );

      const errorMessage =
        error?.response?.data?.error ||
        "Failed to create prescription. Please try again.";

      Alert.alert(
        "Error",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Create Prescription
        </Text>

        {/* ================= PATIENT ================= */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Patient Information
          </Text>

          <Text style={styles.label}>
            Patient Name
          </Text>

          <Text style={styles.infoText}>
            {appointment?.patientName ||
              appointment?.patient_name ||
              "Test Patient"}
          </Text>

          <Text style={styles.label}>
            Patient ID
          </Text>

          <Text style={styles.infoText}>
            {appointment?.patientId ||
              appointment?.patient_id ||
              "P-101"}
          </Text>
        </View>

        {/* ================= DOCTOR ================= */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Doctor Information
          </Text>

          <Text style={styles.label}>
            Doctor Name
          </Text>

          <Text style={styles.infoText}>
            {appointment?.doctorName ||
              appointment?.doctor_name ||
              "Dr. Farhana Khan"}
          </Text>
        </View>

        {/* ================= FORM ================= */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Prescription Details
          </Text>

          <Text style={styles.label}>
            Medicine Name *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter medicine name"
            value={medicineName}
            onChangeText={setMedicineName}
            editable={!loading}
          />

          <Text style={styles.label}>
            Dosage *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: 1 tablet twice daily"
            value={dosage}
            onChangeText={setDosage}
            editable={!loading}
          />

          <Text style={styles.label}>
            Instructions
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            placeholder="Example: Take after meals"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          <Text style={styles.label}>
            Diagnosis / Notes
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            placeholder="Enter diagnosis or medical notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        {/* ================= BUTTON ================= */}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCreatePrescription}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Saving..."
              : "Create Prescription"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PrescriptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 10,
    marginBottom: 7,
  },

  infoText: {
    fontSize: 16,
    color: "#1F2937",
    paddingBottom: 5,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});