var inputData = [];
var circles;
var currentData="";
var currentCompare="#All-All";
var currentCompareValue="Everyone";
var svg_width = 600;
var svg_height = 600;
var padding = 100;
var projects = [1, 1.5, 2, 3, 4, 5, 5.5, 6, 6.3, 6.6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var yLeft;

var codes = {
	'Personal Care' : 1.0,
	'Sleeping' : 1.5,
	'Household Activities' : 2.0,
	'Caring Helping HH Members' : 3.0,
	'Caring Helping Non HH Members' : 4.0,
	'Work & Work Related (non-social)' : 5.0,
	'Work (social)' : 5.5,
	'Education (class)' : 6.0,
	'Education (homework/research)' : 6.3,
	'Education (club, music, performance)' : 6.6,
	'Shopping' : 7.0,
	'Professional And Personal Care Services' : 8.0,
	'Household Services' : 9.0,
	'Government Services And Civic Obligations' : 10.0,
	'Eating And Drinking' : 11.0,
	'Socializing Relaxing And Leisure' : 12.0,
	'Sports Excercise And Rec' : 13.0,
	'Religious and Spiritual' : 14.0,
	'Volunteer Activities' : 15.0,
	'Telephone Calls' : 16.0,
	'Travel' : 17.0
}

d3.csv("hours_per_day.csv", function(f) {

	inputData = f;

	inputData.forEach(function (g) {						// Reformat input data
		var format = d3.time.format("%-m/%-d/%y");
        g.Date = format.parse(g.Date);
        g.Duration = Number(g.Duration);
        console.log(g.Date);
    });
    console.log(d3.extent(inputData, function (d) { return d.Date}));


	// ~*~*~*~*~*~~ GETTING PERSONAL DATA SET UP ~*~*~*~*~*~~

	var svgLeft = d3.select("#svgDiv1").append("svg")		// set up left svg body
		.attr("width", svg_width)
		.attr("height", svg_height);



	yLeft = d3.scale.linear()
  		.domain(d3.extent(inputData, function (d) { return d.Duration; })) // define in terms of the data
  		.range([(svg_height - padding), padding]); 		// Seems backwards because SVG is y-down

    var yLeftAxis = d3.svg.axis()
  		.scale(yLeft)         								// x is the d3.time.scale()
  		.orient('left') 									// the ticks go below the graph
  		.ticks(6);        									// specify the number of ticks

	svgLeft.append('g')            							// create a <g> element
  		.attr('class', 'y axis left') 						// specify classes
  		.attr('transform', "translate(" + padding + ",0)")	// put the axis in the right place
  		.call(yLeftAxis);        							// let the axis do its thing


  	var xLeft = d3.time.scale()
  		//.domain(d3.extent(inputData, function (d) { return d.Date}))
  		.domain([new Date(2016,2,6), new Date(2016,2,19)])
  		.range([padding, svg_width - padding]); 

  	var xLeftAxis = d3.svg.axis()
  		.scale(xLeft)
  		.orient('bottom')
  		.tickFormat(d3.time.format("%b, %-m/%-d"))
  		.ticks(15);

  	svgLeft.append('g')
  		.attr('class', 'x axis left')
  		.attr('transform', 'translate(0,' + (svg_height - padding) + ")")
  		.call(xLeftAxis)
  		.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");


        // Add the text label for the x axis
    svgLeft.append("text")
        .attr("x", svg_width / 2)
        .attr("y", svg_height - 20)
        .style("text-anchor", "middle")
        .text("Date");

    // Add the text label for the Y axis
    svgLeft.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", padding/2)
        .attr("x", -(svg_height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Duration (hours)");


	var selectors = [];

	for (i = 0; i < projects.length; i++) {
		var filtered_data = inputData.filter(function(d) { return d.Project == projects[i]});
		var class_name = "class" + i;

		selectors[i] = svgLeft.selectAll("." + class_name)
			.data(filtered_data)
			.enter()
			.append("circle")
			.attr("r", function (d) { return 5; })
			.attr("cx", function (d) { return xLeft(d.Date); })
			.attr("cy", function (d) { return yLeft(d.Duration); })
			.attr("fill", '#'+Math.floor(Math.random()*16777215).toString(16))
			.attr("class", function (d) { return class_name; });
	}

	d3.csv("averages.csv", function(f) {
		averages = f;
		averages.forEach( function (row) {
			var keys = Object.keys(row);
			keys.forEach( function (key) {
				if (key != "Type") {
					row[key] = row[key] / 60.0;
				}
			})
		});
		var svg = d3.selectAll("svg");
		var name = "compare"

		svg.selectAll("." + name)
			.data(averages)
			.enter()
			.append("line")
			.attr("x1", padding)
			.attr("y1", 0)
			.attr("x2", svg_width - padding)
			.attr("y2", 0)
			.attr("stroke-width", 0)
			.attr("stroke", "red")
			.attr("class", "compare")
			.attr("id", function (d) { return d.Type; });
	});

	clearData();
});




// ~*~*~*~*~*~ HELPERS ~*~*~*~*~*~

var clearData = function (selector) {
    d3.selectAll("circle").transition().attr("r", 0);
    currentData = "none";
    document.getElementById("viewing").innerHTML = "Nothing";
    clearCompare();
}

var restoreData = function (selector, value) {
	console.log("Restoring:" + selector);
	d3.selectAll("circle").transition().attr("r", 0);
	d3.selectAll(selector).transition().attr("r", 5);
	document.getElementById("viewing").innerHTML = value;
	currentData = projects[selector.replace(".class","")];
	restoreCompare(currentCompare, currentCompareValue);
}

var clearCompare = function () {
	console.log("Clearing compare");
	d3.selectAll(".compare").transition().attr("stroke-width", 0);
	document.getElementById("comparing").innerHTML = "Nothing";
}

var restoreCompare = function (selector, value) {
	console.log("Restoring compare with " + selector + " " + currentData);
	if (currentData == "none") {
		document.getElementById("comparing").innerHTML = "Nothing-- no data selected";
	} else {
		clearCompare();
		d3.selectAll(selector).transition()
			.attr("y1", function (d) { 
				console.log("set y1 to " + yLeft(Number(d[currentData])));
				return yLeft(Number(d[currentData]));})
			.attr("y2", function (d) { return yLeft(Number(d[currentData]));})
			.attr("stroke-width", "4");
		currentCompare = selector;
		currentCompareValue = value;
		document.getElementById("comparing").innerHTML = currentCompareValue;
	}
} 


clearData();