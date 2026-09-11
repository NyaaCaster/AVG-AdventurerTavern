#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
macmini 宿主侧 acme.sh reload hook（合并多消费方刷新）：
续期后，把权威源 /etc/letsencrypt/h.hony-wen.com/ 的 LE SAN 证书同步到
【AVG-AdventurerTavern】+【MyToken】的 certs/，并热加载 宿主 dsh nginx +
酒馆容器 + 文件服务器容器 + MyToken 容器 nginx。

权威源：/etc/letsencrypt/h.hony-wen.com/{fullchain.pem,privkey.pem}
（此源由 acme.sh 的 dsh install-cert 更新，reloadcmd 指向本脚本 —— 单 install-cert 合并 hook）

职责（任一前置校验失败即中止，不中断现有服务）：
  1) 宿主 nginx -t
  2) 同步到 AVG certs/（fullchain 644 / privkey 600 root）
     —— 该目录同时挂载给酒馆容器与 av-file-server 容器（/etc/nginx/ssl）
  2b) 同步到 MyToken certs/
  3) reload 宿主 dsh nginx
  4) AVG 容器 nginx -t 通过后 reload
  4b) AVG 文件服务器容器（adv-file-server）nginx -t 通过后 reload
  4c) MyToken 容器 nginx -t 通过后 reload
  4d) Caddy 独立 hook（同步 certs/ + caddy reload）

本文件为 macmini 生产脚本的 SSOT 副本：修改后需同步部署到
/root/DockerContainer/AVG-AdventurerTavern/acme/reload_certs.py

日志：/root/DockerContainer/AVG-AdventurerTavern/acme/reload.log
"""
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# ---- 常量：权威源 ----
SRC_DIR = Path("/etc/letsencrypt/h.hony-wen.com")
FULLCHAIN_SRC = SRC_DIR / "fullchain.pem"
PRIVKEY_SRC = SRC_DIR / "privkey.pem"

# ---- 常量：AVG-AdventurerTavern ----
BASE = Path("/root/DockerContainer/AVG-AdventurerTavern")
CERT_DIR = BASE / "certs"
FULLCHAIN_DST = CERT_DIR / "fullchain.pem"
PRIVKEY_DST = CERT_DIR / "privkey.pem"
LOG_FILE = BASE / "acme" / "reload.log"
CONTAINER = "adventurertavern"

# ---- 常量：AVG 文件服务器（美术/音频资源，与酒馆共用同一份 certs/）----
FILE_SERVER_CONTAINER = "adv-file-server"

# ---- 常量：MyToken ----
MYTOKEN_BASE = Path("/root/DockerContainer/MyToken")
MYTOKEN_CERT_DIR = MYTOKEN_BASE / "certs"
MYTOKEN_FULLCHAIN_DST = MYTOKEN_CERT_DIR / "fullchain.pem"
MYTOKEN_PRIVKEY_DST = MYTOKEN_CERT_DIR / "privkey.pem"
MYTOKEN_CONTAINER = "mytoken-web"


def log(msg: str) -> None:
    line = f"[{datetime.now().isoformat()}] {msg}"
    print(line, flush=True)
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception as e:  # 日志失败不阻断主流程
        print(f"[warn] 写日志失败: {e}", flush=True)


def run(cmd, check=True):
    """执行命令，PATH 追加 /snap/bin 以便 docker/nginx。"""
    env = dict(os.environ)
    env["PATH"] = env.get("PATH", "") + ":/snap/bin"
    proc = subprocess.run(
        cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
    )
    out = proc.stdout.strip()
    if out:
        log(f"$ {' '.join(cmd)}\n{out}")
    if check and proc.returncode != 0:
        raise RuntimeError(
            f"命令失败({proc.returncode}): {' '.join(cmd)}\n{out}"
        )
    log(f"$ {' '.join(cmd)} -> exit {proc.returncode}")
    return proc


def sync_to(cert_dir: "Path", label: str) -> None:
    """把权威源证书同步到某个消费方 certs/。"""
    cert_dir.mkdir(parents=True, exist_ok=True)
    f_dst = cert_dir / "fullchain.pem"
    k_dst = cert_dir / "privkey.pem"
    shutil.copy2(FULLCHAIN_SRC, f_dst)
    os.chmod(f_dst, 0o644)
    os.chown(f_dst, 0, 0)
    shutil.copy2(PRIVKEY_SRC, k_dst)
    os.chmod(k_dst, 0o600)
    os.chown(k_dst, 0, 0)
    log(f"已同步证书至 {label}: {cert_dir}")


def reload_container(container: str, label: str) -> None:
    """容器 nginx -t 通过后 reload（容器不存在仅警告，不失败）。"""
    probe = run(["docker", "exec", container, "nginx", "-t"], check=False)
    if probe.returncode == 0:
        run(["docker", "exec", container, "nginx", "-s", "reload"])
        log(f"{label} 容器 nginx reload 成功")
    else:
        log(f"WARN: {label} 容器不存在或 nginx -t 失败，跳过容器 reload"
            "（宿主已刷新；容器将在下次启动挂载新证书）")


def main() -> int:
    log("==== reload_certs.py start ====")

    # 0) 校验权威源存在
    if not FULLCHAIN_SRC.exists() or not PRIVKEY_SRC.exists():
        log("ERROR: 权威源证书缺失，中止（保持现状）")
        return 1

    # 1) 宿主 nginx -t（失败则中止，不中断服务）
    run(["nginx", "-t"])

    # 2) 同步 AVG certs/（酒馆容器 + adv-file-server 容器共用该目录）
    sync_to(CERT_DIR, "AVG")

    # 2b) 同步 MyToken certs/
    sync_to(MYTOKEN_CERT_DIR, "MyToken")

    # 3) reload 宿主 dsh nginx
    run(["nginx", "-s", "reload"])

    # 4) AVG 容器 reload
    reload_container(CONTAINER, "AVG")

    # 4b) AVG 文件服务器容器 reload（证书来自同一个 certs/，只需热加载）
    reload_container(FILE_SERVER_CONTAINER, "AVG file-server")

    # 4c) MyToken 容器 reload
    reload_container(MYTOKEN_CONTAINER, "MyToken")

    # 4d) Caddy（Ollama API 鉴权反代）独立 hook：同步 certs/ + caddy reload
    run(["python3", "/root/DockerContainer/Caddy/acme/reload_certs.py"], check=False)

    log("==== reload_certs.py done ====")
    return 0


if __name__ == "__main__":
    try:
        code = main()
    except Exception as e:  # noqa: BLE001
        log(f"ERROR: {e}")
        code = 1
    sys.exit(code)
