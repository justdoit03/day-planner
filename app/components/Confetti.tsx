"use client";

import { useEffect, useState } from "react";

// Лёгкое конфетти без библиотек — несколько падающих цветных кусочков.
const COLORS = ["#e0402a", "#16181d", "#d98a2b", "#2e9c8e", "#3b5bdb", "#e07ba0"];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
};

export default function Confetti() {
  // Генерируем на клиенте (после монтирования), чтобы не было рассинхрона SSR/CSR
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-5vh",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            background: p.color,
            borderRadius: "1px",
            animation: `confettiFall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
