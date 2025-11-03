// app/(main)/_layout.tsx
import { Stack } from 'expo-router';

// Este é o layout para as telas "dentro" do app (após o login)
export default function MainAppLayout() {
  return (
    <Stack>
      <Stack.Screen name="plan" options={{ title: 'Meu Plano' }} />
      {/* Outras telas (ex: perfil) podem ir aqui */}
    </Stack>
  );
}