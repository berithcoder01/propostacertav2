import { useState } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { useEditor } from '../context/EditorContext'

function PhotoUpload({ photo, onSet, onRemove, label, optional }) {
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => onSet(event.target?.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      {photo ? (
        <div className="relative rounded-lg overflow-hidden border border-emerald-500/50">
          <img src={photo} alt={label} className="w-full h-20 object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 border border-dashed border-editor-input-border rounded-lg p-3 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
          <Upload size={14} className="text-text-muted" />
          <span className="text-xs text-text-muted">Upload</span>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      )}
    </div>
  )
}

export default function PhotoPanel() {
  const { state, actions } = useEditor()
  const { photo, photoAlt, preset } = state
  const isBeforeAfter = preset?.id === 'post-antes-depois'
  const isOptional = preset?.requiresPhoto === 'optional'

  if (isBeforeAfter) {
    return (
      <div className="space-y-3">
        <PhotoUpload
          photo={photoAlt}
          onSet={actions.setPhotoAlt}
          onRemove={() => actions.setPhotoAlt(null)}
          label="Foto do Antes"
        />
        <PhotoUpload
          photo={photo}
          onSet={actions.setPhoto}
          onRemove={() => actions.setPhoto(null)}
          label="Foto do Depois"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {isOptional && !photo && (
        <p className="text-[10px] text-text-secondary opacity-50 mb-2">
          Opcional — adicione uma foto para substituir o fundo colorido
        </p>
      )}
      <PhotoUpload
        photo={photo}
        onSet={actions.setPhoto}
        onRemove={() => actions.setPhoto(null)}
        label="Foto"
      />
    </div>
  )
}
