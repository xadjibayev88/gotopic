import json,re,sys
d=json.load(open(sys.argv[1])); out=sys.argv[2]
tags={'launch/promo':r'promo|launch|ad\b|hype|commercial|trailer|pitch|app\b|product','explainer':r'explain|educational|tutorial|lesson|concept|history|how ','3d':r'3d|three\.js|webgl|camera','data/chart':r'chart|graph|data|dashboard|stat','type/text':r'kinetic|typograph|text|title|font','logo/brand':r'logo|brand|intro|reel|showreel','retro/pixel':r'pixel|ascii|retro|8-bit|risograph|oscilloscope','story/short':r'story|short film|animated short|anime|character','music':r'music|track|beat|song|audio|voice'}
for o in d:
    s=(o['title']+' '+o['prompt']).lower()
    o['tags']=[k for k,v in tags.items() if re.search(v,s)] or ['other']
    o['author']='@'+re.sub(r'-[0-9a-f]{6}$','',o['slug'])
    o['id']=o['slug']
json.dump(d,open(out+'/prompts.json','w'),ensure_ascii=False,indent=1)
L=['# Prompt Motion kutubxonasi','',f'Manba: https://prompt-motion.com — {len(d)} ta prompt, 2026-11-28 da saqlangan. Videolar va promptlar mualliflariniki (har birida havola bor).','','Ishlatish: egasi ilova/sayti uchun video so‘raganda, `prompts.json` dan mosini tanlab (teglar bo‘yicha), uni egasining mahsulotiga moslab, `MOTION.md` qoidalari bilan quriladi.','','## Teglar bo‘yicha ro‘yxat','']
L[-2]='## Qisqa jadval'
L+=['| id | sarlavha | teglar |','|---|---|---|']
for o in d: L.append(f"| `{o['id']}` | {o['title']} | {', '.join(o['tags'])} |")
L+=['','## Barcha promptlar','']
for o in d:
    L+=[f"### {o['title']}",f"`{o['id']}` · {o['author']} · {o['model']} · {o['iterations']} · {o['posted']} · teglar: {', '.join(o['tags'])}",f"[sahifa]({o['url']})"+(f" · [asl post]({o['source']})" if o['source'] else ''),'','```text',o['prompt'],'```','']
open(out+'/README.md','w').write('\n'.join(L))
