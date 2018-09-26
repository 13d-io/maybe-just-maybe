#!/usr/bin/env bash

set -e

rm -Rf build

npm run build

cp ./.npmignore build
cp ./package.json build
cp ./AUTHORS build
cp ./LICENSE build
cp ./README.md build

