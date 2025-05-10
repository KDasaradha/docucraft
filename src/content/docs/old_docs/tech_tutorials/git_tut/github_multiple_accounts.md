# Setting up Multiple GitHub Accounts on One Machine (Windows)

Managing two GitHub accounts (one for personal and one for work) on the same machine can be challenging, but it's manageable using SSH keys and Git configurations. This guide walks you through the steps to set it up on a Windows laptop.

## Steps Overview

1. Generate SSH keys for both accounts.
2. Add SSH keys to the SSH agent.
3. Add the SSH keys to GitHub (personal and work).
4. Configure SSH to use separate SSH keys for each account.
5. Set up Git configurations (name and email) for both accounts.

---

## 1. Generate SSH Keys for Both Accounts

### a. Generate SSH key for your personal GitHub account

1. Open Git Bash and run:

   ```bash
   ssh-keygen -t ed25519 -C "your_personal_email@example.com"
   ```

2. Save the key to a specific location (e.g., `C:\Users\YourUsername\.ssh\id_ed25519_personal`).
3. Press `Enter` to skip the passphrase or add one for security.

### b. Generate SSH key for your work GitHub account

1. Run the following command in Git Bash:

   ```bash
   ssh-keygen -t ed25519 -C "your_work_email@example.com"
   ```

2. Save the key to `C:\Users\YourUsername\.ssh\id_ed25519_work`.
3. Press `Enter` to skip the passphrase or add one if desired.

After completing both steps, you should have two key pairs in your `.ssh` folder:

- `id_ed25519_personal` and `id_ed25519_personal.pub`
- `id_ed25519_work` and `id_ed25519_work.pub`

---

## 2. Add SSH Keys to the SSH Agent

### a. Start the SSH agent

```bash
eval "$(ssh-agent -s)"
```

### b. Add your personal SSH key

```bash
ssh-add C:/Users/YourUsername/.ssh/id_ed25519_personal
```

### c. Add your work SSH key

```bash
ssh-add C:/Users/YourUsername/.ssh/id_ed25519_work
```

---

## 3. Add the SSH Keys to GitHub

### a. Add your Personal SSH Key to GitHub

1. Log in to your personal GitHub account.
2. Navigate to **Settings > SSH and GPG keys**.
3. Click **New SSH Key** and paste the contents of the personal public key:

   ```bash
   cat ~/.ssh/id_ed25519_personal.pub
   ```

### b. Add your Work SSH Key to GitHub

1. Log out of your personal GitHub account.
2. Log into your work GitHub account and go to **Settings > SSH and GPG keys**.
3. Click **New SSH Key** and paste the contents of the work public key:

   ```bash
   cat ~/.ssh/id_ed25519_work.pub
   ```

---

## 4. Configure SSH to Use Different Keys for Each Account

### a. Edit the SSH config file

Open or create the SSH config file:

```bash
notepad ~/.ssh/config
```

### b. Add the following configuration

```bash
# Personal GitHub account
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal

# Work GitHub account
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
```

This setup tells SSH to use the correct key based on the alias (`github.com-personal` or `github.com-work`).

---

## 5. Set Up Git Configuration for Each Account

### a. Global Git Configuration (Personal)

Set up global settings for your personal account:

```bash
git config --global user.name "Your Personal Name"
git config --global user.email "your_personal_email@example.com"
```

### b. Local Git Configuration (Work)

For work repositories, configure local settings:

1. Navigate to the repository:

   ```bash
   cd path/to/your/work/repo
   ```

2. Set up work-specific Git configuration:

   ```bash
   git config user.name "Your Work Name"
   git config user.email "your_work_email@example.com"
   ```

---

## 6. Cloning Repositories Using SSH

### a. Clone Personal Repositories

Use the following command to clone personal repositories:

```bash
git clone git@github.com-personal:username/repo.git
```

### b. Clone Work Repositories

For work repositories, use:

```bash
git clone git@github.com-work:username/repo.git
```

---

## 7. Verify Everything Works

You can test your SSH connection for both accounts:

```bash
ssh -T git@github.com-personal
ssh -T git@github.com-work
```

If successful, you will see:

Hi username! You've successfully authenticated, but GitHub does not provide shell access.

---

## Git Configurations

### 1. Check Global Git Configurations

To view global settings:

```bash
git config --global --list
```

### 2. Check Local Git Configurations

To view settings specific to the current repository:

```bash
git config --local --list
```

### 3. Check System-Level Git Configurations

To view system-wide settings:

```bash
git config --system --list
```

### 4. View Specific Configurations

Check specific configuration settings:

- To check your global username:

  ```bash
  git config --global user.name
  ```

- To check the local email in a repository:

  ```bash
  git config --local user.email
  ```

### 5. Configuration Hierarchy

Git applies configurations in the following order:

1. **System-level**: Applies to all users on the system.
2. **Global-level**: Applies to the current user.
3. **Local-level**: Applies to the current repository.

Local settings override global ones, and global ones override system-level settings.

---

### Example Output

- **Global configuration**:

  ```bash
  user.name=Your Name
  user.email=your.email@example.com
  core.editor=vim
  core.autocrlf=true
  ```

- **Local configuration** (inside a repository):

  ```bash
  user.name=Your Repository-Specific Name
  user.email=your.specific.email@example.com
  remote.origin.url=git@github.com-personal:username/repo.git
  ```

---

You’re now set up to manage two GitHub accounts on the same machine!

This Markdown version improves readability and makes the instructions easier to follow when used in documentation or a repository.
