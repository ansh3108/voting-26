const Spinner = ({ className = '', size = 'md', white = false }) => {
  const sm = size === 'sm' ? ' dv-spinner--sm' : '';
  const w = white ? ' dv-spinner--white' : '';
  return <span className={`dv-spinner${sm}${w} ${className}`.trim()} role="status" aria-label="Loading" />;
};

export default Spinner;
