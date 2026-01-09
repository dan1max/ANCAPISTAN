// ========================================
// ARCHIVO: curiosidades.js
// ========================================
// Datos curiosos sobre libertarianismo

document.addEventListener('DOMContentLoaded', function() {
    
    console.log('Iniciando carga de curiosidades...');
    
    // Base de datos de curiosidades
    const curiosities = [
        {
            icon: '🔥',
            title: 'Mises vs. Chicago: "¡Todos son socialistas!"',
            content: 'En una famosa reunión de la Sociedad Mont Pelerin en 1947, Ludwig von Mises se levantó furioso y gritó "¡Ustedes son todos un montón de socialistas!" dirigiéndose a los economistas de Chicago como Milton Friedman y George Stigler. Mises consideraba que cualquier intervención estatal, por mínima que fuera, era inaceptable. Se marchó indignado de la sala, dejando a todos atónitos. Esta anécdota ejemplifica la intransigencia de Mises con los principios del laissez-faire puro.',
            category: 'anécdota'
        },
        {
            icon: '⚖️',
            title: 'Coolidge: Presidente jurado por su padre',
            content: 'Cuando el presidente Warren Harding murió repentinamente en 1923, Calvin Coolidge se encontraba de vacaciones en Vermont sin electricidad. A las 2:47 AM, su padre, un notario público, le tomó juramento como presidente en la sala de estar de su casa, a la luz de una lámpara de queroseno. Coolidge, conocido por su defensa del gobierno limitado, dijo: "El negocio de Estados Unidos son los negocios" y redujo drásticamente el gasto federal.',
            category: 'historia'
        },
        {
            icon: '📚',
            title: 'Rothbard escribió 24 libros sin computadora',
            content: 'Murray Rothbard escribió más de 24 libros y miles de artículos usando únicamente una máquina de escribir manual. Rechazaba las computadoras por considerarlas innecesarias. Su obra "Man, Economy, and State" de 1,000 páginas fue escrita completamente a máquina sin errores significativos. Cuando le preguntaron por qué no usaba ordenadores, respondió: "¿Para qué? Mi máquina de escribir funciona perfectamente."',
            category: 'anécdota'
        },
        {
            icon: '🎓',
            title: 'Hayek ganó el Nobel... ¡y lo criticó!',
            content: 'Friedrich Hayek ganó el Premio Nobel de Economía en 1974, pero en su discurso de aceptación criticó la existencia misma del premio. Argumentó que el Nobel le daba a los economistas una autoridad inmerecida sobre temas donde no existe consenso científico. Dijo: "Si hubiera sido consultado sobre la creación del Premio Nobel en Economía, habría aconsejado encarecidamente en contra." Una postura muy libertaria: rechazar el prestigio estatal.',
            category: 'filosofía'
        },
        {
            icon: '💰',
            title: 'El impuesto sobre la renta era "temporal"',
            content: 'Cuando Estados Unidos introdujo el impuesto federal sobre la renta en 1913, se prometió que sería temporal y solo afectaría al 1% más rico, con una tasa máxima del 7%. Los defensores aseguraron que nunca superaría el 10%. En 1918, solo 5 años después, la tasa máxima era del 77%. Para 1944 alcanzó el 94%. Los libertarios usan esto como ejemplo perfecto de cómo "lo temporal en el gobierno es lo más permanente que existe."',
            category: 'economía'
        },
        {
            icon: '🗣️',
            title: 'Bastiat escribió sobre "lo que se ve y lo que no se ve"',
            content: 'Frédéric Bastiat revolucionó la economía con su parábola de la "ventana rota" en 1850. Demostró que destruir una ventana no beneficia la economía, porque el dinero gastado en repararla se habría usado en algo productivo. Este concepto de "costes de oportunidad" anticipó la economía moderna. Su ensayo "Lo que se ve y lo que no se ve" es la crítica más elegante al keynesianismo... ¡escrita 86 años antes de Keynes!',
            category: 'economía'
        },
        {
            icon: '🏛️',
            title: 'Lysander Spooner desafió al monopolio postal',
            content: 'En 1844, Lysander Spooner creó la "American Letter Mail Company" para competir con el servicio postal del gobierno estadounidense. Sus tarifas eran la mitad que las del gobierno y el servicio era más rápido. En solo 5 meses forzó al gobierno a bajar sus precios a la mitad. El gobierno, en lugar de competir, simplemente declaró ilegal la empresa de Spooner en 1851. Spooner luego escribió "No Treason", argumentando que la Constitución no tenía autoridad legítima.',
            category: 'historia'
        },
        {
            icon: '🎪',
            title: 'Rand escribió Atlas Shrugged fumando en cadena',
            content: 'Ayn Rand escribió "Atlas Shrugged" (La Rebelión de Atlas) en un maratón de 12 años, trabajando hasta 30 horas seguidas fumando cigarrillos constantemente. Tomaba anfetaminas para mantenerse despierta. El manuscrito original tenía más de 1,200 páginas. Cuando su editor sugirió recortes, Rand respondió: "¿Le pedirías a Dios que recortara la Biblia?" La novela vendió más de 30 millones de copias y sigue vendiendo 100,000 al año.',
            category: 'anécdota'
        },
        {
            icon: '📉',
            title: 'La Gran Depresión que nunca fue',
            content: 'En 1920-21, Estados Unidos sufrió una depresión peor que la de 1929: desempleo del 12%, producción cayó 30%, los precios bajaron 40%. Pero el gobierno NO intervino. El presidente Harding recortó impuestos y gasto federal a la mitad. ¿Resultado? La economía se recuperó en 18 meses, sin estímulos fiscales ni banco central. Los austriacos usan este caso como prueba de que las intervenciones prolongan las crisis, no las resuelven.',
            category: 'economía'
        },
        {
            icon: '🇨🇭',
            title: 'Suiza: 700 años sin guerra ofensiva',
            content: 'Suiza no ha participado en una guerra ofensiva desde 1515. Su modelo de neutralidad armada, federalismo extremo y democracia directa es un ejemplo libertario de defensa sin imperialismo. Cada cantón tiene autonomía fiscal, los ciudadanos votan 4 veces al año sobre leyes específicas, y el 25% de la población posee armas de fuego legalmente. Su PIB per cápita es el tercero más alto del mundo. Bastiat dijo: "Cuando los bienes no cruzan fronteras, los soldados sí."',
            category: 'política'
        },
        {
            icon: '🚫',
            title: 'Prohibición: el experimento fallido del gobierno',
            content: 'La Prohibición del alcohol en EE.UU (1920-1933) pretendía eliminar el alcoholismo. En cambio, el consumo aumentó, surgieron mafias violentas (Al Capone), murieron miles por alcohol adulterado, y se llenaron las cárceles. El gobierno perdió billones en impuestos y gastó millones persiguiendo a bebedores. Cuando se derogó en 1933, el crimen organizado colapsó instantáneamente. Los libertarios lo usan como evidencia perfecta del fracaso de las prohibiciones.',
            category: 'historia'
        },
        {
            icon: '💡',
            title: 'Mises predijo el colapso soviético en 1920',
            content: 'En su artículo "Economic Calculation in the Socialist Commonwealth" (1920), Ludwig von Mises demostró matemáticamente que el socialismo era imposible porque sin precios de mercado no existe forma racional de asignar recursos. Predijo el colapso de la URSS 70 años antes de que ocurriera. Los economistas socialistas intentaron refutarlo durante décadas. En 1991, la URSS colapsó exactamente por las razones que Mises predijo: imposibilidad de cálculo económico.',
            category: 'economía'
        },
        {
            icon: '🎭',
            title: 'Rothbard: anarquista con corbata',
            content: 'Murray Rothbard fue el primer académico respetable en defender abiertamente el anarcocapitalismo. Cuando le preguntaban cómo funcionaría una sociedad sin Estado, respondía detalladamente sobre tribunales privados, policía privada y leyes policéntricas. Sus colegas lo consideraban brillante pero excéntrico. Rothbard solía decir: "El Estado es una institución criminal magnificada." Combinaba rigor académico austríaco con radicalismo político sin precedentes.',
            category: 'filosofía'
        },
        {
            icon: '🏆',
            title: 'Hong Kong: de pobreza a riqueza sin recursos',
            content: 'En 1960, Hong Kong era más pobre que muchos países africanos. Sin recursos naturales, espacio ni democracia, aplicó la fórmula más libertaria: impuestos bajos (15% máximo), libre comercio total, regulación mínima y derechos de propiedad sólidos. En 40 años se convirtió en una de las economías más ricas del mundo. Su arquitecto, John Cowperthwaite, rechazaba estadísticas económicas diciendo: "Si las recopilamos, los políticos las usarán para intervenir."',
            category: 'economía'
        },
        {
            icon: '📖',
            title: 'Hazlitt: la lección de economía en una lección',
            content: 'Henry Hazlitt escribió "Economics in One Lesson" (1946) en solo 4 meses. El libro tiene una premisa simple: la diferencia entre un buen economista y uno malo es que el bueno ve las consecuencias no inmediatas. Vendió más de 1 millón de copias y se traduce a 20 idiomas. Hazlitt dijo: "La economía no es complicada si tienes sentido común y entiendes que no existen almuerzos gratis." Es el libro más asignado en cursos de economía.',
            category: 'economía'
        },
        {
            icon: '🎯',
            title: 'Nozick: del marxismo al libertarianismo',
            content: 'Robert Nozick era marxista convencido en su juventud. Mientras intentaba refutar los argumentos libertarios para debatir mejor, se convenció de que estaban en lo correcto. Escribió "Anarchy, State, and Utopia" (1974), la defensa filosófica más rigurosa del estado mínimo. Ganó el National Book Award. Su famoso experimento mental de "Wilt Chamberlain" demostró que cualquier patrón de distribución "justa" se deshace con intercambios voluntarios.',
            category: 'filosofía'
        },
        {
            icon: '🔨',
            title: 'El faro privado que "no podía existir"',
            content: 'Los economistas keynesianos argumentan que los faros son el ejemplo perfecto de "bien público" que solo el Estado puede proveer. El economista Ronald Coase investigó y descubrió que en Inglaterra, durante siglos, casi todos los faros eran privados y rentables. Los armadores pagaban voluntariamente por el servicio. El gobierno británico nacionalizó los faros... ¡y los servicios empeoraron! Coase ganó el Nobel por este y otros trabajos desmontando mitos estatistas.',
            category: 'historia'
        },
        {
            icon: '💵',
            title: 'El día que los bancos cerraron... y todo funcionó',
            content: 'Durante la crisis bancaria de marzo de 1933, Franklin D. Roosevelt ordenó cerrar todos los bancos de EE.UU. durante una semana. Los economistas predijeron caos total. En cambio, los negocios continuaron usando pagarés, cheques personales y crédito informal. La gente intercambió bienes sin dinero oficial. Cuando reabrieron los bancos, la economía ya se había auto-organizado. Los libertarios señalan: el mercado creó dinero espontáneamente cuando el gobierno falló.',
            category: 'historia'
        },
        {
            icon: '🎬',
            title: 'Friedman: estrella de TV accidental',
            content: 'Milton Friedman protagonizó "Free to Choose" (1980), una serie de TV de 10 episodios sobre libre mercado. Fue un éxito masivo: 3 millones de espectadores por episodio, traducido a 24 idiomas. Friedman, con 68 años, viajó por todo el mundo filmando. Su carisma y habilidad para explicar conceptos complejos convirtió el show en propaganda libertaria efectiva. Ronald Reagan y Margaret Thatcher citaban el programa constantemente. El libro asociado vendió 1 millón de copias.',
            category: 'anécdota'
        },
        {
            icon: '⚡',
            title: 'Tesla vs Edison: competencia vs monopolio estatal',
            content: 'Thomas Edison tenía conexiones políticas y luchó por monopolizar la electricidad con corriente directa. Nikola Tesla competía con corriente alterna, superior técnicamente. Edison usó lobby político, incluso electrocutando elefantes públicamente para "demostrar" que la CA era peligrosa. Tesla ganó por mérito técnico puro. Los libertarios usan esto como evidencia: la innovación libre siempre vence al capitalismo de amigos. Hoy todo el mundo usa el sistema de Tesla.',
            category: 'historia'
        }
    ];

    console.log('Total de curiosidades cargadas:', curiosities.length);

    // Función para obtener la historia del día
    function getTodaysFeaturedStory() {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const index = dayOfYear % curiosities.length;
        
        console.log('Día del año:', dayOfYear, 'Índice seleccionado:', index);
        return curiosities[index];
    }

    // Mostrar historia destacada
    function displayFeaturedStory() {
        try {
            const featured = getTodaysFeaturedStory();
            console.log('Historia destacada:', featured.title);
            
            const titleEl = document.getElementById('featured-title');
            const contentEl = document.getElementById('featured-content');
            const categoryEl = document.getElementById('featured-category');
            
            if (titleEl && contentEl && categoryEl) {
                titleEl.textContent = featured.title;
                contentEl.textContent = featured.content;
                categoryEl.textContent = `📌 ${featured.category.charAt(0).toUpperCase() + featured.category.slice(1)}`;
                console.log('Historia destacada mostrada correctamente');
            } else {
                console.error('No se encontraron los elementos HTML para la historia destacada');
            }
        } catch (error) {
            console.error('Error al mostrar historia destacada:', error);
        }
    }

    // Mostrar las demás curiosidades (excluyendo la destacada)
    function displayCuriosities() {
        try {
            const featured = getTodaysFeaturedStory();
            const otherCuriosities = curiosities.filter(c => c.title !== featured.title);
            
            console.log('Mostrando', otherCuriosities.length, 'curiosidades adicionales');
            
            const grid = document.getElementById('curiosities-grid');
            
            if (!grid) {
                console.error('No se encontró el elemento curiosities-grid');
                return;
            }
            
            grid.innerHTML = otherCuriosities.map((curiosity, index) => `
                <div class="curiosity-card" data-category="${curiosity.category}" style="animation-delay: ${index * 0.1}s">
                    <span class="curiosity-icon">${curiosity.icon}</span>
                    <h3 class="curiosity-title">${curiosity.title}</h3>
                    <p class="curiosity-content">${curiosity.content}</p>
                    <span class="curiosity-category">${curiosity.category.toUpperCase()}</span>
                </div>
            `).join('');
            
            console.log('Curiosidades mostradas correctamente');
        } catch (error) {
            console.error('Error al mostrar curiosidades:', error);
        }
    }

    // Inicializar
    try {
        displayFeaturedStory();
        displayCuriosities();
        console.log('Curiosidades libertarias cargadas correctamente');
    } catch (error) {
        console.error('Error al inicializar curiosidades:', error);
    }
});
