// A simple web worker to execute javascript code in a sandboxed environment.
// It hijacks console.log and console.error to post messages back to the main thread.

self.onmessage = (event) => {
  const { code } = event.data;
  const logs = [];

  // Store original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalClear = console.clear;

  // Hijack console methods
  console.log = (...args) => {
    const message = args.map(arg => formatArg(arg)).join(' ');
    self.postMessage({ type: 'log', message });
    originalLog.apply(console, args);
  };
  console.error = (...args) => {
    const message = args.map(arg => formatArg(arg)).join(' ');
    self.postMessage({ type: 'error', message });
    originalError.apply(console, args);
  };
   console.warn = (...args) => {
    const message = args.map(arg => formatArg(arg)).join(' ');
    self.postMessage({ type: 'warn', message });
    originalWarn.apply(console, args);
  };
   console.info = (...args) => {
    const message = args.map(arg => formatArg(arg)).join(' ');
    self.postMessage({ type: 'info', message });
    originalInfo.apply(console, args);
  };
   console.clear = () => {
    self.postMessage({ type: 'clear' });
    originalClear.apply(console);
  };


  try {
    // Use Function constructor for safer execution than eval
    new Function(code)();
  } catch (e) {
    console.error(e);
  } finally {
     // Restore original console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
    console.clear = originalClear;
  }
};

function formatArg(arg) {
    if (typeof arg === 'object' && arg !== null) {
        try {
            return JSON.stringify(arg);
        } catch (e) {
            return '[Circular Object]';
        }
    }
    return String(arg);
}
