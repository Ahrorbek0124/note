// API Keys - Using OpenRouter for MiniMax 2.5
const API_KEYS = {
    openrouter: ['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', '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', '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']
};

let currentKeyIndex = 0;

// Translations
const translations = {
    en: {
        chat: 'Chat',
        folders: 'Folders',
        newFolder: 'New Folder',
        folderName: 'Folder Name',
        cancel: 'Cancel',
        create: 'Create',
        rename: 'Rename',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete this?',
        renameFolder: 'Rename Folder',
        save: 'Save',
        chatTitle: 'AI Assistant',
        chatDesc: 'Ask me anything, I\'m powered by MiniMax 2.5',
        dragDrop: 'Drag & drop files here',
        orClick: 'or click to browse',
        files: 'Files',
        notes: 'Notes',
        newNote: 'New Note',
        noNotes: 'No Notes Yet',
        createFirstNote: 'Create your first note to get started',
        backToNotes: 'Back to Notes',
        noteName: 'Note Name',
        renameNote: 'Rename Note'
    },
    uz: {
        chat: 'Chat',
        folders: 'Papkalar',
        newFolder: 'Yangi Papka',
        folderName: 'Papka Nomi',
        cancel: 'Bekor qilish',
        create: 'Yaratish',
        rename: 'Nomini o\'zgartirish',
        delete: 'O\'chirish',
        deleteConfirm: 'Buni o\'chirishga ishonchingiz komilmi?',
        renameFolder: 'Papka Nomini O\'zgartirish',
        save: 'Saqlash',
        chatTitle: 'AI Yordamchi',
        chatDesc: 'Menga har qanday savol bering, men MiniMax 2.5 bilan ishlayman',
        dragDrop: 'Fayllarni bu yerga tashlang',
        orClick: 'yoki tanlash uchun bosing',
        files: 'Fayllar',
        notes: 'Qaydlar',
        newNote: 'Yangi Qayd',
        noNotes: 'Hali Qaydlar Yo\'q',
        createFirstNote: 'Boshlash uchun birinchi qaydingizni yarating',
        backToNotes: 'Qaydlarga Qaytish',
        noteName: 'Qayd Nomi',
        renameNote: 'Qayd Nomini O\'zgartirish'
    },
    ru: {
        chat: 'Чат',
        folders: 'Папки',
        newFolder: 'Новая Папка',
        folderName: 'Название Папки',
        cancel: 'Отмена',
        create: 'Создать',
        rename: 'Переименовать',
        delete: 'Удалить',
        deleteConfirm: 'Вы уверены, что хотите удалить это?',
        renameFolder: 'Переименовать Папку',
        save: 'Сохранить',
        chatTitle: 'AI Ассистент',
        chatDesc: 'Задайте мне любой вопрос, я работаю на MiniMax 2.5',
        dragDrop: 'Перетащите файлы сюда',
        orClick: 'или нажмите для выбора',
        files: 'Файлы',
        notes: 'Заметки',
        newNote: 'Новая Заметка',
        noNotes: 'Заметок Пока Нет',
        createFirstNote: 'Создайте первую заметку для начала',
        backToNotes: 'Назад к Заметкам',
        noteName: 'Название Заметки',
        renameNote: 'Переименовать Заметку'
    }
};

// State Management
let currentUser = null;
let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';
let folders = [];
let currentPage = 'chat';
let currentFolderId = null;
let currentNoteId = null;
let verificationData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    applyTheme();
});

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showMainApp();
    } else {
        document.getElementById('authScreen').classList.remove('hidden');
        initializeAuthListeners();
    }
}

function showMainApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('flex');
    
    loadUserData();
    
    document.getElementById('userInitial').textContent = currentUser.username[0].toUpperCase();
    document.getElementById('userDisplayName').textContent = currentUser.username;
    document.getElementById('userDisplayEmail').textContent = currentUser.email;
    
    applyLanguage();
    initializeEventListeners();
    renderFolders();
    navigateToPage('chat');
}

function loadUserData() {
    const userKey = `userData_${currentUser.email}`;
    const data = localStorage.getItem(userKey);
    if (data) {
        const parsed = JSON.parse(data);
        folders = parsed.folders || [];
    } else {
        folders = [];
    }
}

function saveUserData() {
    const userKey = `userData_${currentUser.email}`;
    localStorage.setItem(userKey, JSON.stringify({ folders }));
}

// Auth Listeners
function initializeAuthListeners() {
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginForm = document.getElementById('loginFormSubmit');
    const registerForm = document.getElementById('registerFormSubmit');
    const verifyForm = document.getElementById('verifyFormSubmit');
    const resendBtn = document.getElementById('resendCodeBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('verificationForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        });
    }

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (verifyForm) verifyForm.addEventListener('submit', handleVerify);
    if (resendBtn) resendBtn.addEventListener('click', resendCode);
    if (googleSignInBtn) googleSignInBtn.addEventListener('click', handleGoogleAuth);
    if (googleSignUpBtn) googleSignUpBtn.addEventListener('click', handleGoogleAuth);
}

function handleLogin(e) {
    e.preventDefault();
    const emailOrUsername = document.getElementById('loginEmailOrUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    } else {
        alert('Invalid credentials');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    if (users.find(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationData = { username, email, password, code };

    console.log('Verification code:', code);
    alert(`Verification code sent to ${email}!\n\nFor demo purposes, your code is: ${code}`);

    document.getElementById('verifyEmail').textContent = email;
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('verificationForm').classList.remove('hidden');
}

function handleVerify(e) {
    e.preventDefault();
    const code = document.getElementById('verifyCode').value.trim();

    if (code === verificationData.code) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = { 
            username: verificationData.username, 
            email: verificationData.email, 
            password: verificationData.password 
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        verificationData = null;
        showMainApp();
    } else {
        alert('Invalid verification code');
    }
}

function resendCode() {
    if (verificationData) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationData.code = code;
        console.log('New verification code:', code);
        alert(`New verification code sent!\n\nFor demo purposes, your code is: ${code}`);
    }
}

function handleGoogleAuth() {
    const randomNum = Math.floor(Math.random() * 10000);
    const username = 'GoogleUser' + randomNum;
    const email = 'googleuser' + randomNum + '@gmail.com';
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === email);
    
    if (!user) {
        user = { username, email, password: 'google_oauth_' + Date.now() };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert(`Successfully signed in with Google!\n\nUsername: ${username}\nEmail: ${email}`);
    showMainApp();
}

// Theme
function applyTheme() {
    document.body.className = `theme-${currentTheme} overflow-hidden`;
    if (document.getElementById('themeSelector')) {
        document.getElementById('themeSelector').value = currentTheme;
    }
}

// Language
function applyLanguage() {
    if (document.getElementById('langSwitch')) {
        document.getElementById('langSwitch').value = currentLang;
    }
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    
    // Update placeholders
    updatePlaceholders();
}

function updatePlaceholders() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        const placeholders = {
            en: 'Type your message...',
            uz: 'Xabaringizni yozing...',
            ru: 'Введите сообщение...'
        };
        chatInput.placeholder = placeholders[currentLang];
    }

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        const placeholders = {
            en: 'Search...',
            uz: 'Qidirish...',
            ru: 'Поиск...'
        };
        searchInput.placeholder = placeholders[currentLang];
    }

    const noteEditor = document.getElementById('noteEditor');
    if (noteEditor) {
        const placeholders = {
            en: 'Start typing your notes...',
            uz: 'Qaydlaringizni yozishni boshlang...',
            ru: 'Начните вводить заметки...'
        };
        noteEditor.setAttribute('data-placeholder', placeholders[currentLang]);
    }

    const noteTitle = document.getElementById('noteTitle');
    if (noteTitle) {
        const placeholders = {
            en: 'Note Title...',
            uz: 'Qayd Nomi...',
            ru: 'Название Заметки...'
        };
        noteTitle.placeholder = placeholders[currentLang];
    }
}

// Event Listeners
function initializeEventListeners() {
    // Theme
    document.getElementById('themeSelector').addEventListener('change', (e) => {
        currentTheme = e.target.value;
        localStorage.setItem('theme', currentTheme);
        applyTheme();
    });

    // Language
    document.getElementById('langSwitch').addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lang', currentLang);
        applyLanguage();
    });

    // User menu
    document.getElementById('userMenuBtn').addEventListener('click', () => {
        document.getElementById('userMenu').classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenuBtn') && !e.target.closest('#userMenu')) {
            document.getElementById('userMenu').classList.add('hidden');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        location.reload();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Folders
    document.getElementById('newFolderBtnSidebar').addEventListener('click', showCreateFolderModal);

    // Notes
    document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
    document.getElementById('backToNotesBtn').addEventListener('click', () => {
        navigateToPage('folder-' + currentFolderId);
    });

    // Search
    document.getElementById('globalSearch').addEventListener('input', handleSearch);

    // Chat
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    // Editor
    document.querySelectorAll('.editor-toolbar button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const command = btn.getAttribute('data-command');
            executeEditorCommand(command);
        });
    });

    const editor = document.getElementById('noteEditor');
    if (editor) {
        editor.addEventListener('input', autoSaveNote);
        editor.addEventListener('paste', handlePaste);
    }

    const noteTitle = document.getElementById('noteTitle');
    if (noteTitle) {
        noteTitle.addEventListener('input', autoSaveNote);
    }

    // File Upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleFileDrop(e.dataTransfer.files);
        });
    }
}

// Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const folderItems = document.querySelectorAll('#foldersList .folder-item');
    
    folderItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Navigation
function navigateToPage(page) {
    currentPage = page;
    
    // Hide all pages
    document.getElementById('chatPage').classList.add('hidden');
    document.getElementById('chatPage').classList.remove('flex');
    document.getElementById('folderPage').classList.add('hidden');
    document.getElementById('folderPage').classList.remove('flex');
    document.getElementById('noteEditorPage').classList.add('hidden');
    document.getElementById('noteEditorPage').classList.remove('flex');
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-blue-600');
    });
    
    const navBtn = document.querySelector(`[data-page="${page}"]`);
    if (navBtn) {
        navBtn.classList.add('bg-blue-600');
    }

    // Show selected page
    if (page === 'chat') {
        document.getElementById('chatPage').classList.remove('hidden');
        document.getElementById('chatPage').classList.add('flex');
        document.getElementById('pageTitle').textContent = translations[currentLang].chat || 'Chat';
    } else if (page.startsWith('folder-')) {
        const folderId = page.replace('folder-', '');
        currentFolderId = folderId;
        currentNoteId = null;
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            document.getElementById('folderPage').classList.remove('hidden');
            document.getElementById('folderPage').classList.add('flex');
            document.getElementById('pageTitle').textContent = folder.name;
            renderNotes(folder);
        }
    } else if (page.startsWith('note-')) {
        const noteId = page.replace('note-', '');
        currentNoteId = noteId;
        const folder = folders.find(f => f.id === currentFolderId);
        if (folder) {
            const note = folder.notes.find(n => n.id === noteId);
            if (note) {
                document.getElementById('noteEditorPage').classList.remove('hidden');
                document.getElementById('noteEditorPage').classList.add('flex');
                document.getElementById('pageTitle').textContent = note.title || 'Untitled Note';
                document.getElementById('noteTitle').value = note.title || '';
                document.getElementById('noteEditor').innerHTML = note.content || '';
                renderFiles(note);
            }
        }
    }
}

// Notes
function renderNotes(folder) {
    const grid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('notesEmptyState');
    
    if (!folder.notes || folder.notes.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    grid.innerHTML = '';
    
    folder.notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card bg-secondary border border-main rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all group';
        
        const preview = note.content ? note.content.replace(/<[^>]*>/g, '').substring(0, 100) : 'Empty note...';
        const fileCount = note.files ? note.files.length : 0;
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-semibold text-primary truncate flex-1">${escapeHtml(note.title || 'Untitled Note')}</h3>
                <div class="note-actions flex gap-1 ml-2">
                    <button class="rename-note-btn p-1.5 hover:bg-tertiary rounded transition-colors">
                        <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                    </button>
                    <button class="delete-note-btn p-1.5 hover:bg-red-600/10 rounded transition-colors">
                        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-secondary mb-3 line-clamp-3">${escapeHtml(preview)}</p>
            <div class="flex items-center gap-4 text-xs text-secondary">
                <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>${formatDate(note.updatedAt || note.createdAt)}</span>
                </div>
                ${fileCount > 0 ? `
                <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                    <span>${fileCount}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.note-actions')) {
                navigateToPage('note-' + note.id);
            }
        });
        
        card.querySelector('.rename-note-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showRenameNoteModal(note.id);
        });
        
        card.querySelector('.delete-note-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteModal(note.id, 'note');
        });
        
        grid.appendChild(card);
    });
}

function createNewNote() {
    if (!currentFolderId) return;
    const folder = folders.find(f => f.id === currentFolderId);
    if (!folder) return;
    
    if (!folder.notes) folder.notes = [];
    
    const note = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    folder.notes.push(note);
    saveUserData();
    navigateToPage('note-' + note.id);
}

function renameNote(noteId, newTitle) {
    const folder = folders.find(f => f.id === currentFolderId);
    if (folder && folder.notes) {
        const note = folder.notes.find(n => n.id === noteId);
        if (note) {
            note.title = newTitle;
            note.updatedAt = new Date().toISOString();
            saveUserData();
            renderNotes(folder);
            if (currentNoteId === noteId) {
                document.getElementById('pageTitle').textContent = newTitle;
            }
        }
    }
}

function deleteNote(noteId) {
    const folder = folders.find(f => f.id === currentFolderId);
    if (folder && folder.notes) {
        folder.notes = folder.notes.filter(n => n.id !== noteId);
        saveUserData();
        renderNotes(folder);
    }
}

function autoSaveNote() {
    if (!currentNoteId || !currentFolderId) return;
    
    const folder = folders.find(f => f.id === currentFolderId);
    if (folder && folder.notes) {
        const note = folder.notes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = document.getElementById('noteTitle').value || 'Untitled Note';
            note.content = document.getElementById('noteEditor').innerHTML;
            note.updatedAt = new Date().toISOString();
            document.getElementById('pageTitle').textContent = note.title;
            saveUserData();
        }
    }
}

// Editor
function executeEditorCommand(command) {
    const editor = document.getElementById('noteEditor');
    editor.focus();

    if (command === 'h1' || command === 'h2' || command === 'h3') {
        document.execCommand('formatBlock', false, command);
    } else if (command === 'bold') {
        document.execCommand('bold');
    } else if (command === 'italic') {
        document.execCommand('italic');
    } else if (command === 'underline') {
        document.execCommand('underline');
    } else if (command === 'ul') {
        document.execCommand('insertUnorderedList');
    } else if (command === 'ol') {
        document.execCommand('insertOrderedList');
    }

    autoSaveNote();
}

function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
}

// Files
function handleFileSelect(e) {
    handleFileDrop(e.target.files);
}

function handleFileDrop(files) {
    if (!currentNoteId || !currentFolderId) return;
    const folder = folders.find(f => f.id === currentFolderId);
    if (!folder || !folder.notes) return;
    
    const note = folder.notes.find(n => n.id === currentNoteId);
    if (!note) return;

    if (!note.files) note.files = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileObj = {
                id: Date.now().toString() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            note.files.push(fileObj);
            note.updatedAt = new Date().toISOString();
            saveUserData();
            renderFiles(note);
        };
        reader.readAsDataURL(file);
    });
}

function renderFiles(note) {
    const filesSection = document.getElementById('filesSection');
    const filesGrid = document.getElementById('filesGrid');

    if (!note.files || note.files.length === 0) {
        filesSection.classList.add('hidden');
        return;
    }

    filesSection.classList.remove('hidden');
    filesGrid.innerHTML = '';

    note.files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card bg-secondary border border-main rounded-xl overflow-hidden shadow-md';
        
        let preview = '';
        if (file.type.startsWith('image/')) {
            preview = `<img src="${file.data}" class="w-full h-40 object-cover">`;
        } else if (file.type.startsWith('video/')) {
            preview = `<video src="${file.data}" class="w-full h-40 object-cover"></video>`;
        } else if (file.type === 'application/pdf') {
            preview = `<div class="w-full h-40 bg-red-600/10 flex items-center justify-center"><svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>`;
        } else {
            preview = `<div class="w-full h-40 bg-blue-600/10 flex items-center justify-center"><svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>`;
        }

        card.innerHTML = `
            ${preview}
            <div class="p-3">
                <p class="text-sm font-medium truncate mb-1 text-primary">${escapeHtml(file.name)}</p>
                <p class="text-xs text-secondary">${formatFileSize(file.size)}</p>
                <div class="flex gap-2 mt-3">
                    <button class="download-btn flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors text-white font-medium">Download</button>
                    <button class="delete-file-btn px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded text-xs transition-colors font-medium">Delete</button>
                </div>
            </div>
        `;

        card.querySelector('.download-btn').addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = file.data;
            a.download = file.name;
            a.click();
        });

        card.querySelector('.delete-file-btn').addEventListener('click', () => {
            note.files = note.files.filter(f => f.id !== file.id);
            note.updatedAt = new Date().toISOString();
            saveUserData();
            renderFiles(note);
        });

        filesGrid.appendChild(card);
    });
}

// Folders
function renderFolders() {
    const list = document.getElementById('foldersList');
    list.innerHTML = '';

    if (folders.length === 0) {
        list.innerHTML = `<p class="text-secondary text-xs text-center p-4">No folders yet</p>`;
        return;
    }

    folders.forEach(folder => {
        const item = document.createElement('button');
        item.className = 'folder-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-primary hover:bg-secondary group';
        item.setAttribute('data-folder-id', folder.id);
        
        const noteCount = folder.notes ? folder.notes.length : 0;
        
        item.innerHTML = `
            <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            <span class="flex-1 text-left truncate">${escapeHtml(folder.name)}</span>
            ${noteCount > 0 ? `<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">${noteCount}</span>` : ''}
            <div class="folder-actions flex gap-1">
                <button class="rename-folder-btn p-1 hover:bg-tertiary rounded">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
                <button class="delete-folder-btn p-1 hover:bg-red-600/10 rounded">
                    <svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        item.addEventListener('click', (e) => {
            if (!e.target.closest('.folder-actions')) {
                navigateToPage('folder-' + folder.id);
            }
        });

        item.querySelector('.rename-folder-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showRenameFolderModal(folder.id);
        });

        item.querySelector('.delete-folder-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteModal(folder.id, 'folder');
        });

        list.appendChild(item);
    });
}

function createFolder(name) {
    const folder = {
        id: Date.now().toString(),
        name,
        notes: [],
        createdAt: new Date().toISOString()
    };
    folders.push(folder);
    saveUserData();
    renderFolders();
}

function renameFolder(folderId, newName) {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
        folder.name = newName;
        saveUserData();
        renderFolders();
        if (currentFolderId === folderId) {
            document.getElementById('pageTitle').textContent = newName;
        }
    }
}

function deleteFolder(folderId) {
    folders = folders.filter(f => f.id !== folderId);
    saveUserData();
    renderFolders();
    if (currentFolderId === folderId) {
        navigateToPage('chat');
    }
}

// Modals
function showModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
        hideModal();
    }
});

function showCreateFolderModal() {
    const content = `
        <h3 class="text-xl font-semibold mb-4 text-primary">${translations[currentLang].newFolder}</h3>
        <form id="createFolderForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2 text-primary">${translations[currentLang].folderName}</label>
                <input type="text" id="folderNameInput" class="w-full bg-tertiary border border-main rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-primary" required>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" id="cancelBtn" class="flex-1 px-4 py-2 border border-main rounded-lg hover:bg-tertiary transition-colors text-primary">${translations[currentLang].cancel}</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white">${translations[currentLang].create}</button>
            </div>
        </form>
    `;
    showModal(content);

    document.getElementById('cancelBtn').addEventListener('click', hideModal);
    document.getElementById('createFolderForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('folderNameInput').value.trim();
        if (name) {
            createFolder(name);
            hideModal();
        }
    });

    setTimeout(() => document.getElementById('folderNameInput').focus(), 100);
}

function showRenameFolderModal(folderId) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const content = `
        <h3 class="text-xl font-semibold mb-4 text-primary">${translations[currentLang].renameFolder}</h3>
        <form id="renameFolderForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2 text-primary">${translations[currentLang].folderName}</label>
                <input type="text" id="newFolderNameInput" class="w-full bg-tertiary border border-main rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-primary" value="${escapeHtml(folder.name)}" required>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" id="cancelBtn" class="flex-1 px-4 py-2 border border-main rounded-lg hover:bg-tertiary transition-colors text-primary">${translations[currentLang].cancel}</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white">${translations[currentLang].save}</button>
            </div>
        </form>
    `;
    showModal(content);

    document.getElementById('cancelBtn').addEventListener('click', hideModal);
    document.getElementById('renameFolderForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('newFolderNameInput').value.trim();
        if (newName) {
            renameFolder(folderId, newName);
            hideModal();
        }
    });

    setTimeout(() => {
        const input = document.getElementById('newFolderNameInput');
        input.focus();
        input.select();
    }, 100);
}

function showRenameNoteModal(noteId) {
    const folder = folders.find(f => f.id === currentFolderId);
    if (!folder || !folder.notes) return;
    
    const note = folder.notes.find(n => n.id === noteId);
    if (!note) return;

    const content = `
        <h3 class="text-xl font-semibold mb-4 text-primary">${translations[currentLang].renameNote}</h3>
        <form id="renameNoteForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2 text-primary">${translations[currentLang].noteName}</label>
                <input type="text" id="newNoteNameInput" class="w-full bg-tertiary border border-main rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-primary" value="${escapeHtml(note.title)}" required>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="button" id="cancelBtn" class="flex-1 px-4 py-2 border border-main rounded-lg hover:bg-tertiary transition-colors text-primary">${translations[currentLang].cancel}</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white">${translations[currentLang].save}</button>
            </div>
        </form>
    `;
    showModal(content);

    document.getElementById('cancelBtn').addEventListener('click', hideModal);
    document.getElementById('renameNoteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('newNoteNameInput').value.trim();
        if (newName) {
            renameNote(noteId, newName);
            hideModal();
        }
    });

    setTimeout(() => {
        const input = document.getElementById('newNoteNameInput');
        input.focus();
        input.select();
    }, 100);
}

function showDeleteModal(id, type) {
    const content = `
        <h3 class="text-xl font-semibold mb-4 text-primary">${translations[currentLang].delete}</h3>
        <p class="text-secondary mb-6">${translations[currentLang].deleteConfirm}</p>
        <div class="flex gap-3">
            <button id="cancelBtn" class="flex-1 px-4 py-2 border border-main rounded-lg hover:bg-tertiary transition-colors text-primary">${translations[currentLang].cancel}</button>
            <button id="confirmDeleteBtn" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white">${translations[currentLang].delete}</button>
        </div>
    `;
    showModal(content);

    document.getElementById('cancelBtn').addEventListener('click', hideModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (type === 'folder') {
            deleteFolder(id);
        } else if (type === 'note') {
            deleteNote(id);
        }
        hideModal();
    });
}

// Chat with MiniMax 2.5 via OpenRouter
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chatMessages').querySelector('.max-w-4xl');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message flex justify-end';
    userMsg.innerHTML = `
        <div class="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[70%] shadow-lg">
            ${escapeHtml(message)}
        </div>
    `;
    messagesContainer.appendChild(userMsg);

    input.value = '';

    // Add typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message flex justify-start';
    typingMsg.innerHTML = `
        <div class="bg-secondary border border-main rounded-2xl px-4 py-3 shadow-lg">
            <div class="typing-indicator flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingMsg);
    messagesContainer.parentElement.scrollTop = messagesContainer.parentElement.scrollHeight;

    try {
        const response = await callMinimaxAPI(message);
        typingMsg.remove();

        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message flex justify-start';
        aiMsg.innerHTML = `
            <div class="bg-secondary border border-main rounded-2xl px-4 py-3 max-w-[70%] text-primary shadow-lg">
                ${escapeHtml(response)}
            </div>
        `;
        messagesContainer.appendChild(aiMsg);
    } catch (error) {
        typingMsg.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chat-message flex justify-start';
        errorMsg.innerHTML = `
            <div class="bg-red-600/10 border border-red-600/20 text-red-400 rounded-2xl px-4 py-3 max-w-[70%] shadow-lg">
                Error: ${escapeHtml(error.message)}
            </div>
        `;
        messagesContainer.appendChild(errorMsg);
    }

    messagesContainer.parentElement.scrollTop = messagesContainer.parentElement.scrollHeight;
}

async function callMinimaxAPI(message) {
    const key = API_KEYS.openrouter[currentKeyIndex];
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Lumina Notes'
            },
            body: JSON.stringify({
                model: 'minimax/minimax-01',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.openrouter.length;
            if (currentKeyIndex === 0) throw new Error('All API keys exhausted');
            return await callMinimaxAPI(message);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw error;
    }
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
}
