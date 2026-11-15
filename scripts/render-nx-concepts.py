"""Render the exported team geometry; no generated/reinvented rover shapes.
node scripts/export-nx-geometry.mjs
blender -b -t 8 --python scripts/render-nx-concepts.py
"""
import bpy, math, os
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parent.parent
out=Path(os.environ.get('NX_RENDER_OUTPUT',str(root/'.sites/nx-renders')));out.mkdir(parents=True,exist_ok=True)
mask_pass=os.environ.get('NX_MASK_PASS')=='1'
for unit in ['nx1','nx2']:
 for view in ['exterior','inside']:
  name=f'{unit}-{view}';bpy.ops.wm.read_factory_settings(use_empty=True)
  bpy.ops.import_scene.gltf(filepath=str(root/'public/concepts'/f'{name}.glb'))
  objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
  for obj in objects:
   if obj.name.startswith('RoundedBox'):
    mod=obj.modifiers.new('Case edge radius','BEVEL');mod.width=.035;mod.segments=3
    normal=obj.modifiers.new('Surface normals','WEIGHTED_NORMAL');normal.keep_sharp=True
  coords=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
  lo=Vector([min(v[i] for v in coords) for i in range(3)]);hi=Vector([max(v[i] for v in coords) for i in range(3)])
  center=(lo+hi)/2
  # Match the interactive scene's front quarter view; Y is converted to Z by glTF import.
  bpy.ops.object.camera_add(location=center+Vector((5,6.5,4.0)))
  camera=bpy.context.object;camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
  camera.data.type='ORTHO';camera.data.ortho_scale=max(hi.x-lo.x,hi.y-lo.y,hi.z-lo.z)*1.36
  scene=bpy.context.scene;scene.camera=camera
  def light(loc,power,size,color):
   bpy.ops.object.light_add(type='AREA',location=center+Vector(loc));obj=bpy.context.object
   obj.data.energy=power;obj.data.shape='DISK';obj.data.size=size;obj.data.color=color
   obj.rotation_euler=(center-obj.location).to_track_quat('-Z','Y').to_euler()
  light((-3,4,7),900,4,(1,.94,.82));light((4,-3,4),600,3,(.66,.81,1));light((3,5,2),140,4,(1,1,1))
  bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,lo.z-.02))
  ground=bpy.context.object;ground.is_shadow_catcher=True;ground.hide_render=mask_pass
  scene.world=bpy.data.worlds.new('Surface fill');scene.world.use_nodes=True
  scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.20,.26,1)
  scene.world.node_tree.nodes['Background'].inputs[1].default_value=.28
  scene.render.engine='CYCLES';scene.cycles.samples=2 if mask_pass else 64;scene.cycles.use_denoising=False;scene.cycles.max_bounces=2 if mask_pass else 6
  scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
  scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
  scene.render.threads_mode='FIXED';scene.render.threads=8;scene.render.filepath=str(out/f'{name}.png')
  bpy.ops.render.render(write_still=True);print('RENDERED',name,flush=True)
