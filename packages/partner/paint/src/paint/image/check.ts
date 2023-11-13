
import { ILeaferCanvas } from '@leafer/interface'
import { ImageManager, Platform } from '@leafer/core'

import { IUI, ILeafPaint } from '@leafer-ui/interface'
import { Export } from '@leafer-ui/external'

import { createPattern } from './pattern'

const { abs } = Math

export function checkImage(ui: IUI, canvas: ILeaferCanvas, paint: ILeafPaint, allowPaint?: boolean): boolean {
    const { scaleX, scaleY } = ui.__world

    if (!paint.data || paint.patternId === scaleX + '-' + scaleY) {
        return false
    } else {

        const { data } = paint

        if (allowPaint) {
            if (data.mode !== 'repeat') {
                let { width, height } = data
                width *= abs(scaleX) * canvas.pixelRatio
                height *= abs(scaleY) * canvas.pixelRatio
                if (data.scaleX) {
                    width *= data.scaleX
                    height *= data.scaleY
                }
                allowPaint = width * height > Platform.image.maxCacheSize
            } else {
                allowPaint = false
            }
        }

        if (allowPaint) {
            canvas.save()
            canvas.clip()
            if (paint.blendMode) canvas.blendMode = paint.blendMode
            if (data.opacity) canvas.opacity *= data.opacity
            if (data.transform) canvas.transform(data.transform)
            canvas.drawImage(paint.image.view as any, 0, 0, data.width, data.height)
            canvas.restore()
            return true
        } else {
            if (!paint.style || Export.running) {
                createPattern(ui, paint, canvas.pixelRatio)
            } else {
                if (!paint.patternTask) {
                    paint.patternTask = ImageManager.patternTasker.add(async () => {
                        paint.patternTask = null
                        if (canvas.bounds.hit(ui.__world)) createPattern(ui, paint, canvas.pixelRatio)
                        ui.forceUpdate('surface')
                    }, 300)
                }
            }
            return false
        }
    }
}