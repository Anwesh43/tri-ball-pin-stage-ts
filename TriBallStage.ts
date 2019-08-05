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

class TriBallStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : TriBallStage = new TriBallStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
