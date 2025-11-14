// productos.jsx
import React, { useState, useEffect } from "react";
import { View, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./header";
import Footer from "./footer";
import ProductosList from "./productos-lista";
import DrawerMenu from "./drawer-menu";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function Productos() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [fabOpen, setFabOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [usuario, setUsuario] = useState(null);
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 productos por página

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      // Cargar usuario logueado
      const usuarioData = await AsyncStorage.getItem('usuarioLogueado');
      if (usuarioData) {
        const userData = JSON.parse(usuarioData);
        setUsuario(userData);
        
        if (__DEV__) {
          console.log('👤 Usuario en Productos:', userData);
          console.log('🔑 Rol:', userData.rol);
        }
      }

      // Cargar productos
      await cargarProductos();
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_ENDPOINTS.PRODUCTOS);
      console.log('✅ Productos cargados:', data.length);
      setProductos(data);
      setProductosFiltrados(data);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      Alert.alert(
        'Error de conexión',
        error.message || 'No se pudieron cargar los productos. Verifica tu conexión.'
      );
      setProductos([]);
      setProductosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      aplicarFiltros(activeFilters, productos);
      return;
    }
    
    const resultados = productos.filter((item) =>
      item.nombre.toLowerCase().includes(query.toLowerCase()) ||
      item.categoria.toLowerCase().includes(query.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(query.toLowerCase())
    );
    
    setProductosFiltrados(resultados);
  };

  const aplicarFiltros = (filtros, listaBase = productos) => {
    console.log('🔍 Aplicando filtros:', filtros);
    
    let resultados = [...listaBase];

    if (filtros.categoria && filtros.categoria.length > 0) {
      resultados = resultados.filter(producto =>
        filtros.categoria.includes(producto.categoria)
      );
    }

    if (filtros.precio && filtros.precio.length > 0) {
      resultados = resultados.filter(producto => {
        const precioLibra = producto.precios?.libra || 0;
        
        return filtros.precio.some(rango => {
          if (rango === "Bajo (< $50.000)") return precioLibra < 50000;
          if (rango === "Medio ($50k - $150k)") return precioLibra >= 50000 && precioLibra <= 150000;
          if (rango === "Alto (> $150.000)") return precioLibra > 150000;
          if (rango === "Solo ofertas") return producto.nuevo === true;
          return true;
        });
      });
    }

    if (filtros.disponibilidad && filtros.disponibilidad.length > 0) {
      resultados = resultados.filter(producto => {
        return filtros.disponibilidad.some(disp => {
          if (disp === "Disponible ahora") return producto.disponible === true;
          if (disp === "Próximamente") return producto.estado?.toLowerCase().includes("próximamente");
          if (disp === "Bajo pedido") return producto.estado?.toLowerCase().includes("pedido");
          return true;
        });
      });
    }

    if (filtros.calidad && filtros.calidad.length > 0) {
      resultados = resultados.filter(producto => {
        return filtros.calidad.some(cal => {
          const estadoLower = producto.estado?.toLowerCase() || '';
          if (cal === "Premium") return estadoLower.includes("premium");
          if (cal === "Orgánico") return estadoLower.includes("orgánico");
          if (cal === "Certificado") return estadoLower.includes("certificado");
          if (cal === "Estándar") return !estadoLower.includes("premium") && !estadoLower.includes("orgánico");
          return true;
        });
      });
    }

    console.log(`✅ Filtros aplicados: ${resultados.length} productos`);
    setProductosFiltrados(resultados);
    setActiveFilters(filtros);
    setCurrentPage(1); // Resetear a la primera página cuando se aplican filtros
  };

  const limpiarFiltros = () => {
    console.log('🧹 Limpiando filtros');
    setActiveFilters({});
    setProductosFiltrados(productos);
    setCurrentPage(1); // Resetear a la primera página al limpiar filtros
  };

  // Verificar si el usuario es administrador
  const esAdmin = () => {
    if (!usuario) return false;
    
    const rol = (usuario.rol || usuario.tipo_usuario || usuario.tipo || '').toLowerCase().trim();
    const isAdmin = rol === 'administrador';
    
    if (__DEV__) {
      console.log('🔐 Verificación de admin en Productos:', {
        usuario: usuario.nombre,
        rolOriginal: usuario.rol,
        rolNormalizado: rol,
        esAdmin: isAdmin
      });
    }
    
    return isAdmin;
  };

  // Acciones del FAB según el rol
  const fabActionsAdmin = [
    {
      icon: 'leaf',
      label: 'Nuevo Producto',
      onPress: () => {
        setFabOpen(false);
        router.push('/formulario-producto');
      },
      color: '#4caf50',
      style: { backgroundColor: '#f1f8e9' }
    },
    {
      icon: 'refresh',
      label: 'Recargar Lista',
      onPress: () => {
        setFabOpen(false);
        cargarProductos();
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    }
  ];

  const handleRegistroProductor = () => {
    setFabOpen(false);
    if (!productos || productos.length === 0) {
      Alert.alert(
        'Sin productos',
        'No hay productos disponibles para registrarte como productor. Vuelve más tarde.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }
    
    // Mostrar diálogo con lista de productos para seleccionar
    const productosOpciones = productos.map(p => p.nombre);
    Alert.alert(
      'Registrarse como Productor',
      'Selecciona un producto para registrarte como productor:',
      productosOpciones.map((nombre, index) => ({
        text: nombre,
        onPress: () => {
          const productoSeleccionado = productos[index];
          router.push(`/registro-productor?producto_id=${productoSeleccionado.id}&nombre=${encodeURIComponent(nombre)}`);
        }
      })).concat([{ text: 'Cancelar', style: 'cancel' }])
    );
  };

  const fabActionsUsuario = [
    {
      icon: 'account-plus',
      label: 'Registrarse como Productor',
      onPress: handleRegistroProductor,
      color: '#1976d2',
      style: { backgroundColor: '#e3f2fd' }
    },
    {
      icon: 'refresh',
      label: 'Recargar Lista',
      onPress: () => {
        setFabOpen(false);
        cargarProductos();
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  return (
    <DrawerMenu onNavigate={(route) => router.push(route)}>
      {({ openDrawer }) => (
        <View style={{ flex: 1 }}>
          <Header
            title="Productos"
            onSearch={handleSearch}
            onMenuPress={openDrawer}
            screenType="productos"
            showFilters={true}
            onFiltersApply={aplicarFiltros}
            activeFilters={activeFilters}
            onClearFilters={limpiarFiltros}
          />
         
          <ProductosList
            productos={productosFiltrados}
            onProductSelect={(producto) => {
              router.push(`/producto-detalle/${producto.id}`);
            }}
            onRefresh={cargarProductos}
            esAdmin={esAdmin()}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          
          {/* Mostrar FAB solo si hay usuario logueado */}
          {usuario && (
            <FAB.Group
              open={fabOpen}
              visible={true}
              icon={fabOpen ? 'close' : 'plus'}
              actions={esAdmin() ? fabActionsAdmin : fabActionsUsuario}
              onStateChange={({ open }) => setFabOpen(open)}
              onPress={() => {
                if (fabOpen) {
                  // No hacer nada, se cierra automáticamente
                }
              }}
              fabStyle={{
                backgroundColor: esAdmin() ? '#ff9800' : '#1976d2',
                bottom: 70,
              }}
              theme={{
                colors: {
                  primary: esAdmin() ? '#ff9800' : '#1976d2',
                  accent: '#4caf50',
                }
              }}
            />
          )}
          
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});