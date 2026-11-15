import bpy, math, sys, os, time
from mathutils import Vector
from pathlib import Path
root=str(Path(__file__).resolve().parent.parent/'public/models/deep')
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [];names=args or ['pioneer10','dawn','kepler','near']
for name in names:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=root+'/'+name+'.glb')
 objs=[o for o in bpy.context.scene.objects if o.type=='MESH'];verts=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box];lo=Vector([min(v[i] for v in verts)for i in range(3)]);hi=Vector([max(v[i] for v in verts)for i in range(3)]);center=(lo+hi)/2;scale=3.4/max(hi-lo)
 pivot=bpy.data.objects.new('Craft',None);bpy.context.collection.objects.link(pivot)
 for o in list(bpy.context.scene.objects):
  if o!=pivot and o.parent is None:o.parent=pivot
 pivot.location=-center*scale;pivot.scale=(scale,)*3
 for o in list(bpy.context.scene.objects):
  if o.type in ('LIGHT','CAMERA'):bpy.data.objects.remove(o,do_unlink=True)
 bpy.ops.object.camera_add();cam=bpy.context.object;bpy.context.scene.camera=cam;cam.data.lens=50
 def light(loc,power,size,color):
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
 light((-3,5,6),1000,5,(1,.88,.72));light((4,1,-3),1400,4,(.5,.7,1));light((0,-5,2),450,5,(1,1,1))
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=False;scene.cycles.max_bounces=4;scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.world=bpy.data.worlds.new('Space light');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.16,.22,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
 scene.render.threads_mode='FIXED';scene.render.threads=8
 out='/tmp/craft-renders/'+name;os.makedirs(out,exist_ok=True)
 for i in range(24):
  a=i/24*math.tau+.5;cam.location=(6.2*math.sin(a),-6.2*math.cos(a),2.6);cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=out+f'/{i:02}.png';bpy.ops.render.render(write_still=True)
 print('DONE',name,flush=True)
