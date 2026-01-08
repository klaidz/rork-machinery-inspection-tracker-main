import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '@/constants/colors';

interface SignatureDisplayProps {
  signatureData: string;
  width?: number;
  height?: number;
}

export default function SignatureDisplay({ signatureData, width = 200, height = 80 }: SignatureDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  if (!signatureData || typeof signatureData !== 'string' || signatureData === 'undefined' || signatureData === 'null') {
    console.error('[SignatureDisplay] Invalid signature data:', signatureData);
    return null;
  }

  const trimmed = signatureData.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    console.error('[SignatureDisplay] Signature data is not valid JSON format:', trimmed.substring(0, 50));
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || !parsed.paths || !Array.isArray(parsed.paths)) {
      console.error('[SignatureDisplay] Invalid signature format:', parsed);
      return null;
    }
    const { paths, width: originalWidth, height: originalHeight } = parsed;
    
    const scaleX = width / originalWidth;
    const scaleY = height / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledPaths = paths.map((path: string) => {
      return path.replace(/[\d.]+/g, (match) => {
        return (parseFloat(match) * scale).toString();
      });
    });

    return (
      <View style={[styles.container, { borderColor: colors.border }]}>
        <Svg width={width} height={height}>
          {scaledPaths.map((path: string, index: number) => (
            <Path
              key={`path-${index}`}
              d={path}
              stroke={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </Svg>
      </View>
    );
  } catch (error) {
    console.error('[SignatureDisplay] Error parsing signature data:', error);
    console.error('[SignatureDisplay] Raw data (first 100 chars):', signatureData?.substring(0, 100));
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
