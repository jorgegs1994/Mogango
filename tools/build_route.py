import json, math, networkx as nx
from shapely.geometry import LineString, Point
from shapely.ops import substring
roads=json.load(open('roads.json'))
lat0=27.96; KX=111320*math.cos(math.radians(lat0)); KY=110860
def m(p): return (p[0]*KX,p[1]*KY)
cost={'motorway':1.0,'trunk':1.05,'primary':1.25,'secondary':1.6,'tertiary':2.2}
G=nx.Graph(); pos={}
for r in roads:
    ls=LineString([m(p) for p in r['coords']])
    L=ls.length
    cuts=sorted(zip(r['connat'],r['conn']))
    for (a0,c0),(a1,c1) in zip(cuts,cuts[1:]):
        if a1<=a0: continue
        seg=substring(ls,a0*L,a1*L)
        coords=list(seg.coords)
        pos[c0]=coords[0]; pos[c1]=coords[-1]
        w=seg.length*cost[r['class']]
        if G.has_edge(c0,c1) and G[c0][c1]['weight']<=w: continue
        G.add_edge(c0,c1,weight=w,coords=coords,cls=r['class'],ref=r['ref'],name=r['name'])
big=max(nx.connected_components(G),key=len); G=G.subgraph(big).copy()
print('nodes',G.number_of_nodes())
def nearest(lon,lat,classes=('motorway','trunk','primary','secondary')):
    x,y=m((lon,lat)); best=None
    for n in G.nodes:
        if not any(G[n][k]['cls'] in classes for k in G[n]): continue
        d=math.hypot(pos[n][0]-x,pos[n][1]-y)
        if best is None or d<best[0]: best=(d,n)
    return best
stops=json.load(open('stops.json'))
path=[]; stopidx=[]
nodes=[]
for s in stops:
    d,n=nearest(*s['ll']); print(s['name'],'snap',round(d),'m'); nodes.append(n)
pts=[pos[nodes[0]]]; stopidx.append(0); refs=set()
for a,b in zip(nodes,nodes[1:]):
    p=nx.shortest_path(G,a,b,weight='weight')
    for u,v in zip(p,p[1:]):
        e=G[u][v]; c=e['coords']
        if math.hypot(c[0][0]-pos[u][0],c[0][1]-pos[u][1])>1: c=c[::-1]
        pts.extend(c[1:]); refs.add(e['ref'] or e['name'])
    stopidx.append(len(pts)-1)
line=LineString(pts)
print('length km',line.length/1000, 'refs',[r for r in refs if r][:30])
# simplify keeping stop points: simplify each leg
out=[];idx=[0]
for i,(a,b) in enumerate(zip(stopidx,stopidx[1:])):
    leg=LineString(pts[a:b+1]).simplify(8)
    c=list(leg.coords)
    out.extend(c if not out else c[1:]); idx.append(len(out)-1)
ll=[[round(x/KX,5),round(y/KY,5)] for x,y in out]
json.dump({'route':ll,'stops':idx},open('route.json','w'))
print('points',len(ll),'stop idx',idx)
