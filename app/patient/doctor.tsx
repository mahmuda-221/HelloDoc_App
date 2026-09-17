// @ts-nocheck
import { useApp } from "@/Context/AppContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { Doctor } from "../../data/doctor";

export default function DoctorListScreen() {
  const { patientId: patientIdParam } = useLocalSearchParams<{
    patientId?: string;
  }>();
  const { currentPatientId, doctors } = useApp();
  const patientId = patientIdParam ?? currentPatientId ?? undefined;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    ...Array.from(new Set(doctors.map((doctor) => doctor.specialization))),
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesCategory =
      selectedCategory === "All" || doctor.specialization === selectedCategory;
    const matchesSearch =
      doctor.name.toLowerCase().includes(normalizedQuery) ||
      doctor.specialization.toLowerCase().includes(normalizedQuery) ||
      doctor.hospital.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const openDoctor = (doctor: Doctor) => {
    if (!patientId) {
      router.replace("/");
      return;
    }

    router.push({
      pathname: "/doctor/[id]",
      params: { id: doctor.id, patientId },
    });
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.header}>Find Your Doctor</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search doctor, specialty, hospital..."
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item: Doctor) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Doctor }) => (
          <Pressable style={styles.card} onPress={() => openDoctor(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.specialty}>
                {item.specialization} · {item.qualification}
              </Text>
              <Text style={styles.subInfo}>{item.hospital}</Text>
              <View style={styles.row}>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
                <Text style={styles.fee}>৳{item.fee}</Text>
              </View>
              <Text style={styles.profileLink}>View profile & book →</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 15, backgroundColor: "#F8FAFC" },
  backButton: { marginTop: 8, marginBottom: 12 },
  backButtonText: { color: "#0284C7", fontWeight: "bold", fontSize: 15 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#0F172A" },
  searchBar: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, padding: 12, marginBottom: 15, color: "#0F172A" },
  categoryContainer: { height: 42, marginBottom: 15 },
  categoryButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: "#E2E8F0", marginRight: 8, justifyContent: "center" },
  activeCategoryButton: { backgroundColor: "#0284C7" },
  categoryText: { color: "#475569", fontWeight: "600" },
  activeCategoryText: { color: "#FFFFFF" },
  listContent: { paddingBottom: 30 },
  card: { flexDirection: "row", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  image: { width: 82, height: 82, borderRadius: 12, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#0F172A" },
  specialty: { fontSize: 12, color: "#0284C7", fontWeight: "600", marginVertical: 3 },
  subInfo: { fontSize: 12, color: "#64748B" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  rating: { fontSize: 13, fontWeight: "bold", color: "#D97706" },
  fee: { fontSize: 14, fontWeight: "bold", color: "#16A34A" },
  profileLink: { color: "#0F766E", fontSize: 12, fontWeight: "700", marginTop: 8 },
});
