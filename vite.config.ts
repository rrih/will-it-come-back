import { defineConfig, loadEnv, type Plugin } from "vite";
import { resolve } from "node:path";

// Injects Google Analytics, AdSense and the Search Console tag only when the
// IDs are configured (see .env.production).
function siteTags(env: Record<string, string>): Plugin {
  return {
    name: "site-tags",
    transformIndexHtml() {
      const tags: { tag: string; attrs?: Record<string, string | boolean>; children?: string; injectTo: "head" }[] = [];
      if (env.VITE_GSC_TOKEN) {
        tags.push({ tag: "meta", attrs: { name: "google-site-verification", content: env.VITE_GSC_TOKEN }, injectTo: "head" });
      }
      if (env.VITE_ADSENSE_CLIENT) {
        tags.push({ tag: "meta", attrs: { name: "google-adsense-account", content: env.VITE_ADSENSE_CLIENT }, injectTo: "head" });
        tags.push({
          tag: "script",
          attrs: {
            async: true,
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.VITE_ADSENSE_CLIENT}`,
            crossorigin: "anonymous",
          },
          injectTo: "head",
        });
      }
      if (env.VITE_GA_ID) {
        tags.push({ tag: "script", attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${env.VITE_GA_ID}` }, injectTo: "head" });
        tags.push({
          tag: "script",
          children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${env.VITE_GA_ID}');`,
          injectTo: "head",
        });
      }
      return tags;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [siteTags(env)],
    build: {
      target: "es2020",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          privacy: resolve(__dirname, "privacy.html"),
        },
      },
    },
  };
});
