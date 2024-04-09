import { rainbow } from "@colors/colors";

describe("", () => {
  it("", () => {
    console.log(rainbow("@colors/colors"));
  });

  it("timeout reject", async () => {
    const timeout = (millis: number) => new Promise((resolve, reject) => setTimeout(reject, millis, "Task timeout"));

    try {
      await timeout(1000);
    } catch (e) {
      console.log("exception", e);
    }
  });
});
