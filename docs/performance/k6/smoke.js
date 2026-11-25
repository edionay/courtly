import { check } from "k6";

export const options = {
  thresholds: {
    checks: ["rate==1"],
  },
};

export default function () {
  check(1 + 1, {
    "runtime evaluates a passing check": (result) => result === 2,
  });
}
