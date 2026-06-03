export function DashboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden 2xl:block"
    >
      <svg
        className="h-full w-full opacity-80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="bg-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="dot-grid"
            width="15"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            <rect width="1" height="1" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#bg-grid)" />

        <line
          x1="40"
          y1="0"
          x2="40"
          y2="100%"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
        <line
          x1="100%"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          transform="translate(-40, 0)"
        />
        <line
          x1="0"
          y1="100%"
          x2="100%"
          y2="100%"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          transform="translate(0, -40)"
        />

        <svg x="0" y="0" className="overflow-visible">
          <polygon points="0,0 250,0 0,250" fill="rgba(255,255,255,0.015)" />

          <rect
            x="0"
            y="150"
            width="6"
            height="80"
            fill="rgba(255,255,255,0.08)"
          />
          <rect
            x="0"
            y="240"
            width="6"
            height="30"
            fill="rgba(255,255,255,0.04)"
          />

          <path
            d="M 35 40 L 45 40 M 40 35 L 40 45"
            stroke="rgba(139,92,246,0.7)"
            strokeWidth="1.5"
          />

          <polyline
            points="0,150 20,150 40,170 40,250"
            fill="none"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="1"
          />
          <rect
            x="38"
            y="250"
            width="4"
            height="4"
            fill="rgba(139,92,246,0.7)"
          />

          <rect x="60" y="60" width="90" height="90" fill="url(#dot-grid)" />
        </svg>

        <svg x="0" y="100%" className="overflow-visible">
          <path
            d="M 35 -40 L 45 -40 M 40 -45 L 40 -35"
            stroke="rgba(139,92,246,0.7)"
            strokeWidth="1.5"
          />

          <rect
            x="40"
            y="-41"
            width="150"
            height="2"
            fill="rgba(139,92,246,0.5)"
          />
          <rect
            x="200"
            y="-41"
            width="40"
            height="2"
            fill="rgba(255,255,255,0.15)"
          />

          <rect x="60" y="-120" width="60" height="60" fill="url(#dot-grid)" />
        </svg>

        <svg x="100%" y="0" className="overflow-visible">
          <path
            d="M -45 40 L -35 40 M -40 35 L -40 45"
            stroke="rgba(139,92,246,0.7)"
            strokeWidth="1.5"
          />
          <rect
            x="-190"
            y="39"
            width="150"
            height="2"
            fill="rgba(255,255,255,0.1)"
          />
          <rect
            x="-240"
            y="39"
            width="40"
            height="2"
            fill="rgba(139,92,246,0.4)"
          />
        </svg>

        <svg x="100%" y="100%" className="overflow-visible">
          <polygon points="0,0 -350,0 0,-350" fill="rgba(255,255,255,0.015)" />

          <rect
            x="-6"
            y="-300"
            width="6"
            height="150"
            fill="rgba(255,255,255,0.08)"
          />

          <path
            d="M -45 -40 L -35 -40 M -40 -45 L -40 -35"
            stroke="rgba(139,92,246,0.7)"
            strokeWidth="1.5"
          />

          <polyline
            points="0,-120 -20,-120 -40,-140 -40,-220"
            fill="none"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="1"
          />
          <rect
            x="-42"
            y="-224"
            width="4"
            height="4"
            fill="rgba(139,92,246,0.7)"
          />

          <rect
            x="-150"
            y="-150"
            width="90"
            height="90"
            fill="url(#dot-grid)"
          />
        </svg>
      </svg>
    </div>
  );
}
