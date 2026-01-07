// Simple data storage for the author tool
window.authorData = {
    novels: [],
    projectLoaded: false,
    currentProjectPath: null
};

// Initialize the author tool
document.addEventListener('DOMContentLoaded', function() {
    // Load any existing data from localStorage
    const savedData = localStorage.getItem('authorData');
    if (savedData) {
        window.authorData = JSON.parse(savedData);
        updateProjectStatus();
        updateNovelsList();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // New novel button
    document.getElementById('new-novel').addEventListener('click', createNewNovel);
    
    // Load project button
    document.getElementById('load-project').addEventListener('click', loadProjectFromZip);
    
    // Export project button
    document.getElementById('export-project').addEventListener('click', exportProject);
}

function updateProjectStatus() {
    const statusEl = document.getElementById('project-status');
    const exportBtn = document.getElementById('export-project');
    
    if (window.authorData.projectLoaded) {
        statusEl.textContent = `Проект загружен: ${window.authorData.currentProjectPath || 'Новый проект'}`;
        statusEl.className = 'project-status loaded';
        exportBtn.disabled = false;
    } else {
        statusEl.textContent = 'No project loaded. Create a new novel or load an existing project.';
        statusEl.className = 'project-status';
        exportBtn.disabled = true;
    }
}

function createNewNovel() {
    const novelId = 'novel-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    const newNovel = {
        id: novelId,
        title: 'Без названия',
        author: 'Автор',
        description: '',
        started: today,
        lastEdited: today,
        status: 'Выпускается',
        chaptersCount: 0,
        wordCount: 0,
        chapters: []
    };
    
    window.authorData.novels.push(newNovel);
    window.authorData.projectLoaded = true;
    window.authorData.currentProjectPath = 'Новый проект';
    
    saveData();
    updateProjectStatus();
    updateNovelsList();
    
    // Navigate to edit page
    localStorage.setItem('currentNovelId', novelId);
    window.location.href = 'edit-novel.html';
}

async function loadProjectFromZip() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            
            if (!file) return;
            
            if (file.name.endsWith('.zip')) {
                // Load from ZIP file
                await loadFromZip(file);
            } else if (file.name === 'novels.json') {
                // Fallback: load only JSON
                await loadFromJson(file);
            } else {
                alert('Please select a .zip file or novels.json');
            }
        };
        
        input.click();
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Failed to load project: ' + error.message);
    }
}

async function loadFromZip(zipFile) {
    try {
        // Load ZIP file
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);
        
        // 1. Load novels.json
        const novelsJson = zipContent.file('novels.json');
        if (!novelsJson) {
            throw new Error('novels.json not found in ZIP');
        }
        
        const jsonContent = await novelsJson.async('text');
        const data = JSON.parse(jsonContent);
        
        // Clear existing data
        window.authorData.novels = [];
        
        // Load each novel
        for (const novelData of data.novels) {
            const novel = {
                ...novelData,
                chapters: []
            };
            
            // Check if novel folder exists in ZIP
            const novelFolder = `novels/${novel.id}`;
            const novelIndex = zipContent.file(`${novelFolder}/index.html`);
            
            if (novelIndex) {
                // Try to load chapters from index.html
                const indexContent = await novelIndex.async('text');
                novel.chapters = extractChaptersFromIndex(indexContent, novel.id);
                
                // Try to load actual chapter content
                await loadChapterContentFromZip(zipContent, novelFolder, novel);
            }
            
            window.authorData.novels.push(novel);
        }
        
        window.authorData.projectLoaded = true;
        window.authorData.currentProjectPath = zipFile.name;
        
        saveData();
        updateProjectStatus();
        updateNovelsList();
        
        alert(`Project loaded successfully! Loaded ${window.authorData.novels.length} novels.`);
        
    } catch (error) {
        console.error('Error loading from ZIP:', error);
        alert('Failed to load from ZIP: ' + error.message);
    }
}

async function loadChapterContentFromZip(zipContent, novelFolder, novel) {
    // List all files in novel folder
    const novelFiles = Object.keys(zipContent.files).filter(path => 
        path.startsWith(novelFolder + '/') && 
        path !== `${novelFolder}/index.html` &&
        path.endsWith('.html')
    );
    
    for (const chapterFile of novelFiles) {
        try {
            const content = await zipContent.file(chapterFile).async('text');
            const chapterId = chapterFile.split('/').pop().replace('.html', '');
            
            // Find or create chapter
            let chapter = novel.chapters.find(c => c.id === chapterId);
            if (!chapter) {
                chapter = {
                    id: chapterId,
                    title: 'Untitled Chapter',
                    wordCount: 0,
                    content: ''
                };
                novel.chapters.push(chapter);
            }
            
            // Extract content from chapter HTML
            const htmlContent = extractChapterContent(content);
            const markdownContent = htmlToMarkdown(htmlContent);
            
            chapter.markdown = markdownContent;
            chapter.content = htmlContent;
            chapter.wordCount = countWords(markdownContent);
            
            // Try to extract title
            const titleMatch = content.match(/<h1 class="chapter-title">(.*?)<\/h1>/);
            if (titleMatch) {
                chapter.title = titleMatch[1];
            }
            
        } catch (error) {
            console.warn(`Could not load chapter ${chapterFile}:`, error);
        }
    }
    
    // Update novel counts
    novel.chaptersCount = novel.chapters.length;
    novel.wordCount = novel.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
}

function extractChaptersFromIndex(indexHtml, novelId) {
    const chapters = [];
    const chapterRegex = /<a href="([^"]+\.html)" class="chapter-item">[\s\S]*?<span class="chapter-number">Chapter (\d+)<\/span>[\s\S]*?<span class="chapter-title">([^<]+)<\/span>/g;
    
    let match;
    while ((match = chapterRegex.exec(indexHtml)) !== null) {
        const [, filename, chapterNum, title] = match;
        const chapterId = filename.replace('.html', '');
        
        chapters.push({
            id: chapterId,
            title: title,
            chapterNumber: parseInt(chapterNum),
            wordCount: 0
        });
    }
    
    return chapters;
}

function extractChapterContent(html) {
    // Extract content between chapter-text div
    const match = html.match(/<div class="chapter-text">([\s\S]*?)<\/div>/);
    return match ? match[1] : '';
}

function htmlToMarkdown(html) {
    // Simple HTML to Markdown conversion
    return html
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<h2>/g, '## ')
        .replace(/<\/h2>/g, '\n\n')
        .replace(/<h3>/g, '### ')
        .replace(/<\/h3>/g, '\n\n')
        .replace(/<em>/g, '*')
        .replace(/<\/em>/g, '*')
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<i>/g, '*')
        .replace(/<\/i>/g, '*')
        .replace(/<b>/g, '**')
        .replace(/<\/b>/g, '**')
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<hr class="scene-break" \/>/g, '\n\\*\\*\\*\n')
        .replace(/«/g, '«')
        .replace(/»/g, '»')
        .replace(/—/g, '—')
        .replace(/–/g, '–')
        .trim();
}

function countWords(text) {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

async function loadFromJson(jsonFile) {
    // Fallback for loading just JSON
    const text = await readFileAsText(jsonFile);
    const data = JSON.parse(text);
    
    window.authorData.novels = data.novels || [];
    window.authorData.projectLoaded = true;
    window.authorData.currentProjectPath = jsonFile.name;
    
    saveData();
    updateProjectStatus();
    updateNovelsList();
    
    alert('novels.json loaded (chapters will need to be recreated).');
}

async function exportProject() {
    if (!window.authorData.projectLoaded || window.authorData.novels.length === 0) {
        alert('No project loaded to export.');
        return;
    }
    
    try {
        // Create the main export object
        const exportData = {
            novels: window.authorData.novels.map(novel => ({
                id: novel.id,
                title: novel.title,
                author: novel.author,
                description: novel.description,
                started: novel.started,
                lastEdited: novel.lastEdited,
                status: novel.status,
                chaptersCount: novel.chaptersCount || 0,
                wordCount: novel.wordCount || 0
                // Don't include chapters array in JSON
            }))
        };
        
        // Create blobs for each file
        const files = {};
        
        // 1. Create novels.json
        files['novels.json'] = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        
        // 2. Create main index.html
        files['index.html'] = new Blob([generateMainIndexHtml()], { type: 'text/html' });
        
        // 3. Create styles.css (copy from existing)
        try {
            const response = await fetch('../styles.css');
            const css = await response.text();
            files['styles.css'] = new Blob([css], { type: 'text/css' });
        } catch (error) {
            console.warn('Could not load styles.css:', error);
        }
        
        // 4. Create script.js (copy from existing)
        try {
            const response = await fetch('../script.js');
            const script = await response.text();
            files['script.js'] = new Blob([script], { type: 'application/javascript' });
        } catch (error) {
            console.warn('Could not load script.js:', error);
        }
        
        // 5. Create novels folder structure
        for (const novel of window.authorData.novels) {
            const novelFolder = `novels/${novel.id}`;
            
            // Create novel index.html
            files[`${novelFolder}/index.html`] = new Blob([generateNovelIndexHtml(novel)], { type: 'text/html' });
            
            // Create chapter files
            if (novel.chapters && novel.chapters.length > 0) {
                novel.chapters.forEach((chapter, index) => {
                    const prevChapter = index > 0 ? novel.chapters[index - 1] : null;
                    const nextChapter = index < novel.chapters.length - 1 ? novel.chapters[index + 1] : null;
                    
                    files[`${novelFolder}/${chapter.id}.html`] = new Blob([
                        generateChapterHtml(novel, chapter, prevChapter, nextChapter)
                    ], { type: 'text/html' });
                });
            }
        }
        
        // Create ZIP file
        const zip = new JSZip();
        
        // Add all files to zip
        for (const [path, blob] of Object.entries(files)) {
            zip.file(path, blob);
        }
        
        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'webnovel-project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Project exported as webnovel-project.zip! Extract to your web server.');
    } catch (error) {
        console.error('Error exporting project:', error);
        alert('Failed to export project: ' + error.message);
    }
}

const statusText = {
    'ongoing': 'В процессе',
    'finished': 'Завершена',
    'abandoned': 'Заброшена'
};

// Helper function to generate main index.html
function generateMainIndexHtml() {
    let novelsHtml = '';
    
    window.authorData.novels.forEach(novel => {
        const startedDate = new Date(novel.started).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const lastEditedDate = new Date(novel.lastEdited).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const statusColors = {
            'ongoing': 'ongoing',
            'finished': 'finished',
            'abandoned': 'abandoned'
        };
        
        novelsHtml += `
            <a href="novels/${novel.id}/index.html" class="novel-card">
                <div class="novel-card-header">
                    <h2 class="novel-title">${novel.title}</h2>
                    <span class="status ${statusColors[novel.status]}">${statusText[novel.status]}</span>
                </div>
                <div class="novel-author">${novel.author}</div>
                <p class="novel-description">${novel.description || ''}</p>
                <div class="novel-meta">
                    <div class="meta-row">
                        <span class="meta-item">
                            <span class="meta-label">Начато:</span>
                            <span class="meta-value">${startedDate}</span>
                        </span>
                        <span class="meta-item">
                            <span class="meta-label">Изменено:</span>
                            <span class="meta-value">${lastEditedDate}</span>
                        </span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-item">
                            <span class="meta-label">Главы:</span>
                            <span class="meta-value">${novel.chaptersCount || 0}</span>
                        </span>
                        <span class="meta-item">
                            <span class="meta-label">Слова:</span>
                            <span class="meta-value">${novel.wordCount ? novel.wordCount.toLocaleString() : '0'}</span>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- THEME FLASH FIX - This runs immediately before anything renders -->
    <script>
        (function() {
            // Check localStorage first
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                return;
            }
            
            // Fall back to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script> 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Библиотека Фанфиков</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="index.html" class="logo">
                <span class="logo-text">Библиотека Фанфиков</span>
            </a>
            <div class="header-actions">
                <button id="theme-toggle" class="btn btn-secondary">
                    <span id="theme-icon">Тёмная</span>
                    <span class="sr-only">Сменить тему</span>
                </button>
            </div>
        </div>
    </header>

    <main class="container">
        <section class="hero">
            <h1 class="hero-title">Мои фанфики</h1>
            <p class="hero-subtitle">Личный сборник фанфиков</p>
        </section>
        
        <div class="novels-grid">
            ${novelsHtml || '<div class="empty-state"><h2>Ничего нет.</h2><p>Работы появятся когда их добавят.</p></div>'}
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>`;
}

// Helper function to generate novel index.html
function generateNovelIndexHtml(novel) {
    let chaptersHtml = '';
    
    if (novel.chapters && novel.chapters.length > 0) {
        novel.chapters.forEach((chapter, index) => {
            const chapterNumber = index + 1;
            const chapterDate = chapter.date ? new Date(chapter.date).toLocaleDateString() : '';
            
            chaptersHtml += `
                <a href="${chapter.id}.html" class="chapter-item">
                    <span class="chapter-number">Глава ${chapterNumber}</span>
                    <span class="chapter-title">${chapter.title}</span>
                    <span class="chapter-date">${chapterDate}</span>
                </a>
            `;
        });
    } else {
        chaptersHtml = `
            <div class="empty-chapters">
                <h3>Ничего нет</h3>
                <p>Главы появятся когда будут добавлены</p>
            </div>
        `;
    }
    
    const startedDate = new Date(novel.started).toLocaleDateString();
    const lastEditedDate = new Date(novel.lastEdited).toLocaleDateString();
    const statusColors = {
        'ongoing': 'ongoing',
        'finished': 'finished',
        'abandoned': 'abandoned'
    };
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- THEME FLASH FIX - This runs immediately before anything renders -->
    <script>
        (function() {
            // Check localStorage first
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                return;
            }
            
            // Fall back to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script> 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${novel.title} - Главы</title>
    <link rel="stylesheet" href="../../styles.css">
    <script src="../../script.js" defer></script>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="../../index.html" class="logo">
                <span class="logo-text">← Библиотека</span>
            </a>
            <div class="header-actions">
                <button id="theme-toggle" class="btn btn-secondary">
                    <span id="theme-icon">Тёмная</span>
                    <span class="sr-only">Сменить тему</span>
                </button>
            </div>
        </div>
    </header>

    <main class="container">
        <section class="hero">
            <h1 class="hero-title">${novel.title}</h1>
            <p class="hero-subtitle">${novel.author} • ${novel.description}</p>
            <div class="novel-meta-large">
                <span class="status ${statusColors[novel.status]}">${statusText[novel.status]}</span>
                <span>Начато: ${startedDate} • Изменено: ${lastEditedDate}</span>
            </div>
        </section>
        
        <section class="chapters-section">
            <h2>Главы (${novel.chaptersCount || 0})</h2>
            <div class="chapters-list">
                ${chaptersHtml}
            </div>
        </section>
    </main>
</body>
</html>`;
}

// Helper function to generate chapter HTML
function generateChapterHtml(novel, chapter, prevChapter, nextChapter) {
    const markdownToHtml = (markdown) => {
        // First, protect escaped asterisks
        let protectedMarkdown = markdown.replace(/\\\*\\\*\\\*/g, '___SCENE_BREAK___');
        
        let html = protectedMarkdown
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/«/g, '«')
            .replace(/»/g, '»')
            .split('\n\n')
            .map(para => {
                if (!para.trim()) return '';
                if (para.startsWith('<')) return para;
                return `<p>${para}</p>`;
            })
            .join('\n');
        
        // Restore scene breaks
        html = html.replace(/___SCENE_BREAK___/g, '<hr class="scene-break" />');
        
        return html;
    };
    
    const contentHtml = markdownToHtml(chapter.markdown || '');
    const chapterDate = chapter.date ? new Date(chapter.date).toLocaleDateString() : '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- THEME FLASH FIX - This runs immediately before anything renders -->
    <script>
        (function() {
            // Check localStorage first
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                return;
            }
            
            // Fall back to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script> 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chapter.title} - ${novel.title}</title>
    <link rel="stylesheet" href="../../styles.css">
    <script src="../../script.js" defer></script>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <div class="breadcrumb">
                <a href="../../index.html" class="breadcrumb-item">Библиотека</a>
                <span class="breadcrumb-divider">/</span>
                <a href="index.html" class="breadcrumb-item">${novel.title}</a>
                <span class="breadcrumb-divider">/</span>
                <span class="breadcrumb-item current">${chapter.title}</span>
            </div>
            <div class="header-actions">
                <button id="theme-toggle" class="btn btn-secondary">
                    <span id="theme-icon">Тёмная</span>
                    <span class="sr-only">Сменить тему</span>
                </button>
            </div>
        </div>
    </header>

    <main class="container chapter-reading">  <!-- Added chapter-reading class -->
        <article class="chapter-content">
            <header class="chapter-header">
                <nav class="chapter-nav top">
                    ${prevChapter ? 
                        `<a href="${prevChapter.id}.html" class="btn btn-secondary">← Назад</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>← Назад</a>`
                    }
                    <div class="nav-spacer"></div>
                    <a href="index.html" class="btn btn-secondary">Содержание</a>
                    <div class="nav-spacer"></div>
                    ${nextChapter ? 
                        `<a href="${nextChapter.id}.html" class="btn btn-secondary">Вперед →</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>Вперед →</a>`
                    }
                </nav>
                
                <h1 class="chapter-title">${chapter.title}</h1>
                <div class="chapter-meta">
                    <span>${novel.title}</span>
                    <span>•</span>
                    <span>${(chapter.wordCount || 0).toLocaleString()} слов</span>
                    <span>•</span>
                    <span>${chapterDate}</span>
                </div>
            </header>
            
            <div class="chapter-text">
                ${contentHtml}
            </div>
            
            <footer class="chapter-footer">
                <nav class="chapter-nav bottom">
                    ${prevChapter ? 
                        `<a href="${prevChapter.id}.html" class="btn btn-secondary">← Назад</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>← Назад</a>`
                    }
                    <div class="nav-spacer"></div>
                    <a href="index.html" class="btn btn-secondary">Содержание</a>
                    <div class="nav-spacer"></div>
                    ${nextChapter ? 
                        `<a href="${nextChapter.id}.html" class="btn btn-secondary">Вперед →</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>Вперед →</a>`
                    }
                </nav>
            </footer>
        </article>
    </main>
</body>
</html>`;
}

function updateNovelsList() {
    const container = document.getElementById('author-novels');
    
    if (!window.authorData.novels || window.authorData.novels.length === 0) {
        container.innerHTML = '<div class="empty-state"><h2>Ничего нет</h2><p>Создайте или загрузите проект чтобы начать</p></div>';
        return;
    }
    
    let novelsHtml = '';
    
    window.authorData.novels.forEach(novel => {
        const startedDate = new Date(novel.started).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const lastEditedDate = new Date(novel.lastEdited).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const statusColors = {
            'ongoing': 'ongoing',
            'finished': 'finished',
            'abandoned': 'abandoned'
        };
        
        novelsHtml += `
            <div class="author-novel-item">
                <div class="novel-info">
                    <h3>${novel.title}</h3>
                    <p>by ${novel.author} • ${novel.chaptersCount} глав • ${novel.wordCount.toLocaleString()} слов</p>
                    <p><span class="status ${statusColors[novel.status]}">${statusText[novel.status]}</span></p>
                </div>
                <div class="novel-actions">
                    <button class="btn btn-secondary" onclick="editNovel('${novel.id}')">Изменить</button>
                    <button class="btn btn-secondary" onclick="deleteNovel('${novel.id}')">Удалить</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = novelsHtml;
}

function editNovel(novelId) {
    localStorage.setItem('currentNovelId', novelId);
    window.location.href = 'edit-novel.html';
}

function deleteNovel(novelId) {
    if (confirm('Are you sure you want to delete this novel? This action cannot be undone.')) {
        window.authorData.novels = window.authorData.novels.filter(n => n.id !== novelId);
        saveData();
        updateNovelsList();
    }
}

function saveData() {
    localStorage.setItem('authorData', JSON.stringify(window.authorData));
}

// Helper function for File API
if (!File.prototype.readAsText) {
    File.prototype.readAsText = function() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(this);
        });
    };
}