// Sistema de chat con IA
let apiKey = localStorage.getItem('anthropic_api_key') || '';
let conversationHistory = [];

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyButton = document.getElementById('save-key-button');

// Contexto del sistema para el asistente
const systemPrompt = `Eres un asistente experto en pensamiento libertario, filosofía política y economía austriaca. 
Tu objetivo es educar y explicar conceptos relacionados con:
- Libertarianismo y anarcocapitalismo
- Economía austriaca (Mises, Hayek, Rothbard)
- Principio de no agresión
- Derechos de propiedad privada
- Libre mercado
- Crítica al estatismo

Mantén un tono profesional, educativo y respetuoso. Usa argumentos lógicos y referencias a autores libertarios cuando sea apropiado.
Si te preguntan sobre temas no relacionados, amablemente redirige la conversación hacia el pensamiento libertario.`;

// Guardar API key
if (apiKey) {
    apiKeyInput.value = '••••••••••••';
}

saveKeyButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key && key !== '••••••••••••') {
        apiKey = key;
        localStorage.setItem('anthropic_api_key', key);
        apiKeyInput.value = '••••••••••••';
        addMessage('Sistema: API key guardada correctamente. ¡Ahora puedes empezar a chatear!', 'assistant');
    }
});

// Enviar mensaje
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    if (!apiKey || apiKey === '••••••••••••') {
        addMessage('Por favor, ingresa tu API key de Anthropic primero.', 'error');
        return;
    }

    // Añadir mensaje del usuario
    addMessage(message, 'user');
    userInput.value = '';
    sendButton.disabled = true;

    // Añadir indicador de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant-message';
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <strong>Asistente:</strong> 
            Pensando<span class="loading-indicator"></span>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();

    try {
        // Añadir mensaje a la historia
        conversationHistory.push({
            role: 'user',
            content: message
        });

        // Llamar a la API de Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                system: systemPrompt,
                messages: conversationHistory
            })
        });

        // Remover indicador de carga
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.remove();

        if (!response.ok) {
            throw new Error(`Error de API: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Añadir respuesta del asistente
        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        addMessage(assistantMessage, 'assistant');

    } catch (error) {
        console.error('Error:', error);
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.remove();
        
        addMessage(
            `Error al comunicarse con la API. Por favor verifica tu API key y conexión a internet. 
            Error: ${error.message}`,
            'error'
        );
    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    
    if (type === 'error') {
        messageDiv.className = 'error-message';
        messageDiv.textContent = content;
    } else {
        messageDiv.className = `message ${type}-message`;
        const label = type === 'user' ? 'Tú' : 'Asistente';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${label}:</strong> ${formatMessage(content)}
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessage(text) {
    // Convertir saltos de línea a <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Convertir URLs a enlaces
    formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return formatted;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
