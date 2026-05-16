import React, { useEffect, useState } from 'react';
import { ArrowRight, Building2, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../../shared/Input';
import Button from '../../../shared/Button';
import { fetchClients, createClient } from '../../../shared/services/api';
import QuickClientModal from '../../../shared/components/modals/QuickClientModal';

const StepCliente = ({ data, onChange, onNext }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const list = await fetchClients();
        setClients(list);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };
    loadClients();
  }, []);

  const handleClientChange = (e) => {
    const value = e.target.value;
    onChange({ ...data, nome: value });
    
    if (value.length > 1) {
      const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (client) => {
    onChange({
      ...data,
      nome: client.name,
      contato: client.contact || '',
      cargo: client.role || '',
      local: client.location || '',
      tel: client.phone || ''
    });
    setShowSuggestions(false);
  };

  const isComplete = data.nome && data.contato && data.local;

  return (
    <>
      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-extrabold font-display mb-2 text-white">Dados do Cliente</h2>
        <p className="text-muted text-sm">Selecione um cliente cadastrado ou preencha manualmente.</p>
      </div>

      <div className="space-y-6">
       <div className="relative">
         <div className="flex items-center space-x-3">
           <Input 
             label="Empresa / Cliente *" 
             placeholder="Digite para buscar..." 
             value={data.nome || ''} 
             onChange={handleClientChange}
             onFocus={() => data.nome?.length > 1 && setShowSuggestions(true)}
             autoComplete="off"
             className="flex-1"
           />
           <button
             onClick={() => setShowQuickClientModal(true)}
             className="p-2 rounded-lg hover:bg-accent/20 transition-colors"
           >
             <Plus size={18} className="text-accent" />
           </button>
         </div>
         {showSuggestions && filteredClients.length > 0 && (
           <div className="absolute z-50 w-full mt-1 bg-surface border-2 border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-hidden">
             {filteredClients.map(client => (
               <button
                 key={client.id}
                 onClick={() => selectClient(client)}
                 className="w-full px-4 py-3 text-left hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-3 border-b border-border last:border-0"
               >
                 <Building2 size={16} className="text-muted" />
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white">{client.name}</span>
                   <span className="text-[10px] text-muted uppercase tracking-wider">{client.location}</span>
                 </div>
               </button>
             ))}
           </div>
         )}
       </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input 
            label="Nome do Contato *" 
            placeholder="Ex.: João da Silva" 
            value={data.contato || ''} 
            onChange={e => onChange({ ...data, contato: e.target.value })} 
          />
          <Input 
            label="Cargo / Função" 
            placeholder="Ex.: Diretor Técnico" 
            value={data.cargo || ''} 
            onChange={e => onChange({ ...data, cargo: e.target.value })} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input 
            label="Cidade *" 
            placeholder="Ex.: São Paulo, SP" 
            value={data.local || ''} 
            onChange={e => onChange({ ...data, local: e.target.value })} 
          />
          <Input 
            label="Telefone / WhatsApp" 
            placeholder="(00) 0 0000-0000" 
            value={data.tel || ''} 
            onChange={e => onChange({ ...data, tel: e.target.value })} 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-2 ml-1">Objeto / Descrição geral</label>
          <textarea 
            rows={3} 
            placeholder="Ex.: Execução de serviços de engenharia e instalação..." 
            className="w-full bg-bg/50 border-2 border-border rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-accent transition-colors h-24 resize-none text-sm"
            value={data.objeto || ''} 
            onChange={e => onChange({ ...data, objeto: e.target.value })} 
          />
        </div>
      </div>

       <div className="flex justify-end pt-4">
         <Button 
           onClick={onNext} 
           disabled={!isComplete}
           className="flex items-center gap-2"
         >
           Próximo <ArrowRight size={18} />
         </Button>
       </div>
     </motion.div>
     
     {/* Quick Client Modal */}
     <QuickClientModal
       isOpen={showQuickClientModal}
       onClose={() => setShowQuickClientModal(false)}
       onSuccess={() => {
         // Optionally refresh client list or select the newly created client
         // For now, we'll just close the modal and let the user search for the new client
       }}
     />
    </>
  );
};
 
 export default StepCliente;
