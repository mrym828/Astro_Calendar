const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const base = 'rounded-lg font-medium transition-colors text-lg hover:cursor-pointer';

  const styles = {
    primary: `${base} bg-gradient-to-r to-[#0A66C2] from-[#33055C] text-white`,
    secondary: `${base} border border-white/70 text-white`,
    outline: `${base} border border-white/20 hover:bg-white/10 text-white`,
  };

  return (
    <button onClick={onClick} className={`${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;