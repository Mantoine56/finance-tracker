import React from 'react';

interface TabsProps {
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => (
  <div className="w-full">{children}</div>
);

interface TabsListProps {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children }) => (
  <div className="flex w-full mb-4">{children}</div>
);

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  onClick: (value: string) => void;
  isActive: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, onClick, isActive }) => (
  <button
    onClick={() => onClick(value)}
    className={`flex-1 px-4 py-2 text-center rounded-lg transition-colors ${
      isActive ? 'bg-white shadow text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  activeTab: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, value, activeTab }) => (
  value === activeTab ? <div>{children}</div> : null
);