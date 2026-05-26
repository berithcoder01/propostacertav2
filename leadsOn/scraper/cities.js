/**
 * Base de Cidades para Prospecção
 * - CIDADES_PROXIMAS: mapeamento cidade -> cidades vizinhas (raio ~50-100km)
 * - CIDADES_NACIONAIS: principais cidades para busca nacional
 */

export const CIDADES_PROXIMAS = {
  'Maringá': [
    { nome: 'Maringá', estado: 'PR' },
    { nome: 'Sarandi', estado: 'PR' },
    { nome: 'Paiçandu', estado: 'PR' },
    { nome: 'Londrina', estado: 'PR' },
    { nome: 'Apucarana', estado: 'PR' },
    { nome: 'Campo Mourão', estado: 'PR' },
  ],
  'Londrina': [
    { nome: 'Londrina', estado: 'PR' },
    { nome: 'Cambé', estado: 'PR' },
    { nome: 'Rolândia', estado: 'PR' },
    { nome: 'Ibiporã', estado: 'PR' },
    { nome: 'Apucarana', estado: 'PR' },
    { nome: 'Maringá', estado: 'PR' },
  ],
  'Curitiba': [
    { nome: 'Curitiba', estado: 'PR' },
    { nome: 'São José dos Pinhais', estado: 'PR' },
    { nome: 'Colombo', estado: 'PR' },
    { nome: 'Pinhais', estado: 'PR' },
    { nome: 'Araucária', estado: 'PR' },
    { nome: 'Fazenda Rio Grande', estado: 'PR' },
  ],
  'São Paulo': [
    { nome: 'São Paulo', estado: 'SP' },
    { nome: 'Guarulhos', estado: 'SP' },
    { nome: 'Osasco', estado: 'SP' },
    { nome: 'Santo André', estado: 'SP' },
    { nome: 'São Bernardo do Campo', estado: 'SP' },
    { nome: 'Barueri', estado: 'SP' },
  ],
  'Rio de Janeiro': [
    { nome: 'Rio de Janeiro', estado: 'RJ' },
    { nome: 'Niterói', estado: 'RJ' },
    { nome: 'São Gonçalo', estado: 'RJ' },
    { nome: 'Duque de Caxias', estado: 'RJ' },
    { nome: 'Nova Iguaçu', estado: 'RJ' },
    { nome: 'Petrópolis', estado: 'RJ' },
  ],
  'Belo Horizonte': [
    { nome: 'Belo Horizonte', estado: 'MG' },
    { nome: 'Contagem', estado: 'MG' },
    { nome: 'Betim', estado: 'MG' },
    { nome: 'Santa Luzia', estado: 'MG' },
    { nome: 'Ribeirão das Neves', estado: 'MG' },
    { nome: 'Ibirité', estado: 'MG' },
  ],
  'Goiânia': [
    { nome: 'Goiânia', estado: 'GO' },
    { nome: 'Aparecida de Goiânia', estado: 'GO' },
    { nome: 'Trindade', estado: 'GO' },
    { nome: 'Senador Canedo', estado: 'GO' },
    { nome: 'Anápolis', estado: 'GO' },
  ],
  'Brasília': [
    { nome: 'Brasília', estado: 'DF' },
    { nome: 'Taguatinga', estado: 'DF' },
    { nome: 'Ceilândia', estado: 'DF' },
    { nome: 'Samambaia', estado: 'DF' },
    { nome: 'Águas Claras', estado: 'DF' },
    { nome: 'Luziânia', estado: 'GO' },
  ],
  'Salvador': [
    { nome: 'Salvador', estado: 'BA' },
    { nome: 'Lauro de Freitas', estado: 'BA' },
    { nome: 'Camaçari', estado: 'BA' },
    { nome: 'Simões Filho', estado: 'BA' },
    { nome: 'Candeias', estado: 'BA' },
  ],
  'Fortaleza': [
    { nome: 'Fortaleza', estado: 'CE' },
    { nome: 'Caucaia', estado: 'CE' },
    { nome: 'Maracanaú', estado: 'CE' },
    { nome: 'Aquiraz', estado: 'CE' },
    { nome: 'Eusébio', estado: 'CE' },
  ],
  'Recife': [
    { nome: 'Recife', estado: 'PE' },
    { nome: 'Jaboatão dos Guararapes', estado: 'PE' },
    { nome: 'Olinda', estado: 'PE' },
    { nome: 'Paulista', estado: 'PE' },
    { nome: 'Camaragibe', estado: 'PE' },
  ],
  'Porto Alegre': [
    { nome: 'Porto Alegre', estado: 'RS' },
    { nome: 'Canoas', estado: 'RS' },
    { nome: 'Gravataí', estado: 'RS' },
    { nome: 'Viamão', estado: 'RS' },
    { nome: 'Novo Hamburgo', estado: 'RS' },
    { nome: 'São Leopoldo', estado: 'RS' },
  ],
  'Florianópolis': [
    { nome: 'Florianópolis', estado: 'SC' },
    { nome: 'São José', estado: 'SC' },
    { nome: 'Palhoça', estado: 'SC' },
    { nome: 'Biguaçu', estado: 'SC' },
    { nome: 'São Pedro de Alcântara', estado: 'SC' },
  ],
  'Campinas': [
    { nome: 'Campinas', estado: 'SP' },
    { nome: 'Sumaré', estado: 'SP' },
    { nome: 'Hortolândia', estado: 'SP' },
    { nome: 'Indaiatuba', estado: 'SP' },
    { nome: 'Paulínia', estado: 'SP' },
    { nome: 'Valinhos', estado: 'SP' },
  ],
  'Ribeirão Preto': [
    { nome: 'Ribeirão Preto', estado: 'SP' },
    { nome: 'Sertãozinho', estado: 'SP' },
    { nome: 'Jaboticabal', estado: 'SP' },
    { nome: 'Cravinhos', estado: 'SP' },
    { nome: 'Brodowski', estado: 'SP' },
  ],
  'Cuiabá': [
    { nome: 'Cuiabá', estado: 'MT' },
    { nome: 'Várzea Grande', estado: 'MT' },
    { nome: 'Nobres', estado: 'MT' },
    { nome: 'Santo Antônio de Leverger', estado: 'MT' },
  ],
  'Manaus': [
    { nome: 'Manaus', estado: 'AM' },
    { nome: 'Iranduba', estado: 'AM' },
    { nome: 'Presidente Figueiredo', estado: 'AM' },
    { nome: 'Itacoatiara', estado: 'AM' },
  ],
  'Belém': [
    { nome: 'Belém', estado: 'PA' },
    { nome: 'Ananindeua', estado: 'PA' },
    { nome: 'Marituba', estado: 'PA' },
    { nome: 'Castanhal', estado: 'PA' },
  ],
  'Vitória': [
    { nome: 'Vitória', estado: 'ES' },
    { nome: 'Vila Velha', estado: 'ES' },
    { nome: 'Serra', estado: 'ES' },
    { nome: 'Cariacica', estado: 'ES' },
    { nome: 'Guarapari', estado: 'ES' },
  ],
  'Natal': [
    { nome: 'Natal', estado: 'RN' },
    { nome: 'Parnamirim', estado: 'RN' },
    { nome: 'Mossoró', estado: 'RN' },
    { nome: 'São Gonçalo do Amarante', estado: 'RN' },
  ],
  'João Pessoa': [
    { nome: 'João Pessoa', estado: 'PB' },
    { nome: 'Cabedelo', estado: 'PB' },
    { nome: 'Bayeux', estado: 'PB' },
    { nome: 'Santa Rita', estado: 'PB' },
  ],
  'Maceió': [
    { nome: 'Maceió', estado: 'AL' },
    { nome: 'Rio Largo', estado: 'AL' },
    { nome: 'Marechal Deodoro', estado: 'AL' },
    { nome: 'Satuba', estado: 'AL' },
  ],
  'Aracaju': [
    { nome: 'Aracaju', estado: 'SE' },
    { nome: 'Nossa Senhora do Socorro', estado: 'SE' },
    { nome: 'Barra dos Coqueiros', estado: 'SE' },
    { nome: 'Lagarto', estado: 'SE' },
  ],
  'Teresina': [
    { nome: 'Teresina', estado: 'PI' },
    { nome: 'Altos', estado: 'PI' },
    { nome: 'Demerval Lobão', estado: 'PI' },
    { nome: 'José de Freitas', estado: 'PI' },
  ],
  'São Luís': [
    { nome: 'São Luís', estado: 'MA' },
    { nome: 'São José de Ribamar', estado: 'MA' },
    { nome: 'Paço do Lumiar', estado: 'MA' },
    { nome: 'Raposa', estado: 'MA' },
  ],
  'Campo Grande': [
    { nome: 'Campo Grande', estado: 'MS' },
    { nome: 'Dourados', estado: 'MS' },
    { nome: 'Três Lagoas', estado: 'MS' },
    { nome: 'Corumbá', estado: 'MS' },
  ],
  'Palmas': [
    { nome: 'Palmas', estado: 'TO' },
    { nome: 'Paraíso do Tocantins', estado: 'TO' },
    { nome: 'Araguaína', estado: 'TO' },
  ],
  'Porto Velho': [
    { nome: 'Porto Velho', estado: 'RO' },
    { nome: 'Ji-Paraná', estado: 'RO' },
    { nome: 'Ariquemes', estado: 'RO' },
  ],
  'Boa Vista': [
    { nome: 'Boa Vista', estado: 'RR' },
    { nome: 'Cantá', estado: 'RR' },
    { nome: 'Mucajaí', estado: 'RR' },
  ],
  'Macapá': [
    { nome: 'Macapá', estado: 'AP' },
    { nome: 'Santana', estado: 'AP' },
    { nome: 'Laranjal do Jari', estado: 'AP' },
  ],
  'Rio Branco': [
    { nome: 'Rio Branco', estado: 'AC' },
    { nome: 'Senador Guiomard', estado: 'AC' },
    { nome: 'Plácido de Castro', estado: 'AC' },
  ],
}

export const CIDADES_NACIONAIS = [
  { nome: 'São Paulo', estado: 'SP' },
  { nome: 'Rio de Janeiro', estado: 'RJ' },
  { nome: 'Brasília', estado: 'DF' },
  { nome: 'Salvador', estado: 'BA' },
  { nome: 'Fortaleza', estado: 'CE' },
  { nome: 'Belo Horizonte', estado: 'MG' },
  { nome: 'Manaus', estado: 'AM' },
  { nome: 'Curitiba', estado: 'PR' },
  { nome: 'Recife', estado: 'PE' },
  { nome: 'Porto Alegre', estado: 'RS' },
  { nome: 'Belém', estado: 'PA' },
  { nome: 'Goiânia', estado: 'GO' },
  { nome: 'Campinas', estado: 'SP' },
  { nome: 'Florianópolis', estado: 'SC' },
  { nome: 'Vitória', estado: 'ES' },
  { nome: 'Natal', estado: 'RN' },
  { nome: 'Maceió', estado: 'AL' },
  { nome: 'João Pessoa', estado: 'PB' },
  { nome: 'Aracaju', estado: 'SE' },
  { nome: 'Teresina', estado: 'PI' },
  { nome: 'São Luís', estado: 'MA' },
  { nome: 'Campo Grande', estado: 'MS' },
  { nome: 'Cuiabá', estado: 'MT' },
  { nome: 'Palmas', estado: 'TO' },
  { nome: 'Porto Velho', estado: 'RO' },
  { nome: 'Boa Vista', estado: 'RR' },
  { nome: 'Macapá', estado: 'AP' },
  { nome: 'Rio Branco', estado: 'AC' },
]

export function getCidadesAlvo(businessScope, baseCity, baseState) {
  if (businessScope === 'NACIONAL') {
    return CIDADES_NACIONAIS
  }
  
  const cidadeBase = baseCity || 'Maringá'
  const estadoBase = baseState || 'PR'
  
  const proximas = CIDADES_PROXIMAS[cidadeBase]
  if (proximas) {
    return proximas
  }
  
  return [{ nome: cidadeBase, estado: estadoBase }]
}
