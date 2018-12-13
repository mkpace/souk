/**
 * Usage
 * ----------------------------------------------------------
 * import timeoutPromise from './timeout-promise';
 * let doIt = timeoutPromise(5000, doSomething())
 *
 */
export default (ms, promise) => {
  // create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms}ms.`));
    }, ms);
  });

  // returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout,
  ]);
};
