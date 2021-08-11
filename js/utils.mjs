export function zeroPad(n, length) {
  return (1e15 + n + "").slice(-length);
}

export function formatTime(millis, showMillis) {
  if (millis !== null) {
    const secs = Math.floor(millis / 1000);
    const mins = Math.floor(secs / 60);
    const millisText = zeroPad(millis % 1000, 3);
    const secsText = zeroPad(secs % 60, 2);
    const minsText = zeroPad(mins, 2);
    return showMillis
      ? `${minsText}:${secsText}.${millisText}`
      : `${minsText}:${secsText}`;
  } else {
    return showMillis ? "--:--.---" : "--:--";
  }
}
