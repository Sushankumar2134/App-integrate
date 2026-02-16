import React from 'react';
import {ActivityIndicator, StyleSheet, ViewStyle} from 'react-native';

import Button from './Button';
import Text from './Text';
import useTheme from '../hooks/useTheme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textColor?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textColor,
}) => {
  const {colors, gradients, sizes} = useTheme();

  const getGradient = () => {
    if (variant === 'secondary') return gradients.secondary;
    if (variant === 'danger') return gradients.danger;
    return gradients.primary;
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    return variant === 'secondary' ? colors.text : colors.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return {paddingVertical: sizes.s, paddingHorizontal: sizes.sm};
      case 'large':
        return {paddingVertical: sizes.sm, paddingHorizontal: sizes.md};
      case 'medium':
      default:
        return {paddingVertical: sizes.sm, paddingHorizontal: sizes.m};
    }
  };

  return (
    <Button
      gradient={getGradient()}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getPadding(), disabled && styles.disabledButton, style]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text color={getTextColor()} bold>
          {title}
        </Text>
      )}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PrimaryButton;
