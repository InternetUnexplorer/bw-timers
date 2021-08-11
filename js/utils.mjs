export function zeroPad(n, length) {
  return (1e15 + n + "").slice(-length);
}

export function formatTime(seconds) {
  if (seconds !== null) {
    const secsText = zeroPad(seconds % 60, 2);
    const minsText = zeroPad(Math.floor(seconds / 60), 2);
    return `${minsText}:${secsText}`;
  } else {
    return "--:--";
  }
}

export class Timer {
  constructor(fn, interval) {
    this.fn = fn;
    this.interval = interval;
    this.startTime = Date.now();
    this.timeoutId = this.resetTimeout();
  }

  stop() {
    clearTimeout(this.timeoutId);
  }

  resetTimeout() {
    const timeElapsed = Date.now() - this.startTime;
    const nextTimeout = 1000 - (timeElapsed % 1000);

    return setTimeout(() => {
      this.fn(Date.now() - this.startTime);
      this.timeoutId = this.resetTimeout();
    }, nextTimeout);
  }
}
