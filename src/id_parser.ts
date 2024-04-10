import _ from "lodash";

export const parseIds = (input: string): string[] => {
  let ids = [];

  if (input) {
    const tokens = input.toString().split(",");

    tokens.forEach((element) => {
      if (element && element.trim() !== "") {
        if (element.indexOf("-") !== -1) {
          ids = ids.concat(parseRange(element));
        } else {
          const id = parseInt(element);
          if (!isNaN(id)) {
            ids.push(id);
          }
        }
      }
    });
  }

  return _.uniq(ids).map((i) => i.toString());
};

const parseRange = (rangeToken: string): number[] => {
  const tokens = rangeToken.split("-");

  if (tokens.length !== 2) throw new Error(`arg error: ${rangeToken}`);

  let ranges = tokens.map((t) => parseInt(t));

  // console.log(tokens);

  if (isNaN(ranges[0]) || isNaN(ranges[1])) throw new Error(`arg error: ${rangeToken}`);
  ranges = _.sortBy(ranges);

  const ids: number[] = [];
  for (let i = ranges[0]; i <= ranges[1]; i++) {
    ids.push(i);
  }
  return ids;
};
