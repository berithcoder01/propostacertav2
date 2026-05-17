export const patternTypes = [
  { id: 'dots', label: 'Pontos', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${8 * scale}" height="${8 * scale}"><circle cx="${2 * scale}" cy="${2 * scale}" r="${1 * scale}" fill="${color}" opacity="0.3"/></svg>` },
  { id: 'stripes', label: 'Listras', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${8 * scale}" height="${8 * scale}"><rect width="${8 * scale}" height="${4 * scale}" fill="${color}" opacity="0.15"/></svg>` },
  { id: 'grid', label: 'Grid', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${16 * scale}"><rect width="${16 * scale}" height="${16 * scale}" fill="none" stroke="${color}" stroke-width="${0.5 * scale}" opacity="0.15"/></svg>` },
  { id: 'diagonal', label: 'Diagonal', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${8 * scale}" height="${8 * scale}"><line x1="0" y1="${8 * scale}" x2="${8 * scale}" y2="0" stroke="${color}" stroke-width="${0.5 * scale}" opacity="0.2"/></svg>` },
  { id: 'zigzag', label: 'Zigzag', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${8 * scale}"><polyline points="0,${4 * scale} ${4 * scale},0 ${8 * scale},${4 * scale} ${12 * scale},0 ${16 * scale},${4 * scale}" fill="none" stroke="${color}" stroke-width="${1 * scale}" opacity="0.2"/></svg>` },
  { id: 'waves', label: 'Ondas', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${24 * scale}" height="${8 * scale}"><path d="M0 ${4 * scale} Q ${3 * scale} 0 ${6 * scale} ${4 * scale} T ${12 * scale} ${4 * scale} T ${18 * scale} ${4 * scale} T ${24 * scale} ${4 * scale}" fill="none" stroke="${color}" stroke-width="${1 * scale}" opacity="0.2"/></svg>` },
  { id: 'crosshatch', label: 'Cruzado', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${12 * scale}" height="${12 * scale}"><line x1="0" y1="0" x2="${12 * scale}" y2="${12 * scale}" stroke="${color}" stroke-width="${0.5 * scale}" opacity="0.15"/><line x1="${12 * scale}" y1="0" x2="0" y2="${12 * scale}" stroke="${color}" stroke-width="${0.5 * scale}" opacity="0.15"/></svg>` },
  { id: 'hexagons', label: 'Hexágonos', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${28 * scale}"><polygon points="${8 * scale},0 ${16 * scale},${7 * scale} ${16 * scale},${21 * scale} ${8 * scale},${28 * scale} 0,${21 * scale} 0,${7 * scale}" fill="none" stroke="${color}" stroke-width="${0.5 * scale}" opacity="0.15"/></svg>` },
  { id: 'triangles', label: 'Triângulos', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${16 * scale}"><polygon points="${8 * scale},0 0,${16 * scale} ${16 * scale},${16 * scale}" fill="${color}" opacity="0.08"/></svg>` },
  { id: 'circles', label: 'Círculos', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${16 * scale}"><circle cx="${8 * scale}" cy="${8 * scale}" r="${6 * scale}" fill="none" stroke="${color}" stroke-width="${0.5 * scale}" opacity="0.15"/></svg>` },
  { id: 'plus', label: 'Mais', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${16 * scale}"><line x1="${8 * scale}" y1="${3 * scale}" x2="${8 * scale}" y2="${13 * scale}" stroke="${color}" stroke-width="${1 * scale}" opacity="0.2"/><line x1="${3 * scale}" y1="${8 * scale}" x2="${13 * scale}" y2="${8 * scale}" stroke="${color}" stroke-width="${1 * scale}" opacity="0.2"/></svg>` },
  { id: 'chevron', label: 'Chevron', svg: (color = '#ffffff', scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${8 * scale}"><polyline points="0,0 ${8 * scale},${4 * scale} ${16 * scale},0" fill="none" stroke="${color}" stroke-width="${1 * scale}" opacity="0.2"/></svg>` },
]

export const createPatternCSS = (patternId, color = '#ffffff', scale = 1) => {
  const pattern = patternTypes.find(p => p.id === patternId)
  if (!pattern) return 'none'
  const svgData = pattern.svg(color, scale)
  const encoded = encodeURIComponent(svgData)
  return `url("data:image/svg+xml,${encoded}")`
}
