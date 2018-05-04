const Rectangle = require('./rectangle')
const Point = require('./point')
module.exports = {
  test() {
    console.log('excuse me?')
  },
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
    // two arrays of Point in a step tempOverlap
    // find overlapped y1 -> y2 and corresponding z1 & z2
    // go through two parts and correct them using weighted average
  }
}
