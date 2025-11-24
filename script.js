// Gestion des données de la procédure de consignation
class ConsignmentProcedure {
    constructor() {
        this.data = {
            info: {},
            warnings: {},
            materials: [],
            epiEpc: [],
            steps: [],
            improvements: []
        };
        this.epiEpcSuggestions = this.initEpiEpcSuggestions();
        this.init();
    }
    
    initEpiEpcSuggestions() {
        return {
            'EPI': {
                'électrique': [
                    'Casque isolant',
                    'Lunettes isolantes',
                    'Gants isolants',
                    'Écran facial isolant',
                    'Vêtements isolants',
                    'Chaussures isolantes'
                ],
                'mécanique': [
                    'Casque de chantier',
                    'Lunettes de protection',
                    'Gants anti-coupure',
                    'Protections auditives',
                    'Masque respiratoire',
                    'Harnais de sécurité'
                ],
                'commun': [
                    'Chaussures de sécurité',
                    'Gilet haute visibilité',
                    'Vêtements de travail',
                    'Gants de manutention'
                ]
            },
            'EPC': {
                'électrique': [
                    'Appareil de test VAT',
                    'Tapis isolant',
                    'Nappe isolante',
                    'Cadenas de consignation électrique',
                    'Dispositif de mise à la terre',
                    'Pancarte de consignation'
                ],
                'mécanique': [
                    'Protecteur de machine',
                    'Garde-corps',
                    'Filet de sécurité',
                    'Barrières de protection'
                ],
                'commun': [
                    'Serrure de consignation',
                    'Barrières de sécurité',
                    'Signalisation de sécurité',
                    'Extincteur',
                    'Trousse de premiers secours',
                    'Éclairage de sécurité'
                ]
            }
        };
    }

    init() {
        this.setupEventListeners();
        this.loadFromStorage();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Informations sur l'intervention
        const infoFields = ['titre', 'description', 'date', 'numero', 'personnel', 'localisation'];
        infoFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('change', () => this.saveInfo());
                element.addEventListener('input', () => this.saveInfo());
            }
        });
        
        // EPI/EPC suggestions
        const epiEpcInput = document.getElementById('epi-epc-input');
        if (epiEpcInput) {
            epiEpcInput.addEventListener('input', (e) => this.handleEpiEpcInput(e));
            epiEpcInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const firstSuggestion = document.querySelector('.suggestion-item');
                    if (firstSuggestion) {
                        firstSuggestion.click();
                    }
                } else if (e.key === 'Escape') {
                    this.hideSuggestions();
                }
            });
        }
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const container = document.querySelector('.epi-epc-input-container');
            if (container && !container.contains(e.target)) {
                this.hideSuggestions();
            }
        });
        
        // Avertissements with markdown support
        const warningFields = ['danger', 'analyse-risques'];
        warningFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('change', () => this.saveWarnings());
                element.addEventListener('input', () => {
                    this.saveWarnings();
                    this.updateMarkdownPreview(field);
                });
            }
        });

        // Matériel nécessaire
        document.getElementById('add-material-btn').addEventListener('click', () => this.addMaterial());
        ['new-material-designation', 'new-material-quantity', 'new-material-price'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addMaterial();
            });
        });

        // Instructions de consignation
        document.getElementById('add-step-btn').addEventListener('click', () => this.addStep());

        // Pistes d'amélioration
        document.getElementById('add-improvement-btn').addEventListener('click', () => this.addImprovement());
        document.getElementById('new-improvement').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addImprovement();
        });

        // Actions principales
        document.getElementById('save-btn').addEventListener('click', () => this.saveToFile());
        document.getElementById('load-btn').addEventListener('click', () => this.loadFromFile());
        document.getElementById('print-btn').addEventListener('click', () => window.print());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
    }

    saveInfo() {
        this.data.info = {
            titre: document.getElementById('titre').value,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
            numero: document.getElementById('numero').value,
            personnel: document.getElementById('personnel').value,
            localisation: document.getElementById('localisation').value
        };
        this.saveToStorage();
    }
    
    handleEpiEpcInput(e) {
        const query = e.target.value.toLowerCase().trim();
        const suggestionsDiv = document.getElementById('epi-epc-suggestions');
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const matches = [];
        Object.keys(this.epiEpcSuggestions).forEach(type => {
            Object.keys(this.epiEpcSuggestions[type]).forEach(category => {
                this.epiEpcSuggestions[type][category].forEach(item => {
                    if (item.toLowerCase().includes(query)) {
                        matches.push({ type, category, name: item });
                    }
                });
            });
        });
        
        if (matches.length > 0) {
            this.showSuggestions(matches);
        } else {
            this.hideSuggestions();
        }
    }
    
    showSuggestions(matches) {
        const suggestionsDiv = document.getElementById('epi-epc-suggestions');
        suggestionsDiv.innerHTML = '';
        
        // Group by type and category
        const grouped = {};
        matches.forEach(match => {
            const key = `${match.type}-${match.category}`;
            if (!grouped[key]) {
                grouped[key] = {
                    type: match.type,
                    category: match.category,
                    items: []
                };
            }
            grouped[key].items.push(match.name);
        });
        
        Object.values(grouped).forEach(group => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'suggestion-category';
            categoryDiv.textContent = `${group.type} - ${group.category}`;
            suggestionsDiv.appendChild(categoryDiv);
            
            group.items.forEach(itemName => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'suggestion-item';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'suggestion-name';
                nameSpan.textContent = itemName;
                
                const badgesDiv = document.createElement('div');
                badgesDiv.className = 'suggestion-badges';
                
                const typeBadge = document.createElement('span');
                typeBadge.className = `badge badge-${group.type.toLowerCase()}`;
                typeBadge.textContent = group.type;
                
                const catBadge = document.createElement('span');
                catBadge.className = `badge badge-${group.category}`;
                catBadge.textContent = group.category;
                
                badgesDiv.appendChild(typeBadge);
                badgesDiv.appendChild(catBadge);
                
                itemDiv.appendChild(nameSpan);
                itemDiv.appendChild(badgesDiv);
                
                itemDiv.addEventListener('click', () => {
                    this.addEpiEpc(itemName, group.type, group.category);
                    document.getElementById('epi-epc-input').value = '';
                    this.hideSuggestions();
                });
                
                suggestionsDiv.appendChild(itemDiv);
            });
        });
        
        suggestionsDiv.classList.add('show');
    }
    
    hideSuggestions() {
        const suggestionsDiv = document.getElementById('epi-epc-suggestions');
        suggestionsDiv.classList.remove('show');
    }
    
    addEpiEpc(name, type, category) {
        // Check if already added
        const exists = this.data.epiEpc.find(item => item.name === name);
        if (exists) {
            this.showNotification('⚠️ Cet équipement est déjà dans la liste', 'info');
            return;
        }
        
        this.data.epiEpc.push({ name, type, category });
        this.updateEpiEpcList();
        this.saveToStorage();
    }
    
    removeEpiEpc(index) {
        this.data.epiEpc.splice(index, 1);
        this.updateEpiEpcList();
        this.saveToStorage();
    }
    
    updateEpiEpcList() {
        const list = document.getElementById('epi-epc-list');
        list.innerHTML = '';
        
        this.data.epiEpc.forEach((item, index) => {
            const tag = document.createElement('div');
            tag.className = 'epi-epc-tag';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'tag-name';
            nameSpan.textContent = item.name;
            
            const badgesDiv = document.createElement('div');
            badgesDiv.className = 'suggestion-badges';
            
            const typeBadge = document.createElement('span');
            typeBadge.className = `badge badge-${item.type.toLowerCase()}`;
            typeBadge.textContent = item.type;
            
            const catBadge = document.createElement('span');
            catBadge.className = `badge badge-${item.category}`;
            catBadge.textContent = item.category;
            
            badgesDiv.appendChild(typeBadge);
            badgesDiv.appendChild(catBadge);
            
            const removeSpan = document.createElement('span');
            removeSpan.className = 'tag-remove';
            removeSpan.textContent = '×';
            removeSpan.onclick = () => this.removeEpiEpc(index);
            
            tag.appendChild(nameSpan);
            tag.appendChild(badgesDiv);
            tag.appendChild(removeSpan);
            list.appendChild(tag);
        });
    }
    
    updateMarkdownPreview(fieldId) {
        const textarea = document.getElementById(fieldId);
        const preview = document.getElementById(`${fieldId}-preview`);
        
        if (!textarea || !preview) return;
        
        const text = textarea.value;
        if (!text.trim()) {
            preview.classList.remove('show');
            return;
        }
        
        // Simple markdown parsing
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert lists
        const lines = html.split('\n');
        let inList = false;
        let result = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                if (!inList) {
                    result.push('<ul>');
                    inList = true;
                }
                result.push(`<li>${trimmed.substring(1).trim()}</li>`);
            } else if (trimmed.match(/^\d+\./)) {
                if (!inList) {
                    result.push('<ol>');
                    inList = true;
                }
                result.push(`<li>${trimmed.replace(/^\d+\./, '').trim()}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                if (trimmed) {
                    result.push(`<p>${trimmed}</p>`);
                }
            }
        });
        
        if (inList) {
            result.push('</ul>');
        }
        
        preview.innerHTML = result.join('');
        preview.classList.add('show');
    }

    saveWarnings() {
        this.data.warnings = {
            danger: document.getElementById('danger').value,
            analyseRisques: document.getElementById('analyse-risques').value
        };
        this.saveToStorage();
    }

    addMaterial() {
        const designation = document.getElementById('new-material-designation').value.trim();
        const quantity = parseInt(document.getElementById('new-material-quantity').value) || 1;
        const price = parseFloat(document.getElementById('new-material-price').value) || 0;
        
        if (!designation) {
            this.showNotification('⚠️ Veuillez entrer une désignation', 'error');
            return;
        }
        
        this.data.materials.push({
            designation,
            quantity,
            price
        });
        
        document.getElementById('new-material-designation').value = '';
        document.getElementById('new-material-quantity').value = '1';
        document.getElementById('new-material-price').value = '';
        
        this.updateMaterialList();
        this.saveToStorage();
    }

    removeMaterial(index) {
        this.data.materials.splice(index, 1);
        this.updateMaterialList();
        this.saveToStorage();
    }

    updateMaterialList() {
        const tbody = document.getElementById('material-table-body');
        tbody.innerHTML = '';
        
        let total = 0;
        
        this.data.materials.forEach((material, index) => {
            const row = document.createElement('div');
            row.className = 'material-row';
            
            const designationDiv = document.createElement('div');
            designationDiv.textContent = material.designation;
            
            const quantityDiv = document.createElement('div');
            quantityDiv.textContent = material.quantity;
            
            const priceDiv = document.createElement('div');
            priceDiv.textContent = `${material.price.toFixed(2)} €`;
            
            const totalDiv = document.createElement('div');
            const itemTotal = material.quantity * material.price;
            totalDiv.textContent = `${itemTotal.toFixed(2)} €`;
            total += itemTotal;
            
            const actionsDiv = document.createElement('div');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-small';
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.onclick = () => this.removeMaterial(index);
            actionsDiv.appendChild(deleteBtn);
            
            row.appendChild(designationDiv);
            row.appendChild(quantityDiv);
            row.appendChild(priceDiv);
            row.appendChild(totalDiv);
            row.appendChild(actionsDiv);
            
            tbody.appendChild(row);
        });
        
        document.getElementById('material-total').innerHTML = `<strong>${total.toFixed(2)} €</strong>`;
    }

    addStep() {
        // Use crypto.randomUUID with a robust fallback
        let id;
        if (crypto.randomUUID) {
            id = crypto.randomUUID();
        } else {
            // Fallback: combine timestamp with counter for better uniqueness
            if (!this._stepCounter) this._stepCounter = 0;
            id = `step-${Date.now()}-${++this._stepCounter}`;
        }
        
        const step = {
            id: id,
            repere: '',
            instruction: '',
            photo: ''
        };
        this.data.steps.push(step);
        this.updateStepsList();
        this.saveToStorage();
    }

    removeStep(id) {
        this.data.steps = this.data.steps.filter(step => step.id !== id);
        this.updateStepsList();
        this.saveToStorage();
    }

    updateStepData(id, field, value) {
        const step = this.data.steps.find(s => s.id === id);
        if (step) {
            step[field] = value;
            this.saveToStorage();
        }
    }

    handlePhotoUpload(id, file) {
        if (file && file.type.startsWith('image/')) {
            // Limit file size to 2MB to avoid localStorage issues
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                this.showNotification('❌ La photo est trop grande. Taille maximale: 2MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.updateStepData(id, 'photo', e.target.result);
                this.updateStepsList();
            };
            reader.readAsDataURL(file);
        }
    }

    updateStepsList() {
        const tbody = document.getElementById('instructions-body');
        tbody.innerHTML = '';
        
        this.data.steps.forEach((step, index) => {
            const row = document.createElement('div');
            row.className = 'step-row';
            
            // Column: Repere
            const colRepere = document.createElement('div');
            colRepere.className = 'col-repere';
            const inputRepere = document.createElement('input');
            inputRepere.type = 'text';
            inputRepere.placeholder = `Repère ${index + 1}`;
            inputRepere.value = step.repere;
            inputRepere.onchange = (e) => this.updateStepData(step.id, 'repere', e.target.value);
            colRepere.appendChild(inputRepere);
            
            // Column: Instruction
            const colInstruction = document.createElement('div');
            colInstruction.className = 'col-instruction';
            const textareaInstruction = document.createElement('textarea');
            textareaInstruction.placeholder = "Description de l'instruction...";
            textareaInstruction.value = step.instruction;
            textareaInstruction.onchange = (e) => this.updateStepData(step.id, 'instruction', e.target.value);
            colInstruction.appendChild(textareaInstruction);
            
            // Column: Photo
            const colPhoto = document.createElement('div');
            colPhoto.className = 'col-photo';
            const photoUpload = document.createElement('div');
            photoUpload.className = 'photo-upload';
            
            if (step.photo) {
                // Validate that photo is a data URL before using it
                if (step.photo.startsWith('data:image/')) {
                    const img = document.createElement('img');
                    img.src = step.photo;
                    img.className = 'photo-preview';
                    img.alt = 'Photo';
                    photoUpload.appendChild(img);
                }
            }
            
            const label = document.createElement('label');
            label.className = 'photo-label';
            label.textContent = `📷 ${step.photo && step.photo.startsWith('data:image/') ? 'Changer' : 'Ajouter'} photo`;
            const inputFile = document.createElement('input');
            inputFile.type = 'file';
            inputFile.accept = 'image/*';
            inputFile.onchange = (e) => this.handlePhotoUpload(step.id, e.target.files[0]);
            label.appendChild(inputFile);
            photoUpload.appendChild(label);
            colPhoto.appendChild(photoUpload);
            
            // Actions
            const stepActions = document.createElement('div');
            stepActions.className = 'step-actions';
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn btn-danger btn-small';
            btnDelete.textContent = '🗑️ Supprimer l\'étape';
            btnDelete.onclick = () => this.removeStep(step.id);
            stepActions.appendChild(btnDelete);
            
            // Append all columns
            row.appendChild(colRepere);
            row.appendChild(colInstruction);
            row.appendChild(colPhoto);
            row.appendChild(stepActions);
            tbody.appendChild(row);
        });
    }

    addImprovement() {
        const input = document.getElementById('new-improvement');
        const improvement = input.value.trim();
        
        if (improvement) {
            this.data.improvements.push(improvement);
            input.value = '';
            this.updateImprovementList();
            this.saveToStorage();
        }
    }

    removeImprovement(index) {
        this.data.improvements.splice(index, 1);
        this.updateImprovementList();
        this.saveToStorage();
    }

    updateImprovementList() {
        const list = document.getElementById('improvement-list');
        list.innerHTML = '';
        
        this.data.improvements.forEach((improvement, index) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = improvement;
            
            const button = document.createElement('button');
            button.className = 'btn btn-danger btn-small';
            button.textContent = 'Supprimer';
            button.onclick = () => this.removeImprovement(index);
            
            li.appendChild(span);
            li.appendChild(button);
            list.appendChild(li);
        });
    }

    updateDisplay() {
        // Charger les informations
        if (this.data.info) {
            document.getElementById('titre').value = this.data.info.titre || '';
            document.getElementById('description').value = this.data.info.description || '';
            document.getElementById('date').value = this.data.info.date || '';
            document.getElementById('numero').value = this.data.info.numero || '';
            document.getElementById('personnel').value = this.data.info.personnel || '';
            document.getElementById('localisation').value = this.data.info.localisation || '';
        }

        // Charger les avertissements
        if (this.data.warnings) {
            document.getElementById('danger').value = this.data.warnings.danger || '';
            document.getElementById('analyse-risques').value = this.data.warnings.analyseRisques || '';
            
            // Update markdown previews
            this.updateMarkdownPreview('danger');
            this.updateMarkdownPreview('analyse-risques');
        }

        // Afficher les listes
        this.updateEpiEpcList();
        this.updateMaterialList();
        this.updateStepsList();
        this.updateImprovementList();
    }

    saveToStorage() {
        try {
            localStorage.setItem('consignmentProcedure', JSON.stringify(this.data));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde:', e);
            this.showNotification('⚠️ Impossible de sauvegarder automatiquement. Utilisez le bouton Enregistrer.', 'error');
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('consignmentProcedure');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate data structure
                if (parsed && typeof parsed === 'object') {
                    this.data = {
                        info: parsed.info || {},
                        warnings: parsed.warnings || {},
                        materials: Array.isArray(parsed.materials) ? parsed.materials : [],
                        epiEpc: Array.isArray(parsed.epiEpc) ? parsed.epiEpc : [],
                        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
                        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : []
                    };
                }
            }
        } catch (e) {
            console.error('Erreur lors du chargement:', e);
            this.showNotification('⚠️ Impossible de charger les données sauvegardées.', 'error');
        }
    }

    saveToFile() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        // Sanitize filename to prevent invalid characters (only alphanumeric and underscore)
        const sanitizedNumero = (this.data.info.numero || 'procedure').replace(/[^a-z0-9_]/gi, '_');
        link.download = `consignation-${sanitizedNumero}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('✅ Procédure enregistrée avec succès!', 'success');
    }

    loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const parsed = JSON.parse(event.target.result);
                        // Validate data structure before loading
                        if (parsed && typeof parsed === 'object') {
                            this.data = {
                                info: parsed.info || {},
                                warnings: parsed.warnings || {},
                                materials: Array.isArray(parsed.materials) ? parsed.materials : [],
                                epiEpc: Array.isArray(parsed.epiEpc) ? parsed.epiEpc : [],
                                steps: Array.isArray(parsed.steps) ? parsed.steps : [],
                                improvements: Array.isArray(parsed.improvements) ? parsed.improvements : []
                            };
                            this.updateDisplay();
                            this.saveToStorage();
                            this.showNotification('✅ Procédure chargée avec succès!', 'success');
                        } else {
                            this.showNotification('❌ Format de fichier invalide', 'error');
                        }
                    } catch (error) {
                        this.showNotification('❌ Erreur lors du chargement du fichier', 'error');
                        console.error('Erreur:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearAll() {
        if (confirm('⚠️ Êtes-vous sûr de vouloir effacer toutes les données? Cette action est irréversible.')) {
            this.data = {
                info: {},
                warnings: {},
                materials: [],
                epiEpc: [],
                steps: [],
                improvements: []
            };
            this.updateDisplay();
            this.saveToStorage();
            this.showNotification('🗑️ Toutes les données ont été effacées', 'info');
        }
    }

    showNotification(message, type = 'info') {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Ajouter les animations de notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialiser l'application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ConsignmentProcedure();
});
