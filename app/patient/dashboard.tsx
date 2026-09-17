// @ts-nocheck
import { useApp } from "@/Context/AppContext";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Appointment } from "../../data/mockData";

export default function PatientDashboard() {
  const {
    patientId: patientIdParam,
    bookingStatus,
  } = useLocalSearchParams<{
    patientId?: string;
    bookingStatus?: string;
  }>();
  const {
    appointments,
    currentPatientId,
    prescriptions,
    patientAccounts,
    setCurrentPatientId,
    signOut,
  } = useApp();

  const patientId = patientIdParam ?? currentPatientId ?? undefined;
  const patient = patientAccounts.find((account) => account.id === patientId);
  const patientEmail = patient?.email.toLowerCase();

  const patientAppointments = appointments
    .filter(
      (appointment) =>
        appointment.patientId === patientId &&
        appointment.status !== "Cancelled"
    )
    .sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );

  const patientPrescriptionCount = prescriptions.filter((prescription) => {
    const samePatientId = prescription.patientId === patientId;
    const samePatientEmail =
      Boolean(patientEmail) &&
      prescription.patientEmail?.toLowerCase() === patientEmail;

    return samePatientId || samePatientEmail;
  }).length;

  React.useEffect(() => {
    if (patientId) {
      setCurrentPatientId(patientId);
    }
  }, [patientId, setCurrentPatientId]);

  const openChat = (appointment: Appointment) => {
    router.push({
      pathname: "/consultation/chat/[id]",
      params: {
        id: `${appointment.doctorId}_${appointment.patientId}`,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        currentUserId: `patient:${appointment.patientId}`,
        targetName: appointment.doctorName,
      },
    });
  };

  const handleLogout = () => {
    signOut();
    router.replace("/");
  };

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Patient account not found</Text>
          <Text style={styles.errorText}>Please sign in again.</Text>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Patient 👋</Text>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.email}>{patient.email}</Text>
        </View>

        {bookingStatus === "success" ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Appointment confirmed</Text>
          </View>
        ) : null}

        <View style={styles.actionContainer}>
  <Pressable
    style={styles.primaryButton}
    onPress={() =>
      router.push({
        pathname: "/patient/doctor",
        params: { patientId: patient.id },
      })
    }
  >
    <Text style={styles.buttonText}>🔍 Find & Book a Doctor</Text>
  </Pressable>

  <Pressable
    style={styles.secondaryButton}
    onPress={() =>
      router.push({
        pathname: "/patient/prescriptions",
        params: { patientId: patient.id },
      })
    }
  >
    <Text style={styles.buttonText}>
      📄 View My Prescriptions ({patientPrescriptionCount})
    </Text>
  </Pressable>

  <Pressable
    style={styles.secondaryButton}
    onPress={() => router.push("/patient/medical-history")}
  >
    <Text style={styles.buttonText}>🏥 Medical History</Text>
  </Pressable>

  <Pressable
    style={styles.secondaryButton}
    onPress={() => router.push("/patient/profile-settings")}
  >
    <Text style={styles.buttonText}>👤 Profile Settings</Text>
  </Pressable>

  <Pressable
    style={styles.secondaryButton}
    onPress={() => router.push("/patient/notifications")}
  >
    <Text style={styles.buttonText}>🔔 Notifications</Text>
  </Pressable>
</View>
        <Text style={styles.sectionTitle}>Your Appointments</Text>

        {patientAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptyText}>
              Book a doctor first. Chat becomes available after booking.
            </Text>
          </View>
        ) : (
          patientAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                  <Text style={styles.specialty}>{appointment.specialty}</Text>
                </View>
                <Text style={styles.statusBadge}>{appointment.status}</Text>
              </View>

              <Text style={styles.dateTime}>
                📅 {appointment.date} · 🕒 {appointment.time}
              </Text>
              <Text style={styles.accountText}>
                Patient account: {appointment.patientEmail || patient.email}
              </Text>

              <Pressable
                style={styles.chatButton}
                onPress={() => openChat(appointment)}
              >
                <Text style={styles.chatButtonText}>💬 Chat with Doctor</Text>
              </Pressable>
            </View>
          ))
        )}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    backgroundColor: "#0284C7",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  greeting: { color: "#BAE6FD", fontSize: 14, fontWeight: "500" },
  patientName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 4,
  },
  email: { color: "#E0F2FE", fontSize: 13, marginTop: 6 },
  successCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  successTitle: { color: "#065F46", fontWeight: "800", fontSize: 15 },
  successText: { color: "#047857", fontSize: 13, lineHeight: 19, marginTop: 4 },
  actionContainer: { gap: 12, marginBottom: 24 },
  primaryButton: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#0284C7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardHeaderText: { flex: 1 },
  doctorName: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  specialty: { fontSize: 13, color: "#0F766E", marginTop: 3 },
  statusBadge: {
    color: "#0F766E",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "700",
  },
  dateTime: { fontSize: 13, color: "#475569", marginTop: 14 },
  accountText: { fontSize: 12, color: "#0284C7", marginTop: 5 },
  chatButton: {
    backgroundColor: "#0F766E",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 14,
  },
  chatButtonText: { color: "#FFFFFF", fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  logoutButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: "center", padding: 24 },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
});
