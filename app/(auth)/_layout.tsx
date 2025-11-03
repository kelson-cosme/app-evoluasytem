// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

// Este layout é para o grupo de autenticação
export default function AuthLayout() {
  return (
    <Stack>
      {/* A tela de login não precisa de um header visível */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}