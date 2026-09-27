"""Validate extension resources and package only runtime files."""

import argparse
import json
import posixpath
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DIRECTORIES = ("css", "fonts", "html", "img", "js")


def validate(files):
    manifest = json.loads(files["manifest.json"])
    references = list(manifest["icons"].values())
    references += list(manifest["action"]["default_icon"].values())
    references += [manifest["action"]["default_popup"], manifest["options_ui"]["page"]]
    if "service_worker" in manifest["background"]:
        references.append(manifest["background"]["service_worker"])
    references += manifest["background"].get("scripts", [])
    for content in manifest["content_scripts"]:
        references += content.get("js", []) + content.get("css", [])
    for name, data in files.items():
        if name.endswith(".html"):
            paths = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', data.decode())
        elif name.endswith(".css"):
            paths = re.findall(r'url\(["\']?([^"\')]+)', data.decode())
            paths += re.findall(r'@import\s+["\']([^"\']+)', data.decode())
        elif name.endswith(".js"):
            paths = []
            for call in re.findall(r'importScripts\(([^)]*)\)', data.decode()):
                paths += re.findall(r'["\']([^"\']+)["\']', call)
        else:
            continue
        for path in paths:
            if not re.match(r"(?:[a-z]+:|#|//)", path):
                references.append(posixpath.normpath(posixpath.join(posixpath.dirname(name), path)))
    missing = sorted(set(references) - files.keys())
    if missing:
        raise ValueError("Missing packaged resources: " + ", ".join(missing))
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate without creating an archive")
    parser.add_argument("--output", type=Path, default=ROOT / "private/dist/FreshView.zip")
    parser.add_argument("--firefox-id", help="Build a Firefox-only manifest using the maintainer's confirmed add-on ID")
    args = parser.parse_args()
    paths = [ROOT / "manifest.json", ROOT / "LICENSE"]
    for directory in DIRECTORIES:
        paths += [path for path in (ROOT / directory).rglob("*") if path.is_file() and not path.name.startswith(".")]
    files = {path.relative_to(ROOT).as_posix(): path.read_bytes() for path in paths}
    if args.firefox_id:
        firefox = json.loads(files["manifest.json"])
        firefox["browser_specific_settings"]["gecko"]["id"] = args.firefox_id
        firefox["background"].pop("service_worker", None)
        firefox.pop("minimum_chrome_version", None)
        files["manifest.json"] = (json.dumps(firefox, indent=4) + "\n").encode()
    manifest = validate(files)
    if not args.check:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(args.output, "w", ZIP_DEFLATED) as archive:
            for name, data in sorted(files.items()):
                archive.writestr(name, data)
        with ZipFile(args.output) as archive:
            validate({name: archive.read(name) for name in archive.namelist()})
        print(f"Created and validated {args.output}")
    print(f"Validated {len(files)} runtime files for FreshView {manifest['version']}")


if __name__ == "__main__":
    main()
