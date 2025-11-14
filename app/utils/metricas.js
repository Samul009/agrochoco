// app/utils/metricas.js
// Funciones para registrar actividad del usuario en la aplicación

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.12:3000/api'; // Cambiar por tu IP

/**
 * Obtiene el ID del usuario logueado
 */
const getUsuarioId = async () => {
  try {
    const usuarioLogueado = await AsyncStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
      const userData = JSON.parse(usuarioLogueado);
      return userData.id;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

/**
 * Registra cuando un usuario ve un producto
 * @param {number} productoId - ID del producto visto
 */
export const registrarVistaProducto = async (productoId) => {
  try {
    const usuarioId = await getUsuarioId();
    
    if (!usuarioId) {
      console.log('No hay usuario logueado, no se registra la vista');
      return false;
    }

    const response = await fetch(`${API_URL}/metricas/producto-vista`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario_id: usuarioId,
        producto_id: productoId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Vista de producto registrada');
      return true;
    } else {
      console.error('Error registrando vista:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error en registrarVistaProducto:', error);
    return false;
  }
};

/**
 * Registra cuando un usuario lee una novedad
 * @param {number} novedadId - ID de la novedad leída
 */
export const registrarLecturaNovedad = async (novedadId) => {
  try {
    const usuarioId = await getUsuarioId();
    
    if (!usuarioId) {
      console.log('No hay usuario logueado, no se registra la lectura');
      return false;
    }

    const response = await fetch(`${API_URL}/metricas/novedad-lectura`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario_id: usuarioId,
        novedad_id: novedadId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Lectura de novedad registrada');
      return true;
    } else {
      console.error('Error registrando lectura:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error en registrarLecturaNovedad:', error);
    return false;
  }
};

/**
 * Registra múltiples vistas de productos (útil para listas)
 * @param {Array} productosIds - Array de IDs de productos vistos
 */
export const registrarVistasMultiples = async (productosIds) => {
  try {
    const usuarioId = await getUsuarioId();
    
    if (!usuarioId || !productosIds || productosIds.length === 0) {
      return false;
    }

    // Registrar cada vista (podrías optimizar esto con un endpoint batch)
    const promises = productosIds.map(id => registrarVistaProducto(id));
    await Promise.all(promises);
    
    return true;
  } catch (error) {
    console.error('Error en registrarVistasMultiples:', error);
    return false;
  }
};

// Exportar por defecto un objeto con todas las funciones
export default {
  registrarVistaProducto,
  registrarLecturaNovedad,
  registrarVistasMultiples
};