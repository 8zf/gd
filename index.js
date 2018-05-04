const PointCloud = require('./src/pointCloud')
const utils = require('./src/utils')
const argv = require('yargs')
  .alias('i1', 'input1')
  .alias('i2', 'input2')
  .alias('o', 'output')
  .alias('s', 'step')
  .default('s', 5)
  .default('o', './results/' + new Date().toLocaleString() + '.txt')
  .demandOption(['i1', 'i2'])
  .argv

// fittingPointCloud --i1 data/111.txt --i2 data/222/txt -s 5 -o results/asd.txt

/**
 * 选择两个点云，该拼接方法适用于地面点云
 **/
let pointCloud1 = new PointCloud(argv.input1),
  pointCloud2 = new PointCloud(argv.input2)

/**
 * 计算两个点云的bounding box，并计算出其在xy平面上的投影，应得到两个矩形S1和S2
 * 计算两个矩形重叠部分overlap，也应是一个矩形，该重叠部分能够避免遍历全部点云带来的大计算量。存在overlap中的点云实际上并没有重叠的情况，因此不能简单的对overlap中的所有点使用加权平均修正，对于实际未重叠的部分不做修正
 **/
let overlap = utils.overlapRectangles(pointCloud1.getBoxXYProjection(), pointCloud2.getBoxXYProjection())

/** 对于overlap，假定沿x方向，按照步长step形成的小矩形tempSquare（overlap.xLength*step）为单位，获得两个点云中 在xy面的投影在tempSquare内的 所有点，点的查找时间（点云中点一般按照x轴坐标顺序排列）对该步骤的效率有较大的影响
 **/
for (let i = 0; overlap.left + i * argv.step <= overlap.right; i++) {
  let part1 = pointCloud1.getPointsBetweenX(overlap.left + i * argv.step, overlap.left + (i+1) * argv.step)
  let part2 = pointCloud1.getPointsBetweenX(overlap.left + i * argv.step, overlap.left + (i+1) * argv.step)
  // 这里有些小疑问，在下面的函数中对Point实例进行更改会反应到实际数组吗
  utils.weightedAverage(part1, part2)
}

/** 合并重叠部分
 *  对于tempSquare，将其中的点云理解为yz平面上的点，根据y坐标判断tempSquare中的重叠部分tempOverlap
 *  对于tempOverlap中的点使用加权平均修正z坐标
 **/

/** 将已处理的重叠部分与两个点云为重叠的部分输出为拼合后点云
 **/

