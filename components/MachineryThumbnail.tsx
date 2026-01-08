import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Tractor, Container, TruckIcon, Boxes, Car } from 'lucide-react-native';
import { MachineryType } from '@/types';
import Colors from '@/constants/colors';

interface MachineryThumbnailProps {
  type: MachineryType;
  photoUrl?: string;
  size?: number;
  tintColor?: string;
}

export default function MachineryThumbnail({
  type,
  photoUrl,
  size = 64,
  tintColor = Colors.light.tint,
}: MachineryThumbnailProps) {
  const getMachineryIcon = (machineType: MachineryType) => {
    switch (machineType) {
      case 'tractor':
        return Tractor;
      case 'implement':
        return Container;
      case '8_wheeler':
        return TruckIcon;
      case 'hgv':
        return TruckIcon;
      case 'jcb':
        return Boxes;
      case 'company_car':
        return Car;
      case 'other_machinery':
        return Boxes;
      default:
        return TruckIcon;
    }
  };

  const Icon = getMachineryIcon(type);

  if (photoUrl) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image
          source={{ uri: photoUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tintColor + '20' },
      ]}
    >
      <Icon color={tintColor} size={size * 0.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
