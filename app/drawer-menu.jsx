import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Modal, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { List, Badge } from "react-native-paper";

export default function DrawerMenu({ 
  children, 
  onNavigate, 
  notifications = [],
  onNotificationsUpdate // Actualizar notificaciones
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  // Usar useMemo para calcular las no leídas solo cuando cambien las notificaciones
  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.leida).length;
    
    // Solo hacer log cuando hay cambios significativos o en desarrollo
    if (__DEV__ && count > 0) {
      console.log("DrawerMenu - Notificaciones totales:", notifications.length);
      console.log("DrawerMenu - No leídas:", count);
    }
    
    return count;
  }, [notifications]);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuarioLogueado = await AsyncStorage.getItem("usuarioLogueado");
        if (usuarioLogueado) {
          const userData = JSON.parse(usuarioLogueado);
          setUsuarioId(userData.id);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error cargando usuario:", error);
        }
      }
    };
    cargarUsuario();
  }, []); // Solo ejecutar una vez

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleNavigate = (route, params = {}) => {
    closeDrawer();
    onNavigate(route, params);
  };

  const handlePerfil = () => {
    if (usuarioId) {
      handleNavigate(`/perfil-usuario/${usuarioId}`);
    } else {
      if (__DEV__) {
        console.log("No hay usuario logueado");
      }
    }
  };

  const handleNotificaciones = () => {
    handleNavigate("/notificaciones", {
      notifications,
      onNotificationsUpdate // Pasar las notificaciones y el callback
    });
  };

  // Componente de badge personalizado memoizado
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

  // Memoizar los items del menú para evitar recrearlos en cada render
  const menuItems = useMemo(() => [
    {
      icon: "account",
      title: "Perfil",
      onPress: handlePerfil,
    },
    {
      icon: "account-group",
      title: "Comunidad",
      onPress: () => handleNavigate("/comunidad"),
    },
    {
      icon: "bell",
      title: "Notificaciones",
      onPress: handleNotificaciones,
      badge: unreadCount, 
    },
    {
      icon: "cog",
      title: "Configuración",
      onPress: () => handleNavigate("/configuracion"),
    },
    {
      icon: "credit-card",
      title: "Cuenta",
      onPress: () => handleNavigate("/cuenta"),
    },
  ], [usuarioId, unreadCount]); // Solo recrear cuando cambie el usuario o las notificaciones

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
            <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40 }}>
              {/* Header del menú con contador total */}
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Menú</Text>
                {unreadCount > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{unreadCount} nuevas</Text>
                  </View>
                )}
              </View>
              
              {menuItems.map((item, index) => (
                <View key={index} style={styles.menuItemContainer}>
                  <List.Item
                    title={item.title}
                    left={(p) => <List.Icon {...p} icon={item.icon} />}
                    onPress={item.onPress}
                    style={styles.listItem}
                  />
                  {/* Badge personalizado */}
                  <CustomBadge count={item.badge} />
                </View>
              ))}
            </View>
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
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 8,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2e7d32",
  },
  headerBadge: {
    backgroundColor: "#ff5722",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  menuItemContainer: {
    position: "relative",
  },
  listItem: {
    paddingRight: 60, // Espacio para el badge
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
});