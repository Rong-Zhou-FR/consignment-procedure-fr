# Procédure de Consignation - Application Web

Application web pour créer et gérer des procédures de consignation en français.

## 🎯 Fonctionnalités

- **Informations sur l'intervention** : Date, numéro, personnel, localisation, EPI/EPC
- **Avertissements** : Gestion des dangers et analyse de risques
- **Matériel nécessaire** : Liste dynamique du matériel requis
- **Instructions de consignation** : Étapes détaillées avec 3 colonnes (repère, instruction, photo)
- **Pistes d'amélioration** : Suggestions pour améliorer la procédure
- **Sauvegarde automatique** : Les données sont sauvegardées automatiquement dans le navigateur
- **Export/Import** : Exportez vos procédures en JSON et importez-les ultérieurement
- **Impression** : Fonction d'impression optimisée pour les documents

## 🚀 Utilisation

1. Ouvrez `index.html` dans votre navigateur web
2. Remplissez les informations de l'intervention
3. Ajoutez les avertissements et risques identifiés
4. Listez le matériel nécessaire
5. Créez des étapes de consignation avec photos
6. Ajoutez des suggestions d'amélioration
7. Enregistrez ou imprimez votre procédure

## 📋 Structure du projet

```
├── index.html    # Structure HTML de l'application
├── styles.css    # Styles avec couleurs vives et design professionnel
├── script.js     # Logique JavaScript pour l'interactivité
└── README.md     # Ce fichier
```

## 🎨 Design

- **Couleurs vives** : Interface colorée et professionnelle
- **Organisation claire** : Sections bien définies et faciles à naviguer
- **Responsive** : S'adapte à toutes les tailles d'écran
- **Accessible** : Interface intuitive et facile à utiliser

## 💾 Sauvegarde des données

Les données sont automatiquement sauvegardées dans le `localStorage` du navigateur. Vous pouvez également :
- **Enregistrer** : Télécharger un fichier JSON de votre procédure
- **Charger** : Importer un fichier JSON précédemment sauvegardé
- **Effacer** : Réinitialiser complètement le formulaire

## 🖨️ Impression

Le bouton "Imprimer" optimise l'affichage pour l'impression en supprimant les boutons interactifs et en ajustant la mise en page.

## 📄 License

GNU public Affero 3.0 License - Voir le fichier LICENSE pour plus de détails.