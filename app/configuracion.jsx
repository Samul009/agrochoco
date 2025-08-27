import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, List, Switch, Snackbar, Dialog, Portal, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Configuracion() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false); // Estado para el diálogo
  const router = useRouter();

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const valorNotif = await AsyncStorage.getItem('notificaciones');
        if (valorNotif !== null) {
          setIsNotificationsEnabled(valorNotif === 'true');
        }

        const usuarioLogueado = await AsyncStorage.getItem('usuarioLogueado');
        if (usuarioLogueado) {
          const userData = JSON.parse(usuarioLogueado);
          setUsuarioId(userData.id);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error cargando configuraciones:', error);
        }
      }
    };
    cargarConfig();
  }, []);

  const toggleNotifications = async () => {
    try {
      const nuevoEstado = !isNotificationsEnabled;
      setIsNotificationsEnabled(nuevoEstado);
      await AsyncStorage.setItem('notificaciones', nuevoEstado.toString());
      setMensaje(nuevoEstado ? "Notificaciones activadas ✅" : "Notificaciones desactivadas 🚫");
      setVisible(true);
    } catch (error) {
      if (__DEV__) {
        console.error('Error guardando notificaciones:', error);
      }
    }
  };

  // Función para mostrar el diálogo de confirmación
  const mostrarDialogoCerrarSesion = () => {
    setDialogVisible(true);
  };

  // Función para ocultar el diálogo
  const ocultarDialogo = () => {
    setDialogVisible(false);
  };

  // Función para confirmar el cierre de sesión
  const confirmarCerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogueado');
      setDialogVisible(false);
      router.replace('/inicio-sesion');
    } catch (error) {
      if (__DEV__) {
        console.error('Error cerrando sesión:', error);
      }
      setDialogVisible(false);
      router.replace('/inicio-sesion');
    }
  };

  const handleCuenta = async () => {
    try {
      // Obtener directamente de AsyncStorage en lugar de usar el estado
      const usuarioLogueado = await AsyncStorage.getItem('usuarioLogueado');
      
      if (usuarioLogueado) {
        const userData = JSON.parse(usuarioLogueado);
        
        if (userData.id) {
          router.push(`/perfil-usuario/${userData.id}`);
        } else {
          setMensaje("Error: ID de usuario no encontrado");
          setVisible(true);
        }
      } else {
        setMensaje("Error: No hay usuario logueado");
        setVisible(true);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error obteniendo datos del usuario:', error);
      }
      setMensaje("Error al cargar datos del usuario");
      setVisible(true);
    }
  };

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
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <List.Section style={styles.listSection}>
            <List.Item
              title="Mi Cuenta"
              description="Gestiona tu perfil y datos personales"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <View style={styles.iconContainer}>
                  <Ionicons name="person" size={24} color="#2e7d32" />
                </View>
              )}
              right={props => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={handleCuenta}
              style={styles.listItem}
            />
            
            <List.Item
              title="Notificaciones"
              description={isNotificationsEnabled ? "Activadas" : "Desactivadas"}
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications" size={24} color="#2e7d32" />
                </View>
              )}
              right={() => (
                <Switch
                  value={isNotificationsEnabled}
                  onValueChange={toggleNotifications}
                  color="#4caf50"
                  thumbColor={isNotificationsEnabled ? "#4caf50" : "#ccc"}
                  trackColor={{ false: "#e0e0e0", true: "#c8e6c9" }}
                />
              )}
              onPress={toggleNotifications}
              style={styles.listItem}
            />
            
            <List.Item
              title="Privacidad"
              description="Controla tu información personal"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark" size={24} color="#2e7d32" />
                </View>
              )}
              right={props => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={() => {
                setMensaje("Función en desarrollo");
                setVisible(true);
              }}
              style={styles.listItem}
            />
            
            <List.Item
              title="Seguridad"
              description="Configuración de seguridad"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={24} color="#2e7d32" />
                </View>
              )}
              right={props => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={() => {
                setMensaje("Función en desarrollo");
                setVisible(true);
              }}
              style={styles.listItem}
            />
            
            <List.Item
              title="Ayuda y Soporte"
              description="Obtén ayuda y soporte técnico"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <View style={styles.iconContainer}>
                  <Ionicons name="help-circle" size={24} color="#2e7d32" />
                </View>
              )}
              right={props => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={() => {
                setMensaje("Función en desarrollo");
                setVisible(true);
              }}
              style={styles.listItem}
            />
          </List.Section>

          <View style={styles.logoutContainer}>
            <TouchableOpacity
              onPress={mostrarDialogoCerrarSesion}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={24} color="#f44336" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Portal para el diálogo de confirmación */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={ocultarDialogo} style={styles.dialog}>
          <Dialog.Icon icon="logout" size={40} />
          <Dialog.Title style={styles.dialogTitle}>Cerrar Sesión</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              ¿Estás seguro de que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={ocultarDialogo}
              mode="outlined"
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}
            >
              Cancelar
            </Button>
            <Button
              onPress={confirmarCerrarSesion}
              mode="contained"
              style={styles.confirmButton}
              labelStyle={styles.confirmButtonText}
            >
              Cerrar Sesión
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  menuContainer: {
    padding: 16,
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
  logoutContainer: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
    marginLeft: 8,
  },
  // Estilos para el diálogo
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  dialogContent: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderColor: '#ddd',
    borderWidth: 1,
    marginRight: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#f44336',
    marginLeft: 8,
    flex: 1,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  snackbar: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  snackbarText: {
    color: '#333',
  },
});