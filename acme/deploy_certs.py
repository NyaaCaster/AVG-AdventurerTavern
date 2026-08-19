#!/usr/bin/env python3
"""AVG-AdventurerTavern 证书部署脚本（macmini 宿主 acme.sh --reloadcmd 调用）。

acme.sh 续期重签后，把新 fullchain.pem / privkey.pem 写好并热加载容器 nginx：
  1. 打印将要生效的证书到期时间（供日志排障）
  2. 校验宿主 certs/fullchain.pem + privkey.pem 存在且非空
  3. 权限固化：fullchain 644 / privkey 600 / root:root（容器 nginx master 以 root 运行可读）
  4. docker exec adventurertavern nginx -t —— 失败则中止，不 reload，保住旧证书服务
  5. docker exec adventurertavern nginx -s reload —— 热加载新证书（无停机）
  6. 成功/失败日志写到 acme/renew.log
  7. 若容器尚未运行（如首次签发时容器未起）则仅警告并跳过 reload，不视为错误

用法（由 acme.sh reloadcmd 调用）：
  python3 /root/DockerContainer/AVG-AdventurerTavern/acme/deploy_certs.py
"""

import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# macmini 的 docker 是 snap 安装，CLI 在 /snap/bin（不在默认 PATH）
os.environ["PATH"] = os.environ.get("PATH", "") + ":/snap/bin"

HERE = Path(__file__).resolve().parent      # .../AVG-AdventurerTavern/acme/
CERT_DIR = HERE.parent / "certs"            # .../AVG-AdventurerTavern/certs/
FULLCHAIN = CERT_DIR / "fullchain.pem"
PRIVKEY = CERT_DIR / "privkey.pem"
LOG = HERE / "renew.log"
CONTAINER = "adventurertavern"


def log(msg: str) -> None:
    line = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError as e:
        print(f"[WARN] 无法写日志 {LOG}: {e}", flush=True)


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    print("  -> " + " ".join(cmd), flush=True)
    return subprocess.run(cmd)


def run_quiet(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def cert_enddate(path: Path) -> str:
    """用 openssl 读取证书到期时间；失败时返回空串（不致命）。"""
    try:
        cp = subprocess.run(
            ["openssl", "x509", "-in", str(path), "-noout", "-enddate"],
            capture_output=True, text=True)
        return cp.stdout.strip() if cp.returncode == 0 else ""
    except OSError:
        return ""


def main() -> int:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    log("=== AVG-AdventurerTavern deploy_certs ===")

    # 1. 打印将要生效的证书到期时间
    enddate = cert_enddate(FULLCHAIN)
    log(f"fullchain.pem {('notAfter: ' + enddate) if enddate else '到期时间不可读（openssl 或文件暂不可用）'}")

    # 2. 校验存在且非空
    missing = [str(p) for p in (FULLCHAIN, PRIVKEY)
               if not p.exists() or p.stat().st_size == 0]
    if missing:
        log(f"[ERROR] 证书缺失或为空: {missing}")
        return 1

    # 3. 权限固化
    try:
        os.chmod(FULLCHAIN, 0o644)
        os.chmod(PRIVKEY, 0o600)
        run(["chown", "root:root", str(FULLCHAIN), str(PRIVKEY)])
    except OSError as e:
        log(f"[ERROR] 设置权限失败: {e}")
        return 1
    log(f"permissions: fullchain 644 / privkey 600 / root:root")

    # 容器当前是否在运行
    running = run_quiet(["docker", "ps", "--filter", f"name={CONTAINER}",
                         "--format", "{{.Names}}"]).stdout.strip()
    if CONTAINER not in running:
        log(f"[WARN] 容器 {CONTAINER} 未运行，跳过 nginx 校验与 reload（证书已就位，容器下次启动时自动加载）")
        return 0

    # 4. nginx -t（失败则中止，不 reload，续用旧证书）
    if run(["docker", "exec", CONTAINER, "nginx", "-t"]).returncode != 0:
        log("[ERROR] nginx -t 失败，中止，未 reload（继续使用旧证书，等待下轮 cron 重试）")
        return 1

    # 5. nginx -s reload
    if run(["docker", "exec", CONTAINER, "nginx", "-s", "reload"]).returncode != 0:
        log("[ERROR] nginx reload 失败")
        return 1

    # 6. 成功日志
    log("reload OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
