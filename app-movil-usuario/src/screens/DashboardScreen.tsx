import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DispositivoCard from '../components/DispositivoCard';
import IncidenciaCard from '../components/IncidenciaCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../config';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface Dispositivo {
  id: number;
  tipo_dispositivo: string;
  marca: string;
  modelo: string;
  estado: string;
  numero_serie: string;
  fecha_compra: string;
  fecha_garantia_fin: string;
}

interface Incidencia {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'en_progreso' | 'resuelta';
  fecha_creacion: string;
  updatedAt?: string;
  dispositivo?: {
    modelo: string;
  };
}

export default function DashboardScreen({ navigation }: Props) {
  const isFocused = useIsFocused();

  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [showAbiertas, setShowAbiertas] = useState(true);
  const [showCerradas, setShowCerradas] = useState(true);

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const cargarDatos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      if (!token || !user?.id) {
        navigation.replace('Login');
        return;
      }

      setNombreUsuario(user.username);

      const resDispositivos = await fetch(
        `${API_URL}/api/users/me?populate=dispositivos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataDispositivos = await resDispositivos.json();
      setDispositivos(dataDispositivos.dispositivos || []);

      const resIncidencias = await fetch(
        `${API_URL}/api/incidencias?filters[user][id][$eq]=${user.id}&populate=dispositivo`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataIncidencias = await resIncidencias.json();
      const raw = dataIncidencias.data || [];

      const parsed = raw.map((i: any) => ({
        id: i.id,
        titulo: i.attributes.titulo,
        descripcion: i.attributes.descripcion,
        estado: i.attributes.estado,
        fecha_creacion: i.attributes.fecha_creacion,
        updatedAt: i.attributes.updatedAt,
        dispositivo: {
          modelo: i.attributes.dispositivo?.data?.attributes?.modelo,
        },
      }));

      setIncidencias(parsed);
    } catch (err) {
      console.error('Error al cargar datos', err);
      setDispositivos([]);
      setIncidencias([]);
    }
  };

  useEffect(() => {
    if (isFocused) {
      cargarDatos();
    }
  }, [isFocused]);

  const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((prev) => !prev);
  };

  const dispositivosFiltrados = (dispositivos || []).filter((d) => {
    const texto = `${d.tipo_dispositivo} ${d.marca} ${d.modelo}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const incidenciasFiltradas = incidencias.filter((i) => {
    const texto = `${i.titulo} ${i.descripcion} ${i.dispositivo?.modelo}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const abiertas = incidenciasFiltradas.filter((i) => i.estado !== 'resuelta');
  const cerradas = incidenciasFiltradas.filter((i) => i.estado === 'resuelta');

  if (dispositivos === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando datos…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>
              Hola, <Text style={{ fontWeight: 'bold' }}>{nombreUsuario}</Text>
            </Text>
            <Text style={styles.subtitulo}>SALVADOR INCIDENCIAS APP</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Icon name="log-out-outline" size={24} color="#990066" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Busca entre tus equipos..."
            placeholderTextColor="#999"
            style={{ flex: 1, fontSize: 16 }}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <TouchableOpacity>
            <Icon name="filter-outline" size={22} color="#990066" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💻 Dispositivos ({dispositivosFiltrados.length})</Text>
        </View>
        {dispositivosFiltrados.map((item) => (
          <View key={item.id} style={{ marginBottom: 16 }}>
            <DispositivoCard dispositivo={item} />
          </View>
        ))}

        {abiertas.length > 0 && (
          <>
            <TouchableOpacity onPress={() => toggleSection(setShowAbiertas)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🛠 Incidencias Abiertas ({abiertas.length})</Text>
              <Icon name={showAbiertas ? "chevron-up" : "chevron-down"} size={18} color="#333" />
            </TouchableOpacity>
            {showAbiertas && abiertas.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('DetalleIncidencia', { incidenciaId: item.id })}
                style={{ marginBottom: 16 }}
              >
                <IncidenciaCard incidencia={item} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {cerradas.length > 0 && (
          <>
            <TouchableOpacity onPress={() => toggleSection(setShowCerradas)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📜 Incidencias Cerradas ({cerradas.length})</Text>
              <Icon name={showCerradas ? "chevron-up" : "chevron-down"} size={18} color="#333" />
            </TouchableOpacity>
            {showCerradas && cerradas.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('DetalleIncidencia', { incidenciaId: item.id })}
                style={{ marginBottom: 16 }}
              >
                <IncidenciaCard incidencia={item} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate('CrearIncidencia')}
        style={styles.fab}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  saludo: {
    fontSize: 20,
    color: '#990066',
    marginTop: 4,
  },
  subtitulo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#990066',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
