// formulario-producto.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { TextInput, Button, Switch, Chip } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS, apiRequest } from "../config/api";

const CATEGORIAS = [
  'Cereales',
  'Legumbres', 
  'Frutas',
  'Verduras',
  'Tubérculos',
  'Lácteos',
  'Cárnicos',
  'Otros'
];

export default function FormularioProducto() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const esEdicion = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [imagenLocal, setImagenLocal] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Frutas',
    descripcion: '',
    imagen_url: '',
    estado: 'Disponible',
    ubicaciones_cosecha: [],
    temporada_cosecha: '',
    metodo_cosecha: '',
    produccion_toneladas: '',
    precio_libra: '',
    precio_bulto: '',
    precio_camion: '',
    nuevo: false,
    disponible: true,
  });

  // Estado para el input de nueva ubicación
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');

  useEffect(() => {
    if (esEdicion) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const producto = await apiRequest(API_ENDPOINTS.PRODUCTO_BY_ID(id));
      
      // Parsear las ubicaciones desde la base de datos
      let ubicaciones = [];
      if (producto.ubicacion_cosecha) {
        try {
          ubicaciones = JSON.parse(producto.ubicacion_cosecha);
        } catch (e) {
          // Si falla el parse, asumimos que es un string simple
          ubicaciones = [producto.ubicacion_cosecha];
        }
      }
      
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion || '',
        imagen_url: producto.imagen || '',
        estado: producto.estado || 'Disponible',
        ubicaciones_cosecha: Array.isArray(ubicaciones) ? ubicaciones : [],
        temporada_cosecha: producto.temporada_cosecha || '',
        metodo_cosecha: producto.metodo_cosecha || '',
        produccion_toneladas: producto.produccion_toneladas || '',
        precio_libra: producto.precios?.libra?.toString() || '',
        precio_bulto: producto.precios?.bulto?.toString() || '',
        precio_camion: producto.precios?.camion?.toString() || '',
        nuevo: producto.nuevo || false,
        disponible: producto.disponible !== false,
      });

      if (producto.imagen && producto.imagen.startsWith('http')) {
        setImagenLocal(producto.imagen);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cargar el producto');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar imagen de la galería
  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos permisos para acceder a tu galería de fotos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagenLocal(result.assets[0].uri);
        setFormData({ ...formData, imagen_url: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error(error);
    }
  };

  // Función para tomar foto con la cámara
  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos permisos para acceder a tu cámara'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagenLocal(result.assets[0].uri);
        setFormData({ ...formData, imagen_url: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
      console.error(error);
    }
  };

  // Función para agregar ubicación
  const agregarUbicacion = () => {
    if (!nuevaUbicacion.trim()) {
      Alert.alert('Error', 'Ingresa una ubicación válida');
      return;
    }

    if (formData.ubicaciones_cosecha.includes(nuevaUbicacion.trim())) {
      Alert.alert('Error', 'Esta ubicación ya fue agregada');
      return;
    }

    setFormData({
      ...formData,
      ubicaciones_cosecha: [...formData.ubicaciones_cosecha, nuevaUbicacion.trim()]
    });
    setNuevaUbicacion('');
  };

  // Función para eliminar ubicación
  const eliminarUbicacion = (ubicacion) => {
    setFormData({
      ...formData,
      ubicaciones_cosecha: formData.ubicaciones_cosecha.filter(u => u !== ubicacion)
    });
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }

    if (formData.ubicaciones_cosecha.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos una ubicación de cosecha');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        // Convertir ubicaciones a JSON string para guardar en la base de datos
        ubicacion_cosecha: JSON.stringify(formData.ubicaciones_cosecha),
        precio_libra: parseFloat(formData.precio_libra) || 0,
        precio_bulto: parseFloat(formData.precio_bulto) || 0,
        precio_camion: parseFloat(formData.precio_camion) || 0,
        imagen: formData.imagen_url, // Guardar la URL o URI de la imagen
      };

      // Remover el campo temporal
      delete dataToSend.ubicaciones_cosecha;
      delete dataToSend.imagen_url;

      if (esEdicion) {
        await apiRequest(API_ENDPOINTS.PRODUCTO_BY_ID(id), {
          method: 'PUT',
          body: JSON.stringify(dataToSend),
        });
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        await apiRequest(API_ENDPOINTS.PRODUCTOS, {
          method: 'POST',
          body: JSON.stringify(dataToSend),
        });
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer y también eliminará todas las asociaciones con productores.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiRequest(API_ENDPOINTS.PRODUCTO_BY_ID(id), {
                method: 'DELETE',
              });
              Alert.alert('Éxito', 'Producto eliminado correctamente');
              router.back();
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo eliminar el producto');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const mostrarOpcionesImagen = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige cómo quieres agregar la imagen del producto',
      [
        {
          text: 'Tomar foto',
          onPress: tomarFoto,
        },
        {
          text: 'Desde galería',
          onPress: seleccionarImagen,
        },
        {
          text: 'Ingresar URL',
          onPress: () => {
            // Este caso se maneja con el TextInput de URL
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          
          {/* Sección de imagen */}
          <Text style={styles.sectionTitle}>Imagen del producto</Text>
          
          <View style={styles.imageContainer}>
            {imagenLocal ? (
              <Image 
                source={{ uri: imagenLocal }} 
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={64} color="#bdbdbd" />
                <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={tomarFoto}
            >
              <Ionicons name="camera" size={20} color="#4caf50" />
              <Text style={styles.imageButtonText}>Tomar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageButton}
              onPress={seleccionarImagen}
            >
              <Ionicons name="images" size={20} color="#4caf50" />
              <Text style={styles.imageButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            label="URL de imagen (opcional)"
            value={formData.imagen_url}
            onChangeText={(text) => {
              setFormData({ ...formData, imagen_url: text });
              if (text.startsWith('http')) {
                setImagenLocal(text);
              }
            }}
            mode="outlined"
            style={styles.input}
            placeholder="https://ejemplo.com/imagen.jpg"
          />

          <TextInput
            label="Nombre del producto *"
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            mode="outlined"
            style={styles.input}
          />

          {/* Selector de categoría */}
          <Text style={styles.sectionTitle}>Categoría</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  formData.categoria === cat && styles.categoryChipSelected
                ]}
                onPress={() => setFormData({ ...formData, categoria: cat })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.categoria === cat && styles.categoryChipTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            label="Descripción"
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Estado"
            value={formData.estado}
            onChangeText={(text) => setFormData({ ...formData, estado: text })}
            mode="outlined"
            style={styles.input}
            placeholder="Ej: En temporada, Disponible, Próximamente"
          />

          {/* Sección de ubicaciones múltiples */}
          <Text style={styles.sectionTitle}>Ubicaciones de cosecha *</Text>
          
          <View style={styles.ubicacionInputContainer}>
            <TextInput
              label="Nueva ubicación"
              value={nuevaUbicacion}
              onChangeText={setNuevaUbicacion}
              mode="outlined"
              style={styles.ubicacionInput}
              placeholder="Ej: Quibdó, Chocó"
              onSubmitEditing={agregarUbicacion}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={agregarUbicacion}
            >
              <Ionicons name="add-circle" size={40} color="#4caf50" />
            </TouchableOpacity>
          </View>

          {formData.ubicaciones_cosecha.length > 0 && (
            <View style={styles.ubicacionesChipsContainer}>
              {formData.ubicaciones_cosecha.map((ubicacion, index) => (
                <Chip
                  key={index}
                  style={styles.ubicacionChip}
                  onClose={() => eliminarUbicacion(ubicacion)}
                  closeIcon="close-circle"
                >
                  {ubicacion}
                </Chip>
              ))}
            </View>
          )}

          <TextInput
            label="Temporada de cosecha"
            value={formData.temporada_cosecha}
            onChangeText={(text) => setFormData({ ...formData, temporada_cosecha: text })}
            mode="outlined"
            style={styles.input}
            placeholder="Ej: Todo el año, Marzo-Septiembre"
          />

          <TextInput
            label="Método de cosecha"
            value={formData.metodo_cosecha}
            onChangeText={(text) => setFormData({ ...formData, metodo_cosecha: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Producción por hectárea"
            value={formData.produccion_toneladas}
            onChangeText={(text) => setFormData({ ...formData, produccion_toneladas: text })}
            mode="outlined"
            style={styles.input}
            placeholder="Ej: 15-20 toneladas/ha"
          />

          <Text style={styles.sectionTitle}>Precios (COP)</Text>

          <TextInput
            label="Precio por libra"
            value={formData.precio_libra}
            onChangeText={(text) => setFormData({ ...formData, precio_libra: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
          />

          <TextInput
            label="Precio por bulto"
            value={formData.precio_bulto}
            onChangeText={(text) => setFormData({ ...formData, precio_bulto: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
          />

          <TextInput
            label="Precio por camión"
            value={formData.precio_camion}
            onChangeText={(text) => setFormData({ ...formData, precio_camion: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
          />

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Marcar como nuevo</Text>
              <Switch
                value={formData.nuevo}
                onValueChange={(value) => setFormData({ ...formData, nuevo: value })}
                color="#4caf50"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Disponible</Text>
              <Switch
                value={formData.disponible}
                onValueChange={(value) => setFormData({ ...formData, disponible: value })}
                color="#4caf50"
              />
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            icon="content-save"
          >
            {esEdicion ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>

          {esEdicion && (
            <Button
              mode="outlined"
              onPress={handleDelete}
              disabled={loading}
              style={styles.deleteButton}
              textColor="#f44336"
              icon="delete"
            >
              Eliminar Producto
            </Button>
          )}

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#bdbdbd',
    marginTop: 8,
    fontSize: 14,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  imageButtonText: {
    color: '#4caf50',
    marginLeft: 8,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  categoryChipText: {
    color: "#666",
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  ubicacionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ubicacionInput: {
    flex: 1,
    backgroundColor: 'white',
    marginRight: 8,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ubicacionesChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  ubicacionChip: {
    backgroundColor: '#e8f5e9',
    marginRight: 8,
    marginBottom: 8,
  },
  switchContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: "#4caf50",
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderColor: "#f44336",
  },
  bottomSpacing: {
    height: 40,
  },
});