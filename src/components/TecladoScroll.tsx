import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ui } from '@/constants/estilos';

type Props = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  desplazarAlAbrir?: number | 'final';
};

export function TecladoScroll({
  children,
  contentContainerStyle,
  desplazarAlAbrir = 220,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [alturaTeclado, setAlturaTeclado] = useState(0);

  useEffect(() => {
    const eventoMostrar = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const eventoOcultar = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subMostrar = Keyboard.addListener(eventoMostrar, (e) => {
      const alto = e.endCoordinates?.height ?? 280;
      setAlturaTeclado(alto);
      setTimeout(() => {
        if (desplazarAlAbrir === 'final') {
          scrollRef.current?.scrollToEnd({ animated: true });
        } else {
          scrollRef.current?.scrollTo({ y: desplazarAlAbrir, animated: true });
        }
      }, 100);
    });

    const subOcultar = Keyboard.addListener(eventoOcultar, () => {
      setAlturaTeclado(0);
    });

    return () => {
      subMostrar.remove();
      subOcultar.remove();
    };
  }, [desplazarAlAbrir]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        style={ui.pantalla}
        contentContainerStyle={[
          ui.contenido,
          contentContainerStyle,
          alturaTeclado > 0 && { paddingBottom: alturaTeclado + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
