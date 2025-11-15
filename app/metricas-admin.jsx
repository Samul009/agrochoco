import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const { width } = Dimensions.get('window');

export default function MetricasAdmin() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [metricas, setMetricas] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalProductos: 0,
    totalNovedades: 0,
    actividadReciente: {},
    productosCategoria: [],
    novedadesMes: [],
    ultimaActualizacion: null,
  });

  useEffect(() => {
    cargarAdminYMetricas();
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
    await cargarAdminYMetricas();
  };

  const cargarAdminYMetricas = async () => {
    try {
      setLoading(true);

      // Cargar usuario logueado desde AsyncStorage
      const usuarioData = await AsyncStorage.getItem('usuarioLogueado');
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        console.log('👨‍💼 Usuario cargado:', usuario.nombre);
        setAdmin(usuario);
      }

      // Cargar métricas reales desde el backend
      await cargarMetricasReales();
    } catch (error) {
      console.error('❌ Error cargando admin:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las métricas. Verifica tu conexión al servidor.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para cargar métricas reales desde el backend
  const cargarMetricasReales = async () => {
    try {
      console.log("📊 Cargando métricas del administrador desde el servidor...");

      const response = await apiRequest(API_ENDPOINTS.METRICAS_ADMIN, {
        method: 'GET',
      });

      if (response.success && response.data) {
        const data = response.data;
        
        // Formatear las métricas para el componente
        const metricasFormateadas = {
          totalUsuarios: data.totalUsuarios || 0,
          usuariosActivos: data.usuariosActivos || 0,
          totalProductos: data.totalProductos || 0,
          totalNovedades: data.totalNovedades || 0,
          actividadReciente: {
            vistasProductos: data.actividadReciente?.vistasProductos || 0,
            lecturasNovedades: data.actividadReciente?.lecturasNovedades || 0,
            registrosNuevos: data.actividadReciente?.registrosNuevos || 0,
          },
          productosCategoria: data.productosCategoria || [],
          novedadesMes: data.novedadesMes || [],
          ultimaActualizacion: new Date().toISOString(),
        };

        console.log('✅ Métricas cargadas exitosamente:', metricasFormateadas);
        setMetricas(metricasFormateadas);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error cargando métricas:', error);
      // Si falla, mostrar datos vacíos en lugar de datos simulados
      setMetricas({
        totalUsuarios: 0,
        usuariosActivos: 0,
        totalProductos: 0,
        totalNovedades: 0,
        actividadReciente: {
          vistasProductos: 0,
          lecturasNovedades: 0,
          registrosNuevos: 0,
        },
        productosCategoria: [],
        novedadesMes: [],
        ultimaActualizacion: new Date().toISOString(),
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando métricas...</Text>
      </View>
    );
  }

  const maxProductos = metricas.productosCategoria.length > 0 
    ? Math.max(...metricas.productosCategoria.map(p => p.cantidad), 1) 
    : 1;
  const maxNovedades = metricas.novedadesMes.length > 0 
    ? Math.max(...metricas.novedadesMes.map(n => n.cantidad), 1) 
    : 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backIconButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        {/* Saludo al admin */}
        {admin && (
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Bienvenido, {admin.nombre} 👋</Text>
            <Text style={styles.greetingSubtext}>Resumen general del sistema AgroLocal</Text>
          </View>
        )}

        {/* Tarjetas de resumen */}
        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.cardGreen]}>
            <Ionicons name="people" size={40} color="#4CAF50" />
            <Text style={styles.cardNumber}>{metricas.totalUsuarios}</Text>
            <Text style={styles.cardLabel}>Usuarios Totales</Text>
            <Text style={styles.cardSubLabel}>{metricas.usuariosActivos} activos</Text>
          </View>

          <View style={[styles.card, styles.cardBlue]}>
            <Ionicons name="basket" size={40} color="#2196F3" />
            <Text style={styles.cardNumber}>{metricas.totalProductos}</Text>
            <Text style={styles.cardLabel}>Productos</Text>
            <Text style={styles.cardSubLabel}>En catálogo</Text>
          </View>

          <View style={[styles.card, styles.cardOrange]}>
            <Ionicons name="newspaper" size={40} color="#FF9800" />
            <Text style={styles.cardNumber}>{metricas.totalNovedades}</Text>
            <Text style={styles.cardLabel}>Novedades</Text>
            <Text style={styles.cardSubLabel}>Publicadas</Text>
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>

          <View style={styles.activityItem}>
            <Ionicons name="eye" size={24} color="#4CAF50" style={styles.activityIcon} />
            <Text style={styles.activityText}>
              Vistas de productos: <Text style={styles.activityValue}>{metricas.actividadReciente.vistasProductos}</Text>
            </Text>
          </View>

          <View style={styles.activityItem}>
            <Ionicons name="book" size={24} color="#2196F3" style={styles.activityIcon} />
            <Text style={styles.activityText}>
              Lecturas de novedades: <Text style={styles.activityValue}>{metricas.actividadReciente.lecturasNovedades}</Text>
            </Text>
          </View>

          <View style={styles.activityItem}>
            <Ionicons name="person-add" size={24} color="#FF9800" style={styles.activityIcon} />
            <Text style={styles.activityText}>
              Nuevos usuarios (30d): <Text style={styles.activityValue}>{metricas.actividadReciente.registrosNuevos}</Text>
            </Text>
          </View>
        </View>

        {/* Distribución de Productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
          {metricas.productosCategoria.map((cat, i) => (
            <View key={i} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{cat.categoria}</Text>
              <View style={styles.categoryBarContainer}>
                <View style={[styles.categoryBar, { width: `${(cat.cantidad / maxProductos) * 100}%` }]} />
              </View>
              <Text style={styles.categoryValue}>{cat.cantidad}</Text>
            </View>
          ))}
        </View>

        {/* Novedades por Mes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Novedades por Mes</Text>
          <View style={styles.chartContainer}>
            {metricas.novedadesMes.map((mes, i) => (
              <View key={i} style={styles.chartItem}>
                <View style={[styles.chartBar, { height: Math.max((mes.cantidad / maxNovedades) * 100, 10) }]} />
                <Text style={styles.chartLabel}>{mes.mes}</Text>
                <Text style={styles.chartValue}>{mes.cantidad}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.footerText}>
            Última actualización: {new Date(metricas.ultimaActualizacion).toLocaleDateString('es-CO')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// === Estilos ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backIconButton: { padding: 8 },
  refreshButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  greetingContainer: { backgroundColor: '#2e7d32', padding: 20, marginBottom: 16 },
  greetingText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  greetingSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 20,
    flexWrap: 'wrap',
  },
  card: {
    width: (width - 45) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  cardGreen: { borderTopWidth: 4, borderTopColor: '#2e7d32' },
  cardBlue: { borderTopWidth: 4, borderTopColor: '#2196F3' },
  cardOrange: { borderTopWidth: 4, borderTopColor: '#FF9800' },
  cardNumber: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  cardLabel: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 5 },
  cardSubLabel: { fontSize: 10, color: '#999', marginTop: 2 },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  activityIcon: { marginRight: 10 },
  activityText: { fontSize: 14, color: '#555' },
  activityValue: { fontWeight: 'bold', color: '#000' },
  categoryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  categoryName: { width: 100, fontSize: 14, color: '#666' },
  categoryBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  categoryBar: { height: '100%', backgroundColor: '#2e7d32' },
  categoryValue: { width: 40, textAlign: 'right', fontWeight: 'bold' },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  chartItem: { alignItems: 'center' },
  chartBar: { width: 40, backgroundColor: '#2e7d32', borderRadius: 8, minHeight: 10 },
  chartLabel: { fontSize: 12, color: '#666', marginTop: 8 },
  chartValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, gap: 8 },
  footerText: { fontSize: 12, color: '#666' },
});
