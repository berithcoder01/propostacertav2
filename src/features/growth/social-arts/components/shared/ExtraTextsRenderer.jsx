import React from 'react'

/**
 * Componente compartilhado para renderizar os blocos de texto extra adicionados pelo usuário.
 * Aplica tamanho de fonte, cor, alinhamento e peso (bold) definidos dinamicamente.
 */
export default function ExtraTextsRenderer({ extraTexts = [], className = '' }) {
  if (!extraTexts || extraTexts.length === 0) return null

  return (
    <div className={`w-full flex flex-col gap-2 mt-2 ${className}`}>
      {extraTexts.map((item) => {
        if (!item.text || item.text.trim() === '') return null

        const style = {
          fontSize: `${item.fontSize || 14}px`,
          color: item.color || '#ffffff',
          textAlign: item.align || 'center',
          fontWeight: item.bold ? '900' : 'normal',
          wordBreak: 'break-word',
          lineHeight: '1.25',
        }

        return (
          <p key={item.id} style={style} className="transition-all duration-200">
            {item.text}
          </p>
        )
      })}
    </div>
  )
}
