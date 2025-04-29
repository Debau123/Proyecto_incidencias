// src/components/IncidenciaDetalleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Incidencia {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'en_progreso' | 'resuelta';
  fecha_creacion: string;
  dispositivo?: {
    modelo: string;
  };
}

interface Props {
  incidencia: Incidencia;
}

export default function IncidenciaDetalleCard({ incidencia }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={20} color="#990066" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.titulo}>{incidencia.titulo}</Text>
        <Text style={styles.modelo}>
          Dispositivo: {incidencia.dispositivo?.modelo || 'Sin modelo'}
        </Text>
        <Text style={styles.estado}>Estado: {incidencia.estado.toUpperCase()}</Text>
        <Text style={styles.fecha}>Creada: {incidencia.fecha_creacion}</Text>
        <Text style={styles.descripcion}>{incidencia.descripcion}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 10,
  },
  backText: {
    marginLeft: 6,
    color: '#990066',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#990066',
    marginBottom: 8,
  },
  modelo: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  estado: {
    fontSize: 14,
    color: '#990066',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 16,
    color: '#333',
  },
});
