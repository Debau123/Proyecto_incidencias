// screens/DispositivoDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'DispositivoDetail'>;

interface Dispositivo {
  id: number;
  attributes: {
    tipo_dispositivo: string;
    marca: string;
    modelo: string;
    estado: string;
    numero_serie: string;
    fecha_compra: string;
    fecha_garantia_fin: string;
    descripcion?: string;
  };
}

export default function DispositivoDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [d, setD] = useState<Dispositivo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setD(json.data);
      } catch (err) {
        console.error('Error al cargar detalle', err);
      }
    })();
  }, [id]);

  if (!d) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { attributes } = d;
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {attributes.tipo_dispositivo} – {attributes.marca} {attributes.modelo}
      </Text>
      <Text>Estado: {attributes.estado.replace('_', ' ')}</Text>
      <Text>Nº Serie: {attributes.numero_serie}</Text>
      <Text>Compra: {attributes.fecha_compra}</Text>
      <Text>Garantía: {attributes.fecha_garantia_fin}</Text>
      {attributes.descripcion && <Text>Descripción: {attributes.descripcion}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
