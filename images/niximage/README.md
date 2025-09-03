# niximage

> Standalone Docker image with the Nix package manager installed. Designed as ad devcontainer for libraries and/or smaller packages.

## Usage

See the root [niximages README](../../README.md) for more details on how to effectively use niximages.

## Example Usage:

**.devcontainer/devcontainer.json**

```json
{
  "name": "my-pkg",
  "image": "ghcr.io/devtemplates/niximage:latest",
  "workspaceMount": "source=${localWorkspaceFolder},target=/workspaces/repo,type=bind",
  "workspaceFolder": "/workspaces/repo",
  "mounts": ["source=niximage-nix,target=/nix,type=volume"]
}
```
