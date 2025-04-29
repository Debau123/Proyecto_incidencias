import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../config';
import IncidenciaDetalleCard from '../components/IncidenciaDetalleCard';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleIncidencia'>;

interface Comentario {
  id: number;
  contenido: string;
  usuario: {
    id: number;
    username: string;
  };
  parent?: number | null;
  respuestas?: Comentario[];
}

interface IncidenciaConComentarios {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  dispositivo?: {
    modelo: string;
  };
  comentarios: Comentario[];
}

export default function DetalleIncidencia({ route }: Props) {
  const { incidenciaId } = route.params;
  const [incidencia, setIncidencia] = useState<IncidenciaConComentarios | null>(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [respondiendoA, setRespondiendoA] = useState<number | null>(null);

  const cargarIncidencia = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      setUserId(user.id);

      const res = await fetch(
        `${API_URL}/api/incidencias/${incidenciaId}?populate[dispositivo]=*&populate[comentarios][populate]=user,parent`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const comentariosCrudos = data.data.attributes.comentarios?.data || [];

      // Mapear comentarios
      const comentariosMap: { [key: number]: Comentario } = {};
      const comentariosPadre: Comentario[] = [];

      comentariosCrudos.forEach((c: any) => {
        const comentario: Comentario = {
          id: c.id,
          contenido: c.attributes.contenido,
          usuario: {
            id: c.attributes.user?.data?.id ?? 0,
            username: c.attributes.user?.data?.attributes?.username ?? 'Anónimo',
          },
          parent: c.attributes.parent?.data?.id || null,
          respuestas: [],
        };

        comentariosMap[comentario.id] = comentario;
      });

      Object.values(comentariosMap).forEach((comentario) => {
        if (comentario.parent && comentariosMap[comentario.parent]) {
          comentariosMap[comentario.parent].respuestas?.push(comentario);
        } else {
          comentariosPadre.push(comentario);
        }
      });

      setIncidencia({
        id: data.data.id,
        titulo: data.data.attributes.titulo,
        descripcion: data.data.attributes.descripcion,
        estado: data.data.attributes.estado,
        fecha_creacion: data.data.attributes.fecha_creacion,
        dispositivo: {
          modelo: data.data.attributes.dispositivo?.data?.attributes?.modelo,
        },
        comentarios: comentariosPadre,
      });
    } catch (error) {
      console.error('Error al cargar la incidencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      const res = await fetch(`${API_URL}/api/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            contenido: nuevoComentario,
            user: user.id,  // ✅ CAMBIADO aquí
            incidencia: incidenciaId,
            parent: respondiendoA,
          },
        }),
      });

      if (res.ok) {
        setNuevoComentario('');
        setRespondiendoA(null);
        cargarIncidencia();
      }
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    }
  };

  const handleEliminarComentario = async (comentarioId: number) => {
    Alert.alert('¿Eliminar?', '¿Seguro que quieres borrar este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/comentarios/${comentarioId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              cargarIncidencia();
            }
          } catch (error) {
            console.error('Error al borrar comentario:', error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    cargarIncidencia();
  }, [incidenciaId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando incidencia...</Text>
      </View>
    );
  }

  if (!incidencia) {
    return (
      <View style={styles.center}>
        <Text>No se pudo cargar la incidencia.</Text>
      </View>
    );
  }

  const renderComentario = (comentario: Comentario, esRespuesta = false) => (
    <View
      key={comentario.id}
      style={[
        styles.comentarioCard,
        esRespuesta && styles.respuestaCard,
      ]}
    >
      <Text style={styles.comentarioAutor}>{comentario.usuario.username}</Text>
      <Text style={styles.comentarioTexto}>{comentario.contenido}</Text>
      <View style={styles.comentarioBotones}>
        <TouchableOpacity onPress={() => setRespondiendoA(comentario.id)}>
          <Text style={styles.link}>Responder</Text>
        </TouchableOpacity>
        {userId === comentario.usuario.id && (
          <TouchableOpacity onPress={() => handleEliminarComentario(comentario.id)}>
            <Text style={[styles.link, { color: 'red' }]}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
      {comentario.respuestas?.map((r) => renderComentario(r, true))}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <IncidenciaDetalleCard incidencia={incidencia} />

      <View style={styles.comentariosContainer}>
        <Text style={styles.comentariosTitulo}>💬 Comentarios</Text>
        {incidencia.comentarios.length > 0 ? (
          incidencia.comentarios.map((c) => renderComentario(c))
        ) : (
          <Text style={{ fontStyle: 'italic', color: '#666' }}>No hay comentarios todavía.</Text>
        )}
      </View>

      <View style={styles.nuevoComentarioContainer}>
        <Text style={styles.nuevoComentarioLabel}>
          {respondiendoA ? 'Responder al comentario' : 'Añadir un comentario:'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu comentario"
          value={nuevoComentario}
          onChangeText={setNuevoComentario}
          multiline
        />
        {respondiendoA && (
          <TouchableOpacity onPress={() => setRespondiendoA(null)}>
            <Text style={[styles.link, { marginBottom: 10 }]}>Cancelar respuesta</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btn} onPress={handleEnviarComentario}>
          <Text style={styles.btnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  comentariosContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  comentariosTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#990066',
  },
  comentarioCard: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  respuestaCard: {
    marginLeft: 20,
    backgroundColor: '#e8e8e8',
  },
  comentarioAutor: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#333',
  },
  comentarioBotones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  nuevoComentarioContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  nuevoComentarioLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  btn: {
    backgroundColor: '#990066',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    color: '#990066',
    fontWeight: '600',
    marginRight: 20,
  },
});
