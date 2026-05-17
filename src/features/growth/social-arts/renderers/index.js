import FotoStatus from './FotoStatus'
import StoryPromo from './StoryPromo'
import MinimalGlass from './MinimalGlass'
import NeoBrutalism from './NeoBrutalism'
import ServiceGrid from './ServiceGrid'
import ExpertProfile from './ExpertProfile'
import PostAntesDepois from './PostAntesDepois'
import Promocao from './Promocao'
import Depoimento from './Depoimento'
import Dica from './Dica'
import Servicos from './Servicos'
import Urgencia from './Urgencia'

const rendererMap = {
  'foto-status': FotoStatus,
  'story-promo': StoryPromo,
  'minimal-glass': MinimalGlass,
  'neo-brutalism': NeoBrutalism,
  'service-grid': ServiceGrid,
  'expert-profile': ExpertProfile,
  'post-antes-depois': PostAntesDepois,
  'promocao': Promocao,
  'depoimento': Depoimento,
  'dica': Dica,
  'servicos': Servicos,
  'urgencia': Urgencia,
}

export function getRenderer(presetId) {
  return rendererMap[presetId] || null
}

export {
  FotoStatus,
  StoryPromo,
  MinimalGlass,
  NeoBrutalism,
  ServiceGrid,
  ExpertProfile,
  PostAntesDepois,
  Promocao,
  Depoimento,
  Dica,
  Servicos,
  Urgencia,
}
