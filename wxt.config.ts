import { defineConfig } from "wxt";

console.log("[wxt.config] loaded", new Date().toISOString());

const SUPPORTED_SITES = [
	"https://www.google.com/*",
	"https://www.uta-net.com/*",
	"https://j-lyric.net/*",
	"https://www.kkbox.com/*",
];

export default defineConfig({
	srcDir: ".",
	entrypointsDir: "src/entrypoints",
	outDir: ".output",
	manifestVersion: 3,
	manifest({ browser }) {
		return {
			icons: {
				16: "/icons/icon16.png",
				32: "/icons/icon32.png",
				64: "/icons/icon64.png",
				128: "/icons/icon128.png",
				256: "/icons/icon256.png",
				512: "/icons/icon512.png",
			},
			host_permissions: SUPPORTED_SITES,
			permissions: [],
			content_security_policy: {
				extension_pages: "script-src 'self'; object-src 'self';",
			},
			browser_specific_settings:
				browser === "firefox"
					? {
							gecko: {
								id: "{8c6e9f3d-7a2f-4b1c-9e76-251a95b68a12}",
								strict_min_version: "109.0",
								data_collection_permissions: [],
							},
						}
					: undefined,
		};
	},
});
