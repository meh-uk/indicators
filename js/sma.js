(function (HC) {
		/***
		
		Each indicator requires mothods:
		
		- getDefaultOptions() 							- returns object with default parameters, like period etc.
		- getValues(chart, series, options) - returns array of calculated values for indicator
		- getGraph(chart, series, options) 	- returns path, or columns as SVG elemnts to add.
																					Doesn't add to chart via renderer! 
		
		***/
		
		/***
		indicators: [{
		    id: 'series-id',
		    type: 'sma',
		    params: {
		        period: 'x',
		        n: 'y'
		    },    
		    styles: {
		        lineWidth: 'x',
		        strokeColor: 'y'
		    }
		}]
		
		***/
		
		var merge = HC.merge,
				isArray = HC.isArray;
		
		Indicator.sma = {
				getDefaultOptions: function(){
						return {
								period: 5
						};
				},
				getValues: function(chart, series, options) {
						var utils = this.utils,
                params = options.params,
                period = params.period,
                xVal = series.processedXData,
                yVal = series.processedYData,
                yValLen = yVal ? yVal.length : 0,
                range = 1,
                xValue = xVal[0],
                yValue = yVal[0],
                SMA = [],
                xData = [],
                yData = [],
                index = -1,
                point,i,points,
                SMAPoint;

           //switch index for OHLC / Candlestick / Arearange
           if(isArray(yVal[0])) {
              index = params.index ? params.index : 0;
              yValue = yVal[0][index];
           }
           // starting point
           points = [[xValue, yValue]];
					 
           // accumulate first N-points
           while(range != period){
							 utils.accumulateAverage(points, xVal, yVal, range, index); 
							 range ++; 
           }
           
           // calculate value one-by-one for each perdio in visible data
					 for(i = range; i < yValLen; i++ ){
							 SMAPoint = utils.populateAverage(points, xVal, yVal, i, period, index);
							 SMA.push(SMAPoint);
							 xData.push(SMAPoint[0]);
							 yData.push(SMAPoint[1]);	
							 
							 utils.accumulateAverage(points, xVal, yVal, i, index); 
					 }
           
					 SMAPoint = utils.populateAverage(points, xVal, yVal, i, period, index);
					 SMA.push(SMAPoint);
					 xData.push(SMAPoint[0]);
					 yData.push(SMAPoint[1]);
					 
					 return {
					 	 values: SMA,
					 	 xData: xData,
					 	 yData: yData
					 };
				}, 
				getGraph: function(chart, series, options, values) {
					 var path = [],
					 		 attrs = {},
							 xAxis = series.xAxis,
							 yAxis = series.yAxis,
							 sma = values,
							 smaLen = sma.length,
							 smaX,
							 smaY,
               i;
							 
					 attrs = merge({
							 'stroke-width': 2,
							 stroke: 'red',
							 dashstyle: 'Dash'
					 },  options.styles);	 
					 
					 path.push('M', xAxis.toPixels(sma[0][0]), yAxis.toPixels(sma[0][1])); 
							 
					 for(i = 0; i < smaLen; i++){
					 	 	smaX = sma[i][0];
					 	 	smaY = sma[i][1];
					 	 	
					 		path.push('L', xAxis.toPixels(smaX), yAxis.toPixels(smaY));
					 }
							 
					 return chart.renderer.path(path).attr(attrs);
				},
				utils: {
						accumulateAverage: function(points, xVal, yVal, i, index){ 
								var xValue = xVal[i],
                    yValue = index < 0 ? yVal[i] : yVal[i][index],
                    pLen =  points.push([xValue, yValue]);
						},
						populateAverage: function(points, xVal, yVal, i, period, index){
								var pLen = points.length,
										smaY = this.sumArray(points) / pLen,
										smaX = xVal[i-1];
										
								points.shift(); 				// remove point until range < period

								return [smaX, smaY];
						},
						sumArray: function(array){
							  // reduce VS loop => reduce
								return array.reduce(function(prev, cur) {
										return [null, prev[1] + cur[1]];
								})[1];
						}
				}
		};
})(Highcharts);
