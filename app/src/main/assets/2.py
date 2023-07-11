import bpy;
from mathutils import Vector
import bmesh

bpy.context.scene.tool_settings.use_mesh_automerge = True
# bpy.context.scene.tool_settings.use_mesh_automerge_and_split = True

if len(bpy.context.scene.objects)>2:
    bpy.ops.object.mode_set(mode = 'OBJECT')
    bpy.context.scene.objects[2].select_set(True)
    bpy.ops.object.delete() 

bpy.ops.mesh.primitive_plane_add(enter_editmode=False, align='WORLD', location=(2, 0, 0.75), scale=(1, 1, 1))

bpy.ops.object.mode_set(mode = 'EDIT') 

bpy.ops.mesh.subdivide()

bpy.ops.mesh.select_mode(use_extend=False, use_expand=False, type='VERT')

bpy.ops.mesh.select_all(action = 'DESELECT')

bpy.ops.object.mode_set(mode = 'OBJECT')
bpy.context.scene.objects[2].data.vertices[6].select = True
bpy.ops.object.mode_set(mode = 'EDIT') 

# context = bpy.context
# scene = context.scene 
    
# obs = context.selected_objects
# n = len(obs)
# assert(n)
    
# scene.cursor.location = sum([o.matrix_world.translation for o in obs], Vector()) / n

for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        override = bpy.context.copy()
        override['area'] = area
        override['region'] = area.regions[4]
        # bpy.ops.view3d.snap_selected_to_cursor( override, use_offset=False)
        bpy.ops.view3d.snap_cursor_to_selected(override)


bpy.ops.mesh.select_mode(use_extend=False, use_expand=False, type='EDGE')
obj = bpy.context.scene.objects[2]
#bpy.context.active_object
bm = bmesh.from_edit_mesh(obj.data)
if hasattr(bm.verts, "ensure_lookup_table"): 
    bm.verts.ensure_lookup_table()
print(len(bm.edges))
index =1;
for edge in bm.edges:
    if index==3:
        edge.select = True
    index = index + 1
bmesh.update_edit_mesh(obj.data)
bpy.ops.mesh.spin(angle=3.14159, use_auto_merge=True, center=(3, 0, 0.75), axis=(0, 0, 1))

bpy.ops.object.mode_set(mode = 'OBJECT')

# bpy.ops.object.modifier_add(type='MIRROR')

bpy.ops.transform.translate(value=(0, 0, 0.8), orient_type='GLOBAL', orient_matrix=((1, 0, 0), (0, 1, 0), (0, 0, 1)), orient_matrix_type='GLOBAL', constraint_axis=(True, True, True), mirror=False, use_proportional_edit=False, proportional_edit_falloff='SMOOTH', proportional_size=1, use_proportional_connected=False, use_proportional_projected=False, snap=False, snap_elements={'INCREMENT'}, use_snap_project=False, snap_target='CLOSEST', use_snap_self=False, use_snap_edit=True, use_snap_nonedit=True, use_snap_selectable=False)

bpy.ops.object.mode_set(mode = 'EDIT') 

bpy.ops.mesh.select_all(action='SELECT')

bpy.ops.mesh.extrude_region_move(MESH_OT_extrude_region={"use_normal_flip":False, "use_dissolve_ortho_edges":False, "mirror":False}, TRANSFORM_OT_translate={"value":(0, 0, -0.1), "orient_type":'NORMAL', "orient_matrix":((-9.79961e-07, 1, 0), (-1, -9.79961e-07, 0), (0, 0, 1)), "orient_matrix_type":'NORMAL', "constraint_axis":(False, False, True), "mirror":False, "use_proportional_edit":False, "proportional_edit_falloff":'SMOOTH', "proportional_size":1, "use_proportional_connected":False, "use_proportional_projected":False, "snap":False, "snap_elements":{'INCREMENT'}, "use_snap_project":False, "snap_target":'CLOSEST', "use_snap_self":True, "use_snap_edit":True, "use_snap_nonedit":True, "use_snap_selectable":False, "snap_point":(0, 0, 0), "snap_align":False, "snap_normal":(0, 0, 0), "gpencil_strokes":False, "cursor_transform":False, "texture_space":False, "remove_on_cancel":False, "view2d_edge_pan":False, "release_confirm":False, "use_accurate":False, "use_automerge_and_split":False})

# bpy.ops.mesh.select_mode(use_extend=False, use_expand=False, type='FACE')
# bpy.ops.mesh.select_next_item()
# bpy.ops.mesh.duplicate_move(MESH_OT_duplicate={"mode":1}, TRANSFORM_OT_translate={"value":(0, 0, 0), "orient_type":'GLOBAL', "orient_matrix":((1, 0, 0), (0, 1, 0), (0, 0, 1)), "orient_matrix_type":'GLOBAL', "constraint_axis":(False, False, False), "mirror":False, "use_proportional_edit":False, "proportional_edit_falloff":'SMOOTH', "proportional_size":1, "use_proportional_connected":False, "use_proportional_projected":False, "snap":False, "snap_elements":{'INCREMENT'}, "use_snap_project":False, "snap_target":'CLOSEST', "use_snap_self":True, "use_snap_edit":True, "use_snap_nonedit":True, "use_snap_selectable":False, "snap_point":(0, 0, 0), "snap_align":False, "snap_normal":(0, 0, 0), "gpencil_strokes":False, "cursor_transform":False, "texture_space":False, "remove_on_cancel":False, "view2d_edge_pan":False, "release_confirm":False, "use_accurate":False, "use_automerge_and_split":False})

# bpy.ops.object.modifier_remove(modifier="Solidify")