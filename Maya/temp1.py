def setDisplayDefaults():
    mAttributes = (
        {'displayLights':'default'},
        {'twoSidedLighting':False},
        {'displayAppearance':'smoothShaded'},
        {'wireframeOnShaded':False},
        {'headsUpDisplay':False},
        {'selectionHiliteDisplay':False},
        {'useDefaultMaterial':False},
        {'useRGBImagePlane':True},
        {'backfaceCulling':True},
        {'xray':False},
        {'jointXray':False},
        {'activeComponentsXray':False},
        {'maxConstantTransparency':1.0},
        {'displayTextures':False},
        {'smoothWireframe':True},
        {'lineWidth':1.0},
        {'textureAnisotropic':False},
        {'textureSampling':2},
        {'textureDisplay':'modulate'},
        {'textureHilight':True},
        {'shadows':False},
        {'rendererName':'vp2Renderer'},
        {'nurbsCurves':False},
        {'nurbsSurfaces':False},
        {'polymeshes':True},
        {'subdivSurfaces':True},
        {'planes':False},
        {'lights':False},
        {'cameras':False},
        {'controlVertices':False},
        {'grid':False},
        {'hulls':False},
        {'joints':False},
        {'ikHandles':False},
        {'deformers':False},
        {'dynamics':False},
        {'fluids':False},
        {'hairSystems':False},
        {'follicles':False},
        {'nCloths':False},
        {'nParticles':False},
        {'nRigids':False},
        {'dynamicConstraints':False},
        {'locators':False},
        {'manipulators':False},
        {'dimensions':False},
        {'handles':False},
        {'pivots':False},
        {'textures':False},
        {'strokes':False}
    )


    def _set(**kwargs):
        return cmds.modelEditor(modelEditorName, edit=True, **kwargs)
    def _get(**kwargs):
        return cmds.modelEditor(p, query=True, **kwargs)

    modelPanels = cmds.getPanel(type='modelPanel')
    for p in modelPanels:
        modelEditorName = cmds.modelPanel(p, query=True, modelEditor=True)
        camName = cmds.modelEditor(p, query=True, camera=True)
        if camName == 'cameraShape':
            for item in mAttributes:
                key = next(iter(item))
                if item[key] is not None:
                    _set(**item)
