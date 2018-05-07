const fs = require('fs')
const Point = require('./point')
const Rectangle = require('./rectangle')
module.exports = class PointCloud {
  constructor(file) {
    this.points = new Array()
    this.boundingBox = new Array()
    //console.log(file)
    let contents = fs.readFileSync(file, 'UTF-8')
    contents = contents.split('\n')
    contents.forEach((value) => {
      // 逐行读取contents，生成点
      // 记得将字符串转成float
      value = value.split(/[\s]{1,}/)
      this.points.push(new Point(parseFloat(value[0]), parseFloat(value[1]), parseFloat(value[2])))
    })
    console.log('how many points: ' + this.points.length)
  }
  getBoundingBox() {
    this.boundingBox = {}
    if (this.points.length === 0) {
      console.log('initialize point cloud first')
      return null
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
    console.log(`bounding box:
    x: ${minx} -> ${maxx} \t diff: ${maxx - minx}
    y: ${miny} -> ${maxy} \t diff: ${maxy - miny}
    z: ${minz} -> ${maxz} \t diff: ${maxz - minz}`)
    return this.boundingBox
  }
  getBoxProjectionXY() {
    if (this.boundingBox.length === 0)
      this.getBoundingBox()
    // clockwise: top, right, bottom, left
    this.projectionXY = new Rectangle(this.boundingBox.maxy, this.boundingBox.maxx, this.boundingBox.miny, this.boundingBox.minx)
    console.log('projerction on XY surface: ')
    console.log(this.projectionXY)
    return this.projectionXY
  }
  getPointsBetweenX(start, end) {
    let result = new Array()
    result = this.points.filter(point => {
      return (point.x >= start && point.x <= end)
    })
    return result
  }
}
