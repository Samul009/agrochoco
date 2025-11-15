// app/admin-crud/[tabla].jsx - Componente CRUD genérico para todas las tablas
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;

// Configuración de campos para cada tabla
const TABLA_CONFIG = {
  usuarios: {
    nombre: 'Usuarios',
    icon: 'people',
    color: '#4CAF50',
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'nombre', label: 'Nombre', tipo: 'text', required: true },
      { key: 'email', label: 'Email', tipo: 'email', required: true },
      { key: 'clave', label: 'Contraseña', tipo: 'password', required: false, placeholder: 'Dejar vacío para no cambiar' },
      { key: 'telefono', label: 'Teléfono', tipo: 'text', required: false },
      { key: 'direccion', label: 'Dirección', tipo: 'textarea', required: false },
      { key: 'rol_id', label: 'Rol ID', tipo: 'number', required: false },
    ],
    endpoint: API_ENDPOINTS.USUARIOS,
    endpointId: (id) => API_ENDPOINTS.USUARIO_BY_ID(id),
  },
  productos: {
    nombre: 'Productos',
    icon: 'basket',
    color: '#2196F3',
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'nombre', label: 'Nombre', tipo: 'text', required: true },
      { key: 'categoria_id', label: 'Categoría ID', tipo: 'number', required: true },
      { key: 'descripcion', label: 'Descripción', tipo: 'textarea', required: false },
      { key: 'imagen', label: 'Imagen', tipo: 'text', required: false },
      { key: 'estado', label: 'Estado', tipo: 'text', required: false },
      { key: 'ubicacion_cosecha', label: 'Ubicación Cosecha', tipo: 'text', required: false },
      { key: 'temporada_cosecha', label: 'Temporada Cosecha', tipo: 'text', required: false },
      { key: 'metodo_cosecha', label: 'Método Cosecha', tipo: 'textarea', required: false },
      { key: 'produccion_toneladas', label: 'Producción (ton)', tipo: 'text', required: false },
      { key: 'precio_libra', label: 'Precio Libra', tipo: 'number', required: false },
      { key: 'precio_bulto', label: 'Precio Bulto', tipo: 'number', required: false },
      { key: 'precio_camion', label: 'Precio Camión', tipo: 'number', required: false },
      { key: 'nuevo', label: 'Nuevo', tipo: 'boolean', required: false },
      { key: 'disponible', label: 'Disponible', tipo: 'boolean', required: false },
    ],
    endpoint: API_ENDPOINTS.PRODUCTOS,
    endpointId: (id) => API_ENDPOINTS.PRODUCTO_BY_ID(id),
  },
  categorias: {
    nombre: 'Categorías',
    icon: 'grid',
    color: '#FF9800',
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'nombre', label: 'Nombre', tipo: 'text', required: true },
      { key: 'descripcion', label: 'Descripción', tipo: 'textarea', required: false },
    ],
    endpoint: API_ENDPOINTS.CATEGORIAS,
    endpointId: (id) => API_ENDPOINTS.CATEGORIA_BY_ID(id),
  },
  roles: {
    nombre: 'Roles',
    icon: 'shield',
    color: '#9C27B0',
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'nombre', label: 'Nombre', tipo: 'text', required: true },
      { key: 'descripcion', label: 'Descripción', tipo: 'textarea', required: false },
    ],
    endpoint: API_ENDPOINTS.ROLES,
    endpointId: (id) => API_ENDPOINTS.ROL_BY_ID(id),
  },
  novedades: {
    nombre: 'Novedades',
    icon: 'newspaper',
    color: '#F44336',
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'titulo', label: 'Título', tipo: 'text', required: true },
      { key: 'descripcion', label: 'Descripción', tipo: 'textarea', required: true },
      { key: 'imagen', label: 'Imagen', tipo: 'text', required: false },
      { key: 'usuario_id', label: 'Usuario ID', tipo: 'number', required: false },
    ],
    endpoint: API_ENDPOINTS.NOVEDADES,
    endpointId: (id) => API_ENDPOINTS.NOVEDAD_BY_ID(id),
  },
  'productores-productos': {
    nombre: 'Productores-Productos',
    icon: 'leaf',
    color: '#00BCD4',
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'usuario_id', label: 'Usuario ID', tipo: 'number', required: true },
      { key: 'producto_id', label: 'Producto ID', tipo: 'number', required: true },
      { key: 'area_cultivada', label: 'Área Cultivada', tipo: 'number', required: false },
      { key: 'produccion_actual', label: 'Producción Actual', tipo: 'number', required: false },
      { key: 'fecha_inicio_produccion', label: 'Fecha Inicio', tipo: 'date', required: false },
      { key: 'estado_produccion', label: 'Estado', tipo: 'select', options: ['Activo', 'Inactivo', 'Pausado'], required: false },
      { key: 'notas', label: 'Notas', tipo: 'textarea', required: false },
    ],
    endpoint: API_ENDPOINTS.PRODUCTORES_PRODUCTOS,
    endpointId: (id) => API_ENDPOINTS.PRODUCTOR_PRODUCTO_BY_ID(id),
  },
  'producto-vistas': {
    nombre: 'Vistas de Productos',
    icon: 'eye',
    color: '#795548',
    soloLectura: true, // Tabla de auditoría, solo lectura
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'usuario_id', label: 'Usuario ID', tipo: 'number', readonly: true, required: false },
      { key: 'producto_id', label: 'Producto ID', tipo: 'number', readonly: true, required: false },
      { key: 'fecha_vista', label: 'Fecha Vista', tipo: 'datetime', readonly: true, required: false },
    ],
    endpoint: API_ENDPOINTS.PRODUCTO_VISTAS,
    endpointId: (id) => API_ENDPOINTS.PRODUCTO_VISTAS + `/${id}`,
  },
  'novedad-lecturas': {
    nombre: 'Lecturas de Novedades',
    icon: 'book',
    color: '#607D8B',
    soloLectura: true, // Tabla de auditoría, solo lectura
    campos: [
      { key: 'id', label: 'ID', tipo: 'number', readonly: true, required: false },
      { key: 'usuario_id', label: 'Usuario ID', tipo: 'number', readonly: true, required: false },
      { key: 'novedad_id', label: 'Novedad ID', tipo: 'number', readonly: true, required: false },
      { key: 'fecha_lectura', label: 'Fecha Lectura', tipo: 'datetime', readonly: true, required: false },
    ],
    endpoint: API_ENDPOINTS.NOVEDAD_LECTURAS,
    endpointId: (id) => API_ENDPOINTS.NOVEDAD_LECTURAS + `/${id}`,
  },
};

export default function AdminCRUD() {
  const router = useRouter();
  const { tabla } = useLocalSearchParams();
  const config = TABLA_CONFIG[tabla];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) {
      Alert.alert('Error', 'Tabla no encontrada');
      router.back();
      return;
    }
    cargarDatos();
  }, [tabla, currentPage]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(config.endpoint, { method: 'GET' });
      
      // Si la respuesta es un array, usarla directamente
      const items = Array.isArray(response) ? response : (response.data || []);
      setData(items);
      
      const pages = Math.ceil(items.length / ITEMS_PER_PAGE);
      setTotalPages(pages || 1);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    const newFormData = {};
    config.campos.forEach(campo => {
      if (campo.tipo === 'boolean') {
        newFormData[campo.key] = false;
      } else {
        newFormData[campo.key] = '';
      }
    });
    setFormData(newFormData);
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar este registro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(config.endpointId(item.id), { method: 'DELETE' });
              Alert.alert('Éxito', 'Registro eliminado correctamente');
              cargarDatos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el registro');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    // Validar campos requeridos
    const camposRequeridos = config.campos.filter(c => c.required && c.key !== 'id');
    for (const campo of camposRequeridos) {
      if (!formData[campo.key] || formData[campo.key].toString().trim() === '') {
        Alert.alert('Error', `El campo ${campo.label} es requerido`);
        return;
      }
    }

    try {
      setSaving(true);
      const dataToSend = { ...formData };
      
      // Limpiar campos que no se deben enviar
      delete dataToSend.id;
      
      // Si es contraseña y está vacía, no enviarla
      if (dataToSend.clave === '') {
        delete dataToSend.clave;
      }

      if (editingItem) {
        // Actualizar
        await apiRequest(config.endpointId(editingItem.id), {
          method: 'PUT',
          body: JSON.stringify(dataToSend),
        });
        Alert.alert('Éxito', 'Registro actualizado correctamente');
      } else {
        // Crear
        await apiRequest(config.endpoint, {
          method: 'POST',
          body: JSON.stringify(dataToSend),
        });
        Alert.alert('Éxito', 'Registro creado correctamente');
      }
      
      setModalVisible(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (campo) => {
    const value = formData[campo.key]?.toString() || '';
    const isReadonly = campo.readonly;

    switch (campo.tipo) {
      case 'textarea':
        return (
          <TextInput
            key={campo.key}
            style={[styles.input, styles.textArea, isReadonly && styles.inputReadonly]}
            placeholder={campo.placeholder || campo.label}
            value={value}
            onChangeText={(text) => setFormData({ ...formData, [campo.key]: text })}
            multiline
            numberOfLines={4}
            editable={!isReadonly}
            placeholderTextColor="#999"
          />
        );
      case 'boolean':
        return (
          <TouchableOpacity
            key={campo.key}
            style={styles.booleanField}
            onPress={() => !isReadonly && setFormData({ ...formData, [campo.key]: !formData[campo.key] })}
          >
            <Ionicons
              name={formData[campo.key] ? 'checkbox' : 'square-outline'}
              size={24}
              color={isReadonly ? '#999' : config.color}
            />
            <Text style={styles.booleanLabel}>{campo.label}</Text>
          </TouchableOpacity>
        );
      case 'select':
        return (
          <View key={campo.key} style={styles.selectContainer}>
            <Text style={styles.label}>{campo.label}</Text>
            {campo.options?.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectOption,
                  formData[campo.key] === option && styles.selectOptionActive,
                ]}
                onPress={() => !isReadonly && setFormData({ ...formData, [campo.key]: option })}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData[campo.key] === option && styles.selectOptionTextActive,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'password':
        return (
          <TextInput
            key={campo.key}
            style={[styles.input, isReadonly && styles.inputReadonly]}
            placeholder={campo.placeholder || campo.label}
            value={value}
            onChangeText={(text) => setFormData({ ...formData, [campo.key]: text })}
            secureTextEntry
            editable={!isReadonly}
            placeholderTextColor="#999"
          />
        );
      case 'date':
        return (
          <TextInput
            key={campo.key}
            style={[styles.input, isReadonly && styles.inputReadonly]}
            placeholder={campo.placeholder || "YYYY-MM-DD"}
            value={value}
            onChangeText={(text) => setFormData({ ...formData, [campo.key]: text })}
            editable={!isReadonly}
            placeholderTextColor="#999"
          />
        );
      case 'datetime':
        return (
          <TextInput
            key={campo.key}
            style={[styles.input, isReadonly && styles.inputReadonly]}
            placeholder={campo.placeholder || campo.label}
            value={value}
            onChangeText={(text) => setFormData({ ...formData, [campo.key]: text })}
            editable={!isReadonly}
            placeholderTextColor="#999"
          />
        );
      default:
        return (
          <TextInput
            key={campo.key}
            style={[styles.input, isReadonly && styles.inputReadonly]}
            placeholder={campo.placeholder || campo.label}
            value={value}
            onChangeText={(text) => setFormData({ ...formData, [campo.key]: campo.tipo === 'number' ? (text === '' ? '' : Number(text)) : text })}
            keyboardType={campo.tipo === 'number' ? 'numeric' : campo.tipo === 'email' ? 'email-address' : 'default'}
            editable={!isReadonly}
            placeholderTextColor="#999"
          />
        );
    }
  };

  const getDisplayValue = (item, campo) => {
    const value = item[campo.key];
    if (campo.tipo === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    if (campo.tipo === 'datetime' || campo.tipo === 'date') {
      if (!value) return '-';
      try {
        const date = new Date(value);
        return date.toLocaleString('es-ES');
      } catch {
        return value.toString();
      }
    }
    if (value === null || value === undefined) {
      return '-';
    }
    // Mostrar información adicional si está disponible
    if (item.usuario_nombre && campo.key === 'usuario_id') {
      return `${value} (${item.usuario_nombre})`;
    }
    if (item.producto_nombre && campo.key === 'producto_id') {
      return `${value} (${item.producto_nombre})`;
    }
    if (item.novedad_titulo && campo.key === 'novedad_id') {
      return `${value} (${item.novedad_titulo})`;
    }
    return value.toString();
  };

  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!config) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: config.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name={config.icon} size={24} color="#fff" />
          <Text style={styles.headerTitle}>{config.nombre}</Text>
        </View>
        {!config.soloLectura && (
          <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={config.color} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {paginatedData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name={config.icon} size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay registros</Text>
              {!config.soloLectura && (
                <TouchableOpacity style={[styles.createButton, { backgroundColor: config.color }]} onPress={handleCreate}>
                  <Text style={styles.createButtonText}>Crear nuevo registro</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {paginatedData.map((item, index) => (
                <View key={item.id || index} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    {config.campos.slice(0, 3).map((campo) => (
                      <View key={campo.key} style={styles.itemField}>
                        <Text style={styles.itemLabel}>{campo.label}:</Text>
                        <Text style={styles.itemValue}>{getDisplayValue(item, campo)}</Text>
                      </View>
                    ))}
                  </View>
                  {!config.soloLectura && (
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => handleEdit(item)}
                      >
                        <Ionicons name="pencil" size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                        onPress={() => handleDelete(item)}
                      >
                        <Ionicons name="trash" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : config.color} />
                  </TouchableOpacity>
                  <Text style={styles.pageText}>
                    Página {currentPage} de {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : config.color} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Modal de formulario */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, { backgroundColor: config.color }]}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Editar' : 'Crear'} {config.nombre}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {config.campos.map((campo) => (
                <View key={campo.key} style={styles.formGroup}>
                  <Text style={styles.label}>
                    {campo.label} {campo.required && <Text style={styles.required}>*</Text>}
                  </Text>
                  {renderField(campo)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: config.color }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
  },
  backButton: { padding: 8 },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  addButton: { padding: 8 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  content: { flex: 1 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContent: { flex: 1 },
  itemField: { marginBottom: 8 },
  itemLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 14,
    color: '#333',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
  },
  pageButton: {
    padding: 8,
  },
  pageButtonDisabled: { opacity: 0.5 },
  pageText: { fontSize: 16, color: '#666' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  formGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: { color: '#F44336' },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputReadonly: {
    backgroundColor: '#e0e0e0',
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  booleanField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  booleanLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  selectContainer: { marginBottom: 10 },
  selectOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectOptionActive: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectOptionTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

