import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Oculta el header para la pantalla de 'configuracion' */}
      <Stack.Screen name="app" options={{ headerShown: false }} />
      <Stack.Screen name="configuracion" options={{ headerShown: false }} />
      <Stack.Screen name="lista-elementos" options={{ headerShown: false }} />
      <Stack.Screen name="lista-servicios" options={{ headerShown: false }} />
   
    </Stack>
  );
}

