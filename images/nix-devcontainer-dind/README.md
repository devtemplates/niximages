# niximage-dind

> Docker image with the Nix package manager and Docker installed (using [docker-in-docker](https://github.com/devcontainers/features/tree/main/src/docker-in-docker)). This is helpful for repositories that plan to build application images.

## Usage

See the root [niximages README](../../README.md) for more details on how to effectively use niximages.

## Example Usage:

**.devcontainer/devcontainer.json**

```json
{
  "name": "my-pkg",
  "image": "ghcr.io/devtemplates/niximage-dind:latest",
  "workspaceMount": "source=${localWorkspaceFolder},target=/workspaces/repo,type=bind",
  "workspaceFolder": "/workspaces/repo",
  "mounts": ["source=niximage-nix,target=/nix,type=volume"]
}
```
