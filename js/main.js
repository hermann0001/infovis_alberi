const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;
const spacing = width / 10;
const fruitColors = ["#FF6347", "#FFA500", "#FF69B4", "#9ACD32", "#8A2BE2", "#D40820"];


d3.json("data/dataset.json").then(data => {

  const trunkScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.trunk))
    .range([40, 120]);

  const crownScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.crown))
    .range([40, 100]);

  const fruitScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.fruit))
    .range([5, 20]);

  const rootScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.root))
    .range([10, 40]);

  // assing each fruit a random color and position in crown
  data.forEach(d => {
    d.fruitColors = fruitColors[Math.floor(Math.random() * fruitColors.length)];

    const angle = Math.random() * 2 * Math.PI;
    const radius = (crownScale(d.crown) / 2) * Math.random();
    d.fruitOffsetX = Math.cos(angle) * radius;
    d.fruitOffsetY = Math.sin(angle) * radius;
  });

  const treeGroup = svg.selectAll("g.tree")
    .data(data, d => d.id)
    .join("g")
    .attr("class", "tree")
    .attr("transform", (d, i) => `translate(${spacing * i + spacing / 2}, ${height / 2})`);

  // draw trunk
  treeGroup.append("rect")
    .attr("class", "trunk")
    .attr("x", -5)
    .attr("width", 10)
    .attr("y", d => -trunkScale(d.trunk))
    .attr("height", d => trunkScale(d.trunk))
    .attr("fill", "#8b4513")
    .on("click", () => sortBy("trunk"));

  // draw crown
  treeGroup.append("circle")
    .attr("class", "crown")
    .attr("cy", d => -trunkScale(d.trunk) - crownScale(d.crown) / 2 + 4)
    .attr("r", d => crownScale(d.crown) / 2)
    .attr("fill", "#228B22")
    .on("click", () => sortBy("crown"));

  // draw fruit 
  treeGroup.append("circle")
    .attr("class", "fruit")
    .attr("r", d => fruitScale(d.fruit))
    .attr("cy", d => {
      const crownRadius = crownScale(d.crown) / 2;
      const fruitRadius = fruitScale(d.fruit);
      const trunkTop = -trunkScale(d.trunk);
      const cx = Math.max(- (crownRadius - fruitRadius), Math.min(d.fruitOffsetX || 0, crownRadius - fruitRadius));
      // Using Pythagoras theorem to keep fruit inside crown circle:
      // y = sqrt(r^2 - x^2) and shifted vertically by crown center + trunk top
      const offsetY = Math.sqrt((crownRadius - fruitRadius) ** 2 - cx ** 2);
      return trunkTop - crownRadius + offsetY;
    })
    .attr("cx", d => {
      const crownRadius = crownScale(d.crown) / 2;
      const fruitRadius = fruitScale(d.fruit);
      // Clamp fruitOffsetX to stay inside the crown boundary (± max horizontal offset)
      const maxOffsetX = crownRadius - fruitRadius;
      const offsetX = Math.max(-maxOffsetX, Math.min(d.fruitOffsetX || 0, maxOffsetX));
      return offsetX;
    })
    .attr("fill", d => d.fruitColors)
    .on("click", () => sortBy("fruit"));

  // draw roots
  treeGroup.append("ellipse")
    .attr("class", "root")
    .attr("cy", 5)
    .attr("rx", d => rootScale(d.root))
    .attr("ry", 8)
    .attr("fill", "#A0522D")
    .on("click", () => sortBy("root"));

  // number the trees
  treeGroup.append("text")
    .attr("class", "tree-id")
    .text(d => d.id)
    .attr("text-anchor", "middle")
    .attr("y", d => 30)
    .attr("font-size", "12px")
    .attr("fill", "black")

  function sortBy(key) {
    const sorted = [...data].sort((a, b) => a[key] - b[key]);
    console.log("sorted by:", key, sorted);
    svg.selectAll("g.tree")
      .data(sorted, d => d.id)
      .transition()
      .duration(1000)
      .attr("transform", (d, i) => `translate(${spacing * i + spacing / 2}, ${height / 2})`);
  }
});
