import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Appbar, Badge, SegmentedButtons, List, TouchableRipple, Snackbar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Notificaciones() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Recibir notificaciones desde parámetros o usar mock por defecto
  const initialNotifications = params.notifications ? 
    JSON.parse(params.notifications) : 
    [
      { id: "1", titulo: "Nueva oferta", mensaje: "AgroTrade tiene un nuevo precio de compra", leida: false },
      { id: "2", titulo: "Ruta de comercio", mensaje: "Fresh Foods busca maíz en tu región", leida: false },
      { id: "3", titulo: "Actualización", mensaje: "Tu perfil fue actualizado correctamente", leida: true },
    ];

  const [filtro, setFiltro] = useState("todas");
  const [notificaciones, setNotificaciones] = useState(initialNotifications);
  const [snackbar, setSnackbar] = useState("");

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === "no-leidas") return !n.leida;
    if (filtro === "archivadas") return n.archivada;
    return true; // todas
  });

  // Función para actualizar notificaciones en el componente padre
  const actualizarNotificacionesPadre = (nuevasNotificaciones) => {
    if (params.onNotificationsUpdate) {
      // Si hay callback del padre, enviamos las notificaciones actualizadas
      params.onNotificationsUpdate(nuevasNotificaciones);
    }
  };

  // Marcar una notificación como leída al abrirla
  const abrirNotificacion = (notificacion) => {
    if (!notificacion.leida) {
      const nuevasNotificaciones = notificaciones.map(n => 
        n.id === notificacion.id ? { ...n, leida: true } : n
      );
      setNotificaciones(nuevasNotificaciones);
      actualizarNotificacionesPadre(nuevasNotificaciones);
    }
    setSnackbar(`Abriste: ${notificacion.titulo}`);
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = () => {
    const nuevasNotificaciones = notificaciones.map(n => ({ ...n, leida: true }));
    setNotificaciones(nuevasNotificaciones);
    actualizarNotificacionesPadre(nuevasNotificaciones);
    setSnackbar("Todas las notificaciones fueron marcadas como leídas");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: "#2e7d32" }}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content title="Notificaciones" color="#fff" />
        {noLeidas > 0 && (
          <View style={{ marginRight: 16 }}>
            <Badge style={{ backgroundColor: "red" }}>{noLeidas}</Badge>
          </View>
        )}
      </Appbar.Header>

      {/* Filtros */}
      <View style={styles.segmentedContainer}>
        <SegmentedButtons
          value={filtro}
          onValueChange={setFiltro}
          buttons={[
            { value: "todas", label: `Todas (${notificaciones.length})` },
            { value: "no-leidas", label: `No leídas (${noLeidas})` },
            { value: "archivadas", label: "Archivadas" },
          ]}
        />
      </View>

      {/* Lista de notificaciones */}
      <FlatList
        data={notificacionesFiltradas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableRipple onPress={() => abrirNotificacion(item)}>
            <List.Item
              title={item.titulo}
              description={item.mensaje}
              left={props => (
                <List.Icon 
                  {...props} 
                  icon={item.leida ? "email-open" : "email"} 
                  color={item.leida ? "#999" : "#2e7d32"} 
                />
              )}
              style={item.leida ? { opacity: 0.6 } : { opacity: 1 }}
            />
          </TouchableRipple>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>No hay notificaciones en esta categoría</Text>
          </View>
        )}
      />

      {/* Acción global - solo mostrar si hay no leídas */}
      {noLeidas > 0 && (
        <Appbar style={styles.bottomBar}>
          <Appbar.Action icon="check-all" onPress={marcarTodasLeidas} />
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Marcar todas como leídas ({noLeidas})
          </Text>
        </Appbar>
      )}

      {/* Snackbar */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar("")}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedContainer: {
    margin: 10,
  },
  bottomBar: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});