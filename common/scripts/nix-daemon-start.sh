# Attempt to start nix daemon
# Forked from https://github.com/devcontainers/features/blob/main/src/nix/nix-entrypoint.sh

# Check if nix-daemon is already running
if ! pidof nix-daemon >/dev/null 2>&1; then
    start_ok=false
    DAEMON_CMD=". /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh; \
             /nix/var/nix/profiles/default/bin/nix-daemon >/tmp/nix-daemon.log 2>&1"

    # If root user, start the nix-daemon in the background within this process
    if [ "$(id -u)" = "0" ]; then
        sh -c "$DAEMON_CMD" &
        if [ "$?" = "0" ]; then
            start_ok=true
        fi

    # If we are not the root user, we need to sudo and start the daemon in a
    # subshell as root
    elif command -v sudo >/dev/null 2>&1; then
        # non root users should all run with the daemon
        export NIX_REMOTE=daemon

        # We use -b here to ensure the sudo process is run in the background
        # (we attempted just to use & but stdin was still being captured)
        sudo -n -b sh -c "$DAEMON_CMD"
        if [ "$?" = "0" ]; then
            start_ok=true
        fi
    fi

    # If startup failed or wasn't called, we need to exit.
    if [ "$start_ok" = "false" ]; then
        echo "Failed to start nix-daemon" >&2
    fi
fi
