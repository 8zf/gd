module.exports = class Point {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }
  getXYProjection() {
    return [this.x, this.y]
  }
  getXZProjection() {
    return [this.x, this.z]
  }
  getYZProjection() {
    return [this.y, this.z]
  }
}
