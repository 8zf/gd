const PointCloud = require('./../src/pointCloud')
let input = '../data/333.txt'
let output = '../results/flip_333.txt'

let pc = new PointCloud(input)
for (let i in pc.points) {
  //沿X轴180度翻转，y = -y, z = -z
  pc.points[i].y = -pc.points[i].y
  pc.points[i].z = -pc.points[i].z
}

pc.writeToFile(output)
