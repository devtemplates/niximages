# ==============================================================================
# Devimage
# ==============================================================================

ARG BASE_IMAGE_TAG
FROM mcr.microsoft.com/vscode/devcontainers/base:${BASE_IMAGE_TAG}

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

# NOTE: These do not get actively used in the Dockerfile during build. They are
# set so that we can automate image versioning/tagging. They are passed in at
# build time via the devcontainer.json file that is responsible for installing
# them as "features". While splitting the build up between this Dockerfile and
# the devcontainer "features" is a little awkward, it is the easiest way to
# install the complex dependencies of nix and docker.
ARG IMAGE_NAME
ARG IMAGE_VERSION
ARG PACKAGE_VERSION
ARG DOCKER_VERSION
ARG NIX_VERSION
ARG BASE_IMAGE_TAG
LABEL niximage.image_name=${IMAGE_NAME} \
  niximage.image_version=${IMAGE_VERSION} \
  niximage.package_version=${PACKAGE_VERSION} \
  niximage.docker_version=${DOCKER_VERSION} \
  niximage.nix_version=${NIX_VERSION} \
  niximage.base_image_tag=${BASE_IMAGE_TAG}
