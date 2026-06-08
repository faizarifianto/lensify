import { Link } from 'react-router-dom'
import { Star, Camera, Tag } from 'lucide-react'

const CATEGORY_LABELS = {
  DSLR: 'DSLR',
  MIRRORLESS: 'Mirrorless',
  ACTION_CAM: 'Action Cam',
  FILM: 'Film',
  MEDIUM_FORMAT: 'Medium Format',
  ACCESSORIES: 'Accessories',
}

const CATEGORY_COLORS = {
  DSLR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MIRRORLESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ACTION_CAM: 'bg-green-500/20 text-green-400 border-green-500/30',
  FILM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  MEDIUM_FORMAT: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  ACCESSORIES: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function CameraCard({ camera }) {
  const image = camera.images?.[0]
  const rating = camera.avgRating || 0
  const reviewCount = camera.reviewCount || 0
  const categoryColor = CATEGORY_COLORS[camera.category] || 'bg-gray-500/20 text-gray-400'
  const categoryLabel = CATEGORY_LABELS[camera.category] || camera.category

  return (
    <Link to={`/cameras/${camera.id}`} className="group block">
      <div className="card-hover h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900">
          {image ? (
            <img
              src={image.startsWith('http') ? image : image}
              alt={camera.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600/30 to-accent-500/30 flex items-center justify-center">
                <Camera size={28} className="text-primary-400" />
              </div>
              <p className="text-xs text-gray-600">{camera.brand}</p>
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge border text-xs ${categoryColor}`}>{categoryLabel}</span>
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-sm font-medium">Lihat Detail →</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-500 mb-1">{camera.brand}</p>
          <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-1 mb-2">
            {camera.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {rating > 0 ? `${rating} (${reviewCount})` : 'Belum ada ulasan'}
            </span>
          </div>

          {/* Price */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Tag size={10} /> Sewa per hari</p>
              <p className="text-lg font-bold gradient-text">
                Rp {camera.pricePerDay.toLocaleString('id-ID')}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              camera.stock > 0
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${camera.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
