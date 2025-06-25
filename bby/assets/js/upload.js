class GalaxyUploader {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.fileGrid = document.getElementById('fileGrid');
        this.notification = document.getElementById('notification');
        
        this.files = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        this.initializeEventListeners();
        this.loadExistingFiles();
        this.updateStats();
    }

    initializeEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            if (!this.uploadProgress.style.display || this.uploadProgress.style.display === 'none') {
                this.fileInput.click();
            }
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Notification close
        document.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification();
        });

        // Prevent default drag behaviors on the document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    async handleFiles(fileList) {
        const files = Array.from(fileList);
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showNotification('No valid image files selected', 'error');
            return;
        }

        if (validFiles.length !== files.length) {
            this.showNotification(`${files.length - validFiles.length} files were skipped (invalid type or too large)`, 'warning');
        }

        await this.uploadFiles(validFiles);
    }

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            return false;
        }
        if (file.size > this.maxFileSize) {
            return false;
        }
        return true;
    }

    async uploadFiles(files) {
        this.showUploadProgress();
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            
            try {
                await this.uploadSingleFile(file);
                this.updateProgress(progress, `Uploading ${i + 1} of ${files.length}...`);
                
                // Simulate upload time for demo
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error('Upload error:', error);
                this.showNotification(`Failed to upload ${file.name}`, 'error');
            }
        }

        this.hideUploadProgress();
        this.loadExistingFiles();
        this.updateStats();
        this.showNotification(`Successfully uploaded ${files.length} file(s) to your galaxy!`, 'success');
        
        // Reset file input
        this.fileInput.value = '';
    }

    async uploadSingleFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Upload failed');
        }

        return result;
    }

    async loadExistingFiles() {
        try {
            const response = await fetch('api/files.php');
            const data = await response.json();
            
            if (data.success) {
                this.files = data.files;
                this.renderFileGrid();
            }
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    }

    renderFileGrid() {
        this.fileGrid.innerHTML = '';
        
        this.files.forEach(file => {
            const fileCard = this.createFileCard(file);
            this.fileGrid.appendChild(fileCard);
        });
    }

    createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <img src="${file.thumbnail || file.path}" alt="${file.name}" class="file-image" loading="lazy">
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-meta">
                    <span>${this.formatFileSize(file.size)}</span>
                    <span>${this.formatDate(file.upload_date)}</span>
                </div>
            </div>
        `;

        // Add click animation
        card.addEventListener('click', () => {
            this.previewFile(file);
        });

        return card;
    }

    previewFile(file) {
        // Create modal for file preview
        const modal = document.createElement('div');
        modal.className = 'file-preview-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <img src="${file.path}" alt="${file.name}" class="preview-image">
                <div class="preview-info">
                    <h3>${file.name}</h3>
                    <p>Size: ${this.formatFileSize(file.size)}</p>
                    <p>Uploaded: ${this.formatDate(file.upload_date)}</p>
                    <button class="close-modal">&times;</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        const closeModal = () => {
            modal.remove();
        };

        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });

        // Animate modal in
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });
    }

    updateStats() {
        const totalFiles = this.files.length;
        const totalSize = this.files.reduce((sum, file) => sum + (file.size || 0), 0);
        const lastUpload = this.files.length > 0 
            ? new Date(Math.max(...this.files.map(f => new Date(f.upload_date))))
            : null;

        document.getElementById('totalFiles').textContent = totalFiles;
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
        document.getElementById('lastUpload').textContent = lastUpload 
            ? this.formatDate(lastUpload.toISOString())
            : 'Never';
    }

    showUploadProgress() {
        document.querySelector('.upload-content').style.display = 'none';
        this.uploadProgress.style.display = 'block';
        this.updateProgress(0, 'Preparing upload...');
    }

    hideUploadProgress() {
        this.uploadProgress.style.display = 'none';
        document.querySelector('.upload-content').style.display = 'block';
        this.updateProgress(0, '');
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    showNotification(message, type = 'info') {
        const notification = this.notification;
        const messageEl = notification.querySelector('.notification-message');
        
        messageEl.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification() {
        this.notification.classList.remove('show');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Enhanced CSS for modal (add to upload.css)
const modalStyles = `
.file-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    background: var(--bg-card);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.preview-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    display: block;
}

.preview-info {
    padding: 1.5rem;
    position: relative;
}

.preview-info h3 {
    margin-bottom: 1rem;
    color: var(--text-light);
}

.preview-info p {
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 2rem;
    cursor: pointer;
    transition: color 0.3s ease;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
}

.close-modal:hover {
    color: var(--text-light);
    background: rgba(0, 0, 0, 0.7);
}
`;

// Add modal styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Initialize the uploader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GalaxyUploader();
});
