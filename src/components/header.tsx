"use client";

import React from 'react';
import PillNav, { PillNavItem } from './pills-nav';
import Clock from './clock';
import '../styles/pills-nav.css';

interface HeaderProps {
  onCreateUser: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateUser }) => {
  const navItems: PillNavItem[] = [
    {
      label: 'Crear Usuario',
      onClick: onCreateUser,
      ariaLabel: 'Crear un nuevo usuario',
    },
    {
      label: 'Estadísticas',
      href: '/stats',
      ariaLabel: 'Ver estadísticas de inserción',
    },
  ];

  return (
    <header className="grid grid-cols-3 items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      
      {/* Columna Izquierda: Texto ampliado con fuente aplicada */}
      <div className="justify-self-start">
         <h1 className="text-4xl font-bold text-gray-800 dark:text-white font-queering">
           Hola, Mila
         </h1>
      </div>

      {/* Columna Central: Reloj centrado con fuente aplicada */}
      <div className="justify-self-center text-xl text-gray-600 dark:text-gray-300 font-queering">
         <Clock />
      </div>

      {/* Columna Derecha: Navegación */}
      <div className="justify-self-end">
        <PillNav
          items={navItems}
          baseColor="var(--secondary)"
          pillColor="var(--primary)"
          hoveredPillTextColor="var(--secondary)"
          pillTextColor="var(--primary)"
        />
      </div>

    </header>
  );
};

export default Header;
