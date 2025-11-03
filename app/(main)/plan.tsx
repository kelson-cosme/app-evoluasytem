// app/(main)/plan.tsx
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase'; // Importe o seu cliente

export default function PlanScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null); // Usar 'any' por enquanto
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (patientId) {
      loadActivePlan();
    } else {
      setErrorMessage("ID do Paciente não encontrado.");
      setLoading(false);
    }
  }, [patientId]);

  const loadActivePlan = async () => {
    setLoading(true);
    setErrorMessage('');
    
    const { data: planData, error } = await supabase
      .from("plans")
      .select("*")
      .eq("patient_id", patientId)
      .eq("is_active", true) 
      .maybeSingle();

    if (error) {
      // Erro real (ex: RLS, rede)
      setErrorMessage("Erro ao carregar o plano.");
      console.error("Erro Supabase:", error);
    } else if (planData) {
      // Sucesso!
      setPlan(planData);
    } else {
      // Não é um erro, apenas não encontrou
      setErrorMessage("Nenhum plano ativo foi encontrado para você. Fale com o seu profissional.");
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>A carregar o seu plano...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oops!</Text>
        <Text>{errorMessage}</Text>
      </View>
    );
  }

  // Só renderiza isto se o plano existir
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plano Carregado!</Text>
      <Text>ID do Paciente: {patientId}</Text>
      <Text>Nome do Plano: {plan?.name || 'Plano principal'}</Text>
      {/* Aqui é onde você vai começar a construir a UI
        para mostrar a dieta e o treino, similar ao seu PatientView.tsx
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});