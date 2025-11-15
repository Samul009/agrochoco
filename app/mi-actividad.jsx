// mi-actividad.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const { width } = Dimensions.get('window');

export default function MiActividad() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);
  const [miActividad, setMiActividad] = useState({
    productosActivos: 0,
    productosVistos: 0,
    novedadesLeidas: 0,
    diasActivo: 0,
    actividadSemanal: [],
    categoriasInteres: [],
    ultimaActividad: null
  });

  // Simula la carga inicial
  useEffect(() => {
    cargarUsuarioYActividad();
  }, []);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log("↩️ No hay pantalla anterior a la que volver");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarUsuarioYActividad();
  };

  const cargarUsuarioYActividad = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar usuario real desde AsyncStorage
      const usuarioLogueado = await AsyncStorage.getItem('usuarioLogueado');
      if (!usuarioLogueado) {
        setError('Debes iniciar sesión para ver tu actividad');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(usuarioLogueado);
      console.log('👤 Usuario cargado:', userData.nombre);
      setUsuario(userData);

      if (!userData.id) {
        setError('Error: Usuario sin ID');
        setLoading(false);
        return;
      }

      await cargarActividadSimulada(userData.id);
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      setError('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Función que obtiene datos reales del backend
  const cargarActividadSimulada = async (usuarioId) => {
    try {
      console.log(`📊 Cargando actividad real para usuario ${usuarioId}`);
      
      const response = await apiRequest(API_ENDPOINTS.METRICAS_USUARIO(usuarioId), {
        method: 'GET'
      });

      if (response.success && response.data) {
        setMiActividad(response.data);
        console.log('✅ Actividad cargada exitosamente:', response.data);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error cargando actividad:', error);
      setError('No se pudieron cargar las métricas. Usando datos por defecto.');
      
      // Datos por defecto en caso de error
      setMiActividad({
        productosActivos: 0,
        productosVistos: 0,
        novedadesLeidas: 0,
        diasActivo: 0,
        actividadSemanal: [
          { dia: 'Lun', vistas: 0 },
          { dia: 'Mar', vistas: 0 },
          { dia: 'Mié', vistas: 0 },
          { dia: 'Jue', vistas: 0 },
          { dia: 'Vie', vistas: 0 },
          { dia: 'Sáb', vistas: 0 },
          { dia: 'Dom', vistas: 0 }
        ],
        categoriasInteres: [],
        ultimaActividad: new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando actividad...</Text>
      </View>
    );
  }

  const maxVistas = Math.max(...miActividad.actividadSemanal.map(d => d.vistas), 1);
  const maxInteres = Math.max(...miActividad.categoriasInteres.map(c => c.interes), 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Actividad</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
        }
      >
        {/* Saludo personalizado */}
        {usuario && (
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Hola, {usuario.nombre}! 👋</Text>
            <Text style={styles.greetingSubtext}>
              Aquí está tu resumen de actividad en AgroLocal
            </Text>
          </View>
        )}

        {/* Cards de resumen */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <View style={styles.statIcon}>
              <Ionicons name="eye" size={28} color="#2e7d32" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{miActividad.productosVistos}</Text>
              <Text style={styles.statLabel}>Productos vistos</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statSecondary]}>
            <View style={styles.statIcon}>
              <Ionicons name="newspaper" size={28} color="#1976d2" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{miActividad.novedadesLeidas}</Text>
              <Text style={styles.statLabel}>Novedades leídas</Text>
            </View>
          </View>
        </View>

        {/* Racha de actividad */}
        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={40} color="#ff6f00" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{miActividad.diasActivo} días</Text>
            <Text style={styles.streakLabel}>Racha de actividad</Text>
          </View>
          <TouchableOpacity style={styles.streakButton}>
            <Ionicons name="trophy" size={24} color="#ff6f00" />
          </TouchableOpacity>
        </View>

        {/* Actividad semanal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Actividad Esta Semana</Text>
          <View style={styles.chartContainer}>
            {miActividad.actividadSemanal.map((dia, i) => (
              <View key={i} style={styles.barItem}>
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { height: Math.max((dia.vistas / maxVistas) * 100, 10) }
                  ]} />
                </View>
                <Text style={styles.barValue}>{dia.vistas}</Text>
                <Text style={styles.barLabel}>{dia.dia}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus Categorías Favoritas</Text>
          {miActividad.categoriasInteres.map((cat, i) => (
            <View key={i} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{cat.categoria}</Text>
              <View style={styles.categoryBarContainer}>
                <View style={[
                  styles.categoryBar,
                  { width: `${(cat.interes / maxInteres) * 100}%` }
                ]} />
              </View>
              <Text style={styles.categoryValue}>{cat.interes}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.footerText}>
            Datos actualizados: {new Date(miActividad.ultimaActividad).toLocaleDateString('es-CO')}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#d32f2f',
    fontSize: 14,
  },
  greetingContainer: {
    backgroundColor: '#2e7d32',
    padding: 20,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statPrimary: {
    backgroundColor: '#e8f5e9',
  },
  statSecondary: {
    backgroundColor: '#e3f2fd',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  producerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  producerIcon: {
    marginRight: 12,
  },
  producerInfo: {
    flex: 1,
  },
  producerNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  producerLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  streakIcon: {
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginVertical: 12,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: 30,
    backgroundColor: '#2e7d32',
    borderRadius: 4,
    minHeight: 10,
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  chartDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  categoryBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#2e7d32',
    borderRadius: 10,
  },
  categoryValue: {
    width: 30,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItem: {
    flex: 1,
    alignItems: 'center',
  },
  achievementBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeGold: {
    backgroundColor: '#ffd700',
  },
  badgeSilver: {
    backgroundColor: '#c0c0c0',
  },
  badgeBronze: {
    backgroundColor: '#cd7f32',
  },
  badgeGray: {
    backgroundColor: '#bdbdbd',
  },
  achievementName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6f00',
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  recommendationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});
