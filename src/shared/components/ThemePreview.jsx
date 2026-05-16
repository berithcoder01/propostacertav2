import React from 'react';
import { motion } from 'framer-motion';
import { getProposalTheme } from './ProposalThemes';

/**
 * ThemePreview
 * Componente que exibe uma prévia da proposta com o tema selecionado
 */
const ThemePreview = ({
  segment = 'OUTRO',
  themeName = 'professional',
  companyName = 'Sua Empresa',
  clientName = 'Cliente Exemplo',
}) => {
  const theme = getProposalTheme(segment, themeName);

  if (!theme) {
    return <div className="text-muted text-sm">Tema não encontrado</div>;
  }

  const renderSectionTitle = () => {
    const baseStyle = {
      color: theme.primaryColor,
      fontSize: theme.fontSize.sectionTitle,
      fontFamily: theme.fontFamily === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
      fontWeight: 'bold',
      marginBottom: '12px',
      marginTop: '16px',
    };

    if (theme.decorations.sectionSeparator === 'line') {
      return (
        <div style={{ ...baseStyle, borderBottom: `2px solid ${theme.primaryColor}`, paddingBottom: '8px' }}>
          DESCRIÇÃO DOS SERVIÇOS
        </div>
      );
    } else if (theme.decorations.sectionSeparator === 'left-bar') {
      return (
        <div style={{
          ...baseStyle,
          borderLeft: `4px solid ${theme.primaryColor}`,
          paddingLeft: '12px',
        }}>
          DESCRIÇÃO DOS SERVIÇOS
        </div>
      );
    } else if (theme.decorations.sectionSeparator === 'border-decorative') {
      return (
        <div style={{
          ...baseStyle,
          borderTop: `3px dashed ${theme.primaryColor}`,
          borderBottom: `3px dashed ${theme.primaryColor}`,
          paddingTop: '8px',
          paddingBottom: '8px',
        }}>
          DESCRIÇÃO DOS SERVIÇOS
        </div>
      );
    } else {
      return <div style={baseStyle}>DESCRIÇÃO DOS SERVIÇOS</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-2xl overflow-hidden bg-white"
      style={{
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        fontFamily: theme.fontFamily === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
          color: '#ffffff',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: theme.fontSize.title, fontWeight: 'bold', margin: '0 0 8px 0' }}>
          PROPOSTA COMERCIAL
        </h1>
        <p style={{ fontSize: theme.fontSize.small, opacity: 0.9, margin: 0 }}>
          {companyName}
        </p>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '24px', color: theme.textColor }}>
        {/* Seção: Dados da Proposta */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            color: theme.primaryColor,
            fontSize: theme.fontSize.sectionTitle,
            fontWeight: 'bold',
            marginBottom: '12px',
            borderBottom: `2px solid ${theme.primaryColor}`,
            paddingBottom: '8px',
          }}>
            DADOS DA PROPOSTA
          </div>
          <div style={{ fontSize: theme.fontSize.body, lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Cliente:</strong> {clientName}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Contato:</strong> João Silva (Gerente)
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Local:</strong> São Paulo, SP
            </div>
          </div>
        </div>

        {/* Seção: Descrição dos Serviços */}
        <div style={{ marginBottom: '20px' }}>
          {renderSectionTitle()}
          <div style={{
            fontSize: theme.fontSize.body,
            color: theme.mutedColor,
            lineHeight: '1.6',
            marginTop: '12px',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: theme.primaryColor }}>Item 01 — Serviço Principal</strong>
              <p style={{ margin: '4px 0 0 0' }}>Execução de serviços especializados conforme especificações técnicas.</p>
            </div>
            <div>
              <strong style={{ color: theme.primaryColor }}>Item 02 — Materiais</strong>
              <p style={{ margin: '4px 0 0 0' }}>Fornecimento de materiais de alta qualidade.</p>
            </div>
          </div>
        </div>

        {/* Seção: Valor da Proposta */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            color: theme.primaryColor,
            fontSize: theme.fontSize.sectionTitle,
            fontWeight: 'bold',
            marginBottom: '12px',
            borderBottom: `2px solid ${theme.primaryColor}`,
            paddingBottom: '8px',
          }}>
            VALOR DA PROPOSTA
          </div>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '12px',
            fontSize: theme.fontSize.body,
          }}>
            <thead>
              <tr style={{
                background: theme.primaryColor,
                color: '#ffffff',
              }}>
                <th style={{ padding: '8px', textAlign: 'left', borderRight: `1px solid ${theme.borderColor}` }}>ITEM</th>
                <th style={{ padding: '8px', textAlign: 'left', borderRight: `1px solid ${theme.borderColor}` }}>DESCRIÇÃO</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>VALOR</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{
                background: theme.decorations.tableAlternateRows ? '#F5F5F5' : 'transparent',
                borderBottom: `1px solid ${theme.borderColor}`,
              }}>
                <td style={{ padding: '8px', borderRight: `1px solid ${theme.borderColor}` }}>01</td>
                <td style={{ padding: '8px', borderRight: `1px solid ${theme.borderColor}` }}>Serviço Principal</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ 5.000,00</td>
              </tr>
              <tr style={{
                background: theme.decorations.tableAlternateRows ? 'transparent' : '#F5F5F5',
                borderBottom: `1px solid ${theme.borderColor}`,
              }}>
                <td style={{ padding: '8px', borderRight: `1px solid ${theme.borderColor}` }}>02</td>
                <td style={{ padding: '8px', borderRight: `1px solid ${theme.borderColor}` }}>Materiais</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ 2.500,00</td>
              </tr>
              <tr style={{
                background: theme.primaryColor,
                color: '#ffffff',
              }}>
                <td colSpan="2" style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>TOTAL:</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ 7.500,00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rodapé */}
        <div style={{
          borderTop: `1px solid ${theme.borderColor}`,
          paddingTop: '16px',
          marginTop: '20px',
          fontSize: theme.fontSize.small,
          color: theme.mutedColor,
          textAlign: 'center',
        }}>
          <p style={{ margin: 0 }}>Proposta válida por 60 dias</p>
          <p style={{ margin: '4px 0 0 0' }}>Gerada por {companyName}</p>
        </div>
      </div>

      {/* Indicador de Tema */}
      <div style={{
        background: theme.primaryColor,
        color: '#ffffff',
        padding: '8px 16px',
        fontSize: '10px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}>
        Tema: {theme.name} | Segmento: {segment}
      </div>
    </motion.div>
  );
};

export default ThemePreview;
