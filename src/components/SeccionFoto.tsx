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

  // Android puede cerrar la app mientras se abre la cámara: aquí se recupera esa foto
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
        <Text style={ui.etiqueta}>Evidencia fotográfica del medidor</Text>
        <Text
          style={[
            ui.sello,
            {
              color: obligatoria ? c.error : c.textSecondary,
              borderColor: obligatoria ? c.error : c.linea,
              backgroundColor: obligatoria ? '#FDF1F0' : c.background,
            },
          ]}>
          {obligatoria ? 'OBLIGATORIA' : 'OPCIONAL'}
        </Text>
      </View>

      <Text style={s.texto}>
        La fotografía respalda el estado físico de la unidad o el consumo registrado ante reclamos comerciales. Se conserva en el almacenamiento privado de este dispositivo.
      </Text>

      {uri && (
        <View style={s.marcoFoto}>
          <Image source={{ uri }} style={s.foto} accessibilityLabel="Foto del medidor" />
          <Text style={s.pieFoto}>Archivo local: {fotoNombre}</Text>
        </View>
      )}

      <Boton
        titulo={uri ? 'Volver a capturar fotografía' : 'Capturar fotografía con cámara'}
        tipo={uri ? 'borde' : 'laton'}
        onPress={tomar}
      />
      {!!fallo && <Text style={ui.error}>▲ {fallo}</Text>}

      {mostrarDenegado && (
        <View style={s.aviso}>
          <Text style={s.avisoTitulo}>PERMISO DE CÁMARA DENEGADO</Text>
          <Text style={s.texto}>
            Necesitamos acceso a la cámara para fotografiar el medidor y respaldar la inspección en campo ante posibles reclamos.{' '}
            {obligatoria
              ? 'En este caso la foto es obligatoria (por medidor dañado o consumo anómalo), por lo que no podrás guardar la lectura hasta conceder el permiso.'
              : 'En este caso la foto es opcional: puedes continuar y guardar la lectura sin ella.'}
          </Text>
          <Boton
            titulo="Abrir ajustes del teléfono"
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
  marcoFoto: { gap: 4 },
  foto: {
    width: '100%',
    height: 210,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.linea,
    backgroundColor: c.linea,
  },
  pieFoto: { fontSize: 11, color: c.textSecondary },
  aviso: {
    borderWidth: 1.5,
    borderColor: c.alerta,
    borderRadius: 6,
    padding: 12,
    gap: 8,
    backgroundColor: '#FFF7ED',
  },
  avisoTitulo: { color: c.alerta, fontWeight: '800', fontSize: 13 },
});
