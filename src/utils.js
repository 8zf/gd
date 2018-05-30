const Rectangle = require('./rectangle')
const Point = require('./point')
const PointCloud = require('./pointCloud')
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
    //console.log(part1.length + '  ' + part2.length)
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
      x1, x2, y1, y2, z1, z2,
      minSum = part1[0].y + part1[0].z, maxSum = part1[0].y + part1[0].z,
      minSumPoint = part1[0], maxSumPoint = part1[0]

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
    let calcSum = (point, index) => {
      if(point.y >= Math.max(miny1, miny2) && point.y <= Math.min(maxy1, maxy2)) {
        if (point.y + point.z > maxSum) {
          maxSum = point.y + point.z
          maxSumPoint = point
        }
        if (point.y + point.z < minSum) {
          minSum = point.y + point.z
          minSumPoint = point
        }
      }
    }
    part1.forEach(cmp1)
    part2.forEach(cmp2)
    //console.log(`miny1: ${miny1}, miny2: ${miny2}, maxy1: ${maxy1}, maxy2: ${maxy2}`)
    // 筛选重叠区间的点
    // 得到‘距离’最大和最小的点
    part1.forEach(calcSum)
    part2.forEach(calcSum)
    let findClosetPointByY = (part, y) => {
      let minDiff = Math.abs(part[0].y - y)
      let resIndex = 0
      for (let i in part) {
        if(minDiff > Math.abs(part[i].y - y)){
          minDiff = Math.abs(part[i].y - y)
          resIndex = i
        }
      }
      return resIndex
    }
    // 不相交
    if (miny1 >= maxy2 || miny2 >= maxy1)
      return
    // 相交
    else {
      part1.forEach(calcSum)
      part2.forEach(calcSum)
      //console.log(`maxSum: ${maxSum}, minSum: ${minSum}`)
      //overlapStart  = miny1 > miny2 ? part2[findClosetPointByY(part2, part1[indexMin1].y)] : part1[findClosetPointByY(part1, part2[indexMin2].y)]
      //overlapEnd = maxy1 > maxy2 ? part1[findClosetPointByY(part1, part2[indexMax2].y)] : part2[findClosetPointByY(part2, part1[indexMax1])]
      //overlapStart  = miny1 > miny2 ? part1[indexMin1] : part2[indexMin2]
      //overlapEnd = maxy1 > maxy2 ? part2[indexMax2] : part1[indexMax1]
      //miny1 > miny2 ? overlapStart = part1[indexMin1] : overlapStart = part2[indexMin2]
      //maxy1 > maxy2 ? overlapEnd = part2[indexMax2] : overlapEnd = part1[indexMax1]
      overlapStart = minSumPoint
      overlapEnd = maxSumPoint
      x1 = overlapStart.x
      y1 = overlapStart.y
      z1 = overlapStart.z
      x2 = overlapEnd.x
      y2 = overlapEnd.y
      z2 = overlapEnd.z
      //console.log('x1: ' + x1 + ', x2: ' + x2  + ', y1: ' + y1 + ', y2: ' + y2 + ', z1: ' + z1 + ', z2: ' + z2 + '   ' + (y2-y1) + '   ' + (z2-z1))
    }
    // 对重叠区的点进行加权平均修正
    let correctPoint = point => {
      let y = point.y, z = point.z
      if (point.y > y1 && point.y < y2) {
        // 该算式见google doc 里的算法描述
        point.z = (((y-y1) / (y2 - y1)) * z2) + (((y2-y) / (y2 - y1)) * z1)
      }
    }
    part1.forEach(correctPoint)
    part2.forEach(correctPoint)
    return [part1, part2]
  },
  //可以根据包围盒的三个平面来对半分隔点云
  //对于浏河数据，根据yz面来切好一些
  splitPointCloudOnXY(pc, output1, output2) {
  },

  splitPointCloudOnXZ(pc, output1, output2) {
  },

  splitPointCloudOnYZ(pc, output1, output2) {
    let points1 = [], points2 = []
    for (let i in pc.points) {
      if (pc.points[i].x < pc.centerPoint.x) {
        points1.push(pc.points[i])
      } else {
        points2.push(pc.points[i])
      }
    }
    let p1 = new PointCloud(null, points1)
    let p2 = new PointCloud(null, points2)
    p1.writeToFile(output1)
    p2.writeToFile(output2)
  },
  splitPointCloudToThreeFiths(pc, output1, output2) {
    let points1 = [], points2 = []
    let diff = pc.boundingBox.maxx - pc.boundingBox.minx
    for (let i in pc.points) {
      if (pc.points[i].x < pc.boundingBox.minx + 0.6*diff) {
        points1.push(pc.points[i])
      }
    }
    for (let i in pc.points) {
      if (pc.points[i].x > pc.boundingBox.maxx - 0.6*diff) {
        points2.push(pc.points[i])
      }
    }
    let p1 = new PointCloud(null, points1)
    let p2 = new PointCloud(null, points2)
    p1.writeToFile(output1)
    p2.writeToFile(output2)
  },
  insertDeviationToPointCloud(pc){

  }

}
