import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Text, TextInput, Button, PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';

// Importar usuarios.json (ajusta la ruta según tu estructura real)
import usuarios from '../usuarios.json';

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
    outline: '#64748b',
    onSurfaceVariant: '#9ca3af',
  },
};

export default function InicioSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Validar datos de inicio de sesión
  const validateLogin = () => {
    setIsLoading(true);

    // Buscar usuario por email ignorando mayúsculas
    const usuario = usuarios.find(
      user => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    setTimeout(() => {
      setIsLoading(false);

      if (!usuario) {
        Alert.alert(
          'Error de autenticación',
          'El usuario no existe.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      if (usuario.clave !== password) {
        Alert.alert(
          'Error de autenticación',
          'Datos de acceso incorrecto.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Datos correctos
      Alert.alert(
        'Acceso exitoso',
        `¡Bienvenido/a ${usuario.nombre}!\nRol: ${usuario.rol}`,
        [
          {
            text: 'Continuar',
            onPress: () => router.push('pantalla-principal')
          }
        ]
      );
    }, 1000);
  };

  return (
    <PaperProvider theme={customDarkTheme}>
      <>
        <Stack.Screen
          options={{
            title: 'Iniciar Sesión',
            headerShown: true,
            headerStyle: { backgroundColor: '#121420' },
            headerTintColor: '#fff',
          }}
        />

        <ScrollView style={{ backgroundColor: customDarkTheme.colors.background }}>
          <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Text
              variant="headlineLarge"
              style={{
                paddingHorizontal: 20,
                paddingTop: 60,
                paddingBottom: 40,
                fontWeight: 'bold',
                textAlign: 'center',
                color: customDarkTheme.colors.text,
              }}
            >
              INICIAR SESIÓN
            </Text>

            <TextInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={{ marginBottom: 15, backgroundColor: customDarkTheme.colors.surface }}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{
                colors: {
                  primary: customDarkTheme.colors.primary,
                  onSurface: customDarkTheme.colors.text,
                  outline: customDarkTheme.colors.outline,
                }
              }}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={{ marginBottom: 20, backgroundColor: customDarkTheme.colors.surface }}
              theme={{
                colors: {
                  primary: customDarkTheme.colors.primary,
                  onSurface: customDarkTheme.colors.text,
                  outline: customDarkTheme.colors.outline,
                }
              }}
            />

            <Button
              onPress={() => router.push("formulario-registro")}
              mode="text"
              style={{ marginBottom: 20, alignSelf: 'flex-end' }}
              labelStyle={{ color: '#f48fb1' }}
            >
              ¿Olvidaste tu contraseña?
            </Button>

            <Button
              mode="contained"
              onPress={validateLogin}
              loading={isLoading}
              disabled={!email.trim() || !password.trim() || isLoading}
              style={{
                marginTop: 10,
                padding: 8,
                backgroundColor: customDarkTheme.colors.primary,
                borderRadius: 10,
              }}
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            >
              {isLoading ? 'Validando...' : 'Iniciar sesión'}
            </Button>

            <View style={{ marginTop: 30 }}>
              <Text style={{
                textAlign: 'center',
                color: customDarkTheme.colors.onSurfaceVariant,
                marginBottom: 15
              }}>
                O continúa con
              </Text>

              <Button
                icon="google"
                mode="contained"
                onPress={() => console.log('Iniciar con Google')}
                style={{
                  marginBottom: 10,
                  padding: 5,
                  backgroundColor: '#ef5350',
                  borderRadius: 10,
                }}
              >
                Iniciar sesión con Google
              </Button>

              <Button
                icon="apple"
                mode="contained"
                onPress={() => console.log('Iniciar con Apple')}
                style={{
                  marginBottom: 10,
                  padding: 5,
                  backgroundColor: '#424242',
                  borderRadius: 10,
                }}
              >
                Iniciar sesión con Apple
              </Button>
            </View>
          </View>
        </ScrollView>
      </>
    </PaperProvider>
  );
}
