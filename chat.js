// Sistema de chat con IA usando Hugging Face (GRATUITO)
let conversationHistory = [];

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Ocultar la sección de API key ya que no la necesitamos
const apiKeyNotice = document.querySelector('.api-key-notice');
if (apiKeyNotice) {
    apiKeyNotice.style.display = 'none';
}

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
Responde de forma concisa pero completa. Si te preguntan sobre temas no relacionados, amablemente redirige la conversación hacia el pensamiento libertario.

IMPORTANTE: Responde siempre en español y mantén las respuestas entre 100-300 palabras para que sean claras y directas.`;

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
        // Construir el prompt completo con contexto
        let fullPrompt = systemPrompt + "\n\n";
        
        // Añadir historial de conversación
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                fullPrompt += `Usuario: ${msg.content}\n\n`;
            } else {
                fullPrompt += `Asistente: ${msg.content}\n\n`;
            }
        });
        
        fullPrompt += `Usuario: ${message}\n\nAsistente:`;

        // Llamar a la API de Hugging Face (GRATUITA)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: fullPrompt,
                    parameters: {
                        max_new_tokens: 500,
                        temperature: 0.7,
                        top_p: 0.9,
                        return_full_text: false
                    }
                })
            }
        );

        // Remover indicador de carga
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.remove();

        if (!response.ok) {
            // Si el modelo está cargando, esperar y reintentar
            if (response.status === 503) {
                const data = await response.json();
                if (data.error && data.error.includes('loading')) {
                    addMessage(
                        'El modelo de IA se está iniciando, por favor espera unos 20 segundos y vuelve a intentarlo.',
                        'error'
                    );
                    sendButton.disabled = false;
                    return;
                }
            }
            throw new Error(`Error de API: ${response.status}`);
        }

        const data = await response.json();
        let assistantMessage = '';

        if (Array.isArray(data) && data[0].generated_text) {
            assistantMessage = data[0].generated_text.trim();
        } else if (data.generated_text) {
            assistantMessage = data.generated_text.trim();
        } else {
            throw new Error('Formato de respuesta inesperado');
        }

        // Limpiar la respuesta (eliminar repeticiones del prompt)
        assistantMessage = cleanResponse(assistantMessage);

        // Añadir a la historia
        conversationHistory.push({
            role: 'user',
            content: message
        });
        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        // Limitar historial a últimas 6 interacciones para no saturar
        if (conversationHistory.length > 12) {
            conversationHistory = conversationHistory.slice(-12);
        }

        addMessage(assistantMessage, 'assistant');

    } catch (error) {
        console.error('Error:', error);
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.remove();
        
        addMessage(
            `Error al comunicarse con la IA. Por favor intenta de nuevo en unos momentos. 
            Error: ${error.message}`,
            'error'
        );
    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

function cleanResponse(text) {
    // Eliminar posibles repeticiones del prompt
    let cleaned = text;
    
    // Remover "Usuario:" o "Asistente:" que puedan aparecer
    cleaned = cleaned.replace(/^(Usuario:|Asistente:)\s*/gi, '');
    
    // Remover líneas vacías extras
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Si la respuesta es muy corta o vacía, dar una respuesta por defecto
    if (cleaned.length < 10) {
        cleaned = "Disculpa, no pude generar una respuesta adecuada. ¿Podrías reformular tu pregunta?";
    }
    
    return cleaned.trim();
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
    
    // Resaltar referencias a autores libertarios
    const authors = [
        'Mises', 'Hayek', 'Rothbard', 'Bastiat', 'Nozick', 
        'Hazlitt', 'Friedman', 'Rand', 'Hoppe', 'Spooner'
    ];
    
    authors.forEach(author => {
        const regex = new RegExp(`\\b(${author})\\b`, 'gi');
        formatted = formatted.replace(regex, '<em>$1</em>');
    });
    
    return formatted;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Limpiar conversación (botón opcional)
function clearConversation() {
    conversationHistory = [];
    chatMessages.innerHTML = `
        <div class="message assistant-message">
            <div class="message-content">
                <strong>Asistente:</strong> ¡Hola! Soy un asistente especializado en pensamiento libertario. 
                Puedo ayudarte a entender conceptos de libertarianismo, economía austriaca, y responder tus 
                preguntas sobre filosofía política. ¿En qué puedo ayudarte?
            </div>
        </div>
    `;
}
