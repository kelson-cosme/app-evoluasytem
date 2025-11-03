// app/(main)/plan.tsx
import { Feather } from '@expo/vector-icons'; // Importar ícones
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, // Para permitir rolar a tela
  Image,
  ScrollView,
  StyleSheet,
  Text, // O equivalente ao <img>
  TouchableOpacity, // Um "botão" personalizável
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme'; // Importar as cores
import { supabase } from '../../src/lib/supabase';
import { DietFoodItem } from '../../src/types';


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
const calculateMacros = (item: DietFoodItem) => {
  const multiplier = item.unit === "g" ? (item.qty / 100) : item.qty;
  return {
    kcal: (item.base_kcal || 0) * multiplier,
    p: (item.base_p || 0) * multiplier,
    c: (item.base_c || 0) * multiplier,
    f: (item.base_f || 0) * multiplier,
  };
};
// --- Fim dos Tipos e Constantes ---


export default function PlanScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const navigation = useNavigation(); // Para atualizar o título
  
  // Hooks para estilos e estado
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = getStyles(colors); // Estilos dinâmicos
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null); // Agora usamos o tipo Plan
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para controlar a "aba" (Dieta, Treino ou Arquivos)
  const [viewMode, setViewMode] = useState<'diet' | 'workout' | 'files'>('diet');

  const todayKey = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Lógica de busca de dados (sem alterações)
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
      // Atualiza o título do cabeçalho com o nome do plano
      navigation.setOptions({
        headerTitle: planData.name || 'Meu Plano',
      });
    } else {
      setErrorMessage("Nenhum plano ativo foi encontrado. Fale com o seu profissional.");
    }
    setLoading(false);
  };

  // --- Componentes de Renderização ---

  const renderDietPlan = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.dayTitle}>Plano de Hoje</Text>
        {MEALS.map(mealKey => {
          const fieldName = `diet_${todayKey}_${mealKey}`;
          const foodItems = (plan?.[fieldName] || []) as DietFoodItem[];
          if (foodItems.length === 0) return null; 

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
                {foodItems.map((item, index) => {
                  const itemMacros = calculateMacros(item);
                  return (
                    <View key={item.id || index} style={styles.foodItem}>
                      <Image 
                        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
                        style={styles.foodImage} 
                      />
                      <View style={styles.foodDetails}>
                        <Text style={styles.foodName} numberOfLines={1}>{item.qty}{item.unit} - {item.name}</Text>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{exercise.name}</Text>
                  {exercise.notes && (
                    <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                  )}
                </View>
                <Text style={styles.exerciseSets}>{exercise.sets}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  // NOVA VIEW: Arquivos
  const renderFilesView = () => (
    <View style={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.foodName}>Nenhum arquivo compartilhado</Text>
          <Text style={styles.foodMacros}>
            Quando o seu profissional partilhar exames ou outros documentos, eles aparecerão aqui.
          </Text>
        </View>
      </View>
    </View>
  );

  // --- Renderização Principal ---

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
          A carregar o seu plano...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Feather name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* As nossas "Abas" (Tabs) - agora com 3 opções */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, viewMode === 'diet' && styles.tabButtonActive]}
            onPress={() => setViewMode('diet')}
          >
            <Feather name="pie-chart" size={18} color={viewMode === 'diet' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.tabText, viewMode === 'diet' && styles.tabTextActive]}>Alimentação</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, viewMode === 'workout' && styles.tabButtonActive]}
            onPress={() => setViewMode('workout')}
          >
            <Feather name="activity" size={18} color={viewMode === 'workout' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.tabText, viewMode === 'workout' && styles.tabTextActive]}>Treino</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, viewMode === 'files' && styles.tabButtonActive]}
            onPress={() => setViewMode('files')}
          >
            <Feather name="file-text" size={18} color={viewMode === 'files' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.tabText, viewMode === 'files' && styles.tabTextActive]}>Arquivos</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo condicional */}
        {viewMode === 'diet' && renderDietPlan()}
        {viewMode === 'workout' && renderWorkoutPlan()}
        {viewMode === 'files' && renderFilesView()}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Nossos Estilos (O "CSS" do React Native) ---
// Criamos uma função para que ela possa usar as 'colors'
const getStyles = (colors: typeof Colors.light) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: colors.border,
    borderRadius: 28, // Pill shape
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
  },
  tabButtonActive: {
    backgroundColor: colors.card, // Branco
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  tabTextActive: {
    color: colors.accent, // Cor primária
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // Sombra mais subtil
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  kcalTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  foodImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.border,
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  foodMacros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseSets: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  exerciseNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  }
});