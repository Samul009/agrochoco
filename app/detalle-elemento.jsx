import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import conocimientosDataJSON from '../productos.json';

export default function DetalleElemento() {
  const { id } = useLocalSearchParams(); // recibe el parámetro
  const elemento = conocimientosDataJSON.find(item => item.id.toString() === id);

  if (!elemento) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121420' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Elemento no encontrado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: elemento.titulo,
          headerStyle: { backgroundColor: '#121420' },
          headerTintColor: '#ffffff',
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor: '#121420' }}>
        <View style={{ padding: 20 }}>
          {/* Icono o imagen */}
          <View
            style={{
              backgroundColor: '#1e1e2e',
              borderRadius: 100,
              width: 180,
              height: 180,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: 40,
              marginBottom: 30,
            }}
          >
            <AntDesign name="picture" size={100} color="white" />
          </View>

          {/* Título */}
          <Text
            variant="displaySmall"
            style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#ffffff' }}
          >
            {elemento.titulo}
          </Text>

          {/* Precio */}
          {elemento.precio && (
            <Text
              variant="headlineMedium"
              style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#ffffff' }}
            >
              {elemento.precio}
            </Text>
          )}

          {/* Descripción */}
          <Text
            variant="bodyLarge"
            style={{
              color: '#cccccc',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            {elemento.descripcion}
          </Text>

          {/* Botón */}
          <Button
            mode="contained"
            onPress={() => console.log(`Acción en ${elemento.titulo}`)}
            style={{
              backgroundColor: '#4267B2',
              borderRadius: 10,
              paddingVertical: 8,
              width: '80%',
              alignSelf: 'center',
            }}
            labelStyle={{ fontSize: 18, color: '#ffffff' }}
          >
            Acción
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
