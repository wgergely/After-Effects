# pylint: disable=all

"""Renders selected object to a sequence of textures using arnoldRenderToTexture().
The textures are placed in the render/<renderLayer>/renderToTexture folder.

Example:
    from TKWWBK import renderToTexture
    renderToTexture.init()

Attributes:
    AA_SAMPLES (int): The arnold AA sample size.
    RESOLUTION (int): The size of the image to render.
    SKIP (int): The number of frames to skip.

"""

AA_SAMPLES = 0
RESOLUTION = 4096
SKIP = 3

def init():
    import os
    from maya import cmds
    import maya.app.renderSetup.model.renderSetup as renderSetup

    renderSetup = renderSetup.instance()
    start = int(cmds.playbackOptions(query=True, animationStartTime=True))
    end = int(cmds.playbackOptions(query=True, animationEndTime=True))
    root = cmds.workspace(q=True, rootDirectory=True)
    layer = next((f.name() for f in renderSetup.getRenderLayers() if f.isVisible()), None)

    path = os.path.abspath(os.path.join(root, 'renders/{layer}/renderToTexture'))
    if not os.path.exists(path.format(layer=layer)):
        os.makedirs(path.format(layer=layer))

    sel = cmds.ls(selection=True)

    generated_filename = '{path}/{layer}_{idx}Shape.exr'
    okfilename = '{path}/{layer}_{idx}.exr'

    original_name = next((f for f in sel), None)
    if not original_name:
        print 'No selection.'
        return

    filepaths = []
    try:
        for idx in xrange(end - start):
            if not (SKIP - 1) == (idx % SKIP):
                continue

            cmds.currentTime(int((int(start) + idx)))
            for s in sel:
                cmds.rename('{}_{}'.format(layer, '{}'.format(idx).zfill(4)))
            cmds.arnoldRenderToTexture(f=os.path.abspath(path.format(
                layer=layer)), aa_samples=AA_SAMPLES, r=RESOLUTION)
            filepath = os.path.abspath('{path}/{layer}_{idx}Shape.exr'.format(
                path=path.format(layer=layer),
                layer=layer,
                idx='{}'.format(idx).zfill(4))
            )
            try:
                os.rename(
                    os.path.abspath(filepath),
                    os.path.abspath(filepath).replace('Shape', '')
                )
            finally:
                pass
    except Exception as err:
        print err
    finally:
        cmds.rename(original_name)
