import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, List, Switch, Button, Snackbar, Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tema oscuro personalizado
const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121420',
    surface: '#1e1e2e',
    primary: '#bb86fc', 
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    text: '#ffffff', 
    outline: '#64748b',
    onSurfaceVariant: '#9ca3af',
  },
};

export default function Configuracion() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const router = useRouter();
  

  const { colors, dark } = customDarkTheme;

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
        console.error('Error cargando configuraciones:', error);
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
      console.error('Error guardando notificaciones:', error);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogueado');
      router.replace('/app');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      router.replace('/app');
    }
  };

  const handleCuenta = () => {
    if (usuarioId) {
      router.push(`/perfil-usuario/${usuarioId}`);
    } else {
      setMensaje("Error: No se encontró usuario logueado");
      setVisible(true);
    }
  };

  return (
    <PaperProvider theme={customDarkTheme}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 20, paddingTop: 60 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ position: 'absolute', top: 30, left: 20, zIndex: 1 }}
          >
            <AntDesign name="arrowleft" size={28} color={colors.text} />
          </TouchableOpacity>

          <Text
            variant="headlineLarge"
            style={{ 
              fontWeight: 'bold', 
              marginBottom: 20, 
              color: colors.text,
              textAlign: 'center',
              marginTop: 20 
            }}
          >
            Configuración
          </Text>

          <List.Section style={{ 
            backgroundColor: colors.surface, 
            borderRadius: 10, 
            overflow: 'hidden' 
          }}>
            <List.Item
              title="Cuenta"
              titleStyle={{ color: colors.text }}
              left={props => <List.Icon {...props} icon="account" color={colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
              onPress={handleCuenta}
              style={{ borderBottomWidth: 1, borderBottomColor: colors.outline }}
            />
            <List.Item
              title="Notificaciones"
              titleStyle={{ color: colors.text }}
              left={props => <List.Icon {...props} icon="bell" color={colors.primary} />}
              right={() => (
                <Switch
                  value={isNotificationsEnabled}
                  onValueChange={toggleNotifications}
                  color={colors.primary}
                  thumbColor={isNotificationsEnabled ? colors.primary : colors.outline}
                  trackColor={{ false: colors.outline, true: colors.primary }}
                />
              )}
              onPress={toggleNotifications}
              style={{ borderBottomWidth: 1, borderBottomColor: colors.outline }}
            />
            <List.Item
              title="Privacidad"
              titleStyle={{ color: colors.text }}
              left={props => <List.Icon {...props} icon="shield-account" color={colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
              onPress={() => {
                setMensaje("Función en desarrollo");
                setVisible(true);
              }}
              style={{ borderBottomWidth: 1, borderBottomColor: colors.outline }}
            />
            <List.Item
              title="Seguridad"
              titleStyle={{ color: colors.text }}
              left={props => <List.Icon {...props} icon="security" color={colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
              onPress={() => {
                setMensaje("Función en desarrollo");
                setVisible(true);
              }}
              style={{ borderBottomWidth: 1, borderBottomColor: colors.outline }}
            />
            <List.Item
              title="Ayuda"
              titleStyle={{ color: colors.text }}
              left={props => <List.Icon {...props} icon="help-circle" color={colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
              onPress={() => {
                setMensaje("Función en desarrollo");
                setVisible(true);
              }}
            />
          </List.Section>

          <Button
            mode="text"
            onPress={handleCerrarSesion}
            labelStyle={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}
            style={{ marginTop: 30, alignSelf: 'center' }}
          >
            Cerrar sesión
          </Button>

          {__DEV__ && usuarioId && (
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 10, fontSize: 12 }}>
              DEBUG: Usuario ID = {usuarioId}
            </Text>
          )}
        </View>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={2000}
          style={{ backgroundColor: colors.surface }}
          action={{
            label: 'OK',
            onPress: () => setVisible(false),
          }}
        >
          <Text style={{ color: colors.text }}>{mensaje}</Text>
        </Snackbar>
      </ScrollView>
    </PaperProvider>
  );
}