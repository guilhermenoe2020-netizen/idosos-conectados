/* ============================================
   SISTEMA DE DESEMPENHO — CONECTA IDOSO
   Salva resultados no aparelho (localStorage)
   para a Área da Família acompanhar.
   ============================================ */

const CHAVE_DESEMPENHO = "conectaIdoso_desempenho";

// Registra o resultado de uma atividade/quiz
// 'tentativas' é OPCIONAL (páginas antigas não enviam)
function registrarDesempenho(modulo, acertos, total, tentativas = 1) {
  // ⚠️ proteção: evita divisão por zero
  if (!total || total <= 0) {
    console.warn("registrarDesempenho: 'total' inválido.");
    return;
  }

  // ⚠️ proteção extra: garante números válidos
  acertos = Number(acertos) || 0;
  total = Number(total) || 0;

  const agora = new Date();
  const dados = obterDesempenho();

  dados[modulo] = {
    acertos: acertos,
    total: total,
    tentativas: Number(tentativas) || 1,
    percentual: Math.round((acertos / total) * 100),
    data: agora.toLocaleDateString("pt-BR"),
    hora: agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  try {
    localStorage.setItem(CHAVE_DESEMPENHO, JSON.stringify(dados));
  } catch (e) {
    // ex: armazenamento cheio ou modo privado
    console.warn("Não foi possível salvar o desempenho.", e);
  }
}

// Recupera todos os dados (usado pela Área da Família)
function obterDesempenho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_DESEMPENHO)) || {};
  } catch (e) {
    // se os dados estiverem corrompidos, não quebra o app
    console.warn("Dados de desempenho corrompidos. Reiniciando.");
    return {};
  }
}

// Limpa os dados (botão na Área da Família)
function limparDesempenho() {
  if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
    localStorage.removeItem(CHAVE_DESEMPENHO);
    location.reload();
  }
}