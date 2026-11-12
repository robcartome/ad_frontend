// Ilustraciones vectoriales propias de demostración; sin imágenes de terceros.
export default function ProductArt({ type = 'drill', className = '' }) {
    return <svg className={className} viewBox="0 0 240 180" fill="none" aria-hidden="true">
    
    <ellipse cx="120" cy="153" rx="75" ry="9" fill="#202020" opacity=".07"/>
    {type === 'drill' && <g transform="rotate(-12 120 90)">
      <path d="M43 48h105l17 22-18 27H48z" fill="#FF8000"/>
      <path d="M65 89h47l-9 48H72z" fill="#30343A"/>
      <path d="M72 130h43v18H58v-12z" fill="#FF8000"/>
      <rect x="145" y="56" width="32" height="32" rx="5" fill="#30343A"/>
      <path d="M177 65h39v12h-39z" fill="#9CA3AF"/>
      <path d="M51 60h40M51 70h32" stroke="#A94E00" strokeWidth="4"/>
      <rect x="114" y="58" width="21" height="20" rx="3" fill="#FFDBAE"/>
      <path d="M110 100h17v16h-21" stroke="#30343A" strokeWidth="7"/>
    </g>}
    {type === 'grinder' && <g transform="rotate(-18 120 90)">
      <rect x="43" y="69" width="116" height="39" rx="15" fill="#FF8000"/>
      <rect x="48" y="75" width="30" height="27" rx="7" fill="#30343A"/>
      <path d="M94 80v17m10-17v17m10-17v17" stroke="#A94E00" strokeWidth="3"/>
      <rect x="145" y="66" width="34" height="47" rx="9" fill="#77818B"/>
      <circle cx="181" cy="102" r="33" fill="#30343A"/>
      <circle cx="181" cy="102" r="23" fill="#A0A6AC"/>
      <circle cx="181" cy="102" r="6" fill="#30343A"/>
      <path d="M155 66V38h-14v28" fill="#30343A"/>
    </g>}
    {type === 'paint' && <g>
      <path d="M69 64c-3-59 105-59 102 0" stroke="#858585" strokeWidth="5"/>
      <path d="M60 65h120l-9 81H70z" fill="#E1E4E7"/>
      <path d="M64 88h112l-4 40H68z" fill="#FF8000"/>
      <ellipse cx="120" cy="65" rx="60" ry="12" fill="#F9FAFB" stroke="#9CA3AF" strokeWidth="3"/>
      <path d="M91 105h58m-47 10h36" stroke="#FFF" strokeWidth="5"/>
      <path d="M78 137h84" stroke="#C0C4C8" strokeWidth="3"/>
    </g>}
    {type === 'cement' && <g>
      <path d="M78 27h84l13 116-13 10H74l-9-10z" fill="#D8C4A0"/>
      <path d="M78 27l7 12h69l8-12M74 153l10-12h78" stroke="#AE9873" strokeWidth="3"/>
      <path d="M72 62h97l5 57H68z" fill="#F2F2F2"/>
      <path d="M79 76h82v25H79z" fill="#FF8000"/>
      <path d="M94 111h50" stroke="#555" strokeWidth="4"/>
      <path d="M85 132h24m21 0h23" stroke="#AE9873" strokeWidth="4"/>
    </g>}
    {type === 'pipe' && <g>
      <path d="M50 137l105-88 31 30-105 83z" fill="#CCD1D7"/>
      <path d="M80 162l106-83" stroke="#A6ADB6" strokeWidth="7"/>
      <ellipse cx="171" cy="64" rx="22" ry="26" transform="rotate(-43 171 64)" fill="#EAEDF0"/>
      <ellipse cx="171" cy="64" rx="14" ry="18" transform="rotate(-43 171 64)" fill="#6B7280"/>
      <path d="M38 113l95-80 17 17-96 80z" fill="#E6E9ED"/>
    </g>}
    {type === 'cable' && <g>
      <ellipse cx="114" cy="94" rx="62" ry="51" stroke="#383C44" strokeWidth="24"/>
      <ellipse cx="114" cy="94" rx="44" ry="35" stroke="#555C66" strokeWidth="12"/>
      <path d="M154 115c52 40 70 2 42-15" stroke="#30343A" strokeWidth="10" strokeLinecap="round"/>
      <path d="M195 99l-10-9" stroke="#B87D41" strokeWidth="7"/>
      <path d="M87 45l14 23m37-23-13 22" stroke="#FF8000" strokeWidth="10"/>
    </g>}
    {type === 'helmet' && <g>
      <path d="M60 123c-1-93 120-93 120 0z" fill="#FFAF21"/>
      <path d="M104 54h30v71h-30z" fill="#FF8000"/>
      <path d="M48 121h147v18H48z" fill="#F18B00"/>
      <path d="M76 108c0-18 5-30 13-38" stroke="#FFD884" strokeWidth="6" strokeLinecap="round"/>
    </g>}
    {type === 'brick' && <g>
      <path d="M43 76l101-38 57 33-101 39z" fill="#DC8B64"/>
      <path d="M43 76v56l57 32v-54z" fill="#B96342"/>
      <path d="M100 110l101-39v55l-101 38z" fill="#C87550"/>{[0, 1, 2].map(n => <path key={n} d={`M${64 + n * 27} ${74 - n * 10}l17-6 18 9-18 7z`} fill="#86472E"/>)}
      <path d="M111 122l80-31m-80 46 80-31m-80 46 80-31" stroke="#AB5F3F" strokeWidth="3"/>
    </g>}
  
  </svg>;
}
