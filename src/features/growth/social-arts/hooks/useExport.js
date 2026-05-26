import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'

/**
 * Hook para exportar o canvas do editor como PNG.
 * Usa html2canvas com configurações otimizadas para capturar
 * gradientes, fontes e elementos CSS corretamente.
 */
export function useExport() {
  const [generating, setGenerating] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState(null)

  const handleDownload = useCallback(async (previewRef, preset) => {
    if (!previewRef.current) {
      console.warn('[useExport] canvasRef.current is null')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const element = previewRef.current

      // Aguarda um frame para garantir que o layout esteja estável
      await new Promise(resolve => requestAnimationFrame(resolve))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        // Garante que elementos com overflow hidden sejam capturados
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc, clonedEl) => {
          // Força todos os estilos inline para a snapshot
          clonedEl.style.transform = 'none'
          clonedEl.style.overflow = 'visible'
        },
      })

      const fileName = `arte-${preset?.id || 'social'}-${Date.now()}.png`
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png', 1.0)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (err) {
      console.error('[useExport] Erro ao gerar imagem:', err)
      setError('Não foi possível gerar a imagem. Tente novamente.')
      setTimeout(() => setError(null), 4000)
    } finally {
      setGenerating(false)
    }
  }, [])

  return { generating, downloaded, error, handleDownload }
}
