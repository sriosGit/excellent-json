interface LogoProps {
  className?: string
}

export function Logo({ className = "w-10 h-10" }: LogoProps) {
  return (
    <div className={`${className} bg-[#0f172a] rounded-xl flex items-center justify-center`}>
      <svg viewBox="0 0 64 64" fill="none" className="w-[70%] h-[70%]">
        {/* Left brace */}
        <path 
          d="M18 12 C18 12 10 12 10 22 L10 27 C10 32 5 32 5 32 C5 32 10 32 10 37 L10 42 C10 52 18 52 18 52" 
          stroke="#22d3ee" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none"
        />
        {/* Right brace */}
        <path 
          d="M46 12 C46 12 54 12 54 22 L54 27 C54 32 59 32 59 32 C59 32 54 32 54 37 L54 42 C54 52 46 52 46 52" 
          stroke="#22d3ee" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none"
        />
        {/* Center dots */}
        <circle cx="32" cy="22" r="4" fill="#4ade80"/>
        <circle cx="32" cy="32" r="4" fill="#4ade80"/>
        <circle cx="32" cy="42" r="4" fill="#4ade80"/>
      </svg>
    </div>
  )
}

