// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* O grupo (auth) contém a tela de login */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} /> 

      {/* O grupo (main) contém as telas do app (plano, etc.) */}
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}