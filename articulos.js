// Gestión de artículos de Substack con búsqueda

document.addEventListener('DOMContentLoaded', function() {
    
    let allArticles = [];
    let filteredArticles = [];

    const articlesList = document.getElementById('articles-list');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');
    const noResultsDiv = document.getElementById('no-results');
    const resetSearchBtn = document.getElementById('reset-search');
    const resultsCount = document.getElementById('results-count');

    // Cargar artículos al iniciar
    loadArticles();

    // Event listeners para búsqueda
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    resetSearchBtn.addEventListener('click', clearSearch);

    async function loadArticles() {
        try {
            // URL del RSS feed de Substack (formato JSON)
            const rssUrl = 'https://daniconomics.substack.com/feed';
            
            // Usar un servicio CORS proxy para acceder al RSS
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(rssUrl));
            
            if (!response.ok) {
                throw new Error('Error al cargar el feed');
            }

            const data = await response.json();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            
            // Parsear items del RSS
            const items = xmlDoc.querySelectorAll('item');
            
            allArticles = Array.from(items).map(item => {
                const title = item.querySelector('title')?.textContent || 'Sin título';
                const link = item.querySelector('link')?.textContent || '#';
                const pubDate = item.querySelector('pubDate')?.textContent || '';
                const description = item.querySelector('description')?.textContent || '';
                
                // Limpiar descripción de HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = description;
                const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
                
                return {
                    title: title,
                    link: link,
                    date: pubDate,
                    excerpt: cleanDescription.substring(0, 250) + '...'
                };
            });

            filteredArticles = [...allArticles];
            
            loadingDiv.style.display = 'none';
            displayArticles();
            updateResultsCount();

        } catch (error) {
            console.error('Error cargando artículos:', error);
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    }

    function displayArticles() {
        if (filteredArticles.length === 0) {
            articlesList.innerHTML = '';
            noResultsDiv.style.display = 'block';
            return;
        }

        noResultsDiv.style.display = 'none';
        
        articlesList.innerHTML = filteredArticles.map(article => `
            <article class="article-card">
                <span class="article-date">${formatDate(article.date)}</span>
                <h3 class="article-title">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                </h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <a href="${article.link}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="read-more-link">
                    Leer artículo completo
                </a>
            </article>
        `).join('');
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            clearSearchBtn.style.display = 'none';
            filteredArticles = [...allArticles];
        } else {
            clearSearchBtn.style.display = 'block';
            filteredArticles = allArticles.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                article.excerpt.toLowerCase().includes(searchTerm)
            );
        }
        
        displayArticles();
        updateResultsCount();
    }

    function clearSearch() {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        filteredArticles = [...allArticles];
        displayArticles();
        updateResultsCount();
    }

    function updateResultsCount() {
        if (allArticles.length === 0) {
            resultsCount.textContent = '';
            return;
        }

        if (searchInput.value.trim() === '') {
            resultsCount.textContent = `Mostrando ${allArticles.length} artículo${allArticles.length !== 1 ? 's' : ''}`;
        } else {
            resultsCount.textContent = `${filteredArticles.length} resultado${filteredArticles.length !== 1 ? 's' : ''} de ${allArticles.length} artículo${allArticles.length !== 1 ? 's' : ''}`;
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }

    console.log('Sistema de artículos inicializado');
});
