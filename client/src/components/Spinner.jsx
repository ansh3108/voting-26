import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 22, color = 'var(--dv-primary)', className = '' }) => {
  return (
    <span role="status" aria-label="Loading" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Loader2 size={size} color={color} className={`dv-icon-spin ${className}`.trim()} />
    </span>
  );
};

export default Spinner;
