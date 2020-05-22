/** This function calls the python get_data function
 *  and returns the json data.
*/
async function get_data_btn() {
    data = await eel.get_data()();
    ndx = crossfilter(data);
    all = ndx.groupAll();

    $(".chart-dimension").empty();
    $(".chart-group").empty();

    $.each(data[0], function(key, value){
        $(".chart-dimension").append($('<option></option>').val(key).html(key));    
        $(".chart-group").append($('<option></option>').val(key).html(key));    
           
    });
    return data
} 

function createChart(type, uid, dim, group, agg, color, width, height) {

    var Dim = ndx.dimension(function(d) {return d[dim];});
    if (agg == "Sum"){
        var Group = Dim.group().reduceSum(function(d) {return d[group];});    
    } else if (agg == "Count") {
        var Group = Dim.group().reduceCount(function(d) {return d[group];});    
    }
    var nonEmptyGroup = remove_emtpy_bins(Group); // to handle null bins

    if (type == "Bar"){
        var barChart  = dc.barChart(uid);
        barChart
            .width(width).height(height)
            .x(d3.scaleBand())
            .xUnits(dc.units.ordinal)
            .brushOn(true)
            .elasticX(true)
            .elasticY(true)
            .dimension(Dim)
            .group(nonEmptyGroup)
            .margins({ top: 10, left: 90, right: 50, bottom: 90 })
            .colors(color)
            .xAxisLabel(dim)
            .yAxisLabel(group)
            .xAxis().ticks(10);
        barChart.render()
    } else if (type == "Row") {
        var rowChart  = dc.rowChart(uid);
        rowChart
            .width(width).height(height)
            .dimension(Dim)
            .group(nonEmptyGroup)
            .elasticX(true)
            .cap(10)
            .ordering(function(d){ return -d.value })
            .margins({ top: 10, left: 90, right: 50, bottom: 90 })
            .colors(color)
            .xAxis().ticks(10);
        rowChart.render()
    } else if (type == "Line - Ordinal") {
        var ordinalLineChart  = dc.lineChart(uid);
        ordinalLineChart 
            .width(width).height(height)
            .x(d3.scaleBand())
            .xUnits(dc.units.ordinal)
            .dimension(Dim)
            .group(nonEmptyGroup)
            .colors(color)
            .xAxisLabel(dim)
            .yAxisLabel(group)
            .margins({ top: 10, left: 90, right: 50, bottom: 90 })
            .xAxis().ticks(10);
        ordinalLineChart.render()
    } else if (type == "Line - Time") {
        var timeLineChart  = dc.lineChart(uid);
        var parseTime = d3.timeParse("%Y-%m-%d");
        data.forEach(function(d) {
            d.date = parseTime(d[dim]);
        });
        var dateDim = ndx.dimension(function(d) {return d.date;}); // Dim uses the parsed date.
        if (agg == "Sum"){
            var dateGroup = dateDim.group().reduceSum(function(d) {return d[group];});    
        } else if (agg == "Count") {
            var dateGroup = dateDim.group().reduceCount(function(d) {return d[group];});    
        }
        var nonEmptyDateGroup = remove_emtpy_bins(dateGroup); // to handle null bins

        var minDate = dateDim.bottom(1)[0].date;
        var maxDate = dateDim.top(1)[0].date;

        timeLineChart
            .width(width).height(height)
            .x(d3.scaleTime().domain([minDate, maxDate]))
            .elasticY(true)
            .dimension(dateDim)
            .group(nonEmptyDateGroup)
            .colors(color)
            .xAxisLabel(dim)
            .yAxisLabel(group)
            .margins({ top: 10, left: 90, right: 50, bottom: 90 })
            .xAxis().ticks(10);
        timeLineChart.render()
    } else if (type == "Pie") {
        var pieChart  = dc.pieChart(uid);
        pieChart
            .width(width).height(height)
            .slicesCap(10)
            .innerRadius(100)
            .dimension(Dim)
            .group(nonEmptyGroup)
            .on('pretransition', function(chart) {
                chart.selectAll('text.pie-slice').text(function(d) {
                    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                })
            });
        pieChart.render()
    } else if (type == "Table") {
        var tableChart = dc.dataTable(uid);
        tableChart
            .dimension(Group)
            .group(function(d) {return "";})
            .size(data.length)
            .columns([
                     function(d) {return d.key;},
                     function(d) {return d.value;}
                    ])
            .renderlet(function (table) {
                       table.selectAll('tbody').classed('table table-sm', true);})
            .order(d3.descending);
        tableChart.render()
    } 
}


function remove_emtpy_bins(source_group){
    return {
        all:function(){
            return source_group.all().filter(function(d){
                return d.value !== 0;
            });
        }
    };
}


$(document).ready(function(){
    var chartNum = 0
    $("#add-chart").on("click", function(){
        chartNum++;
        $(".chart-row").append("<div id='chart' class='chart-area col-auto m-1'><h5 class='title"+chartNum+"'></h5><span class='close'>x</span><a class='config-btn' href='#' data-toggle='modal' data-target='#config-modal'>config</a><div id='chart"+chartNum+"'></div></div>");
        $(".config-btn").on("click", function(){
            uid = $(this).next().attr("id");
            $("#passed-id").text(uid);
        });
    });

    $("#save-title").on("click", function(){
        text = $("#dash-text").val();
        $("#dash_title").text(text);
    });


    $("#save-chart").on("click", function(){
        var uid = $(this).parent().parent().find('#passed-id').text();
        var dim = $(this).parent().parent().find('.chart-dimension').val();
        var group = $(this).parent().parent().find('.chart-group').val();
        var agg = $(this).parent().parent().find('.chart-agg').val();
        var type = $(this).parent().parent().find('.chart-type').val();
        var width = $(this).parent().parent().find('.chart-width').val();
        var height = $(this).parent().parent().find('.chart-height').val();
        var color = $(this).parent().parent().find('.chart-color').val();
        var title = $(this).parent().parent().find('.chart-title').val();

        $('#'+uid).parent().find('h5').text(title);

        createChart(type, "#"+uid, dim, group, agg, color, width, height)

    });

    $(document).on('click','.close',function(){
        $(this).parent().remove();
    });
});

