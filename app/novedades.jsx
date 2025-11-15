// app/novedades.jsx
import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./header";
import Footer from "./footer";
import NovedadesList from "./novedades-lista";
import DrawerMenu from "./drawer-menu";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function Novedades() {
  const router = useRouter();
  const [novedades, setNovedades] = useState([]);
  const [novedadesFiltradas, setNovedadesFiltradas] = useState([]);
  const [fabOpen, setFabOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [busquedaTexto, setBusquedaTexto] = useState("");

  // Cargar usuario y novedades al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [novedades, filtrosActivos, busquedaTexto]);

  const cargarDatos = async () => {
    try {
      // Obtener usuario logueado
      const usuarioData = await AsyncStorage.getItem('usuarioLogueado');
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData));
      }

      // Cargar novedades desde la API
      await cargarNovedades();
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarNovedades = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.NOVEDADES, {
        method: 'GET'
      });
      setNovedades(data);
    } catch (error) {
      console.error('Error cargando novedades:', error);
      Alert.alert('Error', 'No se pudieron cargar las novedades');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...novedades];

    // Filtro de búsqueda por texto
    if (busquedaTexto.trim()) {
      const busqueda = busquedaTexto.toLowerCase().trim();
      resultado = resultado.filter((item) =>
        item.titulo.toLowerCase().includes(busqueda) ||
        item.descripcion.toLowerCase().includes(busqueda) ||
        item.autor_nombre?.toLowerCase().includes(busqueda)
      );
    }

    // Filtros avanzados
    Object.entries(filtrosActivos).forEach(([filtroKey, valores]) => {
      if (!valores || valores.length === 0) return;

      switch (filtroKey) {
        case 'fecha':
          resultado = filtrarPorFecha(resultado, valores);
          break;
        case 'categoria':
          resultado = filtrarPorCategoria(resultado, valores);
          break;
        case 'relevancia':
          resultado = filtrarPorRelevancia(resultado, valores);
          break;
        case 'region':
          resultado = filtrarPorRegion(resultado, valores);
          break;
      }
    });

    setNovedadesFiltradas(resultado);
  };

  // Filtros específicos
  const filtrarPorFecha = (novedades, opciones) => {
    const ahora = new Date();
    
    return novedades.filter(novedad => {
      const fechaNovedad = new Date(novedad.fecha_creacion);
      const diasDiferencia = Math.floor((ahora - fechaNovedad) / (1000 * 60 * 60 * 24));

      return opciones.some(opcion => {
        switch (opcion) {
          case 'Hoy':
            return diasDiferencia === 0;
          case 'Esta semana':
            return diasDiferencia <= 7;
          case 'Este mes':
            return diasDiferencia <= 30;
          case 'Últimos 3 meses':
            return diasDiferencia <= 90;
          default:
            return true;
        }
      });
    });
  };

  const filtrarPorCategoria = (novedades, categorias) => {
    return novedades.filter(novedad => {
      const texto = `${novedad.titulo} ${novedad.descripcion}`.toLowerCase();
      
      return categorias.some(categoria => {
        const palabrasClave = {
          'Cultivos': ['cultivo', 'siembra', 'cosecha', 'sembrar', 'plantar'],
          'Ganadería': ['ganado', 'leche', 'carne', 'bovino', 'porcino', 'avicultura'],
          'Tecnología': ['tecnología', 'innovación', 'sistema', 'digital', 'app'],
          'Mercados': ['precio', 'mercado', 'venta', 'compra', 'comercio'],
          'Clima': ['clima', 'lluvia', 'sequía', 'temperatura', 'tiempo'],
          'Políticas': ['política', 'gobierno', 'subsidio', 'ley', 'decreto']
        };

        const palabras = palabrasClave[categoria] || [];
        return palabras.some(palabra => texto.includes(palabra));
      });
    });
  };

  const filtrarPorRelevancia = (novedades, niveles) => {
    const resultado = [...novedades];
    
    if (niveles.includes('Alta')) {
      // Más reciente = más relevante
      return resultado.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    }
    if (niveles.includes('Baja')) {
      // Más antiguo primero
      return resultado.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
    }
    
    return resultado;
  };

  const filtrarPorRegion = (novedades, regiones) => {
    return novedades.filter(novedad => {
      const texto = `${novedad.titulo} ${novedad.descripcion}`.toLowerCase();
      
      return regiones.some(region => {
        const palabrasClave = {
          'Mi región': ['chocó', 'quibdó', 'istmina', 'condoto', 'tadó'],
          'Nacional': ['colombia', 'nacional', 'país', 'bogotá', 'medellín'],
          'Internacional': ['internacional', 'exportación', 'importación', 'mundial']
        };

        const palabras = palabrasClave[region] || [];
        return palabras.some(palabra => texto.includes(palabra));
      });
    });
  };

  const handleSearch = (query) => {
    setBusquedaTexto(query);
  };

  const handleFiltrosAplicar = (filtros) => {
    console.log('📊 Aplicando filtros:', filtros);
    setFiltrosActivos(filtros);
  };

  const handleLimpiarFiltros = () => {
    console.log('🧹 Limpiando filtros');
    setFiltrosActivos({});
    setBusquedaTexto("");
  };

  const handleDeleteNovedad = async (id) => {
    try {
      await apiRequest(API_ENDPOINTS.NOVEDAD_BY_ID(id), {
        method: 'DELETE'
      });
      
      await cargarNovedades();
      Alert.alert('Éxito', 'Novedad eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando novedad:', error);
      Alert.alert('Error', 'No se pudo eliminar la novedad');
    }
  };

  const handleEditNovedad = (novedad) => {
    router.push({
      pathname: '/formulario-novedad',
      params: { 
        id: novedad.id,
        titulo: novedad.titulo,
        descripcion: novedad.descripcion,
        imagen: novedad.imagen,
        isEdit: 'true'
      }
    });
  };

  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'Administrador';

  // Acciones del FAB para usuarios normales (solo crear novedades)
  const fabActionsUsuario = [
    {
      icon: 'newspaper',
      label: 'Nueva Novedad',
      onPress: () => {
        setFabOpen(false);
        router.push('/formulario-novedad');
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    }
  ];

  // Acciones del FAB para administradores (todas las opciones)
  const fabActionsAdmin = [
    {
      icon: 'newspaper',
      label: 'Nueva Novedad',
      onPress: () => {
        setFabOpen(false);
        router.push('/formulario-novedad');
      },
      color: '#2e7d32',
      style: { backgroundColor: '#e8f5e8' }
    },
    {
      icon: 'leaf',
      label: 'Nuevo Producto',
      onPress: () => {
        setFabOpen(false);
        router.push('/formulario-producto');
      },
      color: '#4caf50',
      style: { backgroundColor: '#f1f8e9' }
    }
  ];

  return (
    <DrawerMenu onNavigate={(route) => router.push(route)}>
      {({ openDrawer }) => (
        <View style={{ flex: 1 }}>
          {/* Header con filtros integrados */}
          <Header
            title="Novedades"
            onSearch={handleSearch}
            onMenuPress={openDrawer}
            screenType="novedades"
            showFilters={true}
            onFiltersApply={handleFiltrosAplicar}
            activeFilters={filtrosActivos}
            onClearFilters={handleLimpiarFiltros}
          />
         
          <NovedadesList 
            novedades={novedadesFiltradas}
            esAdmin={esAdmin}
            onDelete={handleDeleteNovedad}
            onEdit={handleEditNovedad}
            onRefresh={cargarNovedades}
          />
          
          {/* Mostrar FAB a cualquier usuario autenticado */}
          {usuario && (
            <FAB.Group
              open={fabOpen}
              visible={true}
              icon={fabOpen ? 'close' : 'plus'}
              actions={esAdmin ? fabActionsAdmin : fabActionsUsuario}
              onStateChange={({ open }) => setFabOpen(open)}
              onPress={() => {}}
              fabStyle={{
                backgroundColor: esAdmin ? '#ff9800' : '#2e7d32',
                bottom: 70,
              }}
              theme={{
                colors: {
                  primary: esAdmin ? '#ff9800' : '#2e7d32',
                  accent: '#4caf50',
                }
              }}
            />
          )}
          
          <Footer
            currentScreen="inicio"
            onNavigate={(route) => router.push(route)}
          />
        </View>
      )}
    </DrawerMenu>
  );
}