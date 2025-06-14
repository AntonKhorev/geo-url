import { describe, test, expect } from "vitest"

import { formatNumber } from "../src/number.js"

describe("formatNumber", () => {
	test("formats the value in fixed-point notation", () => {
		expect(formatNumber(0.0000001, 9)).toBe("0.0000001")
	})
	test("formats the value up to a given precision", () => {
		expect(formatNumber(0.0000000001, 10)).toBe("0.0000000001")
	})
	test("formats the value up to a given precision but not beyond", () => {
		expect(formatNumber(0.00000000001, 10)).toBe("0")
	})
	test("formats the value with a reasonable precision for arithmetic", () => {
		expect(formatNumber(0.1 + 0.2, 12)).toBe("0.3")
	})
	test("keeps trailing zeros for integer values", () => {
		expect(formatNumber(1000, 9)).toBe("1000")
	})
})
