import React from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, List, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ListaServicios() {
  const router = useRouter();

// Tema oscuro personalizado
  const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      background: '#121420',
      surface: '#1e1e2e',
      primary: '#bb86fc',
      text: '#ffffff',
      onSurface: '#ffffff',
      onBackground: '#ffffff',
      outline: '#64748b',
      onSurfaceVariant: '#9ca3af',
    },
  };

  // Estilos dependientes del tema
  const listStyle = {
    backgroundColor: customDarkTheme.colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
  };

  const itemDividerStyle = {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,116,139,0.3)',
  };

  // Array con la información de los servicios
  const servicios = [
    {
      title: 'Servicio de Notificación Telefónica',
      description: 'Abrir servicios telefónicos para alertas de dispositivos...',
      icon: 'phone-outline',
      color: '#8BC34A',
      action: () => router.push('/servicios/notificaciones'),
    },
    {
      title: 'Protección inteligente',
      description: 'Aplicación de alarma para el hogar...',
      icon: 'shield-outline',
      color: '#64B5F6',
      action: () => router.push('/servicios/proteccion'),
    },
    {
      title: 'Compras',
      description: 'Encuentra rápidamente productos y marcas...',
      icon: 'cart-outline',
      color: '#FFB300',
      action: () => router.push('/servicios/compras'),
    },
    {
      title: 'Maestro de Iluminación',
      description: 'Proporcione soluciones de iluminación personalizadas...',
      icon: 'lightbulb-outline',
      color: '#9C27B0',
      action: () => router.push('/servicios/iluminacion'),
    },
    {
      title: 'Asistente de voz de terceros',
      description: 'Utiliza altavoces inteligentes...',
      icon: 'home-account',
      color: '#42A5F5',
      action: () => router.push('/servicios/asistentes'),
    },
  ];

  return (
    <PaperProvider theme={customDarkTheme}>
      <ScrollView style={{ flex: 1, backgroundColor: customDarkTheme.colors.background }}>
        <View style={{ padding: 20, paddingTop: 60 }}>
          {/* Iconos superiores */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            {/* Ícono de Home */}
            <TouchableOpacity onPress={() => router.push('/app')}>
              <MaterialCommunityIcons name="home-outline" size={28} color={customDarkTheme.colors.text} />
            </TouchableOpacity>

            {/* Ícono de Configuración */}
            <TouchableOpacity onPress={() => router.push('/configuracion')}>
              <MaterialCommunityIcons name="cog-outline" size={28} color={customDarkTheme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Título */}
          <Text
            variant="headlineLarge"
            style={{ fontWeight: 'bold', marginBottom: 20, color: customDarkTheme.colors.text }}
          >
            Lista de servicios
          </Text>

          {/* Lista generada desde array */}
          <List.Section style={listStyle}>
            {servicios.map((servicio, index) => (
              <List.Item
                key={servicio.title}
                title={servicio.title}
                description={servicio.description}
                left={props => <List.Icon {...props} icon={servicio.icon} color={servicio.color} />}
                right={props => <List.Icon {...props} icon="chevron-right" color={customDarkTheme.colors.text} />}
                onPress={servicio.action}
                titleStyle={{ color: customDarkTheme.colors.text }}
                descriptionStyle={{ color: customDarkTheme.colors.onSurfaceVariant }}
                style={index < servicios.length - 1 ? itemDividerStyle : null}
              />
            ))}
          </List.Section>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}