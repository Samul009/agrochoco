// app/novedad-detalle/[id].jsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Image, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Divider, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export default function NovedadDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [novedad, setNovedad] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      // Cargar usuario logueado
      const usuarioData = await AsyncStorage.getItem('usuarioLogueado');
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData));
      }

      // Cargar novedad
      const idNovedad = Array.isArray(id) ? id[0] : id;
      const data = await apiRequest(API_ENDPOINTS.NOVEDAD_BY_ID(idNovedad));
      setNovedad(data);
    } catch (error) {
      console.error('Error cargando novedad:', error);
    } finally {
      setLoading(false);
    }
  };

  const compartirNovedad = async () => {
    try {
      await Share.share({
        message: `${novedad.titulo}\n\n${novedad.descripcion}\n\nCompartido desde AgroChoco`,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const editarNovedad = () => {
    router.push({
      pathname: '/formulario-novedad',
      params: {
        id: novedad.id,
        titulo: novedad.titulo,
        descripcion: novedad.descripcion,
        imagen: novedad.imagen,
        isEdit: 'true'
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando novedad...</Text>
      </View>
    );
  }

  if (!novedad) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Novedad no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'Administrador';
  const fechaFormateada = new Date(novedad.fecha_creacion).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalle de Novedad',
          headerStyle: { backgroundColor: '#2e7d32' },
          headerTintColor: '#fff',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="share-variant"
                iconColor="#fff"
                size={24}
                onPress={compartirNovedad}
              />
              {esAdmin && (
                <IconButton
                  icon="pencil"
                  iconColor="#fff"
                  size={24}
                  onPress={editarNovedad}
                />
              )}
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          {!imageError && novedad.imagen && (novedad.imagen.startsWith('http') || novedad.imagen.startsWith('data:image')) ? (
            <Image
              source={{ uri: novedad.imagen }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#999" />
              <Text style={styles.imagePlaceholderText}>
                {novedad.imagen && !imageError ? 'Error cargando imagen' : 'Sin imagen'}
              </Text>
              {novedad.imagen && !imageError && (
                <Text style={styles.imageErrorText}>
                  La URL de la imagen no es válida o no está disponible
                </Text>
              )}
            </View>
          )}
          {novedad.autor_nombre && (
            <View style={styles.authorBadge}>
              <Ionicons name="person-circle" size={16} color="#fff" />
              <Text style={styles.authorText}>{novedad.autor_nombre}</Text>
            </View>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>{novedad.titulo}</Text>

          {/* Metadata */}
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metadataText}>{fechaFormateada}</Text>
            </View>
            {novedad.autor_email && (
              <View style={styles.metadataItem}>
                <Ionicons name="mail-outline" size={16} color="#666" />
                <Text style={styles.metadataText}>{novedad.autor_email}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Descripción completa */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{novedad.descripcion}</Text>
          </View>

          {/* Tags/Chips informativos */}
          <View style={styles.tagsContainer}>
            <Chip icon="tag" mode="outlined" style={styles.chip}>
              Novedad Agrícola
            </Chip>
            <Chip icon="eye" mode="outlined" style={styles.chip}>
              ID: {novedad.id}
            </Chip>
          </View>

          {/* Sección de información adicional */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={20} color="#2e7d32" />
                <Text style={styles.infoTitle}>Información adicional</Text>
              </View>
              <Text style={styles.infoText}>
                Esta novedad ha sido publicada por el equipo de AgroChoco para mantener
                informados a los productores y empresas del sector agropecuario sobre
                las últimas novedades, precios, rutas y oportunidades comerciales.
              </Text>
            </Card.Content>
          </Card>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={compartirNovedad}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Compartir</Text>
            </TouchableOpacity>
            
            {esAdmin && (
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={editarNovedad}>
                <Ionicons name="create" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  imageErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#d32f2f',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  authorBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  authorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 32,
  },
  metadata: {
    gap: 8,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: '#f0f9f0',
  },
  infoCard: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    elevation: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#1976d2',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});