/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/static-property-placement */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { StyleSheet } from 'react-native-web';
// import './css.css';

const ALIGN = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContentContainer: {
    ...StyleSheet.absoluteFillObject,
    display: 'flex',
  },
  noMaskContainer: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'blue',
  },
};

class Modal extends Component {
  static defaultProps = {
    style: null,
    animationType: 'fade',
    alignContainer: 'bottom',
    onMaskPress: () => {},
    maskStyle: null,
    mask: true,
    visible: false,
  };

  // constructor(props) {
  //   super(props);
  //   ReactModal.setAppElement('#root');
  // }

  render() {
    const {
      onMaskPress,
      visible,
      children,
      maskStyle,
      alignContainer,
      animationType,
      mask,
      style,
    } = this.props;
    const maskContainer = StyleSheet.flatten([
      styles.container,
      maskStyle,
      style,
      alignContainer && { alignItems: ALIGN[alignContainer] },
      !mask && { backgroundColor: 'transparent', pointerEvents: 'none' },
    ]);
    const maskContentContainer = StyleSheet.flatten([
      styles.maskContentContainer,
      // alignContainer && { alignItems: ALIGN[alignContainer] },
    ]);
    const isDefault = animationType === 'fade' && mask;
    const animateOption = {
      overlayClassName: `overlay${isDefault && 'None'}`,
      className: `content${isDefault && 'None'}`,
    };

    return (
      <ReactModal
        isOpen={visible}
        style={{ overlay: maskContainer, content: maskContentContainer }}
        {...animateOption}
        parentSelector={() => document.querySelector('#root')}
        onRequestClose={mask ? onMaskPress : () => {}}
      >
        {children}
      </ReactModal>
    );
  }
}

export default Modal;
