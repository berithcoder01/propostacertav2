import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Crosshair, Navigation, Filter, X } from 'lucide-react';

const LeadMap = ({ leads, onLeadSelect, selectedLeadId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    segment: 'ALL',
    status: 'ALL'
  });

  // Filtra leads com base nos filtros selecionados
  const filteredLeads = useCallback(() => {
    return leads.filter(lead => {
      if (!lead.lat || !lead.lng) return false;
      if (filters.segment !== 'ALL' && lead.segment !== filters.segment) return false;
      if (filters.status !== 'ALL' && lead.status !== filters.status) return false;
      return true;
    });
  }, [leads, filters]);

  // Estado do mapa (coordenadas do centro) a partir de leads filtrados
  const getCenter = useCallback(() => {
    const fl = filteredLeads();
    if (fl.length === 0) return { lat: -23.5505, lng: -46.6333 }; // São Paulo como default
    const lat = fl.reduce((s, l) => s + (l.lat || 0), 0) / fl.length;
    const lng = fl.reduce((s, l) => s + (l.lng || 0), 0) / fl.length;
    return { lat, lng };
  }, [filteredLeads]);

  // Inicializa o mapa Google Maps
  const initMap = useCallback(() => {
    if (mapInstanceRef.current) return;
    if (!window.google || !window.google.maps) {
      setMapError(true);
      return;
    }

    const center = getCenter();
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;
    setMapLoaded(true);

    // Adiciona marcadores
    updateMarkers(map);

    // Evento de clique no mapa
    map.addListener('click', () => {
      if (onLeadSelect) onLeadSelect(null);
    });
  }, [getCenter]);

  // Atualiza marcadores no mapa
  const updateMarkers = useCallback((map) => {
    // Remove marcadores antigos
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const map_ = map || mapInstanceRef.current;
    if (!map_) return;

    const fl = filteredLeads();
    const bounds = new window.google.maps.LatLngBounds();

    fl.forEach(lead => {
      if (!lead.lat || !lead.lng) return;

      const pos = { lat: lead.lat, lng: lead.lng };
      const color = lead.status === 'CONVERTED' ? '#22c55e'
        : lead.status === 'CONTACTED' ? '#eab308'
        : lead.status === 'NEGOTIATING' ? '#f97316'
        : lead.status === 'DISCARDED' ? '#ef4444'
        : '#3b82f6';

      const marker = new window.google.maps.Marker({
        position: pos,
        map: map_,
        title: lead.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 8
        },
        zIndex: lead.id === selectedLeadId ? 100 : 1
      });

      marker.addListener('click', () => {
        if (onLeadSelect) onLeadSelect(lead);
        // Centraliza no marcador
        map_.panTo(pos);
        if (map_.getZoom() < 14) map_.setZoom(14);
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: -apple-system, sans-serif; padding: 8px;">
            <strong style="font-size: 14px;">${lead.name}</strong><br/>
            <span style="color: #666; font-size: 12px;">${[lead.city, lead.state].filter(Boolean).join(' - ')}</span><br/>
            <span style="color: #888; font-size: 11px;">${lead.status} · ${lead.segment}</span>
          </div>
        `
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(map_, marker);
      });
      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
      bounds.extend(pos);
    });

    // Ajusta zoom para mostrar todos os marcadores
    if (fl.length > 1) {
      map_.fitBounds(bounds, { padding: 50 });
    } else if (fl.length === 1) {
      map_.panTo(fl[0]);
      map_.setZoom(14);
    }
  }, [filteredLeads, onLeadSelect, selectedLeadId]);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [mapLoaded, updateMarkers]);

  // Carrega Google Maps script dinamicamente
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDz9d_57IbPDLJBSV_12FHsH1Q4esnUJIc';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initLeadMap`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      initMap();
    };

    script.onerror = () => {
      setMapError(true);
    };

    // @ts-ignore
    window.initLeadMap = initMap;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Busca endereço no mapa
  const handleSearch = () => {
    if (!mapInstanceRef.current || !searchQuery.trim()) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        mapInstanceRef.current.panTo(results[0].geometry.location);
        mapInstanceRef.current.setZoom(14);
      }
    });
  };

  return (
    <motion.div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold font-display text-white">Mapa de Leads</h3>
          <p className="text-[10px] text-muted">Visualize a localização dos seus leads</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar endereço..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="bg-bg border border-border rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-white outline-none focus:border-accent w-48"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-surface text-muted hover:text-accent border border-border transition-colors"
            title="Filtros"
          >
            <Filter size={14} />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                const center = getCenter();
                mapInstanceRef.current.panTo(center);
                mapInstanceRef.current.setZoom(12);
              }
            }}
            className="p-2 rounded-lg bg-surface text-muted hover:text-accent border border-border transition-colors"
            title="Centralizar"
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border border-border rounded-xl p-3 flex flex-wrap gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted font-bold">Segmento:</span>
              <select
                value={filters.segment}
                onChange={e => setFilters(prev => ({ ...prev, segment: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-2 py-1 text-[10px] text-white outline-none"
              >
                <option value="ALL">Todos</option>
                <option value="RESIDENCIAL">Residencial</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="CONDOMINIO">Condomínio</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted font-bold">Status:</span>
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="bg-bg border border-border rounded-lg px-2 py-1 text-[10px] text-white outline-none"
              >
                <option value="ALL">Todos</option>
                <option value="NEW">Novo</option>
                <option value="CONTACTED">Contatado</option>
                <option value="NEGOTIATING">Em Negociação</option>
                <option value="CONVERTED">Convertido</option>
                <option value="DISCARDED">Descartado</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa */}
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-border bg-bg"
        style={{ minHeight: '400px' }}
      >
        {mapError && (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <MapPin size={48} className="opacity-30 mb-3" />
            <p className="text-sm font-bold">Mapa indisponível</p>
            <p className="text-[10px] mt-1">
              Configure a chave da API do Google Maps em VITE_GOOGLE_MAPS_API_KEY
            </p>
            <p className="text-[10px] mt-1">
              Ou visualize o <span className="text-accent font-bold cursor-pointer" onClick={() => document.getElementById('heatmap-section')?.scrollIntoView({ behavior: 'smooth' })}>mapa de calor</span> como alternativa
            </p>
          </div>
        )}
        {!mapLoaded && !mapError && (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { color: '#3b82f6', label: 'Novo' },
          { color: '#eab308', label: 'Contatado' },
          { color: '#f97316', label: 'Negociação' },
          { color: '#22c55e', label: 'Convertido' },
          { color: '#ef4444', label: 'Descartado' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
            <span className="text-[9px] text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LeadMap;