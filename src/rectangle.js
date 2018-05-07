module.exports = class Rectangle {
  // clockwise
  // top: maxy, right: maxx, bottom: miny, left: minx
  constructor(top, right, bottom, left) {
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
  }
}
