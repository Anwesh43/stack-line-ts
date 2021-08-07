const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 3
const lines : number = 5
const scGap : number = 0.15 / (parts * lines)
const delay : number = 20 
const sizeFactor : number = 11.2 
const backColor : string = "#BDBDBD"
const colors : Array<string> = [
    "#1A237E",
    "#EF5350",
    "#AA00FF",
    "#C51162",
    "#00C853"
] 
const deg : number = Math.PI / 2
const strokeFactor : number = 45

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawStackLine(context : CanvasRenderingContext2D, scale : number) {
        const size : number = Math.min(w, h) / sizeFactor 
        const sc1 : number = ScaleUtil.divideScale(scale, 0, parts)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, parts)
        context.save()
        context.translate(w / 2, h / 2)
        for (let j = 0; j < lines; j++) {
            context.save()
            context.translate(size / 2 + (w / 2 + size) * ScaleUtil.divideScale(sc2, parts - 1 - j, parts), -context.lineWidth * j)
            context.rotate(deg * ScaleUtil.divideScale(sc1, 1, 2))
            DrawingUtil.drawLine(context, 0, 0, 0, -size * ScaleUtil.divideScale(sc1, 0, 2))
            context.restore()
        }
        context.restore()
    }

    static drawSLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.fillStyle = colors[i]
        DrawingUtil.drawStackLine(context, scale)
    }
}
