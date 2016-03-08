#/usr/local/bin/python

## This script takes the output of mergeCleanedData.py and calculates different averages
## for movies by country and genres

import pandas as pd
from collections import Counter
import simplejson as json

# helper function to calculate averages in counters
def calculateAverageRatings(counters):
    for counter in counters:
        for key in counter.keys():
            counter[key]['avgRating'] = counter[key]['totalRating'] / counter[key]['count'] 

def increment_counter(counter, key_name, rating):
    if key_name in counter:
        counter[key_name]['count'] +=1
        counter[key_name]['totalRating'] += rating
    else:
        counter[key_name] = {}
        counter[key_name]['count'] = 1
        counter[key_name]['totalRating'] = rating


# take merged IMDB data, calculate average ratings and save in global allCounts
def calculate_ratings(merged, slice_name, all_counts):

    # define counters
    country_counter = Counter()
    genre_counter = Counter()
    country_genre_counter = Counter()
    all_counter = Counter()

    #loop over DataFrame
    for r in zip(merged['genres'], merged['countries'], merged['rating']):
        # split strings of values into arrays
        genres = r[0].split('|')
        countries = r[1].split('|')
        rating = r[2]
        
        #increment 
        increment_counter(all_counter, 'all_movies', rating)

        # loop over each country
        for country in countries:
            increment_counter(country_counter, country, rating)
                
            
            #loop over each genre
            for genre in genres:
                increment_counter(genre_counter, genre, rating)
            
                # create composite key
                country_genre = country + '|' + genre
                increment_counter(country_genre_counter, country_genre, rating)


    calculateAverageRatings([all_counter, country_counter, genre_counter, country_genre_counter])
    toSave = {
        'allMovies': all_counter['all_movies'],
        'countryMovies': country_counter,
        'genreMovies': genre_counter,
        'countryGenreMovies': country_genre_counter
    }

    all_counts[slice_name] = toSave
    return all_counts


# global to track different slices of merged

def main():
    print 'Starting to count things'
    # global to track different slices of merged
    all_counts = {}

    merged = pd.read_csv('cleaned_imdb_merged.tsv', sep='\t', header=0, encoding = 'latin1', error_bad_lines=False)

    all_counts = calculate_ratings(merged, "allMovieRatings", all_counts)   

    ## TODO: add different slices

    # Ideas:
    # top 10k movies
    # bottom 10k movies
    # top 1k movies in each genre
    # more than x ratings

    f = open('IMDBdata.json', 'w+')
    dumped = json.dump(all_counts, f)        
    f.close()

    print 'Done counting things'


if __name__ == "__main__":
    main()     
  
