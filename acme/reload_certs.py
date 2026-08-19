#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
macmini 宿主侧 acme.sh reload hook（合并双刷新）：
续期后，把权威源 /etc/letsencrypt/h.hony-wen.com/ 的 LE SAN 证书同步到酒馆
certs/，并热加载 宿主 dsh nginx + 酒馆容器 nginx。

权威源：/etc/letsencrypt/h.hony-wen.com/{fullchain.pem,privkey.pem}
（此源由 acme.sh 的 dsh install-cert 更新，reloadcmd 指向本脚本）

职责（任一前置校验失败即中止，不中断现有服务）：
  1) 宿主 nginx -t       -> 校验宿主 dsh 配置
  2) 同步到酒馆 certs/     -> fullchain 644 / privkey 600 root
  3) reload 宿主 dsh nginx
  4) 酒馆容器 nginx -t 通过后 nginx -s reload（热加载新证书，不重启容器）

日志：/root/DockerContainer/AVG-AdventurerTavern/acme/reload.log
"""
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# ---- 常量 ----
SRC_DIR = Path("/etc/letsencrypt/h.hony-wen.com")
FULLCHAIN_SRC = SRC_DIR / "fullchain.pem"
PRIVKEY_SRC = SRC_DIR / "privkey.pem"

BASE = Path("/root/DockerContainer/AVG-AdventurerTavern")
CERT_DIR = BASE / "certs"
FULLCHAIN_DST = CERT_DIR / "fullchain.pem"
PRIVKEY_DST = CERT_DIR / "privkey.pem"
LOG_FILE = BASE / "acme" / "reload.log"

CONTAINER = "adventurertavern"


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


def main() -> int:
    log("==== reload_certs.py start ====")

    # 0) 校验权威源存在
    if not FULLCHAIN_SRC.exists() or not PRIVKEY_SRC.exists():
        log("ERROR: 权威源证书缺失，中止（保持现状）")
        return 1

    # 1) 宿主 nginx -t（失败则中止，不中断服务）
    run(["nginx", "-t"])

    # 2) 同步到酒馆 certs/
    CERT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(FULLCHAIN_SRC, FULLCHAIN_DST)
    os.chmod(FULLCHAIN_DST, 0o644)
    os.chown(FULLCHAIN_DST, 0, 0)
    shutil.copy2(PRIVKEY_SRC, PRIVKEY_DST)
    os.chmod(PRIVKEY_DST, 0o600)
    os.chown(PRIVKEY_DST, 0, 0)
    log(f"已同步证书至 {CERT_DIR}")

    # 3) reload 宿主 dsh nginx
    run(["nginx", "-s", "reload"])

    # 4) 酒馆容器 nginx -t 通过后 reload（容器不存在则仅警告）
    probe = run(["docker", "exec", CONTAINER, "nginx", "-t"], check=False)
    if probe.returncode == 0:
        run(["docker", "exec", CONTAINER, "nginx", "-s", "reload"])
        log("酒馆容器 nginx reload 成功")
    else:
        log("WARN: 酒馆容器不存在或 nginx -t 失败，跳过容器 reload"
            "（宿主已刷新；容器将在下次启动挂载新证书）")

    log("==== reload_certs.py done ====")
    return 0


if __name__ == "__main__":
    try:
        code = main()
    except Exception as e:  # noqa: BLE001
        log(f"ERROR: {e}")
        code = 1
    sys.exit(code)
