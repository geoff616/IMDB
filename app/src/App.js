import React, { Component } from 'react';
import { Col, Grid, Row, Well } from 'react-bootstrap';
require('!style!css!sass!./main.scss');
require('!style!css!./keen-dashboard.css');
var d3 = require('d3');
var _ = require('lodash');
var crossfilter = require('crossfilter');
var dc = require('dc');

var config = {
  width: 800,
  height: 350,
  containerID: '#force-graph-01',
  dataURL: './IMDBdata.json'
};

export class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      movieData: {}
    };
  }

  componentWillMount() {
    // load data once before component mounts
    this.fetchData();
  }

  componentDidUpdate() {
    //regenerate graph on each update
    d3.select('svg').remove();
    this.generateGraph();
  }

  fetchData() {
    var componentContext = this;
    // load the data
    d3.json(config.dataURL, function (error, json) {
      if (error) {
        console.log('Oh no! An error...');
        console.log(error);
        return;
      }
      // set data to state
      componentContext.setState({
        movieData: json
      });

    });

  }

  applyFilters(data) {

    //TODO: Control these filters from the UI

    var genreCounter = data.allMovieRatings.genreMovies;
    var countryCounter = data.allMovieRatings.countryMovies;
    var countryGenreCounter = data.allMovieRatings.countryGenreMovies;


    // Filter countries with less than X movies
    countryCounter = Object.keys(countryCounter).filter(function(key) {
      //                                 X
      return countryCounter[key].count > 5000;
    }).reduce(function(obj, key){
      // rebuild country counter
      obj[key] = countryCounter[key];
      return obj;
    }, {});
    
   // Remove corresponding edges
    
   countryGenreCounter = Object.keys(countryGenreCounter).filter(function(compKey) {
      var compKeySplit = compKey.split('|');
      var country = compKeySplit[0];
      return countryCounter.hasOwnProperty(country);
    }).reduce(function(obj, key){
      obj[key] = countryGenreCounter[key];
      return obj;
    }, {});
  
//  //TODO: determine if too many edges, maybe cut below a threshold
//  // filter country|genre edges less than average for the country and genre;
//    countryGenreCounter = Object.keys(countryGenreCounter).filter(function(compKey) {
//      var compKeySplit = compKey.split('|');
//      var country = compKeySplit[0];
//      var genre = compKeySplit[1];
//      var compAvg = countryGenreCounter[compKey].avgRating;
//      return compAvg > countryCounter[country].avgRating && compAvg > genreCounter[genre].avgRating;  
//    }).reduce(function(obj, key){
//      obj[key] = countryGenreCounter[key];
//      return obj;
//    }, {});
  
    return {
      countryCounter, 
      genreCounter,
      countryGenreCounter
    };

  }

  shapeData(data) {

    var filteredData = this.applyFilters(data);

    var {
      countryCounter, 
      genreCounter,
      countryGenreCounter
    } = filteredData;

    

    // turn counters into arrays to be consumed by visualization:
    
    var countryArray = Object.keys(countryCounter).map(function(key){
      var obj = countryCounter[key];
      obj.kebab = _.kebabCase(key);
      obj.type = 'country';
      return obj;
    });


    var genreArray = Object.keys(genreCounter).map(function(key){
      var obj = genreCounter[key];
      obj.kebab = _.kebabCase(key);
      obj.type = 'genre';
      return obj;
    });

    
    var countryGenreArray = Object.keys(countryGenreCounter).map(function(key){
      var obj = countryGenreCounter[key];
      var keySplit = key.split('|');
      obj.kebab = _.kebabCase(keySplit[0]) + '|' + _.kebabCase(keySplit[1]);
      return obj;
    });

    // build return object
    return {
      nodes: Array.prototype.concat(countryArray, genreArray),
      edges: countryGenreArray
    };
   
  }

  generateGraph() {

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = parseFloat(config.width - margin.left - margin.right),
        height = parseFloat(config.height - margin.top - margin.bottom);

    var rawData = this.state.movieData;
    if (Object.keys(rawData).length === 0) {
      // NOTE: shouldn't get in here
      console.log('no movieData set!');
      return;
    }

    var data = this.shapeData(rawData);

    var nodes = _.cloneDeep(data.nodes);
    var nodeKeys = data.nodes.map(function (e) {return e.kebab;});
  
    var links = _.cloneDeep(data.edges).map(function (edge) {
      var compKeySplit = edge.kebab.split('|');
      var country = compKeySplit[0];
      var genre = compKeySplit[1];
      var countryPos = nodeKeys.indexOf(country);
      var genrePos = nodeKeys.indexOf(genre);

      return {
        source: countryPos,
        target: genrePos,
        // TODO: confirm this is a good weighting
        value: 10 - edge.avgRating 
      };
    });
     console.log(nodes);
     console.log(links);
    var force = d3.layout.force()
      .nodes(nodes)
      .size([width - 100, height - 100])
      .on('tick', tick)
      .links(links)
      .linkDistance(function (link) {
        return 100;//link.value;
      })
      .charge(function(d) {
        return -100;//d.count;
      })
      .gravity(0.07)
      .start();

    var drag = force.drag()
    .on("drag", dragstart);

    function dragstart(d) {
      console.log('in dragstart');
      console.log(this);
      d3.select(this).classed('fixed', d.fixed = true);
    }


    var graph = d3.select(config.containerID).append('svg')
      .attr('width', width)
      .attr('height', height);
    


    var link = graph.selectAll('.link')
      .data(links)
      .enter()
    .append('svg:line')
      .attr('class', 'link')
//      // NOTE: not sure this is working
//      .style('stroke-width', function(d) {
//        return Math.pow(d.count, 2); 
//      })
//      .attr('x1', function (d) {
//        return d.source.x;
//      }).attr('y1', function (d) {
//        return d.source.y;
//      }).attr('x2', function (d) {
//        return d.target.x;
//      }).attr('y2', function (d) {
//        return d.target.y;
//      });

    var node = graph.selectAll('.node')
        .data(nodes)
      .enter().append('g')
        .attr('class', 'node')
        .attr('class', function (d) {
          return d.type === 'genre' ? 'genre' : 'country';
        })
      .append('circle')
        .attr('r',function (d) {
          return Math.log(d.count);
        })
        .attr('cx', function (d) {
          return d.x;
        }).attr('cy', function (d) {
          return d.y;
        }).append('title').text(function (d) {
          return d.kebab;
        })
        .call(drag);

 
      function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }

  }


  render() {
    return (
      <Grid>
        <Col lg={8}>
          <div className="chart-wrapper">
            <div className="chart-title">
              Movie Genres and Countries
            </div>
            <div className="chart-stage">
              <div id='force-graph-01'></div>
            </div>
            <div className="chart-notes">
              Closer nodes mean higher rated movies for that genre/country pair
            </div>
          </div>
        </Col>
      </Grid>

    )
  }
}
