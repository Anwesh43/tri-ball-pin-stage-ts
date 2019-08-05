const w : number = window.innerWidth
const h : number = window.innerHeight
const backColor : string = "#212121"
const foreColor : string = "#f44336"
const scGap : number = 0.05
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const scDiv : number = 0.51
const nodes : number = 5
const lines : number = 3
const rFactor : number = 3.2

class TriBallStage {

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
        const stage : TriBallStage = new TriBallStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class ScaleUtil {
    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static scaleFactor(scale : number) : number {
        return Math.floor(scale / scDiv)
    }

    static mirrorValue(scale : number, a : number, b : number) : number {
        const k : number = ScaleUtil.scaleFactor(scale)
        return (1 - k) / a + k / b
    }

    static updateValue(scale : number, dir : number, a : number, b : number) : number {
        return ScaleUtil.mirrorValue(scale, a, b) * dir * scGap
    }
}

class DrawingUtil {

    static drawBallPin(context : CanvasRenderingContext2D, size : number, scale : number) {
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, -size * scale)
        context.stroke()
        context.beginPath()
        context.arc(0, -size * scale, size / rFactor, 0, 2 * Math.PI)
        context.fill()
    }

    static drawRotatingBallPin(context : CanvasRenderingContext2D, sc1 : number, sc2 : number, size : number) {
        var deg : number = 0
        const gapDeg : number = 2 * Math.PI / lines
        for (var i = 0; i < lines; i++) {
            deg += gapDeg * ScaleUtil.divideScale(sc2, i, lines)
            context.save()
            context.rotate(deg)
            DrawingUtil.drawBallPin(context, size, sc1)
            context.restore()
        }
    }

    static drawTBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = foreColor
        context.fillStyle = foreColor
        const gap : number = h / (nodes + 1)
        const size : number = gap / sizeFactor
        context.save()
        context.translate(w / 2, gap * (i + 1))
        DrawingUtil.drawRotatingBallPin(context, sc1, sc2, size)
        context.restore()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += ScaleUtil.updateValue(this.scale, this.dir, 1, lines)
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class TBNode {

    next : TBNode
    prev : TBNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new TBNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawTBNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : TBNode {
        var curr : TBNode = this.prev
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

class TriBall {

    root : TBNode = new TBNode(0)
    curr : TBNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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

    tb : TriBall = new TriBall()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.tb.draw(context)
    }

    handleTap(cb : Function) {
        this.tb.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.tb.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
