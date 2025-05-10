I’ve provided detailed notes on **CI/CD**, **GitHub Actions**, and related topics, covering definitions, tools, workflows, folder structures, and step-by-step instructions for writing workflow YAML files. However, to ensure absolute completeness, I’ll review and add any potential gaps or advanced topics that could enhance your understanding. Here’s what I’ll include now:

1. **Advanced GitHub Actions Features**: Topics like caching, artifacts, conditional workflows, and self-hosted runners.
2. **Common CI/CD Pipeline Examples**: Specific use cases beyond basic build/test.
3. **Troubleshooting Tips**: Common issues and solutions for GitHub Actions.
4. **Integration with Git**: How Git commands tie into CI/CD workflows.

If you think something specific is missing, please let me know! Otherwise, here’s the final layer of content to round out the notes:

---

### Advanced GitHub Actions Features

#### 1. Caching Dependencies
- **Purpose**: Speed up workflows by reusing files (e.g., `node_modules`, Python `venv`).
- **Example**:
  ```yaml
  steps:
    - name: Cache node modules
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: ${{ runner.os }}-node-
    - name: Install dependencies
      run: npm ci
  ```
  - **Explanation**: Caches `~/.npm` based on `package-lock.json`; restores it if the key matches.

#### 2. Artifacts
- **Purpose**: Store and share files (e.g., build outputs, test reports) between jobs or after a workflow.
- **Example**:
  ```yaml
  steps:
    - name: Build
      run: npm run build
    - name: Upload artifact
      uses: actions/upload-artifact@v4
      with:
        name: build-output
        path: dist/
  ```
  - **Use Case**: Download `dist/` from the Actions tab for debugging.

#### 3. Conditional Execution
- **Purpose**: Run steps/jobs based on conditions (e.g., branch, status).
- **Example**:
  ```yaml
  jobs:
    deploy:
      if: github.ref == 'refs/heads/main'
      runs-on: ubuntu-latest
      steps:
        - run: echo "Deploying to production"
  ```
  - **Syntax**: Use `if` with expressions like `${{ github.event_name == 'push' }}`.

#### 4. Self-Hosted Runners
- **Purpose**: Run workflows on your own servers instead of GitHub-hosted runners.
- **Setup**: Add a runner via GitHub Settings > Actions > Runners, install it on your machine.
- **Example**:
  ```yaml
  jobs:
    build:
      runs-on: self-hosted
      steps:
        - run: echo "Running on my server"
  ```
  - **Use Case**: Use custom hardware or internal networks.

#### 5. Reusable Workflows
- **Purpose**: Define a workflow once and call it from multiple places.
- **Example** (`.github/workflows/reusable.yml`):
  ```yaml
  name: Reusable Build
  on:
    workflow_call:
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npm ci
        - run: npm run build
  ```
  - **Caller Workflow**:
  ```yaml
  name: CI
  on: [push]
  jobs:
    call-build:
      uses: ./.github/workflows/reusable.yml
  ```

---

### Common CI/CD Pipeline Examples

1. **Build and Test (Node.js)**:
   - Covered earlier: Checkout, setup Node, install, test.
   - Goal: Ensure code works on every push/PR.

2. **Deploy to Hosting (e.g., Vercel)**:
   ```yaml
   name: Deploy to Vercel
   on:
     push:
       branches:
         - main
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Deploy
           env:
             VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
           run: npx vercel --prod --token $VERCEL_TOKEN
   ```
   - **Note**: Store `VERCEL_TOKEN` in GitHub Secrets.

3. **Publish a Package (e.g., npm)**:
   ```yaml
   name: Publish to npm
   on:
     push:
       tags:
         - 'v*'
   jobs:
     publish:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             registry-url: 'https://registry.npmjs.org'
         - run: npm ci
         - run: npm publish
           env:
             NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
   ```
   - **Trigger**: Runs on tag pushes (e.g., `v1.0.0`).

4. **Docker Build and Push**:
   ```yaml
   name: Build and Push Docker Image
   on:
     push:
       branches:
         - main
   jobs:
     docker:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Login to Docker Hub
           uses: docker/login-action@v3
           with:
             username: ${{ secrets.DOCKER_USERNAME }}
             password: ${{ secrets.DOCKER_PASSWORD }}
         - name: Build and push
           run: |
             docker build -t myapp:latest .
             docker push myapp:latest
   ```

---

### Troubleshooting Tips

1. **Workflow Not Running**:
   - Check `on` conditions (e.g., branch mismatch).
   - Verify file is in `.github/workflows/` and ends in `.yml` or `.yaml`.

2. **Step Fails**:
   - View logs in the Actions tab for error details.
   - Add `run: echo $GITHUB_EVENT_NAME` to debug triggers.

3. **Permission Issues**:
   - Ensure GitHub Actions is enabled (Settings > Actions > General).
   - Check secret access (e.g., `${{ secrets.MY_SECRET }}`).

4. **Caching Problems**:
   - Update the `key` if dependencies change (e.g., rehash `package-lock.json`).

---

### Integration with Git

GitHub Actions ties closely to Git commands and workflows:
- **Commits**: `git commit` triggers `push` events.
- **Branches**: `git checkout -b feature/x` and `git push` can trigger branch-specific jobs.
- **Pull Requests**: `git push origin feature/x` and opening a PR triggers `pull_request` events.
- **Tags**: `git tag v1.0 && git push --tags` triggers release workflows.
- **Checkout Action**: `actions/checkout@v4` clones your repo using Git under the hood.

**Example Workflow with Git**:
```yaml
name: Lint on Commit
on: [push]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2 # Fetches last 2 commits
      - run: git diff HEAD^ HEAD # Compare changes
      - run: npm ci
      - run: npm run lint
```
- **Use Case**: Lint only changed files.

---

### Final Confirmation

With this addition, I’ve covered:
- CI/CD basics, tools, and GitHub Actions’ purpose.
- Detailed GitHub Actions mechanics, including workflows, YAML structure, and examples.
- Advanced features (caching, artifacts, conditionals, self-hosted runners, reusable workflows).
- Practical pipeline examples (deploy, publish, Docker).
- Troubleshooting and Git integration.

This should now be a fully exhaustive resource as of March 04, 2025. If there’s a specific scenario, command, or concept you’d like me to dive deeper into, just ask! Otherwise, I believe this addresses everything comprehensively.