# run cleaning scripts
echo 'starting to clean data'
awk -f cleanIMDBGenres.awk data/genres.list > data/cleanGenres.csv
echo 'genres cleaned'
awk -f cleanIMDBCountries.awk data/countries.list > data/cleanCountries.csv
echo 'countries cleaned'
awk -f cleanIMDBRatings.awk data/ratings.list > data/cleanRatings.csv
echo 'ratings cleaned'
echo 'Done cleaning'
# run merge script
python mergeCleanedData.py
# run script to calculate different averages
python calculateAverages.py

#copy data to app folder
cp ./IMDBdata.json ../app/IMDBdata.json

echo 'All done! Check out IMDBdata.json'