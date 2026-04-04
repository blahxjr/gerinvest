'use client';

import { useState, useEffect } from 'react';

export type CarteiraInfo = {
  id: string;
  nome: string;
  descricao?: string;
};

type Props = {
  carteiras: CarteiraInfo[];
  selectedCarteiraId: string | null;
  onSelectCarteira: (carteiraId: string | null) => void;
};

export default function CarteiraSelector({ carteiras, selectedCarteiraId, onSelectCarteira }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCarteira = selectedCarteiraId 
    ? carteiras.find(c => c.id === selectedCarteiraId)
    : null;

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-300">Visualizar Carteira:</label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-lg border border-sky-500/50 bg-sky-950/30 text-slate-100 hover:bg-sky-950/50 transition-colors flex items-center gap-2 min-w-[250px] justify-between"
          >
            <span>
              {selectedCarteira ? selectedCarteira.nome : 'Todas as carteiras'}
            </span>
            <span className="text-sm">▼</span>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              {/* Opção "Todas" */}
              <button
                onClick={() => {
                  onSelectCarteira(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors first:rounded-t-lg ${
                  !selectedCarteiraId ? 'bg-sky-900/50 text-sky-300 font-semibold' : 'text-slate-100'
                }`}
              >
                📊 Todas as carteiras ({carteiras.length})
              </button>

              {/* Divider */}
              <div className="border-t border-slate-700" />

              {/* Lista de carteiras */}
              {carteiras.map((carteira) => (
                <button
                  key={carteira.id}
                  onClick={() => {
                    onSelectCarteira(carteira.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors last:rounded-b-lg ${
                    selectedCarteiraId === carteira.id
                      ? 'bg-sky-900/50 text-sky-300 font-semibold'
                      : 'text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>💼 {carteira.nome}</span>
                    {selectedCarteiraId === carteira.id && <span className="text-green-400">✓</span>}
                  </div>
                  {carteira.descricao && (
                    <p className="text-xs text-slate-400 mt-1">{carteira.descricao}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumo rápido da seleção */}
      {selectedCarteira && (
        <div className="text-xs text-slate-400">
          Visualizando: <strong className="text-sky-300">{selectedCarteira.nome}</strong>
          {selectedCarteira.descricao && ` • ${selectedCarteira.descricao}`}
        </div>
      )}
    </div>
  );
}
