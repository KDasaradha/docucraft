---
title: HashiCorp Vault Setup
description: Placeholder content for HashiCorp Vault Setup.
order: 1
---

# HashiCorp Vault Setup

HashiCorp Vault can be set up on Ubuntu using either **WSL (Windows Subsystem for Linux)** or **VirtualBox (VMBox)**. However, running Vault in **WSL** can be problematic due to WSL's lack of systemd support, which Vault relies on for running as a service. A Virtual Machine (VM) using **VirtualBox** with a full Ubuntu installation is a more reliable choice.

## **Setup HashiCorp Vault on Ubuntu (Recommended for VirtualBox)**
These steps will guide you through installing, configuring, and securing Vault.

---

### **Step 1: Install HashiCorp Vault**
#### **1.1 Update and Install Dependencies**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y wget unzip curl gnupg software-properties-common
```

#### **1.2 Add HashiCorp’s Official GPG Key**
```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
```

#### **1.3 Add HashiCorp’s Repository**
```bash
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
```

#### **1.4 Install Vault**
```bash
sudo apt update && sudo apt install -y vault
```

#### **1.5 Verify Installation**
```bash
vault --version
```

---

### **Step 2: Configure Vault**
Vault can be run in **Development Mode** or **Production Mode**. We'll configure it for a basic standalone setup.

#### **2.1 Create Vault Configuration File**
```bash
sudo mkdir -p /etc/vault
sudo nano /etc/vault/config.hcl
```
Add the following content:
```hcl
storage "file" {
  path = "/var/lib/vault/data"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = "true"
}

disable_mlock = true
ui = true
```
Save and exit (`CTRL + X`, then `Y`, then `ENTER`).

---

### **Step 3: Set Up Vault Service**
To run Vault as a systemd service:

#### **3.1 Create Vault Systemd Service**
```bash
sudo nano /etc/systemd/system/vault.service
```
Paste the following:
```ini
[Unit]
Description=Vault service
Requires=network-online.target
After=network-online.target

[Service]
User=root
Group=root
ExecStart=/usr/bin/vault server -config=/etc/vault/config.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
Restart=on-failure
LimitMEMLOCK=infinity
CapabilityBoundingSet=CAP_IPC_LOCK

[Install]
WantedBy=multi-user.target
```
Save and exit.

#### **3.2 Reload Systemd and Start Vault**
```bash
sudo systemctl daemon-reload
sudo systemctl enable vault
sudo systemctl start vault
```

#### **3.3 Check Vault Status**
```bash
sudo systemctl status vault
```

---

### **Step 4: Initialize and Unseal Vault**
Vault requires initialization and unsealing before use.

#### **4.1 Export Environment Variables**
```bash
export VAULT_ADDR='http://127.0.0.1:8200'
```

#### **4.2 Initialize Vault**
```bash
vault operator init
```
This command will generate **5 unseal keys** and **1 root token**. Copy and save them securely.

#### **4.3 Unseal Vault**
Use **any 3 of the 5 unseal keys**:
```bash
vault operator unseal <unseal_key_1>
vault operator unseal <unseal_key_2>
vault operator unseal <unseal_key_3>
```

#### **4.4 Login to Vault**
```bash
vault login <root_token>
```

---

### **Step 5: Enable Vault UI**
If running on a VM, access the UI from your browser.

#### **5.1 Allow External Access**
```bash
sudo ufw allow 8200/tcp
```
Then, visit:  
👉 **http://<your-vm-ip>:8200**  

For local testing:  
👉 **http://127.0.0.1:8200**  

---

## **Can Vault Run on WSL?**
Yes, but **not recommended** for production because:
1. WSL lacks **systemd** (Vault requires it for a proper service).
2. Networking in WSL is limited (especially WSL1).
3. It won’t auto-start with system reboots.

If you still want to try:
1. Follow **Steps 1 & 2** to install Vault.
2. Instead of systemd, start Vault manually:
   ```bash
   vault server -dev
   ```
3. Set the environment variable:
   ```bash
   export VAULT_ADDR='http://127.0.0.1:8200'
   ```

**Alternative**: Use **Docker** in WSL to run Vault.

---

## **Final Recommendations**
- **For Development**: Use WSL or Docker (`vault server -dev` mode).
- **For Production**: Use **VirtualBox** or a dedicated Linux server.

Would you like guidance on setting up Vault with Docker or Kubernetes? 🚀

It looks like `ufw` (Uncomplicated Firewall) is not installed on your system. You can install it and then proceed with allowing port 8200.

### **Steps to Fix:**
1. **Install `ufw`** (if not installed)
   ```bash
   sudo apt update
   sudo apt install ufw -y
   ```
   
2. **Enable `ufw`** (if it's not already enabled)
   ```bash
   sudo ufw enable
   ```

3. **Allow Port 8200 for TCP**
   ```bash
   sudo ufw allow 8200/tcp
   ```

4. **Check UFW Status**
   ```bash
   sudo ufw status
   ```

If you are using a different firewall system (e.g., `iptables` or `firewalld`), let me know, and I can guide you accordingly. 🚀


To completely remove HashiCorp Vault and all its files from your Ubuntu system, follow these steps:

---

## **Step 1: Stop and Disable Vault Service**
If Vault is running as a systemd service, stop and disable it first.

```bash
sudo systemctl stop vault
sudo systemctl disable vault
sudo systemctl daemon-reload
```

To verify that Vault is no longer running:
```bash
sudo systemctl status vault
```
If the service is still active, kill any remaining Vault processes:
```bash
sudo pkill -f vault
```

---

## **Step 2: Uninstall Vault**
Remove the Vault package:
```bash
sudo apt remove --purge -y vault
sudo apt autoremove -y
```

Verify removal:
```bash
vault --version  # Should return "command not found"
```

---

## **Step 3: Delete Vault Configuration Files**
Vault configuration and data files are usually stored in the following locations. Delete them all:

```bash
sudo rm -rf /etc/vault
sudo rm -rf /var/lib/vault
sudo rm -rf /opt/vault
sudo rm -rf /usr/local/bin/vault
sudo rm -rf ~/.vault-token
```

If you installed Vault manually, check for its binary:
```bash
which vault
```
If a path like `/usr/bin/vault` is returned, delete it:
```bash
sudo rm -f /usr/bin/vault
```

---

## **Step 4: Remove Vault Systemd Service**
```bash
sudo rm -f /etc/systemd/system/vault.service
sudo systemctl daemon-reload
```

---

## **Step 5: Clean Up Firewall Rules (Optional)**
If you had allowed Vault's ports through the firewall, remove the rule:

```bash
sudo ufw delete allow 8200/tcp
```

---

## **Step 6: Verify Complete Removal**
Run the following command to check if any Vault files are left:
```bash
find / -name "*vault*" 2>/dev/null
```
If any remaining Vault-related files are found, manually delete them.

---

## **Step 7: Reboot System (Optional)**
For a completely clean slate, reboot your system:
```bash
sudo reboot
```

---

### **Vault Should Now Be Completely Removed ✅**
Would you like to reinstall Vault from scratch or explore an alternative setup (Docker, Kubernetes, etc.)? 🚀