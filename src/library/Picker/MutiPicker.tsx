import * as React from 'react';
import { View, StyleSheet } from 'react-native-web';
import MultiPickerMixin from './MultiPickerMixin';

const styles = {
  picker: {
    display: 'block',
    position: 'relative',
    // overflow: 'hidden',
    width: '100%',
    flex: 1,
    height: '238px',
    backgroundColor: 'transparent',
  },
};

const MultiPicker = props => {
  const { rootNativeProps, children, style } = props;
  return (
    <View {...rootNativeProps} style={StyleSheet.flatten([styles.picker, style])}>
      {children}
    </View>
  );
};

export default MultiPickerMixin(MultiPicker);
