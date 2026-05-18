export function resolveBackground(bg, company) {
  if (bg.type === 'image' && bg.imageUrl) {
    return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  const c1 = bg.color1 || company?.primaryColor || '#1A5276'
  const c2 = bg.color2 || company?.secondaryColor || '#E87722'
  if (bg.type === 'solid') return { background: c1 }
  return { background: `linear-gradient(${bg.angle}deg, ${c1}, ${c2})` }
}

export function resolveOverlay(bg) {
  if (bg.type !== 'image' || !bg.imageUrl) return null
  return {
    position: 'absolute',
    inset: 0,
    background: `${bg.overlayColor || '#000000'}${Math.round(bg.overlayOpacity * 255).toString(16).padStart(2, '0')}`,
    pointerEvents: 'none',
  }
}
