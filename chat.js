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
            // Construir contexto
            let systemContext = `Eres un experto en pensamiento libertario y economía austriaca. Respondes preguntas sobre:
- Libertarianismo y anarcocapitalismo
- Autores: Ludwig von Mises, Friedrich Hayek, Murray Rothbard, Frédéric Bastiat
- Principios: no agresión, propiedad privada, libre mercado
- Crítica al estatismo y planificación central

Responde en español, de forma educativa y concisa (máximo 200 palabras).`;

            let fullPrompt = systemContext + "\n\n";
            
            const recent = conversationHistory.slice(-4);
            recent.forEach(msg => {
                fullPrompt += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n\n`;
            });
            
            fullPrompt += `Usuario: ${message}\nAsistente:`;

            // Usar API de Together AI (gratuita, sin CORS, sin API key necesaria)
            const response = await fetch('https://api.together.xyz/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistralai/Mistral-7B-Instruct-v0.1',
                    prompt: fullPrompt,
                    max_tokens: 400,
                    temperature: 0.7,
                    top_p: 0.9,
                    stop: ['Usuario:', '\n\n\n']
                })
            });

            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            if (!response.ok) {
                // Si falla Together, usar respuesta local predefinida
                throw new Error(`API no disponible`);
            }

            const data = await response.json();
            let assistantMessage = data.choices?.[0]?.text || '';

            if (!assistantMessage || assistantMessage.length < 10) {
                // Fallback a respuestas predefinidas
                assistantMessage = getLocalResponse(message);
            } else {
                assistantMessage = cleanResponse(assistantMessage);
            }

            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: assistantMessage });

            if (conversationHistory.length > 16) {
                conversationHistory = conversationHistory.slice(-16);
            }

            addMessage(assistantMessage, 'assistant');

        } catch (error) {
            console.error('Error:', error);
            
            const loadingMsg = document.getElementById('loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            // Usar sistema de respuestas local como fallback
            const localResponse = getLocalResponse(userInput.value || message);
            addMessage(localResponse, 'assistant');
            
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: localResponse });

        } finally {
            sendButton.disabled = false;
            sendButton.textContent = 'Enviar';
            userInput.focus();
        }
    }

    // Sistema de respuestas locales predefinidas (fallback)
    function getLocalResponse(question) {
        const q = question.toLowerCase();
        
        // Respuestas sobre libertarianismo básico
        if (q.includes('libertarianismo') || q.includes('libertario')) {
            return 'El libertarianismo es una filosofía política que defiende la libertad individual como valor supremo. Se basa en el Principio de No Agresión (PNA): ninguna persona puede iniciar fuerza contra otra. Los libertarios creen en la propiedad privada, el libre mercado y un Estado mínimo o inexistente. Autores clave: Ludwig von Mises, Friedrich Hayek, Murray Rothbard.';
        }
        
        if (q.includes('principio') && (q.includes('agresión') || q.includes('pna'))) {
            return 'El Principio de No Agresión (PNA) es fundamental en el libertarianismo. Establece que iniciar fuerza o fraude contra otra persona o su propiedad es ilegítimo. La autodefensa es aceptable, pero la agresión no. Este principio implica que los impuestos son coerción, ya que se toman por la fuerza. El Estado viola constantemente el PNA al forzar obediencia.';
        }
        
        if (q.includes('propiedad') || q.includes('privada')) {
            return 'La propiedad privada es esencial para la libertad. Según John Locke y los libertarios, uno es dueño de sí mismo y del fruto de su trabajo. La propiedad surge cuando mezclas tu trabajo con recursos naturales. Sin propiedad privada no hay libertad real, ya que no puedes hacer planes ni acumular capital. El socialismo viola la propiedad al redistribuir por la fuerza.';
        }
        
        if (q.includes('libre mercado') || q.includes('capitalismo')) {
            return 'El libre mercado es el sistema de intercambio voluntario sin coerción gubernamental. Permite la coordinación espontánea de millones de personas mediante precios, que transmiten información sobre escasez y preferencias. El mercado libre genera prosperidad, innovación y eficiencia. La intervención estatal distorsiona precios, crea escasez y privilegios. Autores: Mises, Hayek.';
        }
        
        if (q.includes('estado') || q.includes('gobierno')) {
            return 'Los libertarios ven al Estado como monopolio de la fuerza. Los minarquistas defienden un Estado mínimo (solo defensa, policía, justicia). Los anarcocapitalistas como Rothbard proponen eliminar el Estado completamente, dejando todo servicio al mercado. Ambos coinciden: el Estado actual es demasiado grande, viola derechos y es ineficiente.';
        }
        
        if (q.includes('impuesto')) {
            return 'Los libertarios consideran los impuestos como robo legitimado. Te obligan a pagar bajo amenaza de cárcel, violando el Principio de No Agresión. No hay consentimiento real: no poder elegir no pagar significa coerción. Los servicios gubernamentales financiados por impuestos podrían proveerse voluntariamente en el mercado de forma más eficiente.';
        }
        
        if (q.includes('mises') || q.includes('acción humana')) {
            return 'Ludwig von Mises (1881-1973) fue economista austriaco, autor de "La Acción Humana". Desarrolló la praxeología: ciencia de la acción humana. Defendió el cálculo económico imposible bajo socialismo (no hay precios reales sin propiedad privada). Demostró que la intervención estatal causa ciclos económicos. Influencia enorme en el libertarianismo moderno.';
        }
        
        if (q.includes('hayek') || q.includes('servidumbre')) {
            return 'Friedrich Hayek (1899-1992), Premio Nobel de Economía, escribió "Camino de Servidumbre". Argumentó que la planificación económica central conduce inevitablemente al totalitarismo. Desarrolló la teoría del orden espontáneo: la sociedad se organiza sin diseño consciente. Defendió el conocimiento disperso: ningún planificador puede conocer toda la información necesaria.';
        }
        
        if (q.includes('rothbard') || q.includes('anarco')) {
            return 'Murray Rothbard (1926-1995) fue economista y filósofo político, fundador del anarcocapitalismo moderno. En "Por una Nueva Libertad" defiende la eliminación total del Estado. Argumenta que todos los servicios estatales pueden proveerse privadamente: defensa, policía, justicia, carreteras. Combina economía austriaca con derecho natural rothbardiano.';
        }
        
        if (q.includes('bastiat')) {
            return 'Frédéric Bastiat (1801-1850), economista francés, escribió "La Ley". Criticó la "expoliación legal": cuando la ley misma roba (impuestos, redistribución). Famoso por "Lo que se ve y lo que no se ve": analizar consecuencias no intencionales. Defendió el libre comercio y criticó el proteccionismo. Estilo claro y satírico.';
        }

        if (q.includes('carretera') || q.includes('quién construiría')) {
            return 'Las carreteras privadas ya existen: autopistas de peaje, caminos en comunidades privadas, estacionamientos. Históricamente muchas carreteras fueron privadas antes de ser estatizadas. El mercado tiene incentivos para construir infraestructura rentable. Los clientes pagarían directamente (peaje, suscripciones) en vez de impuestos. La pregunta no es "quién construiría" sino "quién lo haría mejor".';
        }

        if (q.includes('monopolio')) {
            return 'Los monopolios duraderos dañinos son raros en mercados libres sin privilegios estatales. Los precios altos atraen competencia. La mayoría de monopolios históricos fueron creados o protegidos por el Estado: ferrocarriles, telecomunicaciones, servicios públicos. Las barreras de entrada suelen ser regulaciones, no económicas. Un "monopolio natural" eficiente no es problema si no puede abusar (la competencia potencial lo disciplina).';
        }

        if (q.includes('pobre') || q.includes('caridad') || q.includes('bienestar')) {
            return 'Antes del Estado de bienestar existían extensas redes de ayuda mutua, sociedades fraternas, caridades religiosas. El Estado desplazó estas instituciones, no surgió por su ausencia. Las economías libres generan más riqueza, reduciendo la pobreza mejor que redistribución. El Estado de bienestar crea dependencia, desincentiva trabajo, es ineficiente (burocracia). La caridad voluntaria es más efectiva y moral.';
        }

        if (q.includes('somalia')) {
            return 'Somalia no es ni fue libertaria. Es Estado fallido por dictadura, guerra civil y tribalismo violento. El libertarianismo requiere respeto por propiedad privada, Estado de derecho, cultura de libertad. Irónicamente, Somalia mejoró en varios indicadores durante anarquía vs. dictadura previa. Ejemplos relevantes de libertad: Suiza, Singapur, Hong Kong (antes), Nueva Zelanda: más libertad económica = más prosperidad.';
        }

        if (q.includes('contamina') || q.includes('medio ambiente') || q.includes('ambiental')) {
            return 'Derechos de propiedad bien definidos son la mejor protección ambiental. Contaminar tu propiedad viola tus derechos: los afectados pueden demandar por daños. Históricamente la peor degradación ambiental ocurrió en sistemas socialistas (Chernobyl, Mar de Aral) sin propiedad privada. Las regulaciones estatales a menudo protegen grandes contaminadores con límites "permisibles". El mercado incentiva eficiencia de recursos.';
        }
        
        // Respuesta genérica
        return 'Esa es una pregunta interesante sobre libertarianismo. Te recomiendo consultar autores como Ludwig von Mises ("La Acción Humana"), Friedrich Hayek ("Camino de Servidumbre"), Murray Rothbard ("Por una Nueva Libertad") y Frédéric Bastiat ("La Ley"). También puedes revisar las secciones de este sitio web sobre pensamiento libertario, libros recomendados y respuestas a falacias comunes. ¿Hay algún aspecto específico del libertarianismo que te gustaría explorar?';
    }

    function cleanResponse(text) {
        let cleaned = text.trim();
        
        const markers = ['Usuario:', 'Asistente:', 'Pregunta:', 'Respuesta:'];
        markers.forEach(marker => {
            if (cleaned.startsWith(marker)) {
                cleaned = cleaned.substring(marker.length).trim();
            }
        });
        
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        if (cleaned.length > 1000) {
            cleaned = cleaned.substring(0, 1000) + '...';
        }
        
        return cleaned || getLocalResponse('');
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
        let formatted = text.replace(/\n/g, '<br>');
        
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        const authors = [
            'Mises', 'Hayek', 'Rothbard', 'Bastiat', 'Nozick', 
            'Hazlitt', 'Friedman', 'Rand', 'Hoppe', 'Locke',
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
    }

    console.log('Chat inicializado con sistema de respuestas locales');
});
