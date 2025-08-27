import React from "react";
import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="inicio-sesion" options={{ headerShown: false }} />
          <Stack.Screen name="app" options={{ headerShown: false }} />
          <Stack.Screen name="novedades" options={{ headerShown: false }} />
          <Stack.Screen name="productos" options={{ headerShown: false }} />
          <Stack.Screen name="producto-detalle" options={{ headerShown: false }} />
          <Stack.Screen name="configuracion" options={{ headerShown: false }} />
          <Stack.Screen name="perfil-usuario/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="editar-perfil/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="rutas" options={{ headerShown: false }} />
          <Stack.Screen name="notificaciones" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
