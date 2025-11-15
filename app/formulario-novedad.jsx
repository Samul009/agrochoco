// app/formulario-novedad.jsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, PaperProvider, MD3LightTheme, HelperText, Card, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { API_ENDPOINTS, apiRequest } from '../config/api';

export default function FormularioNovedad() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [usuario, setUsuario] = useState(null);
  
  // Estados para imagen
  const [tipoImagen, setTipoImagen] = useState('url'); // 'url' o 'subir'
  const [imagenLocal, setImagenLocal] = useState(null); // URI local de la imagen
  const [imagenBase64, setImagenBase64] = useState(null); // Base64 de la imagen
  
  // Estados para validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Cargar usuario y datos si es edición
  useEffect(() => {
    cargarUsuario();
    
    if (params.isEdit === 'true' && params.id) {
      setIsEdit(true);
      setTitulo(params.titulo || '');
      setDescripcion(params.descripcion || '');
      const imagenParam = params.imagen || '';
      // Detectar si es una URL o una imagen base64/data URI
      if (imagenParam.startsWith('data:image') || imagenParam.startsWith('http://') || imagenParam.startsWith('https://')) {
        if (imagenParam.startsWith('data:image')) {
          setTipoImagen('subir');
          setImagenBase64(imagenParam);
        } else {
          setTipoImagen('url');
          setImagen(imagenParam);
        }
      }
    }
  }, [params]);

  const cargarUsuario = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuarioLogueado');
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData));
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  // Validaciones en tiempo real
  const validarCampo = (campo, valor) => {
    let error = '';
    
    switch (campo) {
      case 'titulo':
        if (!valor.trim()) {
          error = 'El título es obligatorio';
        } else if (valor.trim().length < 5) {
          error = 'El título debe tener al menos 5 caracteres';
        } else if (valor.trim().length > 200) {
          error = 'El título no puede exceder 200 caracteres';
        }
        break;
        
      case 'descripcion':
        if (!valor.trim()) {
          error = 'La descripción es obligatoria';
        } else if (valor.trim().length < 20) {
          error = 'La descripción debe tener al menos 20 caracteres';
        } else if (valor.trim().length > 5000) {
          error = 'La descripción no puede exceder 5000 caracteres';
        }
        break;
        
      case 'imagen':
        if (tipoImagen === 'url' && valor.trim() && !isValidUrl(valor.trim()) && !valor.trim().startsWith('data:image')) {
          error = 'La URL de la imagen no es válida';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [campo]: error }));
    return error === '';
  };

  const isValidUrl = (url) => {
    try {
      const urlObj = new URL(url);
      // Verificar que sea HTTP o HTTPS
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Verificar que sea una URL directa de imagen
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const pathname = urlObj.pathname.toLowerCase();
      
      // Si termina con extensión de imagen, es válida
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      // Si no tiene extensión pero contiene palabras clave de imágenes comunes, podría ser válida
      
      const hasImageKeywords = /\/(image|img|photo|pic|picture|foto)\//i.test(pathname);
      
      // También aceptar data URIs (base64)
      if (url.startsWith('data:image')) {
        return true;
      }
      
      // Si es una URL de servicios comunes que sirven imágenes directamente
      // (por ejemplo: imgur, i.imgur.com, etc.)
      const imageHosts = ['i.imgur.com', 'imgur.com', 'i.redd.it', 'unsplash.com', 'images.unsplash.com'];
      const hostname = urlObj.hostname.toLowerCase();
      if (imageHosts.some(host => hostname.includes(host))) {
        return true;
      }
      
      return hasImageExtension || hasImageKeywords;
    } catch {
      return false;
    }
  };

  const handleBlur = (campo) => {
    setTouched(prev => ({ ...prev, [campo]: true }));
    
    switch (campo) {
      case 'titulo':
        validarCampo('titulo', titulo);
        break;
      case 'descripcion':
        validarCampo('descripcion', descripcion);
        break;
      case 'imagen':
        validarCampo('imagen', imagen);
        break;
    }
  };

  const validarFormulario = () => {
    const tituloValido = validarCampo('titulo', titulo);
    const descripcionValida = validarCampo('descripcion', descripcion);
    
    // Validar imagen según el tipo seleccionado
    let imagenValida = true;
    if (tipoImagen === 'url') {
      imagenValida = validarCampo('imagen', imagen);
    } else if (tipoImagen === 'subir' && !imagenBase64) {
      setErrors(prev => ({ ...prev, imagen: 'Debes subir una imagen' }));
      imagenValida = false;
    } else {
      setErrors(prev => ({ ...prev, imagen: '' }));
    }
    
    setTouched({
      titulo: true,
      descripcion: true,
      imagen: true
    });
    
    return tituloValido && descripcionValida && imagenValida;
  };

  const handleSubmit = async () => {
    // Validar formulario
    if (!validarFormulario()) {
      Alert.alert(
        'Formulario incompleto',
        'Por favor corrige los errores antes de continuar.'
      );
      return;
    }

    // Confirmar acción
    Alert.alert(
      isEdit ? '¿Actualizar novedad?' : '¿Crear novedad?',
      isEdit 
        ? 'Los cambios se guardarán permanentemente.'
        : 'Se publicará una nueva novedad.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: isEdit ? 'Actualizar' : 'Crear',
          onPress: guardarNovedad
        }
      ]
    );
  };

  const guardarNovedad = async () => {
    setIsLoading(true);

    try {
      // Determinar qué imagen enviar según el tipo seleccionado
      let imagenFinal = null;
      if (tipoImagen === 'url') {
        imagenFinal = imagen.trim() || null;
      } else if (tipoImagen === 'subir' && imagenBase64) {
        imagenFinal = imagenBase64;
      }

      const novedadData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagen: imagenFinal,
        usuario_id: usuario?.id || null
      };

      if (isEdit) {
        // Actualizar novedad existente
        await apiRequest(API_ENDPOINTS.NOVEDAD_BY_ID(params.id), {
          method: 'PUT',
          body: JSON.stringify(novedadData),
        });

        Alert.alert(
          '✅ Actualización exitosa',
          'La novedad ha sido actualizada correctamente',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        // Crear nueva novedad
        const resultado = await apiRequest(API_ENDPOINTS.NOVEDADES, {
          method: 'POST',
          body: JSON.stringify(novedadData),
        });

        Alert.alert(
          '✅ Creación exitosa',
          'La novedad ha sido publicada correctamente',
          [
            {
              text: 'Ver novedad',
              onPress: () => {
                router.back();
                router.push(`/novedad-detalle/${resultado.id}`);
              }
            },
            {
              text: 'Crear otra',
              onPress: () => {
                setTitulo('');
                setDescripcion('');
                setImagen('');
                setImagenLocal(null);
                setImagenBase64(null);
                setTipoImagen('url');
                setTouched({});
                setErrors({});
              }
            },
            {
              text: 'Volver',
              onPress: () => router.back(),
              style: 'cancel'
            }
          ]
        );
      }

    } catch (error) {
      console.error('Error guardando novedad:', error);

      let mensaje = 'No se pudo guardar la novedad.';
      
      if (error.status === 400) {
        mensaje = error.message || 'Los datos proporcionados no son válidos.';
      } else if (error.status === 404) {
        mensaje = 'La novedad que intentas editar no existe.';
      } else if (error.status === 0) {
        mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.message) {
        mensaje = error.message;
      }

      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (titulo.trim() || descripcion.trim() || imagen.trim() || imagenBase64) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Salir',
            onPress: () => router.back(),
            style: 'destructive'
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const contadorCaracteres = (texto, max) => {
    return `${texto.length}/${max}`;
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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        const imageUri = imageAsset.uri;
        
        if (!imageUri) {
          Alert.alert('Error', 'No se pudo obtener la imagen');
          return;
        }

        setImagenLocal(imageUri);
        
        // Convertir imagen a base64
        try {
          // Verificar que el URI existe y es accesible
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (!fileInfo.exists) {
            throw new Error('El archivo de imagen no existe');
          }

          // Usar la sintaxis de string para encoding (más compatible)
          // Verificar si EncodingType existe, si no usar string directamente
          let encodingOption;
          if (FileSystem.EncodingType && FileSystem.EncodingType.Base64) {
            encodingOption = FileSystem.EncodingType.Base64;
          } else {
            encodingOption = 'base64';
          }
          
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: encodingOption,
          });
          
          // Determinar el tipo MIME basado en la extensión o tipo del asset
          const mimeType = imageAsset.mimeType || 'image/jpeg';
          const imageBase64 = `data:${mimeType};base64,${base64}`;
          
          setImagenBase64(imageBase64);
          setErrors(prev => ({ ...prev, imagen: '' }));
        } catch (error) {
          console.error('Error convirtiendo imagen a base64:', error);
          setImagenLocal(null);
          Alert.alert(
            'Error', 
            error.message || 'No se pudo procesar la imagen. Por favor, intenta con otra imagen.'
          );
        }
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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        const imageUri = imageAsset.uri;
        
        if (!imageUri) {
          Alert.alert('Error', 'No se pudo obtener la imagen');
          return;
        }

        setImagenLocal(imageUri);
        
        // Convertir imagen a base64
        try {
          // Verificar que el URI existe y es accesible
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (!fileInfo.exists) {
            throw new Error('El archivo de imagen no existe');
          }

          // Usar la sintaxis de string para encoding (más compatible)
          // Verificar si EncodingType existe, si no usar string directamente
          let encodingOption;
          if (FileSystem.EncodingType && FileSystem.EncodingType.Base64) {
            encodingOption = FileSystem.EncodingType.Base64;
          } else {
            encodingOption = 'base64';
          }
          
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: encodingOption,
          });
          
          // Determinar el tipo MIME basado en la extensión o tipo del asset
          const mimeType = imageAsset.mimeType || 'image/jpeg';
          const imageBase64 = `data:${mimeType};base64,${base64}`;
          
          setImagenBase64(imageBase64);
          setErrors(prev => ({ ...prev, imagen: '' }));
        } catch (error) {
          console.error('Error convirtiendo imagen a base64:', error);
          setImagenLocal(null);
          Alert.alert(
            'Error', 
            error.message || 'No se pudo procesar la imagen. Por favor, intenta con otra imagen.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
      console.error(error);
    }
  };

  // Función para eliminar imagen subida
  const eliminarImagen = () => {
    setImagenLocal(null);
    setImagenBase64(null);
    setErrors(prev => ({ ...prev, imagen: '' }));
  };

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack.Screen
        options={{
          title: isEdit ? 'Editar Novedad' : 'Nueva Novedad',
          headerStyle: {
            backgroundColor: '#2e7d32',
          },
          headerTintColor: '#fff',
          headerLeft: () => null,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header informativo */}
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color="#2e7d32" />
                  <Text variant="titleMedium" style={styles.infoTitle}>
                    {isEdit ? 'Editar Novedad Agrícola' : 'Publicar Nueva Novedad'}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.infoText}>
                  {isEdit 
                    ? 'Actualiza la información de esta novedad. Los cambios serán visibles inmediatamente.'
                    : 'Comparte información importante con productores y empresas del sector agropecuario.'
                  }
                </Text>
                {usuario && (
                  <View style={styles.autorInfo}>
                    <Ionicons name="person-circle-outline" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.autorText}>
                      Publicando como: {usuario.nombre}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Campo Título */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="Título de la novedad *"
                value={titulo}
                onChangeText={(text) => {
                  setTitulo(text);
                  if (touched.titulo) validarCampo('titulo', text);
                }}
                onBlur={() => handleBlur('titulo')}
                mode="outlined"
                error={touched.titulo && !!errors.titulo}
                maxLength={200}
                left={<TextInput.Icon icon="format-title" />}
                right={
                  <TextInput.Affix text={contadorCaracteres(titulo, 200)} />
                }
                disabled={isLoading}
              />
              <HelperText type="error" visible={touched.titulo && !!errors.titulo}>
                {errors.titulo}
              </HelperText>
              {!errors.titulo && (
                <HelperText type="info">
                  Escribe un título claro y descriptivo
                </HelperText>
              )}
            </View>

            {/* Campo Descripción */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="Descripción completa *"
                value={descripcion}
                onChangeText={(text) => {
                  setDescripcion(text);
                  if (touched.descripcion) validarCampo('descripcion', text);
                }}
                onBlur={() => handleBlur('descripcion')}
                mode="outlined"
                multiline
                numberOfLines={8}
                error={touched.descripcion && !!errors.descripcion}
                maxLength={5000}
                left={<TextInput.Icon icon="text" />}
                right={
                  <TextInput.Affix text={contadorCaracteres(descripcion, 5000)} />
                }
                disabled={isLoading}
                style={{ minHeight: 150 }}
              />
              <HelperText type="error" visible={touched.descripcion && !!errors.descripcion}>
                {errors.descripcion}
              </HelperText>
              {!errors.descripcion && (
                <HelperText type="info">
                  Describe la novedad con todos los detalles relevantes
                </HelperText>
              )}
            </View>

            {/* Campo Imagen */}
            <View style={styles.fieldContainer}>
              <Card style={styles.imageCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.imageCardTitle}>
                    Imagen de la novedad (opcional)
                  </Text>
                  
                  {/* Selector de tipo de imagen */}
                  <SegmentedButtons
                    value={tipoImagen}
                    onValueChange={(value) => {
                      setTipoImagen(value);
                      // Limpiar errores al cambiar de tipo
                      setErrors(prev => ({ ...prev, imagen: '' }));
                      if (value === 'url') {
                        setImagenLocal(null);
                        setImagenBase64(null);
                      } else {
                        setImagen('');
                      }
                    }}
                    buttons={[
                      {
                        value: 'url',
                        label: 'URL',
                        icon: 'link',
                      },
                      {
                        value: 'subir',
                        label: 'Subir',
                        icon: 'image',
                      },
                    ]}
                    style={styles.segmentedButtons}
                  />

                  {/* Campo URL (si está seleccionado) */}
                  {tipoImagen === 'url' && (
                    <View style={styles.urlContainer}>
                      <TextInput
                        label="URL de la imagen"
                        value={imagen}
                        onChangeText={(text) => {
                          setImagen(text);
                          if (touched.imagen) validarCampo('imagen', text);
                        }}
                        onBlur={() => handleBlur('imagen')}
                        mode="outlined"
                        error={touched.imagen && !!errors.imagen}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        autoCapitalize="none"
                        keyboardType="url"
                        left={<TextInput.Icon icon="image" />}
                        disabled={isLoading}
                        style={styles.urlInput}
                      />
                      <HelperText type="error" visible={touched.imagen && !!errors.imagen}>
                        {errors.imagen}
                      </HelperText>
                      {!errors.imagen && (
                        <HelperText type="info">
                          Ingresa la URL directa de la imagen (debe terminar en .jpg, .png, etc.)
                        </HelperText>
                      )}
                      {!errors.imagen && (
                        <HelperText type="info" style={{ marginTop: 4, fontSize: 12 }}>
                          ⚠️ No uses URLs de páginas (Pinterest, Facebook, etc.). Necesitas la URL directa de la imagen.
                        </HelperText>
                      )}
                    </View>
                  )}

                  {/* Opciones de subir imagen (si está seleccionado) */}
                  {tipoImagen === 'subir' && (
                    <View style={styles.uploadContainer}>
                      {imagenLocal || imagenBase64 ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image
                            source={{ uri: imagenLocal || imagenBase64 }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={eliminarImagen}
                          >
                            <Ionicons name="close-circle" size={24} color="#d32f2f" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.uploadButtonsContainer}>
                          <Button
                            mode="outlined"
                            onPress={seleccionarImagen}
                            disabled={isLoading}
                            icon="image"
                            style={styles.uploadButton}
                          >
                            Seleccionar de Galería
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={tomarFoto}
                            disabled={isLoading}
                            icon="camera"
                            style={styles.uploadButton}
                          >
                            Tomar Foto
                          </Button>
                        </View>
                      )}
                      <HelperText type="error" visible={touched.imagen && !!errors.imagen}>
                        {errors.imagen}
                      </HelperText>
                      {!errors.imagen && !imagenBase64 && (
                        <HelperText type="info">
                          Selecciona una imagen de tu galería o toma una foto
                        </HelperText>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                disabled={isLoading}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
                icon="close"
              >
                Cancelar
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
                labelStyle={styles.submitButtonLabel}
                icon={isEdit ? 'check' : 'plus'}
              >
                {isLoading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Publicar')}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    marginBottom: 24,
    backgroundColor: '#e8f5e9',
    elevation: 0,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  infoText: {
    color: '#555',
    lineHeight: 18,
  },
  autorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
  },
  autorText: {
    color: '#666',
    fontStyle: 'italic',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    borderColor: '#999',
  },
  cancelButtonLabel: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#2e7d32',
    borderRadius: 10,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  imageCardTitle: {
    marginBottom: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  urlContainer: {
    marginTop: 8,
  },
  urlInput: {
    backgroundColor: '#fff',
  },
  uploadContainer: {
    marginTop: 8,
  },
  uploadButtonsContainer: {
    gap: 12,
  },
  uploadButton: {
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 2,
  },
});