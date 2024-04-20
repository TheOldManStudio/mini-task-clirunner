import { parseIds } from "../src/id_parser";

describe("parseIds", () => {
  it("1", () => {
    const result = parseIds("0");

    console.log(result);

    // expect(result).to.equal(["0"]);
  });
});
