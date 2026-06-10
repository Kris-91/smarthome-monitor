"""
SmartHome IoT — GitHub Pages 部署脚本 (v2)
"""
import os, sys, json, base64, argparse, urllib.request, urllib.error, urllib.parse, time

API = "https://api.github.com"

def gh(url, token, method="GET", data=None, ok404=False):
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json", "User-Agent": "SIoT/1.0"}
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            if r.status == 204: return {}
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        if ok404 and e.code == 404: return None
        print(f"  API [{e.code}]: {e.read().decode()[:150]}")
        sys.exit(1)

def collect(root):
    files = []
    skip = {'calculator.js','constants.js','converter.js','grapher.js','matrix.js','reasonix.toml','deploy_github.py','.gitignore','daemon.pid','daemon.log'}
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d[0] != '.' and d != '__pycache__']
        for f in fn:
            if f[0] == '.' or f in skip: continue
            fp = os.path.join(dp, f)
            rp = os.path.relpath(fp, root).replace('\\', '/')
            with open(fp, 'rb') as fh: files.append((rp, fh.read()))
    return files

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--token', required=True)
    p.add_argument('--username', required=True)
    p.add_argument('--repo', default='smart-home-iot')
    a = p.parse_args()
    root = os.path.dirname(os.path.abspath(__file__))

    print(f"创建仓库 {a.username}/{a.repo} ...")
    gh(f"{API}/user/repos", a.token, "POST", {
        "name": a.repo, "description": "SmartHome IoT — 智能家居物联网监控平台",
        "private": False, "auto_init": True
    })
    time.sleep(3)

    files = collect(root)
    print(f"上传 {len(files)} 个文件...")
    for rp, ct in files:
        ep = urllib.parse.quote(rp, safe='/')
        data = {"message": f"Add {rp}", "content": base64.b64encode(ct).decode(), "branch": "main"}
        existing = gh(f"{API}/repos/{a.username}/{a.repo}/contents/{ep}?ref=main", a.token, ok404=True)
        if existing and 'sha' in existing:
            data["sha"] = existing["sha"]
            print(f"  {rp} (更新)")
        else:
            print(f"  {rp} (新建)")
        gh(f"{API}/repos/{a.username}/{a.repo}/contents/{ep}", a.token, "PUT", data)

    print("启用 GitHub Pages...")
    try: gh(f"{API}/repos/{a.username}/{a.repo}/pages", a.token, "POST", {"source":{"branch":"main","path":"/"}})
    except SystemExit: pass

    url = f"https://{a.username}.github.io/{a.repo}/"
    print(f"\n✅ 完成! {url}\n⏳ 1-2分钟生效")

if __name__ == '__main__': main()
