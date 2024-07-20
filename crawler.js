
// // define the crawler component
// function crawler([width, height], indexpoints = 20) {
//     let inside_nodes = [];
//     let inside_g; // empty selection?
//     let inside_selections = [];
//     let indexlength = width / indexpoints; // distance between ticks

//     function crawl(selection) {
//         let outside = selection.append("g")
//             .attr("class", "crawlbox");
//         let clipid = `clip${width}x${height}`;
//         let crawlRect = outside
//             .append("rect")
//             .attr("class", "crawlBoxRect")
//             .attr("width", width)
//             .attr("height", height)
//             .style("display", "none");

//         outside
//             .append("defs")
//             .append("clipPath")
//             .attr("id", clipid)
//             .append("rect")
//             .attr("width", width)
//             .attr("height", height);
//         let inside = outside.append("g")
//             .attr("clip-path", `url(#${clipid})`)
//             .append("g")
//             .attr("class", "crawler");

//         // add this group to my selection of controlled groups
//         inside_selections.push(inside);
//         inside_nodes.push(inside.node());
//         inside_g = d3.selectAll(inside_nodes);

//         inside.crawlEnclosure = outside; // added to selection object
//         inside.crawlRect = crawlRect; // added to selection object
//         inside.transform = tf => outside.attr("transform", tf); // added to selection object
//         inside.tickActual = inside_tickActual;
//         inside.clockindex = crawl.clockindex; // all insides share the clock

//         inside.controller = crawl; // refer back to my shared crawl controller

//         crawl.reset(); // depends on inside_g being set

//         inside.xpos = xpos; // Adding xpos to the selection object

//         return inside; // selection of this group with methods
//     }

//     let tickcount = 0;

//     function settrans(selection) {
//         selection.attr("transform", `translate(${width - tickcount * indexlength},0)`);
//     }

//     crawl.insides = function () {
//         return inside_selections;
//     };

//     // crawl geometry
//     crawl.capacity = indexpoints;
//     // bounds of the translated clipped region in its own co-ordinates
//     crawl.bounds = function () {
//         return [tickcount * indexlength - width, tickcount * indexlength];
//     };

//     crawl.cycle = function (duration = 1000) {
//         function cycler() {
//             if (this == inside_g.nodes()[0]) tickcount++;
//             d3.active(this)
//                 .call(settrans)
//                 .transition().on("start", cycler); // delay chain until start
//         }
//         inside_g.transition()
//             .duration(duration)
//             .ease(d3.easeLinear)
//             .on("start", cycler); // called for each g 
//     };

//     crawl.stop = function () {
//         inside_g.interrupt();
//     };

//     crawl.crawlers = function () {
//         return inside_selections;
//     };

//     crawl.crawltoo = function (index, duration = 1750) {
//         if (index < tickcount) return; // can't reverse at the moment

//         let allduration = duration * Math.abs(index - tickcount); // this is a const per crawler

//         tickcount = index; // maybe should wait until transition ends non-interrupted for this. timing?

//         return inside_g.transition()
//             .duration(allduration)
//             .ease(d3.easeLinear)
//             .call(settrans)
//             .end(); // promise - rejects if transition is interrupted or value is undefined
//     };

//     crawl.reset = function (clock = 0) {
//         tickcount = clock; // without transition
//         settrans(inside_g);
//     };

//     crawl.clockindex = function (tick = null) {
//         if (tick) {
//             tickcount = tick; // without transition
//             settrans(inside_g);
//         }
//         return tickcount;
//     };

//     crawl.tickactual = function () {
//         let actuals = inside_g.nodes().map(n => n.transform.baseVal.consolidate().matrix.e);
//         actuals.forEach(a => { if (a != actuals[0]) throw Error("crawler transforms out of sync"); });
//         return (width - actuals[0]) / indexlength;
//     };

//     function inside_tickActual() {
//         let transformX = this.node().transform.baseVal.consolidate().matrix.e;
//         return (width - transformX) / indexlength;
//     }

//     function xpos(di) {
//         return di * width / this.capacity;
//     }

//     return crawl;
// }


//Neha's working code /////////////////////////////////////////////

// define the crawler component
// function crawler([width, height], indexpoints = 20) {

//     let inside_nodes = []
//     let inside_g // empty selection?
//     let inside_selections = []
//     let indexlength = width / indexpoints // distance between ticks
//     // let outside_g
//     function crawl(selection) {
//         let outside = selection.append("g")
//             .attr("class", "crawlbox")
//         let clipid = `clip${width}x${height}`
//         let crawlRect = outside
//             .append("rect")
//             .attr("class", "crawlBoxRect")
//             .attr("width", width)
//             .attr("height", height)
//             .style("display", "none");

//         outside
//             .append("defs")
//             .append("clipPath")
//             .attr("id", clipid)
//             .append("rect")
//             .attr("width", width)
//             .attr("height", height);
//         let inside = outside.append("g")
//             .attr("clip-path", `url(#${clipid})`)
//             .append("g")
//             .attr("class", "crawler")

//         // add this group to my selection of controlled groups
//         inside_selections.push(inside)
//         inside_nodes.push(inside.node())
//         inside_g = d3.selectAll(inside_nodes)

//         inside.crawlEnclosure = outside // added to selection object
//         inside.crawlRect = crawlRect // added to selection object
//         inside.transform = tf => outside.attr("transform", tf) // added to selection object
//         inside.tickActual = inside_tickActual
//         inside.clockindex = crawl.clockindex // all insides share the clock

//         inside.controller = crawl // refer back to my shared crawl controller

//         crawl.reset() // depends on inside_g being set

//            console.log("inside",inside)     
//         return inside // selection of this group with methods

//     }

//     let tickcount = 0;
//     function settrans(selection) {
//         selection.attr("transform", `translate(${width - tickcount * indexlength},0)`)
//     }

//     crawl.insides =  function (){
//         return inside_selections
//     }

//     // crawl geometry
//     crawl.capacity = indexpoints
//     // bounds of the translated clipped region in its own co-ordinates
//     // nb this won;t be valid during transitions - almost always??? 
//     // sine we are transitioning to this region - same for all .
//     crawl.bounds = function () {
//         return [tickcount * indexlength - width, tickcount * indexlength]
//     }
//     // can we get the actual transform value? during transitions?

//     crawl.cycle = function (duration = 1000) {
//         function cycler() {
//             if( this == inside_g.nodes()[0]) tickcount++;
//             // console.log(tickcount, this)
//             d3.active(this)
//                 .call(settrans)
//                 .transition().on("start", cycler) // delay chain until start
//         }
//         inside_g.transition()
//                 .duration(duration)
//                 .ease(d3.easeLinear)
//                 .on("start", cycler) // called for each g 
//     }

//     crawl.stop = function () {
//         //d3.interrupt(inside_g.node()) // need to get interrupt working?
//         inside_g.interrupt()
//         // settrans(inside_g)
//     }

//     crawl.crawlers = function () {
//         return inside_selections
//     }
//     // advance to this point in a single transformation, for smooth single stepping

//     /** TODO: tick/index points should be index configurable to match the number
//         of points requested. this could speed up the cycling as well with fewer calls 
//     */
//     // crawl.crawltoo = function (index, duration = 1750 ) {
//     //     // if (index < tickcount) return; // can't reverse at the moment

//     //     let allduration = duration * Math.abs(index - tickcount) // this is a const per crawler
//     //     // console.log(allduration)

//     //     tickcount = index // maybe should wait until transition ends non-interrupted for this. timing?

//     //     return inside_g.transition()
//     //         .duration(allduration)
//     //         .ease(d3.easeLinear)
//     //         .call(settrans)
//     //         .end() // promise - rejects if transition is interrupted or value is undefined
//     // }

//     crawl.crawltoo = function (index, duration = 1750) {
//         let currentIndex = Math.floor((width - inside_g.node().transform.baseVal.getItem(0).matrix.e) / indexlength);

//         let distance = index - currentIndex;
//         let totalDuration = duration * Math.abs(distance);

//         tickcount = index;

//         return new Promise((resolve, reject) => {
//             inside_g.transition()
//                 .duration(totalDuration)
//                 .ease(d3.easeLinear)
//                 .call(settrans)
//                 .on("end", () => {
//                     console.log("Crawled to index:", index);
//                     resolve();
//                 })
//                 .on("interrupt", () => {
//                     console.log("Failed to crawl:", index);
//                     reject("Transition interrupted");
//                 });
//         });
//     };
    
    

    

//     crawl.crawlto = function ( index, duration = 1750 ) {
//         if (index < tickcount) return; // can't reverse at the moment

//         let allduration = duration * Math.abs(index - tickcount) // this is a const per crawler
//         // console.log(allduration)

//         tickcount = index // maybe should wait until transition ends non-interrupted for this. timing?

//         return inside_g.transition()
//             .duration(allduration)
//             .ease(d3.easeLinear)
//             .call(settrans)  // move to current tickcount
//             .end() // promise - rejects/errors if transition is interrupted or value is undefined
//             .then(
//                 value => value,
//                 reason => console.log("reason",reason)
//             )
//             // .catch(reason => console.log("caught"))
//     }

//     crawl.reset = function (clock = 0) {
//         tickcount = clock // without transition
//         settrans(inside_g)
//     }

//     // get/set index/clock
//     crawl.clockindex = function(tick = null) {
//         if(tick){
//             tickcount = tick // without transition
//             settrans(inside_g)
//         }
//         return tickcount
//     }

//     crawl.tickactual = function() {
//         // hack the tweening function to track this value would save cpu cycles
//         // console.log("actual tick", inside_g.attr("transform"))
//         // for (let n of inside_g.nodes()) {
//         //console.log("matrix: ", n.transform.baseVal,
//         //            "offset:", n.transform.baseVal.consolidate().matrix.e,
//         //            "computed tick:", (width-n.transform.baseVal.consolidate().matrix.e)/indexlength)
//         //}
//         // return [(width-n.transform.baseVal.consolidate().matrix.e)/indexlength for n of inside_g.nodes()]
//         let actuals = inside_g.nodes().map(n => n.transform.baseVal.consolidate().matrix.e)
//         actuals.forEach(a => {if (a != actuals[0]) throw Error("crawler transforms out of sync")})
//         return (width-actuals[0])/indexlength

//     }

//     inside_tickActual = function(){
//         // consolidation of matricies might affect transform property - is this needed?
//         // is this buggy?
//         // without consolidation matrix appears to include parent offset too
//         // node e value we want is for the <g> element local transform only...
//         let transformX = this.node().transform.baseVal.consolidate().matrix.e
//         //  console.log("thistick:",this, transformX)
//         // console.log( transformX )
//         return (width-transformX)/indexlength

//     }

//     // drawing sub class methods overlay
//     crawl.xpos = function(di){
//         return di * width / this.capacity
//     }

//     return crawl
// }



//Neha's box plot code///////////////////////////


function crawler([width, height], indexpoints = 20) {
    let inside_nodes = [];
    let inside_g; // empty selection?
    let inside_selections = [];
    let indexlength = width / indexpoints; // distance between ticks

    function crawl(selection) {
        let outside = selection.append("g")
            .attr("class", "crawlbox");
        let clipid = `clip${width}x${height}`;
        let crawlRect = outside
            .append("rect")
            .attr("class", "crawlBoxRect")
            .attr("width", width)
            .attr("height", height)
            .style("display", "none");

        outside
            .append("defs")
            .append("clipPath")
            .attr("id", clipid)
            .append("rect")
            .attr("width", width)
            .attr("height", height);
        let inside = outside.append("g")
            .attr("clip-path", `url(#${clipid})`)
            .append("g")
            .attr("class", "crawler");

        // Add this group to my selection of controlled groups
        inside_selections.push(inside);
        inside_nodes.push(inside.node());
        inside_g = d3.selectAll(inside_nodes);

        inside.crawlEnclosure = outside; // added to selection object
        inside.crawlRect = crawlRect; // added to selection object
        inside.transform = tf => outside.attr("transform", tf); // added to selection object
        inside.tickActual = inside_tickActual;
        inside.clockindex = crawl.clockindex; // all insides share the clock
        inside.controller = crawl; // refer back to my shared crawl controller

        crawl.reset(); // depends on inside_g being set

        // Initialize Box Plot
        initBoxPlot(outside, width, height);

        return inside; // selection of this group with methods
    }

    let tickcount = 0;

    function settrans(selection) {
        selection.attr("transform", `translate(${width - tickcount * indexlength},0)`);
    }

    crawl.insides = function() {
        return inside_selections;
    };

    // crawl geometry
    crawl.capacity = indexpoints;
    // bounds of the translated clipped region in its own coordinates
    crawl.bounds = function() {
        return [tickcount * indexlength - width, tickcount * indexlength];
    };

    crawl.cycle = function(duration = 1000) {
        function cycler() {
            if (this === inside_g.nodes()[0]) tickcount++;
            d3.active(this)
                .call(settrans)
                .transition().on("start", cycler); // delay chain until start
        }
        inside_g.transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .on("start", cycler); // called for each g 
    };

    crawl.stop = function() {
        inside_g.interrupt();
    };

    crawl.crawlers = function() {
        return inside_selections;
    };

    crawl.crawltoo = function(index, duration = 1750) {
        let currentIndex = Math.floor((width - inside_g.node().transform.baseVal.getItem(0).matrix.e) / indexlength);
        let distance = index - currentIndex;
        let totalDuration = duration * Math.abs(distance);
        tickcount = index;

        return new Promise((resolve, reject) => {
            inside_g.transition()
                .duration(totalDuration)
                .ease(d3.easeLinear)
                .call(settrans)
                .on("end", () => {
                    console.log("Crawled to index:", index);
                    resolve();
                })
                .on("interrupt", () => {
                    console.log("Failed to crawl:", index);
                    reject("Transition interrupted");
                });
        });
    };

    crawl.crawlto = function(index, duration = 1750) {
        if (index < tickcount) return; // can't reverse at the moment
        let allduration = duration * Math.abs(index - tickcount); // this is a const per crawler
        tickcount = index; // maybe should wait until transition ends non-interrupted for this. timing?

        return inside_g.transition()
            .duration(allduration)
            .ease(d3.easeLinear)
            .call(settrans)  // move to current tickcount
            .end() // promise - rejects/errors if transition is interrupted or value is undefined
            .then(
                value => value,
                reason => console.log("reason", reason)
            );
    };

    crawl.reset = function(clock = 0) {
        tickcount = clock; // without transition
        settrans(inside_g);
    };

    crawl.clockindex = function(tick = null) {
        if (tick) {
            tickcount = tick; // without transition
            settrans(inside_g);
        }
        return tickcount;
    };

    crawl.tickactual = function() {
        let actuals = inside_g.nodes().map(n => n.transform.baseVal.consolidate().matrix.e);
        actuals.forEach(a => { if (a !== actuals[0]) throw Error("crawler transforms out of sync"); });
        return (width - actuals[0]) / indexlength;
    };

    inside_tickActual = function() {
        let transformX = this.node().transform.baseVal.consolidate().matrix.e;
        return (width - transformX) / indexlength;
    };

    // Drawing sub class methods overlay
    crawl.xpos = function(di) {
        return di * width / this.capacity;
    };

    // Box Plot Initialization Function
    function initBoxPlot(outside, width, height) {
        let margin = { top: 10, right: 20, bottom: 30, left: 40 };
        let boxPlotWidth = width * 0.3;
        let boxPlotHeight = height * 0.4;
        let boxPlotSvg = outside.append("g")
            .attr("class", "boxplot")
            .attr("transform", `translate(${width - boxPlotWidth - margin.right}, ${margin.top})`);

        boxPlotSvg.append("text")
            .attr("class", "boxplot-title")
            .attr("x", boxPlotWidth / 2)
            .attr("y", -margin.top)
            .attr("text-anchor", "middle")
            .text("Amplitude Distribution");

        boxPlotSvg.append("g")
            .attr("class", "axis axis--y");

        boxPlotSvg.append("g")
            .attr("class", "box");
    }

  

    return crawl;
}

