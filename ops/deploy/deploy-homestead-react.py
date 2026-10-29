#!/usr/bin/python3
"""Receive one compiled React release; publish it with matching CSP and rollback."""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.request

ROOT = Path("/var/www/homesteadpuppies.org")
RELEASES = ROOT / "releases"
CURRENT = ROOT / "current"
CONFIG = Path("/etc/nginx/sites-available/homesteadpuppies.org")
STATE = Path("/var/lib/homestead-react-deploy")
LOCK = Path("/run/lock/homestead-react-deploy.lock")
ORIGIN_CA = Path("/etc/ssl/cloudflare/homesteadpuppies.org/origin-ca-root.pem")
MAX_ARCHIVE = 128 * 1024 * 1024
MAX_EXPANDED = 256 * 1024 * 1024

def run(*args):
    result = subprocess.run(args, capture_output=True, text=True, timeout=30)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed: {result.stderr.strip()}")
    return result.stdout

def inline_hashes(directory):
    hashes = set()
    for path in directory.rglob("*.html"):
        source = path.read_text(encoding="utf-8")
        for script in re.findall(
            r"<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)</script>",
            source, re.IGNORECASE,
        ):
            digest = hashlib.sha256(script.encode("utf-8")).digest()
            import base64
            hashes.add("'sha256-" + base64.b64encode(digest).decode("ascii") + "'")
    if not hashes:
        raise ValueError("Release has no inline React bootstrap scripts")
    return hashes

def csp_config(original, hashes):
    def replace(match):
        tokens = re.sub(r"'sha256-[^']+'", "", match.group(1)).split()
        if "'self'" not in tokens:
            raise ValueError("Existing CSP is missing script-src 'self'")
        return "script-src " + " ".join(tokens + sorted(hashes)) + ";"
    updated, count = re.subn(r"script-src\s+([^;]+);", replace, original)
    if count != 1:
        raise ValueError("Expected exactly one script-src policy")
    return updated

def write_config(source):
    fd, temporary = tempfile.mkstemp(prefix=".homestead-react-", dir=CONFIG.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            output.write(source)
        os.chmod(temporary, 0o644)
        os.replace(temporary, CONFIG)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

def point_current(target):
    temporary = ROOT / ".current-deploy"
    if temporary.is_symlink():
        temporary.unlink()
    elif temporary.exists():
        raise ValueError("Unexpected temporary release path")
    temporary.symlink_to(target, target_is_directory=True)
    os.replace(temporary, CURRENT)

def extract_release(archive_path, destination):
    with tarfile.open(archive_path, "r:gz") as archive:
        members = []
        expanded = 0
        for member in archive:
            expanded += member.size
            if len(members) >= 10000 or expanded > MAX_EXPANDED:
                raise ValueError("Release exceeds extraction limits")
            members.append(member)
            path = PurePosixPath(member.name)
            if path.is_absolute() or ".." in path.parts:
                raise ValueError("Release contains an unsafe path")
            if not member.isfile() and not member.isdir():
                raise ValueError("Release may contain only regular files and directories")
            if member.isfile() and path.parts and path.parts[0].startswith("."):
                raise ValueError("Release contains a hidden file")
        archive.extractall(destination, members=members, filter="data")
    for path in destination.rglob("*"):
        path.chmod(0o755 if path.is_dir() else 0o644)
    for name in ["index.html", "__spa-fallback.html"]:
        if not (destination / name).is_file():
            raise ValueError(f"Release is missing {name}")
    if not (destination / "assets").is_dir():
        raise ValueError("Release is missing its assets directory")

def backend_health():
    for name in ["puppies", "parents"]:
        with urllib.request.urlopen(
            "http://127.0.0.1:3001/api/v1/" + name, timeout=10
        ) as response:
            data = json.load(response)
        if not isinstance(data.get(name), list):
            raise ValueError("Backend catalog response is invalid")

def frontend_health():
    for path in ["/", "/puppies/", "/parents/", "/api/v1/puppies"]:
        run(
            "curl", "--silent", "--show-error", "--fail", "--max-time", "10",
            "--cacert", str(ORIGIN_CA),
            "--resolve", "homesteadpuppies.org:443:127.0.0.1",
            "https://homesteadpuppies.org" + path,
        )

def preserve_previous_assets(previous, destination):
    # Already-open and cached pages can still request an older hashed asset.
    old_assets = previous / "assets"
    if not old_assets.is_dir():
        return
    for source in old_assets.rglob("*"):
        if source.is_file() and not source.is_symlink():
            target = destination / "assets" / source.relative_to(old_assets)
            if not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, target)

def main():
    if len(sys.argv) != 2 or not re.fullmatch(r"[0-9a-f]{40}", sys.argv[1]):
        raise ValueError("A full lowercase Git commit SHA is required")
    if os.geteuid() != 0:
        raise PermissionError("Install and invoke through the restricted sudo rule")
    if not CURRENT.is_symlink():
        raise ValueError("Current release must be a symlink")
    previous = CURRENT.resolve(strict=True)
    if previous.parent != RELEASES.resolve(strict=True):
        raise ValueError("Current release is outside the releases directory")
    STATE.mkdir(mode=0o700, parents=True, exist_ok=True)
    STATE.chmod(0o700)
    with open(LOCK, "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        previous = CURRENT.resolve(strict=True)
        original_config = CONFIG.read_text(encoding="utf-8")
        run("nginx", "-t")
        backend_health()
        stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        release_id = sys.argv[1] + "-" + stamp
        state_dir = STATE / release_id
        state_dir.mkdir(mode=0o700)
        (state_dir / "nginx.before.conf").write_text(original_config, encoding="utf-8")
        (state_dir / "previous-release.txt").write_text(str(previous) + "\n")
        incoming = Path(tempfile.mkdtemp(prefix=".incoming-", dir=RELEASES))
        incoming.chmod(0o755)
        release = RELEASES / release_id
        changed = False
        try:
            archive_path = state_dir / "release.tar.gz"
            with archive_path.open("wb") as output:
                total = 0
                while chunk := sys.stdin.buffer.read(1024 * 1024):
                    total += len(chunk)
                    if total > MAX_ARCHIVE:
                        raise ValueError("Compressed release exceeds upload limit")
                    output.write(chunk)
            extract_release(archive_path, incoming)
            hashes = inline_hashes(incoming)
            preserve_previous_assets(previous, incoming)
            old_hashes = set(re.findall(r"'sha256-[^']+'", original_config))
            transition = csp_config(original_config, old_hashes | hashes)
            final_config = csp_config(original_config, hashes)
            incoming.rename(release)
            # Authorize both builds before switching files, then narrow to the new build.
            changed = True
            write_config(transition)
            run("nginx", "-t")
            run("systemctl", "reload", "nginx")
            point_current(release)
            write_config(final_config)
            run("nginx", "-t")
            run("systemctl", "reload", "nginx")
            backend_health()
            frontend_health()
            result = {
                "commit": sys.argv[1], "release": str(release),
                "previous": str(previous), "inline_script_hashes": len(hashes),
                "status": "healthy",
            }
            (state_dir / "result.json").write_text(json.dumps(result, indent=2) + "\n")
            archive_path.unlink()
            print(json.dumps(result))
        except Exception:
            if changed:
                # The previous release and matching headers remain available for rollback.
                write_config(original_config)
                point_current(previous)
                run("nginx", "-t")
                run("systemctl", "reload", "nginx")
            if incoming.exists():
                shutil.rmtree(incoming)
            raise

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("React deployment failed: " + str(error), file=sys.stderr)
        sys.exit(1)
