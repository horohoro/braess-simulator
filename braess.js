/** Possibles improvements
 * - Add a higher insentive to take the bridge on the day it's built (a lot of people would like to take what's new
 * - Add a higher insentive to take the faster road when picking a new one (to emulate the fact that citizen talk to each other to share tips
 * - The graphical interface is too oriented for the specific case of 4 points and the predefined functions (if one road goes above 45min, the colors will no longer make sense
**/

Array.newZeroMatrix = function(length) {
	var result = new Array(length)
	for (var i=0; i<length;i++) {
		result[i] = new Array(length).fill(0)
	}
	return result
}

Array.prototype.clone = function() {
	return this.slice(0);
};

Array.prototype.equal = function(a) {
	var result = Array.isArray(a) && (a.length === this.length)
	if (result) {
		for (var i = 0; i < this.length; i++) {
			if (a[i] != this[i]) {
				result = false
				break
			}
		}
	}
	return result
}

Array.prototype.includeArray = function(a) {
	return this.some(element => element.equal(a))
}

class Graph {
	constructor(funGraph){ //2D square matrix of int => float graph. Every driver starts from the 0th node and wants to end at "length-1"th node.
		this.funGraph = funGraph
		this.nbOfNodes = funGraph.length
		this.loadGraph = Array.newZeroMatrix(this.nbOfNodes)
		this.timeGraph = Array.newZeroMatrix(this.nbOfNodes)
		
		this.listOfRoads = this.listRoads()
		this.listOfRoadTimes = new Array(this.listOfRoads.length).fill(0)
	}
	
	listRoads() {
		var result = []
		
		function listRoadsRec(path,graph) {
			var currentNode = path[path.length-1]
			for (var i =0; i < graph.nbOfNodes; i++) {
				if (typeof graph.funGraph[currentNode][i] !== "undefined" &&
					!(path.includes(i))) { // could DP but it would be too much memory to have to duplicate an array of position that were visited
					
					var newPath = path.clone()
					newPath.push(i)
					
					if (i == graph.nbOfNodes-1) {
						result.push(newPath)
					} else {
						listRoadsRec(newPath,graph)
					}
				}
			}
		}
		
		listRoadsRec([0],this)
		
		return result
	}
	
	computeTime() {
		for (var i = 0; i < this.nbOfNodes; i++) {
			for (var j = 0; j < this.nbOfNodes; j++) {
				if (typeof this.funGraph[i][j] !== "undefined") {
					this.timeGraph[i][j] = this.funGraph[i][j](this.loadGraph[i][j])
				}
			}
		}
	}
	
	computeTimeEachRoad() {
		var numberOfRoads = this.listOfRoads.length
		while (this.listOfRoadTimes.length > numberOfRoads) {
			this.listOfRoadTimes.pop()
		}
		while (this.listOfRoadTimes.length < numberOfRoads) {
			this.listOfRoadTimes.push(0)
		}
		for (var j = 0; j < numberOfRoads; j++) {
			var result = 0
			for (var i = 0; i < (this.pickedRoad.length - 1); i++){
				result += this.graph.timeGraph[this.listOfRoads[j][i]][this.listOfRoads[j][i+1]]
			}
			this.listOfRoadTimes[j] = result
		}
	}
}

class Driver {
	constructor(graph,id) {
		this.timeOnOptimalRoad = Infinity
		this.currentTime = Infinity
		this.optimalRoad = [] //also the favorite road
		this.pickedRoad = []
		this.graph = graph
		this.id = id
	}
	
	pickARoad(changeOfMindRate) {
		var random = Math.random()
		
		if (!(this.graph.listOfRoads.includeArray(this.optimalRoad))) { // People forget the bridge entirely as soon as it disappear
			this.timeOnOptimalRoad = Infinity
			this.currentTime = Infinity
		}
		
		if (this.optimalRoad.equal([]) ||
			!(this.graph.listOfRoads.includeArray(this.optimalRoad)) || // highly complicated way to know if the last picked road is in the list of road
			random < changeOfMindRate) {
			
			this.logIfNumberOne('Let\'s take a new road !')
			
			this.pickedRoad = this.graph.listOfRoads[Math.floor(Math.random()*this.graph.listOfRoads.length)] // pick road randomly. Can possible pick the same road again. Could pick segment randomly instead of roads.
		} else {
			
			this.logIfNumberOne('Selected the same road')
			
			this.pickedRoad = this.optimalRoad.clone()
		}
		
		// update load with the picked road
		for (var i = 0; i < (this.pickedRoad.length - 1); i++){
			this.graph.loadGraph[this.pickedRoad[i]][this.pickedRoad[i+1]]++
		}
	}
	
	updateInformation() {
		this.currentTime = this.computeTime()
		
		if (this.optimalRoad.equal(this.pickedRoad)) {
			this.logIfNumberOne('Same road => Update time')
			this.timeOnOptimalRoad = this.currentTime
		} else {
			
			this.logIfNumberOne(`The last time of a good road took: ${this.timeOnOptimalRoad}`)
			this.logIfNumberOne(`The last road that was picked was: ${this.optimalRoad}`)
			this.logIfNumberOne(`This time the road picked is: ${this.pickedRoad}`)
			this.logIfNumberOne(`It took: ${this.currentTime}`)
			
			if (this.currentTime < this.timeOnOptimalRoad) {
				this.logIfNumberOne('Faster ! New favorite road')
				this.optimalRoad = this.pickedRoad.clone()
				this.timeOnOptimalRoad = this.currentTime
			} else {
				// else nothing, the driver goes back to its previous road until he changes is mind again.
				this.logIfNumberOne('Slower ! Go back to previous road')
			} 
		}
	}
	
	computeTime() {
		var result = 0
		
		for (var i = 0; i < (this.pickedRoad.length - 1); i++){
			result += this.graph.timeGraph[this.pickedRoad[i]][this.pickedRoad[i+1]]
		}
		
		return result
	}
	
	logIfNumberOne(log) {
		/*if (this.id === 1) { 
			console.log(log)
		}*/
	}
}

const CHANGE_OF_MIND_RATE = 0.01
const NUMBER_OF_DRIVERS = 400
const MIN_WIDTH = 1
const MAX_WIDTH = 15

const largeRoadFun = x => 45
const smallShortcutFun = x => x/10
const bridgeFun = x => 0

function computeNextDay(graph,drivers) {
	graph.loadGraph = Array.newZeroMatrix(graph.nbOfNodes)
	drivers.forEach(function(driver, index){ 
		driver.pickARoad(CHANGE_OF_MIND_RATE)
	})
	graph.computeTime()
	drivers.forEach(function(driver, index){ 
		driver.updateInformation()
	})
}

function computeSwitchBridge(graph) {
	var result
	if (typeof graph.funGraph[1][2] === "undefined") {
		graph.funGraph[1][2] = bridgeFun
		graph.funGraph[2][1] = bridgeFun
		result = 1
	} else {
		graph.funGraph[1][2] = undefined
		graph.funGraph[2][1] = undefined
		result = 0
	}
	graph.listOfRoads = graph.listRoads()
	return result
}

var bFunGraph = 
[[undefined, smallShortcutFun, largeRoadFun, undefined], // 0
[undefined, undefined, undefined /*no bridge*/, largeRoadFun], // 1
[undefined, undefined /*no bridge*/, undefined, smallShortcutFun], // 2
[undefined, undefined, undefined, undefined]] // 3

var bGraph = new Graph(bFunGraph)

var drivers = new Array(NUMBER_OF_DRIVERS)
for (var i = 0; i < drivers.length ; i++) {
	drivers[i] = new Driver(bGraph,i)
}

function resetLayout(cy){
	var positionX = [10,50,50,90]
	var positionY = [50,40,60,50]
	for (var i = 0; i < bGraph.nbOfNodes; i++){
		var position = {
			x: Math.round(window.innerWidth*positionX[i]/100),
			y: Math.round(window.innerHeight*positionY[i]/100),
		}
		cy.$id(i.toString()).position(position)
	}
}

document.addEventListener('DOMContentLoaded', function () {
	
	// Add nodes
	var nodeElements = []
	for (var i = 0; i < bGraph.nbOfNodes; i++){
		nodeElements.push({
			data: {
				id : i.toString(),
			},
		})
	}
	
	var cy = window.cy = cytoscape({
		container: document.getElementById('cy'),

		style: [
			{
				selector: 'node',
				style: {
					'content': 'data(id)',
					'label': 'data(id)',
				}
			},

			{
				selector: 'edge',
				style: {
					'curve-style': 'bezier',
					'target-arrow-shape': 'triangle',
					'content': 'data(id)',
					'label': 'data(label)',
					'text-wrap': 'wrap',
				}
			},
		],
		
		elements: {
			nodes: nodeElements
		},
		
		layout: {
			name: 'null'
		}
	});
	
	// Add edges
	for (var i = 0; i < bGraph.nbOfNodes; i++){
		for (var j = 0; j < bGraph.nbOfNodes; j++){
			if (typeof bGraph.funGraph[i][j] !== "undefined") {
				var edge = {
					group: 'edges',
					data: {
						id : `${i}to${j}`,
						source: i.toString(),
						target: j.toString(),
					}
				}
				cy.add(edge)
				updateEdge(cy.$id(`${i}to${j}`), {
					fun: bGraph.funGraph[i][j],
					load: 0,
					time: 0,
				})
			}
		}
	}
	
	resetLayout(cy)
});

function nextDayUpdateCy(cy,graph,drivers) {
	computeNextDay(graph,drivers)
	for (var i = 0; i < graph.nbOfNodes; i++){
		for (var j = 0; j < graph.nbOfNodes; j++){
			if (typeof graph.funGraph[i][j] !== "undefined") {
				updateEdge(cy.$id(`${i}to${j}`), {
					load: graph.loadGraph[i][j],
					time: graph.timeGraph[i][j],
				})
			}
		}
	}
	updateStats(drivers)
}

function switchBridgeUpdateCy(cy,graph) {
	if (computeSwitchBridge(graph) === 1) {
		cy.add({
			group: 'edges',
			data: {
				id : '1to2',
				source: '1',
				target: '2',
			}
		})
		updateEdge(cy.$id('1to2'), {
			fun: bGraph.funGraph[1][2],
			load: 0,
			time: 0,
		})
		cy.add({
			group: 'edges',
			data: {
				id : '2to1',
				source: '2',
				target: '1',
			}
		})
		updateEdge(cy.$id('2to1'), {
			fun: bGraph.funGraph[2][1],
			load: 0,
			time: 0,
		})
	} else {
		cy.$id('1to2').remove()
		cy.$id('2to1').remove()
	}
}

function updateEdge(edge,newData) { //{fun: , load: , time: }
	for (key in newData) {
		edge.data(key,newData[key])
	}
	
	if (edge.data('id') == '1to2') {
		edge.data('label',
		`.\n` +
		`\n` +
		`\n` +
		`\n` +
		`\n` +
		`${edge.data('fun')}\n` +
		`${edge.data('load')}\n` +
		`${edge.data('time')}`)
	} else if (edge.data('id') == '2to1') {
		edge.data('label',
		`${edge.data('fun')}\n` +
		`${edge.data('load')}\n` +
		`${edge.data('time')}` +
		`\n` +
		`\n` +
		`\n` +
		`\n` +
		`.\n`)
	} else {
		edge.data('label',				
		`${edge.data('fun')}\n` +
		`${edge.data('load')}\n` +
		`${edge.data('time')}`)
	}
	
	var maxTime = 45 //edge.data('fun')(NUMBER_OF_DRIVERS) // Finally I decided to compare all of them to the same value
	var minTime = 0 //edge.data('fun')(0)
	
	var pourcentageOfTime
	if (maxTime > 0) { 
		pourcentageOfTime = edge.data('time')/maxTime
	} else {
		pourcentageOfTime = 0
	}
	var pourcentageOfDrivers = edge.data('load')/NUMBER_OF_DRIVERS
	
	var colorSaturation = Math.min(Math.round(255*pourcentageOfTime),255)
	var color = [colorSaturation,255-colorSaturation,0]
	var width = Math.round(MIN_WIDTH+(MAX_WIDTH-MIN_WIDTH)*pourcentageOfDrivers)
	
	edge.style('line-color', color)
	edge.style('target-arrow-color', color)
	edge.style('width', width)
}

function updateStats(drivers) { // display and calculation are in the same fuction
	var fastest = Infinity
	var fastestRoad = []
	var slowest = 0
	var average = 0
	var nbOfDrivers = drivers.length
	
	for (var i = 0; i < nbOfDrivers; i++) {
		var driver = drivers[i]
		average += driver.currentTime
		if (driver.currentTime < fastest) {
			fastest = driver.currentTime
			fastestRoad = driver.pickedRoad.clone()
		}
		if (driver.currentTime > slowest) {
			slowest = driver.currentTime
		}
	}
	average /= nbOfDrivers
	
	$("#fastest").text(Math.round(fastest * 100) / 100)
	$("#fastest-road").text(fastestRoad)
	$("#slowest").text(Math.round(slowest * 100) / 100)
	$("#average").text(Math.round(average * 100) / 100)
}

var autoId

document.onkeypress = function (e) {
    e = e || window.event;
	console.log(e.keyCode)
    switch(e.keyCode) {
		case 97: // a = Auto
			if (typeof autoId === "undefined") {
				autoId = setInterval(function(){ nextDayUpdateCy(cy,bGraph,drivers) }, 1000);
			}
			break
		case 99: // c = cancel auto
			if (typeof autoId !== "undefined") {
				clearInterval(autoId)
			}
			autoId = undefined
			break
		case 115: // s = Switch
			switchBridgeUpdateCy(cy,bGraph)
			break
		case 110: // n = next day
			nextDayUpdateCy(cy,bGraph,drivers)
			break
		case 109: // m = multiple next day (10)
			for (var i = 0; i < 10; i++) {
				nextDayUpdateCy(cy,bGraph,drivers)
			}
			break
		case 114: //r = reset layout
			resetLayout(cy)
		default:
			break
	}
};

function findSocialOptimal(funGraph,maxNumberOfDrivers){
	//TODO make it for any number of roads
	var graph = new Graph(funGraph)
	
	for (var i = 0; i < maxNumberOfDrivers; i++) {
		for (var j = 0; j < maxNumberOfDrivers - i; j++) {
			for (var k = 0; k < maxNumberOfDrivers - j - i; k++) {
				for (var l = 0; l < (this.pickedRoad.length - 1); l++){
					this.graph.loadGraph[this.pickedRoad[i]][this.pickedRoad[i+1]] += i
				}
				for (var l = 0; l < (this.pickedRoad.length - 1); l++){
					this.graph.loadGraph[this.pickedRoad[i]][this.pickedRoad[i+1]] += j
				}
				for (var l = 0; l < (this.pickedRoad.length - 1); l++){
					this.graph.loadGraph[this.pickedRoad[i]][this.pickedRoad[i+1]] += k
				}
				for (var l = 0; l < (this.pickedRoad.length - 1); l++){
					this.graph.loadGraph[this.pickedRoad[i]][this.pickedRoad[i+1]] += l
				}
			}
		}
	}
}

/*
computeNextDay(bGraph,drivers)
console.log('========================== DAY 1 ==========================')
console.log(bGraph)
console.log(drivers[0])

for (var i = 0; i < 1000; i++) {
	computeNextDay(bGraph,drivers)
}

console.log('========================== DAY 1000 ==========================')
console.log(bGraph)
console.log(drivers[0])

computeSwitchBridge(bGraph)

for (var i = 0; i < 10000; i++) {
	computeNextDay(bGraph,drivers)
}

console.log('========================== DAY 1000 After Bridge ==========================')
console.log(bGraph)
console.log(drivers[0])
*/