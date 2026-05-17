export const gradientPresets = [
  { id: 'ocean', name: 'Oceano', type: 'linear', angle: 135, stops: [{ color: '#667eea', pos: 0 }, { color: '#764ba2', pos: 100 }] },
  { id: 'sunset', name: 'Pôr do Sol', type: 'linear', angle: 135, stops: [{ color: '#f093fb', pos: 0 }, { color: '#f5576c', pos: 100 }] },
  { id: 'forest', name: 'Floresta', type: 'linear', angle: 135, stops: [{ color: '#11998e', pos: 0 }, { color: '#38ef7d', pos: 100 }] },
  { id: 'fire', name: 'Fogo', type: 'linear', angle: 135, stops: [{ color: '#f12711', pos: 0 }, { color: '#f5af19', pos: 100 }] },
  { id: 'midnight', name: 'Meia-Noite', type: 'linear', angle: 135, stops: [{ color: '#232526', pos: 0 }, { color: '#414345', pos: 100 }] },
  { id: 'royal', name: 'Real', type: 'linear', angle: 135, stops: [{ color: '#141E30', pos: 0 }, { color: '#243B55', pos: 100 }] },
  { id: 'coral', name: 'Coral', type: 'linear', angle: 135, stops: [{ color: '#ff9a9e', pos: 0 }, { color: '#fecfef', pos: 100 }] },
  { id: 'sky', name: 'Céu', type: 'linear', angle: 135, stops: [{ color: '#a1c4fd', pos: 0 }, { color: '#c2e9fb', pos: 100 }] },
  { id: 'aurora', name: 'Aurora', type: 'linear', angle: 135, stops: [{ color: '#43e97b', pos: 0 }, { color: '#38f9d7', pos: 100 }] },
  { id: 'neon', name: 'Neon', type: 'linear', angle: 135, stops: [{ color: '#00f260', pos: 0 }, { color: '#0575e6', pos: 100 }] },
  { id: 'brand', name: 'Marca', type: 'linear', angle: 135, stops: [{ color: '#1A5276', pos: 0 }, { color: '#E87722', pos: 100 }] },
  { id: 'dark-pro', name: 'Dark Pro', type: 'linear', angle: 145, stops: [{ color: '#0c0c0c', pos: 0 }, { color: '#1e3a5f', pos: 50 }, { color: '#0a0a0a', pos: 100 }] },
  { id: 'radial-spot', name: 'Spotlight', type: 'radial', angle: 0, stops: [{ color: '#667eea', pos: 0 }, { color: '#1a1a2e', pos: 100 }] },
  { id: 'radial-warm', name: 'Quente', type: 'radial', angle: 0, stops: [{ color: '#f5af19', pos: 0 }, { color: '#1a1a1a', pos: 100 }] },
  { id: 'radial-cool', name: 'Frio', type: 'radial', angle: 0, stops: [{ color: '#667eea', pos: 0 }, { color: '#0a0a0a', pos: 100 }] },
]

export const createGradientCSS = (gradient) => {
  const { type = 'linear', angle = 135, stops = [] } = gradient
  const stopsCSS = stops.map(s => `${s.color} ${s.pos}%`).join(', ')

  if (type === 'radial') {
    return `radial-gradient(circle, ${stopsCSS})`
  }
  if (type === 'conic') {
    return `conic-gradient(from ${angle}deg, ${stopsCSS})`
  }
  return `linear-gradient(${angle}deg, ${stopsCSS})`
}
