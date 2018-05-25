const fs = require('fs')
const PointCloud = require('../src/pointCloud')
const Point = require('../src/point')

let x = new PointCloud('./data-20180331-085217_reset_to_zero.txt')

//x.resetCenterToZero()
x.rotate(30, 0, 0)
x.writeToFile('./data-20180331-085217_reset_to_zero_x30.txt')
