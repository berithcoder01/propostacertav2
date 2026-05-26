import { useEditor } from '../context/EditorContext'
import { SliderControl } from '../components/ui'

// Decorações modernas com previews SVG inline
const DECORATION_CATALOG = [
  {
    group: '✦ Linhas & Bordas',
    items: [
      {
        id: 'accent-line',
        label: 'Faixa Gradiente',
        desc: 'Linha colorida no topo ou base',
        preview: (color) => (
          <div style={{ width: '100%', height: '4px', background: `linear-gradient(to right, ${color}, transparent)`, borderRadius: '2px' }} />
        ),
        positions: ['top', 'bottom'],
        defaultSize: null,
      },
      {
        id: 'double-line',
        label: 'Dupla Linha',
        desc: 'Duas linhas paralelas',
        preview: (color) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ height: '3px', background: color, borderRadius: '2px' }} />
            <div style={{ height: '1px', background: color, opacity: 0.4, borderRadius: '1px' }} />
          </div>
        ),
        positions: ['top', 'bottom'],
        defaultSize: null,
      },
      {
        id: 'diagonal-band',
        label: 'Faixa Diagonal',
        desc: 'Banda diagonal de cor',
        preview: (color) => (
          <div style={{ width: '100%', height: '20px', background: color, transform: 'skewX(-20deg)', opacity: 0.7, borderRadius: '2px' }} />
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: 'md',
      },
    ],
  },
  {
    group: '◉ Formas Geométricas',
    items: [
      {
        id: 'glow-circle',
        label: 'Brilho / Glow',
        desc: 'Círculo com desfoque suave',
        preview: (color) => (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, filter: 'blur(8px)', margin: '0 auto' }} />
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: 'md',
      },
      {
        id: 'corner-fill',
        label: 'Triângulo de Canto',
        desc: 'Gradiente em canto',
        preview: (color) => (
          <div style={{ width: '24px', height: '24px', background: `linear-gradient(135deg, ${color}, transparent)`, margin: '0 auto' }} />
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: null,
      },
      {
        id: 'ring',
        label: 'Anel / Ring',
        desc: 'Círculo com borda',
        preview: (color) => (
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `3px solid ${color}`, margin: '0 auto' }} />
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: 'md',
      },
      {
        id: 'square-block',
        label: 'Bloco Quadrado',
        desc: 'Quadrado sólido decorativo',
        preview: (color) => (
          <div style={{ width: '20px', height: '20px', background: color, margin: '0 auto', borderRadius: '3px' }} />
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: 'md',
      },
    ],
  },
  {
    group: '⋮ Padrões & Texturas',
    items: [
      {
        id: 'dot-grid',
        label: 'Grade de Pontos',
        desc: 'Padrão de pontos decorativos',
        preview: (color) => (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', width: '28px', margin: '0 auto' }}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: color }} />
            ))}
          </div>
        ),
        positions: ['top-right', 'bottom-left', 'top-left', 'bottom-right'],
        defaultSize: null,
      },
      {
        id: 'dots-line',
        label: 'Linha de Pontos',
        desc: 'Sequência horizontal de pontos',
        preview: (color) => (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />
            ))}
          </div>
        ),
        positions: ['top', 'bottom', 'top-left', 'top-right'],
        defaultSize: null,
      },
      {
        id: 'cross-pattern',
        label: 'Padrão Cruz',
        desc: 'Símbolo de mais (+) como decoração',
        preview: (color) => (
          <div style={{ position: 'relative', width: '24px', height: '24px', margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: '4px', height: '100%', background: color, borderRadius: '2px' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', height: '4px', width: '100%', background: color, borderRadius: '2px' }} />
          </div>
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: 'sm',
      },
    ],
  },
  {
    group: '★ Selos & Emblemas',
    items: [
      {
        id: 'badge-seal',
        label: 'Selo Circular',
        desc: 'Círculo com estrela — destaque',
        preview: (color) => (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', margin: '0 auto' }}>
            ★
          </div>
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        defaultSize: null,
      },
      {
        id: 'star-burst',
        label: 'Destaque Estrela',
        desc: 'Ícone de estrela luminosa',
        preview: (color) => (
          <div style={{ fontSize: '20px', textAlign: 'center', lineHeight: 1, color }}>✦</div>
        ),
        positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom'],
        defaultSize: null,
      },
      {
        id: 'verified-badge',
        label: 'Verificado',
        desc: 'Símbolo de verificado/confiança',
        preview: (color) => (
          <div style={{ fontSize: '18px', textAlign: 'center', lineHeight: 1, color }}>✓</div>
        ),
        positions: ['top-right', 'bottom-right'],
        defaultSize: null,
      },
    ],
  },
]

const POSITION_LABELS = {
  'top': 'Topo (centro)',
  'bottom': 'Base (centro)',
  'top-left': 'Topo esquerdo',
  'top-right': 'Topo direito',
  'bottom-left': 'Base esquerda',
  'bottom-right': 'Base direita',
}

const SIZE_LABELS = { sm: 'P', md: 'M', lg: 'G' }

function DecorationItem({ item, index, actions }) {
  const catalog = DECORATION_CATALOG.flatMap(g => g.items)
  const typeDef = catalog.find(t => t.id === item.type)
  const positions = typeDef?.positions || ['bottom']

  const previewColor = item.color === 'primary' ? 'var(--brand-primary, #10B981)' : 'var(--brand-secondary, #E87722)'

  return (
    <div className="p-3 rounded-xl bg-editor-input border border-editor-input-border space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-editor-panel border border-editor-input-border flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
            {typeDef?.preview(previewColor)}
          </div>
          <div>
            <div className="text-[10px] font-bold text-editor-text leading-tight">{typeDef?.label}</div>
            <div className="text-[8px] text-text-muted leading-tight">{typeDef?.desc}</div>
          </div>
        </div>
        <button
          onClick={() => actions.removeDecoration(index)}
          className="text-text-muted hover:text-red-400 text-xs transition-colors p-1"
        >
          ✕
        </button>
      </div>

      {/* Posição */}
      <div>
        <label className="text-[9px] text-text-secondary uppercase tracking-wider mb-1 block">Posição</label>
        <div className="grid grid-cols-2 gap-1">
          {positions.map(p => (
            <button
              key={p}
              onClick={() => actions.updateDecoration(index, { position: p })}
              className={`py-1 px-1.5 rounded-lg text-[9px] text-center border transition-all ${
                item.position === p
                  ? 'bg-accent text-white border-accent'
                  : 'bg-editor-panel border-editor-input-border text-text-secondary hover:border-accent/40 hover:text-editor-text'
              }`}
            >
              {POSITION_LABELS[p] || p}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-text-secondary uppercase tracking-wider w-8 flex-shrink-0">Cor</label>
        <div className="flex gap-2">
          {['primary', 'secondary'].map(c => (
            <button
              key={c}
              onClick={() => actions.updateDecoration(index, { color: c })}
              title={c === 'primary' ? 'Cor primária da marca' : 'Cor secundária da marca'}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                item.color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ background: c === 'primary' ? 'var(--brand-primary, #10B981)' : 'var(--brand-secondary, #E87722)' }}
            />
          ))}
        </div>
      </div>

      {/* Opacidade */}
      <SliderControl
        label="Opacidade"
        value={Math.round(item.opacity * 100)}
        min={5}
        max={100}
        step={5}
        onChange={v => actions.updateDecoration(index, { opacity: v / 100 })}
        unit="%"
      />

      {/* Tamanho (se aplicável) */}
      {typeDef?.defaultSize && (
        <div>
          <label className="text-[9px] text-text-secondary uppercase tracking-wider mb-1 block">Tamanho</label>
          <div className="flex gap-1">
            {['sm', 'md', 'lg'].map(s => (
              <button
                key={s}
                onClick={() => actions.updateDecoration(index, { size: s })}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  item.size === s
                    ? 'bg-accent text-white border-accent'
                    : 'bg-editor-panel border-editor-input-border text-text-secondary hover:text-editor-text'
                }`}
              >
                {SIZE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DecorationPanel() {
  const { state, actions } = useEditor()
  const { items } = state.decoration

  return (
    <div className="space-y-4">
      {/* Elementos ativos */}
      {items.length > 0 && (
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
            Ativos ({items.length}/5)
          </label>
          {items.map((item, i) => (
            <DecorationItem key={item.id} item={item} index={i} actions={actions} />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">✦</div>
          <p className="text-xs text-text-secondary opacity-60">Adicione elementos visuais abaixo</p>
        </div>
      )}

      {/* Catálogo para adicionar */}
      {items.length < 5 && (
        <div className="space-y-3 border-t border-border/40 dark:border-white/5 pt-3">
          <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
            + Adicionar decoração
          </label>

          {DECORATION_CATALOG.map(group => (
            <div key={group.group}>
              <div className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1.5 px-0.5">
                {group.group}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {group.items.map(type => (
                  <button
                    key={type.id}
                    onClick={() => actions.addDecoration(type.id)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-editor-input border border-editor-input-border hover:border-accent/60 hover:bg-accent/5 transition-all group"
                    title={type.desc}
                  >
                    <div className="w-full flex items-center justify-center h-8">
                      {type.preview('var(--brand-secondary, #E87722)')}
                    </div>
                    <span className="text-[8px] text-text-secondary group-hover:text-editor-text leading-tight text-center transition-colors">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length >= 5 && (
        <p className="text-[10px] text-text-secondary/60 text-center italic">
          Máximo de 5 decorações atingido. Remova uma para adicionar outra.
        </p>
      )}
    </div>
  )
}
