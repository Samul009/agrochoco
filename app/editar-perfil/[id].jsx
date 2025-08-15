import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import usuariosData from '../../usuarios.json';

export default function EditarPerfil() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, dark } = useTheme();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const idStr = Array.isArray(id) ? id[0] : id;
    const encontrado = usuariosData.find(u => String(u.id) === String(idStr));
    setUsuario(encontrado ?? null);
  }, [id]);

  if (!usuario) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Cargando usuario...</Text>
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

        {/* Título */}
        <Text variant="headlineLarge" style={{ 
          color: colors.text, 
          fontWeight: 'bold', 
          marginBottom: 30, 
          textAlign: 'center',
          marginTop: 20 
        }}>
          Información del Usuario
        </Text>

        {/* Perfil */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Avatar.Icon
            size={100}
            icon="account"
            style={{ backgroundColor: dark ? '#555' : '#e0e0e0', marginBottom: 10 }}
            color={dark ? 'white' : 'black'}
          />
        </View>

        {/* Información completa del usuario */}
        <List.Section style={{
          backgroundColor: dark ? '#1e1e1e' : 'white',
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          <List.Item
            title="ID"
            description={String(usuario.id)}
            left={props => <List.Icon {...props} icon="identifier" color={colors.primary} />}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.text }}
            style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
          />

          <List.Item
            title="Nombre completo"
            description={usuario.nombre}
            left={props => <List.Icon {...props} icon="account" color={colors.primary} />}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.text }}
            style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
          />

          <List.Item
            title="Correo electrónico"
            description={usuario.email}
            left={props => <List.Icon {...props} icon="email" color={colors.primary} />}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.text }}
            style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
          />

          {usuario.telefono && (
            <List.Item
              title="Teléfono"
              description={usuario.telefono}
              left={props => <List.Icon {...props} icon="phone" color={colors.primary} />}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.text }}
              style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
            />
          )}

          {usuario.direccion && (
            <List.Item
              title="Dirección"
              description={usuario.direccion}
              left={props => <List.Icon {...props} icon="home" color={colors.primary} />}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.text }}
              style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
            />
          )}

          {usuario.edad && (
            <List.Item
              title="Edad"
              description={`${usuario.edad} años`}
              left={props => <List.Icon {...props} icon="calendar" color={colors.primary} />}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.text }}
              style={{ borderBottomWidth: 1, borderBottomColor: dark ? '#333' : '#f0f0f0' }}
            />
          )}

          {usuario.ciudad && (
            <List.Item
              title="Ciudad"
              description={usuario.ciudad}
              left={props => <List.Icon {...props} icon="city" color={colors.primary} />}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.text }}
            />
          )}
        </List.Section>
      </View>
    </ScrollView>
  );
}
