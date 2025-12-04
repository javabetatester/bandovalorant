import { useState } from 'react';
import { Copy, Check, X, Link2 } from 'lucide-react';

interface LinkShareModalProps {
  lobbyId: string;
  onClose: () => void;
}

export function LinkShareModal({ lobbyId, onClose }: LinkShareModalProps) {
  const [copied, setCopied] = useState(false);
  const lobbyLink = `${window.location.origin}${window.location.pathname}#lobby/${lobbyId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lobbyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar link:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 rounded-lg p-4 sm:p-6 max-w-md w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-500 font-bold text-xl uppercase tracking-wider">
              <Link2 size={24} />
              Lobby Criado!
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-white text-sm">
            Compartilhe este link para que outros jogadores possam acessar o lobby:
          </p>

          <div className="bg-black/50 border border-gray-700 rounded-lg p-3 flex items-center gap-2">
            <input
              type="text"
              value={lobbyLink}
              readOnly
              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {copied ? (
                <div className="flex items-center gap-2">
                  <Check size={18} />
                  Copiado!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Copy size={18} />
                  Copiar
                </div>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

