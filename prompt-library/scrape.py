import re,html,json,time,urllib.request,sys
D=sys.argv[1]
idx=open(D+'/index.html').read()
slugs=sorted(set(re.findall(r'href="/([a-z0-9-]+-[0-9a-f]{6})"',idx)))
out=[]
for s in slugs:
    try:
        t=urllib.request.urlopen(urllib.request.Request('https://prompt-motion.com/'+s,headers={'User-Agent':'curl/8.5.0','Accept':'*/*'}),timeout=30).read().decode()
    except Exception as e:
        print('ERR',s,e); continue
    title=html.unescape(re.search(r'<title>(.*?)</title>',t).group(1)).replace(' · Prompt Motion','')
    x=re.sub(r'<script.*?</script>','',t,flags=re.S); x=re.sub(r'<[^>]+>','\n',x)
    L=[l.strip() for l in html.unescape(x).split('\n') if l.strip()]
    def after(k):
        return L[L.index(k)+1] if k in L else ''
    p=''
    if 'Copy' in L:
        i=L.index('Copy')+1; j=i
        while j<len(L) and not L[j].startswith('This prompt was') and L[j]!='Model': j+=1
        p='\n'.join(L[i:j])
    src=re.search(r'href="(https://(?:x|twitter)\.com/[^"]+)"',t)
    out.append(dict(slug=s,title=title,url='https://prompt-motion.com/'+s,source=src.group(1) if src else '',model=after('Model'),iterations=after('Iterations'),posted=after('Posted'),prompt=p))
    time.sleep(0.4)
json.dump(out,open(D+'/prompts.json','w'),ensure_ascii=False,indent=1)
print(len(out), sum(1 for o in out if not o['prompt']))
