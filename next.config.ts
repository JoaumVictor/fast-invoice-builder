import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static app (localStorage-only, PDF generated client-side), so we
  // export plain HTML/JS/CSS for hosting on Cloudflare Pages — no server
  // runtime, no Workers adapter needed.
  output: "export",
};

export default nextConfig;
