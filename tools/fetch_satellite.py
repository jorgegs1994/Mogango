import rasterio, numpy as np
from rasterio.merge import merge
from rasterio.warp import transform_bounds
import os
os.environ.setdefault("CURL_CA_BUNDLE","/root/.ccr/ca-bundle.crt")
base="https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/28/R/{t}/2024/8/S2B_28R{t}_20240817_0_L2A/TCI.tif"
srcs=[rasterio.open("/vsicurl/"+base.format(t=t)) for t in ("DS","DR")]
crs=srcs[0].crs
b=transform_bounds("EPSG:4326",crs,-15.86,27.72,-15.33,28.19)
print(crs,b)
arr,tr=merge(srcs,bounds=b,res=10)
print(arr.shape)
np.save("tci.npy",arr); 
import json; json.dump({"crs":str(crs),"transform":list(tr)[:6],"bounds":b},open("tci.json","w"))
