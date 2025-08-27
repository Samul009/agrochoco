import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Avatar, List } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import usuariosData from '../../usuarios.json';

export default function EditarPerfil() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const idStr = Array.isArray(id) ? id[0] : id;
    const encontrado = usuariosData.find(u => String(u.id) === String(idStr));
    setUsuario(encontrado ?? null);
  }, [id]);

  if (!usuario) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando usuario...</Text>
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
        <Text style={styles.headerTitle}>Información del Usuario</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={styles.avatar}
            color="#2e7d32"
          />
          <Text style={styles.avatarLabel}>Información de {usuario.nombre}</Text>
        </View>


        {/* Información del usuario */}
        <View style={styles.infoContainer}>
          <List.Section style={styles.listSection}>
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="finger-print" size={20} color="#2e7d32" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID de Usuario</Text>
                <Text style={styles.infoValue}>{String(usuario.id)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={20} color="#2e7d32" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                <Text style={styles.infoValue}>{usuario.nombre}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={20} color="#2e7d32" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{usuario.email}</Text>
              </View>
            </View>

            {usuario.telefono && (
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="call" size={20} color="#2e7d32" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{usuario.telefono}</Text>
                </View>
              </View>
            )}

            {usuario.direccion && (
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="home" size={20} color="#2e7d32" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{usuario.direccion}</Text>
                </View>
              </View>
            )}

            {usuario.edad && (
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar" size={20} color="#2e7d32" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Edad</Text>
                  <Text style={styles.infoValue}>{usuario.edad} años</Text>
                </View>
              </View>
            )}

            {usuario.ciudad && (
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="location" size={20} color="#2e7d32" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ciudad</Text>
                  <Text style={styles.infoValue}>{usuario.ciudad}</Text>
                </View>
              </View>
            )}
          </List.Section>

          {/* Botón de editar */}
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar información</Text>
          </TouchableOpacity>

          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={16} color="#666" />
            <Text style={styles.noteText}>
              Esta información se puede actualizar desde tu perfil de usuario
            </Text>
          </View>
        </View>
      </ScrollView>
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
  avatarSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  avatar: {
    backgroundColor: '#f0f9f0',
    marginBottom: 8,
  },
  avatarLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoContainer: {
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
    paddingVertical: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#f0f9f0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
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
  },
});