// app/registro-productor.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function RegistroProductor() {
  const router = useRouter();
  const { producto_id, nombre } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    area_cultivada: "",
    produccion_actual: "",
    fecha_inicio_produccion: "",
    notas: "",
  });

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const userData = await AsyncStorage.getItem("usuarioLogueado");
      if (userData) {
        const user = JSON.parse(userData);
        setUsuario(user);
        console.log('👤 Usuario cargado:', user.nombre);
      } else {
        Alert.alert(
          'Sesión requerida',
          'Debes iniciar sesión para registrarte como productor',
          [
            { text: 'Cancelar', onPress: () => router.back() },
            { text: 'Iniciar sesión', onPress: () => router.replace('/inicio-sesion') }
          ]
        );
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!usuario) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    if (!formData.area_cultivada) {
      Alert.alert('Campo requerido', 'Por favor ingresa el área cultivada');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        usuario_id: usuario.id,
        producto_id: parseInt(producto_id),
        area_cultivada: parseFloat(formData.area_cultivada) || null,
        produccion_actual: parseFloat(formData.produccion_actual) || null,
        fecha_inicio_produccion: formData.fecha_inicio_produccion || null,
        notas: formData.notas || null,
      };

      console.log('📤 Enviando registro:', dataToSend);

      await apiRequest(API_ENDPOINTS.PRODUCTORES_PRODUCTOS, {
        method: 'POST',
        body: JSON.stringify(dataToSend),
      });

      Alert.alert(
        '¡Éxito!',
        `Te has registrado como productor de ${nombre}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error registrando productor:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo completar el registro'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrarme como Productor</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4caf50" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Producto: {nombre}</Text>
            <Text style={styles.infoText}>
              Completa la información para registrarte como productor de este producto
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Área cultivada (hectáreas) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2.5"
              keyboardType="decimal-pad"
              value={formData.area_cultivada}
              onChangeText={(value) => handleChange('area_cultivada', value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Producción actual (toneladas)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5.0"
              keyboardType="decimal-pad"
              value={formData.produccion_actual}
              onChangeText={(value) => handleChange('produccion_actual', value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fecha inicio de producción</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-DD (Ej: 2024-01-15)"
              value={formData.fecha_inicio_produccion}
              onChangeText={(value) => handleChange('fecha_inicio_produccion', value)}
            />
            <Text style={styles.hint}>Formato: Año-Mes-Día</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Información adicional sobre tu producción..."
              multiline
              numberOfLines={4}
              value={formData.notas}
              onChangeText={(value) => handleChange('notas', value)}
            />
          </View>

          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoTitle}>Información de contacto</Text>
            <Text style={styles.userInfoText}>📧 {usuario.email}</Text>
            {usuario.telefono && (
              <Text style={styles.userInfoText}>📱 {usuario.telefono}</Text>
            )}
            {usuario.direccion && (
              <Text style={styles.userInfoText}>📍 {usuario.direccion}</Text>
            )}
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => {
                Alert.alert(
                  'Editar perfil',
                  'Para actualizar tu información de contacto, ve a tu perfil',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.editProfileText}>Editar información</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Registrarme</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#e8f5e9",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#f44336",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  userInfoCard: {
    backgroundColor: "#fff3e0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e65100",
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  editProfileButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  editProfileText: {
    fontSize: 14,
    color: "#ff9800",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4caf50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});7841