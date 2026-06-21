// Feature-detect support for passive event listeners.
let alreadyTested = false;
let passiveSupported = false;

const isSupported = (): boolean => {
  if (alreadyTested) return passiveSupported;
  alreadyTested = true;

  try {
    const opts = Object.defineProperty({}, "passive", {
      get: () => {
        passiveSupported = true;
        return undefined;
      },
    });
    window.addEventListener("test", null as never, opts);
    window.removeEventListener("test", null as never, opts);
  } catch {
    /* passiveSupported stays false */
  }
  return passiveSupported;
};

// Resolved once: an options object when supported, otherwise plain `false`.
export const passiveEvent: AddEventListenerOptions | boolean = isSupported()
  ? { passive: true }
  : false;
