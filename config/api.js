// config/api.js
// Configuración centralizada para la API
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Cambia esta IP según tu red actual
// Para obtener tu IP local: ejecuta 'ipconfig' en Windows o 'ifconfig' en Mac/Linux
// El servidor de conexión a la base de datos corre en el puerto 8000
const API_BASE_URL = 'http://192.168.1.14:8000';

// Crear instancia de axios
const cliente = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente a todas las peticiones
cliente.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return config;
  }
});

// Interceptor para manejar respuestas y errores
cliente.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Si el token expiró o es inválido, limpiar y redirigir a login
    if (error.response?.status === 401 || error.response?.status === 403) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuarioLogueado');
      // Podrías redirigir aquí si tienes acceso al router
    }
    return Promise.reject(error);
  }
);

// Endpoints disponibles
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  
  // Usuarios
  USUARIOS: `${API_BASE_URL}/usuarios`,
  USUARIO_BY_ID: (id) => `${API_BASE_URL}/usuarios/${id}`,
  
  // Novedades
  NOVEDADES: `${API_BASE_URL}/novedades`,
  NOVEDAD_BY_ID: (id) => `${API_BASE_URL}/novedades/${id}`,
  
  // Productos
  PRODUCTOS: `${API_BASE_URL}/productos`,
  PRODUCTO_BY_ID: (id) => `${API_BASE_URL}/productos/${id}`,
  
  // Productores-Productos
  PRODUCTORES_PRODUCTOS: `${API_BASE_URL}/productores-productos`,
  PRODUCTOS_BY_USUARIO: (usuario_id) => `${API_BASE_URL}/productores-productos/usuario/${usuario_id}`,
  PRODUCTORES_BY_PRODUCTO: (producto_id) => `${API_BASE_URL}/productores-productos/producto/${producto_id}`,
  
  // Rutas (si las tienes)
  RUTAS: `${API_BASE_URL}/rutas`,
  RUTA_BY_ID: (id) => `${API_BASE_URL}/rutas/${id}`,

  // Métricas - Administrador
  METRICAS_GENERAL: `${API_BASE_URL}/api/metricas/general`,
  
  // Métricas - Usuario específico
  METRICAS_USUARIO: (id) => `${API_BASE_URL}/api/metricas/usuario/${id}`,

    // Métricas - CORREGIDO
  METRICAS_ADMIN: `${API_BASE_URL}/api/metricas/admin`,
  METRICAS_USUARIO: (id) => `${API_BASE_URL}/api/metricas/usuario/${id}`,
  
  // Registros de actividad
  REGISTRAR_PRODUCTO_VISTA: `${API_BASE_URL}/api/metricas/producto-vista`,
  REGISTRAR_NOVEDAD_LECTURA: `${API_BASE_URL}/api/metricas/novedad-lectura`,
};


// Función helper para hacer peticiones usando axios
export const apiRequest = async (url, options = {}) => {
  try {
    console.log('📡 Haciendo petición a:', url);
    
    // Extraer el método y body de options
    const method = options.method || 'GET';
    const data = options.body ? JSON.parse(options.body) : undefined;
    
    // Si la URL incluye el baseURL, removerlo porque axios ya lo tiene configurado
    let urlPath = url;
    if (url.startsWith(API_BASE_URL)) {
      urlPath = url.replace(API_BASE_URL, '');
    }
    
    // Hacer la petición con axios (el interceptor agregará el token automáticamente)
    const response = await cliente({
      url: urlPath,
      method: method,
      data: data,
      headers: options.headers || {},
    });

    console.log('✅ Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en petición:', error);
    
    if (error.response) {
      // Error de respuesta del servidor
      throw {
        status: error.response.status,
        message: error.response.data?.message || 'Error en la petición',
        data: error.response.data
      };
    } else if (error.request) {
      // Error de conexión
      throw {
        status: 0,
        message: 'No se pudo conectar con el servidor. Verifica la IP y que el servidor esté corriendo.',
        originalError: error
      };
    } else {
      // Otro tipo de error
      throw {
        status: 0,
        message: error.message || 'Error desconocido',
        originalError: error
      };
    }
  }
};

// Exportar el cliente axios para uso directo si es necesario
export { cliente };

export default API_BASE_URL;