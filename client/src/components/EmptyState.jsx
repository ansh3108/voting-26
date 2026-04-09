import { createElement } from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'Once data exists, it will show up here.',
  Icon: IconComp = Inbox,
  action,
}) => {
  return (
    <div className="dv-empty">
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid var(--dv-border)',
          boxShadow: 'var(--dv-shadow)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {createElement(IconComp, { size: 28, color: 'var(--dv-muted)' })}
      </div>
      <h3 className="dv-empty-title">{title}</h3>
      <p className="dv-empty-subtitle">{description}</p>
      {action ? <div style={{ marginTop: '1.25rem' }}>{action}</div> : null}
    </div>
  );
};

export default EmptyState;

