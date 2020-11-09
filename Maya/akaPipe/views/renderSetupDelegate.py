import maya
maya.utils.loadStringResourcesForModule(__name__)

from PySide2.QtCore import Qt, QRect
from PySide2.QtGui import QPainter, QColor, QBrush, QCursor, QFontMetrics, QPen
from PySide2.QtWidgets import QLineEdit

import akaPipe.views.baseDelegate as baseDelegate

import akaPipe.views.proxy.renderSetup as renderSetup
import akaPipe.views.proxy.renderSetupRoles as renderSetupRoles
import akaPipe.views.utils as utils


from copy import deepcopy

""" Create a dictionary of pixmaps to use for filtering
    These can be looked up by filter type """
def createFilterPixmaps():
    filterIcons = {}
    return filterIcons


class RenderSetupDelegate(baseDelegate.BaseDelegate):
    """
    This class provides customization of the appearance of items in the Model.
    """

    # Constants
    HIGHLIGHTED_FILL_OFFSET = 1
    INFO_COLOR = QColor(255, 0, 0)

    LEFT_NON_TEXT_OFFSET = utils.dpiScale(25.5)
    RIGHT_NON_TEXT_OFFSET = utils.dpiScale(6)

    DISABLED_IMAGE   = baseDelegate.createPixmap(":/RS_disable.png")
    ISOLATE_IMAGE    = baseDelegate.createPixmap(":/RS_isolate.png")
    INVALID_IMAGE    = baseDelegate.createPixmap(":/RS_invalid.png")
    DISCLOSURE_IMAGE = baseDelegate.createPixmap(":/RS_disclosure_triangle.png")

    # create a collection of pixmaps used for filters that can be looked up by filter type
    _kFilterIcons = createFilterPixmaps()

    kTooltips = {renderSetup.SET_VISIBILITY_ACTION : maya.stringTable['y_renderSetupDelegate.kVisibilityToolTip' ],
                 renderSetup.SET_ENABLED_ACTION : maya.stringTable['y_renderSetupDelegate.kEnabledToolTip' ],
                 renderSetup.SET_ISOLATE_SELECTED_ACTION : maya.stringTable['y_renderSetupDelegate.kIsolateToolTip' ],
                 renderSetup.FILTER_MENU : maya.stringTable['y_renderSetupDelegate.kFiltersToolTip' ]}

    @staticmethod
    def getFilterIcon(filter):
        return None

    def __init__(self, treeView):
        super(RenderSetupDelegate, self).__init__(treeView)

    def _getItem(self, index):
        return self.treeView().model().itemFromIndex(index)

    def _drawColorBar(self, painter, rect, item):
        rect2 = deepcopy(rect)
        rect2.setRight(rect2.left() + self.COLOR_BAR_WIDTH)
        painter.fillRect(rect2, item.data(renderSetupRoles.NODE_COLOR_BAR))

        # if item.type()==renderSetup.RENDER_OVERRIDE_TYPE and item.isLocalRender():
        #     diameter = rect2.width()-2
        #     rect3 = QRect(rect2.x()+1, rect2.y() + (rect2.height()-diameter)/2, diameter, diameter)
        #     brush = painter.brush()
        #     pen = painter.pen()
        #     hints = painter.renderHints()
        #
        #     painter.setRenderHint(QPainter.Antialiasing, on=True)
        #     painter.setPen(Qt.NoPen)
        #     painter.setBrush(QBrush(QColor(67,79,70), style=Qt.SolidPattern))
        #     painter.drawEllipse(rect3)
        #
        #     painter.setRenderHints(hints)
        #     painter.setPen(pen)
        #     painter.setBrush(brush)

    def _drawFill(self, painter, rect, item, isHighlighted, highlightColor):
        rect.setLeft(rect.left() + self.COLOR_BAR_WIDTH+1)

        oldPen = painter.pen()

        if isHighlighted:
            rect.setLeft(rect.left() + self.HIGHLIGHTED_FILL_OFFSET)
            if not item.data(renderSetupRoles.NODE_ENABLED):
                painter.drawTiledPixmap(rect, baseDelegate.BaseDelegate.DISABLED_HIGHLIGHT_IMAGE)
            else:
                painter.fillRect(rect, highlightColor)
            rect.setLeft(rect.left() - self.HIGHLIGHTED_FILL_OFFSET)
        else:
            painter.fillRect(rect, item.data(Qt.BackgroundRole))
            if not item.data(renderSetupRoles.NODE_ENABLED):
                painter.drawTiledPixmap(rect, baseDelegate.BaseDelegate.DISABLED_BACKGROUND_IMAGE)

        # if item.isActive():
        #     painter.setPen(QPen(item.data(renderSetupRoles.NODE_COLOR_BAR), 2))
        #     rect2 = deepcopy(rect)
        #     rect2.setRight(rect2.right() - 1)
        #     rect2.setTop(rect2.top() + 1)
        #     rect2.setBottom(rect2.bottom() - 1)
        #     painter.drawRect(rect2)

        painter.setPen(oldPen)

    def _addActionIcons(self, painter, rect, item, highlightedColor):
        top = rect.top() + (self.ICON_TOP_OFFSET)

        start = self.ACTION_BORDER
        count = item.getActionButtonCount()
        toolbarCount = count
        if item.type() == renderSetup.AKA_SHOT_ASSET_TYPE:
            toolbarCount -= 1

        # draw the darkened toolbar frame
        self.drawToolbarFrame(painter, rect, toolbarCount)

        for iconIndex in range(0, count):
            actionName = item.getActionButton(iconIndex)
            pixmap = None
            drawDisclosure = False
            extraPadding = 0
            checked = False

            borderColor = None
            if (actionName == renderSetup.SET_VISIBILITY_ACTION):
                pixmap = self.VISIBILITY_IMAGE
                checked = item.data(renderSetupRoles.NODE_VISIBLE)
                if checked and item.data(renderSetupRoles.NODE_NEEDS_UPDATE):
                    borderColor = self.INFO_COLOR
            elif (actionName == renderSetup.SET_ENABLED_ACTION):
                pixmap = RenderSetupDelegate.DISABLED_IMAGE
                checked = not item.data(renderSetupRoles.NODE_SELF_ENABLED)
            elif (actionName == renderSetup.SET_ISOLATE_SELECTED_ACTION):
                pixmap = RenderSetupDelegate.ISOLATE_IMAGE
                checked = item.data(renderSetupRoles.NODE_ISOLATE_SELECTED)

            start += self.ACTION_WIDTH + extraPadding
            self.drawAction(painter, actionName, pixmap, rect.right() - start, top, highlightedColor if checked else None, drawDisclosure, borderColor)



    def createEditor(self, parent, option, index):
        """ Creates the double-click editor for renaming render setup entries. The override entry is right aligned. """
        editor = QLineEdit(parent)
        item = self._getItem(index)
        return editor

    def getTextRect(self, rect, item):
        newRect = super(RenderSetupDelegate, self).getTextRect(rect, item)
        newRect.setBottom(rect.bottom() - self.BOTTOM_GAP_OFFSET)
        if item.type() == renderSetup.AKA_SEQUENCE_ASSET_TYPE:
            newRect.setRight(rect.right() - self.LAYER_TEXT_RIGHT_OFFSET)
        elif item.type() == renderSetup.AKA_SHOT_ASSET_TYPE:
            newRect.setRight(rect.right() - self.COLLECTION_TEXT_RIGHT_OFFSET)

        return newRect

    def updateEditorGeometry(self, editor, option, index):
        """ Sets the location for the double-click editor for renaming render setup entries. """
        item = self._getItem(index)
        rect = self.getTextRect(option.rect, item)

        indent = item.depth() * self.treeView().indentation()
        if item.type() == renderSetup.AKA_SEQUENCE_ASSET_TYPE or item.type() == renderSetup.AKA_SHOT_ASSET_TYPE:
            leftOffset = indent + item.data(renderSetupRoles.NODE_HEADING_WIDTH) + self.LEFT_NON_TEXT_OFFSET
            rect.setLeft(leftOffset)

        editor.setGeometry(rect)
