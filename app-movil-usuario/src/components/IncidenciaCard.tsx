import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 👈 añadido
import { format } from 'date-fns';

type Incidencia = {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'en_progreso' | 'resuelta';
  fecha_creacion: string;
  updatedAt?: string;
  dispositivo?: {
    modelo: string;
  };
};

type Props = {
  incidencia: Incidencia;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const estadoColor: Record<string, string> = {
  abierta: '#eab308',
  en_progreso: '#3b82f6',
  resuelta: '#16a34a',
};

export default function IncidenciaCard({ incidencia }: Props) {
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation<any>(); // 👈 añadido para navegación
  const color = estadoColor[incidencia.estado] || '#6b7280';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const irAlDetalle = () => {
    navigation.navigate('DetalleIncidencia', { incidenciaId: incidencia.id });
  };

  return (
    <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
      <View style={styles.card}>
        {/* Cabecera plegada */}
        <View style={styles.header}>
          <Text style={styles.title}>{incidencia.titulo}</Text>
          <View style={[styles.estadoTag, { backgroundColor: color }]}>
            <Text style={styles.estadoText}>
              {incidencia.estado.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {expanded && (
          <>
            <View style={styles.info}>
              <Text style={styles.label}>Dispositivo:</Text>
              <Text style={styles.value}>{incidencia.dispositivo?.modelo ?? 'Sin dispositivo'}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Fecha creación:</Text>
              <Text style={styles.value}>{format(new Date(incidencia.fecha_creacion), 'dd/M/yyyy')}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Descripción:</Text>
              <Text style={styles.value}>{incidencia.descripcion}</Text>
            </View>

            {incidencia.estado === 'resuelta' && incidencia.updatedAt && (
              <View style={styles.info}>
                <Text style={styles.label}>Resuelta el:</Text>
                <Text style={[styles.value, { color: '#16a34a' }]}>
                  {format(new Date(incidencia.updatedAt), 'dd/M/yyyy')}
                </Text>
              </View>
            )}

            {/* 🔥 Botón de ir al detalle */}
            <TouchableOpacity onPress={irAlDetalle} style={styles.detalleBtn}>
              <Text style={styles.detalleBtnText}>Ir al detalle completo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  estadoTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  estadoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  info: {
    marginTop: 6,
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  value: {
    color: '#333',
    marginTop: 2,
  },
  detalleBtn: {
    marginTop: 12,
    backgroundColor: '#990066',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detalleBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
