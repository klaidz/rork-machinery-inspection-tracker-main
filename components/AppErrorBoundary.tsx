import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = {
  hasError: boolean;
  errorMessage: string | null;
  errorName: string | null;
  componentStack: string | null;
};

export class AppErrorBoundary extends React.PureComponent<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: null,
    errorName: null,
    componentStack: null,
  };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      hasError: true,
      errorMessage: err.message,
      errorName: err.name,
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[AppErrorBoundary] Caught error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ componentStack: errorInfo.componentStack ?? null });
  }

  private handleReset = () => {
    console.log('[AppErrorBoundary] Reset pressed');
    this.setState({ hasError: false, errorMessage: null, errorName: null, componentStack: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const colors = Colors.light;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} testID="error-title">
            Something went wrong
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]} testID="error-subtitle">
            This screen crashed. The details below will help us find the exact component.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={this.handleReset}
          activeOpacity={0.85}
          testID="error-reset"
        >
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>

        <ScrollView
          style={[styles.detailsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.detailsTitle, { color: colors.text }]} testID="error-details-title">
            Error details
          </Text>

          <Text style={[styles.monoLabel, { color: colors.secondary }]}>Name</Text>
          <Text style={[styles.monoValue, { color: colors.text }]} testID="error-name">
            {this.state.errorName ?? 'Unknown'}
          </Text>

          <Text style={[styles.monoLabel, { color: colors.secondary }]}>Message</Text>
          <Text style={[styles.monoValue, { color: colors.text }]} testID="error-message">
            {this.state.errorMessage ?? 'No message'}
          </Text>

          {this.state.componentStack ? (
            <>
              <Text style={[styles.monoLabel, { color: colors.secondary }]}>Component stack</Text>
              <Text style={[styles.monoValue, { color: colors.text }]} testID="error-component-stack">
                {this.state.componentStack}
              </Text>
            </>
          ) : null}

          <Text style={[styles.hint, { color: colors.secondary }]} testID="error-hint">
            If you see “Unexpected text node: . A text node cannot be a child of a View”, look for a stray “.” in JSX and wrap it in a Text component or remove it.
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  primaryButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  detailsCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
  },
  detailsContent: {
    padding: 14,
    gap: 10,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  monoLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  monoValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
});
