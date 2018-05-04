const fs = require('fs')
const Point = require('./point')
const Rectangle = require('./rectangle')
module.exports = class PointCloud {
  constructor(file) {
    console.log(file)
    let contents = fs.readFileSync(file)
    console.log(contents)
    // 逐行读取contents，生成点
    this.points = new Array()
    this.points.push(new Point(1, 2, 3))
    this.boundingBox = new Array()
  }
  getBoundingBox() {
    // 返回？
    let minx, miny, minz, maxx, maxy, maxz
    this.boundingBox = [minx, miny, minz, maxx, maxy, maxz]
    return this.boundingBox
  }
  //readFromFile() {}
  getBoxXYProjection() {
    if (this.boundingBox.length === 0)
      this.getBoundingBox()
    return new Rectangle(1,2,3,4)
  }
  getPointsBetweenX(start, end) {

  }
}
