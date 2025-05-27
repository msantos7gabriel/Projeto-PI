document.getElementById('logForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('logFile');
  const logContentEl = document.getElementById('logContent');
  const diagnosticoEl = document.getElementById('diagnostico');

  if (!fileInput.files.length) return alert('Selecione um arquivo!');

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (event) {
    const logData = event.target.result;
    logContentEl.textContent = logData;

    diagnosticoEl.textContent = '🔄 Analisando com IA...';

    try {
      // Envia para uma API fictícia
      const response = await fetch('https://api.ficticia.com/analise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: logData })
      });

      if (!response.ok) throw new Error('Erro na resposta da IA');

      const data = await response.json();
      diagnosticoEl.textContent = data.diagnostico || '⚠️ Diagnóstico indisponível.';
    } catch (error) {
      console.error(error);
      diagnosticoEl.textContent = '❌ Erro ao analisar o log.';
    }
  };

  reader.readAsText(file);
});
