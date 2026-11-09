import json,sys,collections,datetime
d=json.load(open(sys.argv[1]))
fasi=collections.Counter(); stadio=collections.Counter(); mesi=collections.Counter()
qr_per_partita=[]
for g in d.values():
    if not isinstance(g,dict): continue
    fasi[g.get('phase')]+=1
    pl={k:v for k,v in (g.get('players') or {}).items() if isinstance(v,dict)}
    scan=sum(1 for p in pl.values() if p.get('deviceToken'))
    qr_per_partita.append((scan, len(pl)))
    if g.get('winner'): s='4. conclusa'
    elif g.get('dayNum') or g.get('narratorLog'): s='3. almeno una notte giocata'
    elif scan: s='2. qualcuno ha inquadrato il QR'
    else: s='1. creata e abbandonata'
    stadio[s]+=1
print("== fasi registrate ==")
for f,n in fasi.most_common(): print(f"  {str(f):12} {n:4}")
print("\n== stadio finale raggiunto ==")
tot=sum(stadio.values())
cum=tot
for s in sorted(stadio):
    print(f"  {s:34} {stadio[s]:4}  ({stadio[s]/tot*100:5.1f}%)")
print("\n== imbuto cumulato ==")
ordine=['1. creata e abbandonata','2. qualcuno ha inquadrato il QR','3. almeno una notte giocata','4. conclusa']
resta=tot
print(f"  partite create                     {tot:4}  (100.0%)")
for i,s in enumerate(ordine):
    resta-=stadio.get(s,0)
    if i<len(ordine)-1:
        print(f"  -> superano '{s[3:]}'".ljust(40)+f"{resta:4}  ({resta/tot*100:5.1f}%)")
import statistics
scans=[s for s,_ in qr_per_partita]
tot_pl=[t for _,t in qr_per_partita]
print(f"\ngiocatori inseriti dal narratore: mediana {statistics.median(tot_pl):.0f}")
print(f"di cui hanno inquadrato il QR   : mediana {statistics.median(scans):.0f}, media {statistics.mean(scans):.1f}")
pieno=sum(1 for s,t in qr_per_partita if t and s>=t)
print(f"partite in cui TUTTI hanno inquadrato: {pieno} ({pieno/tot*100:.1f}%)")
