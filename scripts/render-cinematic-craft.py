import bpy, math, sys
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parent.parent
name=sys.argv[-1] if sys.argv[-1] in ['dawn','pioneer10','near','kepler'] else 'dawn'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(root/('public/models/deep/'+name+'.glb')))
objs=[o for o in bpy.context.scene.objects if o.type=='MESH'];verts=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box];lo=Vector([min(v[i] for v in verts)for i in range(3)]);hi=Vector([max(v[i] for v in verts)for i in range(3)]);center=(lo+hi)/2;scale=3.7/max(hi-lo)
pivot=bpy.data.objects.new('Craft',None);bpy.context.collection.objects.link(pivot)
for o in list(bpy.context.scene.objects):
 if o!=pivot and o.parent is None:o.parent=pivot
pivot.location=-center*scale;pivot.scale=(scale,)*3
for o in list(bpy.context.scene.objects):
 if o.type in ('LIGHT','CAMERA'):bpy.data.objects.remove(o,do_unlink=True)
a=(math.pi+.5) if name in ['dawn','near'] else .5;bpy.ops.object.camera_add(location=(6.2*math.sin(a),-6.2*math.cos(a),2.6));cam=bpy.context.object;cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=50;bpy.context.scene.camera=cam;bpy.context.view_layer.update()
q=cam.matrix_world.to_quaternion();key=(q@Vector((1,0,0))*.48+q@Vector((0,1,0))*.56+cam.location.normalized()*.68).normalized()*8
bpy.ops.object.light_add(type='SUN',location=key);sun=bpy.context.object;sun.rotation_euler=(-key).to_track_quat('-Z','Y').to_euler();sun.data.energy=3.2;sun.data.angle=.008;sun.data.color=(1,.93,.84)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=False;scene.cycles.max_bounces=5;scene.render.resolution_x=1200;scene.render.resolution_y=1200;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.world=bpy.data.worlds.new('Vacuum');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.10,.12,.16,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.045;scene.render.threads_mode='FIXED';scene.render.threads=8;scene.render.filepath='/tmp/'+name+'-cinematic.png';bpy.ops.render.render(write_still=True)
