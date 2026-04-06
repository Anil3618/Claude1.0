#!/bin/bash
# macOS Development Environment Setup Script

set -e

echo "=== macOS Dev Environment Setup ==="

# Step 1: Check/Install Xcode Command Line Tools
echo ""
echo "Step 1: Checking Xcode Command Line Tools..."
if xcode-select -p &>/dev/null; then
    echo "  Xcode Command Line Tools already installed at: $(xcode-select -p)"
else
    echo "  Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "  Please complete the installation dialog, then re-run this script."
    exit 0
fi

# Verify key tools
echo ""
echo "Step 2: Verifying installed tools..."
echo "  git:   $(git --version)"
echo "  clang: $(clang --version | head -1)"
echo "  make:  $(make --version | head -1)"

# Step 3: Check for Homebrew
echo ""
echo "Step 3: Checking for Homebrew..."
if command -v brew &>/dev/null; then
    echo "  Homebrew already installed: $(brew --version | head -1)"
else
    echo "  Homebrew not found. Install it with:"
    echo '  /bin/bash -c "$(curl -fsSL https://homebrew.sh/install.sh)"'
fi

echo ""
echo "=== Setup check complete ==="
