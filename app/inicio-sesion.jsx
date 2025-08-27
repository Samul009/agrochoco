import React, { useState } from 'react';
import { ScrollView, View, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, Button, PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa usuarios.json (ajusta la ruta según tu estructura)
import usuarios from '../usuarios.json';

export default function InicioSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Configuración de login con Google (usa tu clientId real)
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "TU_ANDROID_CLIENT_ID",
    iosClientId: "TU_IOS_CLIENT_ID",
    expoClientId: "TU_EXPO_CLIENT_ID",
  });

  // Manejo de respuesta Google
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      Alert.alert("Google Login", "Inicio de sesión exitoso con Google ✅");
      router.push("pantalla-principal");
    }
  }, [response]);

  // Validar datos de inicio de sesión
  const validateLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Campos vacíos',
        'Por favor ingresa tu correo y contraseña.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsLoading(true);

    // Buscar usuario por email (ignora mayúsculas)
    const usuario = usuarios.find(
      user => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    setTimeout(async () => {
      setIsLoading(false);

      if (!usuario) {
        Alert.alert('Error', 'El usuario no existe.');
        return;
      }

      if (usuario.clave !== password) {
        Alert.alert('Error', 'Contraseña incorrecta.');
        return;
      }

      // Guardar usuario en AsyncStorage
      try {
        await AsyncStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        Alert.alert(
          'Bienvenido',
          `¡Hola ${usuario.nombre}!\nRol: ${usuario.rol}`,
          [{ 
            text: 'Continuar', 
            onPress: () => router.push('novedades') 
          }]
        );
      } catch (error) {
        if (__DEV__) {
          console.error('Error guardando usuario:', error);
        }
        Alert.alert('Error', 'No se pudo guardar la sesión');
      }
    }, 1000);
  };

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text
            variant="headlineLarge"
            style={{
              paddingBottom: 40,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#000',
            }}
          >
            INICIAR SESIÓN
          </Text>

          {/* Campo Email */}
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={{ marginBottom: 15 }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!passwordVisible}
            style={{ marginBottom: 20 }}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye-off" : "eye"}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
          />

          <Button
            onPress={() => router.push("formulario-registro")}
            mode="text"
            style={{ marginBottom: 20, alignSelf: 'flex-end' }}
            labelStyle={{ color: '#1976d2' }}
          >
            Crear cuenta
          </Button>

          {/* Botón iniciar sesión */}
          <Button
            mode="contained"
            onPress={validateLogin}
            loading={isLoading}
            disabled={isLoading}
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: '#1976d2',
              borderRadius: 10,
            }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}
          >
            {isLoading ? 'Validando...' : 'Iniciar sesión'}
          </Button>

          <View style={{ marginTop: 30 }}>
            <Text style={{
              textAlign: 'center',
              color: '#555',
              marginBottom: 15
            }}>
              O continúa con
            </Text>

            {/* Google Login */}
            <Button
              icon="google"
              mode="contained"
              disabled={!request}
              onPress={() => promptAsync()}
              style={{
                marginBottom: 10,
                padding: 5,
                backgroundColor: '#ef5350',
                borderRadius: 10,
              }}
            >
              Iniciar sesión con Google
            </Button>

            {/* Apple Login */}
            {AppleAuthentication.isAvailableAsync() && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={10}
                style={{ width: '100%', height: 50 }}
                onPress={async () => {
                  try {
                    const credential = await AppleAuthentication.signInAsync({
                      requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                      ],
                    });
                    Alert.alert("Apple Login", "Inicio de sesión exitoso con Apple ✅");
                    router.push("pantalla-principal");
                  } catch (e) {
                    if (e.code === 'ERR_CANCELED') {
                      Alert.alert("Cancelado", "Inicio de sesión cancelado");
                    } else {
                      Alert.alert("Error", "No se pudo iniciar sesión con Apple");
                    }
                  }
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: MD3LightTheme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  }
});