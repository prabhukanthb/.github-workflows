#!/usr/bin/env bash
# Idempotent bootstrap for the .github-workflows Cloud Agent environment.
# Installs the GitHub Actions authoring/validation toolchain used to develop
# the workflow files in this repository.
set -euo pipefail

ACTIONLINT_VERSION="1.7.7"

# shellcheck is used by actionlint to statically analyze `run:` shell steps.
if ! command -v shellcheck >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq shellcheck
fi

# actionlint validates GitHub Actions workflow YAML.
if ! command -v actionlint >/dev/null 2>&1 \
  || [ "$(actionlint --version | head -1)" != "${ACTIONLINT_VERSION}" ]; then
  tmp="$(mktemp -d)"
  curl -fsSL \
    "https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}/actionlint_${ACTIONLINT_VERSION}_linux_amd64.tar.gz" \
    -o "${tmp}/actionlint.tgz"
  tar -xzf "${tmp}/actionlint.tgz" -C "${tmp}" actionlint
  sudo install -m 0755 "${tmp}/actionlint" /usr/local/bin/actionlint
  rm -rf "${tmp}"
fi

echo "Toolchain ready:"
echo "  node       $(node --version)"
echo "  npm        $(npm --version)"
echo "  actionlint $(actionlint --version | head -1)"
echo "  shellcheck $(shellcheck --version | awk '/version:/{print $2}')"
