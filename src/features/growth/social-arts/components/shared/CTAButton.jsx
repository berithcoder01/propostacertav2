export default function CTAButton({ ctaButton, alignment = 'center', className = '' }) {
  if (!ctaButton.enabled) return null
  return (
    <div className={`flex ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'} ${className}`}>
      <span
        className="px-6 py-2.5 text-sm font-bold"
        style={{
          background: ctaButton.color,
          color: ctaButton.textColor,
          borderRadius: ctaButton.borderRadius,
        }}
      >
        {ctaButton.text}
      </span>
    </div>
  )
}
