const fs = require('fs')
const Point = require('../src/point')
const pointCloud = require('../src/pointCloud')

let x = new pointCloud('../data/111.txt')

x.getBoundingBox()
x.getBoxProjectionXY()
let start = 1827189, end = 1827389
let y = x.getPointsBetweenX(start, end)
console.log(`${y.length} points between ${start} ${end}
sample points:
${y[0].x}
${y[1000].x}
${y[5000].x}
`)
