"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLaboralYear, sortLaboralYears } from "@/lib/utils/laboral-year";
import type { UserWithRelations } from "@/app/page";

interface LaboralYearNavbarProps {
  users: UserWithRelations[];
  onFilterChange: (laboralYear: string | null) => void;
  activeFilter: string | null;
}

export function LaboralYearNavbar({ users, onFilterChange, activeFilter }: LaboralYearNavbarProps) {
  const [expandedYears, setExpandedYears] = useState<string[]>([]);

  const usersByYear = useMemo(() => {
    const groups: Record<string, UserWithRelations[]> = {};
    
    users.forEach(user => {
      const yearLabel = getLaboralYear(user.updatedAt);
      if (!groups[yearLabel]) {
        groups[yearLabel] = [];
      }
      groups[yearLabel].push(user);
    });
    
    return groups;
  }, [users]);

  const sortedYears = useMemo(() => {
    return sortLaboralYears(Object.keys(usersByYear));
  }, [usersByYear]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year) 
        : [...prev, year]
    );
  };

  const totalUsers = users.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Años Laborales
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {totalUsers} usuarios
            </span>
          </div>
          <button
            onClick={() => onFilterChange(null)}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              activeFilter === null
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            Ver todos
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {sortedYears.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedYears.map((year) => {
              const yearUsers = usersByYear[year];
              const userCount = yearUsers.length;
              const isExpanded = expandedYears.includes(year);
              const isActive = activeFilter === year;
              
              return (
                <li key={year} className={cn(isActive && "bg-blue-50 dark:bg-blue-900/20")}>
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 text-xs font-medium transition-transform",
                        isExpanded ? "rotate-90" : ""
                      )}>
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className={cn(
                          "font-medium",
                          isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
                        )}>
                          {year}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        isActive 
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      )}>
                        {userCount} usuario{userCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <ul className="pl-10 divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                      {yearUsers.map((user) => (
                        <li key={user.id}>
                          <button
                            onClick={() => onFilterChange(year)}
                            className={cn(
                              "w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                              isActive && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                            )}
                          >
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm truncate">
                              {user.nombre} {user.apellidos || ''}
                            </span>
                            {isActive && (
                              <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}