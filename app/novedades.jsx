import React, { useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "./header";
import Footer from "./footer";
import NovedadesList from "./novedades-lista";
import DrawerMenu from "./drawer-menu";
import novedadesData from "../novedades.json";

export default function Novedades() {
  const router = useRouter();
  const [novedades, setNovedades] = useState(novedadesData);
  const [fabOpen, setFabOpen] = useState(false);

  const handleSearch = (query) => {
    if (!query) return setNovedades(novedadesData);
    setNovedades(
      novedadesData.filter((item) =>
        item.titulo.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const fabActions = [
    {
      icon: 'newspaper',
      label: 'Nueva Novedad',
      onPress: () => {
        setFabOpen(false);
        // Formulario de nueva novedad
        console.log('Crear nueva novedad');
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    },
    {
      icon: 'leaf',
      label: 'Nuevo Producto',
      onPress: () => {
        setFabOpen(false);
        router.push('/productos');
      },
      color: '#4caf50',
      style: { backgroundColor: '#f1f8e9' }
    },
    {
      icon: 'map-marker-path',
      label: 'Nueva Ruta',
      onPress: () => {
        setFabOpen(false);
        router.push('/rutas');
      },
      color: '#66bb6a',
      style: { backgroundColor: '#e8f5e8' }
    }
  ];

  return (
    <DrawerMenu onNavigate={(route) => router.push(route)}>
      {({ openDrawer }) => (
        <View style={{ flex: 1 }}>
          <Header
            title="Novedades"
            onSearch={handleSearch}
            onMenuPress={openDrawer}
          />
         
          <NovedadesList novedades={novedades} />
          
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
                accent: '#2e7d32',
              }
            }}
          />
          
          <Footer
            currentScreen="inicio"
            onNavigate={(route) => router.push(route)}
          />
        </View>
      )}
    </DrawerMenu>
  );
}