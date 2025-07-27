import React from 'react';

export default function AgentAnimation({ isVisible, type = 'speak' }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Agenten-Animation */}
        <div className="animate-bounce-in bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-3">
            {/* Agenten-Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                {/* Kopf */}
                <div className="w-8 h-8 bg-gray-100 rounded-full relative border border-gray-300">
                  {/* Augen */}
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  {/* Augen-Glanz */}
                  <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                  <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                  {/* Mund */}
                  <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              
              {/* Antennen */}
              <div className="absolute -top-2 -left-1 w-1 h-2 bg-gray-400 rounded-full transform rotate-12"></div>
              <div className="absolute -top-2 -right-1 w-1 h-2 bg-gray-400 rounded-full transform -rotate-12"></div>
              
              {/* Antennen-Knöpfe */}
              <div className="absolute -top-3 -left-1.5 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <div className="absolute -top-3 -right-1.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Text */}
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-800">
                {type === 'speak' ? '🎤 Höre zu...' : '✍️ Verarbeite...'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {type === 'speak' ? 'Sprich jetzt!' : 'Text wird verarbeitet'}
              </div>
            </div>
          </div>
          
          {/* Wellenform-Animation für Sprachmodus */}
          {type === 'speak' && (
            <div className="flex justify-center space-x-1 mt-3">
              <div className="w-1 h-3 bg-blue-400 rounded animate-pulse"></div>
              <div className="w-1 h-5 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-6 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-1 h-3 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          
          {/* Schreib-Animation für Textmodus */}
          {type === 'text' && (
            <div className="flex justify-center mt-3">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-blue-400 rounded animate-bounce"></div>
                <div className="w-1 h-4 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-4 bg-blue-400 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Glow-Effekt */}
        <div className="absolute inset-0 bg-blue-200 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
      </div>
    </div>
  );
} 