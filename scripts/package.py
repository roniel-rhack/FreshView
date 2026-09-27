"""Validate extension resources and package only runtime files."""

import argparse
import json
import posixpath
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DIRECTORIES = ("css", "fonts", "html", "img", "js", "_locales")


def validate_locales(files, manifest):
    default_path = f"_locales/{manifest['default_locale']}/messages.json"
    if default_path not in files:
        raise ValueError("Missing default locale: " + default_path)
    catalogs = {name: json.loads(data) for name, data in files.items()
                if name.startswith("_locales/") and name.endswith("/messages.json")}
    default = catalogs[default_path]
    for name, catalog in catalogs.items():
        if catalog.keys() != default.keys():
            raise ValueError("Locale message keys differ: " + name)
        for key, entry in catalog.items():
            if not isinstance(entry.get("message"), str) or not entry["message"].strip():
                raise ValueError(f"Empty locale message: {name}:{key}")
            placeholders = entry.get("placeholders", {})
            expected = default[key].get("placeholders", {})
            if placeholders != expected:
                raise ValueError(f"Locale placeholders differ: {name}:{key}")
            tokens = {token.lower() for token in re.findall(r"\$([a-zA-Z_]+)\$", entry["message"])}
            if tokens != set(placeholders):
                raise ValueError(f"Invalid locale placeholder tokens: {name}:{key}")
    for source, data in files.items():
        if source.endswith((".html", ".js")) or source == "manifest.json":
            content = data.decode()
            keys = re.findall(r"__MSG_(\w+)__", content)
            keys += re.findall(r'data-i18n(?:-aria|-title)?="([\w]+)"', content)
            keys += re.findall(r'I18n\.message\("([\w]+)"', content)
            missing = set(keys) - default.keys()
            if missing:
                raise ValueError(f"Unknown locale messages in {source}: {sorted(missing)}")
    for canonical, alias in [("zh_CN", "zh_Hans"), ("zh_TW", "zh_Hant")]:
        if catalogs.get(f"_locales/{canonical}/messages.json") != catalogs.get(f"_locales/{alias}/messages.json"):
            raise ValueError(f"Chinese locale alias differs: {canonical}/{alias}")


def validate(files):
    manifest = json.loads(files["manifest.json"])
    validate_locales(files, manifest)
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
