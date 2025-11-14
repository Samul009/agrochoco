// app/formulario-novedad.jsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, PaperProvider, MD3LightTheme, HelperText, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      setImagen(params.imagen || '');
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
        if (valor.trim() && !isValidUrl(valor.trim())) {
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
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
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
    const imagenValida = validarCampo('imagen', imagen);
    
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
      const novedadData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagen: imagen.trim() || null,
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
    if (titulo.trim() || descripcion.trim() || imagen.trim()) {
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

            {/* Campo Imagen (URL) */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="URL de la imagen (opcional)"
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
              />
              <HelperText type="error" visible={touched.imagen && !!errors.imagen}>
                {errors.imagen}
              </HelperText>
              {!errors.imagen && (
                <HelperText type="info">
                  Usa imágenes de alta calidad en formato JPG o PNG
                </HelperText>
              )}
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
});