# Tests

Ce projet inclut une suite complète de tests pour garantir la qualité et la fiabilité de la bibliothèque Shades.

## Structure des tests

```
tests/
├── utils/                  # Tests des fonctions utilitaires
│   ├── UMaths.test.ts      # Tests des fonctions mathématiques
│   ├── UColors.test.ts     # Tests des fonctions de couleur
│   └── UShadeUtils.test.ts # Tests des utilitaires Shades
├── constants/              # Tests des constantes
│   └── constants.test.ts   # Tests de toutes les constantes
├── classes/                # Tests des classes principales
│   ├── BaseShape.test.ts   # Tests de la classe de base des formes
│   ├── CircleShape.test.ts # Tests de la forme cercle
│   └── ShadesEngine.test.ts # Tests du moteur principal
└── integration/            # Tests d'intégration
    └── full-workflow.test.ts # Tests de bout en bout
```

## Exécution des tests

### Lancer tous les tests

```bash
npm test
```

### Lancer les tests en mode watch (développement)

```bash
npm run test:watch
```

### Générer un rapport de couverture

```bash
npm run test:coverage
```

## Couverture testée

### Utilitaires (utils/)

- **UMaths.ts**: Fonctions mathématiques (random, degToRad)
- **UColors.ts**: Manipulation des couleurs (RGB/Hex, génération aléatoire)
- **UShadeUtils.ts**: Configuration des shades, génération aléatoire

### Constantes (constants/)

- **CColors.ts**: Palettes de couleurs
- **CShades.ts**: Types de formes et limites
- **CFilters.ts**: Filtres et types de ligne

### Classes (classes/)

- **BaseShape**: Classe de base pour toutes les formes
- **CircleShape**: Implémentation spécifique du cercle
- **ShadesEngine**: Moteur principal d'animation

### Tests d'intégration

- Workflow complet de création et rendu
- Compatibilité entre les différents composants
- Gestion des erreurs et résilience
- Performance et gestion mémoire

## Configuration Jest

Le projet utilise Jest avec le support TypeScript et ESM :

- **Environnement**: jsdom (pour les tests DOM/Canvas)
- **Preset**: ts-jest avec support ESM
- **Mocks**: Canvas API, Performance API, ResizeObserver
- **Setup**: jest.setup.js pour la configuration globale

## Mocks et utilities

- **Canvas Mock**: Simulation complète de l'API Canvas
- **Document/Window**: Mocks pour les API DOM
- **Performance**: Mock pour performance.now()
- **Fonts**: Mock pour document.fonts.ready

## Scripts disponibles

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Bonnes pratiques

1. **Isolation**: Chaque test est isolé avec beforeEach/afterEach
2. **Mocking**: Utilisation extensive de mocks pour les API externes
3. **Couverture**: Vise une couverture élevée des cas d'usage
4. **Lisibilité**: Tests organisés par fonction avec descriptions claires
5. **Performance**: Tests de performance et gestion mémoire inclus

## Ajout de nouveaux tests

Pour ajouter de nouveaux tests :

1. Créer un fichier `.test.ts` dans le dossier approprié
2. Importer les modules à tester
3. Utiliser la structure `describe`/`it` de Jest
4. Ajouter les mocks nécessaires avec `jest.fn()`
5. Vérifier les assertions avec `expect()`

Exemple :

```typescript
import { myFunction } from "../../src/path/to/module.js";

describe("MyFunction", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBeDefined();
  });
});
```
