# TypeScript Website Localizations

A repo for handling localized versions of the TypeScript website content

### Setting up

```sh
git clone https://github.com/microsoft/TypeScript-Website-Localizations
cd TypeScript-Website-Localizations

# Setup
yarn

# Optional: Grab the English files to make translation easier
yarn pull-en

# Optional: Verify your changes will correctly replace the english files
yarn lint
# Alternative: Run the lint watcher
yarn lint --watch
```

That's it, you've got a copy of all the documentation and now can write documentation which follows the existing patterns. There's a longer intro [in `welcome.md`](./welcome.md).

### How translations work 

The TypeScript website handles translations by having language specific files with matching filepaths:

E.g: [`/packages/documentation/copy/en/reference/JSX.md`](https://github.com/microsoft/TypeScript-website/blob/68a4f67ed5f396228eeb6d0309b51bcfb19d31a1/packages/documentation/copy/en/reference/JSX.md#L1)

Has existing translations in different languages:

```sh
/packages/documentation/copy/id/reference/JSX.md
/packages/documentation/copy/ja/reference/JSX.md
/packages/documentation/copy/pt/reference/JSX.md
```

Same path, just switched `en` for `id`, `ja` & `pt`.

#### This repo

This repo contains all of the non-English locale files. It means you can clone and translate without all the infrastructure overhead of the pretty complex TypeScript-Website. 

For example if you wanted to translate a new handbook page you would:

- Clone this repo (see above)
- Pull in the English files `yarn pull-en` (these will be gitignored)
- Find your english file: `docs/documentation/en/handbook-v2/Basics.md`
- Recreate the same folder path in your language: `docs/documentation/it/handbook-v2/Basics.md`
- Translate the file!
- Validate your changes: `yarn lint` (or `yarn lint docs/documentation/it/handbook-v2/Basics.md`)
- Create a pull request to this repo
- Once merged, the translation will appear on the next website deploy
