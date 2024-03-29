export const randomSplit = (amount: number, n: number, min: number) => {
  let randomPart = amount - n * min;

  if (randomPart < 0 || n <= 0) throw new Error("bad price split setting");

  const splits = [];
  for (let i = 0; i < n - 1; i++) {
    const r = Math.floor((Math.random() * randomPart + Number.EPSILON) * 100) / 100;
    randomPart -= r;

    splits.push(min + r);
  }

  splits.push(Math.floor((min + randomPart + Number.EPSILON) * 100) / 100);

  return splits;
};

export const randomInRange = (lower: number, upper: number) => {
  const delta = upper - lower;
  return lower + Math.random() * delta;
};
