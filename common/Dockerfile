# ==============================================================================
# Devimage
# ==============================================================================

# [Choice] Ubuntu version (use jammy on local arm64/Apple Silicon): jammy, focal
ARG VARIANT="jammy"
FROM mcr.microsoft.com/devcontainers/base:${VARIANT}

# Configure direnv by ensuring the hook is executed
COPY ./common/scripts/configure-direnv.sh /tmp/scripts/configure-direnv.sh
RUN /tmp/scripts/configure-direnv.sh \
  && rm -rf /tmp/scripts/configure-direnv.sh

# We are installing nix under a single user, vscode, to avoid complexities of
# ensuring the nix dameon is running. We are using the user vscode as that is
# the default user created by the base devcontainer. There is no reason to swim
# upstream and choose a different user.
USER vscode

# NOTE: This adds a direnv config file that automatically whitelists the
# /workspaces/repo/.envrc file which makes the default experience of working
# with this devcontainer easier when mounted source code is mounted into
# /workspaces/repo.
WORKDIR /workspaces/repo
COPY ./common/config/direnv.toml /home/vscode/.config/direnv/direnv.toml
