// app/(main)/plan.tsx
import { Text, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase'; // Importe o seu cliente

// No futuro, você vai copiar suas interfaces de 'types.ts' para cá
// interface Plan { ... } 
// interface Patient { ... }

export default function PlanScreen() {
  // 1. Obter o ID do paciente passado da tela de login
  const { patientId } = useLocalSearchParams<{ patientId: string }>();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null); // Use 'any' por enquanto

  useEffect(() => {
    if (patientId) {
      loadActivePlan();
    }
  }, [patientId]);

  // 2. Lógica de busca de dados (copiada de PatientView.tsx)
  const loadActivePlan = async () => {
    setLoading(true);
    const { data: planData, error } = await supabase
      .from("plans")
      .select("*")
      .eq("patient_id", patientId)
      .eq("is_active", true) 
      .maybeSingle();

    if (planData) {
      setPlan(planData);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Plano Carregado!</Text>
      <Text>ID do Paciente: {patientId}</Text>
      <Text>Nome do Plano: {plan?.name || 'Sem nome'}</Text>
      {/* Aqui você começará a construir a UI para mostrar a dieta e o treino */}
    </View>
  );
}