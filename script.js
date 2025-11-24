// Gestion des données de la procédure de consignation
class ConsignmentProcedure {
    constructor() {
        this.data = {
            info: {},
            warnings: {},
            materials: [],
            steps: [],
            improvements: []
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromStorage();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Informations sur l'intervention
        const infoFields = ['date', 'numero', 'personnel', 'localisation', 'epi-epc'];
        infoFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('change', () => this.saveInfo());
                element.addEventListener('input', () => this.saveInfo());
            }
        });

        // Avertissements
        const warningFields = ['danger', 'analyse-risques'];
        warningFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('change', () => this.saveWarnings());
                element.addEventListener('input', () => this.saveWarnings());
            }
        });

        // Matériel nécessaire
        document.getElementById('add-material-btn').addEventListener('click', () => this.addMaterial());
        document.getElementById('new-material').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMaterial();
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
            date: document.getElementById('date').value,
            numero: document.getElementById('numero').value,
            personnel: document.getElementById('personnel').value,
            localisation: document.getElementById('localisation').value,
            epiEpc: document.getElementById('epi-epc').value
        };
        this.saveToStorage();
    }

    saveWarnings() {
        this.data.warnings = {
            danger: document.getElementById('danger').value,
            analyseRisques: document.getElementById('analyse-risques').value
        };
        this.saveToStorage();
    }

    addMaterial() {
        const input = document.getElementById('new-material');
        const material = input.value.trim();
        
        if (material) {
            this.data.materials.push(material);
            input.value = '';
            this.updateMaterialList();
            this.saveToStorage();
        }
    }

    removeMaterial(index) {
        this.data.materials.splice(index, 1);
        this.updateMaterialList();
        this.saveToStorage();
    }

    updateMaterialList() {
        const list = document.getElementById('material-list');
        list.innerHTML = '';
        
        this.data.materials.forEach((material, index) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = material;
            
            const button = document.createElement('button');
            button.className = 'btn btn-danger btn-small';
            button.textContent = 'Supprimer';
            button.onclick = () => this.removeMaterial(index);
            
            li.appendChild(span);
            li.appendChild(button);
            list.appendChild(li);
        });
    }

    addStep() {
        const step = {
            id: crypto.randomUUID ? crypto.randomUUID() : `step-${Date.now()}-${Math.random()}`,
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
                const img = document.createElement('img');
                img.src = step.photo;
                img.className = 'photo-preview';
                img.alt = 'Photo';
                photoUpload.appendChild(img);
            }
            
            const label = document.createElement('label');
            label.className = 'photo-label';
            label.textContent = `📷 ${step.photo ? 'Changer' : 'Ajouter'} photo`;
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
            document.getElementById('date').value = this.data.info.date || '';
            document.getElementById('numero').value = this.data.info.numero || '';
            document.getElementById('personnel').value = this.data.info.personnel || '';
            document.getElementById('localisation').value = this.data.info.localisation || '';
            document.getElementById('epi-epc').value = this.data.info.epiEpc || '';
        }

        // Charger les avertissements
        if (this.data.warnings) {
            document.getElementById('danger').value = this.data.warnings.danger || '';
            document.getElementById('analyse-risques').value = this.data.warnings.analyseRisques || '';
        }

        // Afficher les listes
        this.updateMaterialList();
        this.updateStepsList();
        this.updateImprovementList();
    }

    saveToStorage() {
        try {
            localStorage.setItem('consignmentProcedure', JSON.stringify(this.data));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('consignmentProcedure');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Erreur lors du chargement:', e);
        }
    }

    saveToFile() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `consignation-${this.data.info.numero || 'procedure'}-${new Date().toISOString().split('T')[0]}.json`;
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
                        this.data = JSON.parse(event.target.result);
                        this.updateDisplay();
                        this.saveToStorage();
                        this.showNotification('✅ Procédure chargée avec succès!', 'success');
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
