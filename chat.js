// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Sistema de chat con IA usando API gratuita
    let conversationHistory = [];

    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearButton = document.getElementById('clear-button');

    // Verificar que todos los elementos existen
    if (!chatMessages || !userInput || !sendButton) {
        console.error('Error: No se encontraron los elementos del chat');
        return;
    }

    // Event listeners
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

        // Añadir mensaje del usuario
        addMessage(message, 'user');
        userInput.value = '';
        sendButton.disabled = true;
        sendButton.textContent = 'Enviando...';

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
            // Construir contexto de la conversación
            let context = "Eres un experto en libertarianismo y economía austriaca. Respondes en español de forma concisa y educativa sobre: libre mercado, propiedad privada, no agresión, crítica al estatismo. Autores: Mises, Hayek, Rothbard, Bastiat.\n\n";
            
            // Añadir últimas 3 interacciones
            const recent = conversationHistory.slice(-6);
            recent.forEach(msg => {
                if (msg.role === 'user') {
                    context += `Pregunta: ${msg.content}\n`;
                } else {
                    context += `Respuesta: ${msg.content}\n\n`;
                }
            });
            
            context += `Pregunta: ${message}\nRespuesta:`;

            console.log('Llamando a la API con proxy CORS...');

            // Usar proxy CORS + API gratuita de Hugging Face
            const response = await fetch("https://corsproxy.io/?" + encodeURIComponent(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
            ), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: context,
                    parameters: {
                        max_new_tokens: 350,
                        temperature: 0.7,
                        top_p: 0.9,
                        do_sample: true,
                        return_full_text: false
                    }
                })
            });

            console.log('Respuesta recibida:', response.status);

            // Remover indicador de carga
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            if (!response.ok) {
                if (response.status === 503) {
                    addMessage(
                        '⏳ El modelo de IA se está iniciando. Por favor, espera 20-30 segundos y vuelve a enviar tu pregunta.',
                        'error'
                    );
                    sendButton.disabled = false;
                    sendButton.textContent = 'Enviar';
                    return;
                }
                throw new Error(`Error ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos:', data);

            let assistantMessage = '';

            // Extraer respuesta
            if (Array.isArray(data) && data.length > 0) {
                assistantMessage = data[0].generated_text || data[0];
            } else if (data.generated_text) {
                assistantMessage = data.generated_text;
            } else if (typeof data === 'string') {
                assistantMessage = data;
            }

            if (!assistantMessage || assistantMessage.length < 10) {
                throw new Error('Respuesta vacía o muy corta');
            }

            // Limpiar respuesta
            assistantMessage = cleanResponse(assistantMessage);

            // Guardar historial
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: assistantMessage });

            // Limitar historial
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }

            addMessage(assistantMessage, 'assistant');

        } catch (error) {
            console.error('Error:', error);
            
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }
            
            addMessage(
                `❌ No se pudo conectar con la IA. Intenta de nuevo en unos momentos. Si el problema persiste, el servicio podría estar temporalmente no disponible.`,
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
        
        // Remover marcadores de prompt
        const markers = ['Pregunta:', 'Respuesta:', 'Usuario:', 'Asistente:'];
        markers.forEach(marker => {
            const index = cleaned.lastIndexOf(marker);
            if (index !== -1) {
                cleaned = cleaned.substring(index + marker.length).trim();
            }
        });
        
        // Remover líneas vacías extras
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        // Si está vacío o muy corto
        if (cleaned.length < 20) {
            cleaned = "Entiendo tu pregunta sobre libertarianismo. ¿Podrías ser más específico? Por ejemplo, puedes preguntar sobre: el principio de no agresión, la propiedad privada, el libre mercado, o autores como Mises y Rothbard.";
        }
        
        // Limitar longitud máxima
        if (cleaned.length > 1200) {
            cleaned = cleaned.substring(0, 1200) + '...';
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
        
        // Resaltar autores libertarios
        const authors = [
            'Mises', 'Hayek', 'Rothbard', 'Bastiat', 'Nozick', 
            'Hazlitt', 'Friedman', 'Rand', 'Hoppe',
            'Ludwig von Mises', 'Friedrich Hayek', 'Murray Rothbard'
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
    }

    console.log('Chat inicializado correctamente');
});
