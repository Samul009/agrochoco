// app/ayuda-soporte.jsx - Pantalla de Ayuda y Soporte
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { List, Card, Divider, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AyudaSoporte() {
  const router = useRouter();

  const abrirEmail = () => {
    const email = 'soporte@agrochoco.com';
    const subject = 'Solicitud de Ayuda - AgroChoco';
    const body = 'Hola, necesito ayuda con:';
    
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(mailto)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailto);
        } else {
          Alert.alert('Error', 'No se puede abrir el cliente de correo. Copia el email: ' + email);
        }
      })
      .catch((err) => {
        console.error('Error abriendo email:', err);
        Alert.alert('Error', 'No se pudo abrir el cliente de correo.');
      });
  };

  const abrirTelefono = () => {
    const telefono = '+57 300 123 4567'; // Número de ejemplo
    const url = `tel:${telefono}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede realizar la llamada. Número: ' + telefono);
        }
      })
      .catch((err) => {
        console.error('Error abriendo teléfono:', err);
      });
  };

  const preguntasFrecuentes = [
    {
      id: 1,
      pregunta: '¿Cómo me registro en la aplicación?',
      respuesta: 'Puedes registrarte desde la pantalla de inicio de sesión, haciendo clic en "Crear cuenta" e ingresando tus datos personales.',
    },
    {
      id: 2,
      pregunta: '¿Cómo cambio mi contraseña?',
      respuesta: 'Ve a Configuración > Seguridad > Cambiar Contraseña e ingresa tu contraseña actual y la nueva contraseña.',
    },
    {
      id: 3,
      pregunta: '¿Cómo me registro como productor?',
      respuesta: 'Desde la pantalla de Productos, busca la opción "Registrarse como Productor", selecciona un producto y completa el formulario de registro.',
    },
    {
      id: 4,
      pregunta: '¿Puedo cambiar mi información personal?',
      respuesta: 'Sí, puedes editar tu perfil desde Configuración > Mi Cuenta > Editar Perfil.',
    },
    {
      id: 5,
      pregunta: '¿Cómo contacto con otros usuarios?',
      respuesta: 'Puedes ver el perfil de otros usuarios desde la lista de productos o novedades, donde podrás encontrar información de contacto.',
    },
  ];

  const [faqExpandido, setFaqExpandido] = useState(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información de Contacto */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Contacto</Text>
            <Divider style={styles.divider} />
            
            <TouchableOpacity style={styles.contactItem} onPress={abrirEmail}>
              <Ionicons name="mail" size={24} color="#2e7d32" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>soporte@agrochoco.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={abrirTelefono}>
              <Ionicons name="call" size={24} color="#2e7d32" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Teléfono</Text>
                <Text style={styles.contactValue}>+57 300 123 4567</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="time" size={24} color="#2e7d32" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Horario de Atención</Text>
                <Text style={styles.contactValue}>Lun - Vie: 8:00 AM - 6:00 PM</Text>
              </View>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Preguntas Frecuentes */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Preguntas Frecuentes</Text>
            <Divider style={styles.divider} />
            
            {preguntasFrecuentes.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqPregunta}
                  onPress={() => setFaqExpandido(faqExpandido === faq.id ? null : faq.id)}
                >
                  <Text style={styles.faqPreguntaText}>{faq.pregunta}</Text>
                  <Ionicons
                    name={faqExpandido === faq.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {faqExpandido === faq.id && (
                  <View style={styles.faqRespuesta}>
                    <Text style={styles.faqRespuestaText}>{faq.respuesta}</Text>
                  </View>
                )}
                {faq.id < preguntasFrecuentes.length && <Divider style={styles.faqDivider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Información de la Aplicación */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Sobre la Aplicación</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Desarrollado por</Text>
              <Text style={styles.infoValue}>Equipo AgroChoco</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.description}>
              AgroChoco es una plataforma diseñada para conectar productores agrícolas
              con compradores interesados en productos locales del Chocó. Facilita la
              gestión de productos, novedades del sector y comunicación entre usuarios.
            </Text>
          </Card.Content>
        </Card>

        {/* Botón de Contacto */}
        <Button
          mode="contained"
          onPress={abrirEmail}
          style={styles.contactButton}
          labelStyle={styles.contactButtonLabel}
          icon="email"
        >
          Enviar Email de Soporte
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿No encuentras lo que buscas? Contáctanos directamente.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  faqItem: {
    marginBottom: 8,
  },
  faqPregunta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  faqPreguntaText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  faqRespuesta: {
    paddingVertical: 12,
    paddingLeft: 8,
  },
  faqRespuestaText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  faqDivider: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'justify',
  },
  contactButton: {
    margin: 16,
    padding: 8,
    backgroundColor: '#2e7d32',
  },
  contactButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

