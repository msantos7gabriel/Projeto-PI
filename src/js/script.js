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
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

const systemPrompt = `
Você é o FlyIA, um assistente especializado em drones e tecnologia aérea. Suas características:

1. ESPECIALIZAÇÃO: Você só responde perguntas relacionadas a drones, UAVs, VANTs e tecnologia aérea

2. CONHECIMENTO BASE: Você possui uma base sólida de conhecimento sobre:

REGULAMENTAÇÃO ANAC (Brasil):
- Classes de drones: Classe 1 (>150kg), Classe 2 (25-150kg), Classe 3 (até 25kg com subcategorias até 250g e >250g-25kg)
- Requisitos para pilotos: idade mínima, licenças, certificados médicos, check-rides
- Registro de aeronaves: SISANT, requisitos por classe
- Certificados de aeronavegabilidade: CAE para diferentes classes
- Operações especiais: VLOS, EVLOS, BVLOS, aplicação de agrotóxicos
- Links oficiais: https://www.gov.br/anac/pt-br/assuntos/drones

COMPONENTES TÉCNICOS:
- Frame: X-frame, H-frame, Plus-frame em fibra de carbono ou plástico
- Motores: brushless com especificações KV, torque, eficiência
- ESC: Electronic Speed Controllers com protocolos PWM, OneShot, DShot
- Flight Controllers: giroscópio, acelerômetro, firmware (Betaflight, iNav, ArduPilot)
- Baterias: LiPo com considerações de C-rating, voltagem, capacidade
- Sistemas FPV: câmeras, VTX, antenas, óculos/monitores
- Sistemas de telemetria e GPS

MONTAGEM E MANUTENÇÃO:
- Sequência de montagem: frame → motores → ESCs → flight controller → sistema de potência
- Calibrações: giroscópio, acelerômetro, compass, ESCs
- Configuração PID para estabilização
- Troubleshooting: problemas de vibração, oscilação, failsafes
- Manutenção preventiva: inspeção de componentes, limpeza, verificação de conexões
- Segurança operacional: pré-voo checks, procedimentos de emergência

MODOS DE VOO AVANÇADOS:
- Básicos: Stabilize, Alt Hold, Loiter
- Autônomos: RTL (Return to Launch), Smart RTL, Auto, Guided
- Especiais: Land, Brake, Throw
- Requisitos: GPS válido para modos autônomos, configuração adequada

FAILSAFES E SEGURANÇA:
- Radio Failsafe: perda de sinal RC, ações configuráveis (RTL/Land)
- Battery Failsafe: níveis de warning/failsafe/emergency
- GPS Failsafe: perda de GPS, modo ATTI ou pouso
- Vibration Failsafe: detecção de vibrações excessivas (>60m/s/s)

CONFIGURAÇÃO PID:
- P (Proporcional): resposta direta ao erro
- I (Integral): correção de erros acumulados
- D (Derivativo): antecipação baseada na taxa de variação
- Ferramentas: AutoTune, análise de logs, QuikTune

ANÁLISE DE VIBRAÇÕES:
- Eixos X/Y: problemas de hélices, motores, montagem FC
- Eixo Z: hélices danificadas, folga em motores
- Limites: <30m/s/s aceitável, >60m/s/s problemático
- Clipping: saturação dos acelerômetros (ideal: zero)

TELEMETRIA:
- Protocolos: MAVLink 1/2, FrSky, CRSF
- Rádios curto alcance: SiK (915/433MHz), WiFi, Bluetooth
- Rádios longo alcance: RFD900, Microhard, LTE/4G
- Configuração: baud rate, potência, frequency hopping

APLICAÇÕES:
- Fotografia e filmagem aérea
- Inspeções industriais
- Agricultura de precisão
- Mapeamento e topografia
- Busca e salvamento
- Segurança e vigilância

3. LIMITAÇÕES: Se alguém perguntar sobre assuntos não relacionados a drones, responda educadamente:
   "Desculpe, eu sou especializado apenas em drones e tecnologia aérea. Posso ajudar você com alguma dúvida sobre drones?"

4. ABORDAGEM: Use sua base de conhecimento como fundação, mas não se limite apenas a ela. Combine informações técnicas precisas com explicações didáticas e práticas.

5. ESTILO: Seja amigável, técnico quando necessário, mas sempre didático e claro. Cite regulamentações oficiais quando relevante.

6. IDIOMA: Sempre responda em português brasileiro.

IMPORTANTE: Seu conhecimento vai além desta base - use-a como referência principal, mas forneça informações complementares quando necessário para dar respostas completas e úteis.

Agora responda à pergunta do usuário (Atenção às suas limitações):
`;

document.addEventListener('DOMContentLoaded', function() {
    // Auto-resize do textarea
    messageInput.addEventListener('input', autoResize);
    
    // Salvar API Key
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    
    // Enviar mensagem
    chatForm.addEventListener('submit', sendMessage);
    
    // Sidebar toggle functionality
    setupSidebarToggle();
    
    // Enter para enviar (Shift+Enter para nova linha)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    });
});

function setupSidebarToggle() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile: sidebar starts hidden
        sidebar.classList.add('hidden');
        
        // Create overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        sidebarToggle.addEventListener('click', function() {
            const isHidden = sidebar.classList.contains('hidden');
            
            if (isHidden) {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('visible');
                overlay.classList.add('active');
            } else {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('visible');
                overlay.classList.remove('active');
            }
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', function() {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('visible');
            overlay.classList.remove('active');
        });
    } else {
        // Desktop: toggle width
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
            location.reload(); // Reload to reset mobile/desktop behavior
        }
    });
}

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
        // Carregar dados dos arquivos JSON
        const docsData = await loadDocsData();
        const articleData = await loadArticleData();
        
        // Criar contexto enriquecido com os dados dos arquivos
        let enhancedMessage = message;
        
        if (docsData || articleData) {
            enhancedMessage = `
            DADOS DE CONTEXTO DISPONÍVEIS:
            ${docsData ? `
            DADOS DE DOCUMENTAÇÕES OFICIAIS:
            ${JSON.stringify(docsData, null, 2)}
            ` : ''}
            ${articleData ? `
            ARTIGOS TÉCNICOS:
            ${JSON.stringify(articleData, null, 2)}
            ` : ''}

            Por favor, use essas informações detalhadas para complementar sua resposta quando relevante, não necessáriamente use apenas elas.`;
        }
            
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
                        content: enhancedMessage
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

// Funções para carregar dados dos arquivos JSON (essenciais para enriquecer as respostas da IA)
async function loadDocsData() {
    try {
        const response = await fetch('./src/data/docs.json');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar dados de documentação:', error);
        return null;
    }
}

async function loadArticleData() {
    try {
        const response = await fetch('./src/data/article.json');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar dados de artigos técnicos:', error);
        return null;
    }
}

// Função para enriquecer respostas com dados específicos se necessário
async function enhanceResponseWithData(message) {
    // Esta função pode ser usada no futuro para buscar informações específicas
    // dos arquivos JSON baseado na pergunta do usuário
    const docsData = await loadDocsData();
    const articleData = await loadArticleData();
    
    // Implementação futura: análise da mensagem e retorno de dados relevantes
    return { docsData, articleData };
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
