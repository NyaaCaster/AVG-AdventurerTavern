# AVG-AdventurerTavern HTTPS 自建 Let's Encrypt (acme.sh) 自动续期改造计划

> 面向实现者的一份可执行改造方案（SSOT），基于 explorer 的「现状探索报告」（t1）与全量源码核对。
> 目标：把当前「nginx 手动放入 90 天有效的 TrustAsia 证书 + 构建期烤进镜像」改为「项目内自建 Let's Encrypt 自动续期链路」，续期不再需要 rebuild+push+restart。

---

## 0. 现状结论（t1 摘要 + 源码核对）

| 维度 | 现状 |
|---|---|
| 证书 | 两域名各自独立的 **TrustAsia DV** 证书，各 ~90 天（h.hony-wen.com 到期 2026-08-25，h.nyaa.host 到期 2026-08-31），**非 Let's Encrypt、非 SAN 单证书** |
| 存放/入口 | `SSL/` 目录（gitignore+dockerignore 排除）；**构建期 BuildKit secret** 把 base64 烤进镜像 → `/etc/nginx/ssl/*`，**非运行时挂载** |
| 续期 | **纯手工**：换 TrustAsia 新证书 → 放 SSL/ → `rebuild.py` 全量重建镜像 → push → restart。无 acme.sh/certbot/cron/自动 reload |
| nginx | 3 个 server 块：`80` HTTP；`443` (h.hony-wen.com)；`443` (h.nyaa.host, SNI 独立证书)。纯静态 SPA，无 proxy_pass |
| 端口 | 容器外 `3098:80` + `3096:443`（docker-compose*.yml），无 volume 挂载 |
| 证书进 nginx 链路 | `rebuild.py`(`SSL_SECRETS`)→ `docker build --secret` → `Dockerfile` `base64 -d > /etc/nginx/ssl/...` |
| 进程管理 | 容器 `CMD nginx -g 'daemon off;'`；`supervisord.conf` 为**死配置**（Dockerfile 未用） |

**关键矛盾点**：现有两张证书是 **TrustAsia DV、两域名各自独立**，与工作空间已成熟的 macmini **acme.sh + Let's Encrypt 单张 SAN 证书** 模式不一致。改造需决策：**切换 CA（TrustAsia → Let's Encrypt）并合并为单张 SAN 证书**（推荐，见 §1.2）。

---

## 1. 目标架构

### 1.1 决策：宿主机 acme.sh vs acme sidecar 容器

| 维度 | **方案 B：macmini 宿主机 acme.sh + bind mount**（✅ 推荐） | 方案 A：neilpang/acme.sh sidecar 容器 |
|---|---|---|
| 复用 | 直接复用 macmini 已有 `/root/.acme.sh` v3.1.5 + DNSPod dns_dp 凭据 + 每日 cron，**零新增运行时** | 需在 compose 增一个容器 + 自带 cron + 自管 DNSPod 凭据 |
| 凭据 | DNSPod `DP_Id/DP_Key` 留在宿主 `/root/.acme.sh/account.conf`，**不进仓库** | 凭据须注入 sidecar（env/file），需额外管好 |
| reload | reloadcmd 里 `docker exec adventurertavern nginx -s reload`，简单直白 | 容器间 reload 需共享 volume/pid 或 docker-socket，繁琐且引入特权 |
| 移动/可移植 | 依赖 macmini 宿主 acme 基础设施 | 自包含，跨机器可移植 |
| 单容器 v.s. 日志 | 无新容器、日志走宿主 cron | 多一个容器、多一层日志 |
| 契合既有模式 | 与 macmini https.conf（各服务共用一张 SAN 证书 + 宿主管续期）完全一致 | 偏离已有模式 |

**结论：采用方案 B（macmini 宿主机 acme.sh 管理续期 + 项目证书目录 bind mount 进容器 + reloadcmd 触发容器 nginx reload）。** 理由：macmini 已有完整可信的 acme.sh/DNSPod/cron 链路，复用零成本；容器只在运行时以 `:ro` 读证书文件，续期后通过 nginx reload 热加载，**镜像不再包含私钥**。

> 方案 A 作为备选在 §8（备选方案）给出部署骨架；若未来要弱化对 macmini 宿主工具的依赖（如迁移到多主机/无宿主管理），再切换。

### 1.2 证书结构决策：单张 SAN 证书（合并两域名）

macmini 现有 acme.sh 恰好签的就是覆盖 `h.hony-wen.com` + `h.nyaa.host` 的 **单张 SAN 证书**（ec-256）。本改造直接**复用同一张 SAN 证书**：

- 域名解析都在 macmini 公网 IP（123.119.161.46）。酒馆自己的容器 nginx 在 `:3096` 对外，macmini 系统 nginx（https.conf，`:43080/43081/43082` 反代 dsh）也服务同样的域名——**两张 server 各自消费同一张 SAN 证书没有任何冲突**。
- 因此本容器两个 `443` server 块统一指向**同一对** `fullchain.pem` / `privkey.pem`，SNI 仍按 `server_name` 路由，证书对两域名都有效。

### 1.3 自动续期链路拓扑

```
macmini 宿主 (cron 每日 1/7/13/19)
   └─ acme.sh --renew（到期前 ARI 窗口自动重签）
        ├─ 续期同一张 SAN 证书 (h.hony-wen.com + h.nyaa.host, ec-256, DNSPod dns_dp)
        └─ --install-cert（酒馆专用部署，宿主上记录在 h.hony-wen.com_ecc/ 的 conf 里）
             ├─ --fullchain-file /root/DockerContainer/AVG-AdventurerTavern/certs/fullchain.pem
             ├─ --key-file       /root/DockerContainer/AVG-AdventurerTavern/certs/privkey.pem (0600)
             └─ --reloadcmd 'python3 .../acme/deploy_certs.py'
                    ├─ 校验/日志
                    ├─ docker exec adventurertavern nginx -t        # 先测配置
                    └─ docker exec adventurertavern nginx -s reload # 热加载新证书
                                    │
            容器 (adventurertavern)
   docker-compose  volume: ./certs → /etc/nginx/ssl:ro
   nginx.conf  443 server 块 ssl_certificate /etc/nginx/ssl/fullchain.pem
   ssl_certificate_key /etc/nginx/ssl/privkey.pem
```

**证书如何进 nginx**：不再是 build 期 COPY，而是 **bind mount**（compose 卷 `./certs:/etc/nginx/ssl:ro`）。续期后 acme.sh 把新 `fullchain.pem/privkey.pem` 写进宿主 `certs/` 目录（即容器挂载源），`docker exec nginx -s reload` 让 nginx 从磁盘重读 → **零重建、零重启容器、无停机**。

---

## 2. 涉及文件改动清单

所有改动均在本仓库（`H:\GitHub\AVG-AdventurerTavern\`），最终由 macmini 侧部署目录 `/root/DockerContainer/AVG-AdventurerTavern/` 同步。

### 2.1 `docker-compose.yml` + `docker-compose.publish.yml`
为 `client` 服务新增证书卷（两文件改动一致）：
```yaml
    volumes:
      - "${CERT_DIR:-./certs}:/etc/nginx/ssl:ro"   # 宿主证书目录只读挂载进容器
```
- 保留 `3098:80`、`3096:443`、healthcheck、logging、network 不变。
- `CERT_DIR` 可用 `.env` 覆盖（macmini 默认 `./certs` 即 `/root/DockerContainer/AVG-AdventurerTavern/certs`）。
- `:ro` 确保容器内进程无法改动证书（即使被入侵也只读）。
- **dev 侧（docker-compose.yml）说明**：本地开发走 `npm run dev`（非 docker），故本地即便无 LE 证书也不阻塞；若本地要用 docker 起前端，需先在 `./certs` 放占位/测试证书（P2 验证点）。

### 2.2 `nginx.conf`
- **两处** `443 ssl` server 块统一指向 SAN 单证书：
  - 块1（h.hony-wen.com）：
    ```nginx
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ```
  - 块2（h.nyaa.host, SNI）：同样指向 `fullchain.pem`/`privkey.pem`（替换原 `nyaa.host.crt/key`）。
- `80` HTTP 块、TLS 协议/套件、HSTS、SPA try_files、缓存/安全头/`/health` **全部不动**。
- 删除顶部注释中关于「构建期写入」的过时说明。

### 2.3 `Dockerfile`
- **删除**两条 BuildKit secret 证书 RUN（原第 70–96 行：`ssl_cert/ssl_key/ssl_cert_nyaa/ssl_key_nyaa` 的 `base64 -d` 逻辑）。
- `RUN mkdir -p /etc/nginx/ssl && chown -R nginx:nginx /etc/nginx/ssl`（第 62–63 行）**保留**（空目录会被 bind mount 覆盖，无害；保留便于无挂载时兜底）。
- 保留 builder 阶段、nginx 配置 COPY、`EXPOSE 80 443`、`CMD nginx -g 'daemon off;'`、镜像内 healthcheck。
- **镜像将不再包含任何私钥/证书内容**。

### 2.4 `supervisord.conf`
- 当前为死配置（容器直接跑 nginx，未用 supervisord）。**本改造不依赖它**，维持原样即可；也不建议本次引入 container 内 cron/supervisord 来管续期（续期在宿主做，更简单）。
- 若后续希望"容器自管续期"，需重写（见 §8 备选）。本次标记为「不涉及 / 可保留」。

### 2.5 `rebuild.py`（Windows 构建侧）
- **删除** `SSL_SECRETS`（第 38–44 行）。
- **删除**构建循环里 base64 编码 SSL 文件到环境变量（第 164–166 行）及 `--secret id=...` 参数（第 179–180 行）。
- 保留 frontend 的 `--build-arg`（VITE_QWEATHER_* / FILE_SERVER_API_KEY / AVG_DATABASE_API_URL / DEBUG_PASSWD / GIT_COMMIT_HASH）与 push/cleanup/restart 逻辑。
- **证书已不在构建期**，改由 macmini 侧管理；`rebuild.py` 仍只管「build+push+restart」。

### 2.6 `restart.py`（macmini 侧）
- `up -d` 前**显式校验**证书目录存在且含 `fullchain.pem`/`privkey.pem`（nginx 缺证书会起不来）：
  ```python
  cert_dir = Path("./certs")
  if not (cert_dir / "fullchain.pem").exists() or not (cert_dir / "privkey.pem").exists():
      sys.exit("[ERROR] certs/fullchain.pem + privkey.pem 缺失；请先完成首次签发（P1）")
  ```
- 其余 pull → down → up -d → prune 逻辑保留。

### 2.7 `.env`
- **删除** `SSL_NYAA_HOST_CRT` / `SSL_NYAA_HOST_KEY`（未使用的旧占位，注释里所谓「供复制到 GitHub Secret」已过时）。
- 新增可选 `CERT_DIR`（默认 `./certs`）。
- **DNSPod 凭据绝不进本仓库 `.env`**（留在 macmini `/root/.acme.sh/account.conf`，0600）。
- `.env` 本身已被 `.gitignore` 排除，提交前仍须肉眼复核 `git status`。

### 2.8 新建 `acme/` 目录（入库、随代码部署）
- **`acme/deploy_certs.py`**（Python，符合工作空间「自动化脚本优先 Python」规范；macmini 有 python3）：
  1. 打印将要生效的证书到期时间（`openssl x509 -enddate` 或纯 Python 解析）做日志；
  2. 校验宿主 `certs/fullchain.pem` + `certs/privkey.pem` 存在且非空；
  3. 权限固化：`chmod 644 fullchain.pem`、`chmod 600 privkey.pem`、`chown root:root`（容器 nginx master 以 root 运行，可读取）；
  4. `docker exec adventurertavern nginx -t`；失败则**中止**（不 reload，保住旧证书服务）；
  5. `docker exec adventurertavern nginx -s reload`；
  6. 输出成功/失败日志到 `/root/DockerContainer/AVG-AdventurerTavern/acme/renew.log`。
- 说明：`--reloadcmd` 也可直接内联 `docker exec ... nginx -t && docker exec ... nginx -s reload`；封装成脚本是为了带校验、权限、日志，便于排障。脚本内 `docker` 需 `export PATH=$PATH:/snap/bin`。
- **生产修订（P5 定案，取代上述 deploy_certs.py 方案）**：实际落地的续期 hook 为 `acme/reload_certs.py`（宿主侧合并双刷新：宿主 `nginx -t` → 从权威源 `/etc/letsencrypt/h.hony-wen.com/` 同步 fullchain/privkey 到酒馆 `certs/` → 宿主 dsh `nginx -s reload` → 容器 nginx `-t` 通过后 `-s reload` → 写 `reload.log`）；macmini 的 dsh 与酒馆**共用同一条 install-cert**。原 `deploy_certs.py`（写 renew.log）未接入生产，已从仓库移除以免误导。详见 `阶段交接-001.md` 与仓库 `CLAUDE.md`。

### 2.9 部署同步（文档/流程，非代码）
- macmini 部署目录 `/root/DockerContainer/AVG-AdventurerTavern/` 需在 P2 上线时与仓库同步：docker-compose*.yml、nginx.conf（进镜像）、restart.py、acme/reload_certs.py；并 `mkdir -p certs acme`。
- 该目录仍经 `restart.py`/`rebuild.py` 标准流程更新镜像。

---

## 3. 证书存放与滚动更新机制

- **存放**：macmini 宿主 `/root/DockerContainer/AVG-AdventurerTavern/certs/`（`fullchain.pem` + `privkey.pem`）。容器内通过 compose `:ro` 卷挂到 `/etc/nginx/ssl/`。
- **更新**：acme.sh 每日 cron 在续期窗口重签后执行 `--install-cert` → 写宿主 `certs/` → reloadcmd 跑 `deploy_certs.py` → 容器 nginx reload。
- **热加载原理**：nginx reload 会重新打开 ssl 证书文件并读取（无需重启进程、不中断连接、零停机）。因为证书在宿主（容器挂载源）更新，容器 reload 即读到新文件。
- **不重建镜像**：nginx.conf 引用的路径固定为 `/etc/nginx/ssl/fullchain.pem`，内容随挂载变化，镜像层不涉及。

---

## 4. 续期触发与定时

- **复用 macmini 既有 acme.sh 每日 cron**（每天 1/7/13/19 点），`acme.sh --cron` 会在 ARI 续期窗口（到期前约 30 天起）自动重签，无需新增 cron/systemd timer。
- 现有 cron 已托管这同一张 SAN 证书。本次为同一域名**追加一条 install-cert**（酒馆部署），acme.sh 在 `h.hony-wen.com_ecc/` conf 中记录所有 install-cert，续期时逐个执行其 reloadcmd。
- 校验 cron 存在：`ssh macmini 'crontab -l | grep acme'`；确认安装路径 `/root/.acme.sh/acme.sh`。

> **注意**：macmini 既有 install-cert（供 dsh nginx 用，reloadcmd=`nginx -t && nginx -s reload`）保持不变；酒馆是**另外一条** install-cert + 独立 reloadcmd（docker exec 容器内 nginx）。两者互不干扰、共用同一证书文件源各自部署目标。

---

## 5. 首次签发与验证步骤

**签发前确保**：DNSPod 凭据已就位（`/root/.acme.sh/account.conf` 有 `DP_Id/DP_Key`）。

### 5.1 预演（staging）
```bash
ssh macmini 'export PATH=$PATH:/snap/bin && /root/.acme.sh/acme.sh --issue \
  --dns dns_dp -d h.hony-wen.com -d h.nyaa.host \
  --keylength ec-256 --server letsencrypt --staging --force'
```
验证：成功拿到 staging 证书（`/root/.acme.sh/h.hony-wen.com_ecc/` 下有 `h.hony-wen.com.cer` 等），DNS 验证通过。

### 5.2 正式签发（**必须**带 `--server letsencrypt --force`）
```bash
ssh macmini 'export PATH=$PATH:/snap/bin && /root/.acme.sh/acme.sh --issue \
  --dns dns_dp -d h.hony-wen.com -d h.nyaa.host \
  --keylength ec-256 --server letsencrypt --force'
```
> ⚠️ **为什么必须 `--force`**：acme.sh 会记住上次签发用的 server（staging 或 letsencrypt）与续期时间线；若不带 `--server letsencrypt --force`，正式签发可能被 staging 的续期时间跳过，导致"签发成功但实际是 staging 证书"。首次正式签发务必带这两参数。

### 5.3 安装到酒馆目录（追加 install-cert）
```bash
ssh macmini 'export PATH=$PATH:/snap/bin && /root/.acme.sh/acme.sh --install-cert \
  -d h.hony-wen.com --ecc \
  --fullchain-file /root/DockerContainer/AVG-AdventurerTavern/certs/fullchain.pem \
  --key-file       /root/DockerContainer/AVG-AdventurerTavern/certs/privkey.pem \
  --reloadcmd "python3 /root/DockerContainer/AVG-AdventurerTavern/acme/deploy_certs.py"'
```

### 5.4 验证清单
- 证书文件就位且权限正确：`ls -l certs/` → `fullchain.pem`(644) `privkey.pem`(600, root)。
- 到期/签发者：
  `ssh macmini 'openssl x509 -in /root/DockerContainer/AVG-AdventurerTavern/certs/fullchain.pem -noout -issuer -enddate -subject'`
  应为 `O = Let's Encrypt` / `CN = R3`（或等效 LE 链），在 90 天窗口内。
- 两域名都在 SAN：`openssl x509 -in certs/fullchain.pem -noout -text | grep -A1 "Subject Alternative Name"` 含 `h.hony-wen.com` 与 `h.nyaa.host`。
- 容器 HTTPS 生效（挂载 + reload 后）：
  `curl -s -o /dev/null -w "%{http_code}\n" https://127.0.0.1:3096/ -k -H 'Host: h.hony-wen.com'` → 200。
- 浏览器访问 `https://h.hony-wen.com:3096/` 无证书告警、锁形图标、签发者为 Let's Encrypt。

---

## 6. 安全性考量

| 项 | 措施 |
|---|---|
| 私钥权限 | 宿主 `certs/privkey.pem` **0600 root**；容器内经 `:ro` 卷只读挂载，且容器 master 以 root 运行可读。不在任何层 bake |
| 私钥入镜像 | **彻底消除**：删 Dockerfile secret、删 rebuild.py SQL_SECRETS，镜像无私钥 |
| DNSPod 凭据 | 仅存 macmini `/root/.acme.sh/account.conf`（0600），**不进仓库、不进 .env、不进容器** |
| `.env` 管理 | `SSL_*` 旧占位删除、`.env` 已在 .gitignore；提交前肉眼复核 `git status` |
| 旧 TrustAsia SSL/ | P5 清理：删除 `SSL/*.crt/*.key`，仅保留 `.gitkeep`（仓库结构） |
| 容器只读卷 | `:ro` 挂载，容器内进程无法改写证书文件 |
| renew 失败兜底 | reloadcmd 先 `nginx -t`，失败则跳过 reload，**续用旧证书直至下轮重试**；每日 cron 自动重试，无中断 |
| 容器 reload 影响面 | `nginx -s reload` 零停机（优雅加载新配置/证书），健康检查窗口内可达 |

---

## 7. 分阶段实施（P 划分，每阶段含验证点）

> 遵循项目 Vibo 规范：每 P 独立验证、独立提交；P 阶段在 plan 模式推进；每 P 收尾做 git 提交 + 交接文档 + memory。

### P1 — macmini 侧首次签发与部署脚本
内容：
- 确认 `/root/.acme.sh/account.conf` DNSPod 凭据、确认 cron。
- staging 预演 → 正式签发（带 `--server letsencrypt --force`）。
- 建 `acme/deploy_certs.py` 并拷到 macmini → 追加 install-cert + reloadcmd。
- `mkdir -p certs`；确认真实证书写入 `certs/`。
验证点：
- `openssl x509 -issuer/-enddate` 为 Let's Encrypt、90 天窗口；SAN 含两域名。
- 手动跑一次 `deploy_certs.py` 无报错（此时容器未挂载/未跑也不应致命——脚本需容忍容器不存在时仅警告并跳过 reload，或此时容器已起则完成 reload）。

### P2 — 容器切到 bind mount + 单 SAN 证书
内容：
- 改 `docker-compose*.yml`（加 `certs/*:/etc/nginx/ssl:ro`）、`nginx.conf`（两 443 块改指向 `fullchain.pem/privkey.pem`）。
- 重编镜像（去掉证书相关，见 P3 的 Dockerfile 改动可同批）→ push → macmini `docker compose pull + up -d`。
验证点：
- `docker compose config` 通过；容器起来后 `curl -k https://127.0.0.1:3096/` 返回 200 且证书为 LE。
- `docker exec adventurertavern ls -l /etc/nginx/ssl` 显示挂载的 `fullchain.pem`/`privkey.pem`。
- 浏览器两域名 `:3096` 无告警。

### P3 — 移除构建期证书（镜像不再含私钥）
内容：
- `Dockerfile` 删两条 secret RUN；`rebuild.py` 删 `SSL_SECRETS` 与 `--secret` 逻辑；`.env` 删 `SSL_NYAA_HOST_*`。
- `rebuild.py` 全量重建 push。验证点：
- `rebuild.py` 在 `SSL/` **空/无证书** 时仍能成功构建（不再依赖 SSL 文件）。
- 镜像扫描确认无私钥：`docker run --rm <img> sh -c 'ls /etc/nginx/ssl'` → 无 `*.key` 或仅空目录；`strings <img层> | grep -i "PRIVATE KEY"` 无命中。
- 容器仍正常服务 HTTPS（证书来自挂载）。

### P4 — 自动续期 + reload 链路 E2E
内容：
- 确认 cron 在跑；触发一次手动续期演练：
  `ssh macmini 'export PATH=$PATH:/snap/bin && /root/.acme.sh/acme.sh --renew -d h.hony-wen.com --ecc --force'`（或 `--cron` 强制）
  → 观察 `--install-cert` 执行 `deploy_certs.py` → 容器 nginx reload。
验证点：
- `renew.log` 显示「reload OK」；`openssl -enddate` 前后变化（新有效期）；**运行中的容器无需重启**即换新证书（`curl -kI https://127.0.0.1:3096/` 返回新 notAfter）。
- `docker exec adventurertavern nginx -t` 通过。

### P5 — 收尾清理与文档
内容：
- 清理旧 `SSL/*.crt|*.key`（仅留 `.gitkeep`）；删除过时 `.dockerignore` 注释/占位如需。
- 更新 `CLAUDE.md`（项目）记录新证书管理方式；写 `.docs/阶段交接-<n>.md`；更新 memory。
验证点：
- `git status` 无意外残留、无敏感文件入库；`git log` 每个 P 一个 conventional commit。
- 端到端：断网/停续期模拟不出现（可选）→ 至少确认每日 cron 正常、日志有本期记录。

---

## 8. 备选方案 A（acme.sh sidecar 容器）骨架

若不采用宿主管续期，可改用官方 `neilpang/acme.sh` 容器，同一张 SAN 证书、DNSPod 验证：
```yaml
  acme:
    image: neilpang/acme.sh
    container_name: adv-acme
    command: daemon
    environment:
      - DP_Id=${DP_Id}
      - DP_Key=${DP_Key}
      - DEPLOY_DOCKER_CONTAINER_LABEL=adventurertavern   # 或自动重启策略
    volumes:
      - ./certs:/acme.sh/${HONY_WEN_CERT_DIR}
      - /var/run/docker.sock:/var/run/docker.sock:ro   # reload 需 docker-socket（特权考量）
    restart: unless-stopped
```
reload 依赖分享 docker.sock 或文件监听；凭据 `DP_Id/DP_Key` 进 `.env`（需额外 gitignore/权限管理）。相较方案 B 更重、更特权，仅当要脱离 macmini 宿主 acme 时才选。**本计划默认方案 B。**

---

## 9. 风险与回滚

| 风险 | 影响 | 缓解 |
|---|---|---|
| **CA 切换**（TrustAsia→LE） | 客户端需信任 LE（默认即信任）；HSTS 已开，若新证书异常会报错 | 先 staging 预演；`curl -k` + 浏览器验证后再切；P1 独立完成签发验证 |
| **证书缺失 → nginx 起不来** | 容器启动失败（`ssl_certificate` 找不到文件） | `restart.py` 启动前校验 `certs/`；P1 先保证证书就位再切 compose |
| **staging 时间线污染** | 正式签发被 staging 续期跳过 | 首次正式签发必须 `--server letsencrypt --force`（§5.2） |
| **DNSPod API 故障** | 续期失败 | 每日 cron 自动重试；证书本身 90 天，窗口长；`deploy_certs.py` 失败不 reload、续用旧证书 |
| **reload 破配置** | down 服务 | reloadcmd 先 `nginx -t`，失败即中止不 reload |
| **容器内 reload 缺 docker 权限** | reload 失败 | deploy 脚本 `export PATH=$PATH:/snap/bin`；宿主对 `docker` 有权限 |
| **卷权限** | 容器读不到 key | 宿主 key 0600 root、容器 master root 可读；`chown root:root` |
| **本轮改造失败** | 服务不可用 | **回滚**＝git revert 对应 P 提交，重跑旧 `rebuild.py`（或其保留 `<sha>` 镜像 tag）恢复构建期证书；绑卷改动移除即回旧态。旧镜像 `:<旧sha>` 在 push 前已存，registry 留有 latest 前一版本 |

**回滚命令基线**：`git checkout <前一提交> -- docker-compose*.yml nginx.conf Dockerfile rebuild.py` → `python rebuild.py`（旧流程）→ `ssh macmini 'cd /root/DockerContainer/AVG-AdventurerTavern && python3 restart.py'`。

---

## 10. 待确认/边界

1. **是否接受 CA 从 TrustAsia 切换为 Let's Encrypt、双证书合并为单张 SAN 证书**（推荐，与 macmini 现有 SAN 一致）。若必须保留 TrustAsia，本方案需改为「仍用 TrustAsia + 宿主管续期 + bind mount」的混合形态（续期仍手工，仅改造挂载）。
2. **外部端口**：`3096` 公网可达性是否已由路由器/防火墙放行（现网已在用，默认放行）。
3. **与 macmini 现有 dsh https.conf 共用同一张 SAN 证书**是否可接受（互不冲突）。
4. macmini 部署目录与本地仓库的**同步方式**（scp 或 git clone + restart.py）需落实；`acme/` 与 `certs/` 目录由部署流程创建。

---

## 11. 补记（2026-09-12）：file-server 纳入证书链路（故障驱动整改）

**故障**：访问 `https://h.nyaa.host:3096/` 时页面正常但**美术/音频资源全部无法加载**。排查结论为 macmini 容器侧问题（非本机）。

**根因**：本计划 §1.3 / §2.9 只把「酒馆容器」当作证书消费方，遗漏了 **`file-server`（独立子模块 + 独立 compose + 独立部署目录）** —— 它同样通过 443 对外提供 `/files/**`（前端 `utils/imagePath.ts` 硬编码 `https://h.nyaa.host:5102/files/`）：

1. file-server 挂载的是宿主 `AVG-AdventurerTavern/ssl/`（**旧 TrustAsia 手工证书**，nginx.conf 硬编码文件名 `h.nyaa.host_bundle.crt`），该证书 **2026-08-31 过期**（h.hony-wen.com 版 08-25 过期）；
2. `acme/reload_certs.py` 无 file-server 分支 → 该目录自 2026-07-09 起无人更新；
3. 于是前端页面（3096，LE 新证书）正常、资源域（5102，过期证书）被浏览器 `SEC_E_CERT_EXPIRED` 拒绝 → 「页面能开、无美术」。

**整改（已上线）**：
- `file-server/nginx.conf` + `nginx-no-upload.conf` 统一指向 `/etc/nginx/ssl/fullchain.pem` + `privkey.pem`（LE SAN，与酒馆同证书）；
- file-server 挂载变量改为 **`AVG_CERT_DIR`**，macmini 侧指向与酒馆共用的 `AVG-AdventurerTavern/certs`（单一证书源，见 §3）；
- `acme/reload_certs.py` 新增 `adv-file-server` 容器 reload 分支（§1.3 拓扑中除 `adventurertavern` 外的第二个 AVG 消费方）；
- 旧目录留档 `ssl.deprecated-20260912/`；镜像 `adv-file-server:d5d1c77` 重建推送 + `restart.py` 部署。

**教训 / 检查清单**：**新增任何通过 443 对外服务的容器（或子模块）时，必须同时确认**（a）它挂载的是共用 `certs/`，（b）nginx 引用 `fullchain.pem`/`privkey.pem`，（c）`acme/reload_certs.py` 有对应 reload 分支。（本次故障正是 (b)+(c) 双双缺失。）

**排障口诀**：资源取不到先 `curl -v https://h.nyaa.host:5102/files/README.txt`（**不加 `-k`**）；若报 `SEC_E_CERT_EXPIRED` 即证书链路问题，查该容器挂载目录与 hook 覆盖范围。
