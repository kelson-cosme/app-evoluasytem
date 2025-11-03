// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* A tela de login (index) fica aqui */}
      <Stack.Screen name="index" options={{ headerShown: false }} /> 
      
      {/* O grupo (main) é o nosso app principal, também sem header aqui */}
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}