# Builds components/index.d.ts for the design system from tsc declaration output.
# Usage: tsc -p . --declaration --emitDeclarationOnly --noEmit false --rootDir src --outDir <dts>
#        python3 build/gen-dts.py <dts> <registry.json> > index.d.ts
import json, os, re, sys

dts, registry = sys.argv[1], sys.argv[2]
items = {i["name"]: i for i in json.load(open(registry))["items"]}
files = []
for it in items.values():
    for f in it.get("files", []):
        p = f["path"]
        # A file shared by two items (stat-card in app-shell and dashboard) is declared once.
        if (p.startswith("src/components/") or p in ("src/lib/i18n.tsx", "src/lib/link.tsx")) and p.endswith(".tsx") and p not in {f for _, f in files}:
            files.append((it, p))
ui = sorted([x for x in files if "/ui/" in x[1]], key=lambda x: x[1])
blocks = [x for x in files if "/ui/" not in x[1]]

imports, sections, seen = [], [], set()
seen_types = set()
for it, path in ui + blocks:
    rel = path[len("src/"):-len(".tsx")] + ".d.ts"
    src = open(os.path.join(dts, rel)).read()
    body = []
    for line in src.splitlines():
        if line.startswith("import "):
            if '"@/' not in line and line not in seen:
                seen.add(line)
                imports.append(line)
            continue
        body.append(line)
    # Local helper types repeated across files (IconLike…): keep the first declaration only.
    kept = []
    for line in body:
        m = re.match(r"^(?:declare )?type (\w+)\b.*;$", line)
        if m and not line.startswith("export"):
            if m.group(1) in seen_types:
                continue
            seen_types.add(m.group(1))
        kept.append(line)
    body = kept
    text = "\n".join(body).strip()
    exports = re.findall(r"^export \{([^}]*)\}", text, re.M)
    names = [n.strip().replace("type ", "") for e in exports for n in e.split(",") if n.strip()]
    main = next((n for n in names if n[0].isupper() and re.search(rf"declare (function|const) {n}\b", text)), None)
    desc = it.get("description", "")
    if main and desc:
        text = re.sub(rf"^(declare (?:function|const) {main}\b)", f"/** {desc} */\n\\1", text, count=1, flags=re.M)
    sec = f"// ---- {it['title']}  (components/src/{path})\n{text}\n"
    if main and not re.search(rf"\b(type|interface) {main}Props\b", text):
        sec += f"/** Props of `{main}`. */\nexport type {main}Props = React.ComponentProps<typeof {main}>;\n"
    sections.append(sec)

# Merge named imports per module so each name is imported once.
star, named = [], {}
for line in imports:
    m = re.match(r'import (type )?\{([^}]*)\} from "([^"]+)";?', line)
    if not m:
        if line not in star:
            star.append(line)
        continue
    specs = named.setdefault(m.group(3), [])
    for spec in m.group(2).split(","):
        spec = spec.strip()
        if m.group(1) and spec and not spec.startswith("type "):
            spec = "type " + spec
        if spec == "type ToasterProps":
            spec = "type ToasterProps as SonnerToasterProps"
        key = spec.replace("type ", "")
        if spec and key not in [x.replace("type ", "") for x in specs]:
            specs.append(spec)
lines = sorted(star, key=lambda l: not l.startswith("import * as React"))
lines += [f'import {{ {", ".join(v)} }} from "{k}";' for k, v in sorted(named.items())]
out = "/**\n * Coreloom UI on shadcn/ui (Radix) — types of every part on\n * window.CoreloomUIDesignSystem_ff5f32. Generated from components/src.\n */\n"
out += "\n".join(lines) + "\n\n" + "\n".join(sections)
out = out.replace("({ toastOptions, ...props }: ToasterProps)", "({ toastOptions, ...props }: SonnerToasterProps)")
sys.stdout.write(out)
