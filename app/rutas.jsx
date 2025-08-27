import React, { useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "./header";
import Footer from "./footer";
import DrawerMenu from "./drawer-menu";
import RutasList from "./rutas-lista";
import rutasData from "../rutas.json";

export default function Rutas() {
  const router = useRouter();
  const [rutas, setRutas] = useState(rutasData);
  const [fabOpen, setFabOpen] = useState(false);

  const handleSearch = (query) => {
    if (!query) return setRutas(rutasData);
    const lowerQuery = query.toLowerCase();
    setRutas(
      rutasData.filter((item) => {
        const producto = item.producto?.toLowerCase() || "";
        const region = item.region?.toLowerCase() || "";
        const empresas = Array.isArray(item.empresas)
          ? item.empresas.join(" ").toLowerCase()
          : "";
        return (
          producto.includes(lowerQuery) ||
          region.includes(lowerQuery) ||
          empresas.includes(lowerQuery)
        );
      })
    );
  };

  const fabActions = [
    {
      icon: 'map-marker-path',
      label: 'Nueva Ruta',
      onPress: () => {
        setFabOpen(false);
        // Formulario de nueva ruta
        console.log('Crear nueva ruta de comercialización');
      },
      color: '#66bb6a',
      style: { backgroundColor: '#e8f5e8' }
    },
    {
      icon: 'car',
      label: 'Transporte',
      onPress: () => {
        setFabOpen(false);
        // Agregar opciones de transporte
        console.log('Añadir opción de transporte');
      },
      color: '#4caf50',
      style: { backgroundColor: '#f1f8e9' }
    },
    {
      icon: 'map',
      label: 'Ubicar en Mapa',
      onPress: () => {
        setFabOpen(false);
        // Ubicar ruta en mapa
        console.log('Abrir mapa para crear ruta');
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    },
    {
      icon: 'store',
      label: 'Nuevo Punto de Venta',
      onPress: () => {
        setFabOpen(false);
        // Agregar punto de venta
        console.log('Añadir punto de venta');
      },
      color: '#388e3c',
      style: { backgroundColor: '#e8f5e8' }
    }
  ];

  return (
    <DrawerMenu onNavigate={(route) => router.push(route)}>
      {({ openDrawer }) => (
        <View style={{ flex: 1 }}>
          <Header
            title="Rutas de Comercio"
            onSearch={handleSearch}
            onMenuPress={openDrawer}
          />
          
          <RutasList
            rutas={rutas}
            onRutaSelect={(ruta) =>
              router.push(`/rutas-detalles?id=${ruta.id}`)
            }
          />
          
          <FAB.Group
            open={fabOpen}
            visible={true}
            icon={fabOpen ? 'close' : 'plus'}
            actions={fabActions}
            onStateChange={({ open }) => setFabOpen(open)}
            onPress={() => {
              if (fabOpen) {
                // No hacer nada, se cierra automáticamente
              }
            }}
            fabStyle={{
              backgroundColor: '#ff9800',
              bottom: 70,
            }}
            theme={{
              colors: {
                primary: '#ff9800',
                accent: '#66bb6a',
              }
            }}
          />
          
          <Footer
            currentScreen="rutas"
            onNavigate={(route) => router.push(route)}
          />
        </View>
      )}
    </DrawerMenu>
  );
}