import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';
import { X, FileText, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { InductionDocument } from '@/types';

interface InductionDocumentViewerProps {
  visible: boolean;
  onClose: () => void;
  documents: InductionDocument[];
  initialIndex?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InductionDocumentViewer({
  visible,
  onClose,
  documents,
  initialIndex = 0,
}: InductionDocumentViewerProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentDoc = documents[currentIndex];

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (!currentDoc) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.header, { backgroundColor: colors.cardBackground + 'F0' }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Induction Documents
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {currentIndex + 1} of {documents.length}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={28} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {currentDoc.type === 'image' ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: currentDoc.uri }}
                style={styles.image}
                contentFit="contain"
              />
            </ScrollView>
          ) : Platform.OS === 'web' ? (
            <View style={[styles.pdfContainer, { backgroundColor: colors.cardBackground }]}>
              <FileText size={80} color={colors.secondary} strokeWidth={1.5} />
              <Text style={[styles.pdfName, { color: colors.text }]}>
                {currentDoc.name}
              </Text>
              <Text style={[styles.pdfHint, { color: colors.secondary }]}>
                PDF Document
              </Text>
              <TouchableOpacity
                style={[styles.openButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                  const link = document.createElement('a');
                  link.href = currentDoc.uri;
                  link.target = '_blank';
                  link.click();
                }}
              >
                <ExternalLink size={20} color="#FFFFFF" />
                <Text style={styles.openButtonText}>Open in New Tab</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pdfViewerContainer}>
              <WebView
                source={{ uri: currentDoc.uri }}
                style={styles.webView}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.log('WebView error: ', nativeEvent);
                  Alert.alert(
                    'Error Loading PDF',
                    'Unable to load PDF in viewer. Try opening it in an external app.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Open Externally',
                        onPress: () => {
                          Linking.openURL(currentDoc.uri).catch((err) =>
                            Alert.alert('Error', 'Unable to open PDF')
                          );
                        },
                      },
                    ]
                  );
                }}
                startInLoadingState
                scalesPageToFit
              />
              <TouchableOpacity
                style={[styles.externalButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                  Linking.openURL(currentDoc.uri).catch(() =>
                    Alert.alert('Error', 'Unable to open PDF with external app')
                  );
                }}
              >
                <ExternalLink size={18} color="#FFFFFF" />
                <Text style={styles.externalButtonText}>Open in PDF Viewer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {documents.length > 1 && (
          <View style={[styles.navigation, { backgroundColor: colors.cardBackground + 'F0' }]}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              style={[
                styles.navButton,
                { backgroundColor: colors.background },
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
            >
              <ChevronLeft
                size={24}
                color={currentIndex === 0 ? colors.secondary : colors.text}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.navButtonText,
                  { color: currentIndex === 0 ? colors.secondary : colors.text },
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.dotsContainer}>
              {documents.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === currentIndex ? colors.tint : colors.secondary + '40',
                    },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentIndex === documents.length - 1}
              style={[
                styles.navButton,
                { backgroundColor: colors.background },
                currentIndex === documents.length - 1 && styles.navButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.navButtonText,
                  {
                    color:
                      currentIndex === documents.length - 1
                        ? colors.secondary
                        : colors.text,
                  },
                ]}
              >
                Next
              </Text>
              <ChevronRight
                size={24}
                color={
                  currentIndex === documents.length - 1 ? colors.secondary : colors.text
                }
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.footer, { backgroundColor: colors.cardBackground + 'F0' }]}>
          <Text style={[styles.documentName, { color: colors.text }]}>
            {currentDoc.name}
          </Text>
          <Text style={[styles.documentDate, { color: colors.secondary }]}>
            Added: {new Date(currentDoc.addedDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 280,
  },
  pdfContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    minWidth: 280,
  },
  pdfName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 20,
    textAlign: 'center',
  },
  pdfHint: {
    fontSize: 14,
    marginTop: 8,
  },
  openButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  pdfViewerContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  externalButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  externalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    alignItems: 'center',
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
  },
});
