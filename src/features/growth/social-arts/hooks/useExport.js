import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'

export function useExport() {
  const [generating, setGenerating] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = useCallback(async (previewRef, preset) => {
    if (!previewRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${preset.id}-${Date.now()}.png`
      link.click()
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
    } finally {
      setGenerating(false)
    }
  }, [])

  return { generating, downloaded, handleDownload }
}
