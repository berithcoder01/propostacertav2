export function calculateStreak(tasks) {
  if (!tasks || tasks.length === 0) return 0
  let streak = 0
  const sorted = [...tasks].sort((a, b) => a.day - b.day)
  for (const task of sorted) {
    if (task.status === 'DONE') {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getCategoryIcon(category) {
  const icons = {
    instagram: 'Camera',
    whatsapp: 'MessageSquare',
    prospeccao: 'Target',
    google: 'Search',
    anuncio: 'Megaphone',
    presenca: 'Globe',
    conteudo: 'Edit',
    networking: 'Handshake'
  }
  return icons[category] || 'Circle'
}

export function getWeekNumber(day) {
  if (day <= 7) return 1
  if (day <= 14) return 2
  if (day <= 21) return 3
  return 4
}

export function getWeekLabel(week) {
  const labels = {
    1: 'Alicerce e Presença Digital',
    2: 'Prova Social e Autoridade',
    3: 'Ativação de Base e Networking',
    4: 'Escala e Anúncios'
  }
  return labels[week] || ''
}
