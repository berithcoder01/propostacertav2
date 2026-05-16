// src/shared/StatusBadge.jsx
const STATUS = {
  DRAFT:    { label: 'Rascunho', bg: 'bg-muted/15',   text: 'text-muted',   dot: 'bg-muted' },
  SENT:     { label: 'Enviada',  bg: 'bg-info/12',    text: 'text-info',    dot: 'bg-info' },
  APPROVED: { label: 'Aprovada', bg: 'bg-success/12', text: 'text-success', dot: 'bg-success' },
  REJECTED: { label: 'Recusada', bg: 'bg-danger/12',  text: 'text-danger',  dot: 'bg-danger' },
  EXPIRED:  { label: 'Expirada', bg: 'bg-warning/12', text: 'text-warning', dot: 'bg-warning' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.DRAFT;
  return (
    <span className={`badge ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export default StatusBadge;
