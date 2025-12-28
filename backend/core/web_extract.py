import json
import re
import logging
from html import unescape
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)

_DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def _first_match(pattern: str, text: str, flags: int = 0) -> Optional[str]:
    match = re.search(pattern, text, flags)
    return match.group(1).strip() if match else None


def extract_price_from_html(html: str) -> Optional[Dict[str, Any]]:
    if not html:
        return None

    text = unescape(html)

    # 1) OpenGraph / product meta
    amount = _first_match(
        r"<meta[^>]+(?:property|name)=\"product:price:amount\"[^>]+content=\"([^\"]+)\"",
        text,
        flags=re.IGNORECASE,
    )
    currency = _first_match(
        r"<meta[^>]+(?:property|name)=\"product:price:currency\"[^>]+content=\"([^\"]+)\"",
        text,
        flags=re.IGNORECASE,
    )
    if amount:
        display = f"{currency + ' ' if currency else ''}{amount}".strip()
        return {"display": display, "amount": amount, "currency": currency, "source": "meta"}

    # 2) JSON-LD offers.price / priceCurrency
    for script in re.findall(
        r"<script[^>]+type=\"application/ld\+json\"[^>]*>(.*?)</script>",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        blob = script.strip()
        if not blob:
            continue
        try:
            payload = json.loads(blob)
        except Exception:
            continue

        def scan(node: Any) -> Optional[Dict[str, Any]]:
            if isinstance(node, dict):
                # direct price
                if "price" in node:
                    a = str(node.get("price"))
                    c = node.get("priceCurrency")
                    disp = f"{c + ' ' if c else ''}{a}".strip()
                    return {"display": disp, "amount": a, "currency": c, "source": "jsonld"}
                # offer object
                offers = node.get("offers")
                if offers is not None:
                    found = scan(offers)
                    if found:
                        return found
                for v in node.values():
                    found = scan(v)
                    if found:
                        return found
            elif isinstance(node, list):
                for item in node:
                    found = scan(item)
                    if found:
                        return found
            return None

        found = scan(payload)
        if found:
            return found

    # 3) Heuristic regex (last resort)
    # Currency symbol + number, prefer typical price-like numbers
    m = re.search(
        r"(?:₹|\$|€|£)\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)",
        text,
    )
    if m:
        raw = m.group(0).strip()
        return {"display": raw, "amount": m.group(1), "currency": None, "source": "regex"}

    return None


def extract_basic_page_info_from_html(html: str) -> Dict[str, Any]:
    if not html:
        return {"title": None, "description": None, "price": None}

    text = unescape(html)
    title = _first_match(r"<title[^>]*>(.*?)</title>", text, flags=re.IGNORECASE | re.DOTALL)
    if title:
        title = re.sub(r"\s+", " ", title).strip()

    description = _first_match(
        r"<meta[^>]+name=\"description\"[^>]+content=\"([^\"]+)\"",
        text,
        flags=re.IGNORECASE,
    )

    price = extract_price_from_html(text)

    return {"title": title, "description": description, "price": price}


def fetch_url_html(url: str, timeout_s: int = 12) -> Optional[str]:
    try:
        resp = requests.get(url, headers=_DEFAULT_HEADERS, timeout=timeout_s, allow_redirects=True)
        if resp.status_code >= 400:
            logger.info("fetch_url_html status=%s url=%s", resp.status_code, url)
            return None
        return resp.text
    except Exception as e:
        logger.info("fetch_url_html error url=%s err=%s", url, e)
        return None


def summarize_product_urls(urls) -> Dict[str, Any]:
    """Fetch pages and extract lightweight product signals (title/description/price)."""
    results = []
    for url in urls or []:
        html = fetch_url_html(url)
        info = extract_basic_page_info_from_html(html) if html else {"title": None, "description": None, "price": None}
        results.append({"url": url, **info})

    return {"sources": results}


def extract_main_image_from_html(html: str, base_url: Optional[str] = None) -> Optional[str]:
    """Try to extract a main product image URL from HTML.

    Checks common metadata patterns (og:image, twitter:image), JSON-LD `image`,
    then falls back to the first large <img> src found.
    Returns an absolute URL when possible.
    """
    if not html:
        return None

    text = unescape(html)

    # 1) OpenGraph / twitter
    img = _first_match(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', text, flags=re.IGNORECASE)
    if not img:
        img = _first_match(r'<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"', text, flags=re.IGNORECASE)
    if img:
        return _resolve_url(img, base_url)

    # 2) JSON-LD image
    for script in re.findall(r"<script[^>]+type=\"application/ld\+json\"[^>]*>(.*?)</script>", text, flags=re.IGNORECASE | re.DOTALL):
        blob = script.strip()
        if not blob:
            continue
        try:
            payload = json.loads(blob)
        except Exception:
            continue
        # Look for image or image.url
        def scan_for_image(node):
            if isinstance(node, dict):
                if 'image' in node:
                    v = node['image']
                    if isinstance(v, str):
                        return v
                    if isinstance(v, dict) and 'url' in v:
                        return v['url']
                for val in node.values():
                    found = scan_for_image(val)
                    if found:
                        return found
            elif isinstance(node, list):
                for item in node:
                    found = scan_for_image(item)
                    if found:
                        return found
            return None

        found = scan_for_image(payload)
        if found:
            return _resolve_url(found, base_url)

    # 3) Fallback: first non-empty <img src=> occurrence
    m = re.search(r'<img[^>]+src=["\']?([^"\'\s>]+)', text, flags=re.IGNORECASE)
    if m:
        return _resolve_url(m.group(1), base_url)

    return None


def _resolve_url(url: str, base: Optional[str]) -> str:
    """Resolve relative URLs against base if needed. If resolution fails, return original."""
    if not url:
        return url
    url = url.strip()
    if url.startswith('//'):
        return 'https:' + url
    if url.startswith('http://') or url.startswith('https://'):
        return url
    # Attempt simple join with base
    if base:
        try:
            from urllib.parse import urljoin

            return urljoin(base, url)
        except Exception:
            return url
    return url
