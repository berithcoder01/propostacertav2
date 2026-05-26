const POSITION_MAP = {
  'top':          { top: '20px', left: '20px', right: '20px', bottom: 'auto' },
  'bottom':       { top: 'auto', left: '20px', right: '20px', bottom: '20px' },
  'top-left':     { top: '16px', left: '16px' },
  'top-right':    { top: '16px', right: '16px' },
  'bottom-left':  { bottom: '16px', left: '16px' },
  'bottom-right': { bottom: '16px', right: '16px' },
}

const SIZE_MAP = {
  sm: { width: '36px', height: '36px' },
  md: { width: '72px', height: '72px' },
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
    // ── Linhas & Bordas ────────────────────────────────
    case 'accent-line':
      return (
        <div
          style={{
            ...baseStyle,
            height: '3px',
            background: `linear-gradient(to right, ${color}, transparent)`,
            left: '20px',
            right: '20px',
            top: item.position === 'top' ? '20px' : 'auto',
            bottom: item.position !== 'top' ? '20px' : 'auto',
          }}
        />
      )

    case 'double-line':
      return (
        <div
          style={{
            ...baseStyle,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            left: '20px',
            right: '20px',
          }}
        >
          <div style={{ height: '3px', background: color, borderRadius: '2px' }} />
          <div style={{ height: '1px', background: color, opacity: 0.4, borderRadius: '1px' }} />
        </div>
      )

    case 'diagonal-band': {
      const sizeVal = SIZE_MAP[item.size] || SIZE_MAP.md
      return (
        <div
          style={{
            ...baseStyle,
            width: sizeVal.width,
            height: sizeVal.height,
            background: color,
            transform: 'skewX(-20deg)',
            borderRadius: '4px',
          }}
        />
      )
    }

    // ── Formas Geométricas ─────────────────────────────
    case 'glow-circle': {
      const sizeVal = SIZE_MAP[item.size] || SIZE_MAP.md
      return (
        <div
          style={{
            ...baseStyle,
            ...sizeVal,
            borderRadius: '50%',
            background: color,
            filter: 'blur(30px)',
          }}
        />
      )
    }

    case 'corner-fill':
      return (
        <div
          style={{
            ...baseStyle,
            width: '70px',
            height: '70px',
            background: `linear-gradient(135deg, ${color}, transparent)`,
          }}
        />
      )

    case 'ring': {
      const sizeVal = SIZE_MAP[item.size] || SIZE_MAP.md
      return (
        <div
          style={{
            ...baseStyle,
            ...sizeVal,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            background: 'transparent',
          }}
        />
      )
    }

    case 'square-block': {
      const sizeVal = SIZE_MAP[item.size] || SIZE_MAP.md
      return (
        <div
          style={{
            ...baseStyle,
            width: sizeVal.width,
            height: sizeVal.height,
            background: color,
            borderRadius: '6px',
          }}
        />
      )
    }

    // ── Padrões & Texturas ─────────────────────────────
    case 'dot-grid':
      return (
        <div
          style={{
            ...baseStyle,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            width: '60px',
          }}
        >
          {Array(12).fill(0).map((_, i) => (
            <div
              key={i}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }}
            />
          ))}
        </div>
      )

    case 'dots-line':
      return (
        <div
          style={{
            ...baseStyle,
            display: 'flex',
            gap: '6px',
            left: '20px',
            right: '20px',
            justifyContent: item.position?.includes('center') ? 'center' : 'flex-start',
          }}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }}
            />
          ))}
        </div>
      )

    case 'cross-pattern': {
      const crossSize = item.size === 'sm' ? 24 : item.size === 'lg' ? 56 : 36
      return (
        <div
          style={{
            ...baseStyle,
            width: `${crossSize}px`,
            height: `${crossSize}px`,
            position: 'absolute',
            ...pos,
          }}
        >
          <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: '4px', height: '100%', background: color, borderRadius: '2px' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', height: '4px', width: '100%', background: color, borderRadius: '2px' }} />
        </div>
      )
    }

    // ── Selos & Emblemas ───────────────────────────────
    case 'badge-seal':
      return (
        <div
          style={{
            ...baseStyle,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          ★
        </div>
      )

    case 'star-burst':
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: '32px',
            lineHeight: 1,
            color,
            textShadow: `0 0 20px ${color}`,
          }}
        >
          ✦
        </div>
      )

    case 'verified-badge':
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
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          ✓
        </div>
      )

    default:
      return null
  }
}

export default function DecorativeShapes({ shapes, items = [], primary, secondary }) {
  return (
    <>
      {/* Legacy shapes support (mantido para retrocompatibilidade) */}
      {shapes?.includes('circle-tl') && <div className="absolute top-6 left-6 w-16 h-16 rounded-full opacity-20 z-[6]" style={{ background: secondary }} />}
      {shapes?.includes('circle-br') && <div className="absolute bottom-24 right-6 w-12 h-12 rounded-full opacity-20 z-[6]" style={{ background: primary }} />}
      {shapes?.includes('line-top') && <div className="absolute top-0 left-0 right-0 h-1 z-[6]" style={{ background: `linear-gradient(to right, ${secondary}, transparent)` }} />}
      {shapes?.includes('line-bottom') && <div className="absolute bottom-20 left-6 right-6 h-0.5 opacity-30 z-[6]" style={{ background: secondary }} />}
      {shapes?.includes('badge') && <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold z-[6]" style={{ background: secondary }}>★</div>}
      {shapes?.includes('dots') && <div className="absolute top-1/2 right-6 flex flex-col gap-1 z-[6]">{[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: secondary }} />)}</div>}
      {shapes?.includes('corner') && <div className="absolute top-0 left-0 w-16 h-16 opacity-30 z-[6]" style={{ background: `linear-gradient(135deg, ${secondary}, transparent)` }} />}
      {shapes?.includes('star') && <div className="absolute top-10 right-10 text-2xl opacity-40 z-[6]" style={{ color: secondary }}>★</div>}

      {/* Novo sistema de decorações */}
      {items.map((item, i) => {
        const color = item.color === 'primary' ? primary
                    : item.color === 'secondary' ? secondary
                    : item.color || secondary
        return <ShapeRenderer key={item.id || i} item={item} color={color} />
      })}
    </>
  )
}
