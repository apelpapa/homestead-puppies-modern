import { useEffect, useState } from "react";

type PhotoCarouselProps = {
  images: string[];
  name: string;
  eager?: boolean;
};

export function PhotoCarousel({ images, name, eager = false }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const safeImages = images.filter(Boolean);

  useEffect(() => setIndex(0), [images]);

  if (safeImages.length === 0) {
    return (
      <div className="photo-frame photo-placeholder" role="img" aria-label={`No photo available for ${name}`}>
        <span>{name.slice(0, 1)}</span>
      </div>
    );
  }

  const showPrevious = () =>
    setIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
  const showNext = () =>
    setIndex((current) => (current + 1) % safeImages.length);

  return (
    <div className="photo-frame">
      <img
        src={safeImages[index]}
        alt={`${name}, photo ${index + 1} of ${safeImages.length}`}
        loading={eager && index === 0 ? "eager" : "lazy"}
        fetchPriority={eager && index === 0 ? "high" : "auto"}
        decoding="async"
        width="960"
        height="720"
      />
      {safeImages.length > 1 && (
        <>
          <button
            className="photo-control previous"
            type="button"
            onClick={showPrevious}
            aria-label={`Previous photo of ${name}`}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            className="photo-control next"
            type="button"
            onClick={showNext}
            aria-label={`Next photo of ${name}`}
          >
            <span aria-hidden="true">→</span>
          </button>
          <span className="photo-count" aria-live="polite">
            {index + 1} / {safeImages.length}
          </span>
        </>
      )}
    </div>
  );
}
