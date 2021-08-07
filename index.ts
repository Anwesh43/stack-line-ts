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

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }
}