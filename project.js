let packageNames = [
        "ext_26_1_L_A",
        "ext_26_1_L_D",
        "ext_26_1_R_B",
        "ext_26_1_R_C",
        "ext_26_2_L_A",
        "ext_26_2_L_D",
        "ext_26_2_R_B",
        "ext_26_2_R_C",

    ];
    
    let dataFiles = [
        "packages/ext_26_1_L_A/ext_26_1_L_A20200830T040915.csv",
        "packages/ext_26_1_L_D/ext_26_1_L_D20200830T040915.csv",
        "packages/ext_26_1_R_B/ext_26_1_R_B20200830T040914.csv",
        "packages/ext_26_1_R_C/ext_26_1_R_C20200830T040914.csv",
        "packages/ext_26_2_L_A/ext_26_2_L_A20200830T040911.csv",
        "packages/ext_26_2_L_D/ext_26_2_L_D20200830T040911.csv",
        "packages/ext_26_2_R_B/ext_26_2_R_B20200830T040912.csv",
        "packages/ext_26_2_R_C/ext_26_2_R_C20200830T040912.csv",
    ];

    let numerics = ["magnitude", "raw_magnitude", "amplitude"];
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 200 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;
        
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    let epaochParse = d3.timeParse("%j days %H:%M:%s.%L000000");
    function dataconverter(d){
        numerics.forEach(function (dim) {
                d[dim] = isNumber(d[dim]) ? parseFloat(d[dim]) : null;
        })
        DHMS = d.package_time.split(/ days |:/).map(parseFloat); // array of time elements
        d.ptime_ms = ((((DHMS[0] * 24) + DHMS[1]) * 60 + DHMS[2]) * 60 + DHMS[3]) * 1000;
        d.ptime_DMHS = DHMS
        return d;
    }
// var c1;
// var streamIter;
    let allPromises = dataFiles.map( fn => d3.csv(fn, dataconverter));

    Promise.all(allPromises).then(allData => {

        let threadCF = allData.map(crossfilter);
        crawlup = crawler([700, 200], 14);     

        let svg = d3.select("body").append("svg").attr("width", 200).attr("height", allData.length * 250 + 10) // our svg
        let svg1 = d3.select("body").append("svg").attr("width", 900).attr("height", allData.length * 250 + 10) // our svg
        // let svg1 = d3.select("svg").attr("width", 900).attr("height", 1000);

        // crawl region for one datset
        // let crawlg = crawlup(svg1)

        let crawlgs = threadCF.slice(0,allData.length).map((cxfilter,i) => {
            let cg = crawlup(svg1);

            cfcrawlsetup( cg, cxfilter, yoffset = i*250 )
            boxplot(allData[i], svg, yoffset = i*250, i)
            console.log("index", i)

            cxfilter.onChange(eventType => {
                console.log('data changed:', eventType);
                cfRedraw( cg, cxfilter, svg, i)        
                })
            return cg;

           

        })
        

        let dimensionMagnitudes = threadCF.map((cxfilter, index) => cxfilter.dimension("magnitude"))
        d3.select("body").append("button").text("Change Filter")
            .on("click", d => {                
                console.log(d)
                if( dimensionMagnitudes[0].hasCurrentFilter())
                    dimensionMagnitudes.forEach(d => d.filterAll()) // remove filters
                else
                    dimensionMagnitudes.forEach( dim => dim.filterRange([800,1000]))
            })

        startCrawler();
    });
    

    function cfcrawlsetup( crawlg, cf, yoffset = 100, xoffset = 100 ){
        crawlg.transform(`translate(${xoffset},${yoffset})`)
        crawlg.crawlRect.attr("fill", "lightgrey").style("display","block" )

        // figure out scaling for amplitude

        let yscale = d3.scaleLinear()
                            .domain(d3.extent(cf.all(), d => d.amplitude))
                            .range([0,200])

        crawlg.append("g").attr("id", "ampcircles")
           .selectAll("circle")
            .data(cf.all())
            .enter().append("circle")
            .attr("fill", "red")
            .attr("cx", (d, i) => d.ptime_ms / 200 * 50) // should depend on date
            .attr("cy", d => yscale(d.amplitude))
            .attr("r", 5)

        // should not use d3 axis because the x-extent of the range is not fixed
        let xCount =  cf.all().length
        //let xMax = cf.all()[xCount-1].ptime_ms
        // crawlg.append("g").attr("transform", "translate(0,180)")
        //     .call(d3.axisBottom().scale(d3.scaleLinear()
        //         .range([0, xMax / 200 * 50]).domain([0, xMax])).ticks(xCount))       
    }

    function cfRedraw(crawlg, cf, svg, i){
        console.log(`Size of CF: `,cf.size())
        if (cf.size() >= 4)
        {
            boxplot(cf.all(), svg, yoffset = i*250, i)
        }

        //let cselect = crawlg.select("#ampcircles")
            //.selectAll("circle")
            // .data(cf.allFiltered) 
            // recode this.. bad dependency that data set has not changed
            //.attr("fill", (d,i) => cf.isElementFiltered(i) ? "green" : "brown")

    }

    let crawlerRunning = false;
 
    function toggleCrawler() {
        if (crawlerRunning) {
            stopCrawler();
            document.getElementById("startStopButton").textContent = "Start Crawler";
        } else {
            startCrawler();
            document.getElementById("startStopButton").textContent = "Stop Crawler";
        }
        crawlerRunning = !crawlerRunning;
    }

    function stopCrawler() {
        if (crawlup) {
            crawlup.stop();
            console.log("Crawler stopped");
        }
    }

    function crawlFromSelectedIndex() {
        let selectedIndex = document.getElementById("indexRange").valueAsNumber;

        // Stop the crawler if it's running
        stopCrawler();

        // Call crawltoo with the selected index
        crawlup.crawltoo(selectedIndex)
            .then(() => {
                console.log("Crawled to index:", selectedIndex);
                startCrawler(); // Restart crawling after moving to the selected index
            })
            .catch((reason) => {
                console.log("Failed to crawl:", reason);
            });
    }

    function updateIndexLabel() {
        let indexValue = document.getElementById("indexRange").valueAsNumber;
        document.getElementById("indexLabel").textContent = `Index: ${indexValue}`;
    }
    function startCrawler() {
        if (crawlup) {
            crawlup.cycle();
            console.log("Crawler started");
        }
    }

    var popupDiv
    window.addEventListener('load', (event) => {
        popupDiv = d3.select("body").append("div").attr("id","popupDiv");
        // console.log(popupDiv, "ppp")
    });
    

    function boxplot(table, svg, yoffset, i, xoffset = 0) {    
        // if (i != 6)
        // return


        let dataList = []
        let dataMap = new Map()
        let code = table[0]['threadline']
 
        for ( var i = 0; i < table.length; i ++) {
            let attribute = Number(table[i]['amplitude'])
               
            dataMap[code] = dataMap[code] || []
            dataMap[code].push(attribute)
        }

        let min = d3.min(dataMap[code])
        let max =  d3.max(dataMap[code])

        dataList.push({
            code: table[0]['threadline'],
            q1: d3.quantile( dataMap[code], 0.25),
            q3: d3.quantile(dataMap[code], 0.75),
            median: d3.quantile(dataMap[code], 0.5),
            max : d3.max(dataMap[code]),
            min : d3.min(dataMap[code]),
        })

        svg.append("rect")
            .attr("x", xoffset)
            .attr("y", yoffset)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "lightgrey")

        // Add X axis
        var x = d3.scaleBand()
                    .domain(table[0]['threadline'])
                    .range([ 0, width])
                    .padding(0.5);


        svg.append("g")
                .attr("transform", "translate("+ xoffset + "," + Number(yoffset+height) + ")")
                .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
                .domain([min, max])
                .range([ height, 0]);

        svg.append("g")
            .attr("transform", "translate("+ xoffset + "," + Number(yoffset) + ")")
            .selectAll("vertLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code) + x.bandwidth()/2)})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth()/2)})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("stroke", "black")
            
        //q1
        svg.append("g")
            .attr("transform", "translate("+ xoffset + "," + Number(yoffset) + ")")
            .selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.code))})
            .attr("y", function(d){return(y(d.median))})
            .attr("height", function(d){return(y(d.q1)-y(d.median))})
            .attr("width", x.bandwidth() )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function(event,d) {
                console.log(event,d)
            popupDiv.transition()
                .duration(200)
                .style("opacity", .9);
            popupDiv.html("Q3 : " + d.q3  + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
            popupDiv.transition()
                .duration(500)
                .style("opacity", 0);
            });

            //q3
        svg.append("g")
            .attr("transform", "translate("+ xoffset + "," + Number(yoffset) + ")")
            .selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.code))})
            .attr("y", function(d){return(y(d.q3))})
            .attr("height", function(d){return(y(d.median)-y(d.q3))})
            .attr("width", x.bandwidth() )
            .attr("stroke", "black")
            .style("fill", "darkseagreen")
            .on("mouseover", function(event,d) {
                console.log(event,d)
                popupDiv.transition()
                 .duration(200)
                 .style("opacity", .9);
                popupDiv.html("Q3 : " + d.q3 + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                     .style("left", (event.pageX) + "px")
                     .style("top", (event.pageY - 28) + "px");
             })
            .on("mouseout", function(d) {
                popupDiv.transition()
                 .duration(500)
                 .style("opacity", 0);
            });

        // Show the median
        svg.append("g")
            .attr("transform", "translate("+ xoffset + "," + Number(yoffset) + ")")
            .selectAll("medianLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code))})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.median))})
            .attr("y2", function(d){return(y(d.median))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
            popupDiv.transition()
                .duration(200)
                .style("opacity", .9);
            popupDiv.html("Median: " + d.median)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
            popupDiv.transition()
                .duration(500)
                .style("opacity", 0);
            });

                // Show the max
        svg.append("g")
            .attr("transform", "translate("+ xoffset + "," + Number(yoffset) + ")")
            .selectAll("maxLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code))})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.max))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
                popupDiv.transition()
                .duration(200)
                .style("opacity", .9);
                popupDiv.html("Max: " + d.max)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                popupDiv.transition()
                .duration(500)
                .style("opacity", 0);
            });

            //min
        svg.append("g")
            .attr("transform", "translate("+ xoffset + "," + Number(yoffset) + ")")
            .selectAll("minLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code))})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.min))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
            popupDiv.transition()
                .duration(200)
                .style("opacity", .9);
            popupDiv.html("Min: " + d.min)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
            popupDiv.transition()
                .duration(500)
                .style("opacity", 0);
            });
    }