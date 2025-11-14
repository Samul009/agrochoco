// drawer-menu.jsx
import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Modal, StyleSheet, Text, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { List, Divider, Avatar } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';

export default function DrawerMenu({ 
  children, 
  onNavigate, 
  notifications = [],
  onNotificationsUpdate
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [usuarioRol, setUsuarioRol] = useState("usuario");

  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.leida).length;
    
    if (__DEV__ && count > 0) {
      console.log("DrawerMenu - Notificaciones totales:", notifications.length);
      console.log("DrawerMenu - No leídas:", count);
    }
    
    return count;
  }, [notifications]);

  // Cargar usuario al montar el componente
  useEffect(() => {
    cargarUsuario();
  }, []);

  // SOLUCIÓN: Recargar usuario cada vez que el drawer se abre
  useEffect(() => {
    if (isDrawerOpen) {
      cargarUsuario();
    }
  }, [isDrawerOpen]);

  const cargarUsuario = async () => {
    try {
      const usuarioLogueado = await AsyncStorage.getItem("usuarioLogueado");
      
      if (__DEV__) {
        console.log("=== Cargando usuario en DrawerMenu ===");
        console.log("Usuario raw:", usuarioLogueado);
      }
      
      if (usuarioLogueado) {
        const userData = JSON.parse(usuarioLogueado);
        
        if (__DEV__) {
          console.log("Usuario parseado:", userData);
          console.log("Rol detectado:", userData.rol);
          console.log("Tipo usuario:", userData.tipo_usuario);
          console.log("Tipo:", userData.tipo);
        }
        
        setUsuario(userData);
        
        // Determinar el rol con prioridad correcta y normalizar a minúsculas
        const rolRaw = userData.rol || userData.tipo_usuario || userData.tipo || "usuario";
        const rol = rolRaw.toLowerCase().trim();
        
        if (__DEV__) {
          console.log("Rol raw:", rolRaw);
          console.log("Rol normalizado:", rol);
        }
        
        setUsuarioRol(rol);
      } else {
        if (__DEV__) {
          console.log("No hay usuario logueado");
        }
        setUsuario(null);
        setUsuarioRol("usuario");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error cargando usuario:", error);
      }
      setUsuario(null);
      setUsuarioRol("usuario");
    }
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleNavigate = (route, params = {}) => {
    closeDrawer();
    onNavigate(route, params);
  };

  const handleNotificaciones = () => {
    handleNavigate("/notificaciones", {
      notifications,
      onNotificationsUpdate
    });
  };

  const handleMetricas = () => {
    if (__DEV__) {
      console.log("=== handleMetricas ===");
      console.log("Usuario rol:", usuarioRol);
      console.log("Usuario completo:", usuario);
    }
    
    if (usuarioRol === "administrador") {
      handleNavigate("/metricas-admin");
    } else {
      handleNavigate("/mi-actividad");
    }
  };

  const handlePerfil = () => {
    if (usuario?.id) {
      handleNavigate(`/perfil-usuario/${usuario.id}`);
    }
  };

  const handleCerrarSesion = () => {
    closeDrawer();
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('usuarioLogueado');
              await AsyncStorage.removeItem('token');
              setUsuario(null);
              setUsuarioRol("usuario");
              handleNavigate('/inicio-sesion');
            } catch (error) {
              console.error('Error cerrando sesión:', error);
            }
          },
        },
      ]
    );
  };

  const CustomBadge = React.memo(({ count }) => {
    if (!count || count === 0) return null;
    
    return (
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      </View>
    );
  });

  // Items del menú principal
  const menuItemsPrincipal = useMemo(() => [
    {
      icon: "home",
      title: "Inicio",
      onPress: () => handleNavigate("/novedades"),
    },
    {
      icon: "newspaper",
      title: "Novedades",
      onPress: () => handleNavigate("/novedades"),
    },
    {
      icon: "basket",
      title: "Productos",
      onPress: () => handleNavigate("/productos"),
    },
  ], []);

  // Items del usuario autenticado
  const menuItemsUsuario = useMemo(() => {
    if (!usuario) return [];

    if (__DEV__) {
      console.log("=== Generando menuItemsUsuario ===");
      console.log("Usuario rol:", usuarioRol);
    }

    const items = [
      {
        icon: "account",
        title: "Mi Perfil",
        description: usuario.nombre || usuario.email,
        onPress: handlePerfil,
      },
      {
        icon: "bell",
        title: "Notificaciones",
        onPress: handleNotificaciones,
        badge: unreadCount,
      },
    ];

    // Agregar métricas según el rol
    if (usuarioRol === "administrador") {
      if (__DEV__) {
        console.log("✅ Agregando métricas de ADMINISTRADOR");
      }
      items.push({
        icon: "chart-line",
        title: "Métricas y Análisis",
        description: "Panel de administración",
        onPress: handleMetricas,
        color: "#ff6f00",
        adminOnly: true,
      });
    } else {
      if (__DEV__) {
        console.log("ℹ️ Agregando métricas de USUARIO");
      }
      items.push({
        icon: "chart-box",
        title: "Mi Actividad",
        description: "Historial y logros",
        onPress: handleMetricas,
      });
    }

    items.push({
      icon: "cog",
      title: "Configuración",
      onPress: () => handleNavigate("/configuracion"),
    });

    return items;
  }, [usuario, usuarioRol, unreadCount]);

  // Items adicionales de administrador
  const menuItemsAdmin = useMemo(() => {
    if (usuarioRol !== "administrador") {
      if (__DEV__) {
        console.log("❌ NO es administrador, menuItemsAdmin vacío");
      }
      return [];
    }

    if (__DEV__) {
      console.log("✅ ES administrador, generando menuItemsAdmin");
    }

    return [
      {
        icon: "people",
        title: "Gestión de Usuarios",
        description: "Administrar usuarios",
        onPress: () => {
          Alert.alert('Próximamente', 'Esta función estará disponible pronto');
          closeDrawer();
        },
      },
      {
        icon: "create",
        title: "Publicar Novedad",
        description: "Crear nueva publicación",
        onPress: () => handleNavigate("/formulario-novedad"),
      },
    ];
  }, [usuarioRol]);

  // Debug log para verificar el estado actual
  if (__DEV__ && isDrawerOpen) {
    console.log("=== Estado del Drawer ===");
    console.log("Usuario:", usuario?.nombre);
    console.log("Rol:", usuarioRol);
    console.log("Es admin?", usuarioRol === "administrador");
    console.log("Items admin:", menuItemsAdmin.length);
  }

  return (
    <>
      {children({ openDrawer })}

      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="slide"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlay}
            onPress={closeDrawer}
            activeOpacity={1}
          />

          <View style={styles.drawerContainer}>
            <ScrollView style={styles.scrollView}>
              {/* Header con información del usuario */}
              {usuario ? (
                <View style={styles.userHeader}>
                  <Avatar.Text
                    size={64}
                    label={usuario.nombre ? usuario.nombre.substring(0, 2).toUpperCase() : 'U'}
                    style={styles.avatar}
                  />
                  <Text style={styles.userName}>{usuario.nombre || 'Usuario'}</Text>
                  <Text style={styles.userEmail}>{usuario.email || ''}</Text>
                  
                  {/* Badge de rol */}
                  <View style={[
                    styles.roleBadge,
                    usuarioRol === 'administrador' && styles.roleBadgeAdmin
                  ]}>
                    <Ionicons 
                      name={usuarioRol === 'administrador' ? 'shield-checkmark' : 'person'} 
                      size={14} 
                      color="white" 
                    />
                    <Text style={styles.roleText}>
                      {usuarioRol === 'administrador' ? 'Administrador' : 'Usuario'}
                    </Text>
                  </View>

                  {/* Contador de notificaciones en header */}
                  {unreadCount > 0 && (
                    <View style={styles.headerNotificationBadge}>
                      <Ionicons name="notifications" size={16} color="white" />
                      <Text style={styles.headerNotificationText}>
                        {unreadCount} {unreadCount === 1 ? 'notificación' : 'notificaciones'} nueva{unreadCount === 1 ? '' : 's'}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.guestHeader}>
                  <Avatar.Icon size={64} icon="account" style={styles.avatar} />
                  <Text style={styles.userName}>Invitado</Text>
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => handleNavigate('/inicio-sesion')}
                  >
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Divider style={styles.divider} />

              {/* Menú Principal */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MENÚ PRINCIPAL</Text>
                {menuItemsPrincipal.map((item, index) => (
                  <View key={index} style={styles.menuItemContainer}>
                    <List.Item
                      title={item.title}
                      description={item.description}
                      titleStyle={styles.itemTitle}
                      descriptionStyle={styles.itemDescription}
                      left={(p) => (
                        <List.Icon {...p} icon={item.icon} color="#2e7d32" />
                      )}
                      onPress={item.onPress}
                      style={styles.listItem}
                    />
                    <CustomBadge count={item.badge} />
                  </View>
                ))}
              </View>

              {/* Menú de Usuario (solo si está logueado) */}
              {usuario && menuItemsUsuario.length > 0 && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MI CUENTA</Text>
                    {menuItemsUsuario.map((item, index) => (
                      <View key={index} style={styles.menuItemContainer}>
                        <List.Item
                          title={item.title}
                          description={item.description}
                          titleStyle={[
                            styles.itemTitle,
                            item.adminOnly && styles.itemTitleAdmin
                          ]}
                          descriptionStyle={styles.itemDescription}
                          left={(p) => (
                            <List.Icon 
                              {...p} 
                              icon={item.icon}
                              color={item.color || (item.adminOnly ? '#ff6f00' : '#2e7d32')}
                            />
                          )}
                          onPress={item.onPress}
                          style={[
                            styles.listItem,
                            item.adminOnly && styles.listItemAdmin
                          ]}
                        />
                        <CustomBadge count={item.badge} />
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Menú de Administrador */}
              {menuItemsAdmin.length > 0 && (
                <>
                  <Divider style={styles.divider} />
                  <View style={[styles.section, styles.adminSection]}>
                    <View style={styles.adminSectionHeader}>
                      <Ionicons name="shield-checkmark" size={18} color="#ff6f00" />
                      <Text style={styles.adminSectionTitle}>PANEL ADMINISTRATIVO</Text>
                    </View>
                    {menuItemsAdmin.map((item, index) => (
                      <View key={index} style={styles.menuItemContainer}>
                        <List.Item
                          title={item.title}
                          description={item.description}
                          titleStyle={styles.itemTitleAdmin}
                          descriptionStyle={styles.itemDescription}
                          left={(p) => (
                            <List.Icon {...p} icon={item.icon} color="#ff6f00" />
                          )}
                          onPress={item.onPress}
                          style={styles.listItem}
                        />
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Opciones para invitados */}
              {!usuario && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.section}>
                    <List.Item
                      title="Registrarse"
                      description="Crear una cuenta nueva"
                      titleStyle={styles.itemTitle}
                      descriptionStyle={styles.itemDescription}
                      left={(p) => (
                        <List.Icon {...p} icon="account-plus" color="#1976d2" />
                      )}
                      onPress={() => handleNavigate('/formulario-registro')}
                      style={styles.listItem}
                    />
                  </View>
                </>
              )}

              {/* Botón de cerrar sesión */}
              {usuario && (
                <>
                  <Divider style={styles.divider} />
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleCerrarSesion}
                  >
                    <Ionicons name="log-out" size={24} color="#d32f2f" />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>AgroLocal v1.0.0</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row-reverse",
  },
  overlay: {
    flex: 0.3,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawerContainer: {
    flex: 0.7,
    backgroundColor: "white",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  userHeader: {
    backgroundColor: "#2e7d32",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  guestHeader: {
    backgroundColor: "#2e7d32",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#1b5e20",
    marginBottom: 12,
  },
  userName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 8,
  },
  roleBadgeAdmin: {
    backgroundColor: "#ff6f00",
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  headerNotificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff5722",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  headerNotificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  loginButtonText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    marginVertical: 8,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  adminSection: {
    backgroundColor: "#fff8f0",
  },
  adminSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  adminSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff6f00",
    letterSpacing: 0.5,
  },
  menuItemContainer: {
    position: "relative",
  },
  listItem: {
    paddingRight: 60,
  },
  listItemAdmin: {
    backgroundColor: "transparent",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  itemTitleAdmin: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6f00",
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
  },
  badgeContainer: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "#ff1744",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 16,
  },
  footerText: {
    color: "#999",
    fontSize: 12,
  },
});