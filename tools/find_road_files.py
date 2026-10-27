import requests, io, re, pyarrow.parquet as pq, pyarrow as pa, json, concurrent.futures as cf
B="https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com/"
R="release/2026-10-21.0/theme=transportation/type=segment/"
S=requests.Session()
class RF(io.RawIOBase):
    def __init__(s,url):
        s.url=url; s.pos=0
        s.size=int(S.head(url).headers['Content-Length'])
    def seekable(s): return True
    def readable(s): return True
    def tell(s): return s.pos
    def seek(s,o,w=0):
        s.pos = o if w==0 else (s.pos+o if w==1 else s.size+o); return s.pos
    def read(s,n=-1):
        if n<0: n=s.size-s.pos
        if n==0: return b''
        r=S.get(s.url,headers={'Range':f'bytes={s.pos}-{s.pos+n-1}'}); d=r.content; s.pos+=len(d); return d
    def readinto(s,b):
        d=s.read(len(b)); b[:len(d)]=d; return len(d)
keys=re.findall(r'<Key>([^<]*)</Key>',S.get(B+f"?list-type=2&prefix={R}").text)
W,So,E,N=-15.86,27.72,-15.33,28.19
def scan(k):
    f=pq.ParquetFile(io.BufferedReader(RF(B+k),buffer_size=1<<20))
    md=f.metadata; names=f.schema_arrow.names
    sch=f.metadata.schema
    # find column indices for bbox.xmin etc
    idx={sch.column(i).path:i for i in range(md.num_columns)}
    hits=[]
    for g in range(md.num_row_groups):
        rg=md.row_group(g)
        def st(p):
            c=rg.column(idx[p]).statistics; return (c.min,c.max) if c and c.has_min_max else (None,None)
        xmin=st('bbox.xmin'); xmax=st('bbox.xmax'); ymin=st('bbox.ymin'); ymax=st('bbox.ymax')
        if None in xmin+ymin: continue
        if xmin[0]<=E and xmax[1]>=W and ymin[0]<=N and ymax[1]>=So: hits.append(g)
    return k,hits
with cf.ThreadPoolExecutor(16) as ex:
    res=list(ex.map(scan,keys))
res=[(k,h) for k,h in res if h]
print(len(res), sum(len(h) for k,h in res)); json.dump(res,open('hits.json','w'))
