import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar, List, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import usuariosData from '../../usuarios.json'; 

export default function PerfilUsuario() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, dark } = useTheme();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ID recibido:', id);
    const idStr = Array.isArray(id) ? id[0] : id;
    const encontrado = usuariosData.find(u => String(u.id) === String(idStr));
    console.log('Usuario encontrado:', encontrado);
    setUsuario(encontrado ?? null);
    setLoading(false);
  }, [id]);

  const handleCerrarSesion = () => {
    // Navega a la pantalla principal
    router.replace('/app'); 
  };

  const handleEditarPerfil = () => {
    // Navega a editar perfil pasando el ID del usuario
    router.push(`/editar-perfil/${usuario.id}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Cargando...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, marginBottom: 20 }}>Usuario no encontrado</Text>
        <Button mode="outlined" onPress={() => router.back()}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, paddingTop: 60 }}>
        {/* Botón de retroceso */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ position: 'absolute', top: 30, left: 20, zIndex: 1 }}
        >
          <AntDesign name="arrowleft" size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Sección del perfil - DATOS DINÁMICOS */}
        <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 20 }}>
          <Avatar.Icon
            size={120}
            icon="account"
            style={{ backgroundColor: dark ? '#555' : '#e0e0e0', marginBottom: 10 }}
            color={dark ? 'white' : 'black'}
          />
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 5, color: colors.text }}>
            {usuario.nombre}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.text }}>
            {usuario.email}
          </Text>
        </View>

        {/* Lista de opciones */}
        <List.Section style={{
          backgroundColor: dark ? '#1e1e1e' : 'white',
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          <List.Item
            title="Editar perfil"
            left={props => <List.Icon {...props} icon="file-document-edit-outline" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
            onPress={handleEditarPerfil}
            titleStyle={{ color: colors.text }}
            style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
          />

          <List.Item
            title="Notificaciones"
            left={props => <List.Icon {...props} icon="bell-outline" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
            onPress={() => console.log('Navegar a Notificaciones')}
            titleStyle={{ color: colors.text }}
            style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
          />

          <List.Item
            title="Configuración"
            left={props => <List.Icon {...props} icon="cog-outline" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
            onPress={() => console.log('Navegar a Configuración')}
            titleStyle={{ color: colors.text }}
            style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
          />

          <List.Item
            title="Ayuda"
            left={props => <List.Icon {...props} icon="help-circle-outline" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
            onPress={() => console.log('Navegar a Ayuda')}
            titleStyle={{ color: colors.text }}
          />
        </List.Section>

        {/* Cerrar sesión */}
        <Button
          mode="text"
          onPress={handleCerrarSesion}
          labelStyle={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}
          style={{ marginTop: 30, alignSelf: 'center' }}
        >
          Cerrar sesión
        </Button>
      </View>
    </ScrollView>
  );
}