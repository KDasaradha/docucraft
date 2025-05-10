Below is a comprehensive set of notes covering **Git** and **GitHub**, all **Git commands** with descriptions and use cases, expanded **Git branch naming conventions** (including the ones you provided), and detailed **Git commit naming conventions**. I’ll ensure everything is complete and well-structured.

---

### What is Git?
Git is a distributed version control system (VCS) that tracks changes in source code, allowing multiple developers to collaborate efficiently. It supports:
- **Local Operations**: Commits, branches, and merges are fast and don’t require a network.
- **Distributed Workflow**: Every developer has a full copy of the repository, including its history.
- **Branching**: Lightweight and flexible for isolating work.
- **Staging Area**: Fine-grained control over what changes to commit.

### What is GitHub?
GitHub is a cloud-based platform that hosts Git repositories and adds collaboration tools:
- **Remote Storage**: Store and share Git repositories.
- **Pull Requests**: Facilitate code reviews and discussions.
- **Issues**: Manage tasks, bugs, and feature requests.
- **GitHub Actions**: Automate CI/CD pipelines.
- **Teams and Permissions**: Control access for collaborators.

GitHub builds on Git’s foundation, making it ideal for open-source and team projects.

---

### Git Commands: Complete List with Descriptions and Use Cases

Below is an exhaustive list of Git commands categorized by functionality, with detailed descriptions and practical examples:

#### 1. Repository Setup and Configuration
- **`git init`**
  - **Description**: Initializes a new Git repository in the current directory by creating a `.git` folder.
  - **Use Case**: Start version control for a new project.
  - **Example**: `git init`

- **`git clone <repository-url>`**
  - **Description**: Downloads a remote repository to your local machine, including its history.
  - **Use Case**: Get a copy of an existing project (e.g., from GitHub).
  - **Example**: `git clone https://github.com/username/repo.git`

- **`git config <key> <value>`**
  - **Description**: Sets configuration options (e.g., user details).
  - **Use Case**: Set your identity for commit authorship.
  - **Options**: `--global` (user-wide), `--local` (repo-specific).
  - **Example**: `git config --global user.email "you@example.com"`

#### 2. Working with Changes
- **`git status`**
  - **Description**: Displays the state of the working directory and staging area (untracked, modified, staged files).
  - **Use Case**: Check what’s ready to commit or needs attention.
  - **Example**: `git status`

- **`git add <file>`**
  - **Description**: Stages changes in a specific file for the next commit.
  - **Use Case**: Selectively prepare changes.
  - **Example**: `git add README.md`

- **`git add .` or `git add -A`**
  - **Description**: Stages all new, modified, and deleted files.
  - **Use Case**: Stage everything at once.
  - **Example**: `git add .`

- **`git commit -m "<message>"`**
  - **Description**: Saves staged changes to the repository with a descriptive message.
  - **Use Case**: Record a snapshot of your work.
  - **Example**: `git commit -m "Add login page"`

- **`git commit -am "<message>"`**
  - **Description**: Stages and commits all tracked, modified files in one step.
  - **Use Case**: Quick commit for already tracked files.
  - **Example**: `git commit -am "Update docs"`

- **`git commit --amend`**
  - **Description**: Modifies the most recent commit (e.g., changes message or adds files).
  - **Use Case**: Fix a commit without creating a new one.
  - **Example**: `git commit --amend -m "Improved message"`

#### 3. Viewing History and Differences
- **`git log`**
  - **Description**: Shows the commit history with details (author, date, message).
  - **Use Case**: Review project history.
  - **Example**: `git log`

- **`git log --oneline`**
  - **Description**: Displays commits in a single-line format (hash and message).
  - **Use Case**: Quick summary of commits.
  - **Example**: `git log --oneline`

- **`git log --graph --all`**
  - **Description**: Visualizes branch and merge history across all branches.
  - **Use Case**: Understand complex branching.
  - **Example**: `git log --graph --all`

- **`git diff`**
  - **Description**: Shows changes between working directory and staging area, or between commits.
  - **Use Case**: Review modifications before staging.
  - **Example**: `git diff`

- **`git diff --staged`**
  - **Description**: Compares staged changes to the last commit.
  - **Use Case**: Verify what’s about to be committed.
  - **Example**: `git diff --staged`

- **`git show <commit>`**
  - **Description**: Displays details and changes of a specific commit.
  - **Use Case**: Inspect a commit’s content.
  - **Example**: `git show abc123`

#### 4. Branching and Merging
- **`git branch`**
  - **Description**: Lists all local branches; the current branch is marked with `*`.
  - **Use Case**: See available branches.
  - **Example**: `git branch`

- **`git branch <branch-name>`**
  - **Description**: Creates a new branch without switching to it.
  - **Use Case**: Prepare a branch for a new task.
  - **Example**: `git branch feature/login`

- **`git checkout <branch-name>`**
  - **Description**: Switches to the specified branch.
  - **Use Case**: Work on a different branch.
  - **Example**: `git checkout feature/login`

- **`git checkout -b <branch-name>`**
  - **Description**: Creates and switches to a new branch in one step.
  - **Use Case**: Start a new feature immediately.
  - **Example**: `git checkout -b feature/login`

- **`git merge <branch-name>`**
  - **Description**: Integrates changes from the specified branch into the current branch.
  - **Use Case**: Combine feature work into `main`.
  - **Example**: `git merge feature/login`

- **`git merge --abort`**
  - **Description**: Cancels a merge in progress if conflicts arise.
  - **Use Case**: Back out of a problematic merge.
  - **Example**: `git merge --abort`

- **`git branch -d <branch-name>`**
  - **Description**: Deletes a merged branch.
  - **Use Case**: Clean up after merging.
  - **Example**: `git branch -d feature/login`

- **`git branch -D <branch-name>`**
  - **Description**: Force deletes a branch, even if unmerged.
  - **Use Case**: Discard an unwanted branch.
  - **Example**: `git branch -D feature/login`

#### 5. Remote Repositories
- **`git remote add <name> <url>`**
  - **Description**: Links a remote repository to your local one.
  - **Use Case**: Connect to GitHub or another hosting service.
  - **Example**: `git remote add origin https://github.com/username/repo.git`

- **`git remote -v`**
  - **Description**: Lists all remote connections with their URLs.
  - **Use Case**: Verify remote setup.
  - **Example**: `git remote -v`

- **`git push <remote> <branch>`**
  - **Description**: Uploads local commits to the specified remote branch.
  - **Use Case**: Share your work with the team.
  - **Example**: `git push origin main`

- **`git push --force`**
  - **Description**: Overwrites the remote branch with your local branch.
  - **Use Case**: Reset remote history (use with caution).
  - **Example**: `git push --force`

- **`git pull <remote> <branch>`**
  - **Description**: Fetches and merges changes from the remote branch.
  - **Use Case**: Sync your local branch with the remote.
  - **Example**: `git pull origin main`

- **`git fetch <remote>`**
  - **Description**: Downloads remote changes without merging them.
  - **Use Case**: Preview updates before integrating.
  - **Example**: `git fetch origin`

#### 6. Undoing Changes
- **`git reset <file>`**
  - **Description**: Unstages a file but keeps changes in the working directory.
  - **Use Case**: Remove a file from the next commit.
  - **Example**: `git reset index.html`

- **`git reset --soft <commit>`**
  - **Description**: Moves HEAD to a commit, keeping changes staged.
  - **Use Case**: Undo a commit but keep changes ready to recommit.
  - **Example**: `git reset --soft HEAD^`

- **`git reset --hard <commit>`**
  - **Description**: Resets everything (working directory, staging, and history) to a commit.
  - **Use Case**: Completely discard unwanted changes.
  - **Example**: `git reset --hard HEAD^`

- **`git revert <commit>`**
  - **Description**: Creates a new commit that reverses a previous commit.
  - **Use Case**: Safely undo changes in shared history.
  - **Example**: `git revert abc123`

- **`git restore <file>`**
  - **Description**: Discards uncommitted changes to a file in the working directory.
  - **Use Case**: Revert a file to its last committed state.
  - **Example**: `git restore index.html`

- **`git restore --staged <file>`**
  - **Description**: Unstages a file (same as `git reset <file>`).
  - **Use Case**: Remove a file from staging.
  - **Example**: `git restore --staged index.html`

#### 7. Stashing Changes
- **`git stash`**
  - **Description**: Saves uncommitted changes and reverts the working directory to the last commit.
  - **Use Case**: Temporarily shelve work to switch branches.
  - **Example**: `git stash`

- **`git stash push -m "<message>"`**
  - **Description**: Stashes changes with a custom message.
  - **Use Case**: Label stashes for clarity.
  - **Example**: `git stash push -m "WIP on login"`

- **`git stash list`**
  - **Description**: Displays all stashed changes with their indices.
  - **Use Case**: Review available stashes.
  - **Example**: `git stash list`

- **`git stash apply <stash>`**
  - **Description**: Reapplies a specific stash without removing it.
  - **Use Case**: Restore stashed changes to continue work.
  - **Example**: `git stash apply stash{0}`

- **`git stash pop`**
  - **Description**: Applies the most recent stash and removes it from the list.
  - **Use Case**: Resume work and clean up the stash list.
  - **Example**: `git stash pop`

- **`git stash drop <stash>`**
  - **Description**: Deletes a specific stash.
  - **Use Case**: Remove an unneeded stash.
  - **Example**: `git stash drop stash{1}`

#### 8. Tagging
- **`git tag <tag-name>`**
  - **Description**: Creates a lightweight tag at the current commit.
  - **Use Case**: Mark a release point (e.g., `v1.0`).
  - **Example**: `git tag v1.0`

- **`git tag -a <tag-name> -m "<message>"`**
  - **Description**: Creates an annotated tag with a message.
  - **Use Case**: Document a release with details.
  - **Example**: `git tag -a v1.0 -m "Stable release"`

- **`git tag`**
  - **Description**: Lists all tags in the repository.
  - **Use Case**: Check existing tags.
  - **Example**: `git tag`

- **`git push origin <tag-name>`**
  - **Description**: Pushes a tag to the remote repository.
  - **Use Case**: Share a release with the team.
  - **Example**: `git push origin v1.0`

- **`git push --tags`**
  - **Description**: Pushes all tags to the remote repository.
  - **Use Case**: Sync all tags at once.
  - **Example**: `git push --tags`

#### 9. File Management
- **`git rm <file>`**
  - **Description**: Deletes a file from the working directory and stages the deletion.
  - **Use Case**: Remove a file and track the change.
  - **Example**: `git rm outdated.txt`

- **`git mv <old-name> <new-name>`**
  - **Description**: Renames a file and stages the change.
  - **Use Case**: Rename a tracked file cleanly.
  - **Example**: `git mv oldname.txt newname.txt`

- **`git clean -f`**
  - **Description**: Removes untracked files from the working directory.
  - **Use Case**: Clean up unused files.
  - **Example**: `git clean -f`

#### 10. Inspection and Debugging
- **`git blame <file>`**
  - **Description**: Shows who last modified each line of a file, with commit details.
  - **Use Case**: Track down who introduced a bug.
  - **Example**: `git blame index.html`

- **`git bisect start`**
  - **Description**: Begins a binary search through commit history to find a bug.
  - **Use Case**: Identify the commit that introduced an issue.
  - **Example**: `git bisect start`

- **`git bisect good/bad`**
  - **Description**: Marks a commit as good (working) or bad (buggy) during bisecting.
  - **Use Case**: Narrow down the problematic commit.
  - **Example**: `git bisect good`, `git bisect bad`

- **`git bisect reset`**
  - **Description**: Ends the bisect process and returns to the original state.
  - **Use Case**: Finish debugging.
  - **Example**: `git bisect reset`

---

### Git Branch Naming Conventions

Branch naming conventions standardize how branches are named, improving organization and collaboration. Below are detailed conventions, including all the ones you provided:

1. **`main` or `master`**
   - **Description**: The primary branch with production-ready, stable code.
   - **Use Case**: Deployable codebase; the source of truth.

2. **`develop`**
   - **Description**: Integration branch for features in progress.
   - **Use Case**: Staging area before merging into `main`.

3. **`feature/<feature-name>`**
   - **Description**: For new features or functionalities.
   - **Use Case**: Isolate development of a specific feature (e.g., `feature/add-user-auth`).

4. **`bugfix/<bug-description>`**
   - **Description**: For fixing bugs in the code.
   - **Use Case**: Address a specific issue (e.g., `bugfix/fix-login-crash`).

5. **`hotfix/<issue-description>`**
   - **Description**: For urgent patches, usually applied to production.
   - **Use Case**: Quick fixes to `main` (e.g., `hotfix/patch-security-vuln`).

6. **`design/<ui-ux-description>`**
   - **Description**: For user interface or user experience updates.
   - **Use Case**: Work on UI/UX improvements (e.g., `design/update-dashboard-layout`).

7. **`refactor/<refactor-description>`**
   - **Description**: For improving code structure without changing functionality.
   - **Use Case**: Clean up code (e.g., `refactor/simplify-api-calls`).

8. **`test/<test-description>`**
   - **Description**: For writing or improving automated tests.
   - **Use Case**: Add or enhance tests (e.g., `test/add-unit-tests-for-auth`).

9. **`doc/<doc-description>`**
   - **Description**: For documentation updates.
   - **Use Case**: Update README or API docs (e.g., `doc/update-installation-guide`).

10. **`release/<version>`**
    - **Description**: For preparing a specific release.
    - **Use Case**: Final tweaks before tagging (e.g., `release/v1.2.0`).

11. **`experiment/<experiment-name>`**
    - **Description**: For experimental or exploratory work.
    - **Use Case**: Test new ideas (e.g., `experiment/try-new-caching`).

**Best Practices**:
- Use lowercase and hyphens (e.g., `feature/add-login`, not `FeatureAddLogin`).
- Keep names short but descriptive.
- Prefix with the category (e.g., `feature/`, `bugfix/`) for clarity.
- Include ticket numbers if applicable (e.g., `feature/JIRA-123-add-login`).

---

### Git Commit Naming Conventions

Commit messages should be clear, consistent, and informative. Here’s a detailed guide:

1. **Imperative Mood**
   - **Description**: Write as a command (e.g., "Add", "Fix", "Update").
   - **Use Case**: Aligns with Git’s style (e.g., "Add user profile page").

2. **Structured Format: `<type>(<scope>): <short-description>`**
   - **Description**: Use a type, optional scope, and brief summary.
   - **Use Case**: Enable automation (e.g., changelogs) and clarity.
   - **Common Types**:
     - `feat`: New feature or enhancement.
     - `fix`: Bug fix.
     - `docs`: Documentation changes.
     - `style`: Code style or formatting (no functional change).
     - `refactor`: Code restructuring without altering behavior.
     - `test`: Adding or improving tests.
     - `chore`: Maintenance tasks (e.g., dependency updates).
     - `design`: UI/UX changes (custom addition based on your branch convention).
   - **Scope**: Optional; specifies the affected area (e.g., `auth`, `ui`, `api`).
   - **Example**: `feat(auth): implement JWT authentication`

3. **Short Summary (50-72 Characters)**
   - **Description**: Keep the first line concise for easy reading in logs.
   - **Use Case**: Quick reference (e.g., `fix(ui): correct button alignment`).

4. **Detailed Description (Optional)**
   - **Description**: After a blank line, add context, reasoning, or details.
   - **Use Case**: Explain complex changes or decisions.
   - **Example**:
     ```
     refactor(api): simplify error handling
     
     - Remove redundant try-catch blocks
     - Centralize error responses in middleware
     - Update tests to reflect changes
     ```

**Examples Matching Branch Conventions**:
- `feat(core): add user authentication system` (for `feature/`)
- `fix(api): resolve null reference error` (for `bugfix/`)
- `fix(prod): patch XSS vulnerability` (for `hotfix/`)
- `design(ui): redesign login page layout` (for `design/`)
- `refactor(db): optimize query performance` (for `refactor/`)
- `test(api): add integration tests for endpoints` (for `test/`)
- `docs(readme): update installation steps` (for `doc/`)

**Best Practices**:
- Be specific (e.g., avoid "Fix bug" — say what was fixed).
- Use present tense (e.g., "Add" not "Added").
- Reference issue/ticket numbers if applicable (e.g., `feat: add feature (closes #123)`).
- Keep messages meaningful for future readers.

---

### Summary
This guide includes:
- Full explanations of Git and GitHub.
- Every major Git command with descriptions and use cases.
- Expanded branch naming conventions (including all your specified prefixes: `feature/`, `bugfix/`, `hotfix/`, `design/`, `refactor/`, `test/`, `doc/`, plus others like `main`, `develop`, etc.).
- Detailed commit naming conventions aligned with branch types.

