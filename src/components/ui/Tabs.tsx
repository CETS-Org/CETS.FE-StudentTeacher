import React, { useState } from "react";
import type { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  badge?: number | string;
  disabled?: boolean;
  color?: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: ReactNode;
  className?: string;
}

export interface TabContentProps {
  activeTab: string;
  tabId: string;
  children: ReactNode;
}

export function Tabs({ tabs, activeTab, onTabChange, className = "" }: TabsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-4 pl-4 pr-4 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm lg:text-base flex-shrink-0
                  ${isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }
                  ${tab.disabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer'
                  }
                  transition-colors duration-200
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className={`
                      inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full min-w-[1.25rem] h-5 shadow-md
                      ${tab.color || (isActive 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-neutral-100 text-neutral-600'
                      )}
                    `}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function TabContent({ activeTab, tabId, children }: TabContentProps) {
  if (activeTab !== tabId) return null;
  
  return (
    <div className="py-6">
      {children}
    </div>
  );
}

export default Tabs;