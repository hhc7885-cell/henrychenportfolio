import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

// Static hosts serve exact filenames. Some Next.js builds emit nested RSC
// segments even though the client requests a dot-separated filename.
async function prepare(directory, segmentsRoot) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await prepare(file, segmentsRoot ?? (entry.name.startsWith("__next.") ? directory : undefined));
    } else if (segmentsRoot && entry.name.endsWith(".txt")) {
      const alias = path.relative(segmentsRoot, file).split(path.sep).join(".");
      await copyFile(file, path.join(segmentsRoot, alias));
    }
  }
}

await prepare("out");

