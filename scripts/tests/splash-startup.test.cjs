const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the native component with layout and font completion delivered separately.
// Native drawing is stubbed; hook state and dependency changes survive rerenders.
function mountSplash() {
  const state = [];
  const deps = [];
  let cursor = 0;
  let pending = [];
  let hideCalls = 0;
  class Keyframe {
    duration() { return this; }
    withCallback() { return this; }
  }
  const modules = {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = value; }];
      },
      useEffect(effect, next) {
        const index = cursor++;
        if (!deps[index] || next.some((value, i) => value !== deps[index][i])) {
          pending.push(effect);
          deps[index] = next;
        }
      },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    'react-native': {
      View: 'View', Dimensions: { get: () => ({ height: 800 }) },
      StyleSheet: { create: (styles) => styles, absoluteFill: {} },
    },
    'expo-image': { Image: 'Image' },
    'expo-splash-screen': { hideAsync: async () => { hideCalls++; } },
    'react-native-reanimated': { default: { View: 'Animated.View' }, Keyframe, Easing: { elastic: () => null }, __esModule: true },
    'react-native-worklets': { scheduleOnRN: (fn, ...args) => fn(...args) },
  };
  const exports = {};
  const source = ts.transpileModule(readFileSync('src/components/animated-icon.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name.startsWith('@/assets/')) return name;
      assert.ok(name in modules, `Unmocked module: ${name}`);
      return modules[name];
    },
    console,
  });
  return {
    render(fontsLoaded) {
      cursor = 0;
      const tree = exports.AnimatedSplashOverlay({ fontsLoaded });
      const effects = pending;
      pending = [];
      effects.forEach((effect) => effect());
      return tree;
    },
    get hideCalls() { return hideCalls; },
  };
}

test('dismisses splash when fonts finish after the initial layout, without another layout', async () => {
  const splash = mountSplash();
  const initial = splash.render(false);
  initial.props.onLayout();
  splash.render(false);
  assert.equal(splash.hideCalls, 0);
  splash.render(true);
  await Promise.resolve();
  assert.equal(splash.hideCalls, 1);
});

test('waits for layout when fonts are already ready', async () => {
  const splash = mountSplash();
  const initial = splash.render(true);
  assert.equal(splash.hideCalls, 0);
  initial.props.onLayout();
  splash.render(true);
  await Promise.resolve();
  assert.equal(splash.hideCalls, 1);
  splash.render(true);
  assert.equal(splash.hideCalls, 1);
});
