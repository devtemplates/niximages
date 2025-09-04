# ==============================================================================
# Devimage
# ==============================================================================

ARG BASE_IMAGE_TAG
FROM mcr.microsoft.com/vscode/devcontainers/base:${BASE_IMAGE_TAG}

# ==============================================================================
# System-level setup (runs as root, least likely to change)
# ==============================================================================

# Configure direnv system-wide
COPY ./common/scripts/direnv-configure.sh /tmp/scripts/direnv-configure.sh
RUN /tmp/scripts/direnv-configure.sh \
  && rm -rf /tmp/scripts/direnv-configure.sh

# Create both users in a single layer
RUN groupadd --gid 1001 runner \
  && useradd --uid 1001 --gid runner --shell /bin/bash --create-home runner \
  && echo 'runner ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/runner \
  && mkdir -p /home/runner/.config/direnv \
  && mkdir -p /home/vscode/.config/direnv \
  && chown -R runner:runner /home/runner/.config \
  && chown -R vscode:vscode /home/vscode/.config

# ==============================================================================
# User configuration (more likely to change during development)
# ==============================================================================

# Copy configuration files for both users
COPY --chown=vscode:vscode ./common/config/direnv.toml /home/vscode/.config/direnv/direnv.toml
COPY --chown=runner:runner ./common/config/direnv.toml /home/runner/.config/direnv/direnv.toml

# Set working directory
WORKDIR /workspaces/repo

# ==============================================================================
# Build metadata (most likely to change, goes last)
# ==============================================================================

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

# ==============================================================================
# Install nix
# ==============================================================================

# Installs nix
COPY ./common/scripts/nix-install.sh /tmp/scripts/nix-install.sh
RUN /tmp/scripts/nix-install.sh \
  && rm -rf /tmp/scripts/nix-install.sh

# Copies over a helper script, intended to be sourced, that will start the
# nix daemon in the background. It is used in the entrypoint AND in a patch
# we apply below to /bin/sh which ensures that nix is available when running
# via non interactive non login shells (GHA).
COPY ./common/scripts/nix-daemon-start.sh /usr/local/share/nix-daemon-start.sh

# This applies the patch to /bin/sh which ensures nix is available when running
# via non interactive non login shells (GHA).
COPY ./common/scripts/sh-nix-patch.sh /tmp/scripts/sh-nix-patch.sh
RUN /tmp/scripts/sh-nix-patch.sh \
  && rm -rf /tmp/scripts/sh-nix-patch.sh

# Ensures that when running the container, the nix daemon is started.
COPY ./common/scripts/entrypoint.sh /usr/local/share/entrypoint.sh
ENTRYPOINT ["/usr/local/share/entrypoint.sh"]
CMD ["/bin/bash"]
