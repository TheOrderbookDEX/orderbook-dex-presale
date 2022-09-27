const UPDATE_INTERVAL = 15000;

export class UpdateTimer {
  private readonly eventTarget: EventTarget;
  private abortController: AbortController;

  constructor() {
    this.eventTarget = new EventTarget();
    this.abortController = new AbortController();
    const timeout = setTimeout(() => this.update(), UPDATE_INTERVAL);
    this.abortController.signal.addEventListener('abort', () => clearTimeout(timeout));
  }

  update() {
    this.abortController.abort();
    this.eventTarget.dispatchEvent(new UpdateEvent());
    this.abortController = new AbortController();
    const timeout = setTimeout(() => this.update(), UPDATE_INTERVAL);
    this.abortController.signal.addEventListener('abort', () => clearTimeout(timeout));
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof UpdateTimerEventMap>(type: K, listener: (event: UpdateTimerEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof UpdateTimerEventMap>(type: K, listener: (event: UpdateTimerEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface UpdateTimerEventMap {
  update: UpdateEvent;
}

export abstract class UpdateTimerEvent extends Event {
  protected constructor(type: keyof UpdateTimerEventMap) {
    super(type);
  }
}

export class UpdateEvent extends UpdateTimerEvent {
  constructor() {
    super('update');
  }
}
