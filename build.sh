#!/bin/bash
set -eu

cd frontend/

rm -rf dist

npm install

npm run build

echo "build npm packages to frontend/dist/"