/* ============================================
   SERVICE WORKER — IDOSO CONECTADO
   Estratégia: Cache First (abre rápido e offline)
   ============================================ */

const CACHE = "idosos-conectados-v2"; // ⬅️ subiu a versão!

const ARQUIVOS = [
  "./",
  "./index.html",
  "./modulos.html",
  "./desempenho.js",
  // páginas dos módulos
  "./modulos/golpe.html",
  // ícones / favicon
  "./icons/favicon.png"
];

/* ===== INSTALAÇÃO: guarda os arquivos no cache ===== */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      // não quebra a instalação se um arquivo faltar
      Promise.allSettled(ARQUIVOS.map((arq) => cache.add(arq)))
    )
  );
  self.skipWaiting();
});

/* ===== ATIVAÇÃO: apaga caches antigos ===== */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

/* ===== BUSCA: Cache First com atualização em segundo plano ===== */
self.addEventListener("fetch", (e) => {
  // só lida com requisições GET (ignora POST etc.)
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cacheado) => {
      // se já está no cache, devolve na hora (rápido!)
      const buscarRede = fetch(e.request)
        .then((resposta) => {
          // atualiza o cache em segundo plano
          if (resposta && resposta.status === 200) {
            const copia = resposta.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, copia));
          }
          return resposta;
        })
        .catch(() => cacheado); // sem internet? usa o cache

      // devolve o cache imediato; se não tiver, espera a rede
      return cacheado || buscarRede;
    })
  );
});