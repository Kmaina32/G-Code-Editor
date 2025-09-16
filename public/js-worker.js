// Simple web worker to execute user's javascript code
// It hijacks console.log and console.error to post messages back to the main thread

self.onmessage = (event) => {
    const { code } = event.data;

    // Hijack console.log
    const originalLog = console.log;
    console.log = (...args) => {
        self.postMessage({ type: 'log', message: args.join(' ') });
        originalLog.apply(console, args);
    };

    // Hijack console.error
    const originalError = console.error;
    console.error = (...args) => {
        self.postMessage({ type: 'error', message: `ERROR: ${args.join(' ')}` });
        originalError.apply(console, args);
    };

    try {
        // Execute the user's code
        eval(code);
    } catch (e) {
        console.error(e);
    }

    // Restore original console functions
    console.log = originalLog;
    console.error = originalError;
};
