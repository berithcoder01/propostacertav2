const POSITION_MAP = {
  'top': { top: '20px', left: '20px', right: '20px', bottom: 'auto' },
  'bottom': { top: 'auto', left: '20px', right: '20px', bottom: '20px' },
  'top-left': { top: '20px', left: '20px' },
  'top-right': { top: '20px', right: '20px' },
  'bottom-left': { bottom: '20px', left: '20px' },
  'bottom-right': { bottom: '20px', right: '20px' },
}

const SIZE_MAP = {
  sm: { width: '40px', height: '40px' },
  md: { width: '80px', height: '80px' },
  lg: { width: '120px', height: '120px' },
}

function ShapeRenderer({ item, color }) {
  const pos = POSITION_MAP[item.position] || POSITION_MAP.bottom
  const size = SIZE_MAP[item.size] || SIZE_MAP.md
  const opacity = item.opacity ?? 0.6

  const baseStyle = {
    position: 'absolute',
    zIndex: 6,
    opacity,
    ...pos,
  }

  switch (item.type) {
    case 'accent-line':
      return (
        <div
          style={{
            ...baseStyle,
            height: '2px',
            background: `linear-gradient(to right, ${color}, transparent)`,
            left: '20px',
            right: item.position === 'top' ? '20px' : '20px',
            top: item.position === 'top' ? '20px' : 'auto',
            bottom: item.position === 'bottom' ? '20px' : 'auto',
          }}
        />
      )
    case 'corner-fill':
      return (
        <div
          style={{
            ...baseStyle,
            width: '60px',
            height: '60px',
            background: `linear-gradient(135deg, ${color}, transparent)`,
            borderRadius: '0',
          }}
        />
      )
    case 'glow-circle':
      return (
        <div
          style={{
            ...baseStyle,
            ...size,
            borderRadius: '50%',
            background: color,
            filter: 'blur(30px)',
          }}
        />
      )
    case 'dot-grid':
      return (
        <div style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, opacity: opacity * 0.5 }} />
          ))}
        </div>
      )
    case 'badge-seal':
      return (
        <div
          style={{
            ...baseStyle,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ★
        </div>
      )
    default:
      return null
  }
}

export default function DecorativeShapes({ shapes, items = [], primary, secondary }) {
  return (
    <>
      {/* Legacy shapes support */}
      {shapes?.includes('circle-tl') && <div className="absolute top-6 left-6 w-16 h-16 rounded-full opacity-20 z-[6]" style={{ background: secondary }} />}
      {shapes?.includes('circle-br') && <div className="absolute bottom-24 right-6 w-12 h-12 rounded-full opacity-20 z-[6]" style={{ background: primary }} />}
      {shapes?.includes('line-top') && <div className="absolute top-0 left-0 right-0 h-1 z-[6]" style={{ background: `linear-gradient(to right, ${secondary}, transparent)` }} />}
      {shapes?.includes('line-bottom') && <div className="absolute bottom-20 left-6 right-6 h-0.5 opacity-30 z-[6]" style={{ background: secondary }} />}
      {shapes?.includes('badge') && <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold z-[6]" style={{ background: secondary }}>★</div>}
      {shapes?.includes('dots') && <div className="absolute top-1/2 right-6 flex flex-col gap-1 z-[6]">{[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: secondary }} />)}</div>}
      {shapes?.includes('corner') && <div className="absolute top-0 left-0 w-16 h-16 opacity-30 z-[6]" style={{ background: `linear-gradient(135deg, ${secondary}, transparent)` }} />}
      {shapes?.includes('star') && <div className="absolute top-10 right-10 text-2xl opacity-40 z-[6]" style={{ color: secondary }}>★</div>}

      {/* New items-based decorations */}
      {items.map((item, i) => {
        const color = item.color === 'primary' ? primary
                    : item.color === 'secondary' ? secondary
                    : item.color || secondary
        return <ShapeRenderer key={i} item={item} color={color} />
      })}
    </>
  )
}
