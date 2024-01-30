import { ILeaferCanvas, IPathDrawer, IPathCommandData, IHitType, INumber, IBoolean, IString, IPathString, IExportFileType, IPointData, ICursorType, IMaskType, IAround, IFindMethod } from '@leafer/interface'
import { Leaf, PathDrawer, surfaceType, dataType, positionType, boundsType, pathType, scaleType, rotationType, opacityType, sortType, maskType, dataProcessor, useModule, rewrite, rewriteAble, UICreator, PathCorner, hitType, strokeType, PathConvert, eraserType, cursorType, autoLayoutType, PathCreator, BoundsHelper } from '@leafer/core'

import { IUI, IShadowEffect, IBlurEffect, IStrokeAlign, IStrokeJoin, IStrokeCap, IBlendMode, IDashPatternString, IShadowString, IGrayscaleEffect, IUIData, IGroup, IStrokeWidthString, ICornerRadiusString, IUIInputData, IExportOptions, IExportResult, IFill, IStroke, IArrowType, IFindUIMethod, IEditSize, ILeafer } from '@leafer-ui/interface'
import { effectType } from '@leafer-ui/decorator'

import { UIData } from '@leafer-ui/data'
import { UIBounds, UIRender } from '@leafer-ui/display-module'

import { Export } from '@leafer-ui/external'


@useModule(UIBounds)
@useModule(UIRender)
@rewriteAble()
export class UI extends Leaf implements IUI {

    @dataProcessor(UIData)
    declare public __: IUIData

    declare public proxyData: IUIInputData // need rewrite getter
    declare public __proxyData?: IUIInputData

    public get app(): ILeafer { return this.leafer && this.leafer.app }

    declare public leafer?: ILeafer
    declare public parent?: IGroup

    public isFrame?: boolean

    declare public children?: IUI[]

    // ---

    // id
    @dataType('')
    public id: IString

    @dataType('')
    public name: IString

    @dataType('')
    public className: IString


    // layer
    @surfaceType('pass-through')
    public blendMode: IBlendMode

    @opacityType(1)
    public opacity: INumber

    @opacityType(true)
    public visible: IBoolean

    @dataType(false)
    public locked: IBoolean

    @sortType(0)
    public zIndex: INumber


    @maskType(false)
    public mask: IBoolean

    @surfaceType('pixel')
    public maskType: IMaskType

    @eraserType(false)
    public eraser: IBoolean


    // position
    @positionType(0)
    public x: INumber

    @positionType(0)
    public y: INumber

    // size
    @boundsType(100)
    public width: INumber

    @boundsType(100)
    public height: INumber

    // scale
    @scaleType(1)
    public scaleX: INumber

    @scaleType(1)
    public scaleY: INumber

    // rotate
    @rotationType(0)
    public rotation: INumber

    // skew
    @rotationType(0)
    public skewX: INumber

    @rotationType(0)
    public skewY: INumber


    @autoLayoutType()
    public around: IAround


    @dataType(false)
    public draggable: IBoolean


    @dataType(false)
    public editable: IBoolean

    @dataType('size')
    public editSize?: IEditSize


    // hit
    @hitType(true)
    public hittable: IBoolean

    @hitType('path')
    public hitFill: IHitType

    @strokeType('path')
    public hitStroke: IHitType

    @hitType(false)
    public hitBox: IBoolean

    @hitType(true)
    public hitChildren: IBoolean

    @hitType(true)
    public hitSelf: IBoolean

    @hitType()
    public hitRadius: INumber

    @cursorType('')
    public cursor: ICursorType | ICursorType[]

    // ---


    // fill

    @surfaceType()
    public fill: IFill

    // stroke

    @strokeType()
    public stroke: IStroke

    @strokeType('inside')
    public strokeAlign: IStrokeAlign

    @strokeType(1)
    public strokeWidth: number | number[] | IStrokeWidthString

    @strokeType('none')
    public strokeCap: IStrokeCap

    @strokeType('miter')
    public strokeJoin: IStrokeJoin

    @strokeType()
    public dashPattern: INumber[] | IDashPatternString

    @strokeType()
    public dashOffset: INumber

    @strokeType(10)
    public miterLimit: INumber

    // load 

    @dataType(false)
    public lazy: IBoolean  // load image / compute paint

    // arrow

    @strokeType('none')
    public startArrow: IArrowType

    @strokeType('none')
    public endArrow: IArrowType

    // corner

    @pathType(0)
    public cornerRadius: number | number[] | ICornerRadiusString

    @pathType()
    public cornerSmoothing: INumber

    // effect

    @effectType()
    public shadow: IShadowEffect | IShadowEffect[] | IShadowString

    @effectType()
    public innerShadow: IShadowEffect | IShadowEffect[] | IShadowString

    @effectType()
    public blur: INumber | IBlurEffect

    @effectType()
    public backgroundBlur: INumber | IBlurEffect

    @effectType()
    public grayscale: INumber | IGrayscaleEffect


    public set scale(value: INumber | IPointData) {
        if (typeof value === 'number') {
            this.scaleX = this.scaleY = value
        } else {
            this.scaleX = value.x
            this.scaleY = value.y
        }
    }

    public get scale(): INumber | IPointData {
        const { scaleX, scaleY } = this
        return scaleX !== scaleY ? { x: scaleX, y: scaleY } : scaleX
    }


    constructor(data?: IUIInputData) {
        super(data)
    }


    // data

    @rewrite(Leaf.prototype.reset)
    public reset(_data?: IUIInputData): void { }


    public set(data: IUIInputData): void {
        Object.assign(this, data)
    }

    public get(): IUIInputData {
        return this.__.__getInputData()
    }

    public createProxyData(): IUIInputData { return undefined }


    // hit rewrite

    public find(_condition: number | string | IFindUIMethod, _options?: any): IUI[] { return undefined }

    public findOne(_condition: number | string | IFindUIMethod, _options?: any): IUI { return undefined }


    // path

    public getPath(curve?: boolean, pathForRender?: boolean): IPathCommandData {
        this.__layout.update()
        let path = pathForRender ? this.__.__pathForRender : this.__.path
        if (!path) {
            path = []
            const { width, height } = this.boxBounds
            if (width || height) this.__drawPathByBox(new PathCreator(path))
        }
        return curve ? PathConvert.toCanvasData(path, true) : path
    }

    public getPathString(curve?: boolean, pathForRender?: boolean): IPathString {
        return PathConvert.stringify(this.getPath(curve, pathForRender))
    }


    public __onUpdateSize(): void {
        if (this.__.__input) {
            const data = this.__
            data.__needComputePaint = true
            if (data.lazy && this.leafer && !this.leafer.canvas.bounds.hit(this.__world)) return
            data.__computePaint()
        }
    }

    public __updateRenderPath(): void {
        if (this.__.path) {
            const data = this.__
            data.__pathForRender = data.cornerRadius ? PathCorner.smooth(data.path, data.cornerRadius, data.cornerSmoothing) : data.path
        }
    }

    public __drawRenderPath(canvas: ILeaferCanvas): void {
        canvas.beginPath()
        this.__drawPathByData(canvas, this.__.__pathForRender)
    }

    public __drawPath(canvas: ILeaferCanvas): void {
        canvas.beginPath()
        this.__drawPathByData(canvas, this.__.path)
    }

    @rewrite(PathDrawer.drawPathByData)
    public __drawPathByData(_drawer: IPathDrawer, _data: IPathCommandData): void { }

    public __drawPathByBox(drawer: IPathDrawer): void {
        const { x, y, width, height } = this.__layout.boxBounds
        if (this.__.cornerRadius) {
            drawer.roundRect(x, y, width, height, this.__.cornerRadius)
        } else {
            drawer.rect(x, y, width, height)
        }
    }


    // create

    public export(filename: IExportFileType | string, options?: IExportOptions | number | boolean): Promise<IExportResult> {
        return Export.export(this, filename, options)
    }

    public clone(): IUI {
        return UI.one(this.toJSON())
    }

    static one(data: IUIInputData, x?: number, y?: number, width?: number, height?: number): IUI {
        return UICreator.get(data.tag || this.prototype.__tag, data, x, y, width, height) as IUI
    }


    public destroy(): void {
        this.fill = this.stroke = null
        super.destroy()
    }

}
