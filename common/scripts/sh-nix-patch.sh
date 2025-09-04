#!/bin/bash
# This patches the /bin/sh executable to start the nix daemon and source
# the nix env, if our user is runner or if explicitly set via NIX_AUTO_START

# Move the current sh implementation
mv /bin/sh /bin/sh.orig

# Write out the new wrapper
cat > /bin/sh << 'EOF'
#!/bin/sh.orig
should_start=0

# Start if explicitly enabled, or if user is runner
if [ "${NIX_AUTO_START:-0}" = "1" ] || [ "$(id -un)" = "runner" ]; then
    should_start=1
fi

if [ "$should_start" = "1" ] && [ -z "$__NIX_WRAPPER_SOURCED" ]; then
    # Start nix-daemon if necessary
    if ! pidof nix-daemon >/dev/null 2>&1; then
        . /usr/local/share/nix-daemon-start.sh
    fi

    # Source nix environment
    . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
    export __NIX_WRAPPER_SOURCED=1
fi

exec /bin/sh.orig "$@"
EOF

# Ensure the new wrapper is executable
chmod +x /bin/sh
