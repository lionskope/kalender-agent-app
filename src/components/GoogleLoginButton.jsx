import React from 'react';

export default function GoogleLoginButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 py-3 px-7 rounded-2xl bg-white shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition text-gray-900 font-semibold text-lg active:scale-98 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sfpro"
      style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <g>
          <path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.25s2.75-6.25 6.125-6.25c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.703-1.57-3.898-2.523-6.656-2.523-5.523 0-10 4.477-10 10s4.477 10 10 10c5.75 0 9.547-4.031 9.547-9.719 0-.656-.07-1.156-.156-1.5z" fill="#FFC107"/>
          <path d="M3.152 7.345l3.25 2.383c.883-1.68 2.484-2.883 4.398-2.883 1.07 0 2.07.367 2.844 1.086l2.719-2.633c-1.57-1.453-3.594-2.298-5.563-2.298-3.398 0-6.25 2.203-7.344 5.345z" fill="#FF3D00"/>
          <path d="M12.8 22c2.438 0 4.484-.805 5.977-2.188l-2.75-2.242c-.766.617-1.797.992-3.227.992-2.484 0-4.594-1.68-5.352-3.953l-3.242 2.5c1.422 2.844 4.453 4.891 8.594 4.891z" fill="#4CAF50"/>
          <path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.25s2.75-6.25 6.125-6.25c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.703-1.57-3.898-2.523-6.656-2.523-5.523 0-10 4.477-10 10s4.477 10 10 10c5.75 0 9.547-4.031 9.547-9.719 0-.656-.07-1.156-.156-1.5z" fill="#1976D2"/>
        </g>
      </svg>
      <span>Mit Google anmelden</span>
    </button>
  );
} 