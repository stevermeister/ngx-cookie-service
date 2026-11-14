#!/bin/bash
# Called by semantic-release (@semantic-release/exec prepareCmd) to sync the
# released version into the library sources before @semantic-release/git commits them.
set -euo pipefail

next_version=$1

for file in projects/ngx-cookie-service/package.json projects/ngx-cookie-service-ssr/package.json; do
  node -e '
    const fs = require("fs");
    const [file, version] = process.argv.slice(1);
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    pkg.version = version;
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  ' "$file" "$next_version"
done
