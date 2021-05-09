let svg = d3.select('svg');
let width = +svg.attr('width');
let height = +svg.attr('height');

let render = data => {
    //Set x,y and color values and margins
    let xValue = d => d.currency;
    let yValue = d => d.lcp;
    let zValue = d => d.network;
    let margin = {top: 100, right: 100, bottom: 100, left: 100};
    let innerWidth = width - margin.left - margin.right;
    let innerHeight = height - margin.top - margin.bottom;

    //Set X and Y Scales
    let xScale = d3.scaleBand()
        .domain(data.map(d => d.currency))
        .range([0, (innerHeight)])
        .padding(0.2);

    let yScale = d3.scaleLinear()
        .domain([d3.max(data, d => d.lcp), d3.min(data, d => d.lcp)])
        .range([0, innerWidth]);

    // Color Scale
    let myColor = d3.scaleOrdinal()
        .domain(['Algorand', 'Bitcoin', 'Cardano', 'Cosmos', 'EOS', 'Ethereum', 'Kyber', 'Lightning', 'Ripple', 'Stellar', 'Tezos'])
        .range(['Blue', 'Green', 'Orange', 'Purple', 'Red', 'Brown', 'Yellow', 'Pink', 'Black', 'Teal', 'Grey']);

    let legend = d3.legendColor()
        .title("Cryptocurrency Network Color Legend")
        .titleWidth(50)
        .scale(myColor);

    svg.append("g")
        .attr("transform", "translate(900, 100)")
        .call(legend);

    let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g').call(d3.axisLeft(yScale));
    g.append('g').call(d3.axisBottom(xScale))
        .attr('transform', `translate(0,${innerHeight})`)
        .attr("font-size", 8);

    //Set Title Axis Labels
    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 20)
        .attr('y', -40)
        .attr('x', 200)
        .text('Crypto Currency Log Closing Price on March 1st, 2021');

    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 20)
        .attr('y', 900)
        .attr('x', 370)
        .text('Cryptocurrency');

    g.append('text')
        .attr('class', 'title')
        .attr("font-size", 20)
        .attr('y', -75)
        .attr('x', -450)
        .attr("transform", "rotate(-90)")
        .text('Log Closing Price');

    // Set bar graph
    const dive = 1.147;

    g.selectAll('rect').data(data)
        .enter().append('rect')
        .attr("x", d => xScale(xValue(d)))
        .attr("y", function(d) {
            if (yValue(d) < 0) {
                return (innerHeight/dive)
            } else {
                return yScale(yValue(d))
            }
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
            if (yValue(d) < 0) {
                return yScale(yValue(d)) - (innerHeight/dive)
            } else {
                return (innerHeight/dive) - yScale(yValue(d))
            }
        })
        .attr("fill", d => myColor(zValue(d)))
        .text(d => "Closing Price: " + d.lcp);

    // Set labels for bar graph
    g.selectAll('.label')
        .data(data)
        .enter().append('text')
        .text((d) => d3.format(".3f")(d.lcp)) //Round to 3 decimals due to excess digits
        .attr('x', d => xScale(xValue(d)))
        .attr("y", function(d) {
            if (yValue(d) < 0) {
                return yScale(yValue(d)) + 15;
            } else {
                return yScale(yValue(d)) - 10;
            }
        })
};

//Import data
d3.csv("CryptoNetwork.csv", function(d) {
    return {
        currency: d["Currency"],
        network: d["Network"],
        lcp: +d["LogClosingPrice"]
    };
}).then(function(data) {
    render(data);
});