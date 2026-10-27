/* ES module (import): uses the classes from tips.js and updates the DOM. */
import { Tip, UrgentTip, startRotation } from './tips.js';

const tips = [
  new UrgentTip('If life is in danger, call 112 first.'),
  new Tip('Say your exact location before anything else.'),
  new Tip('Keep your phone charged and your location turned on.'),
  new Tip('Do not hang up until the operator tells you to.')
];

const bar = document.createElement('div');
bar.id = 'tips-bar';
document.body.prepend(bar);

startRotation(tips, 8000, (tip) => {
  bar.textContent = tip.render();
});