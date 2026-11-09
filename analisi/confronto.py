import json,sys,datetime,statistics
d=json.load(open(sys.argv[1]))
TAGLIO=datetime.datetime(2026,10,23,20,18).timestamp()*1000  # 1.6 live
grp={'prima 1.6':[], 'dopo 1.6':[]}
for g in d.values():
    if not isinstance(g,dict): continue
    t=g.get('createdAt')
    if not isinstance(t,(int,float)): continue
    k='dopo 1.6' if t>=TAGLIO else 'prima 1.6'
    pl={a:b for a,b in (g.get('players') or {}).items() if isinstance(b,dict)}
    scan=sum(1 for p in pl.values() if p.get('deviceToken'))
    grp[k].append({'n':len(pl),'scan':scan,
                   'notte':bool(g.get('dayNum') or g.get('narratorLog')),
                   'fine':bool(g.get('winner')),
                   'tutti':bool(pl) and scan>=len(pl)})
for k in ['prima 1.6','dopo 1.6']:
    a=grp[k]; n=len(a)
    if not n: continue
    q=lambda f: sum(1 for x in a if f(x))/n*100
    print(f"\n== {k}  ({n} partite) ==")
    print(f"  almeno 1 QR inquadrato : {q(lambda x:x['scan']>0):5.1f}%")
    print(f"  TUTTI hanno inquadrato : {q(lambda x:x['tutti']):5.1f}%")
    print(f"  almeno una notte       : {q(lambda x:x['notte']):5.1f}%")
    print(f"  conclusa               : {q(lambda x:x['fine']):5.1f}%")
    print(f"  giocatori inseriti     : mediana {statistics.median([x['n'] for x in a]):.0f}")
    print(f"  di cui entrati col QR  : media {statistics.mean([x['scan'] for x in a]):.1f}")
