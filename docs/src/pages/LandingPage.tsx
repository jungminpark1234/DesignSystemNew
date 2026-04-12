import React from "react";
import { useTheme } from "../theme";
import { DocsHeader } from "../layout/DocsHeader";
import iconGettingStarted from "../assets/icon-getting-started.svg";
import iconFoundations from "../assets/icon-foundations.svg";
import iconComponents from "../assets/icon-components.svg";
import heroVideo from "../assets/hero-video.mp4";

const ff = "'Pretendard', sans-serif";
const ffEn = "'KMR Apparat', 'Pretendard', sans-serif";

interface LandingPageProps {
  onNavigate: (slug: string) => void;
}

function CategoryCard({ title, bg, icon, onClick }: { title: string; bg: string; icon: string; onClick: () => void }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        minWidth: 200,
      }}
    >
      <div style={{
        width: "100%",
        height: 220,
        borderRadius: 24,
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
      }}>
        <img src={icon} alt={title} style={{ width: "40%", height: "40%", objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: colors.text.primary, fontFamily: ffEn }}>{title}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke={colors.text.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { colors } = useTheme();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg.primary }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: "blur(12px)", backgroundColor: `${colors.bg.primary}e0` }}>
        <DocsHeader borderless />
      </div>
      <div style={{ height: 60 }} />{/* spacer for fixed header */}

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Hero */}
        <section style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 64,
          paddingTop: 120,
          paddingBottom: 60,
          width: "100%",
          maxWidth: 1060,
          paddingLeft: 24,
          paddingRight: 24,
          boxSizing: "border-box",
        }}>
          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <h1 style={{
                  fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.15,
                  color: colors.text.primary, fontFamily: ffEn, margin: 0,
                  letterSpacing: "-0.02em",
                }}>
                  Intelligence Starts with Consistency
                </h1>
                <p style={{
                  fontSize: "clamp(20px, 3vw, 36px)", fontWeight: 500, lineHeight: 1.35,
                  color: colors.text.secondary, fontFamily: ffEn, margin: 0,
                  letterSpacing: "-0.01em",
                }}>
                  Built to Scale. Designed to Connect.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <p style={{ fontSize: 14, lineHeight: "16px", color: colors.text.tertiary, fontFamily: ff, margin: 0 }}>
                  마키나락스가 만드는 세상은, 모든 산업 현장이 더 지능적으로 작동하는 세상입니다.
                </p>
                <p style={{ fontSize: 14, lineHeight: "16px", color: colors.text.tertiary, fontFamily: ff, margin: 0 }}>
                  그 세상을 일관되게 담아내기 위해, 우리는 디자인 시스템을 만들었습니다.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => onNavigate("introduction")}
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 99,
                border: "none",
                backgroundColor: "#c3fa4b",
                color: "#000",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: ffEn,
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(195,250,75,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Getting Started
            </button>
          </div>

          {/* Hero Video */}
          <div style={{
            width: "100%",
            aspectRatio: "1680 / 720",
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#0a0a0a",
          }}>
            <video
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scaleX(-1)" }}
            />
          </div>
        </section>

        {/* What Powers the System */}
        <section style={{
          width: "100%",
          maxWidth: 1060,
          padding: "64px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          <h2 style={{ fontSize: 31, fontWeight: 700, color: colors.text.primary, fontFamily: ffEn, margin: 0, letterSpacing: "-1px" }}>
            What Powers the System
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <CategoryCard title="Getting started" bg="#0f0e0d" icon={iconGettingStarted} onClick={() => onNavigate("introduction")} />
            <CategoryCard title="Foundations" bg="#dadad0" icon={iconFoundations} onClick={() => onNavigate("color")} />
            <CategoryCard title="Components" bg="#c3fa4b" icon={iconComponents} onClick={() => onNavigate("alert")} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "24px clamp(24px, 5vw, 183px)",
        display: "flex",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 14, color: `${colors.text.primary}e0`, fontFamily: ff }}>
          © 2026 MakinaRocks, Inc.
        </span>
      </footer>
    </div>
  );
}
