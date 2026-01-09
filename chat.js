// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Sistema de chat con IA usando Hugging Face (GRATUITO)
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

    // Contexto del sistema para el asistente
    const systemPrompt = `Eres un asistente experto en pensamiento libertario y economía austriaca. 
Respondes preguntas sobre libertarianismo, anarcocapitalismo, libre mercado y filosofía política libertaria.
Autores clave: Ludwig von Mises, Friedrich Hayek, Murray Rothbard, Frédéric Bastiat.
Mantén respuestas concisas (máximo 200 palabras), educativas y en español.
Principios clave: no agresión, propiedad privada, libre mercado, crítica al estatismo.`;

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
            // Construir el prompt con contexto
            let fullPrompt = systemPrompt + "\n\n";
            
            // Añadir las últimas 3 interacciones del historial
            const recentHistory = conversationHistory.slice(-6);
            recentHistory.forEach(msg => {
                if (msg.role === 'user') {
                    fullPrompt += `Pregunta: ${msg.content}\n`;
                } else {
                    fullPrompt += `Respuesta: ${msg.content}\n\n`;
                }
            });
            
            fullPrompt += `Pregunta: ${message}\nRespuesta:`;

            console.log('Llamando a la API...');

            // Llamar a la API de Hugging Face
            const response = await fetch(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        inputs: fullPrompt,
                        parameters: {
                            max_new_tokens: 400,
                            temperature: 0.7,
                            top_p: 0.95,
                            do_sample: true,
                            return_full_text: false
                        }
                    })
                }
            );

            console.log('Respuesta recibida:', response.status);

            // Remover indicador de carga
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            if (!response.ok) {
                // Si el modelo está cargando (error 503)
                if (response.status === 503) {
                    const errorData = await response.json();
                    console.log('Modelo cargando:', errorData);
                    
                    addMessage(
                        '⏳ El modelo de IA se está iniciando (esto solo ocurre la primera vez). Por favor, espera 20-30 segundos y vuelve a enviar tu pregunta.',
                        'error'
                    );
                    sendButton.disabled = false;
                    sendButton.textContent = 'Enviar';
                    return;
                }
                throw new Error(`Error de API: ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);

            let assistantMessage = '';

            // Procesar la respuesta
            if (Array.isArray(data) && data.length > 0) {
                if (data[0].generated_text) {
                    assistantMessage = data[0].generated_text;
                } else if (typeof data[0] === 'string') {
                    assistantMessage = data[0];
                }
            } else if (data.generated_text) {
                assistantMessage = data.generated_text;
            } else if (typeof data === 'string') {
                assistantMessage = data;
            }

            if (!assistantMessage) {
                throw new Error('No se recibió respuesta del modelo');
            }

            // Limpiar la respuesta
            assistantMessage = cleanResponse(assistantMessage);

            console.log('Respuesta limpia:', assistantMessage);

            // Guardar en historial
            conversationHistory.push({
                role: 'user',
                content: message
            });
            conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

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
                `❌ Error al comunicarse con la IA. ${error.message}. Por favor, intenta de nuevo en unos momentos.`,
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
        
        // Remover el prompt si se repitió
        const promptMarkers = ['Pregunta:', 'Respuesta:', systemPrompt];
        promptMarkers.forEach(marker => {
            if (cleaned.includes(marker)) {
                const parts = cleaned.split(marker);
                cleaned = parts[parts.length - 1].trim();
            }
        });
        
        // Remover líneas vacías extras
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        // Si es muy corto, dar respuesta por defecto
        if (cleaned.length < 20) {
            cleaned = "Disculpa, no pude generar una respuesta adecuada. ¿Podrías reformular tu pregunta sobre libertarianismo o economía austriaca?";
        }
        
        // Limitar longitud
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
        // Convertir saltos de línea a <br>
        let formatted = text.replace(/\n/g, '<br>');
        
        // Convertir URLs a enlaces
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Resaltar nombres de autores libertarios
        const authors = [
            'Mises', 'Hayek', 'Rothbard', 'Bastiat', 'Nozick', 
            'Hazlitt', 'Friedman', 'Rand', 'Hoppe', 'Spooner',
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
                    <strong>Asistente:</strong> ¡Conversación reiniciada! Soy un asistente especializado en pensamiento libertario. 
                    Puedo ayudarte a entender conceptos de libertarianismo, economía austriaca, y responder tus 
                    preguntas sobre filosofía política. ¿En qué puedo ayudarte?
                </div>
            </div>
        `;
        console.log('Conversación limpiada');
    }

    console.log('Chat inicializado correctamente');
});
