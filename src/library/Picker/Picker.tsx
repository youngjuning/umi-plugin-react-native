// @ts-nocheck
import * as React from 'react';
import { StyleSheet } from 'react-native-web';
import PickerMixin from './PickerMixin';
import MutiPicker from './MutiPicker';

const styles = {
  picker: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    flex: 1,
    height: '238px',
    display: 'flex',
    justifyContent: 'center',
  },

  pickerItem: {
    fontSize: '16px',
    height: '34px',
    lineHeight: '34px',
    margin: '0 20px',
    whiteSpace: 'nowrap',
    position: 'relative',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#9b9b9b',
    // width: '100%',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
  },

  indicator: {
    margin: '0 auto',
    boxSizing: 'border-box',
    width: '100%',
    height: '34px',
    position: 'absolute',
    left: 0,
    top: '102px',
    zIndex: 3,
    borderTop: '1PX solid #ddd',
    borderBottom: '1PX solid #ddd',
  },

  mask: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    margin: '0 auto',
    width: '100%',
    zIndex: 3,
    backgroundImage:
      'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6)), linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6))',
    backgroundPosition: 'top, bottom',
    backgroundSize: '100% 204px',
    backgroundRepeat: 'no-repeat',
  },
};
class Picker extends React.Component {
  static defaultProps = {
    prefixCls: 'rmc-picker',
  };

  rootRef;
  maskRef;
  contentRef;
  indicatorRef;
  itemHeight;
  scrollValue;

  scrollHanders = (() => {
    let scrollY = -1;
    let lastY = 0;
    let startY = 0;
    let scrollDisabled = false;
    let isMoving = false;

    const setTransform = (nodeStyle, value) => {
      nodeStyle.transform = value;
      nodeStyle.webkitTransform = value;
    };

    const setTransition = (nodeStyle, value) => {
      nodeStyle.transition = value;
      nodeStyle.webkitTransition = value;
    };

    const scrollTo = (_x, y, time = 0.3) => {
      if (scrollY !== y) {
        scrollY = y;
        if (time && !this.props.noAnimate) {
          setTransition(this.contentRef.style, `cubic-bezier(0,0,0.2,1.15) ${time}s`);
        }
        setTransform(this.contentRef.style, `translate3d(0,${-y}px,0)`);
        setTimeout(() => {
          this.scrollingComplete();
          if (this.contentRef) {
            setTransition(this.contentRef.style, '');
          }
        }, +time * 1000);
      }
    };

    const Velocity = ((minInterval = 30, maxInterval = 100) => {
      let _time = 0;
      let _y = 0;
      let _velocity = 0;
      const recorder = {
        record: y => {
          const now = +new Date();
          _velocity = (y - _y) / (now - _time);
          if (now - _time >= minInterval) {
            _velocity = now - _time <= maxInterval ? _velocity : 0;
            _y = y;
            _time = now;
          }
        },
        getVelocity: y => {
          if (y !== _y) {
            recorder.record(y);
          }
          return _velocity;
        },
      };
      return recorder;
    })();

    const onFinish = () => {
      isMoving = false;
      let targetY = scrollY;

      const height = (this.props.children.length - 1) * this.itemHeight;

      let time = 0.3;

      const velocity = Velocity.getVelocity(targetY) * 4;
      if (velocity) {
        targetY = velocity * 40 + targetY;
        time = Math.abs(velocity) * 0.1;
      }

      if (targetY % this.itemHeight !== 0) {
        targetY = Math.round(targetY / this.itemHeight) * this.itemHeight;
      }

      if (targetY < 0) {
        targetY = 0;
      } else if (targetY > height) {
        targetY = height;
      }

      scrollTo(0, targetY, time < 0.3 ? 0.3 : time);
      this.onScrollChange();
    };

    const onStart = (y) => {
      if (scrollDisabled) {
        return;
      }

      isMoving = true;
      startY = y;
      lastY = scrollY;
    };

    const onMove = (y) => {
      if (scrollDisabled || !isMoving) {
        return;
      }

      scrollY = lastY - y + startY;
      Velocity.record(scrollY);

      this.onScrollChange();
      setTransform(this.contentRef.style, `translate3d(0,${-scrollY}px,0)`);
    };

    return {
      touchstart: (evt) => onStart(evt.touches[0].pageY),
      mousedown: (evt) => onStart(evt.pageY),
      touchmove: (evt) => {
        evt.preventDefault();
        onMove(evt.touches[0].pageY);
      },
      mousemove: (evt) => {
        evt.preventDefault();
        onMove(evt.pageY);
      },
      touchend: () => onFinish(),
      touchcancel: () => onFinish(),
      mouseup: () => onFinish(),
      getValue: () => {
        return scrollY;
      },
      scrollTo,
      setDisabled: (disabled = false) => {
        scrollDisabled = disabled;
      },
    };
  })();

  constructor(props) {
    super(props);

    let selectedValueState;
    const { selectedValue, defaultSelectedValue } = this.props;
    if (selectedValue !== undefined) {
      selectedValueState = selectedValue;
    } else if (defaultSelectedValue !== undefined) {
      selectedValueState = defaultSelectedValue;
    } else {
      const children = React.Children.toArray(this.props.children);
      selectedValueState = children && children[0] && children[0].props.value;
    }
    this.state = {
      selectedValue: selectedValueState,
    };
  }

  componentDidMount() {
    const { contentRef, indicatorRef, maskRef, rootRef } = this;
    setTimeout(() => {
      const rootHeight = rootRef.getBoundingClientRect().height;
      // https://github.com/react-component/m-picker/issues/18
      const itemHeight = (this.itemHeight = indicatorRef.getBoundingClientRect().height);
      let num = Math.floor(rootHeight / itemHeight);
      if (num % 2 === 0) {
        num--;
      }
      num--;
      num /= 2;
      contentRef.style.padding = `${itemHeight * num}px 0`;
      indicatorRef.style.top = `${itemHeight * num}px`;
      maskRef.style.backgroundSize = `100% ${itemHeight * num}px`;
      this.scrollHanders.setDisabled(this.props.disabled);
      this.props.select(this.state.selectedValue, this.itemHeight, this.scrollTo);

      const passiveSupported = this.passiveSupported();
      const willPreventDefault = passiveSupported ? { passive: false } : false;
      const willNotPreventDefault = passiveSupported ? { passive: true } : false;
      Object.keys(this.scrollHanders).forEach(key => {
        if (key.indexOf('touch') === 0 || key.indexOf('mouse') === 0) {
          const pd = key.indexOf('move') >= 0 ? willPreventDefault : willNotPreventDefault;
          rootRef.addEventListener(key, this.scrollHanders[key], pd);
        }
      });
    }, 0);
  }

  componentWillUnmount() {
    Object.keys(this.scrollHanders).forEach(key => {
      if (key.indexOf('touch') === 0 || key.indexOf('mouse') === 0) {
        this.rootRef.removeEventListener(key, this.scrollHanders[key]);
      }
    });
  }

  passiveSupported() {
    let passiveSupported = false;

    try {
      const options = Object.defineProperty({}, 'passive', {
        get: () => {
          passiveSupported = true;
        },
      });
      window.addEventListener('test', null, options);
    } catch (err) { }
    return passiveSupported;
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedValue' in nextProps) {
      if (this.state.selectedValue !== nextProps.selectedValue) {
        this.setState(
          {
            selectedValue: nextProps.selectedValue,
          },
          () => {
            this.props.select(
              nextProps.selectedValue,
              this.itemHeight,
              nextProps.noAnimate ? this.scrollToWithoutAnimation : this.scrollTo
            );
          }
        );
      }
    }
    this.scrollHanders.setDisabled(nextProps.disabled);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.selectedValue !== nextState.selectedValue ||
      this.props.children !== nextProps.children
    );
  }

  componentDidUpdate() {
    this.props.select(this.state.selectedValue, this.itemHeight, this.scrollToWithoutAnimation);
  }

  scrollTo = top => {
    this.scrollHanders.scrollTo(0, top);
  };

  scrollToWithoutAnimation = top => {
    this.scrollHanders.scrollTo(0, top, 0);
  };

  fireValueChange = selectedValue => {
    if (selectedValue !== this.state.selectedValue) {
      if (!('selectedValue' in this.props)) {
        this.setState({
          selectedValue,
        });
      }
      if (this.props.onValueChange) {
        this.props.onValueChange(selectedValue);
      }
    }
  };

  onScrollChange = () => {
    const top = this.scrollHanders.getValue();
    if (top >= 0) {
      const children = React.Children.toArray(this.props.children);
      const index = this.props.computeChildIndex(top, this.itemHeight, children.length);
      if (this.scrollValue !== index) {
        this.scrollValue = index;
        const child = children[index];
        if (child && this.props.onScrollChange) {
          this.props.onScrollChange(child.props.value);
        } else if (!child && console.warn) {
          console.warn('child not found', children, index);
        }
      }
    }
  };

  scrollingComplete = () => {
    const top = this.scrollHanders.getValue();
    if (top >= 0) {
      this.props.doScrollingComplete(top, this.itemHeight, this.fireValueChange);
    }
  };

  getValue() {
    if ('selectedValue' in this.props) {
      return this.props.selectedValue;
    }
    const children = React.Children.toArray(this.props.children);
    return children && children[0] && children[0].props.value;
  }

  render() {
    const { props } = this;
    const { prefixCls, itemStyle, children, ...rest } = props;
    const { selectedValue } = this.state;
    const itemClassName = `${prefixCls}-item`;
    const selectedItemClassName = `${itemClassName} ${prefixCls}-item-selected`;
    const map = (item) => {
      const { className = '', style, value, label } = item.props;
      const { color = '#333' } = StyleSheet.flatten(itemStyle);
      const textStyle = StyleSheet.flatten([styles.pickerItem, itemStyle, { color }]);
      return (
        <div
          className={`${selectedValue === value ? selectedItemClassName : itemClassName
            } ${className}`}
          style={{ ...styles.pickerItem, ...style, ...textStyle }}
          key={value}
        >
          {label}
        </div>
      );
    };
    // compatibility for preact
    const items = React.Children ? React.Children.map(children, map) : [].concat(children).map(map);
    return (
      <MutiPicker {...rest}>
        <div style={styles.picker} ref={el => (this.rootRef = el)}>
          <div style={styles.mask} ref={el => (this.maskRef = el)} />
          <div ref={el => (this.indicatorRef = el)} style={styles.indicator} />
          <div ref={el => (this.contentRef = el)}>{items}</div>
        </div>
      </MutiPicker>
    );
  }
}

export default PickerMixin(Picker)
