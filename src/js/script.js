let apiKey = '';
let isLoading = false;

// Elementos DOM
const apiKeySection = document.getElementById('apiKeySection');
const chatContainer = document.getElementById('chatContainer');
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

// Prompt do sistema para o chatbot de drones
const systemPrompt = `
Você é o DroneBot, um assistente especializado em drones e tecnologia aérea. Suas características:

1. ESPECIALIZAÇÃO: Você só responde perguntas relacionadas a drones, UAVs, VANTs e tecnologia aérea
2. CONHECIMENTO: Você tem conhecimento profundo sobre:
   - Modelos e tipos de drones
   - Regulamentações e legislação (ANAC, FAA, etc.)
   - Tecnologias de voo e navegação
   - Manutenção e reparo
   - Aplicações comerciais e industriais
   - Segurança de voo
   - Fotografia e filmagem aérea
   - Componentes e eletrônica

3. LIMITAÇÕES: Se alguém perguntar sobre assuntos não relacionados a drones, responda educadamente:
   "Desculpe, eu sou especializado apenas em drones e tecnologia aérea. Posso ajudar você com alguma dúvida sobre drones?"

4. ESTILO: Seja amigável, técnico quando necessário, mas sempre didático e claro.
5. IDIOMA: Sempre responda em português brasileiro.

Agora responda à pergunta do usuário (Atenção as suas limitações):
`;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Auto-resize do textarea
    messageInput.addEventListener('input', autoResize);
    
    // Salvar API Key
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    
    // Enviar mensagem
    chatForm.addEventListener('submit', sendMessage);
    
    // Enter para enviar (Shift+Enter para nova linha)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    });
});

function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

function saveApiKey() {
    const key = apiKeyInput.value.trim();
    if (!key) {
        alert('Por favor, digite sua chave da API!');
        return;
    }
    
    apiKey = key;
    apiKeySection.style.display = 'none';
    chatContainer.style.display = 'flex';
    messageInput.focus();
}

async function sendMessage(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addUserMessage(message);
    
    // Limpar input
    messageInput.value = '';
    autoResize();
    
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    // Enviar para a API
    await sendToAPI(message);
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-user"></i>
        </div>
        <div class="message-content">
            ${escapeHtml(message)}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-helicopter"></i>
        </div>
        <div class="message-content">
            <div class="markdown-content">
                ${marked.parse(message)}
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-helicopter"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendToAPI(message) {
    isLoading = true;
    sendButton.disabled = true;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });
        
        removeTypingIndicator();
        
        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }
        
        const data = await response.json();
        const botResponse = data.choices[0].message.content || 'Desculpe, não consegui processar sua pergunta.';
        
        addBotMessage(botResponse);
        
    } catch (error) {
        console.error('Erro:', error);
        removeTypingIndicator();
        addBotMessage('❌ Ocorreu um erro ao processar sua mensagem. Verifique sua chave da API e tente novamente.');
    } finally {
        isLoading = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
