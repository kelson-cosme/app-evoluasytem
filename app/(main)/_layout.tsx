// app/(main)/_layout.tsx
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Alert, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme'; // Importe as nossas cores

export default function MainAppLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleDownload = () => {
    // No futuro, aqui ficará a lógica para gerar e partilhar o PDF
    Alert.alert(
      'Download',
      'A funcionalidade de download do plano ainda está em desenvolvimento.'
    );
  };

  return (
    <Stack>
      <Stack.Screen
        name="plan"
        options={{
          title: 'Meu Plano', // Título no cabeçalho
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false, // Remove a sombra
          headerRight: () => (
            <TouchableOpacity onPress={handleDownload} style={{ marginRight: 15 }}>
              <Feather name="download" size={22} color={colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}