import { NavLink } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-underline transition-all duration-300 flex items-center gap-2 font-medium text-[16px] ${
          isActive ? 'text-[#5F6DAE]' : 'hover:text-[#5F6DAE] text-white'
        }`
      }
    >
      <Icon className="text-xl" />
      {label}
    </NavLink>
  );
};

export default NavItem;