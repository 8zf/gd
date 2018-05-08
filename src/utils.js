const Rectangle = require('./rectangle')
const Point = require('./point')
const fs = require('fs')
module.exports = {
  overlapRectangles(r1, r2) {
    let left = Math.max(r1.left, r2.left),
      right = Math.min(r1.right, r2.right),
      top = Math.min(r1.top, r2.top),
      bottom = Math.max(r1.bottom, r2.bottom)
    if(left >= right || top <= bottom) {
      return ''
    }
    return new Rectangle(top, right, bottom, left)
  },
  weightedAverage(part1, part2) {
    // 修正并返回这些点
    // two arrays of Point in a step tempOverlap, project them on YZ surface (just using Y Z coordinate)
    // find overlapped y1 -> y2 and corresponding z1 & z2
    // go through two parts and correct them using weighted average
    if (part1.length === 0 || part2.length === 0) {
      console.log('no point in part')
      return
    }
    let miny1 = part1[0].y,
      maxy1 = part1[0].y,
      miny2 = part2[0].y,
      maxy2 = part2[0].y,
      indexMin1 = 0,
      indexMax1 = 0,
      indexMin2 = 0,
      indexMax2 = 0,
      overlapStart,
      overlapEnd,
      y1, y2, z1, z2

    // 找出两部分在y轴的边界点，共四个
    let cmp1 = (point, index) => {
      if (point.y < miny1) {
        miny1 = point.y
        indexMin1 = index
      }
      if (point.y > maxy1) {
        maxy1 = point.y
        indexMax1 = index
      }
    }
    let cmp2 = (point, index) => {
      if (point.y < miny2) {
        miny2 = point.y
        indexMin2 = index
      }
      if (point.y > maxy2) {
        maxy2 = point.y
        indexMax2 = index
      }
    }
    part1.forEach(cmp1)
    part2.forEach(cmp2)

    // 不相交
    if (miny1 >= maxy2 || miny2 >= maxy1)
      return
    // 相交
    else {
      overlapStart  = miny1 > miny2 ? part1[indexMin1] : part2[indexMin2]
      overlapEnd = maxy1 > maxy2 ? part2[indexMax2] : part1[indexMax1]
      //miny1 > miny2 ? overlapStart = part1[indexMin1] : overlapStart = part2[indexMin2]
      //maxy1 > maxy2 ? overlapEnd = part2[indexMax2] : overlapEnd = part1[indexMax1]
      y1 = overlapStart.y
      z1 = overlapStart.z
      y2 = overlapEnd.y
      z2 = overlapEnd.z
    }
    // 对重叠区的点进行加权平均修正
    let correctPoint = point => {
      let y = point.y, z = point.z
      if (point.y > y1 && point.y < y2) {
        // 该算式见google doc 里的算法描述
        point.z = (((y-y1) / ((y-y1) + (y2-y))) * z2) + (((y2-y) / ((y-y1) + (y2-y))) * z1)
      }
    }
    part1.forEach(correctPoint)
    part2.forEach(correctPoint)
    return [part1, part2]
  },
  //writeToFile(pointcloud, path) {
  //pointcloud.points.forEach(point => {
  //// 写进文件
  //let line = point.x + ' ' + point.y + ' ' + point.z
  //fs.writeFileSync(pointcloud.srcFile, line)
  //})
  //}
}
