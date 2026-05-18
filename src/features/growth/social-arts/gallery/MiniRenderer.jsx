import { getRenderer } from '../renderers'
import { getInitialFields } from '../data/bannerPresets'

const MOCK_COMPANY = {
  name: 'Sua Empresa',
  phone: '(44) 99999-9999',
  segment: 'SERVICOS',
  primaryColor: '#1A5276',
  secondaryColor: '#E87722',
  logoUrl: null,
}

const MOCK_STATE = {
  uploadedPhoto: null,
  elementOffset: { x: 0, y: 0 },
  decorativeShapes: [],
  layoutSpacing: 16,
  rectBlocks: [],
  ctaButton: {
    enabled: true,
    text: 'Peça seu orçamento!',
    color: '#E87722',
    textColor: '#ffffff',
    borderRadius: 9999,
    alignment: 'center',
  },
}

export default function MiniRenderer({ preset, scale = 0.22 }) {
  const Renderer = getRenderer(preset.id)
  if (!Renderer) return null

  const isStory = preset.sizes.includes('1080x1920')
  const W = 1080
  const H = isStory ? 1920 : 1080

  return (
    <div
      style={{
        width: W * scale,
        height: H * scale,
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Renderer
          company={MOCK_COMPANY}
          fields={getInitialFields(preset)}
          {...MOCK_STATE}
        />
      </div>
    </div>
  )
}
