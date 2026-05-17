export default function PhoneDisplay({ phone, className = '' }) {
  return <span className={`text-text-secondary text-sm ${className}`}>{phone}</span>
}
