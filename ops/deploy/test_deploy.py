"""Deployment boundary and rollback tests; never touch the live filesystem."""
import importlib.util
import io
import json
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "react_deploy", Path(__file__).with_name("deploy-homestead-react.py")
)
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)

def bundle(files, extra=None):
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode="w:gz") as archive:
        for name, content in files.items():
            data = content.encode()
            item = tarfile.TarInfo(name)
            item.size = len(data)
            archive.addfile(item, io.BytesIO(data))
        if extra is not None:
            archive.addfile(extra)
    return stream.getvalue()

class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name)
        self.files = {
            "index.html": "<script>window.bootstrap = 1;</script>",
            "__spa-fallback.html": "<script>window.bootstrap = 2;</script>",
            "assets/new.js": "console.log('new');",
        }

    def tearDown(self):
        self.temporary.cleanup()

    def extract(self, payload):
        archive = self.directory / "release.tar.gz"
        archive.write_bytes(payload)
        destination = self.directory / "extracted"
        destination.mkdir(exist_ok=True)
        deploy.extract_release(archive, destination)
        return destination

    def test_valid_release_and_exact_csp(self):
        directory = self.extract(bundle(self.files))
        hashes = deploy.inline_hashes(directory)
        self.assertEqual(len(hashes), 2)
        original = "script-src 'self' 'sha256-old' https://www.paypal.com; img-src 'self';"
        updated = deploy.csp_config(original, hashes)
        self.assertNotIn("'sha256-old'", updated)
        self.assertIn("https://www.paypal.com", updated)
        self.assertIn("img-src 'self';", updated)
        self.assertTrue(all(value in updated for value in hashes))

    def test_traversal_is_rejected(self):
        with self.assertRaises(ValueError):
            self.extract(bundle({**self.files, "../outside.txt": "bad"}))
        self.assertFalse((self.directory / "outside.txt").exists())

    def test_symlinks_are_rejected(self):
        link = tarfile.TarInfo("assets/link")
        link.type = tarfile.SYMTYPE
        link.linkname = "/etc/passwd"
        with self.assertRaises(ValueError):
            self.extract(bundle(self.files, link))

    def test_expansion_limit_is_enforced(self):
        with patch.object(deploy, "MAX_EXPANDED", 8):
            with self.assertRaises(ValueError):
                self.extract(bundle(self.files))

    def test_incomplete_build_is_rejected(self):
        with self.assertRaises(ValueError):
            self.extract(bundle({"index.html": "incomplete"}))

    def publish(self, failing=False):
        root = self.directory / "www"
        releases = root / "releases"
        previous = releases / "previous"
        (previous / "assets").mkdir(parents=True)
        (previous / "assets/old.js").write_text("old asset")
        (previous / "index.html").write_text("<script>old()</script>")
        current = root / "current"
        current.symlink_to(previous, target_is_directory=True)
        config = self.directory / "nginx.conf"
        original = 'add_header Content-Security-Policy "script-src \'self\' \'sha256-old\';";\n'
        config.write_text(original)
        fake_input = type("Input", (), {"buffer": io.BytesIO(bundle(self.files))})()
        with (
            patch.object(deploy, "ROOT", root),
            patch.object(deploy, "RELEASES", releases),
            patch.object(deploy, "CURRENT", current),
            patch.object(deploy, "CONFIG", config),
            patch.object(deploy, "STATE", self.directory / "state"),
            patch.object(deploy, "LOCK", self.directory / "deploy.lock"),
            patch.object(deploy.os, "geteuid", return_value=0, create=True),
            patch.object(deploy, "run", return_value=""),
            patch.object(deploy, "backend_health"),
            patch.object(deploy, "frontend_health", side_effect=RuntimeError("health failed") if failing else None),
            patch.object(sys, "argv", ["deploy", "a" * 40]),
            patch.object(sys, "stdin", fake_input),
            patch.object(sys, "stdout", io.StringIO()) as output,
        ):
            if failing:
                with self.assertRaisesRegex(RuntimeError, "health failed"):
                    deploy.main()
            else:
                deploy.main()
                self.assertEqual(json.loads(output.getvalue())["status"], "healthy")
        return current, previous, config, original

    def test_failed_activation_restores_files_and_headers(self):
        current, previous, config, original = self.publish(failing=True)
        self.assertEqual(current.resolve(), previous)
        self.assertEqual(config.read_text(), original)

    def test_success_retains_previous_assets_and_release(self):
        current, previous, config, original = self.publish()
        self.assertNotEqual(current.resolve(), previous)
        self.assertTrue(previous.exists())
        self.assertEqual((current / "assets/old.js").read_text(), "old asset")
        self.assertNotIn("'sha256-old'", config.read_text())

if __name__ == "__main__":
    unittest.main()
