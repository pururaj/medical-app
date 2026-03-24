# 🚀 Quick Installation Guide

## What You Need to Do

I've created an automated installation script that will install everything you need!

## ⚡ One-Command Installation

Open your **Terminal** and run:

```bash
cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app

./install-prerequisites.sh
```

**That's it!** The script will:
1. ✅ Install Homebrew (if needed)
2. ✅ Install Java 17
3. ✅ Install Maven
4. ✅ Install Docker Desktop
5. ✅ Configure everything automatically

**Note:** You'll be asked for your password once during Homebrew installation.

---

## 📋 What Will Happen

### Step 1: Homebrew Installation (~2 minutes)
- You'll be prompted for your **password**
- Press **Enter** to confirm
- Wait for installation

### Step 2: Java 17 Installation (~1 minute)
- Automatic installation
- No interaction needed

### Step 3: Maven Installation (~30 seconds)
- Automatic installation
- No interaction needed

### Step 4: Docker Desktop Installation (~3 minutes)
- Automatic installation
- **After installation completes, you must open Docker Desktop app manually**

### Total Time: ~7-10 minutes

---

## 🎯 After Installation

### 1. Restart Your Terminal
Close and reopen your terminal, or run:
```bash
source ~/.zshrc
```

### 2. Open Docker Desktop
Find "Docker" in your Applications folder and open it. Wait for the Docker icon to appear in your menu bar.

### 3. Verify Everything Works
```bash
java --version
mvn --version
docker --version
```

You should see version numbers for all three.

---

## 🚀 Then Run the Application!

Once everything is installed:

```bash
cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app

# Start infrastructure
./scripts/start-infrastructure.sh

# Build backend
./scripts/build-backend.sh

# Start services (in separate terminals)
./scripts/start-patient-service.sh  # Terminal 1
./scripts/start-api-gateway.sh      # Terminal 2
./scripts/start-frontend.sh         # Terminal 3
```

---

## ❓ If Something Goes Wrong

### Script Fails with Permission Error
Make sure the script is executable:
```bash
chmod +x install-prerequisites.sh
./install-prerequisites.sh
```

### Homebrew Already Installed
The script will skip Homebrew installation automatically.

### Password Not Accepted
Make sure you're using your Mac login password (the one you use to unlock your Mac).

### Docker Won't Start
1. Open Docker Desktop application manually
2. Wait for "Docker Desktop is running" message
3. Try again

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the error message carefully
2. Make sure you have administrator privileges on your Mac
3. Ensure you have a stable internet connection
4. Try running each command manually (see SETUP_GUIDE.md)

---

## ✅ Alternative: Manual Installation

If you prefer to install manually, see [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions.

---

**Ready? Run the installation script now!** 🚀

```bash
cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app
./install-prerequisites.sh
```
