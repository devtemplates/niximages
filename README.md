# niximages

> Docker [devcontainer](https://code.visualstudio.com/docs/remote/containers) images built to be used with the Nix package manager with declarative development environments defined using nix flakes.

## Images

### [ghcr.io/devtemplates/niximage](./images/niximage/README.md)

> Standalone Docker image with the Nix package manager installed. Designed as ad devcontainer for libraries and/or smaller packages.

### [ghcr.io/devtemplates/niximage](./images/niximage-dind/README.md)

> Docker image with the Nix package manager and Docker installed (using [docker-in-docker](https://github.com/devcontainers/features/tree/main/src/docker-in-docker)). This is helpful for repositories that plan to build application images.

## Usage

To use this image as the base for your own devcontainer, create a `.devcontainer` folder in your project's root directory, and create a `devcontainer.json` file within that folder with the following content:

```json
{
  "image": "<IMAGE>",
  "workspaceMount": "source=${localWorkspaceFolder},target=/workspaces/repo,type=bind",
  "workspaceFolder": "/workspaces/repo",
  "mounts": ["source=niximage-nix,target=/nix,type=volume"]
}
```

**Notes:**

- `workspaceMount` and `workspaceFolder` are explicitly set to `/workspaces/repo`. Without this, the devcontainer will dynamically create the directory `/workspaces/<REPO_DIRECTORY_NAME>`. There is nothing inherently wrong with this, however the images come with `direnv` installed and configured to automatically allow executing `/workspaces/repo/.envrc` which makes working with the devcontainer for the first time a bit more intuitive.
- `mounts` is set as a convenience if you are using devcontainers locally rather than via something like CODESPACES. Mounting the `/nix` directory ensures dependency binaries are cached between devcontainer builds.

## More Resources

### Not familiar with Nix?

For more information about the Nix package manager, and it's benefits, check out the following blog posts:

- [Effortless dev environments with Nix and direnv](https://determinate.systems/posts/nix-direnv)
- [Using Nix with Dockerfiles](https://mitchellh.com/writing/nix-with-dockerfiles)

And to get started, checkout the following resources:

- [Zero to Nix](https://zero-to-nix.com/)
- [Basics of the Nix Language](https://nixos.org/guides/nix-pills/basics-of-language)

Additional reading:

- [A new Nix command](https://blog.ysndr.de/posts/guides/2021-12-01-nix-shells/)

## License

The MIT License (MIT) Copyright (c) Jarid Margolin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
