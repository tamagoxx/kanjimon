import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kanji Drop game uses requestAnimationFrame in useEffect.
  // React 19 strict mode runs effects twice in dev, which spawns 2 RAF chains
  // and dispatches MISS twice per kanji. Force off (the game has its own guard
  // refs; strict-mode double-effect would break them).
  reactStrictMode: false,
};

export default nextConfig;
