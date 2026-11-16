import React from 'react';

export function HeartMedallion({ size = 82 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="medallion-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="heartSilk" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFB8C2" />
          <stop offset="45%" stopColor="#E84E68" />
          <stop offset="100%" stopColor="#A6243E" />
        </radialGradient>
        <linearGradient id="heartSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M50 86 C50 86 12 61.5 12 34.5 C12 20.5 22.8 11 35.5 11 C43.2 11 47.9 15 50 19.8 C52.1 15 56.8 11 64.5 11 C77.2 11 88 20.5 88 34.5 C88 61.5 50 86 50 86 Z"
        fill="url(#heartSilk)"
      />
      <path
        d="M50 86 C50 86 12 61.5 12 34.5 C12 20.5 22.8 11 35.5 11 C43.2 11 47.9 15 50 19.8 C52.1 15 56.8 11 64.5 11 C77.2 11 88 20.5 88 34.5 C88 61.5 50 86 50 86 Z"
        fill="url(#heartSheen)"
      />
      <ellipse cx="33" cy="28" rx="7" ry="4" transform="rotate(-28 33 28)" fill="#FFF" opacity="0.38" />
    </svg>
  );
}

export function WaxSealIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 60 60" className="wax-seal-svg" aria-hidden="true">
      <defs>
        <radialGradient id="waxGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E65D72" />
          <stop offset="70%" stopColor="#B82942" />
          <stop offset="100%" stopColor="#8A182D" />
        </radialGradient>
      </defs>
      <path
        d="M30 4 C35 4 38 7 43 7 C48 7 52 12 52 17 C55 21 56 26 54 31 C56 36 53 42 49 46 C46 51 40 54 35 53 C31 56 25 56 21 53 C16 53 11 49 9 44 C5 40 4 34 6 29 C4 24 6 18 10 14 C12 9 18 6 23 7 C26 4 28 4 30 4 Z"
        fill="url(#waxGrad)"
      />
      <circle cx="30" cy="30" r="18" fill="none" stroke="#FFD6DC" strokeWidth="1.2" opacity="0.6" />
      <text
        x="30"
        y="34"
        textAnchor="middle"
        fill="#FFF5F7"
        fontSize="10"
        fontWeight="700"
        letterSpacing="1"
      >
        已签收
      </text>
    </svg>
  );
}

export function CityArtwork({ cityId }) {
  if (cityId === 'chongqing') {
    // Misty layered mountain city + river bridge lights
    return (
      <svg viewBox="0 0 260 150" className="city-art-svg" aria-hidden="true">
        <defs>
          <linearGradient id="cqSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4A2131" />
            <stop offset="55%" stopColor="#8F3B54" />
            <stop offset="100%" stopColor="#DE7A78" />
          </linearGradient>
        </defs>
        <rect width="260" height="150" fill="url(#cqSky)" />
        <circle cx="205" cy="40" r="22" fill="#FFE6D4" opacity="0.22" />
        <path d="M0 98 L40 62 L85 88 L135 52 L195 85 L260 66 L260 150 L0 150 Z" fill="#3B1927" opacity="0.52" />
        <path d="M0 112 Q130 92 260 112 L260 150 L0 150 Z" fill="#2A111B" opacity="0.72" />
        <path d="M22 108 Q130 74 238 108" fill="none" stroke="#FFD3B6" strokeWidth="1.5" opacity="0.55" />
        <line x1="80" y1="90" x2="80" y2="115" stroke="#FFD3B6" strokeWidth="1.2" opacity="0.4" />
        <line x1="180" y1="90" x2="180" y2="115" stroke="#FFD3B6" strokeWidth="1.2" opacity="0.4" />
        <circle cx="66" cy="126" r="2" fill="#FFB997" opacity="0.7" />
        <circle cx="114" cy="132" r="1.6" fill="#FFD3B6" opacity="0.6" />
        <circle cx="164" cy="128" r="2" fill="#FFB997" opacity="0.7" />
      </svg>
    );
  }

  if (cityId === 'chengdu') {
    // Warm twilight sky + soft bamboo silhouette + crescent moon
    return (
      <svg viewBox="0 0 260 150" className="city-art-svg" aria-hidden="true">
        <defs>
          <linearGradient id="cdSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#61333E" />
            <stop offset="55%" stopColor="#B85D5B" />
            <stop offset="100%" stopColor="#F2AF88" />
          </linearGradient>
        </defs>
        <rect width="260" height="150" fill="url(#cdSky)" />
        <circle cx="198" cy="42" r="18" fill="#FFF0DB" opacity="0.25" />
        <path d="M0 118 Q85 95 165 112 T260 104 L260 150 L0 150 Z" fill="#46212A" opacity="0.58" />
        <path d="M28 150 Q34 95 26 42" fill="none" stroke="#31161C" strokeWidth="3" opacity="0.6" />
        <path d="M44 150 Q50 100 45 58" fill="none" stroke="#31161C" strokeWidth="2.2" opacity="0.5" />
        <ellipse cx="38" cy="64" rx="11" ry="3.5" transform="rotate(-24 38 64)" fill="#31161C" opacity="0.55" />
        <ellipse cx="18" cy="82" rx="10" ry="3" transform="rotate(22 18 82)" fill="#31161C" opacity="0.5" />
        <circle cx="194" cy="96" r="6" fill="#FFE0A3" opacity="0.75" />
      </svg>
    );
  }

  if (cityId === 'nanjing') {
    // Autumn Qinhuai golden rose sunset + sycamore leaf silhouette
    return (
      <svg viewBox="0 0 260 150" className="city-art-svg" aria-hidden="true">
        <defs>
          <linearGradient id="njSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5C2B3B" />
            <stop offset="50%" stopColor="#B95458" />
            <stop offset="100%" stopColor="#EBA378" />
          </linearGradient>
        </defs>
        <rect width="260" height="150" fill="url(#njSky)" />
        <circle cx="130" cy="72" r="36" fill="#FFE3C2" opacity="0.22" />
        <path d="M0 112 Q65 92 130 112 T260 108 L260 150 L0 150 Z" fill="#3E1B26" opacity="0.68" />
        <path d="M84 114 Q130 82 176 114" fill="none" stroke="#FFE5CA" strokeWidth="1.6" opacity="0.5" />
        <path
          d="M210 35 C218 42 222 54 210 62 C198 54 202 42 210 35 Z"
          fill="#FFE3C2"
          opacity="0.35"
        />
        <path
          d="M46 48 C52 53 55 62 46 68 C37 62 40 53 46 48 Z"
          fill="#FFE3C2"
          opacity="0.28"
        />
      </svg>
    );
  }

  // Shijiazhuang: Northern wide warm dusk & gentle horizon glow
  return (
    <svg viewBox="0 0 260 150" className="city-art-svg" aria-hidden="true">
      <defs>
        <linearGradient id="sjzSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4E263B" />
          <stop offset="58%" stopColor="#A64B63" />
          <stop offset="100%" stopColor="#E9A292" />
        </linearGradient>
      </defs>
      <rect width="260" height="150" fill="url(#sjzSky)" />
      <circle cx="72" cy="54" r="28" fill="#FFE6D8" opacity="0.22" />
      <path d="M0 108 Q95 96 175 106 T260 102 L260 150 L0 150 Z" fill="#371828" opacity="0.62" />
      <circle cx="195" cy="36" r="2" fill="#FFF3E6" opacity="0.7" />
      <circle cx="222" cy="52" r="1.5" fill="#FFF3E6" opacity="0.55" />
      <circle cx="170" cy="48" r="1.4" fill="#FFF3E6" opacity="0.5" />
    </svg>
  );
}
