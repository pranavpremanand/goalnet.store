"use client";

import { useRef, useState } from "react";
import {
  LuLoaderCircle as Loader,
  LuPause as Pause,
  LuPlay as Play,
  LuTrash2 as Trash2,
  LuUpload as Upload,
} from "react-icons/lu";
import {
  HERO_VIDEO_MIME_TYPES,
  MAX_HERO_VIDEO_BYTES,
  MAX_HERO_VIDEO_DURATION_SECONDS,
} from "@/lib/catalog-constants";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { uploadHeroVideo } from "@/lib/admin-api";
import type { HeroMedia } from "@/lib/types/hero";
import type { UploadSession } from "@/components/pages/admin/useUploadSession";

type HeroMediaUploaderProps = {
  value: HeroMedia;
  onChange: (media: HeroMedia) => void;
  session: UploadSession;
};

const emptyVideo: HeroMedia = {
  url: "",
  fileId: "",
  alt: "",
  mediaType: "video",
};

let ffmpegPromise: Promise<FFmpeg> | null = null;

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: new () => FFmpeg };
  }
}

function loadFFmpegEngine() {
  return new Promise<FFmpeg>((resolve, reject) => {
    const existing = window.FFmpegWASM?.FFmpeg;
    if (existing) {
      resolve(new existing());
      return;
    }

    const script = document.createElement("script");
    script.src = "/ffmpeg/ffmpeg.js";
    script.async = true;
    script.onload = () => {
      const constructor = window.FFmpegWASM?.FFmpeg;
      if (!constructor) {
        reject(new Error("The video trimming engine could not be initialized."));
        return;
      }
      resolve(new constructor());
    };
    script.onerror = () => reject(new Error("The video trimming engine could not be loaded."));
    document.head.appendChild(script);
  });
}

function getFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = loadFFmpegEngine()
      .then(async (ffmpeg) => {
        await ffmpeg.load({
          coreURL: new URL("/ffmpeg/ffmpeg-core.js", window.location.origin).href,
          wasmURL: new URL("/ffmpeg/ffmpeg-core.wasm", window.location.origin).href,
        });
        return ffmpeg;
      })
      .catch((error: unknown) => {
        ffmpegPromise = null;
        throw error;
      });
  }
  return ffmpegPromise;
}

async function trimVideoToLimit(file: File): Promise<File> {
  if (file.size > MAX_HERO_VIDEO_BYTES) {
    throw new Error("Videos must be 20 MB or smaller.");
  }

  const sourceUrl = URL.createObjectURL(file);
  const source = document.createElement("video");
  source.muted = true;
  source.playsInline = true;
  source.preload = "auto";
  source.src = sourceUrl;
  let ffmpeg: FFmpeg | null = null;
  const temporaryFiles: string[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      source.addEventListener("loadedmetadata", () => resolve(), { once: true });
      source.addEventListener("error", () => reject(new Error("The selected video could not be read.")), { once: true });
      source.load();
    });

    if (!Number.isFinite(source.duration) || source.duration <= 0) {
      throw new Error("The video length could not be determined.");
    }
    if (source.duration <= MAX_HERO_VIDEO_DURATION_SECONDS) {
      return file;
    }

    const extension = file.type === "video/webm" ? "webm" : "mp4";
    const inputName = `input.${extension}`;
    const outputName = `trimmed.${extension}`;
    ffmpeg = await getFFmpeg();
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    temporaryFiles.push(inputName);
    temporaryFiles.push(outputName);
    const exitCode = await ffmpeg.exec([
      "-i", inputName,
      "-t", String(MAX_HERO_VIDEO_DURATION_SECONDS),
      "-map", "0:v:0",
      "-map", "0:a?",
      "-c", "copy",
      "-avoid_negative_ts", "make_zero",
      outputName,
    ], 120_000);
    if (exitCode !== 0) throw new Error("The selected video could not be trimmed. Try another MP4 or WebM video.");
    temporaryFiles.push(outputName);

    const trimmedData = await ffmpeg.readFile(outputName);
    if (typeof trimmedData === "string" || trimmedData.length === 0) {
      throw new Error("The trimmed video is empty. Try another video.");
    }

    const name = file.name.replace(/\.[^.]+$/, "") || "hero-video";
    return new File([new Uint8Array(trimmedData)], `${name}.${extension}`, { type: file.type });
  } finally {
    if (ffmpeg?.loaded) {
      for (const temporaryFile of temporaryFiles) {
        try {
          const files = await ffmpeg.listDir("/");
          if (files.some((file) => file.name === temporaryFile)) {
            await ffmpeg.deleteFile(temporaryFile);
          }
        } catch (cleanupError) {
          console.error(`Could not remove temporary video file ${temporaryFile}`, cleanupError);
        }
      }
    }
    source.pause();
    source.removeAttribute("src");
    source.load();
    URL.revokeObjectURL(sourceUrl);
  }
}

export function HeroMediaUploader({
  value,
  onChange,
  session,
}: HeroMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uploadStage, setUploadStage] = useState<"idle" | "trimming" | "uploading">("idle");
  const [playing, setPlaying] = useState(false);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setUploadStage("trimming");
      const trimmedFile = await trimVideoToLimit(file);
      setUploadStage("uploading");
      const video = await uploadHeroVideo(trimmedFile);
      session.track(video.fileId);
      onChange(video);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The video upload failed. Please try again.",
      );
    } finally {
      setUploadStage("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeVideo() {
    session.release(value.fileId);
    onChange(emptyVideo);
  }

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video || !readyToPlay) return;

    setError("");
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setError("The video preview could not start. The uploaded file may not be playable in this browser.");
      }
    } else {
      video.pause();
    }
  }

  return (
    <div>
      {value.fileId ? (
        <div className="max-w-md border border-line p-2">
          <video
            aria-label="Hero video preview"
            className="aspect-video w-full bg-canvas object-cover"
            onCanPlay={() => setReadyToPlay(true)}
            onError={() => {
              setReadyToPlay(false);
              setPlaying(false);
              setError("The video preview could not load. The stored file may be unavailable or use an unsupported format.");
            }}
            onLoadStart={() => {
              setReadyToPlay(false);
              setPlaying(false);
            }}
            muted
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onEnded={() => setPlaying(false)}
            onLoadedData={(event) => {
              const video = event.currentTarget;
              if (Number.isFinite(video.duration) && video.duration > 0) {
                video.currentTime = Math.min(1, video.duration / 2);
              }
            }}
            playsInline
            preload="auto"
            ref={videoRef}
            src={value.url}
          />
          {readyToPlay ? (
            <button
              aria-label={playing ? "Pause video" : "Play video"}
              className="mt-2 inline-flex min-h-10 items-center gap-2 border border-ink px-3 text-xs font-bold uppercase hover:bg-canvas"
              onClick={() => void togglePlayback()}
              type="button"
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
              {playing ? "Pause" : "Play"}
            </button>
          ) : !error ? (
            <p aria-live="polite" className="mt-2 text-xs text-muted">Loading video preview…</p>
          ) : null}
          <button
            className="ml-4 mt-2 inline-flex min-h-10 items-center gap-1 text-[10px] font-bold uppercase text-red-700"
            onClick={removeVideo}
            type="button"
          >
            <Trash2 size={13} /> Remove video
          </button>
        </div>
      ) : (
        <label
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 border border-ink px-4 text-xs font-bold uppercase hover:bg-canvas ${uploadStage !== "idle" ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploadStage !== "idle" ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            <Upload size={16} />
          )}
          {uploadStage === "trimming" ? "Preparing video" : uploadStage === "uploading" ? "Uploading video" : "Upload video"}
          <input
            accept={HERO_VIDEO_MIME_TYPES.join(",")}
            className="sr-only"
            disabled={uploadStage !== "idle"}
            onChange={(event) => void handleFile(event.target.files?.[0])}
            ref={inputRef}
            type="file"
          />
        </label>
      )}
      <p className="mt-2 text-[11px] text-muted">
        MP4 or WebM, up to 20 MB and 10 seconds. Longer videos are trimmed without re-encoding; the cut may be slightly shorter to preserve the original frames.
      </p>
      {error && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
