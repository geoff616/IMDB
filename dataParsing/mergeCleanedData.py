#/usr/local/bin/python

import pandas as pd
import numpy as np

## This script takes the data cleaned by the awk scripts and merges into a tsv
## file to be consumed by the calculateAverages script

# read data cleaned by awk scripts and save merged data
def saveMergedData():
    print 'starting IMDB data merge'

    # load ratings csv
    ratings = pd.read_csv('data/cleanRatings.csv', sep='|', skiprows=2, header=None, encoding='latin1', error_bad_lines=False)
    # set columns
    ratings.columns = ['votes', 'rating', 'title']
    # group by title and drop rows with the same name less than the max votes (gets rid of episode ratings)
    # NOTE: this might be faster with a pivot table
    ratings = ratings.groupby(by=['title'])
    ratings = ratings.apply(lambda g: g[g['votes'] == g['votes'].max()])
    # drop anything with less than 20 votes
    ratings = ratings[ratings.votes > 20]

    print 'parsed ratings'


    # read countries csv
    countries = pd.read_csv('data/cleanCountries.csv', sep='|', skiprows=1, header=None, encoding='latin1', error_bad_lines=False)
    # set columns
    countries.columns = ['title','country']
    # group countries together
    country_pt = countries.pivot_table('country','title', aggfunc=lambda x: '|'.join(x.unique()))
    
    # turn back into datadrame
    countriesGrouped = pd.DataFrame(country_pt)
    # Rename columns
    countriesGrouped.columns = ['countries']
    #convert index to col
    countriesGrouped.reset_index(level=0, inplace=True)


    print 'parsed countries'

    # read genres csv
    genres = pd.read_csv('data/cleanGenres.csv', sep='|', skiprows=2, header=None, encoding='latin1', error_bad_lines=False)
    # set columns
    genres.columns = ['title','genre']

    # group genres together
    genres_pt = genres.pivot_table('genre','title', aggfunc=lambda x: '|'.join(x.unique()))
    
    # turn back into datadrame
    genresGrouped = pd.DataFrame(genres_pt)
    genresGrouped.columns = ['genres']
    #convert index to col
    genresGrouped.reset_index(level=0, inplace=True)

    print 'parsed genres'

    # merge ratings, genres, and countries with 2 inner joins
    merged = pd.merge(left=ratings,right=genresGrouped, how='inner', left_on='title', right_on='title')
    merged = pd.merge(left=merged,right=countriesGrouped, how='inner', left_on='title', right_on='title')
    # drop any rows with missing data - NOTE: should be 0 with inner merge
    merged = merged.dropna(axis=0, how='any', thresh=None, subset=['genres', 'countries'], inplace=False)
    merged.to_csv('cleaned_imdb_merged.tsv',encoding="latin1", sep="\t")

def main():
    saveMergedData()
    print 'done merging'

if __name__ == "__main__":
    main()

