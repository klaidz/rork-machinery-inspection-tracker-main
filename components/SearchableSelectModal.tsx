import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';

export interface SelectableItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectModalProps {
  visible: boolean;
  onClose: () => void;
  items: SelectableItem[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  title: string;
  placeholder?: string;
  multiSelect?: boolean;
  emptyMessage?: string;
}

export default function SearchableSelectModal({
  visible,
  onClose,
  items,
  selectedIds,
  onSelect,
  title,
  placeholder = 'Type to search...',
  multiSelect = false,
  emptyMessage = 'No items found',
}: SearchableSelectModalProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const filteredAndSortedItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();

    const matchedItems = items
      .map((item) => {
        const labelLower = item.label.toLowerCase();
        const subtitleLower = item.subtitle?.toLowerCase() || '';
        
        const labelIndex = labelLower.indexOf(query);
        const subtitleIndex = subtitleLower.indexOf(query);
        
        const matchesLabel = labelIndex !== -1;
        const matchesSubtitle = subtitleIndex !== -1;

        if (!matchesLabel && !matchesSubtitle) {
          return null;
        }

        const startsWithLabel = labelIndex === 0;
        const startsWithSubtitle = subtitleIndex === 0;

        let score = 0;
        if (startsWithLabel) score += 1000;
        if (matchesLabel) score += 100;
        if (startsWithSubtitle) score += 50;
        if (matchesSubtitle) score += 10;
        
        score -= labelIndex >= 0 ? labelIndex : 999;

        return { item, score };
      })
      .filter((result): result is { item: SelectableItem; score: number } => result !== null);

    matchedItems.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.item.label.localeCompare(b.item.label);
    });

    return matchedItems.map((result) => result.item);
  }, [items, searchQuery]);

  const handleSelect = (id: string) => {
    onSelect(id);
    if (!multiSelect) {
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search color={colors.secondary} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <X color={colors.secondary} size={18} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={true}>
            {filteredAndSortedItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.secondary }]}>
                  {emptyMessage}
                </Text>
              </View>
            ) : (
              filteredAndSortedItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.modalItem,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.tint + '10', borderLeftWidth: 3, borderLeftColor: '#007AFF' },
                    ]}
                    onPress={() => handleSelect(item.id)}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={[styles.modalItemText, { color: colors.text }]}>
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text style={[styles.modalItemSubtext, { color: colors.secondary }]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Check color={colors.tint} size={20} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {multiSelect && selectedIds.length > 0 && (
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.footerText, { color: colors.secondary }]}>
                {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: colors.tint }]}
                onPress={handleClose}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
  },
  modalItemContent: {
    flex: 1,
    gap: 4,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalItemSubtext: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
