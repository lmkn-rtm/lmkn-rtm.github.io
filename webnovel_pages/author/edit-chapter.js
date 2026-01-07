class ChapterEditor {
    constructor() {
        this.novelId = localStorage.getItem('currentNovelId');
        this.chapterId = localStorage.getItem('currentChapterId');
        
        if (!this.novelId || !this.chapterId) {
            alert('No chapter selected!');
            window.location.href = 'edit-novel.html';
            return;
        }
        
        this.authorData = JSON.parse(localStorage.getItem('authorData') || '{"novels":[]}');
        this.novel = this.authorData.novels.find(n => n.id === this.novelId);
        this.chapter = this.novel?.chapters?.find(c => c.id === this.chapterId);
        
        if (!this.chapter) {
            alert('Chapter not found!');
            window.location.href = 'edit-novel.html';
            return;
        }
        
        this.init();
    }
    
    init() {
        // Load chapter content
        this.loadChapterContent();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial preview update
        this.updatePreview();
        this.updateWordCount();
    }
    
    loadChapterContent() {
        const editor = document.getElementById('markdown-editor');
        const titleInput = document.getElementById('chapter-title-input');
        
        // Load chapter title
        titleInput.value = this.chapter.title || 'Untitled Chapter';
        
        if (this.chapter.markdown) {
            // Load from saved markdown
            editor.value = this.chapter.markdown;
        } else if (this.chapter.content) {
            // Convert HTML to markdown (simplified)
            const html = this.chapter.content;
            const textMatch = html.match(/<div class="chapter-text">([\s\S]*?)<\/div>/);
            if (textMatch) {
                const markdown = this.htmlToMarkdown(textMatch[1]);
                editor.value = markdown;
                this.chapter.markdown = markdown;
            } else {
                editor.value = '';
            }
        } else {
            editor.value = '';
        }
    }
    
    htmlToMarkdown(html) {
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
            .replace(/—/g, '—')
            .replace(/–/g, '–')
            .replace(/…/g, '…')
            .replace(/<hr class="scene-break" \/>/g, '\n***\n')
            .replace(/«/g, '«')
            .replace(/»/g, '»')
            .trim();
    }
    
    setupEventListeners() {
        // Save button
        document.getElementById('save-chapter').addEventListener('click', () => {
            this.saveChapter();
        });
        
        // Chapter title input
        document.getElementById('chapter-title-input').addEventListener('input', (e) => {
            this.chapter.title = e.target.value;
            this.updatePreview();
        });
        
        // Editor input
        const editor = document.getElementById('markdown-editor');
        editor.addEventListener('input', () => {
            this.updatePreview();
            this.updateWordCount();
        });
        
        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.applyToolbarAction(action);
            });
        });
    }
    
    applyToolbarAction(action) {
        const editor = document.getElementById('markdown-editor');
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        let newText = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'bold':
                newText = `**${selectedText}**`;
                cursorOffset = selectedText ? selectedText.length + 4 : 4;
                break;
            case 'italic':
                newText = `*${selectedText}*`;
                cursorOffset = selectedText ? selectedText.length + 2 : 2;
                break;
            case 'em-dash':
                newText = '—';
                cursorOffset = 1;
                break;
            case 'en-dash':
                newText = '–';
                cursorOffset = 1;
                break;
            case 'russian-quote':
                newText = `«${selectedText}»`;
                cursorOffset = selectedText ? selectedText.length + 2 : 2;
                break;
            case 'asterisks':
                newText = `\\*\\*\\*`;
                cursorOffset = 3;
                break;
            case 'speech1':
                newText = 'А: «П»';
                cursorOffset = 6;
                break;
            case 'speech2':
                newText = '«П», — а.';
                cursorOffset = 9;
                break;
            case 'speech3':
                newText = 'А: «П!», — а.';
                cursorOffset = 12;
                break;
            case 'speech4':
                newText = '«П, — а, — п».';
                cursorOffset = 14;
                break;
            case 'speech5':
                newText = '— П.';
                cursorOffset = 4;
                break;
            case 'speech6':
                newText = '— П, а.';
                cursorOffset = 7;
                break;
            case 'speech7':
                newText = '— П, — а, — п.';
                cursorOffset = 14;
                break;
        }
        
        editor.focus();
        if (selectedText) {
            editor.setRangeText(newText, start, end, 'end');
        } else {
            editor.setRangeText(newText, start, start, 'end');
        }
        
        // Update preview
        this.updatePreview();
        this.updateWordCount();
    }
    
    updatePreview() {
        const markdown = document.getElementById('markdown-editor').value;
        const previewContainer = document.getElementById('markdown-preview');
        
        // Generate the full chapter HTML for preview
        const html = this.generatePreviewHTML(markdown);
        
        // Update preview container
        previewContainer.innerHTML = html;
    }
    
    generatePreviewHTML(markdown) {
        // Convert markdown to HTML for content
        const contentHTML = this.markdownToHtml(markdown);
        
        // Get current novel info
        const novelTitle = this.novel.title;
        const chapterTitle = document.getElementById('chapter-title-input').value || 'Untitled Chapter';
        const wordCount = markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length;
        const chapterIndex = this.novel.chapters.findIndex(c => c.id === this.chapterId);
        const prevChapter = chapterIndex > 0 ? this.novel.chapters[chapterIndex - 1] : null;
        const nextChapter = chapterIndex < this.novel.chapters.length - 1 ? this.novel.chapters[chapterIndex + 1] : null;
        
        return `
            <div class="chapter-preview">
                <nav class="breadcrumb">
                    <a href="#" class="breadcrumb-item">Library</a>
                    <span class="breadcrumb-divider">/</span>
                    <a href="#" class="breadcrumb-item">${novelTitle}</a>
                    <span class="breadcrumb-divider">/</span>
                    <span class="breadcrumb-item current">${chapterTitle}</span>
                </nav>
                
                <nav class="chapter-nav top">
                    ${prevChapter ? 
                        `<a href="#" class="btn btn-secondary">← Previous</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>← Previous</a>`
                    }
                    <div class="nav-spacer"></div>
                    <a href="#" class="btn btn-secondary">Contents</a>
                    <div class="nav-spacer"></div>
                    ${nextChapter ? 
                        `<a href="#" class="btn btn-secondary">Next →</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>Next →</a>`
                    }
                </nav>
                
                <h1 class="chapter-title">${chapterTitle}</h1>
                <div class="chapter-meta">
                    <span>${novelTitle}</span>
                    <span>•</span>
                    <span>${wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>${this.chapter.date || new Date().toLocaleDateString()}</span>
                </div>
                
                <div class="chapter-text">
                    ${contentHTML}
                </div>
                
                <nav class="chapter-nav bottom">
                    ${prevChapter ? 
                        `<a href="#" class="btn btn-secondary">← Previous</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>← Previous</a>`
                    }
                    <div class="nav-spacer"></div>
                    <a href="#" class="btn btn-secondary">Contents</a>
                    <div class="nav-spacer"></div>
                    ${nextChapter ? 
                        `<a href="#" class="btn btn-secondary">Next →</a>` : 
                        `<a href="#" class="btn btn-secondary disabled" disabled>Next →</a>`
                    }
                </nav>
            </div>
        `;
    }
    
    markdownToHtml(markdown) {
        // First, protect escaped asterisks by replacing them with a placeholder
        let protectedMarkdown = markdown.replace(/\\\*\\\*\\\*/g, '___SCENE_BREAK___');
        
        // Now do other markdown conversions
        let html = protectedMarkdown
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/—/g, '—')
            .replace(/–/g, '–')
            .replace(/«/g, '«')
            .replace(/»/g, '»')
            .split('\n\n')
            .map(para => {
                if (!para.trim()) return '';
                if (para.startsWith('<')) return para;
                return `<p>${para}</p>`;
            })
            .join('\n');
        
        // Finally, restore the scene breaks
        html = html.replace(/___SCENE_BREAK___/g, '<hr class="scene-break" />');
        
        return html;
    }
    
    updateWordCount() {
        const text = document.getElementById('markdown-editor').value;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const chars = text.length;
        
        document.getElementById('word-count').textContent = `${words.toLocaleString()} слов`;
        document.getElementById('char-count').textContent = `${chars.toLocaleString()} символов`;
        
        // Update chapter word count
        this.chapter.wordCount = words;
    }
    
    saveChapter() {
        const markdown = document.getElementById('markdown-editor').value;
        const chapterTitle = document.getElementById('chapter-title-input').value;
        const words = markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length;
        const today = new Date().toISOString().split('T')[0];
        
        // Update chapter
        this.chapter.markdown = markdown;
        this.chapter.title = chapterTitle;
        this.chapter.wordCount = words;
        this.chapter.date = today;
        
        // Update novel metadata
        this.novel.lastEdited = today;
        this.novel.wordCount = this.novel.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        
        // Save to localStorage
        localStorage.setItem('authorData', JSON.stringify(this.authorData));
        
        alert('Chapter saved successfully!');
        
        // Go back to edit novel page
        setTimeout(() => {
            window.location.href = 'edit-novel.html';
        }, 500);
    }
}

// Initialize the editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chapterEditor = new ChapterEditor();
});