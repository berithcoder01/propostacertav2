/**
 * ProposalThemes.js
 * Define temas visuais para propostas por segmento de negócio
 * Cada tema inclui: cores, tipografia, elementos decorativos, espaçamento
 */

export const PROPOSAL_THEMES = {
  ELETRICA: {
    professional: {
      name: 'Professional',
      description: 'Linhas retas, fontes sans-serif, destaque em amarelo/laranja',
      primaryColor: '#1A5276',
      accentColor: '#FF6B00',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'line', // 'line' | 'none'
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    elegant: {
      name: 'Elegant',
      description: 'Bordas decorativas, gradientes sutis, tipografia refinada',
      primaryColor: '#1A5276',
      accentColor: '#FF6B00',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'serif',
      fontSize: {
        title: '26pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'border',
        sectionIcon: true,
        headerBorder: 'bottom-gradient',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '25px',
        itemGap: '15px',
        padding: '30mm',
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Sem decorações, apenas estrutura e conteúdo',
      primaryColor: '#1A5276',
      accentColor: '#FF6B00',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#EEEEEE',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '22pt',
        sectionTitle: '12pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'none',
        sectionIcon: false,
        headerBorder: 'none',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '15px',
        itemGap: '10px',
        padding: '20mm',
      },
    },
  },

  CONSTRUCAO_CIVIL: {
    bold: {
      name: 'Bold',
      description: 'Formas robustas, tipografia forte, elementos estruturais',
      primaryColor: '#FF6B00',
      accentColor: '#333333',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '28pt',
        sectionTitle: '16pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'left-bar',
        sectionIcon: true,
        headerBorder: 'left-thick',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '22px',
        itemGap: '14px',
        padding: '25mm',
      },
    },
    professional: {
      name: 'Professional',
      description: 'Estruturado, elementos geométricos, cores neutras',
      primaryColor: '#333333',
      accentColor: '#FF6B00',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'line',
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Simples, funcional, adaptável',
      primaryColor: '#333333',
      accentColor: '#FF6B00',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#EEEEEE',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '22pt',
        sectionTitle: '12pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'none',
        sectionIcon: false,
        headerBorder: 'none',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '15px',
        itemGap: '10px',
        padding: '20mm',
      },
    },
  },

  HIDRAULICA: {
    modern: {
      name: 'Modern',
      description: 'Fluxo visual, elementos fluidos, ícones de água',
      primaryColor: '#0891B2',
      accentColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'wave',
        sectionIcon: true,
        headerBorder: 'bottom-wave',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    professional: {
      name: 'Professional',
      description: 'Estruturado, elementos geométricos, cores neutras',
      primaryColor: '#0891B2',
      accentColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'line',
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Simples, funcional, adaptável',
      primaryColor: '#0891B2',
      accentColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#EEEEEE',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '22pt',
        sectionTitle: '12pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'none',
        sectionIcon: false,
        headerBorder: 'none',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '15px',
        itemGap: '10px',
        padding: '20mm',
      },
    },
  },

  PINTURA: {
    elegant: {
      name: 'Elegant',
      description: 'Cores vibrantes, tipografia refinada, elementos decorativos',
      primaryColor: '#E87722',
      accentColor: '#EC4899',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'serif',
      fontSize: {
        title: '26pt',
        sectionTitle: '15pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'border-decorative',
        sectionIcon: true,
        headerBorder: 'bottom-gradient',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '25px',
        itemGap: '15px',
        padding: '30mm',
      },
    },
    modern: {
      name: 'Modern',
      description: 'Cores vibrantes, tipografia contemporânea, acentos geométricos',
      primaryColor: '#E87722',
      accentColor: '#EC4899',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'circle-accent',
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Simples, funcional, adaptável',
      primaryColor: '#E87722',
      accentColor: '#EC4899',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#EEEEEE',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '22pt',
        sectionTitle: '12pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'none',
        sectionIcon: false,
        headerBorder: 'none',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '15px',
        itemGap: '10px',
        padding: '20mm',
      },
    },
  },

  AR_CONDICIONADO: {
    modern: {
      name: 'Modern',
      description: 'Minimalista, elementos de frio/ar, tipografia limpa',
      primaryColor: '#06B6D4',
      accentColor: '#0891B2',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'line',
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    professional: {
      name: 'Professional',
      description: 'Estruturado, elementos geométricos, cores neutras',
      primaryColor: '#06B6D4',
      accentColor: '#0891B2',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'line',
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Simples, funcional, adaptável',
      primaryColor: '#06B6D4',
      accentColor: '#0891B2',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#EEEEEE',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '22pt',
        sectionTitle: '12pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'none',
        sectionIcon: false,
        headerBorder: 'none',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '15px',
        itemGap: '10px',
        padding: '20mm',
      },
    },
  },



  OUTRO: {
    minimal: {
      name: 'Minimal',
      description: 'Simples, funcional, adaptável',
      primaryColor: '#1A5276',
      accentColor: '#E87722',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#EEEEEE',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '22pt',
        sectionTitle: '12pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'none',
        sectionIcon: false,
        headerBorder: 'none',
        tableAlternateRows: false,
      },
      spacing: {
        sectionGap: '15px',
        itemGap: '10px',
        padding: '20mm',
      },
    },
    professional: {
      name: 'Professional',
      description: 'Estruturado, elementos geométricos, cores neutras',
      primaryColor: '#1A5276',
      accentColor: '#E87722',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      mutedColor: '#666666',
      borderColor: '#CCCCCC',
      fontFamily: 'sans-serif',
      fontSize: {
        title: '24pt',
        sectionTitle: '14pt',
        body: '10pt',
        small: '8pt',
      },
      decorations: {
        sectionSeparator: 'line',
        sectionIcon: true,
        headerBorder: 'bottom',
        tableAlternateRows: true,
      },
      spacing: {
        sectionGap: '20px',
        itemGap: '12px',
        padding: '25mm',
      },
    },
  },
};

/**
 * Função auxiliar para obter tema de proposta
 * @param {string} segment - Segmento de negócio (ex: 'ELETRICA')
 * @param {string} themeName - Nome do tema (ex: 'professional')
 * @returns {object} Configuração de tema
 */
export function getProposalTheme(segment, themeName = 'professional') {
  const segmentThemes = PROPOSAL_THEMES[segment] || PROPOSAL_THEMES.OUTRO;
  return segmentThemes[themeName] || segmentThemes[Object.keys(segmentThemes)[0]];
}

/**
 * Função auxiliar para obter todos os temas de um segmento
 * @param {string} segment - Segmento de negócio
 * @returns {array} Lista de temas disponíveis
 */
export function getSegmentThemes(segment) {
  const segmentThemes = PROPOSAL_THEMES[segment] || PROPOSAL_THEMES.OUTRO;
  return Object.entries(segmentThemes).map(([key, theme]) => ({
    id: key,
    name: theme.name,
    description: theme.description,
  }));
}

export default PROPOSAL_THEMES;
