// src/utils/EventBus.ts
import { markRaw } from 'vue';

class EventBus {
  private events: { [key: string]: Function[] } = {}; // Definindo um tipo para events

  emit(event: string, data?: any) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => callback(data));
  }

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(
      (cb) => cb !== callback
    );
  }
}

export const eventBus = markRaw(new EventBus());
