'use client'

import Image from 'next/image'
import { cn, productImageSrc } from '@/lib/utils'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  /** Tailwind sizes string passed through to next/image. */
  sizes?: string
  priority?: boolean
  className?: string
  /** Extra classes for the foreground image (e.g. a hover transform). */
  imageClassName?: string
}

/**
 * Fills a fixed image slot with any photo, whatever its shape.
 *
 * Product photos arrive in every aspect ratio — a tall phone shot, a
 * wide TV shot, a square studio crop. Two obvious approaches each fail
 * half of them:
 *
 *   object-cover   fills the slot but slices the top and bottom off
 *                  anything portrait.
 *   object-contain shows the whole product but leaves empty bars down
 *                  the sides of anything that is not the slot's shape.
 *
 * So the slot is painted twice. A blown-up, blurred copy of the same
 * image covers the whole slot — no empty bars, whatever the shape —
 * and the real image sits on top, contained, so the product is never
 * cropped. When the photo already matches the slot's shape it covers
 * the backdrop completely and the blur is never seen.
 *
 * A cut-out image with a transparent background simply floats on the
 * soft wash its own edges produce.
 *
 * The backdrop is requested at the smallest configured width and the
 * lowest quality — it is about to be blurred, so the extra bytes are
 * negligible.
 */
export function ProductImage({
  src,
  alt,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',
  priority = false,
  className,
  imageClassName,
}: ProductImageProps) {
  const resolved = productImageSrc(src)

  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-white', className)}>
      {/* Blurred fill — guarantees the slot has no empty edges. */}
      <Image
        src={resolved}
        alt=""
        aria-hidden
        fill
        sizes="64px"
        quality={10}
        loading="lazy"
        draggable={false}
        className="object-cover scale-125 blur-2xl opacity-60 select-none"
      />

      {/* The product itself — always complete, never cropped. */}
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        className={cn('object-contain', imageClassName)}
      />
    </div>
  )
}
