export default function SliderControl({ label, value, min, max, step, onChange, unit = 'px' }) {
  return (
    <div>
      <label className="text-[10px] text-text-secondary">{label}: {value}{unit}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500 h-1"
      />
    </div>
  )
}
