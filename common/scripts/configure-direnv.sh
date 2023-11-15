#!/bin/bash
 set -e

# ##############################################################################
#
# configure-direnv.sh
# Configure direnv for usage. THis is primarily used to ensure the direnv hook
# is executed.
#
# NOTE: Non-interactive/Non-login shells will not have the direnv hook.
# NOTE: This currently only supports bash and zsh.
#
# ##############################################################################

# ##############################################################################
# bash config
# ##############################################################################

# Write direnv initializations steps to /etc/profile.d/direnv.sh so that they
# are executed system-wide login shells.
cat <<EOF >>/etc/profile.d/direnv.sh
if command -v direnv > /dev/null; then
  eval "\$(direnv hook bash)"
fi

EOF

# Additionally, update the bashrc so that the direnv initialization steps are
# executed for non-login shells.
echo ". /etc/profile.d/direnv.sh" >>/etc/bash.bashrc

# # ##############################################################################
# # zsh config
# # ##############################################################################

# Write direnv initializations steps to /etc/zshrc.d/direnv.sh. This is not
# automatically sourced by zsh but we will use it as a convention and source it
# from /etc/zshenv
mkdir -p /etc/zshrc.d
cat <<EOF >>/etc/zshrc.d/direnv.sh
if command -v direnv > /dev/null; then
  eval "\$(direnv hook zsh)"
fi

EOF

# Additionally, update the bashrc so that the direnv initialization steps are
# executed for non-login shells.
echo ". /etc/zshrc.d/direnv.sh" >>/etc/zsh/zshenv
