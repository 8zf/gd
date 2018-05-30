const fs = require('fs')
const path = require('path')
const Point = require('./point')
const Rectangle = require('./rectangle')
const {Matrix} = require('ml-matrix')
module.exports = class PointCloud {
  constructor(file, points) {
    if (file) {
      this.srcFile = path.join(__dirname, file)
      this.points = new Array()
      let contents = fs.readFileSync(file, 'UTF-8')
      contents = contents.split('\n')
      contents.forEach((value) => {
        // 逐行读取contents，生成点
        // 记得将字符串转成float
        value = value.split(/[\s]{1,}/)
        this.points.push(new Point(parseFloat(value[0]), parseFloat(value[1]), parseFloat(value[2])))
      })
      console.log(this.points.length + ' points')
      this.getBoundingBox()
      this.getBoxProjectionXY()
      this.getCenterPoint()
      console.log(`bounding box:
    x: ${this.boundingBox.minx} -> ${this.boundingBox.maxx} \t diff: ${this.boundingBox.maxx - this.boundingBox.minx}
    y: ${this.boundingBox.miny} -> ${this.boundingBox.maxy} \t diff: ${this.boundingBox.maxy - this.boundingBox.miny}
    z: ${this.boundingBox.minz} -> ${this.boundingBox.maxz} \t diff: ${this.boundingBox.maxz - this.boundingBox.minz}`)
      console.log('projerction on XY surface: ')
      console.log(this.projectionXY)
    }
    else if (!file && points) {
      //console.log('init pc without file but points')
      this.points = points
      this.getBoundingBox()
      this.getCenterPoint()
      this.getBoxProjectionXY()
    }
    else
      return
  }
  getBoundingBox() {
    if ((!this.points) || this.points.length === 0) {
      console.log('there is no point, initialize point cloud first')
      return
    }
    let minx = this.points[0].x, miny = this.points[0].y, minz = this.points[0].z, maxx = this.points[0].x, maxy = this.points[0].y, maxz = this.points[0].z
    this.points.forEach(point => {
      if (point.x < minx)
        minx = point.x
      if (point.x > maxx)
        maxx = point.x
      if (point.y < miny)
        miny = point.y
      if (point.y > maxy)
        maxy = point.y
      if (point.z < minz)
        minz = point.z
      if (point.z > maxz)
        maxz = point.z
    })
    // 返回？
    this.boundingBox = {
      minx: minx,
      maxx: maxx,
      miny: miny,
      maxy: maxy,
      minz: minz,
      maxz: maxz
    }
    return this.boundingBox
  }
  getBoxProjectionXY() {
    //if (this.projectionXY)
    //return this.projectionXY
    if (!this.boundingBox)
      this.getBoundingBox()
    if (!this.boundingBox) {
      console.log('can\'t not get projection')
      return
    }
    // clockwise: top, right, bottom, left
    this.projectionXY = new Rectangle(this.boundingBox.maxy, this.boundingBox.maxx, this.boundingBox.miny, this.boundingBox.minx)
    return this.projectionXY
  }
  getPointsProjectedOnXY (minx, maxx, miny, maxy) {
    let result = new Array()
    result = this.points.filter(point => {
      return (point.x >= minx&& point.x <= maxx && point.y >= miny && point.y <= maxy)
    })
    return result
  }
  removePointsProjectedOnXY (minx, maxx, miny, maxy) {
    this.points = this.points.filter(point => {
      return !(point.x >= minx&& point.x <= maxx && point.y >= miny && point.y <= maxy)
    })
  }

  flipXAxis180() {
    for (let i in this.points) {
      //沿X轴180度翻转，y = -y, z = -z
      this.points[i].y = -this.points[i].y
      this.points[i].z = -this.points[i].z
    }
  }

  getCenterPoint() {
    let x = (this.boundingBox.minx + this.boundingBox.maxx) / 2,
      y = (this.boundingBox.miny + this.boundingBox.maxy) / 2,
      z = (this.boundingBox.minz + this.boundingBox.maxz) / 2
    this.centerPoint = new Point(x, y, z)
    //console.log('center point: ' + this.centerPoint.x + ', ' + this.centerPoint.y + ', ' + this.centerPoint.z)
    return this.centerPoint
  }
  resetCenterToZero() {
    // 计算出中心点并以此为根据平移到原点
    if (!this.centerPoint)
      this.getCenterPoint()
    for (let i in this.points) {
      this.points[i].x = this.points[i].x - this.centerPoint.x
      this.points[i].y = this.points[i].y - this.centerPoint.y
      this.points[i].z = this.points[i].z - this.centerPoint.z
    }
  }
  move(x, y, z) {
    for (let i in this.points) {
      this.points[i].x = this.points[i].x + x
      this.points[i].y = this.points[i].y + y
      this.points[i].z = this.points[i].z + z
    }
  }
  rotate(xAngle, yAngle, zAngle) {
    // xyz angle采用角度制，0~360度,计算的时候使用弧度
    let pi = 2 * Math.asin(1)

    xAngle = (xAngle * pi) / 180
    yAngle = (yAngle * pi) / 180
    zAngle = (zAngle * pi) / 180

    let xMatrix = new Matrix([[1, 0, 0],[0, Math.cos(xAngle), Math.sin(xAngle)],[0, -Math.sin(xAngle), Math.cos(xAngle)]]),
      yMatrix = new Matrix([[Math.cos(yAngle), 0, -Math.sin(yAngle)],[0, 1, 0],[Math.sin(yAngle), 0, Math.cos(yAngle)]]),
      zMatrix = new Matrix([[Math.cos(zAngle), Math.sin(zAngle), 0],[-Math.sin(zAngle), Math.cos(zAngle), 0],[0, 0, 1]])

    for (let i in this.points) {
      let tmp = new Matrix([[this.points[i].x, this.points[i].y, this.points[i].z]])
      let res = tmp.mmul(xMatrix).mmul(yMatrix).mmul(zMatrix).to1DArray()
      this.points[i].x = res[0]
      this.points[i].y = res[1]
      this.points[i].z = res[2]
    }
  }
  writeToFile(fileName) {
    if ((!this.points) || this.points.length === 0) {
      console.log('no points to write')
      return
    }
    for (let i in this.points) {
      fs.appendFileSync(fileName, this.points[i].x + ' ' + this.points[i].y + ' ' + this.points[i].z + '\n')
    }
  }
}
