// app/admin-panel.jsx - Panel principal de administración
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DrawerMenu from './drawer-menu';
import Header from './header';
import Footer from './footer';

const { width } = Dimensions.get('window');

const TABLAS = [
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    icon: 'people',
    color: '#4CAF50',
    descripcion: 'Gestionar usuarios del sistema',
  },
  {
    id: 'productos',
    nombre: 'Productos',
    icon: 'basket',
    color: '#2196F3',
    descripcion: 'Gestionar productos agrícolas',
  },
  {
    id: 'categorias',
    nombre: 'Categorías',
    icon: 'grid',
    color: '#FF9800',
    descripcion: 'Gestionar categorías de productos',
  },
  {
    id: 'roles',
    nombre: 'Roles',
    icon: 'shield',
    color: '#9C27B0',
    descripcion: 'Gestionar roles del sistema',
  },
  {
    id: 'novedades',
    nombre: 'Novedades',
    icon: 'newspaper',
    color: '#F44336',
    descripcion: 'Gestionar novedades y noticias',
  },
  {
    id: 'productores-productos',
    nombre: 'Productores-Productos',
    icon: 'leaf',
    color: '#00BCD4',
    descripcion: 'Gestionar relación productores-productos',
  },
  {
    id: 'producto-vistas',
    nombre: 'Vistas de Productos',
    icon: 'eye',
    color: '#795548',
    descripcion: 'Ver estadísticas de vistas',
  },
  {
    id: 'novedad-lecturas',
    nombre: 'Lecturas de Novedades',
    icon: 'book',
    color: '#607D8B',
    descripcion: 'Ver estadísticas de lecturas',
  },
];

export default function AdminPanel() {
  const router = useRouter();

  const handleNavigate = (route, params = {}) => {
    if (route.startsWith('/')) {
      router.push({ pathname: route, params });
    } else {
      router.push(route);
    }
  };

  const navigateToTable = (tablaId) => {
    router.push(`/admin-crud/${tablaId}`);
  };

  return (
    <DrawerMenu onNavigate={handleNavigate}>
      {({ openDrawer }) => (
        <View style={styles.container}>
          <Header onMenuPress={openDrawer} title="Panel de Administración" />

          <ScrollView style={styles.content}>
            <View style={styles.headerSection}>
              <Text style={styles.welcomeText}>Bienvenido Administrador</Text>
              <Text style={styles.subtitleText}>
                Gestiona todas las tablas de la base de datos
              </Text>
            </View>

            <View style={styles.gridContainer}>
              {TABLAS.map((tabla) => (
                <TouchableOpacity
                  key={tabla.id}
                  style={[styles.tableCard, { borderLeftColor: tabla.color }]}
                  onPress={() => navigateToTable(tabla.id)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${tabla.color}20` }]}>
                    <Ionicons name={tabla.icon} size={32} color={tabla.color} />
                  </View>
                  <Text style={styles.tableName}>{tabla.nombre}</Text>
                  <Text style={styles.tableDescription}>{tabla.descripcion}</Text>
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color={tabla.color} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoSection}>
              <Ionicons name="information-circle" size={20} color="#666" />
              <Text style={styles.infoText}>
                Selecciona una tabla para ver, crear, editar o eliminar registros
              </Text>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>

          <Footer 
            currentScreen="productos"
            onNavigate={(route) => router.push(route)}
          />
        </View>
      )}
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#2e7d32',
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  gridContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tableDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#856404',
  },
  bottomSpacing: {
    height: 20,
  },
});

