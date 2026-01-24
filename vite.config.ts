import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      // Insolvenz Subdomains
      "insolvenz.solle-schniebel.de",
      "insolvenz.anwaelte-neiseke-hagedorn.de",
      "insolvenz.merits-partner.de",
      "insolvenz.legati-kanzlei.de",
      
      // Hauptdomains
      "solle-schniebel.de",
      "anwaelte-neiseke-hagedorn.de",
      "merits-partner.de",
      "legati-kanzlei.de",
      
      // Fahrzeuge Domains
      "audi-vertrieb-leipzig.de",
      "www.audi-vertrieb-leipzig.de",
      
      // Development
      ".lovable.app",
      "localhost"
    ]
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
