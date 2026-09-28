// Shrinks a picture in the browser before it is uploaded, so catalog
// pictures stay small and the catalogs page loads fast.

export type CompressedImage = {
  blob: Blob;
  contentType: string;
  extension: string;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as a picture."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(
  file: File,
  maxSide = 900,
  quality = 0.82
): Promise<CompressedImage> {
  const img = await loadImage(file);

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const ratio = Math.min(1, maxSide / longest);
  const width = Math.max(1, Math.round(img.naturalWidth * ratio));
  const height = Math.max(1, Math.round(img.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process the picture.");

  // Flatten any transparency onto the card background colour.
  ctx.fillStyle = "#17171a";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Prefer webp; older Safari falls back to png when webp is unsupported,
  // in which case jpeg is used instead.
  let blob = await canvasToBlob(canvas, "image/webp", quality);
  if (blob && blob.type === "image/webp") {
    return { blob, contentType: "image/webp", extension: "webp" };
  }

  blob = await canvasToBlob(canvas, "image/jpeg", quality);
  if (!blob) throw new Error("The picture could not be compressed.");
  return { blob, contentType: "image/jpeg", extension: "jpg" };
}
