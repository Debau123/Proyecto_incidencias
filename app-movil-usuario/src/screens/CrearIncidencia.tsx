import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../config';

export default function CrearIncidenciaScreen({ navigation }: any) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dispositivos, setDispositivos] = useState<any[]>([]);
  const [selectedDispositivo, setSelectedDispositivo] = useState<any>(null);
  const [mostrarDispositivos, setMostrarDispositivos] = useState(false);
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/me?populate=dispositivos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setDispositivos(json.dispositivos || []);
    })();
  }, []);

  const seleccionarImagenGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        selectionLimit: 0,
      });

      if (!result.canceled) {
        setImagenes((prev) => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Error abriendo galería:', error);
    }
  };

  const tomarFotoConCamara = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImagenes((prev) => [...prev, result.assets[0]]);
      }
    } catch (error) {
      console.error('Error abriendo cámara:', error);
    }
  };

  const eliminarImagen = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCrearIncidencia = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!titulo || !descripcion || !selectedDispositivo) {
      Alert.alert('Error', 'Completa todos los campos y selecciona un dispositivo.');
      setIsSubmitting(false);
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const userJson = await AsyncStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    try {
      const crearIncidenciaRes = await fetch(`${API_URL}/api/incidencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            titulo,
            descripcion,
            estado: 'abierta',
            fecha_creacion: new Date().toISOString(),
            user: user.id,
            dispositivo: selectedDispositivo,
          },
        }),
      });

      const crearIncidenciaData = await crearIncidenciaRes.json();

      if (!crearIncidenciaRes.ok) {
        console.error('Error creando incidencia:', crearIncidenciaData);
        Alert.alert('Error', crearIncidenciaData.error?.message || 'Error creando incidencia');
        setIsSubmitting(false);
        return;
      }

      const incidenciaId = crearIncidenciaData.data.id;

      if (imagenes.length > 0) {
        const form = new FormData();
        imagenes.forEach((img, index) => {
          form.append('files', {
            uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
            type: 'image/jpeg',
            name: `foto_${index}.jpg`,
          } as any);
        });

        form.append('ref', 'api::incidencia.incidencia');
        form.append('refId', incidenciaId.toString());
        form.append('field', 'imagen');

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: form,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          console.error('Error subiendo imágenes:', uploadData);
          Alert.alert('Error', uploadData.error?.message || 'Error subiendo imágenes');
          setIsSubmitting(false);
          return;
        }
      }

      try {
        await fetch(`${API_URL}/api/dispositivos/${selectedDispositivo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: { estado: 'averiado' },
          }),
        });
      } catch (error) {
        console.error('Error actualizando dispositivo:', error);
      }

      Alert.alert('¡Listo!', 'Incidencia creada correctamente');
      setIsSubmitting(false);
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Error inesperado:', error);
      Alert.alert('Error', 'Algo salió mal creando la incidencia.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 60 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <Text style={styles.label}>Dispositivo</Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setMostrarDispositivos(!mostrarDispositivos)}
      >
        <Text style={{ color: selectedDispositivo ? '#000' : '#999' }}>
          {selectedDispositivo
            ? (dispositivos.find((d) => d.id === selectedDispositivo)?.modelo || 'Seleccionar dispositivo')
            : 'Seleccionar dispositivo'}
        </Text>
        <Icon
          name={mostrarDispositivos ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {mostrarDispositivos &&
        dispositivos.map((d: any) => (
          <TouchableOpacity
            key={d.id}
            style={styles.opcion}
            onPress={() => {
              setSelectedDispositivo(d.id);
              setMostrarDispositivos(false);
            }}
          >
            <Text>{`${d.tipo_dispositivo} - ${d.marca} ${d.modelo}`}</Text>
          </TouchableOpacity>
        ))}

      <Text style={styles.label}>Imágenes seleccionadas</Text>

      {imagenes.length > 0 && (
        <ScrollView horizontal style={{ marginBottom: 10 }}>
          {imagenes.map((img, index) => (
            <View key={index} style={{ position: 'relative', marginRight: 10 }}>
              <Image
                source={{ uri: img.uri }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <TouchableOpacity
                style={styles.eliminarBoton}
                onPress={() => eliminarImagen(index)}
              >
                <Icon name="close-circle" size={24} color="#ff3333" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.button} onPress={seleccionarImagenGaleria}>
        <Text style={styles.buttonText}>Elegir de galería</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={tomarFotoConCamara}>
        <Text style={styles.buttonText}>Tomar foto con cámara</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20, backgroundColor: isSubmitting ? '#aaa' : '#990066' }]}
        onPress={handleCrearIncidencia}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Creando incidencia...' : 'Crear Incidencia'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  opcion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    backgroundColor: '#990066',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  eliminarBoton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});