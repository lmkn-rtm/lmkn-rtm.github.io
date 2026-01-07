document.addEventListener('DOMContentLoaded', function() {
    // Load data
    const authorData = JSON.parse(localStorage.getItem('authorData') || '{"novels":[]}');
    const currentNovelId = localStorage.getItem('currentNovelId');
    
    if (!currentNovelId) {
        alert('No novel selected!');
        window.location.href = 'index.html';
        return;
    }
    
    // Find the novel
    const novelIndex = authorData.novels.findIndex(n => n.id === currentNovelId);
    
    if (novelIndex === -1) {
        alert('Novel not found!');
        window.location.href = 'index.html';
        return;
    }
    
    const novel = authorData.novels[novelIndex];
    
    // Populate form
    document.getElementById('novel-title').value = novel.title;
    document.getElementById('novel-author').value = novel.author;
    document.getElementById('novel-description').value = novel.description || '';
    document.getElementById('novel-status').value = novel.status;
    document.getElementById('novel-started').value = novel.started;
    
    // Update chapters list
    updateChaptersList(novel);
    
    // Form submit handler
    document.getElementById('novel-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNovelDetails(authorData, novelIndex, novel);
    });
    
    // New chapter button
    document.getElementById('new-chapter').addEventListener('click', function() {
        createNewChapter(authorData, novelIndex, novel);
    });
    
    // Store references globally for button callbacks
    window.currentAuthorData = authorData;
    window.currentNovel = novel;
    window.currentNovelIndex = novelIndex;
});

function updateChaptersList(novel) {
    const container = document.getElementById('chapters-list');
    
    if (!novel.chapters || novel.chapters.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No chapters yet. Create your first chapter!</p></div>';
        return;
    }
    
    let chaptersHtml = '';
    
    novel.chapters.forEach((chapter, index) => {
        chaptersHtml += `
            <div class="chapter-item">
                <div class="chapter-info">
                    <h4>${chapter.title}</h4>
                    <p>${chapter.wordCount} words</p>
                </div>
                <div class="chapter-actions">
                    <div class="move-buttons">
                        <button class="btn btn-secondary move-up" ${index === 0 ? 'disabled' : ''} onclick="moveChapter(${index}, 'up')">↑</button>
                        <button class="btn btn-secondary move-down" ${index === novel.chapters.length - 1 ? 'disabled' : ''} onclick="moveChapter(${index}, 'down')">↓</button>
                    </div>
                    <button class="btn btn-secondary" onclick="editChapter('${chapter.id}')">Изменить</button>
                    <button class="btn btn-secondary" onclick="deleteChapter(${index})">Удалить</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = chaptersHtml;
}

function saveNovelDetails(authorData, novelIndex, novel) {
    novel.title = document.getElementById('novel-title').value;
    novel.author = document.getElementById('novel-author').value;
    novel.description = document.getElementById('novel-description').value;
    novel.status = document.getElementById('novel-status').value;
    novel.started = document.getElementById('novel-started').value;
    novel.lastEdited = new Date().toISOString().split('T')[0];
    
    // Update in array
    authorData.novels[novelIndex] = novel;
    
    // Save to localStorage
    localStorage.setItem('authorData', JSON.stringify(authorData));
    
    alert('Novel details saved!');
}

function createNewChapter(authorData, novelIndex, novel) {
    const chapterId = 'chapter-' + Date.now();
    const today = new Date().toLocaleDateString();
    
    const newChapter = {
        id: chapterId,
        title: 'Без названия',
        wordCount: 0,
        date: new Date().toISOString().split('T')[0],
        content: `<p>Start writing your chapter here...</p>`
    };
    
    if (!novel.chapters) {
        novel.chapters = [];
    }
    
    novel.chapters.push(newChapter);
    novel.chaptersCount = novel.chapters.length;
    
    // Update word count
    novel.wordCount = novel.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    
    // Update in array
    authorData.novels[novelIndex] = novel;
    
    // Save to localStorage
    localStorage.setItem('authorData', JSON.stringify(authorData));
    localStorage.setItem('currentChapterId', chapterId);
    
    // Navigate to edit chapter
    window.location.href = 'edit-chapter.html';
}

// Global functions for button callbacks
window.moveChapter = function(index, direction) {
    const authorData = window.currentAuthorData;
    const novel = window.currentNovel;
    const novelIndex = window.currentNovelIndex;
    
    if (direction === 'up' && index > 0) {
        [novel.chapters[index], novel.chapters[index - 1]] = 
        [novel.chapters[index - 1], novel.chapters[index]];
    } else if (direction === 'down' && index < novel.chapters.length - 1) {
        [novel.chapters[index], novel.chapters[index + 1]] = 
        [novel.chapters[index + 1], novel.chapters[index]];
    }
    
    authorData.novels[novelIndex] = novel;
    localStorage.setItem('authorData', JSON.stringify(authorData));
    
    updateChaptersList(novel);
};

window.editChapter = function(chapterId) {
    localStorage.setItem('currentChapterId', chapterId);
    window.location.href = 'edit-chapter.html';
};

window.deleteChapter = function(index) {
    if (confirm('Are you sure you want to delete this chapter?')) {
        const authorData = window.currentAuthorData;
        const novel = window.currentNovel;
        const novelIndex = window.currentNovelIndex;
        
        novel.chapters.splice(index, 1);
        novel.chaptersCount = novel.chapters.length;
        novel.wordCount = novel.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        
        authorData.novels[novelIndex] = novel;
        localStorage.setItem('authorData', JSON.stringify(authorData));
        
        updateChaptersList(novel);
    }
};