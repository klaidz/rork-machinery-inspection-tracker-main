import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { X, QrCode, Camera } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { CameraView, BarcodeScanningResult } from 'expo-camera';

export type QrScanResult = {
  raw: string;
};

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onScanned: (result: QrScanResult) => void;
};

export default function QrScannerModal({
  visible,
  title,
  subtitle,
  onClose,
  onScanned,
}: Props) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [manualValue, setManualValue] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const headerTitle = title ?? 'Scan QR Code';
  const headerSubtitle = subtitle ?? 'Point the camera at the code';

  const handleBarcodeScanned = useCallback(
    (res: BarcodeScanningResult) => {
      if (isBusy) return;
      const raw = res.data?.toString?.() ?? '';
      if (!raw) return;
      console.log('[QrScannerModal] Scanned barcode', { raw, type: res.type });
      setIsBusy(true);
      onScanned({ raw });
      setTimeout(() => setIsBusy(false), 1200);
    },
    [isBusy, onScanned]
  );

  const webHint = useMemo(() => {
    if (Platform.OS !== 'web') return null;
    return (
      <View style={[styles.webHint, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.webHintRow}>
          <QrCode color={colors.tint} size={18} />
          <Text style={[styles.webHintTitle, { color: colors.text }]}>Web scanning</Text>
        </View>
        <Text style={[styles.webHintText, { color: colors.secondary }]}>Paste the QR content or link below.</Text>
      </View>
    );
  }, [colors]);

  const handleManualSubmit = useCallback(() => {
    const raw = manualValue.trim();
    if (!raw) {
      Alert.alert('Missing value', 'Paste the QR code data/link first.');
      return;
    }
    console.log('[QrScannerModal] Manual submit', { raw });
    onScanned({ raw });
  }, [manualValue, onScanned]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}> 
          <View style={[styles.header, { borderBottomColor: colors.border }]}> 
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: colors.tint + '22' }]}> 
                <Camera color={colors.tint} size={18} />
              </View>
              <View style={styles.headerTextBlock}>
                <Text style={[styles.title, { color: colors.text }]}>{headerTitle}</Text>
                <Text style={[styles.subtitle, { color: colors.secondary }]}>{headerSubtitle}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="qr-scanner-close">
              <X color={colors.text} size={22} />
            </TouchableOpacity>
          </View>

          {Platform.OS !== 'web' ? (
            <View style={styles.cameraWrap}>
              <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={handleBarcodeScanned}
              />
              <View style={styles.cameraOverlay} pointerEvents="none">
                <View style={[styles.scanFrame, { borderColor: colors.tint }]} />
                <Text style={[styles.cameraHint, { color: '#FFFFFF' }]}>Align the QR code inside the frame</Text>
              </View>
            </View>
          ) : (
            <View style={styles.webContent}>
              {webHint}
              <TextInput
                value={manualValue}
                onChangeText={setManualValue}
                placeholder="Paste QR text / link…"
                placeholderTextColor={colors.secondary}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
                autoCapitalize="none"
                autoCorrect={false}
                testID="qr-manual-input"
              />

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={handleManualSubmit}
                testID="qr-manual-submit"
              >
                <Text style={styles.primaryButtonText}>Use this QR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    minHeight: 420,
    maxHeight: '92%',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  cameraWrap: {
    height: 520,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  scanFrame: {
    width: '78%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 3,
  },
  cameraHint: {
    fontSize: 13,
    fontWeight: '700' as const,
    opacity: 0.95,
  },
  webContent: {
    padding: 18,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800' as const,
  },
  webHint: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  webHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webHintTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  webHintText: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
});
