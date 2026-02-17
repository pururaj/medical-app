#!/bin/bash

# Medical App - Prerequisites Installation Script
# This script installs Java 17, Maven, and sets up the environment

set -e

echo "🚀 Medical App - Prerequisites Installation"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Homebrew is installed
echo "📦 Checking for Homebrew..."
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  You will be prompted for your password${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Detect architecture and add to PATH
    if [[ $(uname -m) == 'arm64' ]]; then
        echo ""
        echo "🔧 Adding Homebrew to PATH (Apple Silicon)..."
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        echo ""
        echo "🔧 Adding Homebrew to PATH (Intel)..."
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    echo -e "${GREEN}✅ Homebrew installed successfully!${NC}"
else
    echo -e "${GREEN}✅ Homebrew is already installed${NC}"
fi

echo ""
echo "─────────────────────────────────────────"
echo ""

# Install Java 17
echo "☕ Installing Java 17..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" == "17" ]; then
        echo -e "${GREEN}✅ Java 17 is already installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Java $JAVA_VERSION found. Installing Java 17...${NC}"
        brew install openjdk@17
    fi
else
    brew install openjdk@17
    echo -e "${GREEN}✅ Java 17 installed!${NC}"
fi

# Add Java to PATH
echo ""
echo "🔧 Configuring Java in PATH..."
if [[ $(uname -m) == 'arm64' ]]; then
    # Apple Silicon
    if ! grep -q "/opt/homebrew/opt/openjdk@17/bin" ~/.zshrc; then
        echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
        echo -e "${GREEN}✅ Java added to PATH${NC}"
    else
        echo -e "${GREEN}✅ Java already in PATH${NC}"
    fi
    export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
else
    # Intel
    if ! grep -q "/usr/local/opt/openjdk@17/bin" ~/.zshrc; then
        echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
        echo -e "${GREEN}✅ Java added to PATH${NC}"
    else
        echo -e "${GREEN}✅ Java already in PATH${NC}"
    fi
    export PATH="/usr/local/opt/openjdk@17/bin:$PATH"
fi

echo ""
echo "─────────────────────────────────────────"
echo ""

# Install Maven
echo "📦 Installing Maven..."
if command -v mvn &> /dev/null; then
    echo -e "${GREEN}✅ Maven is already installed${NC}"
else
    brew install maven
    echo -e "${GREEN}✅ Maven installed!${NC}"
fi

echo ""
echo "─────────────────────────────────────────"
echo ""

# Install Docker Desktop
echo "🐳 Checking for Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is already installed${NC}"
else
    echo -e "${YELLOW}Installing Docker Desktop...${NC}"
    echo -e "${YELLOW}⚠️  Docker Desktop will be downloaded and installed${NC}"
    brew install --cask docker
    echo -e "${GREEN}✅ Docker Desktop installed!${NC}"
    echo -e "${YELLOW}⚠️  Please open Docker Desktop application to complete setup${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "==========================================="
echo ""

# Verify installations
echo "📊 Verification:"
echo ""

if command -v java &> /dev/null; then
    echo -e "${GREEN}✅ Java:${NC} $(java -version 2>&1 | head -n 1)"
else
    echo -e "${RED}❌ Java: Not found${NC}"
fi

if command -v mvn &> /dev/null; then
    echo -e "${GREEN}✅ Maven:${NC} $(mvn -version 2>&1 | head -n 1)"
else
    echo -e "${RED}❌ Maven: Not found${NC}"
fi

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker:${NC} $(docker --version)"
else
    echo -e "${RED}❌ Docker: Not found (may need to open Docker Desktop)${NC}"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. If Docker was just installed, open Docker Desktop application"
echo "2. Restart your terminal or run: source ~/.zshrc"
echo "3. Run: cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app"
echo "4. Run: ./scripts/start-infrastructure.sh"
echo "5. Run: ./scripts/build-backend.sh"
echo ""
echo "📚 See SETUP_GUIDE.md for detailed instructions"
echo ""
