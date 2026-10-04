#!/usr/bin/env bun
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";

import plugin from "bun-plugin-tailwind";

import { resolveBuildId, resolveCommitHash } from "./scripts/buildId";

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

console.log("\n🚀 Starting build process...\n");

const outdir = path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();

const buildId = await resolveBuildId();
const commitHash = resolveCommitHash();
console.log(`🔖 Build id: ${buildId}, commit: ${commitHash}\n`);

const entrypoints = [...new Bun.Glob("**.html").scanSync("src")]
  .map((a) => path.resolve("src", a))
  .filter((dir) => !dir.includes("node_modules"));
console.log(
  `📄 Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? "file" : "files"} to process\n`,
);

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  publicPath: "/",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.BUN_PUBLIC_BUILD_ID": JSON.stringify(buildId),
    "process.env.BUN_PUBLIC_COMMIT_HASH": JSON.stringify(commitHash),
  },
});

const precache = [
  ...new Set([
    "/index.html",
    ...result.outputs
      .map((output) => "/" + path.relative(outdir, output.path))
      .filter((url) => !url.endsWith(".map") && url !== "/sw.js"),
  ]),
];

const swResult = await Bun.build({
  entrypoints: [path.resolve("src", "sw.ts")],
  outdir,
  target: "browser",
  format: "iife",
  minify: true,
  sourcemap: "none",
  naming: "[name].[ext]",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __PRECACHE__: JSON.stringify(precache),
    __BUILD_HASH__: JSON.stringify(buildId),
  },
});

if (!swResult.success) {
  console.error("❌ Service worker build failed");
  for (const log of swResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

const end = performance.now();

const outputTable = result.outputs.map((output) => ({
  File: path.relative(process.cwd(), output.path),
  Type: output.kind,
  Size: formatFileSize(output.size),
}));

console.table(outputTable);

await Bun.write(
  path.join(outdir, "404.html"),
  Bun.file(path.join(outdir, "index.html")),
);

console.log(`\n✅ Build completed in ${(end - start).toFixed(2)}ms\n`);
