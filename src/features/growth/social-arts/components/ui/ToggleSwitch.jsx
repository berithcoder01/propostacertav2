export default function ToggleSwitch({ enabled, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-[10px] text-text-secondary">{label}</span>}
      <button
        onClick={() => onChange(!enabled)}
        className={`w-8 h-4 rounded-full transition-colors relative ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${enabled ? 'left-4' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
