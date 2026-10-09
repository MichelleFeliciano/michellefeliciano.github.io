#!/usr/bin/env python3
"""Static checks for the portfolio. Standard library only; run from the repo root.

Fails (exit 1) on: missing lang/title/description, images without alt text,
broken internal links, images, or #anchors, invalid JSON-LD, and sitemap
entries that do not match a real page.
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://michellefeliciano.github.io/"
SKIP_DIRS = {".git", ".github", "node_modules", "scripts"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.title = ""
        self._in_title = False
        self._in_ld = False
        self.ld_blocks = []
        self.description = None
        self.refs = []  # (attr, value)
        self.ids = set()
        self.images_without_alt = []
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "html":
            self.lang = a.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta" and a.get("name") == "description":
            self.description = a.get("content")
        elif tag == "script":
            if a.get("type") == "application/ld+json":
                self._in_ld = True
                self.ld_blocks.append("")
            elif a.get("src"):
                self.refs.append(("src", a["src"]))
        elif tag == "img":
            if a.get("alt") is None:
                self.images_without_alt.append(a.get("src", "?"))
            if a.get("src"):
                self.refs.append(("src", a["src"]))
        elif tag == "a" and a.get("href"):
            self.refs.append(("href", a["href"]))
        elif tag == "link" and a.get("href") and a.get("rel") in ("stylesheet", "icon"):
            self.refs.append(("href", a["href"]))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script":
            self._in_ld = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ld:
            self.ld_blocks[-1] += data


def parse(path):
    p = Page()
    p.feed(path.read_text(encoding="utf-8"))
    return p


def main():
    pages = {
        f: parse(f)
        for f in sorted(ROOT.rglob("*.html"))
        if not (set(f.relative_to(ROOT).parts) & SKIP_DIRS)
    }
    errors = []

    for f, p in pages.items():
        rel = f.relative_to(ROOT).as_posix()
        if not p.lang:
            errors.append(f"{rel}: <html> is missing a lang attribute")
        if not p.title.strip():
            errors.append(f"{rel}: missing <title>")
        if not (p.description or "").strip():
            errors.append(f"{rel}: missing meta description")
        if p.h1_count != 1:
            errors.append(f"{rel}: expected exactly one <h1>, found {p.h1_count}")
        for src in p.images_without_alt:
            errors.append(f"{rel}: image without alt attribute: {src}")
        for i, block in enumerate(p.ld_blocks, 1):
            try:
                json.loads(block)
            except ValueError as exc:
                errors.append(f"{rel}: JSON-LD block {i} is not valid JSON ({exc})")

        for _attr, value in p.refs:
            parsed = urlparse(value)
            if parsed.scheme or value.startswith(("//", "mailto:", "tel:")):
                continue
            if parsed.path.startswith("/"):
                # Root-absolute paths (404.html uses them, since it is served from any folder depth)
                target = (ROOT / unquote(parsed.path.lstrip("/"))).resolve()
            else:
                target = f if not parsed.path else (f.parent / unquote(parsed.path)).resolve()
            if target.is_dir():
                target = target / "index.html"
            if not target.exists():
                errors.append(f"{rel}: broken link or file reference -> {value}")
                continue
            if parsed.fragment and target.suffix == ".html":
                tp = pages.get(target) or parse(target)
                if parsed.fragment not in tp.ids:
                    errors.append(f"{rel}: anchor not found -> {value}")

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in ET.parse(sitemap).getroot().findall("s:url/s:loc", ns):
            url = (loc.text or "").strip()
            if not url.startswith(SITE):
                errors.append(f"sitemap.xml: unexpected URL {url}")
                continue
            rel_path = url[len(SITE):] or "index.html"
            if not (ROOT / rel_path).exists():
                errors.append(f"sitemap.xml: {url} has no matching file")
    else:
        errors.append("sitemap.xml is missing")

    if not (ROOT / "robots.txt").exists():
        errors.append("robots.txt is missing")

    for line in errors:
        print("FAIL", line)
    print(f"Checked {len(pages)} HTML pages: {len(errors)} problem(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
