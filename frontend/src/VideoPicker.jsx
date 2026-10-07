import { useEffect, useState } from "react";

const MAX_VIDEO_SIZE = 40 * 1024 * 1024;
const MIN_SEC = 15;
const MAX_SEC = 30;

function readDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This video cannot be read by the browser."));
    };
    video.src = url;
  });
}

function VideoPicker({
  file,
  onFile,
  onError,
  existingUrl = "",
  removeExisting = false,
  onToggleRemove,
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = async (e) => {
    const picked = e.target.files[0];
    e.target.value = "";
    if (!picked) return;

    if (picked.size > MAX_VIDEO_SIZE) {
      onError("Video must be smaller than 40MB.");
      return;
    }

    try {
      const seconds = await readDuration(picked);
      if (seconds < MIN_SEC - 0.5 || seconds > MAX_SEC + 0.5) {
        onError(
          `Video must be between ${MIN_SEC} and ${MAX_SEC} seconds (yours is ${Math.round(seconds)}s).`
        );
        return;
      }
    } catch (err) {
      onError(err.message);
      return;
    }

    onError("");
    onFile(picked);
  };

  return (
    <div className="video-picker">
      {existingUrl && !file && (
        <>
          <video
            src={existingUrl}
            controls
            preload="metadata"
            className="car-video"
            style={{ opacity: removeExisting ? 0.3 : 1 }}
          />
          <button type="button" onClick={onToggleRemove}>
            {removeExisting ? "Undo remove" : "Remove current video"}
          </button>
        </>
      )}

      {file && (
        <>
          <video src={previewUrl} controls className="car-video" />
          <button type="button" onClick={() => onFile(null)}>
            Remove selected video
          </button>
        </>
      )}

      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        onChange={handleChange}
      />
      <small>
        {existingUrl && !file ? "Choose a file to replace the current video. " : ""}
        MP4, WEBM or MOV, {MIN_SEC} to {MAX_SEC} seconds, max 40MB.
      </small>
    </div>
  );
}

export default VideoPicker;