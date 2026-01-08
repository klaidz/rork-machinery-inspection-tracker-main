import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Copy, ExternalLink, QrCode } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { getQrImageUrl } from '@/utils/qr';

type Props = {
  title: string;
  subtitle?: string;
  value: string;
  onOpenLink?: () => void;
  testID?: string;
};

export default function QrCodeCard({ title, subtitle, value, onOpenLink, testID }: Props) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const qrUrl = useMemo(() => getQrImageUrl(value, 420), [value]);

  const handleCopy = async () => {
    try {
      console.log('[QrCodeCard] Copy value');
      await Clipboard.setStringAsync(value);
    } catch (e) {
      console.error('[QrCodeCard] Copy failed', e);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: colors.tint + '20' }]}>
            <QrCode color={colors.tint} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.secondary }]}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleCopy}
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            testID={testID ? `${testID}-copy` : undefined}
          >
            <Copy color={colors.text} size={18} />
          </TouchableOpacity>
          {onOpenLink ? (
            <TouchableOpacity
              onPress={onOpenLink}
              style={[styles.actionButton, { backgroundColor: colors.tint, borderColor: colors.tint }]}
              testID={testID ? `${testID}-open` : undefined}
            >
              <ExternalLink color={'#FFFFFF'} size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.qrWrap}>
        <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
      </View>

      <Text style={[styles.value, { color: colors.secondary }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  qrWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  qrImage: {
    width: '100%',
    height: 260,
  },
  value: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
