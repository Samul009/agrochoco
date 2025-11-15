// inicio-sesion.jsx
import React, { useState } from 'react';
import { ScrollView, View, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiRequest } from '../config/api';

export default function InicioSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const theme = useTheme();

  // Validar datos de inicio de sesión con MySQL
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

    try {
      // Hacer petición a la API
      const data = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          clave: password
        }),
      });

      // Login exitoso - Guardar usuario y token en AsyncStorage
      const { token, ...usuarioData } = data;
      
      await AsyncStorage.setItem('usuarioLogueado', JSON.stringify(usuarioData));
      
      // Guardar el token por separado para el interceptor
      if (token) {
        await AsyncStorage.setItem('token', token);
        console.log('🔑 Token guardado en AsyncStorage');
      }

      setIsLoading(false);

      // Verificar el rol del usuario para redirigir según corresponda
      const rol = (data.rol || '').toLowerCase().trim();
      const esAdministrador = rol === 'administrador';

      if (esAdministrador) {
        // Si es administrador, redirigir al panel de administración
        Alert.alert(
          'Bienvenido Administrador',
          `¡Hola ${data.nombre}!\nAccediendo al panel de administración.`,
          [{ 
            text: 'Continuar', 
            onPress: () => router.replace('/admin-panel')
          }]
        );
      } else {
        // Si es usuario normal, redirigir a novedades
        Alert.alert(
          'Bienvenido',
          `¡Hola ${data.nombre}!\n`,
          [{ 
            text: 'Continuar', 
            onPress: () => router.replace('/novedades')
          }]
        );
      }

    } catch (error) {
      setIsLoading(false);

      if (__DEV__) {
        console.error('Error en login:', error);
      }

      if (error.status === 401) {
        Alert.alert('Error', 'Correo o contraseña incorrectos.');
      } else if (error.status === 400) {
        Alert.alert('Error', error.message || 'Datos inválidos.');
      } else if (error.status === 0) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica:\n\n1. Que el servidor esté corriendo (node server.js)\n2. Tu conexión a internet\n3. Que ambos dispositivos estén en la misma red'
        );
      } else {
        Alert.alert('Error', error.message || 'Ocurrió un error inesperado.');
      }
    }
  };

  return (
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
              backgroundColor: '#2e7d32',
              borderRadius: 10,
            }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}
          >
            {isLoading ? 'Validando...' : 'Iniciar sesión'}
          </Button>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  }
});