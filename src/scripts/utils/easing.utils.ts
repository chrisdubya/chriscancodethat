// Robert Penner easing functions. (t = current time, b = begin, c = change, d = duration)
type Ease = (t: number, b: number, c: number, d: number) => number;

const easeInQuad: Ease = (t, b, c, d) => {
  t /= d;
  return c * t * t + b;
};

const easeOutQuad: Ease = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};

const easeInOutQuad: Ease = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

const easeInOutQuart: Ease = (t, b, c, d) => {
  if ((t /= d / 2) < 1) {
    return (c / 2) * t * t * t * t + b;
  } else {
    return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
  }
};

const easeInSine: Ease = (t, b, c, d) => {
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
};

const easeOutSine: Ease = (t, b, c, d) => {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

const easeInOutSine: Ease = (t, b, c, d) => {
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};

export {
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInOutQuart,
  easeInSine,
  easeOutSine,
  easeInOutSine,
};
