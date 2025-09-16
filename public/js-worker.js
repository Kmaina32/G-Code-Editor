
// A simple web worker to execute JavaScript code safely.

self.onmessage = function(event) {
  const { code } = event.data;

  // Hijack console.log to post messages back to the main thread
  const oldLog = console.log;
  console.log = function(...args) {
    self.postMessage({ type: 'log', message: args.join(' ') });
    oldLog.apply(console, args);
  };
  
  const oldError = console.error;
    console.error = function(...args) {
    self.postMessage({ type: 'error', message: `Error: ${args.join(' ')}` });
    oldError.apply(console, args);
  };


  try {
    // Using Function constructor for safer execution than eval
    const func = new Function(code);
    func();
  } catch (e) {
     if (e instanceof Error) {
      self.postMessage({ type: 'error', message: `Error: ${e.message}` });
    } else {
      self.postMessage({ type: 'error', message: `An unknown error occurred.`})
    }
  }
};

    