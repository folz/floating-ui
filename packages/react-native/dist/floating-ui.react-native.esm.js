import { arrow as arrow$1, computePosition } from '@floating-ui/core';
export { autoPlacement, detectOverflow, flip, hide, inline, limitShift, offset, shift, size } from '@floating-ui/core';
import * as React from 'react';
import { Dimensions } from 'react-native';

/**
 * A data provider that provides data to position an inner element of the
 * floating element (usually a triangle or caret) so that it is centered to the
 * reference element.
 * This wraps the core `arrow` middleware to allow React refs as the element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow = options => {
  const {
    element,
    padding
  } = options;
  function isRef(value) {
    return {}.hasOwnProperty.call(value, 'current');
  }
  return {
    name: 'arrow',
    options,
    fn(args) {
      if (element && isRef(element)) {
        if (element.current != null) {
          return arrow$1({
            element: element.current,
            padding
          }).fn(args);
        }
        return {};
      } else if (element) {
        return arrow$1({
          element,
          padding
        }).fn(args);
      }
      return {};
    }
  };
};

const ORIGIN$1 = {
  x: 0,
  y: 0
};
const createPlatform = _ref => {
  let {
    offsetParent,
    sameScrollView = true,
    scrollOffsets = ORIGIN$1
  } = _ref;
  return {
    // @ts-expect-error TODO
    getElementRects(_ref2) {
      let {
        reference,
        floating
      } = _ref2;
      return new Promise(resolve => {
        const onMeasure = function (offsetX, offsetY) {
          if (offsetX === void 0) {
            offsetX = 0;
          }
          if (offsetY === void 0) {
            offsetY = 0;
          }
          floating.measure((x, y, width, height) => {
            const floatingRect = {
              width,
              height,
              ...ORIGIN$1
            };
            const method = sameScrollView ? 'measure' : 'measureInWindow';
            reference[method]((x, y, width, height) => {
              const referenceRect = {
                width,
                height,
                x: x - offsetX,
                y: y - offsetY
              };
              resolve({
                reference: referenceRect,
                floating: floatingRect
              });
            });
          });
        };
        if (offsetParent) {
          offsetParent.measure(onMeasure);
        } else {
          onMeasure();
        }
      });
    },
    getClippingRect() {
      const {
        width,
        height
      } = Dimensions.get('window');
      return {
        width,
        height,
        ...(sameScrollView ? scrollOffsets : ORIGIN$1)
      };
    },
    // @ts-expect-error TODO
    convertOffsetParentRelativeRectToViewportRelativeRect(_ref3) {
      let {
        rect
      } = _ref3;
      return new Promise(resolve => {
        const onMeasure = function (offsetX, offsetY) {
          if (offsetX === void 0) {
            offsetX = 0;
          }
          if (offsetY === void 0) {
            offsetY = 0;
          }
          resolve({
            ...rect,
            x: rect.x + offsetX,
            y: rect.y + offsetY
          });
        };
        if (offsetParent) {
          offsetParent.measure(onMeasure);
        } else {
          onMeasure();
        }
      });
    },
    getDimensions: element =>
    // @ts-expect-error TODO
    new Promise(resolve => element.measure((x, y, width, height) => resolve({
      width,
      height
    })))
  };
};

// Fork of `fast-deep-equal` that only does the comparisons we need and compares
// functions
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === 'function' && a.toString() === b.toString()) {
    return true;
  }
  let length, i, keys;
  if (a && b && typeof a == 'object') {
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) {
      return false;
    }
    for (i = length; i-- !== 0;) {
      if (!{}.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }
    for (i = length; i-- !== 0;) {
      const key = keys[i];
      if (key === '_owner' && a.$$typeof) {
        continue;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return a !== a && b !== b;
}

const ORIGIN = {
  x: 0,
  y: 0
};
function useFloating(options) {
  if (options === void 0) {
    options = {};
  }
  const {
    placement = 'bottom',
    middleware = [],
    sameScrollView = true,
    elements: {
      reference: externalReference,
      floating: externalFloating,
      offsetParent: externalOffsetParent
    } = {}
  } = options;
  const [_reference, _setReference] = React.useState(null);
  const [_floating, _setFloating] = React.useState(null);
  const [_offsetParent, _setOffsetParent] = React.useState(null);
  const referenceEl = externalReference || _reference;
  const floatingEl = externalFloating || _floating;
  const offsetParentEl = externalOffsetParent || _offsetParent;
  const setReference = React.useCallback(node => {
    if (node !== referenceRef.current) {
      referenceRef.current = node;
      _setReference(node);
    }
  }, [_setReference]);
  const setFloating = React.useCallback(node => {
    if (node !== floatingRef.current) {
      floatingRef.current = node;
      _setFloating(node);
    }
  }, [_setFloating]);
  const setOffsetParent = React.useCallback(node => {
    if (node !== offsetParentRef.current) {
      offsetParentRef.current = node;
      _setOffsetParent(node);
    }
  }, [_setOffsetParent]);
  const referenceRef = React.useRef(null);
  const floatingRef = React.useRef(null);
  const offsetParentRef = React.useRef(null);
  const [data, setData] = React.useState({
    x: 0,
    y: 0,
    placement,
    strategy: 'absolute',
    middlewareData: {}
  });
  const [scrollOffsets, setScrollOffsets] = React.useState(ORIGIN);
  const [latestMiddleware, setLatestMiddleware] = React.useState(middleware);
  if (!deepEqual(latestMiddleware, middleware)) {
    setLatestMiddleware(middleware);
  }
  const platform = React.useMemo(() => createPlatform({
    offsetParent: offsetParentEl,
    scrollOffsets,
    sameScrollView
  }), [offsetParentEl, scrollOffsets, sameScrollView]);
  const update = React.useCallback(() => {
    if (!referenceRef.current || !floatingRef.current) {
      return;
    }
    const data = computePosition(referenceRef.current, floatingRef.current, {
      middleware: latestMiddleware,
      platform,
      placement
    });
    if (isMountedRef.current) {
      setData(data);
    }
  }, [latestMiddleware, platform, placement]);
  React.useLayoutEffect(() => {
    if (referenceEl) referenceRef.current = referenceEl;
    if (floatingEl) floatingRef.current = floatingEl;
    if (offsetParentEl) offsetParentRef.current = offsetParentEl;
    const frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [referenceEl, floatingEl, offsetParentEl, update]);
  const isMountedRef = React.useRef(true);
  React.useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const refs = React.useMemo(() => ({
    reference: referenceRef,
    floating: floatingRef,
    offsetParent: offsetParentRef,
    setReference,
    setFloating,
    setOffsetParent
  }), [setReference, setFloating, setOffsetParent]);
  const elements = React.useMemo(() => ({
    reference: referenceEl,
    floating: floatingEl,
    offsetParent: offsetParentEl
  }), [referenceEl, floatingEl, offsetParentEl]);
  const floatingStyles = React.useMemo(() => {
    if (!elements.floating) {
      return {
        position: 'absolute',
        left: 0,
        top: 0
      };
    }
    return {
      position: 'absolute',
      left: data.x,
      top: data.y
    };
  }, [elements.floating, data.x, data.y]);
  return React.useMemo(() => ({
    ...data,
    update,
    refs,
    elements,
    floatingStyles,
    offsetParent: setOffsetParent,
    reference: setReference,
    floating: setFloating,
    scrollProps: {
      onScroll: event => setScrollOffsets(event.nativeEvent.contentOffset),
      scrollEventThrottle: 16
    }
  }), [data, refs, elements, floatingStyles, setReference, setFloating, setOffsetParent, update]);
}

export { arrow, useFloating };
