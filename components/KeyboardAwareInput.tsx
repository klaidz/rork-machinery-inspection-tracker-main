import React, { useRef, useCallback } from 'react';
import {
  TextInput,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  ScrollView,
  Platform,
  findNodeHandle,
} from 'react-native';

interface KeyboardAwareInputProps extends TextInputProps {
  scrollViewRef?: React.RefObject<ScrollView | null>;
  nextInputRef?: React.RefObject<TextInput | null>;
  previousInputRef?: React.RefObject<TextInput | null>;
}

export const KeyboardAwareInput = React.forwardRef<TextInput, KeyboardAwareInputProps>(function KeyboardAwareInput(
  { scrollViewRef, nextInputRef, previousInputRef, onFocus, onSubmitEditing, ...props },
  ref
) {
    const inputRef = useRef<TextInput>(null);
    
    const innerRef = (ref as React.RefObject<TextInput>) || inputRef;

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (scrollViewRef?.current && innerRef.current) {
          if (Platform.OS === 'web') {
            setTimeout(() => {
              innerRef.current?.focus();
            }, 100);
          } else {
            setTimeout(() => {
              const nodeHandle = findNodeHandle(innerRef.current);
              if (nodeHandle) {
                innerRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  const extraOffset = 150;
                  const scrollToY = Math.max(0, pageY - extraOffset);
                  
                  scrollViewRef.current?.scrollTo({
                    y: scrollToY,
                    animated: true,
                  });
                });
              }
            }, 200);
          }
        }
        if (onFocus) {
          onFocus(e);
        }
      },
      [scrollViewRef, innerRef, onFocus]
    );

    const handleSubmitEditing = useCallback(
      (e: any) => {
        if (nextInputRef?.current) {
          nextInputRef.current.focus();
        }
        onSubmitEditing?.(e);
      },
      [nextInputRef, onSubmitEditing]
    );

  return (
    <TextInput
      ref={innerRef}
      onFocus={handleFocus as any}
      onSubmitEditing={handleSubmitEditing}
      returnKeyType={nextInputRef ? 'next' : props.returnKeyType || 'done'}
      blurOnSubmit={!nextInputRef}
      {...props}
    />
  );
});
