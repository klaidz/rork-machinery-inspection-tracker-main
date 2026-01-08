import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  useColorScheme,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '@/constants/colors';
import { X, RotateCcw } from 'lucide-react-native';

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
}

interface Point {
  x: number;
  y: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_PADDING = 24;
const SIGNATURE_WIDTH = SCREEN_WIDTH - (MODAL_PADDING * 2) - 40;
const SIGNATURE_HEIGHT = 300;

export default function SignatureModal({ visible, onClose, onSave }: SignatureModalProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef<Point[]>([]);
  const [pathKey, setPathKey] = useState(0);

  const canvasRef = useRef<View>(null);
  const canvasLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const getRelativePosition = (evt: any) => {
    if (Platform.OS === 'web') {
      const touch = evt.nativeEvent.touches?.[0] || evt.nativeEvent;
      const x = touch.pageX - canvasLayoutRef.current.x;
      const y = touch.pageY - canvasLayoutRef.current.y;
      return { x, y };
    } else {
      return {
        x: evt.nativeEvent.locationX,
        y: evt.nativeEvent.locationY,
      };
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { x, y } = getRelativePosition(evt);
        currentPath.current = [{ x, y }];
      },
      onPanResponderMove: (evt) => {
        const { x, y } = getRelativePosition(evt);
        
        currentPath.current.push({ x, y });
        
        const pathString = generatePathString(currentPath.current);
        setPaths((prevPaths) => {
          const newPaths = [...prevPaths];
          newPaths[newPaths.length] = pathString;
          return newPaths.slice(0, -1).concat([pathString]);
        });
      },
      onPanResponderRelease: () => {
        if (currentPath.current.length > 0) {
          const pathString = generatePathString(currentPath.current);
          setPaths((prevPaths) => [...prevPaths.filter((p) => p !== ''), pathString]);
          currentPath.current = [];
          setPathKey((prev) => prev + 1);
        }
      },
    })
  ).current;

  const generatePathString = (points: Point[]): string => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  const handleClear = () => {
    setPaths([]);
    currentPath.current = [];
    setPathKey((prev) => prev + 1);
  };

  const handleSave = () => {
    if (paths.length === 0) {
      return;
    }
    
    const signatureData = JSON.stringify({ paths, width: SIGNATURE_WIDTH, height: SIGNATURE_HEIGHT });
    onSave(signatureData);
    handleClear();
    onClose();
  };

  const handleCancel = () => {
    handleClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Draw Your Signature</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View
            ref={canvasRef}
            style={[
              styles.signatureCanvas,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onLayout={() => {
              canvasRef.current?.measure((fx, fy, w, h, px, py) => {
                canvasLayoutRef.current = { x: px, y: py, width: w, height: h };
                console.log('SignatureModal: Canvas layout measured:', { x: px, y: py, width: w, height: h });
              });
            }}
            {...panResponder.panHandlers}
          >
            <Svg width={SIGNATURE_WIDTH} height={SIGNATURE_HEIGHT} key={pathKey}>
              {paths.map((path, index) => (
                <Path
                  key={`path-${index}`}
                  d={path}
                  stroke={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            </Svg>
            {paths.length === 0 && (
              <View style={styles.placeholderContainer}>
                <Text style={[styles.placeholderText, { color: colors.secondary }]}>
                  Sign here with your finger
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleClear}
            >
              <RotateCcw size={20} color={colors.text} />
              <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: paths.length === 0 ? colors.border : colors.tint },
              ]}
              onPress={handleSave}
              disabled={paths.length === 0}
            >
              <Text style={styles.saveButtonText}>Save Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - (MODAL_PADDING * 2),
    borderRadius: 16,
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    padding: 4,
  },
  signatureCanvas: {
    width: SIGNATURE_WIDTH,
    height: SIGNATURE_HEIGHT,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed' as const,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
