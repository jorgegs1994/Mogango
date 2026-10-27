import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'find_road_files.py')).read().split("keys=")[0])
import json, shapely, pyarrow.compute as pc
res=json.load(open('hits.json'))
W,So,E,N=-15.86,27.72,-15.33,28.19
out=[]
for k,gs in res:
    f=pq.ParquetFile(io.BufferedReader(RF(B+k),buffer_size=4<<20))
    cols=[c for c in ['id','geometry','bbox','subtype','class','names','connectors','routes'] if c in f.schema_arrow.names]
    t=f.read_row_groups(gs,columns=cols)
    bb=t['bbox'].combine_chunks()
    m=pc.and_(pc.and_(pc.less_equal(bb.field('xmin'),E),pc.greater_equal(bb.field('xmax'),W)),pc.and_(pc.less_equal(bb.field('ymin'),N),pc.greater_equal(bb.field('ymax'),So)))
    t=t.filter(m)
    t=t.filter(pc.equal(t['subtype'],'road'))
    print(k[-30:],t.num_rows, pc.value_counts(t['class']).to_pylist()[:12])
    for r in t.to_pylist():
        if r['class'] not in ('motorway','trunk','primary','secondary','tertiary'): continue
        g=shapely.from_wkb(r['geometry'])
        name=(r.get('names') or {}).get('primary')
        ref=None
        for rt in (r.get('routes') or []):
            ref=rt.get('ref') or ref
        out.append({'id':r['id'],'class':r['class'],'name':name,'ref':ref,'coords':[[round(x,6),round(y,6)] for x,y in g.coords],'conn':[c['connector_id'] for c in (r.get('connectors') or [])],'connat':[c['at'] for c in (r.get('connectors') or [])]})
json.dump(out,open('roads.json','w'))
print(len(out))
