#!/usr/bin/env python3
"""Download the cover images covers.json names, and assemble the site's Pages artifact.

Carried into each destination as `.deploy/cover_fetch.py` and run by the runner's own
`python3` (3.12 on ubuntu-latest, its syntax floor): ONE file, standard library only. It
validates the manifest whole before any request, puts each cover at `<out>/<path>` (from a
`--cache` copy passing a download's checks, else downloaded with retries), and writes
`<out>/covers/sums.json`, from which confirm learns the artifact's bytes. The cache keeps
each download and is pruned to the manifest; `--site` copies every tracked file, dotpaths
aside, into `<out>`. Without either it is the local mode, for a working tree's covers.
Requests are bounded by a COPY of `bounded_fetch`'s rules, which a workspace test holds
equal. Exit 0 with every cover in place, 1 naming each that failed, 2 for a bad manifest
or invocation, or any unexpected error.
"""

from __future__ import annotations

import argparse
import hashlib
import http.client
import io
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import traceback
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import IO

SCHEMA = 1
FOLDER = "covers"
#: The URL suffixes a cover may carry; `magic_matches` knows each one's leading bytes.
EXTENSIONS = ("jpeg", "jpg", "png", "webp")
KEY_DIGITS = 16
_HOST = re.compile(r"[a-z0-9-]+(\.[a-z0-9-]+)+")
#: Named rather than written inline: formatting at the workspace's 3.14 target rewrites an
#: inline pair into the unparenthesized form, a SyntaxError on the 3.12 runner.
_JSON_FAULTS = (ValueError, RecursionError)

EXIT_OK, EXIT_FAILED, EXIT_SETUP = 0, 1, 2


class SetupError(Exception):
    """The run cannot proceed for a reason that is no one cover's: exit 2."""


class ManifestError(SetupError):
    """The manifest breaks its schema; it is refused whole, before any request."""


@dataclass(frozen=True)
class Cover:
    """One manifest entry: where the cover goes in the site, and where it comes from."""

    path: str
    url: str


def cover_path(url: str) -> str:
    """`covers/<16 hex of sha256(url)>.<ext>`, ext the URL path's last suffix, lowercased."""
    last = urllib.parse.urlsplit(url).path.rsplit("/", 1)[-1]
    _, dot, suffix = last.rpartition(".")
    if not dot or suffix.lower() not in EXTENSIONS:
        raise ManifestError(f"a cover url's path does not end in one of {EXTENSIONS}")
    key = hashlib.sha256(url.encode("utf-8")).hexdigest()[:KEY_DIGITS]
    return f"{FOLDER}/{key}.{suffix.lower()}"


def _expect(condition: bool, reason: str) -> None:
    """Raise `ManifestError(reason)` unless `condition` holds."""
    if not condition:
        raise ManifestError(reason)


def safe_text(url: str) -> bool:
    """No whitespace or control/format character, scanned raw: urlsplit drops some."""
    return not any(c.isspace() or unicodedata.category(c).startswith("C") for c in url)


def _check_url(url: str, hosts: frozenset[str]) -> None:
    """Refuse `url` unless https with a netloc that IS a listed host: no userinfo or port."""
    _expect(safe_text(url), "a cover url holds whitespace or a control character")
    try:
        parts = urllib.parse.urlsplit(url)
    except ValueError:
        raise ManifestError("a cover url does not parse") from None
    _expect(parts.scheme == "https" and parts.netloc in hosts, "a url off the hosts")


def _parse_cover(value: object, hosts: frozenset[str]) -> Cover:
    """One `covers` entry, its url checked and its path the one that url derives."""
    _expect(isinstance(value, dict) and set(value) == {"path", "url"}, "a bad cover")
    assert isinstance(value, dict)  # narrowing for the type checker; _expect raised
    path, url = value["path"], value["url"]
    _expect(isinstance(path, str) and isinstance(url, str), "a cover field is not text")
    _check_url(url, hosts)
    _expect(path == cover_path(url), "a cover path is not the one its url derives")
    return Cover(path, url)


# fuzz-target
def parse_manifest(text: str) -> tuple[Cover, ...]:
    """The covers `text` lists; `ManifestError`, and nothing else, for any fault in it.

    Keys exactly `schema` (1), `hosts` (sorted, unique host names) and `covers`; every url
    https on a listed host; every path the one its url derives; paths strictly increasing.
    """
    try:
        data = json.loads(text)
    except _JSON_FAULTS:
        raise ManifestError("the manifest is not JSON") from None
    _expect(isinstance(data, dict), "the manifest is not an object")
    _expect(set(data) == {"schema", "hosts", "covers"}, "the manifest's keys are wrong")
    _expect(type(data["schema"]) is int and data["schema"] == SCHEMA, "unknown schema")
    hosts = data["hosts"]
    _expect(isinstance(hosts, list), "hosts is not a list")
    _expect(all(isinstance(h, str) and _HOST.fullmatch(h) for h in hosts), "a bad host")
    _expect(hosts == sorted(set(hosts)), "hosts are not sorted and unique")
    _expect(isinstance(data["covers"], list), "covers is not a list")
    covers = tuple(_parse_cover(entry, frozenset(hosts)) for entry in data["covers"])
    paths = [cover.path for cover in covers]
    _expect(paths == sorted(set(paths)), "cover paths are not sorted and unique")
    return covers


#: bounded_fetch's DEFAULT_TIMEOUT_SECONDS, BODY_LIMIT_BYTES and BODY_DEADLINE_SECONDS.
SOCKET_TIMEOUT_SECONDS = 15.0
BODY_LIMIT_BYTES = 4 * 1024 * 1024
BODY_DEADLINE_SECONDS = 60.0
_READ_CHUNK_BYTES = 64 * 1024

#: The wait before each of the four attempts: none, then 5, 20 and 60 s, so a CDN blip of
#: up to a minute and a half costs one cover's retries rather than the day's deploy.
ATTEMPT_WAITS_SECONDS = (0.0, 5.0, 20.0, 60.0)
#: A cover the host says is gone does not come back in a minute, so it is not retried.
GONE_STATUSES = frozenset({404, 410})


class CoverError(Exception):
    """One cover could not be put in place; the message says why."""


@dataclass(frozen=True)
class Fetched:
    """One HTTP answer: its status, its lowercased media type, and its body."""

    status: int
    content_type: str
    body: bytes


Fetch = Callable[[str], Fetched]


def magic_matches(ext: str, body: bytes) -> bool:
    """Whether `body` starts the way an image of the format `ext` names must."""
    if ext in ("jpg", "jpeg"):
        return body.startswith(b"\xff\xd8\xff")
    if ext == "png":
        return body.startswith(b"\x89PNG\r\n\x1a\n")
    return body[:4] == b"RIFF" and body[8:12] == b"WEBP"


def image_fault(cover: Cover, body: bytes) -> str:
    """Why `body` cannot be `cover`'s image, or the empty string when it can."""
    if not body:
        return "an empty body"
    if len(body) > BODY_LIMIT_BYTES:
        return f"a body over {BODY_LIMIT_BYTES} bytes"
    ext = cover.path.rsplit(".", 1)[1]
    if not magic_matches(ext, body):
        return f"bytes that are not a {ext} image"
    return ""


def answer_fault(cover: Cover, got: Fetched) -> str:
    """Why the answer `got` is not `cover`'s image, or the empty string when it is."""
    if got.status != 200:
        return f"HTTP {got.status}"
    if not got.content_type.startswith("image/"):
        return f"content type {got.content_type}"
    return image_fault(cover, got.body)


def fetch_cover(cover: Cover, fetch: Fetch, sleep: Callable[[float], None]) -> bytes:
    """`cover`'s bytes, in up to four attempts; `CoverError` naming the last fault."""
    reason = ""
    for wait in ATTEMPT_WAITS_SECONDS:
        sleep(wait)
        try:
            got = fetch(cover.url)
        except (OSError, ValueError, http.client.HTTPException) as error:
            reason = f"{type(error).__name__}: {error}"
            continue
        if got.status in GONE_STATUSES:
            raise CoverError(f"HTTP {got.status}, so it was not retried")
        reason = answer_fault(cover, got)
        if not reason:
            return got.body
    raise CoverError(f"{reason}, after {len(ATTEMPT_WAITS_SECONDS)} attempts")


def read_body(
    response: io.BufferedIOBase, clock: Callable[[], float] = time.monotonic
) -> bytes:
    """The whole body, bounded_fetch's way: `ValueError` past 4 MiB, `TimeoutError` past 60 s.

    `read1`, never `read(n)`, so the deadline is checked even against a drip-feed.
    """
    started = clock()
    chunks: list[bytes] = []
    received = 0
    while chunk := response.read1(_READ_CHUNK_BYTES):
        received += len(chunk)
        if received > BODY_LIMIT_BYTES:
            raise ValueError(f"response body exceeds {BODY_LIMIT_BYTES} bytes")
        chunks.append(chunk)
        if clock() - started > BODY_DEADLINE_SECONDS:
            raise TimeoutError("response body still arriving after the deadline")
    return b"".join(chunks)


class HttpsOnlyRedirect(urllib.request.HTTPRedirectHandler):
    """Follow a redirect only to an https URL with a host, as bounded_fetch does."""

    def redirect_request(
        self,
        req: urllib.request.Request,
        fp: IO[bytes],
        code: int,
        msg: str,
        headers: http.client.HTTPMessage,
        newurl: str,
    ) -> urllib.request.Request | None:
        """The next hop; `ValueError`, never naming the target, unless it is followable."""
        if not followable(newurl):
            fp.close()
            raise ValueError("refusing a redirect to anything but https")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def followable(url: str) -> bool:
    """bounded_fetch's hop rule: https, a host, no userinfo, a readable port, safe text."""
    try:
        parts = urllib.parse.urlsplit(url)
        origin = (parts.scheme, bool(parts.hostname), parts.port)  # port: ValueError
    except ValueError:
        return False
    return safe_text(url) and origin[:2] == ("https", True) and "@" not in parts.netloc


def make_fetch(loopback: str | None) -> Fetch:
    """The real fetch: https through the redirect guard, or one loopback origin.

    With `loopback` (tests and samples) each URL keeps its path and query and goes to that
    origin, past any proxy; the manifest's https rule is unchanged.
    """
    handlers: list[urllib.request.BaseHandler] = [HttpsOnlyRedirect()]
    if loopback is not None:
        handlers.append(urllib.request.ProxyHandler({}))
    opener = urllib.request.build_opener(*handlers)

    def fetch(url: str) -> Fetched:
        if loopback is not None:
            parts = urllib.parse.urlsplit(url)
            url = loopback + urllib.parse.urlunsplit(
                ("", "", parts.path, parts.query, "")
            )
        try:
            with opener.open(url, timeout=SOCKET_TIMEOUT_SECONDS) as response:
                kind = response.headers.get_content_type()
                return Fetched(response.status, kind, read_body(response))
        except urllib.error.HTTPError as error:
            error.close()
            return Fetched(error.code, "", b"")

    return fetch


SUMS_NAME = "sums.json"
GIT_TIMEOUT_SECONDS = 60.0
_LOOPBACK = re.compile(r"http://(127\.0\.0\.1|localhost):[0-9]{1,5}")
#: What exits 2 with a one-line reason: a refusal, an I/O fault, or git failing.
_SETUP_FAULTS = (SetupError, OSError, UnicodeDecodeError, subprocess.SubprocessError)
Runner = Callable[..., "subprocess.CompletedProcess[bytes]"]
#: TMDB's terms forbid caching longer than six months; 150 days leaves a margin.
MAX_CACHE_AGE_SECONDS = 150 * 24 * 60 * 60


def write_atomic(path: Path, data: bytes) -> None:
    """Atomically replace `path`, in a folder `real_folder` made, with `data`, mode 0644."""
    descriptor, staging = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.")
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(staging, 0o644)
        os.replace(staging, path)
    except BaseException:
        Path(staging).unlink(missing_ok=True)
        raise


def real_folder(path: Path) -> Path:
    """`path`, created if absent; `SetupError` for a symlink (a restored cache's say-so)."""
    if path.is_symlink() or (path.exists() and not path.is_dir()):
        raise SetupError(f"{path} is not a real folder")
    path.mkdir(parents=True, exist_ok=True)
    return path


def cached_body(cache: Path, cover: Cover, now: float) -> bytes | None:
    """`cover`'s cached copy if regular, fresh enough and passing every check, else None."""
    target = cache / cover.path
    try:
        info = target.lstat()
    except FileNotFoundError:
        return None
    if stat.S_ISDIR(info.st_mode):
        shutil.rmtree(target)  # a download's os.replace swaps any other kind of entry
    stale = now - info.st_mtime > MAX_CACHE_AGE_SECONDS  # a future mtime is fresh
    if not stat.S_ISREG(info.st_mode) or info.st_size > BODY_LIMIT_BYTES or stale:
        return None
    body = target.read_bytes()
    return None if image_fault(cover, body) else body


def prune_cache(folder: Path, keep: frozenset[str]) -> None:
    """Remove everything in the cache's covers `folder` that no manifest path names."""
    for entry in folder.iterdir():
        if f"{FOLDER}/{entry.name}" in keep:
            continue
        if entry.is_dir() and not entry.is_symlink():
            shutil.rmtree(entry)
        else:
            entry.unlink()


def sums_text(sums: dict[str, dict[str, object]]) -> str:
    """`sums.json`'s text: schema 1, then the covers in the manifest's path order."""
    return json.dumps({"schema": SCHEMA, "covers": sums}, indent=2) + "\n"


def tracked_files(site: Path, run: Runner) -> list[str]:
    """Every file git tracks in `site`; `SetupError` for a tracked symlink or submodule."""
    done = run(
        ["git", "-C", str(site), "ls-files", "-z", "--stage"],
        capture_output=True,
        check=True,
        timeout=GIT_TIMEOUT_SECONDS,
    )
    paths: list[str] = []
    for record in done.stdout.decode("utf-8").split("\0")[:-1]:
        meta, _, path = record.partition("\t")
        if not meta.startswith("100"):
            raise SetupError(f"{path} is tracked as a link or submodule, not a file")
        paths.append(path)
    return paths


def is_dotpath(path: str) -> bool:
    """Whether any segment of `path` starts with a dot, which confirm never fetches."""
    return any(part.startswith(".") for part in PurePosixPath(path).parts)


def assemble(site: Path, out: Path, run: Runner) -> int:
    """Copy every tracked non-dotpath of `site` into `out`; the count copied."""
    paths = [path for path in tracked_files(site, run) if not is_dotpath(path)]
    if any(PurePosixPath(path).parts[0] == FOLDER for path in paths):
        raise SetupError(
            f"the site tracks files under {FOLDER}/, which only this fills"
        )
    for path in paths:
        (out / path).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(site / path, out / path)
    return len(paths)


def place_covers(
    covers: tuple[Cover, ...],
    out: Path,
    cache: Path | None,
    fetch: Fetch,
    sleep: Callable[[float], None],
    now: Callable[[], float] = time.time,
) -> tuple[dict[str, dict[str, object]], int, list[str]]:
    """Put each cover at `out`, from the cache or a download: (sums, reused, failures)."""
    sums: dict[str, dict[str, object]] = {}
    reused, failures = 0, []
    for cover in covers:
        body = cached_body(cache, cover, now()) if cache is not None else None
        reused += body is not None
        if body is None:
            try:
                body = fetch_cover(cover, fetch, sleep)
            except CoverError as error:
                failures.append(f"cover_fetch: {cover.path} ({cover.url}): {error}")
                continue
            if cache is not None:
                write_atomic(cache / cover.path, body)
        write_atomic(out / cover.path, body)
        digest = hashlib.sha256(body).hexdigest()
        sums[cover.path] = {"sha256": digest, "size": len(body)}
    return sums, reused, failures


def force_utf8_streams(first: IO[str], /, *more: IO[str]) -> None:
    """Make each text stream UTF-8, as stdio_utf8 does: a runner's stdout is a pipe."""
    for stream in (first, *more):
        if isinstance(stream, io.TextIOWrapper):
            stream.reconfigure(encoding="utf-8", errors="backslashreplace")


class ReqAwareDefaultsFormatter(argparse.ArgumentDefaultsHelpFormatter):
    """Show optionals' defaults, minus the `(default: None)` 3.12 puts on required ones."""

    def _get_help_string(self, action: argparse.Action) -> str | None:
        """The help unchanged for a required action, else the base class's."""
        return action.help if action.required else super()._get_help_string(action)


def loopback_origin(text: str) -> str:
    """An argparse type: `http://127.0.0.1:<port>` or `http://localhost:<port>` only."""
    if not _LOOPBACK.fullmatch(text):
        raise argparse.ArgumentTypeError("must be http://127.0.0.1:<port> or localhost")
    return text


def build_parser() -> argparse.ArgumentParser:
    """Named options only, with every optional's default shown in --help."""
    parser = argparse.ArgumentParser(
        description="Download the covers covers.json names; optionally assemble the site.",
        formatter_class=ReqAwareDefaultsFormatter,
        epilog="Standard library only; Python 3.12+. Exit 0 when every cover is in place, "
        "1 naming each cover that failed, 2 for a bad manifest or invocation, or any "
        "unexpected error.",
    )
    parser.add_argument("--manifest", required=True, help="the covers.json to read")
    parser.add_argument("--out", required=True, help="where covers/ goes, and the site")
    parser.add_argument("--cache", help="a cover cache to reuse, fill and prune")
    parser.add_argument("--site", help="a git checkout to copy tracked files from")
    parser.add_argument(
        "--serve-from-loopback", type=loopback_origin, help="tests only"
    )
    return parser


def main(
    argv: Sequence[str] | None = None,
    *,
    fetch: Fetch | None = None,
    sleep: Callable[[float], None] = time.sleep,
    run: Runner = subprocess.run,
) -> int:
    """Parse the options, place the covers, assemble, and map each failure to its exit."""
    force_utf8_streams(sys.stdout, sys.stderr)
    args = build_parser().parse_args(argv)
    out, cache = Path(args.out), None if args.cache is None else Path(args.cache)
    try:
        covers = parse_manifest(Path(args.manifest).read_text(encoding="utf-8"))
        real_folder(out / FOLDER)
        cache_folder = None if cache is None else real_folder(cache / FOLDER)
        real_fetch = fetch or make_fetch(args.serve_from_loopback)
        sums, reused, failures = place_covers(covers, out, cache, real_fetch, sleep)
        if cache_folder is not None:
            prune_cache(cache_folder, frozenset(cover.path for cover in covers))
        if failures:
            print(*failures, sep="\n", file=sys.stderr)
            return EXIT_FAILED
        write_atomic(out / FOLDER / SUMS_NAME, sums_text(sums).encode("utf-8"))
        copied = 0 if args.site is None else assemble(Path(args.site), out, run)
    except _SETUP_FAULTS as error:
        print(f"cover_fetch: {error}", file=sys.stderr)
        return EXIT_SETUP
    except Exception:
        # Anything else is a defect, not a cover's fault: exit 2 with the traceback, never
        # Python's own 1, which here means "these covers failed".
        traceback.print_exc(file=sys.stderr)
        return EXIT_SETUP
    done = (
        f"{len(sums)} covers in place ({reused} from the cache), {copied} files copied"
    )
    print(f"cover_fetch: {done}", file=sys.stdout)
    return EXIT_OK


if __name__ == "__main__":  # pragma: no cover - the CLI entry point; main() is tested
    sys.exit(main())
