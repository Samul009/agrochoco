import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button, PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';

// Tema oscuro personalizado
const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121420',
    surface: '#1e1e2e',
    primary: '#bb86fc',
    text: '#ffffff',
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    outline: '#64748b',
    onSurfaceVariant: '#9ca3af',
  },
};

export default function PantallaPrincipal() {
  const router = useRouter();

  return (
    <PaperProvider theme={customDarkTheme}>
      <>
        <Stack.Screen
          options={{
            title: 'Inicio',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#121420',
            },
            headerTintColor: '#fff',
          }}
        />

        <ScrollView style={{ backgroundColor: customDarkTheme.colors.background }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 20,
            minHeight: 600
          }}>
            
            {/* Contenedor principal con fondo redondeado */}
            <View style={{
              backgroundColor: customDarkTheme.colors.surface,
              borderRadius: 25,
              padding: 40,
              width: '100%',
              maxWidth: 320,
              alignItems: 'center',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }}>

              {/* Título principal */}
              <Text
                variant="displaySmall"
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 10,
                  color: customDarkTheme.colors.text,
                }}
              >
                ¡Bienvenido!
              </Text>

              {/* Subtítulo */}
              <Text
                variant="titleMedium"
                style={{
                  color: customDarkTheme.colors.onSurfaceVariant,
                  textAlign: 'center',
                  marginBottom: 40,
                  opacity: 0.8,
                }}
              >
                ¡Nos alegra tenerte aquí!
              </Text>

              {/* Contenedor de la ilustración simulada */}
              <View style={{
                width: 200,
                height: 200,
                backgroundColor: '#2a2a3e',
                borderRadius: 20,
                marginBottom: 40,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: customDarkTheme.colors.primary,
              }}>
                
                {/* Simulación del teléfono */}
                <View style={{
                  width: 80,
                  height: 140,
                  backgroundColor: customDarkTheme.colors.background,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: customDarkTheme.colors.outline,
                }}>
                  
                  {/* Icono de usuario en el teléfono */}
                  <View style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: customDarkTheme.colors.primary,
                    marginBottom: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ 
                      color: '#000', 
                      fontSize: 18, 
                      fontWeight: 'bold' 
                    }}>
                      👤
                    </Text>
                  </View>
                  
                  {/* Líneas simulando texto */}
                  <View style={{
                    width: 50,
                    height: 4,
                    backgroundColor: customDarkTheme.colors.primary,
                    borderRadius: 2,
                    marginBottom: 4,
                  }} />
                  <View style={{
                    width: 40,
                    height: 4,
                    backgroundColor: customDarkTheme.colors.outline,
                    borderRadius: 2,
                  }} />
                </View>

                {/* Personaje simulado al lado */}
                <View style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 20,
                  width: 40,
                  height: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 35 }}>👋</Text>
                  <View style={{
                    width: 25,
                    height: 25,
                    borderRadius: 12,
                    backgroundColor: customDarkTheme.colors.primary,
                    marginTop: -15,
                  }} />
                </View>

                {/* Elementos decorativos (estrellas) */}
                <Text style={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 15, 
                  fontSize: 20,
                  color: customDarkTheme.colors.primary
                }}>
                  ✨
                </Text>
                <Text style={{ 
                  position: 'absolute', 
                  top: 30, 
                  right: 20, 
                  fontSize: 16,
                  color: customDarkTheme.colors.primary
                }}>
                  ⭐
                </Text>
                <Text style={{ 
                  position: 'absolute', 
                  bottom: 15, 
                  left: 10, 
                  fontSize: 18,
                  color: customDarkTheme.colors.primary
                }}>
                  ✨
                </Text>
              </View>

              {/* Botón principal */}
              <Button
                mode="contained"
                onPress={() => router.push('/conocimientos-previos')}
                style={{
                  width: '100%',
                  borderRadius: 25,
                  backgroundColor: customDarkTheme.colors.primary,
                  paddingVertical: 8,
                  elevation: 4,
                }}
                labelStyle={{ 
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#000'
                }}
              >
                Empezar
              </Button>

            </View>

            {/* Elementos decorativos en el fondo */}
            <View style={{
              position: 'absolute',
              top: 100,
              left: 20,
              width: 60,
              height: 20,
              backgroundColor: customDarkTheme.colors.primary,
              borderRadius: 20,
              opacity: 0.1,
            }} />
            
            <View style={{
              position: 'absolute',
              bottom: 150,
              right: 30,
              width: 40,
              height: 40,
              backgroundColor: customDarkTheme.colors.primary,
              borderRadius: 20,
              opacity: 0.1,
            }} />

          </View>
        </ScrollView>
      </>
    </PaperProvider>
  );
}