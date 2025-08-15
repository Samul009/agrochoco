import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { Text, Button, PaperProvider, MD3DarkTheme, Card, IconButton } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import conocimientosDataJSON from '../productos.json';

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

export default function ConocimientosPrevios() {
  const router = useRouter();
  const [elementos, setElementos] = useState([]);
  const [tab, setTab] = useState('inicio');

  useEffect(() => {
    const datosIniciales = conocimientosDataJSON.map(item => ({
      ...item,
      mostrarTodo: false
    }));
    setElementos(datosIniciales);
  }, []);

  const toggleMostrarTodo = (id) => {
    setElementos(prev =>
      prev.map(el =>
        el.id === id ? { ...el, mostrarTodo: !el.mostrarTodo } : el
      )
    );
  };

  const getTruncatedText = (text, shouldTruncate) => {
    if (shouldTruncate && text.length > 30) {
      return text.substring(0, 30);
    }
    return text;
  };

  return (
    <PaperProvider theme={customDarkTheme}>
      <>
        <Stack.Screen
          options={{
            title: 'Home',
            headerShown: true,
            headerStyle: { backgroundColor: '#121420' },
            headerTintColor: '#fff',
          }}
        />

        {/* Botones Inicio */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingTop: 10 }}>
          <Button
            mode={tab === 'inicio' ? 'contained' : 'outlined'}
            onPress={() => setTab('inicio')}
            style={{
              borderRadius: 20,
              marginRight: 10,
              borderColor: customDarkTheme.colors.outline,
            }}
            labelStyle={{
              color: tab === 'inicio' ? '#fff' : customDarkTheme.colors.text,
            }}
          >
            Inicio
          </Button>
          <Button
            mode={tab === 'buscar' ? 'contained' : 'outlined'}
            onPress={() => router.push('/lista-elementos')}
            style={{
              borderRadius: 20,
              borderColor: customDarkTheme.colors.outline,
            }}
            labelStyle={{
              color: tab === 'buscar' ? '#fff' : customDarkTheme.colors.text,
            }}
          >
            Buscar
          </Button>
        </View>

        {/* Imagen ilustrativa */}
        <View style={{ alignItems: 'center', marginVertical: 15 }}>
          <Image
            source={require('./imagenes/img.jpg')}
            style={{ width: 200, height: 150, resizeMode: 'contain' }}
          />
        </View>

        <ScrollView style={{ backgroundColor: customDarkTheme.colors.background }}>
          <View style={{ padding: 15 }}>
            {elementos.map((elemento) => (
              <Card
                key={elemento.id}
                style={{
                  backgroundColor: customDarkTheme.colors.surface,
                  marginBottom: 15,
                  borderRadius: 10,
                }}
                mode="contained"
              >
                <View style={{ flexDirection: 'row', padding: 10 }}>
                  <Image
                    source={{ uri: elemento.urlImagen }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: 'bold',
                        color: customDarkTheme.colors.text,
                        marginBottom: 5,
                      }}
                    >
                      {elemento.titulo}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: customDarkTheme.colors.onSurfaceVariant,
                        marginBottom: 5,
                      }}
                    >
                      {getTruncatedText(elemento.descripcion, !elemento.mostrarTodo)}
                      {!elemento.mostrarTodo && elemento.descripcion.length > 30 && '...'}
                    </Text>
                    {elemento.descripcion.length > 30 && (
                      <Button
                        mode="text"
                        onPress={() => toggleMostrarTodo(elemento.id)}
                        labelStyle={{
                          color: customDarkTheme.colors.primary,
                          fontSize: 14,
                        }}
                        contentStyle={{ paddingHorizontal: 0 }}
                      >
                        {elemento.mostrarTodo ? 'Ver menos' : 'Ver más'}
                      </Button>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 8,
            backgroundColor: customDarkTheme.colors.surface,
            borderTopWidth: 1,
            borderColor: customDarkTheme.colors.outline,
          }}
        >
          <IconButton
            icon="home"
            iconColor={customDarkTheme.colors.primary}
            size={24}
            onPress={() => router.push('/')} // vuelve al inicio
          />
          <IconButton
            icon="magnify"
            iconColor={customDarkTheme.colors.onSurfaceVariant}
            size={24}
            onPress={() => router.push('/buscar')} // va a búsqueda
          />
          <IconButton
            icon="bell-outline"
            iconColor={customDarkTheme.colors.onSurfaceVariant}
            size={24}
            onPress={() => router.push('/notificaciones')}
          />
          <IconButton
            icon="account"
            iconColor={customDarkTheme.colors.onSurfaceVariant}
            size={24}
            onPress={() => router.push('/perfil')}
          />
        </View>
      </>
    </PaperProvider>
  );
}
