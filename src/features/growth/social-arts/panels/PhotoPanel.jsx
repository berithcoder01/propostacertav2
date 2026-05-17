import { useState } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { useEditor } from '../context/EditorContext'

export default function PhotoPanel() {
  const { state, actions } = useEditor()
  const { photo } = state

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => actions.setPhoto(event.target?.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-2">
      {photo ? (
        <div className="relative rounded-lg overflow-hidden border border-emerald-500/50">
          <img src={photo} alt="Preview" className="w-full h-20 object-cover" />
          <button
            onClick={() => actions.setPhoto(null)}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all">
          <Upload size={14} className="text-text-muted" />
          <span className="text-xs text-text-muted">Upload</span>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      )}
    </div>
  )
}
