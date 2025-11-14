// editar-perfil/[id].jsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Avatar, TextInput, Button, Snackbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS, apiRequest } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditarPerfil() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para los campos editables
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [mensaje, setMensaje] = useState("");
  const [visible, setVisible] = useState(false);

  // Obtener datos del usuario desde MySQL
  useEffect(() => {
    const idUsuario = Array.isArray(id) ? id[0] : id;

    const fetchUsuario = async () => {
      try {
        const data = await apiRequest(API_ENDPOINTS.USUARIO_BY_ID(idUsuario));
        setUsuario(data);
        
        // Cargar los datos en los estados
        setNombre(data.nombre || '');
        setEmail(data.email || '');
        setTelefono(data.telefono || '');
        setDireccion(data.direccion || '');
      } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        showMessage("No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id]);

  const showMessage = (msg) => {
    setMensaje(msg);
    setVisible(true);
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!nombre.trim()) {
      showMessage("El nombre es obligatorio");
      return;
    }

    if (!email.trim()) {
      showMessage("El email es obligatorio");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("El email no es válido");
      return;
    }

    setGuardando(true);

    try {
      const idUsuario = Array.isArray(id) ? id[0] : id;
      
      // Datos a actualizar (sin incluir el rol)
      const datosActualizados = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
      };

      // Realizar la petición PUT al servidor
      const response = await fetch(`${API_ENDPOINTS.USUARIO_BY_ID(idUsuario)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      const resultado = await response.json();

      // Actualizar AsyncStorage con los nuevos datos
      const usuarioActualizado = {
        id: idUsuario,
        ...datosActualizados
      };
      
      await AsyncStorage.setItem('usuarioLogueado', JSON.stringify(usuarioActualizado));

      showMessage("✅ Perfil actualizado correctamente");
      
      // Esperar 2 segundos y volver
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      showMessage("Error al actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.loadingText}>Usuario no encontrado</Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Volver
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar.Text 
            size={80} 
            label={nombre ? nombre.charAt(0).toUpperCase() : "?"} 
            style={styles.avatar} 
            color="#2e7d32" 
          />
          <Text style={styles.avatarLabel}>Editando perfil de {usuario.nombre}</Text>
        </View>

        {/* Formulario de edición */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Ionicons name="person" size={20} color="#2e7d32" />
              <Text style={styles.inputLabel}>Nombre completo</Text>
            </View>
            <TextInput
              mode="outlined"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingresa tu nombre completo"
              style={styles.input}
              outlineColor="#ddd"
              activeOutlineColor="#2e7d32"
              disabled={guardando}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Ionicons name="mail" size={20} color="#2e7d32" />
              <Text style={styles.inputLabel}>Correo electrónico</Text>
            </View>
            <TextInput
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineColor="#ddd"
              activeOutlineColor="#2e7d32"
              disabled={guardando}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Ionicons name="call" size={20} color="#2e7d32" />
              <Text style={styles.inputLabel}>Teléfono (opcional)</Text>
            </View>
            <TextInput
              mode="outlined"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Ingresa tu teléfono"
              keyboardType="phone-pad"
              style={styles.input}
              outlineColor="#ddd"
              activeOutlineColor="#2e7d32"
              disabled={guardando}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Ionicons name="home" size={20} color="#2e7d32" />
              <Text style={styles.inputLabel}>Dirección (opcional)</Text>
            </View>
            <TextInput
              mode="outlined"
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ingresa tu dirección"
              style={styles.input}
              outlineColor="#ddd"
              activeOutlineColor="#2e7d32"
              multiline
              numberOfLines={2}
              disabled={guardando}
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleGuardar}
              style={styles.saveButton}
              labelStyle={styles.saveButtonText}
              disabled={guardando}
              loading={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}
              disabled={guardando}
            >
              Cancelar
            </Button>
          </View>

          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={16} color="#666" />
            <Text style={styles.noteText}>
              Los cambios se guardarán en tu perfil de usuario.
            </Text>
          </View>
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
          labelStyle: { color: '#2e7d32' }
        }}
      >
        <Text style={styles.snackbarText}>{mensaje}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
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
  backButtonHeader: { 
    marginRight: 16 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: '600' 
  },
  content: { 
    flex: 1 
  },
  avatarSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    elevation: 2,
  },
  avatar: { 
    backgroundColor: '#f0f9f0', 
    marginBottom: 8 
  },
  avatarLabel: { 
    fontSize: 16, 
    color: '#666', 
    fontWeight: '500' 
  },
  formContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noteText: { 
    fontSize: 12, 
    color: '#666', 
    marginLeft: 8, 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
  },
  snackbar: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  snackbarText: {
    color: '#333',
  },
});