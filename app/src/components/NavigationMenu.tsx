import React from 'react';
import { useRouter } from 'next/navigation';

interface NavigationMenuProps {
  isPrivate: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isPrivate }) => {
  const router = useRouter();

  const menuItems = [
      { id: 'about', label: 'About me', icon: '👤' },
      { id: 'cv', label: 'CV', icon: '📄' },
      { id: 'technologies', label: 'Technologies', icon: '💻' },
      { id: 'experience', label: 'Work experience', icon: '💼' },
      { id: 'documents', label: 'Documents', icon: '📁' },
      { id: 'projects', label: 'My projects', icon: '🚀' },
      { id: 'contact', label: 'Contact Me', icon: '📧' },
  ];

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="sidebar">
      <nav className="nav-menu">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button 
                className="nav-item"
                onClick={() => scrollToSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="route-nav">
        {isPrivate ? (
          <button onClick={handleLogout} className="login-button">
            Logout
          </button>
        ) : (
          <button onClick={handleLogin} className="login-button">
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationMenu;