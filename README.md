# YQLs VSCode Extension

## Build & Run

Install required npm packages:

```bash
npm install -g node-gyp
CXXFLAGS=-std=c++20 npm install
```

Then open the repository via the VSCode Editor and launch "Launch Client" via `F5`. Other commands are available in the root `package.json`.

To check the style:

```bash
npm run lint
```

To fix the code style press `CTRL+SHIFT+P` and run `ESLint: Fix all auto-fixable Problems`.
