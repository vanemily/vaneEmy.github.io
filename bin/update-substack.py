#!/usr/bin/env python3
"""Baja la lista de textos de Substack y la guarda en _data/substack.json.

Memorias (blog/index.html) arma sus tarjetas con ese archivo. Substack no
deja que el navegador lea sus datos desde otro sitio, por eso se guarda
aquí: córrelo cada vez que publiques algo nuevo en Substack.

    ./bin/update-substack.py
"""
import json
import pathlib
import urllib.request

PUBLICATION = "https://vanemy.substack.com"
OUT = pathlib.Path(__file__).resolve().parent.parent / "_data" / "substack.json"


def main():
    req = urllib.request.Request(
        f"{PUBLICATION}/api/v1/posts?limit=50",
        headers={"User-Agent": "vanemy.me"},
    )
    with urllib.request.urlopen(req) as res:
        posts = json.load(res)

    items = [
        {
            "title": p["title"],
            "subtitle": p.get("subtitle") or "",
            "description": p.get("description") or "",
            "date": p["post_date"][:10],
            "url": p["canonical_url"],
            "cover": p.get("cover_image") or "",
        }
        for p in posts
        if p.get("audience") == "everyone"
    ]
    items.sort(key=lambda p: p["date"], reverse=True)

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(items)} textos guardados en {OUT.relative_to(OUT.parent.parent)}")


if __name__ == "__main__":
    main()
