export default function LogoOrInitial({ logo, name, secondary, size = 'md', className = '' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-2xl' }
  if (logo) {
    return <img src={logo} alt={name} className={`${sizes[size]} object-contain rounded-lg ${className}`} />
  }
  return (
    <div className={`${sizes[size]} rounded-lg flex items-center justify-center font-black text-white ${className}`}
      style={{ background: secondary }}>
      {name.charAt(0)}
    </div>
  )
}
