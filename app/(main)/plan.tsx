// app/(main)/plan.tsx
import {
    Text,
    View,
    ActivityIndicator,
    StyleSheet,
    ScrollView, // Para permitir rolar a tela
    Image, // O equivalente ao <img>
    TouchableOpacity, // Um "botão" personalizável
  } from 'react-native';
  import { useLocalSearchParams } from 'expo-router';
  import { useEffect, useState } from 'react';
  import { supabase } from '../../src/lib/supabase';
  // Importe os tipos que acabamos de criar
  import { DietFoodItem } from '../../src/types'; 
  import { SafeAreaView } from 'react-native-safe-area-context';
  // --- Tipos e Constantes (copiados de PatientView.tsx) ---
  //
  interface Plan {
    [key: string]: any; 
    name?: string; 
    workout_plans?: Array<{
      name: string;
      exercises: Array<{
        name: string;
        sets: string;
        notes: string;
      }>;
    }>;
  }
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const MEALS = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "supper"];
  const MEAL_NAMES: { [key: string]: string } = {
    breakfast: "Pequeno-almoço",
    morning_snack: "Lanche da Manhã",
    lunch: "Almoço",
    afternoon_snack: "Lanche da Tarde",
    dinner: "Jantar",
    supper: "Ceia"
  };
  // Helper de cálculo (copiado de PatientView.tsx)
  //
  const calculateMacros = (item: DietFoodItem) => {
    const multiplier = item.unit === "g" ? (item.qty / 100) : item.qty;
    return {
      kcal: (item.base_kcal || 0) * multiplier,
      p: (item.base_p || 0) * multiplier,
      c: (item.base_c || 0) * multiplier,
      f: (item.base_f || 0) * multiplier,
    };
  };
  // --- Fim das cópias ---
  
  
  export default function PlanScreen() {
    const { patientId } = useLocalSearchParams<{ patientId: string }>();
    
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<Plan | null>(null); // Agora usamos o tipo Plan
    const [errorMessage, setErrorMessage] = useState('');
    
    // Estado para controlar a "aba" (Dieta ou Treino)
    const [viewMode, setViewMode] = useState<'diet' | 'workout'>('diet');
  
    // Vamos pegar o dia de hoje, tal como no seu site
    const todayKey = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  
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
        setErrorMessage("Erro ao carregar o plano.");
        console.error("Erro Supabase:", error);
      } else if (planData) {
        setPlan(planData as Plan);
      } else {
        setErrorMessage("Nenhum plano ativo foi encontrado. Fale com o seu profissional.");
      }
      setLoading(false);
    };
  
    // Componente de renderização da Dieta
    const renderDietPlan = () => {
      // Por agora, vamos mostrar apenas o plano de HOJE para simplificar
      // (Em vez de implementar as abas dos 7 dias)
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.dayTitle}>Plano de Hoje</Text>
          {MEALS.map(mealKey => {
            const fieldName = `diet_${todayKey}_${mealKey}`;
            const foodItems = (plan?.[fieldName] || []) as DietFoodItem[];
            if (foodItems.length === 0) return null; // Não mostra refeições vazias
  
            const mealTotals = foodItems.reduce((totals, item) => {
              const macros = calculateMacros(item);
              totals.kcal += macros.kcal;
              return totals;
            }, { kcal: 0 });
  
            return (
              <View key={fieldName} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.mealTitle}>{MEAL_NAMES[mealKey]}</Text>
                  <Text style={styles.kcalTotal}>{mealTotals.kcal.toFixed(0)} kcal</Text>
                </View>
                <View style={styles.cardContent}>
                  {foodItems.map((item) => {
                    const itemMacros = calculateMacros(item);
                    return (
                      <View key={item.id} style={styles.foodItem}>
                        <Image 
                          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
                          style={styles.foodImage} 
                        />
                        <View style={styles.foodDetails}>
                          <Text style={styles.foodName}>{item.qty}{item.unit} - {item.name}</Text>
                          <Text style={styles.foodMacros}>
                            {`${itemMacros.kcal.toFixed(0)} kcal (P:${itemMacros.p.toFixed(0)} C:${itemMacros.c.toFixed(0)} F:${itemMacros.f.toFixed(0)})`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      );
    };
  
    // Componente de renderização do Treino
    const renderWorkoutPlan = () => (
      <View style={styles.contentContainer}>
        {(plan?.workout_plans || []).map((workout, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.mealTitle}>{workout.name}</Text>
            </View>
            <View style={styles.cardContent}>
              {workout.exercises.map((exercise, exIndex) => (
                <View key={exIndex} style={styles.exerciseItem}>
                  <Text style={styles.foodName}>{exercise.name}</Text>
                  <Text style={styles.exerciseSets}>{exercise.sets}</Text>
                  {exercise.notes && (
                    <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  
    // --- Renderização Principal ---
  
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>A carregar o seu plano...</Text>
        </View>
      );
    }
  
    if (errorMessage) {
      return (
        <View style={styles.centered}>
          <Text style={styles.title}>Oops!</Text>
          <Text style={{ textAlign: 'center' }}>{errorMessage}</Text>
        </View>
      );
    }
  
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.planName}>{plan?.name || 'Plano Principal'}</Text>
          </View>
  
          {/* As nossas "Abas" (Tabs) - versão simples com botões */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, viewMode === 'diet' && styles.tabButtonActive]}
              onPress={() => setViewMode('diet')}
            >
              <Text style={[styles.tabText, viewMode === 'diet' && styles.tabTextActive]}>🥗 Alimentação</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, viewMode === 'workout' && styles.tabButtonActive]}
              onPress={() => setViewMode('workout')}
            >
              <Text style={[styles.tabText, viewMode === 'workout' && styles.tabTextActive]}>💪 Treino</Text>
            </TouchableOpacity>
          </View>
  
          {/* Conteúdo condicional */}
          {viewMode === 'diet' ? renderDietPlan() : renderWorkoutPlan()}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // --- Nossos Estilos (O "CSS" do React Native) ---
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f4f7f6', // Um cinza-claro, similar ao --background
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      padding: 20,
    },
    planName: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      backgroundColor: '#e0e0e0',
      borderRadius: 10,
      marginHorizontal: 20,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    tabButtonActive: {
      backgroundColor: '#ffffff', // Branco
      margin: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#555',
    },
    tabTextActive: {
      color: '#007bff', // Cor primária (azul)
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    dayTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    mealTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    kcalTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#007bff', // Cor primária
    },
    cardContent: {
      padding: 15,
    },
    foodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f5f5f5',
    },
    foodImage: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: '#eee',
    },
    foodDetails: {
      flex: 1,
    },
    foodName: {
      fontSize: 15,
      fontWeight: '500',
    },
    foodMacros: {
      fontSize: 13,
      color: '#666',
      marginTop: 2,
    },
    exerciseItem: {
      marginBottom: 15,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f5f5f5',
    },
    exerciseSets: {
      fontSize: 15,
      color: '#007bff', // Cor primária
      fontWeight: '500',
      marginTop: 4,
    },
    exerciseNotes: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
      fontStyle: 'italic',
    }
  });