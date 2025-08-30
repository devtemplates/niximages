#!/bin/bash
set -euo pipefail

# Pick your Nix version
if [ -z "${NIX_VERSION:-}" ]; then
    echo "Error: NIX_VERSION environment variable must be set" >&2
    exit 1
fi

# Multi-user nix install
tmpdir="$(mktemp -d)"
curl -sSLf -o "${tmpdir}/install-nix" "https://releases.nixos.org/nix/nix-${NIX_VERSION}/install"
sh "${tmpdir}/install-nix" --daemon
rm -rf "${tmpdir}"

# Enable flakes + nix-command globally
mkdir -p /etc/nix
echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf
echo "sandbox = false" >> /etc/nix/nix.conf   # sandboxing usually fails in Docker

# Install nix-direnv globally to the default profile
# Need to source the nix environment first to make nix commands available
. /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
nix profile install nixpkgs#direnv --profile /nix/var/nix/profiles/default
nix profile install nixpkgs#nix-direnv --profile /nix/var/nix/profiles/default
