'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, Home, User, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface SearchResult {
  id: string;
  type: 'property' | 'unit' | 'tenant';
  title: string;
  subtitle: string;
  url: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.get('/properties');
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await api.get('/units');
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await api.get('/tenants');
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  // Search logic
  const results: SearchResult[] = [];

  if (query.length >= 2) {
    const lowerQuery = query.toLowerCase();

    // Search properties
    properties?.forEach((p: any) => {
      if (p.name?.toLowerCase().includes(lowerQuery) || 
          p.town?.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: p.id,
          type: 'property',
          title: p.name,
          subtitle: `${p.town || ''}, ${p.county || ''}`,
          url: `/properties/${p.id}`,
        });
      }
    });

    // Search units
    units?.forEach((u: any) => {
      if (u.name?.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: u.id,
          type: 'unit',
          title: u.name,
          subtitle: u.property?.name || 'Unit',
          url: `/units/${u.id}`,
        });
      }
    });

    // Search tenants
    tenants?.forEach((t: any) => {
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      if (fullName.includes(lowerQuery) || 
          t.phone?.includes(query) || 
          t.idNumber?.includes(query)) {
        results.push({
          id: t.id,
          type: 'tenant',
          title: `${t.firstName} ${t.lastName}`,
          subtitle: t.phone || t.email || '',
          url: `/tenants/${t.id}`,
        });
      }
    });
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'property': return <Building2 className="w-4 h-4" />;
      case 'unit': return <Home className="w-4 h-4" />;
      case 'tenant': return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-white rounded border border-gray-300">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
          />

          {/* Modal */}
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search properties, units, or tenants..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 outline-none text-lg"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded border border-gray-300">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query.length < 2 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Type at least 2 characters to search</p>
                    <p className="text-xs mt-2">Search by name, location, phone, or ID number</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No results found for "{query}"</p>
                    <p className="text-xs mt-2">Try a different search term</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result.url)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{result.title}</p>
                          <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t bg-gray-50 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
                <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border">ESC</kbd> to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

