import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, Check, AlertCircle } from 'lucide-react';
import { fmt } from '../constants';

const QrCodePix = ({ pixKey, amount, description = '', onCopy, onDownload }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  // Gera o payload EMV do PIX
  const generatePixPayload = (key, value, desc) => {
    const pad = (str, len) => String(str).padStart(len, String(str).length);

    const chunks = [];

    // "000201" — Payload Format Indicator
    chunks.push('000201');

    // "26" + tamanho — Merchant Account Info
    const merchantAcc = [];
    // "0014br.gov.bcb.pix" — Chave do Pix
    merchantAcc.push('0014br.gov.bcb.pix');
    // "01" + tamanho da chave + chave
    merchantAcc.push(`01${pad(key.length, 2)}${key}`);

    const merchantAccStr = merchantAcc.join('');
    chunks.push(`26${pad(merchantAccStr.length, 2)}${merchantAccStr}`);

    // "52040000" — Merchant Category Code (0000 = Outros)
    chunks.push('52040000');

    // "5303986" — Transaction Currency (986 = BRL)
    chunks.push('5303986');

    // "54" + tamanho + valor
    if (value > 0) {
      const valStr = value.toFixed(2).replace('.', '');
      chunks.push(`54${pad(valStr.length, 2)}${valStr}`);
    }

    // "5802BR" — Country Code
    chunks.push('5802BR');

    // "59" + tamanho + nome do beneficiário
    const merchantName = desc || 'Proposta Comercial';
    chunks.push(`59${pad(merchantName.length, 2)}${merchantName}`);

    // "60" + tamanho + cidade
    chunks.push('6008Brasilia');

    // "62" + tamanho + campo "0503***"
    chunks.push('62070503***');

    // "6304" + CRC16
    const payloadWithoutCrc = chunks.join('');
    const crc = calculateCRC16(payloadWithoutCrc);
    return `${payloadWithoutCrc}6304${crc}`;
  };

  // CRC-16/CCITT-FALSE
  const calculateCRC16 = (str) => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  useEffect(() => {
    if (!pixKey) {
      setError('Chave PIX não configurada');
      return;
    }

    try {
      setError(null);
      const payload = generatePixPayload(pixKey, amount || 0, description);

      QRCode.toDataURL(payload, {
        width: 200,
        margin: 0,
        color: { dark: '#000000', light: '#ffffff' }
      }, (err, url) => {
        if (err) {
          setError('Erro ao gerar QR Code');
          console.error(err);
        } else {
          setQrDataUrl(url);
        }
      });
    } catch (err) {
      setError('Erro ao gerar payload PIX');
      console.error(err);
    }
  }, [pixKey, amount, description]);

  const handleCopyPayload = async () => {
    if (!pixKey) return;
    const payload = generatePixPayload(pixKey, amount || 0, description);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy(payload);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current || !qrDataUrl) return;
    try {
      const link = document.createElement('a');
      link.download = `pix-qrcode-${Date.now()}.png`;
      link.href = qrDataUrl;
      link.click();
      if (onDownload) onDownload();
    } catch (err) {
      console.error('Erro ao baixar:', err);
    }
  };

  if (error) {
    return (
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {qrDataUrl ? (
        <>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <img
            src={qrDataUrl}
            alt="QR Code PIX"
            className="w-36 h-36 border-2 border-border rounded-xl"
            crossOrigin="anonymous"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCopyPayload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-[10px] font-bold text-muted hover:text-white hover:border-accent transition-colors"
            >
              {copied ? <><Check size={12} className="text-success" /> Copiado!</> : <><Copy size={12} /> Copiar PIX</>}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-[10px] font-bold text-muted hover:text-white hover:border-accent transition-colors"
            >
              <Download size={12} /> Baixar
            </button>
          </div>
        </>
      ) : (
        <div className="w-36 h-36 bg-bg rounded-xl flex items-center justify-center border border-border">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default QrCodePix;