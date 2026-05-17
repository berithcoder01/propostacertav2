export default function ColorPickerRow({ label, value, onChange }) {
  return (
    <div className="flex-1">
      <label className="text-[9px] text-text-secondary">{label}</label>
      <div className="flex items-center gap-1">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
        <span className="text-[9px] text-text-secondary font-mono">{value}</span>
      </div>
    </div>
  )
}
