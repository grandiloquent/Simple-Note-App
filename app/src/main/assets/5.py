import bpy
import bmesh

data = bpy.context.object.data
bm = bmesh.from_edit_mesh(bpy.context.object.data)
edges = [e for e in bm.edges if e.select]
m = 0
for e in edges:
    if e.verts[0].co.y < m:
        e.select = True
        m = e.verts[0].co.y
    else:
        e.select = False
        
        print('===============',e.verts[0].co.x,e.verts[0].co.y)

bmesh.update_edit_mesh(data)