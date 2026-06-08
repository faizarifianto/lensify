import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const { items, removeItem, clearCart } = useCartStore()

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const total = items.reduce((sum, item) => sum + item.pricePerDay, 0)

  const handleRentItem = (item) => {
    onClose()
    // Navigate to checkout with just this single item
    navigate('/checkout', { state: { camera: item } })
  }

  const handleRentAll = () => {
    if (items.length === 0) return
    onClose()
    // All items are in cartStore — Checkout.jsx will read them automatically
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-[201] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface text-lg">Keranjang Sewa</h2>
              <p className="text-xs text-on-surface-variant">{items.length} item dipilih</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-30">shopping_cart</span>
              </div>
              <p className="font-headline-md text-on-surface-variant opacity-50">Keranjang kosong</p>
              <p className="text-sm text-on-surface-variant opacity-40">Tambahkan gear dari katalog</p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl font-label-bold text-sm hover:opacity-90 transition-all"
              >
                Jelajahi Katalog
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const imgSrc = item.image
                  ? item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`
                  : null

                return (
                  <div
                    key={item.id}
                    className="bg-surface rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/50 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 border border-outline-variant">
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant opacity-30">camera_alt</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-0.5">
                        {item.brand} · {item.category}
                      </p>
                      <p className="font-label-bold text-on-surface text-sm truncate">{item.name}</p>
                      <p className="text-primary font-bold text-sm mt-0.5">
                        Rp {item.pricePerDay?.toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-on-surface-variant">/hari</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                      <button
                        onClick={() => handleRentItem(item)}
                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        Sewa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant px-6 py-5 bg-white">
            {/* Summary */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-on-surface-variant">Estimasi per hari</span>
              <span className="font-bold text-on-surface">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant opacity-60 mb-4">
              *Tanggal sewa ditentukan di halaman checkout
            </p>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-shrink-0 px-4 py-3 border border-outline-variant rounded-xl text-sm font-label-bold text-on-surface-variant hover:bg-surface transition-all"
              >
                Hapus Semua
              </button>
              <button
                onClick={handleRentAll}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-label-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
                Proses Sewa
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
