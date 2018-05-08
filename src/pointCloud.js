const fs = require('fs')
const path = require('path')
const Point = require('./point')
const Rectangle = require('./rectangle')
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
      console.log(`bounding box:
    x: ${this.boundingBox.minx} -> ${this.boundingBox.maxx} \t diff: ${this.boundingBox.maxx - this.boundingBox.minx}
    y: ${this.boundingBox.miny} -> ${this.boundingBox.maxy} \t diff: ${this.boundingBox.maxy - this.boundingBox.miny}
    z: ${this.boundingBox.minz} -> ${this.boundingBox.maxz} \t diff: ${this.boundingBox.maxz - this.boundingBox.minz}`)
      console.log('projerction on XY surface: ')
      console.log(this.projectionXY)
    }
    else if (!file && points) {
      this.points = points
      this.getBoundingBox()
      this.getBoxProjectionXY()
    }
    else
      return
  }
  getBoundingBox() {
    if (this.boundingBox) {
      return this.boundingBox
    }
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
    if (this.projectionXY)
      return this.projectionXY
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
