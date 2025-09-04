#!/bin/bash
set +e

# Start nix-daemon if not already running
# (runs in background, handles root/non-root users)
. /usr/local/share/nix-daemon-start.sh

# Source nix environment for the current shell
. /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh

# Execute the main command
exec "$@"
