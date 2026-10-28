import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

let avisando = false;
const avisar = (mensaje: string) => {
  if (avisando) return; // un solo aviso a la vez
  avisando = true;
  Alert.alert('Almacenamiento del teléfono', mensaje, [
    {
      text: 'Entendido',
      onPress: () => {
        avisando = false;
      },
    },
  ]);
};

// ADR-002: un fallo de lectura o escritura se MUESTRA al técnico y no se trata como éxito
export const almacen: StateStorage = {
  getItem: async (clave) => {
    try {
      return await AsyncStorage.getItem(clave);
    } catch {
      avisar('No se pudieron leer los datos guardados en este teléfono.');
      return null;
    }
  },
  setItem: async (clave, valor) => {
    try {
      await AsyncStorage.setItem(clave, valor);
    } catch (e) {
      avisar('No se pudo guardar en este teléfono. Revisa el espacio disponible.');
      throw e;
    }
  },
  removeItem: async (clave) => {
    await AsyncStorage.removeItem(clave);
  },
};
