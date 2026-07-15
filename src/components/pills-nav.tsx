"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface PillNavItem {
  label: string;
  onClick?: () => void;
  href?: string;
  ariaLabel: string;
}

interface PillNavProps {
  items: PillNavItem[];
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
}

const PillNav: React.FC<PillNavProps> = ({
  items,
  baseColor = '#f0f0f0',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#000000',
  pillTextColor = '#333333',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({});
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items]);

  const handleMouseEnter = (index: number) => {
    const item = itemRefs.current[index];
    if (item) {
      setPillStyle({
        width: item.offsetWidth,
        left: item.offsetLeft,
      });
    }
  };

  const handleMouseLeave = () => {
    // Optionally reset or keep the last position
  };

  return (
    <nav
      className="pill-nav-container"
      onMouseLeave={handleMouseLeave}
      style={{
        '--base-color': baseColor,
        '--pill-color': pillColor,
        '--hovered-pill-text-color': hoveredPillTextColor,
        '--pill-text-color': pillTextColor,
      } as React.CSSProperties}
    >
      <div className="pill-nav-indicator" style={pillStyle}></div>
      {items.map((item, index) => {
        const commonProps = {
          ref: (el: HTMLElement | null) => (itemRefs.current[index] = el),
          className: 'pill-nav-item',
          'aria-label': item.ariaLabel,
          onMouseEnter: () => handleMouseEnter(index),
        };

        if (item.href) {
          return (
            <Link key={index} href={item.href} {...commonProps}>
              {item.label}
            </Link>
          );
        }

        return (
          <button key={index} {...commonProps} onClick={item.onClick}>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default PillNav;
