import { build } from "tsdown";

async function buildLibrary() {
	await build({
		entry: ["src/index.ts"],
		outDir: "dist",
		format: ["esm", "cjs"],
		target: ["es2020", "node22"],
		dts: true,
		exports: { enabled: true },
		outputOptions: {
			exports: "named",
		},
		clean: true,
	});
}

buildLibrary();
