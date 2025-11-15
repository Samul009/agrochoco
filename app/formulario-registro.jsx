// app/formulario-registro.jsx
import React, { useState } from 'react';
import { ScrollView, View, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, Button, PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiRequest } from '../config/api';

export default function FormularioRegistro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  // Validar email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validar contraseña
  const isValidPassword = (password) => password.length >= 6;

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !direccion.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Campos vacíos', 'Por favor completa todos los campos.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // Enviar datos al backend
      const data = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          clave: password,
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          rol: 'usuario' // valor por defecto
        }),
      });

      setIsLoading(false);

      // NO guardar usuario ni token automáticamente después del registro
      // El usuario debe iniciar sesión manualmente

      Alert.alert(
        '¡Registro exitoso!',
        `Tu cuenta ha sido creada correctamente. Por favor inicia sesión para continuar.`,
        [{ 
          text: 'Iniciar sesión', 
          onPress: () => router.replace('/inicio-sesion')
        }]
      );

      // Limpiar campos
      setNombre('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      setIsLoading(false);
      console.error('Error en registro:', error);

      if (error.status === 409) {
        Alert.alert('Email en uso', 'Este correo electrónico ya está registrado.');
      } else if (error.status === 400) {
        Alert.alert('Error', error.message || 'Datos inválidos.');
      } else if (error.status === 0) {
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
      } else {
        Alert.alert('Error', error.message || 'No se pudo completar el registro.');
      }
    }
  };

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack.Screen
        options={{
          title: 'Crear cuenta',
          headerStyle: { backgroundColor: '#2e7d32' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text
            variant="headlineMedium"
            style={{
              paddingBottom: 30,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#000',
            }}
          >
            REGISTRO
          </Text>

          {/* Nombre */}
          <TextInput
            label="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            mode="outlined"
            style={{ marginBottom: 15 }}
            autoCapitalize="words"
          />

          {/* Email */}
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={{ marginBottom: 15 }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Teléfono */}
          <TextInput
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            mode="outlined"
            style={{ marginBottom: 15 }}
            keyboardType="phone-pad"
          />

          {/* Dirección */}
          <TextInput
            label="Dirección"
            value={direccion}
            onChangeText={setDireccion}
            mode="outlined"
            style={{ marginBottom: 15 }}
          />

          {/* Contraseña */}
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!passwordVisible}
            style={{ marginBottom: 15 }}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye-off" : "eye"}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
          />

          {/* Confirmar Contraseña */}
          <TextInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!confirmPasswordVisible}
            style={{ marginBottom: 25 }}
            right={
              <TextInput.Icon
                icon={confirmPasswordVisible ? "eye-off" : "eye"}
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleRegister}
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
            {isLoading ? 'Registrando...' : 'Crear cuenta'}
          </Button>

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#555' }}>¿Ya tienes una cuenta?</Text>
            <Button onPress={() => router.back()} mode="text" labelStyle={{ color: '#1976d2' }}>
              Iniciar sesión
            </Button>
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
  },
});
