import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  FileText, 
  Monitor, 
  Briefcase, 
  FolderOpen, 
  Rocket, 
  Mail 
} from 'lucide-react';

interface NavigationMenuProps {
  isPrivate: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = () => {
  const router = useRouter();

  const menuItems = [
      { id: 'about', label: 'About me', icon: User },
      { id: 'cv', label: 'CV', icon: FileText },
      { id: 'technologies', label: 'Technologies', icon: Monitor },
      { id: 'experience', label: 'Work experience', icon: Briefcase },
      { id: 'documents', label: 'Documents', icon: FolderOpen },
      { id: 'projects', label: 'My projects', icon: Rocket },
      { id: 'contact', label: 'Contact Me', icon: Mail },
  ];

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
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button 
                  className="nav-item"
                  onClick={() => scrollToSection(item.id)}
                >
                  <span className="nav-icon">
                    <IconComponent size={18} />
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

{/*      <div className="route-nav">
        {isPrivate ? (
          <button onClick={handleLogout} className="login-button">
            Logout
          </button>
        ) : (
          <button onClick={handleLogin} className="login-button">
            Login
          </button>
        )}
      </div>*/}
    </div>
  );
};

export default NavigationMenu;