#!/usr/bin/env python3
"""AVG-AdventurerTavern client rebuild script (local build -> NyaaDockerHUB -> restart).

Usage:
  python rebuild.py            # build + push + registry cleanup + restart + prune
  python rebuild.py --no-cache # force full rebuild without Docker layer cache
  python rebuild.py --skip-push  # local build + restart only (offline debugging)

Replaces the retired GitHub Actions pipeline (.github/workflows/docker-publish.yml):
  1. read .env (registry endpoint, Vite build args) — values are masked in output
  2. registry health check (GET /v2/)
  3. docker build with build-args + BuildKit SSL secrets (base64 of SSL/ files,
     matching the Dockerfile's `base64 -d` secret handling)
  4. tag <registry>/adv-tavern:<git-sha> + :latest, push both
  5. registry keep-only-latest: delete manifests other than <git-sha>/latest
  6. docker compose pull + up -d (restart with the new image)
  7. remove this project's obsolete local tags + dangling images
"""

import argparse
import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
IMAGE_NAME = "adv-tavern"
PROJECT_LABEL = "project=adv-tavern"

# Windows 控制台默认 GBK，docker/vite 输出含 Unicode 字符（✓ 等）会炸 print
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")
SSL_SECRETS = {
    # secret id -> source file under SSL/ (Dockerfile expects base64 content)
    "ssl_cert": "h.hony-wen.com_bundle.crt",
    "ssl_key": "h.hony-wen.com.key",
    "ssl_cert_nyaa": "h.nyaa.host_bundle.crt",
    "ssl_key_nyaa": "h.nyaa.host.key",
}


def parse_env(path: Path) -> dict:
    env = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = raw.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def mask(text: str, secrets: list[str]) -> str:
    for s in secrets:
        if s:
            text = text.replace(s, "<PRIVATE_REGISTRY>")
    return text


def run(cmd: list[str], secrets: list[str], env: dict | None = None) -> None:
    """Run a command, stream masked output, raise on failure."""
    print(f"\033[33m[run]\033[0m {mask(' '.join(cmd), secrets)}", flush=True)
    proc = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding="utf-8", errors="replace", env=env,
    )
    for line in proc.stdout:
        print(mask(line.rstrip("\n"), secrets), flush=True)
    if proc.wait() != 0:
        raise subprocess.CalledProcessError(proc.returncode, cmd)


def run_quiet(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def http_json(url: str, method: str = "GET", headers: dict | None = None):
    req = urllib.request.Request(url, method=method, headers=headers or {})
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode("utf-8", errors="replace")
        return resp.status, dict(resp.headers), (json.loads(body) if body else None)


def registry_cleanup(registry_url: str, keep: set, secrets: list[str]) -> None:
    """Keep-only-latest: delete all manifests except the tags in `keep`."""
    try:
        _, _, data = http_json(f"{registry_url}/v2/{IMAGE_NAME}/tags/list")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[registry] repository not found yet, nothing to clean", flush=True)
            return
        raise
    tags = (data or {}).get("tags") or []
    obsolete = [t for t in tags if t not in keep]
    print(f"[registry] tags: keep {sorted(keep)}; obsolete {obsolete or '(none)'}", flush=True)
    for tag in obsolete:
        req = urllib.request.Request(
            f"{registry_url}/v2/{IMAGE_NAME}/manifests/{tag}", method="HEAD",
            headers={"Accept": "application/vnd.docker.distribution.manifest.v2+json"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            digest = resp.headers.get("Docker-Content-Digest")
        if not digest:
            print(f"[registry] WARN: no digest for tag {tag}, skipped", flush=True)
            continue
        del_req = urllib.request.Request(
            f"{registry_url}/v2/{IMAGE_NAME}/manifests/{digest}", method="DELETE")
        try:
            urllib.request.urlopen(del_req, timeout=15)
            print(f"[registry] deleted obsolete tag {tag}", flush=True)
        except urllib.error.HTTPError as e:
            if e.code != 202:
                print(f"[registry] WARN: delete {tag} failed: {e.code}", flush=True)


def local_cleanup(registry_host: str, keep_tags: set, secrets: list[str]) -> None:
    """Remove obsolete local tags of this image + this project's dangling images."""
    result = run_quiet(["docker", "images", f"{registry_host}/{IMAGE_NAME}",
                        "--format", "{{.Tag}}"])
    for tag in {t.strip() for t in result.stdout.splitlines() if t.strip()} - keep_tags:
        run_quiet(["docker", "rmi", f"{registry_host}/{IMAGE_NAME}:{tag}"])
        print(f"[clean] removed local tag {tag}", flush=True)
    result = run_quiet(["docker", "images", "-q", "-f", "dangling=true",
                        "-f", f"label={PROJECT_LABEL}"])
    dangling = [i.strip() for i in result.stdout.splitlines() if i.strip()]
    for img in dangling:
        run_quiet(["docker", "rmi", "-f", img])
    print(f"[clean] dangling images removed: {len(dangling)}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="AVG client rebuild (local build -> NyaaDockerHUB)")
    parser.add_argument("--no-cache", action="store_true", help="build without Docker layer cache")
    parser.add_argument("--skip-push", action="store_true", help="skip registry push/cleanup (local only)")
    args = parser.parse_args()

    print("\033[36m=== AVG-AdventurerTavern client rebuild ===\033[0m", flush=True)
    env = parse_env(ENV_PATH)
    registry_url = env.get("PRIVATE_DOCKER_REGISTRY_URL", "").rstrip("/")
    registry_host = env.get("PRIVATE_DOCKER_REGISTRY_HOST", "")
    if not registry_url or not registry_host:
        sys.exit("ERROR: PRIVATE_DOCKER_REGISTRY_URL / _HOST missing in .env")
    secrets = [registry_url, registry_host]

    # ---------- registry health ----------
    if not args.skip_push:
        status, _, _ = http_json(f"{registry_url}/v2/")
        print(f"[registry] /v2/ -> {status}", flush=True)

    # ---------- tag ----------
    sha = run_quiet(["git", "-C", str(ROOT), "rev-parse", "--short=7", "HEAD"]).stdout.strip()
    if not sha:
        sys.exit("ERROR: cannot resolve git commit hash")
    image = f"{registry_host}/{IMAGE_NAME}"
    print(f"[tag] {IMAGE_NAME}:{sha} + :latest", flush=True)

    # ---------- build ----------
    build_env = {**os.environ, "DOCKER_BUILDKIT": "1"}
    for secret_id, filename in SSL_SECRETS.items():
        pem = (ROOT / "SSL" / filename).read_bytes()
        build_env[f"SECRET_{secret_id.upper()}"] = base64.b64encode(pem).decode("ascii")

    build_cmd = [
        "docker", "build", "-f", str(ROOT / "Dockerfile"),
        "-t", f"{image}:{sha}", "-t", f"{image}:latest",
        "--label", PROJECT_LABEL,
        "--build-arg", f"VITE_QWEATHER_HOST={env.get('VITE_QWEATHER_HOST', '')}",
        "--build-arg", f"VITE_QWEATHER_KEY={env.get('VITE_QWEATHER_KEY', '')}",
        "--build-arg", f"FILE_SERVER_API_KEY={env.get('FILE_SERVER_API_KEY', '')}",
        "--build-arg", f"DEBUG_PASSWD={env.get('DEBUG_PASSWD', '')}",
        "--build-arg", f"GIT_COMMIT_HASH={sha}",
    ]
    for secret_id in SSL_SECRETS:
        build_cmd += ["--secret", f"id={secret_id},env=SECRET_{secret_id.upper()}"]
    build_cmd.append(str(ROOT))
    if args.no_cache:
        build_cmd.insert(2, "--no-cache")

    # mask build-arg secret values in printed output as well
    print_secrets = secrets + [v for v in (
        env.get("VITE_QWEATHER_KEY"), env.get("FILE_SERVER_API_KEY"),
        env.get("DEBUG_PASSWD")) if v]
    run(build_cmd, print_secrets, env=build_env)

    # ---------- push + registry cleanup ----------
    if not args.skip_push:
        for tag in (sha, "latest"):
            # push 偶发 "context deadline exceeded"（HTTPS 探测超时），重试即可
            for attempt in range(1, 4):
                try:
                    run(["docker", "push", f"{image}:{tag}"], secrets)
                    break
                except subprocess.CalledProcessError:
                    if attempt == 3:
                        raise
                    print(f"[push] retry {attempt}/2 for :{tag} ...", flush=True)
        registry_cleanup(registry_url, {sha, "latest"}, secrets)

    # ---------- restart ----------
    compose = ["docker", "compose", "-f", str(ROOT / "docker-compose.yml")]
    run(compose + ["pull"], secrets)
    run(compose + ["up", "-d"], secrets)

    # ---------- local cleanup ----------
    local_cleanup(registry_host, {sha, "latest"}, secrets)

    # ---------- status ----------
    print("\n\033[32m=== Container status ===\033[0m", flush=True)
    result = run_quiet(["docker", "ps", "--filter", "name=adventurertavern",
                        "--format", "table {{.Names}}\t{{.Status}}\t{{.Ports}}"])
    print(result.stdout, flush=True)
    print("Note: database-server / file-server are managed independently "
          "(database-server/rebuild.py, file-server/rebuild.py).")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        # 不打印原始 traceback，避免异常信息泄漏未掩码的 registry 端点
        env = parse_env(ENV_PATH) if ENV_PATH.exists() else {}
        masked = mask(" ".join(map(str, e.cmd)), [
            env.get("PRIVATE_DOCKER_REGISTRY_URL", ""),
            env.get("PRIVATE_DOCKER_REGISTRY_HOST", ""),
        ])
        sys.exit(f"ERROR: command failed (exit {e.returncode}): {masked}")
