import { Camera } from 'lucide-react'

export default function PhotoBackground({ uploadedPhoto, fallbackIcon: Icon = Camera, fallbackText = 'Sua foto aqui', overlay = 'bg-gradient-to-t from-black/90 via-black/30 to-transparent' }) {
  return (
    <>
      {uploadedPhoto ? (
        <img src={uploadedPhoto} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
          <Icon className="w-12 h-12 mb-2" />
          <span className="text-xs">{fallbackText}</span>
        </div>
      )}
      {uploadedPhoto && <div className={`absolute inset-0 ${overlay}`} />}
    </>
  )
}
