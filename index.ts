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
const strokeFactor : number = 60

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
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
        context.save()
        context.translate(w / 2, h / 2)
        for (let j = 0; j < lines; j++) {
            const sc1j = ScaleUtil.divideScale(sc1, j, lines)
            context.save()
            context.translate(size / 2 + (w / 2 + size) * ScaleUtil.divideScale(sc2, lines - 1 - j, lines), -context.lineWidth * j)
            context.rotate(deg * ScaleUtil.divideScale(sc1j, 1, 2))
            if (sc1j > 0) {
                DrawingUtil.drawLine(context, 0, 0, 0, -size * ScaleUtil.divideScale(sc1j, 0, 2))
            }
            context.restore()
        }
        context.restore()
    }

    static drawSLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        DrawingUtil.drawStackLine(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }       
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class SLNode {

    prev : SLNode 
    next : SLNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new SLNode(this.i + 1)
            this.next.prev = this 
        }
    }
    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawSLNode(context, this.i, this.state.scale)    
    }

    update(cb : Function) {
        this.state.update(cb)
    }
    
    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SLNode {
        var curr : SLNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class StackLine {
    
    curr : SLNode = new SLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    sl : StackLine = new StackLine()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.sl.draw(context)
    }

    handleTap(cb : Function) {
        this.sl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.sl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}