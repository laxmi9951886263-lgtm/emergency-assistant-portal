/* ES module (export): plain JavaScript classes, inheritance and callbacks. */

export class Tip {
  constructor(text) {
    this.text = text;
  }
  render() {
    return `Safety tip: ${this.text}`;
  }
}

// Inheritance: UrgentTip extends Tip and overrides render()
export class UrgentTip extends Tip {
  constructor(text) {
    super(text);
  }
  render() {
    return `Important: ${this.text}`;
  }
}

/** Callback pattern: `onTip` is called now and then every `intervalMs`. Returns the timer id. */
export function startRotation(tips, intervalMs, onTip) {
  let index = 0;
  onTip(tips[index]);
  return setInterval(() => {
    index = (index + 1) % tips.length;
    onTip(tips[index]);
  }, intervalMs);
}