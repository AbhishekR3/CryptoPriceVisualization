//https://www.youtube.com/watch?v=xFI-us1moj0 -> Helped with creating multiple individual line graphs

var svg = d3.select('svg');

var width = +svg.attr('width');
var height = +svg.attr('height');

var render = data => {
    //Set x and y values with the margins
    var xValue = d => d.date;
    var yValue = d => d.logclosingprice;
    var colorValue = d => d.cryptoname;
    var margin = {top: 100, right: 300, bottom: 100, left: 100};
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    //Nesting Data to create individual lines
    var nested = d3.nest()
        .key(colorValue)
        .entries(data);

    //Color scale
    var colorScale = d3.scaleOrdinal()
        .domain(nested.map(colorValue))
        .range(d3.schemeCategory10);

    //Set scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([innerHeight, 0]);

    var g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    var yAxis = d3.axisLeft(yScale);

    g.append('g')
        .call(yAxis);

    var xAxis = d3.axisBottom(xScale);

    //gridlines
    var gridlines = d3.axisTop()
        .tickFormat("")
        .tickSize(-innerHeight)
        .scale(xScale);

    svg.append("g")
        .attr("class", "grid")
        .attr('transform', `translate(100,100)`)
        .call(gridlines)
        .call(g => g.select(".domain").remove());

    svg.selectAll('.tick line').attr('opacity', 0.3)

    //Set Axis labels
    g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`)
        .attr("font-size", 8);

    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 25)
        .attr('y', -40)
        .attr('x', 250)
        .text("Price of Cryptocurrency");

    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 20)
        .attr('y', innerHeight+50)
        .attr('x', 370)
        .text('Date');

    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 20)
        .attr('y', -75)
        .attr('x', -500)
        .attr("transform", "rotate(-90)")
        .text('Log of Closing Price');

    //Show line graph values
    var lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))

    g.selectAll('.line-path').data(nested)
        .enter().append('path')
            .attr('class', 'line-path')
            .attr('d', d => lineGenerator(d.values))
            .attr('stroke', d => colorScale(d.key));

    //Create circles for data
    g.selectAll('circle').data(data)
        .enter().append('circle')
        .attr('cy', d=> yScale(yValue(d)))
        .attr('cx', d=> xScale(xValue(d)))
        .attr('r', d=> 0.8)
        .append("title")
        .text(d => "Crypto: " + d.cryptoname + "\nDate: " + xValue(d).toLocaleDateString() + "\nLog Closing Price: " + yValue(d) + "\nClosing Price: " + d.closingprice);

    //Color legend
    var legend = d3.legendColor()
        .title("Cryptocurrency Network Color Legend")
        .titleWidth(50)
        .scale(colorScale);

    svg.append("g")
        .attr("transform", "translate(1050, 100)")
        .call(legend);

};

//Loading data and parsing to set the data to its proper data types
d3.csv("CryptoPrices.csv", function(d) {
    return {
        crypto: d["Currency"],
        cryptoname: d["CurrencyName"],
        date: new Date(d["Date"]),
        closingprice: +d["Closing Price (USD)"],
        logclosingprice: +d["LogClosingPrice"],
        open: +d["24h Open (USD)"],
        high: +d["24h High (USD)"],
        low: +d["24h Low (USD)"]
    };
}).then(function(data) {
    render(data);
});
