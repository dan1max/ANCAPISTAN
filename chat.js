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

            conversationHistory.forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            });

            messages.push({
                role: "user",
                content: message
            });

            console.log('Llamando a Puter AI...');

            const response = await puter.ai.chat(messages);

            console.log('Respuesta completa:', response);

            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            let assistantMessage = '';
            
            if (typeof response === 'string') {
                assistantMessage = response;
            } else if (response && typeof response === 'object') {
                if (response.message && typeof response.message === 'string') {
                    assistantMessage = response.message;
                } else if (response.message && response.message.content) {
                    assistantMessage = response.message.content;
                } else if (response.text) {
                    assistantMessage = response.text;
                } else if (response.content) {
                    assistantMessage = response.content;
                } else if (response.choices && response.choices[0]) {
                    assistantMessage = response.choices[0].message?.content || 
                                     response.choices[0].text || '';
                } else {
                    console.warn('Formato de respuesta no reconocido:', response);
                    assistantMessage = JSON.stringify(response);
                }
            }

            console.log('Mensaje extraído:', assistantMessage);

            if (!assistantMessage || (typeof assistantMessage === 'string' && assistantMessage.trim().length < 3)) {
                throw new Error('Respuesta vacía o inválida de la IA');
            }

            assistantMessage = String(assistantMessage).trim();

            conversationHistory.push({ 
                role: 'user', 
                content: message 
            });
            conversationHistory.push({ 
                role: 'assistant', 
                content: assistantMessage 
            });

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
            
            let errorMsg = '❌ Error al comunicarse con la IA.';
            
            if (error.message.includes('not defined')) {
                errorMsg += ' Puter.js no está cargado correctamente. Por favor, recarga la página.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMsg += ' Problema de conexión. Verifica tu internet.';
            } else {
                errorMsg += ` Detalles: ${error.message}`;
            }
            
            addMessage(errorMsg, 'error');
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
        const str = String(text);
        
        let formatted = str.replace(/\n/g, '<br>');
        
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
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
