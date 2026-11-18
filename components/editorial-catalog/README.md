# Catalogue éditorial pour Dawn

La grille se construit depuis la section du thème cible. La galerie s’active uniquement lorsque la section passe `enable_card_gallery` à la card. Les deux composants installés regroupent chacun leur Liquid, CSS et JavaScript.

## Première installation sur un thème non publié

Avec Python 3, Shopify CLI et un compte autorisé à modifier les thèmes, exécuter depuis ce dossier :

```sh
python3 pilot.py STORE.myshopify.com THEME_ID collection.json --install
```

Indiquer le template effectivement utilisé par la collection pilote (par exemple `collection.necklaces.json`). Le script vérifie que le thème est non publié, télécharge les fichiers, adapte la grille et la card du thème et conserve les originaux localement. Sans `--install`, il prépare seulement les fichiers. L’installation concerne les collections qui utilisent le template indiqué dans ce brouillon. Pour revenir en arrière, repasser la section du template de `main-collection-editorial-grid` à `main-collection-product-grid`.

Avec un export ZIP décompressé, `python3 prepare.py dossier-du-theme dossier-de-sortie` prépare les trois fichiers Liquid hors ligne. Copier ces fichiers dans le brouillon puis remplacer le type de la grille dans son template JSON, en conservant son identifiant et ses réglages. La section complète pour Dawn 15.2.0 se trouve dans `sections/main-collection-editorial-grid.liquid`. Les repères Liquid permettent à l’installateur de reporter ses ajouts sur une grille déjà personnalisée.

## Aperçu

Dans « Product grid — Editorial », activer **Card image gallery**, choisir **Sticky filters** et renseigner **Editorial image** pour essayer une tuile après le huitième produit. Cette image de section est commune aux collections du même template sans liste éditoriale. Utiliser les filtres ou changer le tri masque la tuile. Les produits suivants se chargent en défilant. Un lien vers la page suivante sert de repli.

La galerie utilise les trois premières images du produit. Une liste facultative de fichiers image `custom.card_images` sur le produit permet de contrôler les vues. Les classes commencent par `catalog-grid` et `product-card-gallery`.

Pour une composition par collection, définir `custom.editorial_tiles` comme liste de références à un métaobjet accessible au storefront. Champs : `after_product` (entier positif), `image` (fichier image), `mobile_image` (fichier image facultatif), `alt`, `title` (texte court), `text` (texte multiligne), `link` (URL), `size` (texte : large ou single), `enabled` (booléen). Remplir le titre ou le texte alternatif pour une tuile cliquable.

## Vérification dans le brouillon

Essayer une card avec une image puis trois images, les flèches au clavier, le glissement sur téléphone et le lien produit. Vérifier les badges, le header sticky, les filtres, le tri et les produits ajoutés en défilant. Comparer une section de produits de la page d’accueil. La première version cible Dawn 15.2.0. Si la structure de la card ou de la pagination a été largement modifiée, la préparation s’arrête pour permettre une adaptation sur la copie exacte.
