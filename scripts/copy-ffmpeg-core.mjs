import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const coreEntryPath = require.resolve("@ffmpeg/core");
const coreDirectory = dirname(dirname(dirname(coreEntryPath)));
const ffmpegEntryPath = require.resolve("@ffmpeg/ffmpeg");
const ffmpegPackageDirectory = dirname(dirname(dirname(ffmpegEntryPath)));
const ffmpegDirectory = join(ffmpegPackageDirectory, "dist", "umd");
const outputDirectory = join(projectRoot, "public", "ffmpeg");

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
  ["classes.js", "const.js", "errors.js", "index.js", "types.js", "utils.js", "worker.js"].map((file) =>
    rm(join(outputDirectory, file), { force: true }),
  ),
);
await Promise.all(
  [
    copyFile(join(coreDirectory, "dist", "umd", "ffmpeg-core.js"), join(outputDirectory, "ffmpeg-core.js")),
    copyFile(join(coreDirectory, "dist", "umd", "ffmpeg-core.wasm"), join(outputDirectory, "ffmpeg-core.wasm")),
    ...(
      await readdir(ffmpegDirectory)
    )
      .filter((file) => file.endsWith(".js"))
      .map((file) => copyFile(join(ffmpegDirectory, file), join(outputDirectory, file))),
  ],
);
