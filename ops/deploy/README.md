# React push deployment

Pushes to `main` run `.github/workflows/deploy.yml`. GitHub builds and checks the
frontend with Node 24 and the package manager declared in `package.json`.
The droplet receives only `build/client`; it does not install frontend dependencies.

## Server installation

Install these root-owned files before enabling the workflow:

```sh
sudo install -m 755 ops/deploy/deploy-homestead-react.py /usr/local/sbin/deploy-homestead-react
sudo install -m 755 ops/deploy/receive-homestead-react /usr/local/bin/receive-homestead-react
sudo install -m 440 ops/deploy/homestead-react.sudoers /etc/sudoers.d/homestead-react-deploy
sudo visudo -cf /etc/sudoers.d/homestead-react-deploy
```

Append a dedicated Ed25519 public key to `/home/deploy/.ssh/authorized_keys` with:

```text
restrict,command="/usr/local/bin/receive-homestead-react" ssh-ed25519 PUBLIC_KEY github-actions-homestead-react
```

The key accepts only `deploy-react <40-character commit SHA>`. Its sudo permission
runs only the fixed deployment helper. It cannot open an interactive shell or
forward ports.

## GitHub repository secrets

Configure these in `apelpapa/homestead-puppies-modern`:

- `DROPLET_HOST`: destination IP or hostname.
- `DROPLET_USER`: `deploy`.
- `DROPLET_SSH_KEY`: the dedicated private key.
- `DROPLET_KNOWN_HOSTS`: verified OpenSSH known-host entries for the destination.

For a new droplet, install the helpers and public key there, update the host and
known-host secrets, and provision the existing Nginx/TLS/backend layout first.
An in-place CPU/RAM resize keeps this installation.

## Publication and recovery

The helper validates the archive, generates the exact inline-script CSP hashes
from the compiled HTML, tests Nginx, and switches `current` to the new release.
It retains the previous release and its hashed assets for existing browser tabs.
If activation or health checks fail, it restores the previous release and Nginx
configuration. The shared Express process is not restarted by React deployments.

- Releases: `/var/www/homesteadpuppies.org/releases/<SHA>-<timestamp>`
- Active link: `/var/www/homesteadpuppies.org/current`
- Deployment results and previous config: `/var/lib/homestead-react-deploy/`
- API upstream: `http://127.0.0.1:3001/api/v1`

Use the workflow's **Run workflow** button to retry a deployment. Old releases
are kept for recovery; disk cleanup is a separate maintenance task.
