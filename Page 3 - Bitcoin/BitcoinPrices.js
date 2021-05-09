var render = data => {
    var svg = d3.select('svg'),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    //Set x and y values with the margins
    var xValue = d => d.dater;
    var yValue = d => d.closingprice;
    var margin = {top: 100, right: 100, bottom: 100, left: 100};
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    //Set scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([innerHeight, 0]);

    var g = svg.append('g')
        .attr('transform', `translate(${margin.top}, ${margin.left})`)
        .attr("clip-path", "url(#clip)");

    var yAxis = d3.axisRight(yScale);

    g.append('g')
        .call(yAxis);

    var xAxis = d3.axisBottom(xScale);

    //Set Axis labels
    g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`)
        .attr("font-size", 8);

    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 20)
        .attr('y', innerHeight+50)
        .attr('x', 370)
        .attr('font-family', "Arial, Helvetica, sans-serif")
        .text('Date');

    //Show line graph values
    var lineGenerator = d3.line()
        .curve(d3.curveBasis)
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))

    g.append('path')
        .attr('class', 'line-path')
        .attr('d', lineGenerator(data));

    /////////////////////////////////////////////////////////////////////////////////////// ZOOOOOOOOOOOOOOOOOM ///////////////////////////////////////////////////////////////
/*    var x_axis = g.append("g")
        .attr("class", "axis axis--x")
        .attr("id", 'x_axis')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    var bottomAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
       // Zooming into graph function
    var zoom = d3.zoom()
        .scaleExtent([1, 5])
        .extent([[margin.left, 0], [width - margin.right, height]])
        .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
        .on("zoom", zoomed);

    function zoomed(event,d) {
        var t = event.transform,
            xt = t.rescaleX(xScale);

        var zoomedLine = lineGenerator.x(function (d) {
            return xt(d.dater);
        });

        d3.selectAll("line-path")
            .attr("d", d => zoomedLine(d.closingprice))

        d3.select("#x_axis")
            .call(bottomAxis.scale(xt))
    }

    svg.call(zoom)
        .transition()
        .duration(100)
        .call(zoom.scaleTo, 1, [xScale(Date.UTC(2017, 1, 1)), 0]);*/

    ///////////////////////////////Moving along the axis //////////////////////////////////////////////////////
    var bisect = d3.bisector(function (d) { return d.dater; }).right;

    // Create the circle that travels along the curve of chart
    var focus = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    var focusDate = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("height", "50px")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    var focusClosingPrice = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("height", "50px")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        focus.style("opacity", 1)
        focusDate.style("opacity",1)
        focusClosingPrice.style("opacity",1)
    }

    function mousemove() {
        // recover coordinate we need
        var x0 = xScale.invert(d3.mouse(this)[0]-100); //mouse --> v5 || pointer --> v6
        var qwerty = xScale.invert(682.5);
        var i = bisect(data, x0, 0.1);
        selectedData = data[i]

        console.log(d3.mouse(this)[0]-100);

        focus
            .attr("cx", xScale(selectedData.dater) + 100)
            .attr("cy", yScale(selectedData.closingprice) + 100)

        focusDate
            .html("Date: " + selectedData.dater.toLocaleDateString())
            .attr("x", 500 + 10)
            .attr("y", 500)

        focusClosingPrice
            .html("Closing Price: $" + selectedData.closingprice)
            .attr("x", 500 - 20)
            .attr("y", 500 + 15)
    }
    function mouseout() {
        focus.style("opacity", 0)
        focusDate.style("opacity", 0)
        focusClosingPrice.style("opacity", 0)
    }
}

//Loading data and parsing to set the data to its proper data types
d3.csv("Bitcoin.csv", function(d) {
    return {
        crypto: d["Currency"],
        dater: new Date(d["Date"]),
        closingprice: +d["Closing Price (USD)"],
        open: +d["24h Open (USD)"],
        high: +d["24h High (USD)"],
        low: +d["24h Low (USD)"],
        change: +d["Change%"]*100
    };
}).then(function(data) {
    render(data);
});