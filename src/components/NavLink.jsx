export default function NavLink({ active, children, onClick }) {
    return (
      <button
        className={`text-sm font-medium transition-colors ${active ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }