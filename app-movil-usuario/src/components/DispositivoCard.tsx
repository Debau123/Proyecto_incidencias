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
import { format, differenceInDays } from 'date-fns';

type Dispositivo = {
  id: number;
  tipo_dispositivo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  fecha_compra: string;
  fecha_garantia_fin: string;
  fecha_proxima_revision?: string;
};

type Props = {
  dispositivo: Dispositivo;
};

// Activar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const estadoColor: Record<string, string> = {
  operativo: '#16a34a',
  mantenimiento: '#eab308',
  averiado: '#dc2626',
  fuera_servicio: '#dc2626',
};

export default function DispositivoCard({ dispositivo }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = estadoColor[dispositivo.estado] || '#6b7280';

  let diasRestantes = null;
  if (dispositivo.fecha_proxima_revision) {
    const fechaRev = new Date(dispositivo.fecha_proxima_revision);
    const hoy = new Date();
    diasRestantes = differenceInDays(fechaRev, hoy);
  }

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
      <View style={styles.card}>
        {/* Cabecera compacta */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {dispositivo.tipo_dispositivo} - {dispositivo.modelo}
          </Text>
          <View style={[styles.estadoTag, { backgroundColor: color }]}>
            <Text style={styles.estadoText}>
              {dispositivo.estado.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Si está expandida, muestra detalles */}
        {expanded && (
          <>
            <View style={styles.details}>
              <Text style={styles.label}>Marca:</Text>
              <Text style={styles.value}>{dispositivo.marca}</Text>

              <Text style={styles.label}>Nº Serie:</Text>
              <Text style={styles.value}>{dispositivo.numero_serie}</Text>

              <Text style={styles.label}>Compra:</Text>
              <Text style={styles.value}>{dispositivo.fecha_compra}</Text>

              <Text style={styles.label}>Garantía hasta:</Text>
              <Text style={styles.value}>{dispositivo.fecha_garantia_fin}</Text>
            </View>

            {/* Próxima revisión */}
            {dispositivo.fecha_proxima_revision && (
              <View style={styles.revisionBox}>
                <Text style={styles.revisionTitle}>Próxima revisión</Text>
                <Text style={styles.revisionFecha}>
                  {format(new Date(dispositivo.fecha_proxima_revision), 'dd/M/yyyy')}
                  {'  '}
                  <Text
                    style={{
                      color: diasRestantes !== null && diasRestantes < 30 ? '#dc2626' : '#990066',
                    }}
                  >
                    {`Quedan ${diasRestantes} días`}
                  </Text>
                </Text>
              </View>
            )}
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
  details: {
    marginTop: 10,
    gap: 2,
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  value: {
    marginBottom: 4,
    color: '#333',
  },
  revisionBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  revisionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
    color: '#333',
  },
  revisionFecha: {
    fontSize: 14,
    color: '#444',
  },
});
