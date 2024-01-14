const max = Math.PI * 2;

export const angleLerp = (a0: number, a1: number, t: number) => {
  return a0 + shortAngleDist(a0, a1) * t;
};

function shortAngleDist(a0: number, a1: number) {
  const da = Math.sign(a1 - a0) * (Math.abs(a1 - a0) % max);
  return Math.sign(a1 - a0) * ((2 * Math.abs(da)) % max) - da;
}
