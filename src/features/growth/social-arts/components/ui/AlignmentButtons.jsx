export default function AlignmentButtons({ value, onChange }) {
  return (
    <div className="flex gap-1 mt-1">
      {[
        { id: 'left', label: '← Esq' },
        { id: 'center', label: 'Centro' },
        { id: 'right', label: 'Dir →' },
      ].map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex-1 px-2 py-1 rounded text-[10px] transition-colors ${value === opt.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-text-secondary'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
