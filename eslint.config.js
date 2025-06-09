import { defineConfig } from "eslint/config"
import stylistic from "@stylistic/eslint-plugin"

export default defineConfig([
	{
		ignores: ["pages/"]
	},
	{
		plugins: {
			"@stylistic": stylistic
		},
		rules: {
			"@stylistic/eol-last": "error",
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/space-infix-ops": "error",
		}
	}
])
