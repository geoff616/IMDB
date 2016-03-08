# IMDB
This repo is a work in progress of some analysis and visualization of [data from IMDB](http://www.imdb.com/interfaces). 

I am interested in understanding the relationship between movies' IMDB ratings, the genre, and the country of origin. 

`parsingData` contains some Awk and Python scripts that parse the source data and generate aggregations that are used by the visualizations in the `app` frontend. 

The main visualization is a force directed graph, with nodes of countries/genres and edges of country-genre pairs. With all of the edges, the graph isn't very informative, and I'm currently working on adding some filters to the UI that will let a user specify which relationships they are interested in seeing (highest of lowest rated) or the nodes of interest (certain countries or genres).

##Installing:
- __download source data:__ currently using three files from the IMDB FTP server - ftp://ftp.fu-berlin.de/pub/misc/movies/database/ - and these files need to be downloaded, unzipped, and put in the `dataParsing/data` directory
  1. ratings.list.gz
  2. genres.list.gz
  3. countries.list.gz

- __parse source data:__ The script `runDataParsing.sh` needs to be executable (`chmod +x runDataParsing.sh` on Linux/OSX)
```
$ cd dataParsing
$ runDataParsing.sh
```
- __Install frontend dependencies:__ 
```
$ cd app
$ npm install
```

##Running: 
To start the local dev server:
```
$ cd app
$ npm start
```
