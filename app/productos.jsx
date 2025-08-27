import React, { useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "./header";
import Footer from "./footer";
import ProductosList from "./productos-lista";
import DrawerMenu from "./drawer-menu";
import productosData from "../productos.json";

export default function Productos() {
  const router = useRouter();
  const [productos, setProductos] = useState(productosData);
  const [fabOpen, setFabOpen] = useState(false);

  const handleSearch = (query) => {
    if (!query) return setProductos(productosData);
    setProductos(
      productosData.filter((item) =>
        item.nombre.toLowerCase().includes(query.toLowerCase()) ||
        item.categoria.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const fabActions = [
    {
      icon: 'leaf',
      label: 'Nuevo Producto',
      onPress: () => {
        setFabOpen(false);
        // Formulario de nuevo producto
        console.log('Crear nuevo producto');
      },
      color: '#4caf50',
      style: { backgroundColor: '#f1f8e9' }
    },
    {
      icon: 'camera',
      label: 'Escanear Código',
      onPress: () => {
        setFabOpen(false);
        // Scanner de códigos de barras
        console.log('Abrir scanner de códigos');
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    },
    {
      icon: 'import',
      label: 'Importar Lista',
      onPress: () => {
        setFabOpen(false);
        // Importar lista de productos
        console.log('Importar lista de productos');
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
            title="Productos"
            onSearch={handleSearch}
            onMenuPress={openDrawer}
          />
         
          <ProductosList
            productos={productos}
            onProductSelect={(producto) => router.push(`/producto-detalle?id=${producto.id}`)}
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
                accent: '#4caf50',
              }
            }}
          />
          
          <Footer
            currentScreen="productos"
            onNavigate={(route) => router.push(route)}
          />
        </View>
      )}
    </DrawerMenu>
  );
}