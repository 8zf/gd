const fs = require('fs')
const PointCloud = require('../src/pointCloud')
const Point = require('../src/point')
// 生成在YZ面上投影为直线的点云，精度step，假定在YZ面上投影的方程为 Z = aY + b, X轴宽度width，Y轴范围miny maxy
// aX+bY+cZ+d=0更make sense
const step = 1,
  a1 = 0.5, b1 = 250, width1 = 200,
  a2 = 0.2, b2 = 100, width2 = 200,
  miny1 = -300, maxy1 = 1000,
  miny2 = -1000, maxy2 = 200,
  outputFile1 = './test13.txt',
  outputFile2 = './test23.txt'

let genPointCloud = (a, b, miny, maxy, s, width, o) => {
  for (let i = 0; miny + i * s <= maxy; i++) {
    for (let j = 0; j * s <= width; j++) {
      let cury = miny + i * s, curx = j * s
      let point = {}
      point.x = curx
      point.y = cury
      point.z = a * cury + b
      if (point.x === 1478 && point.y === 100)
        console.log(point)
      fs.appendFileSync(o, point.x + ' ' + point.y + ' ' + point.z + '\n')
    }
  }
}
// lin1
console.log('generate lin1')
genPointCloud(a1, b1, miny1, maxy1, step, width1, outputFile1)
console.log('lin1 generated')
// line2
console.log('generate line2')
genPointCloud(a2, b2, miny2, maxy2, step, width2, outputFile2)
console.log('lin2 generated')
