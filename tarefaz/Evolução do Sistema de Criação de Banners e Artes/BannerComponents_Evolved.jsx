/**
 * COMPONENTES AUXILIARES PARA BANNERS EVOLUÍDOS
 * Componentes reutilizáveis para suportar novos layouts e efeitos
 */

import React from 'react'

/**
 * Componente: GlassmorphismCard
 * Cria um efeito de vidro fosco (frosted glass) com blur e transparência
 */
export const GlassmorphismCard = ({ children, intensity = 'md', className = '' }) => {
  const intensityMap = {
    sm: 'backdrop-blur-sm bg-white/5',
    md: 'backdrop-blur-md bg-white/10',
    lg: 'backdrop-blur-lg bg-white/15',
  }

  return (
    <div className={`${intensityMap[intensity]} border border-white/20 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

/**
 * Componente: GeometricShape
 * Renderiza formas geométricas (círculos, linhas, retângulos) para design
 */
export const GeometricShape = ({
  type = 'circle', // 'circle', 'line', 'rectangle'
  color = '#ffffff',
  size = 'md',
  opacity = 0.3,
  className = '',
}) => {
  const sizeMap = {
    sm: { circle: 'w-8 h-8', rectangle: 'w-16 h-8' },
    md: { circle: 'w-16 h-16', rectangle: 'w-32 h-16' },
    lg: { circle: 'w-24 h-24', rectangle: 'w-48 h-24' },
  }

  if (type === 'circle') {
    return (
      <div
        className={`${sizeMap[size].circle} rounded-full ${className}`}
        style={{ background: color, opacity }}
      />
    )
  }

  if (type === 'rectangle') {
    return (
      <div
        className={`${sizeMap[size].rectangle} rounded-lg ${className}`}
        style={{ background: color, opacity }}
      />
    )
  }

  if (type === 'line') {
    return (
      <div
        className={`h-1 w-full ${className}`}
        style={{ background: color, opacity }}
      />
    )
  }

  return null
}

/**
 * Componente: GradientText
 * Texto com gradiente de cor
 */
export const GradientText = ({
  children,
  from = '#667eea',
  to = '#764ba2',
  className = '',
}) => {
  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {children}
    </span>
  )
}

/**
 * Componente: BadgeWithIcon
 * Badge com ícone e texto
 */
export const BadgeWithIcon = ({
  icon,
  text,
  bgColor = '#ffffff',
  textColor = '#000000',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs ${className}`}
      style={{ background: bgColor, color: textColor }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

/**
 * Componente: VerificationBadge
 * Badge de verificação/certificação
 */
export const VerificationBadge = ({ text = 'Verificado', color = '#10b981' }) => {
  return (
    <div className="flex items-center gap-1" style={{ color }}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-bold">{text}</span>
    </div>
  )
}

/**
 * Componente: ServiceIcon
 * Ícone de serviço com fundo colorido
 */
export const ServiceIcon = ({
  emoji = '⚡',
  bgColor = '#ffffff',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-lg flex items-center justify-center font-bold ${className}`}
      style={{ background: bgColor }}
    >
      {emoji}
    </div>
  )
}

/**
 * Componente: RatingStars
 * Exibe estrelas de avaliação
 */
export const RatingStars = ({
  rating = 5,
  color = '#fbbf24',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className={`flex gap-1 ${sizeMap[size]} ${className}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? color : '#d1d5db' }}>
          ★
        </span>
      ))}
    </div>
  )
}

/**
 * Componente: CallToActionButton
 * Botão de chamada para ação estilizado
 */
export const CallToActionButton = ({
  text = 'Contato',
  bgColor = '#10b981',
  textColor = '#ffffff',
  icon = '📞',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm ${className}`}
      style={{ background: bgColor, color: textColor }}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  )
}

/**
 * Componente: DividerLine
 * Linha divisória com estilo
 */
export const DividerLine = ({
  color = '#ffffff',
  opacity = 0.2,
  thickness = 'thin',
  className = '',
}) => {
  const thicknessMap = {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  }

  return (
    <div
      className={`w-full ${thicknessMap[thickness]} ${className}`}
      style={{ background: color, opacity }}
    />
  )
}

/**
 * Componente: TextOverlay
 * Texto com fundo semi-transparente para melhor legibilidade
 */
export const TextOverlay = ({
  children,
  bgColor = '#000000',
  opacity = 0.7,
  padding = 'md',
  className = '',
}) => {
  const paddingMap = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }

  return (
    <div
      className={`${paddingMap[padding]} rounded-lg ${className}`}
      style={{ background: bgColor, opacity }}
    >
      {children}
    </div>
  )
}

/**
 * Componente: FeatureList
 * Lista de recursos/serviços com ícones
 */
export const FeatureList = ({
  items = [],
  iconColor = '#10b981',
  textColor = '#ffffff',
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-xs"
            style={{ background: iconColor, color: textColor }}
          >
            ✓
          </div>
          <span style={{ color: textColor }} className="text-sm font-medium">
            {item}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Componente: HeroSection
 * Seção hero com título, subtítulo e CTA
 */
export const HeroSection = ({
  title = '',
  subtitle = '',
  ctaText = 'Contato',
  bgGradient = 'linear-gradient(135deg, #667eea, #764ba2)',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 text-center rounded-2xl ${className}`}
      style={{ background: bgGradient }}
    >
      {title && <h1 className="text-white font-black text-3xl leading-tight">{title}</h1>}
      {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
      {ctaText && (
        <button className="mt-4 px-6 py-2 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors">
          {ctaText}
        </button>
      )}
    </div>
  )
}

/**
 * Componente: ProfileCard
 * Card com foto de perfil, nome e descrição
 */
export const ProfileCard = ({
  name = 'Nome',
  description = 'Descrição',
  imageUrl = null,
  badge = null,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
      )}
      <div className="text-center">
        <p className="text-white font-bold text-sm">{name}</p>
        <p className="text-white/70 text-xs">{description}</p>
      </div>
      {badge && <div className="mt-2">{badge}</div>}
    </div>
  )
}

/**
 * Componente: AnimatedCounter
 * Contador animado para estatísticas
 */
export const AnimatedCounter = ({
  number = 100,
  suffix = '+',
  label = 'Clientes',
  color = '#10b981',
  className = '',
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl font-black" style={{ color }}>
        {number}
        {suffix}
      </div>
      <p className="text-white/70 text-xs mt-1">{label}</p>
    </div>
  )
}

/**
 * Componente: PriceTag
 * Tag de preço com desconto opcional
 */
export const PriceTag = ({
  price = '0',
  originalPrice = null,
  currency = 'R$',
  discount = null,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {originalPrice && (
        <span className="text-white/50 line-through text-sm">
          {currency} {originalPrice}
        </span>
      )}
      <span className="text-white font-black text-2xl">
        {currency} {price}
      </span>
      {discount && (
        <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
          -{discount}%
        </span>
      )}
    </div>
  )
}

export default {
  GlassmorphismCard,
  GeometricShape,
  GradientText,
  BadgeWithIcon,
  VerificationBadge,
  ServiceIcon,
  RatingStars,
  CallToActionButton,
  DividerLine,
  TextOverlay,
  FeatureList,
  HeroSection,
  ProfileCard,
  AnimatedCounter,
  PriceTag,
}
