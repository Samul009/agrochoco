import React, { useState, useEffect } from 'react';
import { ScrollView, View, useColorScheme, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Provider as PaperProvider, MD3DarkTheme, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import conocimientosDataJSON from '../productos.json';

export default function Configuracion() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Estado para texto de búsqueda y elementos filtrados
  const [textoBuscar, setTextoBuscar] = useState('');
  const [elementosFiltrados, setElementosFiltrados] = useState([]);

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

  // Filtrado en tiempo real
  useEffect(() => {
    const filtrados = conocimientosDataJSON.filter(item =>
      item.titulo.toLowerCase().includes(textoBuscar.toLowerCase())
    );
    setElementosFiltrados(filtrados);
  }, [textoBuscar]);

  return (
    <PaperProvider theme={customDarkTheme}>
      <View style={{ flex: 1, backgroundColor: customDarkTheme.colors.background }}>
        {/* Header con título */}
        <View style={{ 
          paddingTop: 60, 
          paddingBottom: 20, 
          paddingHorizontal: 20,
          backgroundColor: customDarkTheme.colors.background
        }}>
          {/* Botón de retroceso */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}
          >
            <AntDesign name="arrowleft" size={24} color={customDarkTheme.colors.text} />
          </TouchableOpacity>

          <Text variant="headlineMedium" style={{ 
            color: customDarkTheme.colors.text, 
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 10
          }}>
            Lista
          </Text>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Campo de búsqueda */}
          <TextInput
            style={{ 
              marginBottom: 20,
              backgroundColor: customDarkTheme.colors.surface,
              elevation: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
            mode="outlined"
            label=""
            placeholder="Buscar"
            autoCapitalize="none"
            placeholderTextColor={customDarkTheme.colors.onSurfaceVariant}
            value={textoBuscar}
            onChangeText={setTextoBuscar}
            left={<TextInput.Icon icon="magnify" size={20} color={customDarkTheme.colors.onSurfaceVariant} />}
            outlineColor={customDarkTheme.colors.outline}
            activeOutlineColor={customDarkTheme.colors.primary}
            textColor={customDarkTheme.colors.text}
            theme={customDarkTheme}
          />

          {/* Lista de elementos */}
          <View style={{ paddingBottom: 20 }}>
            {elementosFiltrados.map((item, index) => (
              <Card 
                key={item.id} 
                style={{
                  marginBottom: 8,
                  backgroundColor: customDarkTheme.colors.surface,
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  borderRadius: 8,
                  height: 80,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  height: '100%',
                }}>
                  {/* Icono del lado izquierdo */}
                  <View style={{
                    width: 56,
                    height: 56,
                    backgroundColor: customDarkTheme.colors.primary,
                    borderRadius: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <AntDesign name="picture" size={28} color="#ffffff" />
                  </View>

                  {/* Contenido del texto */}
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text variant="titleMedium" style={{
                      color: customDarkTheme.colors.text,
                      fontWeight: '600',
                      marginBottom: 4,
                      fontSize: 16,
                    }}>
                      {item.titulo || 'Sin título'}
                    </Text>
                    <Text 
                      variant="bodySmall" 
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        color: customDarkTheme.colors.onSurfaceVariant,
                        lineHeight: 16,
                        fontSize: 13,
                      }}
                    >
                      {item.descripcion && item.descripcion.length > 50 
                        ? `${item.descripcion.substring(0, 50)}...` 
                        : item.descripcion || 'Descripción del elemento. Lorem ipsum dolor sit amet.'}
                    </Text>
                  </View>

                  {/* Botón de acción */}
                  <View style={{ 
                    marginLeft: 8,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}>
                    <Button
                      mode="contained"
                      onPress={() => router.push(`/detalle-elemento?id=${item.id}`)}
                      style={{
                        backgroundColor: customDarkTheme.colors.primary,
                        borderRadius: 6,
                        minWidth: 60,
                        height: 32,
                        elevation: 0,
                      }}
                      contentStyle={{
                        paddingVertical: 0,
                        paddingHorizontal: 12,
                        height: 32,
                      }}
                      labelStyle={{ 
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#ffffff',
                        lineHeight: 16,
                      }}
                    >
                      Acción
                    </Button>
                  </View>
                </View>
              </Card>
            ))}

            {/* Mensaje cuando no hay resultados */}
            {elementosFiltrados.length === 0 && textoBuscar.length > 0 && (
              <View style={{
                padding: 40,
                alignItems: 'center',
              }}>
                <AntDesign name="search1" size={48} color={customDarkTheme.colors.onSurfaceVariant} />
                <Text style={{ 
                  color: customDarkTheme.colors.onSurfaceVariant, 
                  marginTop: 16, 
                  fontSize: 16 
                }}>
                  No se encontraron resultados
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </PaperProvider>
  );
}