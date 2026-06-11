"use client";

export default function DashboardPulse() {
    return (
        <div className="dashboard-pulse" aria-hidden="true">
            <div className="dashboard-pulse__scan" />
            <svg className="dashboard-pulse__chart" viewBox="0 0 760 220" fill="none" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="pulseLinePrimary" x1="0" y1="0" x2="760" y2="0">
                        <stop stopColor="var(--success)" />
                        <stop offset="0.54" stopColor="var(--secondary)" />
                        <stop offset="1" stopColor="var(--accent)" />
                    </linearGradient>
                    <linearGradient id="pulseLineExpense" x1="0" y1="0" x2="760" y2="0">
                        <stop stopColor="var(--danger)" stopOpacity="0.1" />
                        <stop offset="0.5" stopColor="var(--danger)" />
                        <stop offset="1" stopColor="var(--accent)" stopOpacity="0.72" />
                    </linearGradient>
                    <radialGradient id="pulseNodeGlow">
                        <stop stopColor="var(--accent)" />
                        <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <path className="dashboard-pulse__gridline" d="M0 52 H760" />
                <path className="dashboard-pulse__gridline" d="M0 116 H760" />
                <path className="dashboard-pulse__gridline" d="M0 180 H760" />

                <path className="dashboard-pulse__area" d="M0 162 C70 134, 112 170, 178 132 S300 72, 382 94 S500 150, 586 86 S700 62, 760 82 L760 220 L0 220 Z" />
                <path className="dashboard-pulse__line dashboard-pulse__line--income" pathLength="1" d="M0 162 C70 134, 112 170, 178 132 S300 72, 382 94 S500 150, 586 86 S700 62, 760 82" />
                <path className="dashboard-pulse__line dashboard-pulse__line--expense" pathLength="1" d="M0 96 C62 112, 118 82, 190 108 S318 152, 414 126 S540 72, 638 104 S720 146, 760 128" />

                <circle className="dashboard-pulse__glow dashboard-pulse__glow--one" cx="586" cy="86" r="58" fill="url(#pulseNodeGlow)" />
                <circle className="dashboard-pulse__dot dashboard-pulse__dot--one" cx="178" cy="132" r="4.5" />
                <circle className="dashboard-pulse__dot dashboard-pulse__dot--two" cx="382" cy="94" r="4.5" />
                <circle className="dashboard-pulse__dot dashboard-pulse__dot--three" cx="586" cy="86" r="5" />
            </svg>
        </div>
    );
}
