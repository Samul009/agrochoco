// perfil-usuario/[id].jsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Avatar, List, Snackbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export default function PerfilUsuario() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const idUsuario = Array.isArray(id) ? id[0] : id;
        const data = await apiRequest(API_ENDPOINTS.USUARIO_BY_ID(idUsuario));
        setUsuario(data);
      } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        showMessage("No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id]);

  const handleCerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogueado');
      await AsyncStorage.removeItem('token');
      router.replace('/inicio-sesion');
    } catch (error) {
      if (__DEV__) {
        console.error('Error cerrando sesión:', error);
      }
      router.replace('/inicio-sesion');
    }
  };

  const handleEditarPerfil = () => {
    if (usuario && usuario.id) {
      router.push(`/editar-perfil/${usuario.id}`);
    }
  };

  const handleConfiguracion = () => {
    router.push('/configuracion');
  };

  const showMessage = (msg) => {
    setMensaje(msg);
    setVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" style={styles.errorIcon} />
        <Text style={styles.errorTitle}>Usuario no encontrado</Text>
        <Text style={styles.errorMessage}>No se pudo cargar la información del usuario</Text>
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToHomeText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección del perfil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={100} 
              label={usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?"} 
              style={styles.avatar} 
              color="#2e7d32"
            />
            
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#2e7d32" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{usuario.nombre}</Text>
          <Text style={styles.userEmail}>{usuario.email}</Text>
          
          {usuario.telefono && (
            <View style={styles.contactInfo}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.contactText}>{usuario.telefono}</Text>
            </View>
          )}
          
          {usuario.direccion && (
            <View style={styles.contactInfo}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.contactText}>{usuario.direccion}</Text>
            </View>
          )}
        </View>

        {/* Opciones del menú */}
        <View style={styles.menuContainer}>
          <List.Section style={styles.listSection}>
            <List.Item
              title="Editar perfil"
              description="Actualiza tu información personal"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <View style={styles.iconContainer}>
                  <Ionicons name="create" size={24} color="#2e7d32" />
                </View>
              )}
              right={props => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={handleEditarPerfil}
              style={styles.listItem}
            />
          </List.Section>
        </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  profileSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#f0f9f0',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  listSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f9f0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 32,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToHomeButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToHomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  snackbar: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  snackbarText: {
    color: '#333',
  },
});