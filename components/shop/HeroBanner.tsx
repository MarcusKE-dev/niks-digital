'use client'
import { useState, useEffect } from 'react'

interface Props {
  images:    string[]
  interval?: number
}

export function HeroBanner({ images, interval = 3000 }: Props) {
  const [current, setCurrent] = useState(0)
  const validImages = images.filter(img => img && img.trim() !== '')

  useEffect(() => {
    if (validImages.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % validImages.length)
    }, interval)
    return () => clearInterval(timer)
  }, [validImages.length, interval])

  useEffect(() => {
    setCurrent(0)
  }, [validImages.length])

  if (validImages.length === 0) return null

  return (
    <div className="relative w-full h-full overflow-hidden">
      {validImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Banner ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
      {validImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all bg-white ${
                i === current ? 'w-6 opacity-100' : 'w-2 opacity-50'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}