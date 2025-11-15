// app/novedades-lista.jsx
import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl, Alert, View, TouchableOpacity, Image } from "react-native";
import { Card, Text, IconButton, Menu } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NovedadesList({ novedades, esAdmin, onDelete, onEdit, onRefresh }) {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  // Debug: verificar imágenes cuando cambian las novedades
  useEffect(() => {
    novedades.forEach(novedad => {
      if (novedad.imagen) {
        const esBase64 = novedad.imagen.startsWith('data:image');
        const esUrl = novedad.imagen.startsWith('http');
        console.log(`📸 Novedad ${novedad.id}:`, {
          tieneImagen: !!novedad.imagen,
          tipo: esBase64 ? 'BASE64' : esUrl ? 'URL' : 'OTRO',
          longitud: novedad.imagen.length,
          preview: novedad.imagen.substring(0, 50) + '...'
        });
      }
    });
  }, [novedades]);

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
              {(() => {
                // Función helper para verificar si es una imagen válida
                const imagenUrl = item.imagen ? item.imagen.trim() : null;
                const tieneImagenValida = imagenUrl && 
                  (imagenUrl.startsWith('http://') || 
                   imagenUrl.startsWith('https://') || 
                   imagenUrl.startsWith('data:image'));
                
                // Log para debugging
                if (imagenUrl && !tieneImagenValida) {
                  console.log('⚠️ Novedad', item.id, 'tiene imagen pero formato no válido:', imagenUrl.substring(0, 50));
                }
                
                if (!imageErrors[item.id] && tieneImagenValida) {
                  // Para imágenes base64, asegurarse de que el formato sea correcto
                  let uriFinal = imagenUrl;
                  if (imagenUrl.startsWith('data:image')) {
                    // Asegurarse de que no haya espacios o caracteres extraños
                    uriFinal = imagenUrl.trim();
                    // Si el formato base64 tiene problemas, intentar repararlo
                    if (!uriFinal.includes(';base64,')) {
                      uriFinal = uriFinal.replace(/^data:image\/([^;]+);/, 'data:image/$1;base64,');
                    }
                  }
                  
                  return (
                    <Image
                      key={`image-${item.id}-${imageErrors[item.id] ? 'error' : 'ok'}`}
                      source={{ uri: uriFinal }}
                      style={{ height: 180, width: '100%', backgroundColor: '#f0f0f0' }}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('❌ Error cargando imagen para novedad', item.id);
                        console.log('❌ URI length:', uriFinal?.length);
                        console.log('❌ URI preview:', uriFinal?.substring(0, 100));
                        console.log('❌ Tipo:', uriFinal?.startsWith('data:image') ? 'BASE64' : 'URL');
                        console.log('❌ Error details:', error.nativeEvent);
                        setImageErrors(prev => ({ ...prev, [item.id]: true }));
                      }}
                      onLoadStart={() => {
                        console.log('🔄 Iniciando carga de imagen para novedad', item.id);
                        console.log('🔄 Tipo:', uriFinal?.startsWith('data:image') ? 'BASE64' : 'URL');
                        console.log('🔄 Longitud:', uriFinal?.length);
                      }}
                      onLoad={() => {
                        console.log('✅ Imagen cargada correctamente para novedad', item.id);
                      }}
                    />
                  );
                } else {
                  return (
                    <View style={{ 
                      height: 180, 
                      backgroundColor: '#e0e0e0', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}>
                      <Ionicons name="image-outline" size={48} color="#999" />
                      <Text style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                        {tieneImagenValida && imageErrors[item.id] 
                          ? 'Error cargando' 
                          : 'Sin imagen'}
                      </Text>
                      {imagenUrl && !tieneImagenValida && (
                        <Text style={{ marginTop: 4, color: '#ff9800', fontSize: 10 }}>
                          Formato no válido
                        </Text>
                      )}
                    </View>
                  );
                }
              })()}
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