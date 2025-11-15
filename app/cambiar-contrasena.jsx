// app/cambiar-contrasena.jsx - Pantalla para cambiar contraseña
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiRequest } from '../config/api';

export default function CambiarContrasena() {
  const router = useRouter();
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [visible, setVisible] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  React.useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuarioLogueado = await AsyncStorage.getItem('usuarioLogueado');
        if (usuarioLogueado) {
          const userData = JSON.parse(usuarioLogueado);
          setUsuarioId(userData.id);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      }
    };
    cargarUsuario();
  }, []);

  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setVisible(true);
  };

  const validarYGuardar = async () => {
    if (!passwordActual.trim()) {
      mostrarMensaje('Por favor ingresa tu contraseña actual');
      return;
    }

    if (!passwordNueva.trim()) {
      mostrarMensaje('Por favor ingresa tu nueva contraseña');
      return;
    }

    if (passwordNueva.length < 6) {
      mostrarMensaje('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      mostrarMensaje('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordActual === passwordNueva) {
      mostrarMensaje('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    // Verificar contraseña actual antes de cambiar
    try {
      setCargando(true);
      
      // Primero verificar que la contraseña actual sea correcta
      const emailUsuario = await AsyncStorage.getItem('usuarioLogueado');
      if (!emailUsuario) {
        mostrarMensaje('Error: No se encontró información del usuario');
        return;
      }

      // Actualizar usando endpoint específico que verifica la contraseña actual
      if (!usuarioId) {
        mostrarMensaje('Error: No se encontró el ID del usuario');
        setCargando(false);
        return;
      }

      // Usar el endpoint específico para cambiar contraseña
      const response = await apiRequest(`${API_ENDPOINTS.USUARIO_BY_ID(usuarioId)}/cambiar-contrasena`, {
        method: 'POST',
        body: JSON.stringify({
          passwordActual: passwordActual,
          passwordNueva: passwordNueva
        }),
      });

      if (response) {
        Alert.alert(
          '✅ Contraseña actualizada',
          'Tu contraseña ha sido cambiada exitosamente. Por favor inicia sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Cerrar sesión y volver a login
                await AsyncStorage.removeItem('usuarioLogueado');
                await AsyncStorage.removeItem('token');
                router.replace('/inicio-sesion');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      mostrarMensaje(error.message || 'Error al cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña.
          </Text>

          {/* Contraseña Actual */}
          <TextInput
            label="Contraseña Actual"
            value={passwordActual}
            onChangeText={setPasswordActual}
            mode="outlined"
            secureTextEntry={!mostrarActual}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={mostrarActual ? "eye-off" : "eye"}
                onPress={() => setMostrarActual(!mostrarActual)}
              />
            }
          />

          {/* Nueva Contraseña */}
          <TextInput
            label="Nueva Contraseña"
            value={passwordNueva}
            onChangeText={setPasswordNueva}
            mode="outlined"
            secureTextEntry={!mostrarNueva}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={mostrarNueva ? "eye-off" : "eye"}
                onPress={() => setMostrarNueva(!mostrarNueva)}
              />
            }
            placeholder="Mínimo 6 caracteres"
          />

          {/* Confirmar Nueva Contraseña */}
          <TextInput
            label="Confirmar Nueva Contraseña"
            value={passwordConfirmar}
            onChangeText={setPasswordConfirmar}
            mode="outlined"
            secureTextEntry={!mostrarConfirmar}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={mostrarConfirmar ? "eye-off" : "eye"}
                onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
              />
            }
          />

          {/* Botón Guardar */}
          <Button
            mode="contained"
            onPress={validarYGuardar}
            loading={cargando}
            disabled={cargando}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {cargando ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: 'OK',
          onPress: () => setVisible(false),
        }}
      >
        {mensaje}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#2e7d32',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  snackbar: {
    marginBottom: 16,
  },
});

