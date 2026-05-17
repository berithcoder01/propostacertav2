export const dailyTips = [
  { tip: 'Perfis com pelo menos 9 posts recebem 3x mais contatos. Comece hoje!', icon: 'Camera' },
  { tip: '88% das pessoas confiam em avaliações online tanto quanto em recomendações pessoais.', icon: 'Star' },
  { tip: 'Fotos de "antes e depois" geram 40% mais engajamento para prestadores de serviços.', icon: 'Image' },
  { tip: 'Empresas com perfil completo no Google recebem 7x mais cliques.', icon: 'Search' },
  { tip: 'Vídeos curtos (15-30s) têm 3x mais alcance que fotos estáticas.', icon: 'Video' },
  { tip: 'Postar nos horários de pico (12h-14h e 19h-21h) aumenta o alcance em 50%.', icon: 'Clock' },
  { tip: 'Responder mensagens em até 5 minutos aumenta a conversão em 400%.', icon: 'MessageSquare' },
  { tip: 'Clientes que recebem follow-up após o serviço indicam 3x mais.', icon: 'Phone' },
  { tip: 'Usar hashtags locais (#suaCidade + serviço) traz clientes da região.', icon: 'Hash' },
  { tip: 'WhatsApp Business com catálogo gera 25% mais vendas diretas.', icon: 'ShoppingBag' },
  { tip: 'Pedir avaliação no Google após cada serviço constrói autoridade.', icon: 'ThumbsUp' },
  { tip: 'Um simples "obrigado" pós-serviço fideliza mais que desconto.', icon: 'Heart' },
  { tip: 'Stories com enquetes geram 2x mais interação que posts normais.', icon: 'BarChart' },
  { tip: 'Ter um portfólio visual aumenta o valor percebido do seu serviço.', icon: 'Folder' },
  { tip: 'Anúncios de R$10/dia podem trazer 5-10 leads por semana na sua cidade.', icon: 'Megaphone' },
]

export function getDailyTip() {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  return dailyTips[dayOfYear % dailyTips.length]
}
