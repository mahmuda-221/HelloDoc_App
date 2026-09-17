import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  user: any;
  setUser: (user: any) => void;

  appointments: any[];
  setAppointments: (appointments: any[]) => void;

  prescriptions: any[];
  addPrescription: (prescription: any) => void;

  medicalHistory: any[];
  addMedicalHistory: (record: any) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},

  appointments: [],
  setAppointments: () => {},

  prescriptions: [],
  addPrescription: () => {},

  medicalHistory: [],
  addMedicalHistory: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);

  const [appointments, setAppointments] = useState<any[]>([]);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);

  // Add prescription
  const addPrescription = (prescription: any) => {
    setPrescriptions((prev) => [prescription, ...prev]);
  };

  // Add prescription details to Medical History
  const addMedicalHistory = (record: any) => {
    setMedicalHistory((prev) => [record, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,

        appointments: Array.isArray(appointments)
          ? appointments
          : [],
        setAppointments,

        prescriptions: Array.isArray(prescriptions)
          ? prescriptions
          : [],
        addPrescription,

        medicalHistory: Array.isArray(medicalHistory)
          ? medicalHistory
          : [],
        addMedicalHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  return useContext(AppContext);
};

export default AppContext;