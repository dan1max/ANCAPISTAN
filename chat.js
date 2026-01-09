// Esperar a que el DOM esté completamente cargado
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
            // Construir los mensajes en formato correcto para Puter
            const messages = [
                {
                    role: "system",
                    content: `Eres un experto en pensamiento libertario, economía austriaca y filosofía política libertaria.

Principios clave que defiendes:
- Libertad individual y propiedad privada
- Principio de no agresión (PNA)
- Libre mercado y capitalismo laissez-faire
- Crítica al estatismo y planificación central
- Autores clave: Ludwig von Mises, Friedrich Hayek, Murray Rothbard, Frédéric Bastiat

Responde en español de forma educativa, concisa (200-300 palabras máximo) y bien argumentada.`
                }
            ];

            // Añadir historial reciente de conversación
            conversationHistory.forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            });

            // Añadir mensaje actual del usuario
            messages.push({
                role: "user",
                content: message
            });

            console.log('Llamando a Puter AI con mensajes:', messages);

            // Usar Puter.js correctamente
            const response = await puter.ai.chat(messages);

            console.log('Respuesta recibida (tipo):', typeof response);
            console.log('Respuesta recibida (completa):', response);

            // Remover indicador de carga
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            // Extraer el texto de la respuesta correctamente
            let assistantMessage = '';
            
            if (typeof response === 'string') {
                assistantMessage = response;
            } else if (response && response.message) {
                assistantMessage = response.message;
            } else if (response && response.text) {
                assistantMessage = response.text;
            } else if (response && response.content) {
                assistantMessage = response.content;
            } else if (response && typeof response === 'object') {
                // Si es un objeto, intentar convertirlo a string
                assistantMessage = JSON.stringify(response);
            }

            console.log('Mensaje extraído:', assistantMessage);

            if (!assistantMessage || assistantMessage.length < 5) {
                throw new Error('Respuesta vacía o inválida');
            }

            // Limpiar respuesta (ahora sí podemos usar trim)
            assistantMessage = String(assistantMessage).trim();

            // Guardar en historial
            conversationHistory.push({ 
                role: 'user', 
                content: message 
            });
            conversationHistory.push({ 
                role: 'assistant', 
                content: assistantMessage 
            });

            // Limitar historial a últimas 6 interacciones (12 mensajes)
            if (conversationHistory.length > 12) {
                conversationHistory = conversationHistory.slice(-12);
            }

            addMessage(assistantMessage, 'assistant');

        } catch (error) {
            console.error('Error completo:', error);
            console.error('Stack:', error.stack);
            
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }
            
            addMessage(
                `❌ Error: ${error.message || 'No se pudo conectar con la IA'}. Por favor, recarga la página e intenta de nuevo.`,
                'error'
            );
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = 'Enviar';
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
            
            // Asegurar que content es string
            const textContent = String(content);
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <strong>${label}:</strong> ${formatMessage(textContent)}
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function formatMessage(text) {
        // Asegurar que es string
        const str = String(text);
        
        // Convertir saltos de línea
        let formatted = str.replace(/\n/g, '<br>');
        
        // Convertir URLs
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Resaltar nombres de autores libertarios
        const authors = [
            'Mises', 'Hayek', 'Rothbard', 'Bastiat', 'Nozick', 
            'Hazlitt', 'Friedman', 'Rand', 'Hoppe', 'Locke', 'Spooner',
            'Ludwig von Mises', 'Friedrich Hayek', 'Murray Rothbard', 
            'Frédéric Bastiat', 'Robert Nozick', 'Henry Hazlitt'
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

    console.log('Chat inicializado correctamente con Puter.js');
});
