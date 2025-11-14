// app/novedades-lista.jsx
import React, { useState } from "react";
import { ScrollView, RefreshControl, Alert, View, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, Menu } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NovedadesList({ novedades, esAdmin, onDelete, onEdit, onRefresh }) {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const openMenu = (id) => setMenuVisible({ ...menuVisible, [id]: true });
  const closeMenu = (id) => setMenuVisible({ ...menuVisible, [id]: false });

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const confirmarEliminacion = (novedad) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar "${novedad.titulo}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => {
            closeMenu(novedad.id);
            onDelete(novedad.id);
          },
          style: "destructive"
        }
      ]
    );
  };

  // Navegar al detalle de la novedad
  const verDetalle = (novedadId) => {
    router.push(`/novedad-detalle/${novedadId}`);
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#2e7d32"]}
        />
      }
    >
      {novedades.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="newspaper-outline" size={64} color="#ccc" />
          <Text style={{ color: '#666', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
            No hay novedades disponibles
          </Text>
        </View>
      ) : (
        novedades.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            activeOpacity={0.7}
            onPress={() => verDetalle(item.id)}
          >
            <Card style={{ margin: 10, borderRadius: 12, elevation: 2 }}>
              <Card.Cover 
                source={{ uri: item.imagen || 'https://via.placeholder.com/400x200?text=Sin+Imagen' }} 
                style={{ height: 180 }} 
              />
              <Card.Content>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginTop: 12 
                }}>
                  <Text 
                    variant="titleLarge" 
                    style={{ 
                      fontWeight: "bold", 
                      flex: 1,
                      color: '#1a1a1a'
                    }}
                    numberOfLines={2}
                  >
                    {item.titulo}
                  </Text>
                  
                  {/* Menú de opciones solo para administradores */}
                  {esAdmin && (
                    <Menu
                      visible={menuVisible[item.id] || false}
                      onDismiss={() => closeMenu(item.id)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={24}
                          onPress={(e) => {
                            e.stopPropagation();
                            openMenu(item.id);
                          }}
                        />
                      }
                    >
                      <Menu.Item
                        leadingIcon="eye"
                        onPress={() => {
                          closeMenu(item.id);
                          verDetalle(item.id);
                        }}
                        title="Ver detalle"
                      />
                      <Menu.Item
                        leadingIcon="pencil"
                        onPress={() => {
                          closeMenu(item.id);
                          onEdit(item);
                        }}
                        title="Editar"
                      />
                      <Menu.Item
                        leadingIcon="delete"
                        onPress={() => confirmarEliminacion(item)}
                        title="Eliminar"
                        titleStyle={{ color: '#d32f2f' }}
                      />
                    </Menu>
                  )}
                </View>
                
                <Text 
                  variant="bodyMedium" 
                  style={{ marginTop: 8, color: "#555", lineHeight: 20 }}
                  numberOfLines={3}
                >
                  {item.descripcion}
                </Text>
                
                {/* Footer con fecha y autor */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: '#f0f0f0'
                }}>
                  {item.fecha_creacion && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="calendar-outline" size={14} color="#999" />
                      <Text variant="bodySmall" style={{ color: "#999" }}>
                        {new Date(item.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                  )}
                  
                  {item.autor_nombre && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="person-circle-outline" size={14} color="#999" />
                      <Text variant="bodySmall" style={{ color: "#999" }}>
                        {item.autor_nombre}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Botón para ver más */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginTop: 12,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: '#f0f0f0'
                }}>
                  <Text style={{ color: '#2e7d32', fontWeight: '600', fontSize: 14 }}>
                    Ver más detalles
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#2e7d32" style={{ marginLeft: 4 }} />
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      )}
      
      {/* Espaciado inferior */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}