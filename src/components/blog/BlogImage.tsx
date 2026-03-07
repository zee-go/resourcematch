import Image from "next/image";

interface BlogImageProps {
  src: string;
  alt: string;
  credit?: string;
  creditUrl?: string;
}

export function BlogImage({ src, alt, credit, creditUrl }: BlogImageProps) {
  return (
    <figure className="my-8">
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
      {credit && (
        <figcaption className="text-xs text-muted-foreground mt-2 text-center">
          Photo by{" "}
          {creditUrl ? (
            <a
              href={creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {credit}
            </a>
          ) : (
            credit
          )}{" "}
          / Unsplash
        </figcaption>
      )}
    </figure>
  );
}
