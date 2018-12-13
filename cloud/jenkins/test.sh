#!/bin/bash -el
set -e
set -o pipefail

echo Working on ${GIT_BRANCH} content ...

# getting deps
npm install

# tests
cp env.example env.yml
npm run test

echo Work DONE!