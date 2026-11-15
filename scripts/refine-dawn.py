"""NASA mesh preserved; authored PBR surface detail and high-resolution orbit renders.
Run with Blender: blender -b -t 8 --python scripts/refine-dawn.py
Surface microstructure is illustrative, not an engineering reconstruction.
"""
import bpy, math, random, os
from pathlib import Path
from mathutils import Vector
root = Path(__file__).resolve().parent.parent
out = Path(os.environ.get('DAWN_RENDER_OUTPUT',str(root/'.sites/dawn-refinement'))); out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'public/models/deep/dawn.glb'))

def surface_normal(name, kind):
    size=512; image=bpy.data.images.new(name,width=size,height=size)
    image.colorspace_settings.name='Non-Color'
    random.seed(41); pixels=[]
    for y in range(size):
        for x in range(size):
            if kind=='ribs':
                dx=.17*math.sin(x*math.tau/24); dy=.025*math.sin(y*math.tau/128)
            else:
                dx=.15*math.sin(x*.31+math.sin(y*.13)*4)+.08*math.sin(y*.75+x*.16)
                dy=.15*math.cos(y*.27+math.sin(x*.12)*3)+.07*math.sin(x*.65+y*.21)
            n=Vector((dx,dy,1)).normalized(); pixels.extend(((n.x+1)/2,(n.y+1)/2,(n.z+1)/2,1))
    image.pixels.foreach_set(pixels); image.pack(); return image

foil = surface_normal('Authored foil microstructure','foil')
ribs = surface_normal('Authored rear-panel ribbing','ribs')
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    nodes=mat.node_tree.nodes; bs=next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bs: continue
    name=mat.name.lower()
    if name=='shiny_panel':
        # The untextured light-grey rear surface was washing out under the key light.
        bs.inputs['Base Color'].default_value=(.055,.075,.105,1)
        metal,rough,normal=.62,.43,ribs
    elif 'foil' in name:
        metal,rough,normal=.77,.34,foil
    elif 'black' in name:
        metal,rough,normal=.1,.73,foil
    else:
        metal,rough,normal=.4,.43,None
    bs.inputs['Metallic'].default_value=metal; bs.inputs['Roughness'].default_value=rough
    if normal:
        tex=nodes.new('ShaderNodeTexImage'); tex.image=normal
        norm=nodes.new('ShaderNodeNormalMap'); norm.inputs['Strength'].default_value=.32 if 'black' in name else .65
        mat.node_tree.links.new(tex.outputs['Color'],norm.inputs['Color']); mat.node_tree.links.new(norm.outputs['Normal'],bs.inputs['Normal'])
    for node in nodes:
        if node.type=='TEX_IMAGE': node.interpolation='Linear'

bpy.ops.export_scene.gltf(filepath=str(root/'public/models/deep/dawn-detailed.glb'),export_format='GLB',export_image_format='AUTO',export_tangents=True)
objs=[o for o in bpy.context.scene.objects if o.type=='MESH']
verts=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box]
lo=Vector([min(v[i] for v in verts) for i in range(3)]); hi=Vector([max(v[i] for v in verts) for i in range(3)])
center=(lo+hi)/2; scale=3.4/max(hi-lo)
pivot=bpy.data.objects.new('Craft',None); bpy.context.collection.objects.link(pivot)
for obj in list(bpy.context.scene.objects):
    if obj!=pivot and obj.parent is None: obj.parent=pivot
pivot.location=-center*scale; pivot.scale=(scale,)*3
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=64; scene.cycles.use_denoising=False
scene.cycles.max_bounces=5; scene.render.resolution_percentage=100; scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.render.threads_mode='FIXED'; scene.render.threads=8
scene.world=bpy.data.worlds.new('Deep space'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.11,.15,.21,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.16
bpy.ops.object.camera_add(); cam=bpy.context.object; scene.camera=cam; cam.data.lens=50
def area(loc,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc); light=bpy.context.object
    light.data.energy=power; light.data.shape='DISK'; light.data.size=size; light.data.color=color
    light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
area((-3,5,6),750,2,(1,.94,.83)); area((4,1,-3),700,3,(.55,.72,1)); area((0,-5,2),120,4,(.75,.86,1))
frames=out/'frames'; frames.mkdir(exist_ok=True)
for i in range(24):
    a=i/24*math.tau+.5; cam.location=(6.2*math.sin(a),-6.2*math.cos(a),2.6)
    cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.resolution_x=1024; scene.render.resolution_y=1024
    scene.render.filepath=str(frames/f'{i:02}.png'); bpy.ops.render.render(write_still=True)
    print('DAWN FRAME',i,flush=True)
cam.location=(6.2*math.sin(math.pi+.5),-6.2*math.cos(math.pi+.5),2.6)
cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=1600; scene.render.resolution_y=1600; scene.cycles.samples=80
scene.render.filepath=str(out/'dawn-detailed.png'); bpy.ops.render.render(write_still=True)
