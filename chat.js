// Esperar a que Puter.js esté cargado
document.addEventListener('DOMContentLoaded', function() {
    
    let conversationHistory = [];

    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearButton = document.getElementById('clear-button');

    if (!chatMessages || !userInput || !sendButton) {
        console.error('Error: No se encontraron los elementos del chat');
        return;
    }

    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    if (clearButton) {
        clearButton.addEventListener('click', clearConversation);
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        
        if (!message) {
            return;
        }

        console.log('Enviando mensaje:', message);

        addMessage(message, 'user');
        userInput.value = '';
        sendButton.disabled = true;
        sendButton.textContent = 'Enviando...';

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
            // Construir el contexto de la conversación
            let fullContext = `Eres un experto en pensamiento libertario, economía austriaca y filosofía política libertaria.

Principios clave que defiendes:
- Libertad individual y propiedad privada
- Principio de no agresión (PNA)
- Libre mercado y capitalismo
- Crítica al estatismo y planificación central
- Autores: Ludwig von Mises, Friedrich Hayek, Murray Rothbard, Frédéric Bastiat

Responde en español de forma educativa, concisa (máximo 250 palabras) y argumentada.

`;

            // Añadir historial reciente
            const recent = conversationHistory.slice(-6);
            recent.forEach(msg => {
                fullContext += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
            });
            
            fullContext += `\nUsuario: ${message}\nAsistente:`;

            console.log('Llamando a Puter AI...');

            // Usar Puter.js para llamar a GPT (GRATIS, SIN CORS)
            const response = await puter.ai.chat(fullContext, {
                model: "gpt-4o-mini" // Modelo gratuito y potente
            });

            console.log('Respuesta recibida:', response);

            // Remover indicador de carga
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            let assistantMessage = response;

            if (!assistantMessage || assistantMessage.length < 10) {
                throw new Error('Respuesta vacía');
            }

            // Limpiar respuesta
            assistantMessage = cleanResponse(assistantMessage);

            // Guardar en historial
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: assistantMessage });

            // Limitar historial a últimas 10 interacciones
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }

            addMessage(assistantMessage, 'assistant');

        } catch (error) {
            console.error('Error completo:', error);
            
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }
            
            addMessage(
                `❌ Error al comunicarse con la IA: ${error.message}. Por favor, intenta de nuevo.`,
                'error'
            );
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = 'Enviar';
            userInput.focus();
        }
    }

    function cleanResponse(text) {
        let cleaned = text.trim();
        
        // Remover marcadores si aparecen
        const markers = ['Usuario:', 'Asistente:', 'Pregunta:', 'Respuesta:'];
        markers.forEach(marker => {
            if (cleaned.startsWith(marker)) {
                cleaned = cleaned.substring(marker.length).trim();
            }
        });
        
        // Remover líneas vacías extras
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        // Limitar longitud máxima
        if (cleaned.length > 1500) {
            cleaned = cleaned.substring(0, 1500) + '...';
        }
        
        return cleaned;
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
        // Convertir saltos de línea
        let formatted = text.replace(/\n/g, '<br>');
        
        // Convertir URLs
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Resaltar nombres de autores libertarios
        const authors = [
            'Mises', 'Hayek', 'Rothbard', 'Bastiat', 'Nozick', 
            'Hazlitt', 'Friedman', 'Rand', 'Hoppe', 'Locke', 'Spooner',
            'Ludwig von Mises', 'Friedrich Hayek', 'Murray Rothbard', 'John Locke'
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

    function clearConversation() {
        conversationHistory = [];
        chatMessages.innerHTML = `
            <div class="message assistant-message">
                <div class="message-content">
                    <strong>Asistente:</strong> ¡Conversación reiniciada! Pregúntame sobre libertarianismo, economía austriaca, libre mercado, o filosofía política libertaria. ¿En qué puedo ayudarte?
                </div>
            </div>
        `;
        console.log('Conversación limpiada');
    }

    console.log('Chat inicializado con Puter.js');
});
