import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { c, ui } from '@/constants/estilos';
import { guardarFotoPermanente, uriFoto } from '@/services/fotos';
import { Boton } from './Boton';

type Props = {
  fotoNombre: string | null;
  obligatoria: boolean;
  idLocal: string;
  alCambiar: (nombre: string) => void;
};

export function SeccionFoto({ fotoNombre, obligatoria, idLocal, alCambiar }: Props) {
  const [permiso, pedirPermiso] = ImagePicker.useCameraPermissions();
  const [denegado, setDenegado] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  const guardar = (uri: string) => {
    try {
      alCambiar(guardarFotoPermanente(uri, idLocal));
      setFallo(null);
    } catch {
      setFallo('No se pudo guardar la foto en el teléfono. Inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    ImagePicker.getPendingResultAsync()
      .then((r) => {
        if (r && 'assets' in r && !r.canceled) guardar(r.assets[0].uri);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tomar = async () => {
    if (!permiso?.granted) {
      const r = await pedirPermiso();
      if (!r.granted) {
        setDenegado(true);
        return;
      }
    }
    setDenegado(false);
    const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!r.canceled) guardar(r.assets[0].uri);
  };

  const uri = uriFoto(fotoNombre);
  const mostrarDenegado = (denegado || permiso?.status === 'denied') && !permiso?.granted;

  return (
    <View style={ui.panel}>
      <View style={ui.panelCabecera}>
        <Text style={ui.etiqueta}>Fotografía del medidor</Text>
        <Text
          style={[
            ui.sello,
            {
              color: obligatoria ? c.error : c.textSecondary,
              backgroundColor: obligatoria ? '#FEE2E2' : '#F1F5F9',
            },
          ]}>
          {obligatoria ? 'Obligatoria' : 'Opcional'}
        </Text>
      </View>

      <Text style={s.texto}>
        Toma una fotografía clara del medidor como respaldo de la lectura registrada.
      </Text>

      {uri && (
        <Image source={{ uri }} style={s.foto} accessibilityLabel="Foto del medidor" />
      )}

      <Boton
        titulo={uri ? 'Tomar otra fotografía' : 'Abrir cámara y tomar foto'}
        tipo={uri ? 'borde' : 'primario'}
        onPress={tomar}
      />
      {!!fallo && <Text style={ui.error}>{fallo}</Text>}

      {mostrarDenegado && (
        <View style={s.aviso}>
          <Text style={s.avisoTitulo}>Permiso de cámara desactivado</Text>
          <Text style={s.texto}>
            Necesitamos acceso a la cámara para fotografiar el medidor como respaldo.{' '}
            {obligatoria
              ? 'En este caso la foto es obligatoria, por lo que debes habilitar el permiso para poder guardar.'
              : 'En este caso la foto es opcional, así que puedes guardar la lectura sin ella.'}
          </Text>
          <Boton
            titulo="Abrir configuración del teléfono"
            tipo="borde"
            onPress={() => Linking.openSettings()}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  texto: { color: c.textSecondary, fontSize: 13, lineHeight: 19 },
  foto: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  aviso: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    backgroundColor: '#FFFBEB',
  },
  avisoTitulo: { color: c.alerta, fontWeight: '700', fontSize: 14 },
});
