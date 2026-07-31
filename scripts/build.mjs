import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const temporaryDirectory = path.resolve(".workbox-tmp");
await mkdir(temporaryDirectory, { recursive: true });
process.env.TMPDIR = temporaryDirectory;

try {
  const { build } = await import("vite");
  await build();
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
