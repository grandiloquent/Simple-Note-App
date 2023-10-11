print("bpy.context.object.rotation_euler = ({1},{2},{3}){0}bpy.context.object.location = ({4},{5},{6}){0}".format("\n",bpy.context.object.rotation_euler[0],
bpy.context.object.rotation_euler[1],
bpy.context.object.rotation_euler[2],
bpy.context.object.location[0],
bpy.context.object.location[1],
bpy.context.object.location[2],
));

n=2
print("D.lights[{7}].color = ({1},{2},{3}){0}D.lights[{7}].energy = {4}{0}D.lights[{7}].size = {5}{0}D.lights[{7}].shape = '{6}'{0}".format("\n",
D.lights[n].color[0],
D.lights[n].color[1],
D.lights[n].color[2],
D.lights[n].energy,
D.lights[n].size,
D.lights[n].shape,
n
));