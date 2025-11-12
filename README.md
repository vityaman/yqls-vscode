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

## Resources

To pull JSONs from YDB repository:

```bash
./tool/yapull.sh "$YDB_PATH" # for example, '~/ydb'
```

To update documentation JSON from the markdown:

```bash
cat ./tool/md2doc.md | ./tool/md2doc.py > ./assets/docs.json
```

To update frequencies:

```bash
./tool/sql2yql.py "$YDB_PATH" > ./assets/frequencies.json
```
