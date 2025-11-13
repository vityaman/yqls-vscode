# YQLs VSCode Development

Install required npm packages:

```bash
npm install -g node-gyp
CXXFLAGS=-std=c++20 npm install
```

Then open the repository via the VSCode Editor and launch "Launch Client" via `F5`. Other commands are available in the root `package.json`.

To get a VSIX file:

```bash
vsce package --follow-symlinks
```

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
cat ./tool/md2doc.md | ./tool/md2doc.py > ./server/src/asset/docs.json
```

To update frequencies:

```bash
./tool/sql2yql.py "$YDB_PATH" > ./server/src/asset/frequencies.json
```

Then update callables:

```bash
./tool/fngen.py \
    -f ./server/src/asset/frequencies.json \
    -t ./server/src/asset/types.json \
    -o ./server/src/asset/callables.json
```
