import { cn, getRatingStars } from '@/lib/utils'

interface StarRatingProps {
  rating:      number
  reviewCount?: number
  size?:       'sm' | 'md'
  className?:  string
}

export function StarRating({ rating, reviewCount, size = 'sm', className }: StarRatingProps) {
  const stars = getRatingStars(rating)
  const starSize = size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn('flex items-center gap-0.5 leading-none', starSize)} aria-hidden="true">
        {stars.map((type, i) => (
          <span key={i} className={cn(
            type === 'empty' ? 'text-gray-300' : 'text-primary'
          )}>
            {type === 'half' ? '½' : '★'}
          </span>
        ))}
      </div>
      <span className="sr-only">{rating} out of 5 stars</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted">
          {rating.toFixed(1)}
          {reviewCount > 0 && (
            <span className="ml-1 text-blue-600">({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  )
}
