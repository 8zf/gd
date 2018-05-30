const PointCloud = require('./src/pointCloud')
const utils = require('./src/utils')
const argv = require('yargs')
  .alias('i1', 'input1')
  .alias('i2', 'input2')
  .alias('o', 'output')
  .alias('s', 'step')
  .default('s', 20)
  .default('o', './results/' + new Date().toLocaleString() + '.txt')
  .demandOption(['i1', 'i2'])
  .argv

// fittingPointCloud --i1 data/111.txt --i2 data/222/txt -s 5 -o results/asd.txt

/**
 * 选择两个点云，该拼接方法适用于地面点云
 * 读取两个txt文件
 **/
let pointCloud1 = new PointCloud(argv.input1),
  pointCloud2 = new PointCloud(argv.input2)

/**
 * 计算两个点云的bounding box，并计算出其在xy平面上的投影，应得到两个矩形S1和S2
 * 计算两个矩形重叠部分overlap，也应是一个矩形，该重叠部分能够避免遍历全部点云带来的大计算量。存在overlap中的点云实际上并没有重叠的情况，因此不能简单的对overlap中的所有点使用加权平均修正，对于实际未重叠的部分不做修正
 **/
let overlap = utils.overlapRectangles(pointCloud1.getBoxProjectionXY(), pointCloud2.getBoxProjectionXY())
if (overlap === '') {
  console.log.log('no overlap area detected, skip')
  process.exit(0)
}

//let temp1 = new PointCloud(null, pointCloud1.getPointsProjectedOnXY(overlap.left, overlap.right, overlap.bottom, overlap.top))
//let temp2 = new PointCloud(null, pointCloud2.getPointsProjectedOnXY(overlap.left, overlap.right, overlap.bottom, overlap.top))
//let asd = './overlap_part1_ver2.txt'
//let asd2 = './overlap2_part2_ver2.txt'
//console.log('wirte overlap to file')
//temp1.writeToFile(asd)
//temp2.writeToFile(asd2)
//console.log('write done')

// 对于overlap，假定沿x方向，按照步长step形成的小矩形tempSquare（overlap.xLength*step）为单位，获得两个点云中 在xy面的投影在tempSquare内的 所有点，点的查找时间（点云中点一般按照x轴坐标顺序排列）对该步骤的效率有较大的影响
let x
for (let i = 0; x = overlap.left + i * argv.step, x <= overlap.right; i++) {
  /** 合并重叠部分
   *  对于tempSquare，将其中的点云理解为yz平面上的点，根据y坐标判断tempSquare中的重叠部分tempOverlap
   *  对于tempOverlap中的点使用加权平均修正z坐标
   **/
  let part1 = pointCloud1.getPointsProjectedOnXY(x, x + argv.step, overlap.bottom, overlap.top)
  let part2 = pointCloud2.getPointsProjectedOnXY(x, x + argv.step, overlap.bottom, overlap.top)
  //pointCloud1.removePointsProjectedOnXY(x, x + argv.step, overlap.bottom, overlap.top)
  //pointCloud2.removePointsProjectedOnXY(x, x + argv.step, overlap.bottom, overlap.top)
  let result  = utils.weightedAverage(part1, part2)
  if (!result)
    continue
  let newCloud = new PointCloud(null, result[0].concat(result[1]))
  // 移除原点云中重合部分的点
  pointCloud1.removePointsProjectedOnXY(x, x + argv.step, overlap.bottom, overlap.top)
  pointCloud2.removePointsProjectedOnXY(x, x + argv.step, overlap.bottom, overlap.top)
  // 将拟合后的部分写入文件
  newCloud.writeToFile(argv.output)
  newCloud.writeToFile(argv.output.replace(/.txt/, '') + '_newCloud.txt')
}

// 将已处理的重叠部分与两个点云为重叠的部分输出为拼合后点云
console.log('重合部分拟合结果已写入' + argv.output)
// 将未修正的原点云非重叠部分写入文件
pointCloud1.writeToFile(argv.output)
pointCloud1.writeToFile(argv.output.replace(/.txt/, '') + '_oldCloud.txt')
pointCloud2.writeToFile(argv.output)
pointCloud2.writeToFile(argv.output.replace(/.txt/, '') + '_oldCloud.txt')
console.log('非重叠部分已写入 ' + argv.output)
console.log('拟合完毕')
