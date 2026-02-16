import React from 'react';
import {StyleSheet, TouchableOpacity, TextStyle, ViewStyle} from 'react-native';

import Input from './Input';
import Text from './Text';
import Block from './Block';
import useTheme from '../hooks/useTheme';

interface FormInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  onPress?: () => void;
  isPickerInput?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  error,
  containerStyle,
  inputStyle,
  onPress,
  isPickerInput = false,
}) => {
  const {sizes} = useTheme();
  const isDisabled = !editable || isPickerInput;

  return (
    <Block flex={0} style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        disabled={!isPickerInput}>
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!isDisabled}
          disabled={isDisabled}
          danger={!!error}
          style={inputStyle as ViewStyle}
          marginBottom={sizes.xs}
        />
      </TouchableOpacity>
      {error && (
        <Text danger size={12} marginTop={sizes.xs}>
          {error}
        </Text>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});

export default FormInput;
