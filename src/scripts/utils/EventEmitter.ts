// Minimal event emitter — replaces Node's `events` builtin (not polyfilled by
// Vite). Only the methods this project uses: addListener / removeListener / emit.
type Listener = (payload?: any) => void;

export default class EventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  addListener(type: string, fn: Listener): this {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
    return this;
  }

  removeListener(type: string, fn: Listener): this {
    this.listeners.get(type)?.delete(fn);
    return this;
  }

  emit(type: string, payload?: any): this {
    this.listeners.get(type)?.forEach((fn) => fn(payload));
    return this;
  }
}
