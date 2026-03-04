import { NavLink } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/templates', label: 'Templates' },
  { to: '/data', label: 'Data' },
  { to: '/schedules', label: 'Schedules' },
  { to: '/reports', label: 'Reports' },
];

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">ReportGen</div>
      <ul className="navbar-links">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
