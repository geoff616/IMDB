#usr/bin/awk -f

# start parsing at begininng of report
NR == 1, /^8: THE GENRES LIST$/ { next } {
  # if at end of report, exit script
  if (/\n/) {
    exit
  }
  gsub(/{.*}/, ""); # get rid of episode info inside {}'s
  gsub(/\(V\)/, ""); # get rid of "(V)"
  gsub(/\t/, "  "); # get rid of tabs and replac with two spaces
  gsub(/  +/, "|"); # insert sep between name and value
  gsub(/ +/, ""); # get rid of all spaces
  gsub(/"/, ""); # get rid of all "
  gsub(/'/, ""); # get rid of all '
  # remove duplicates
  if (x[$0] == 0 ) 
    print
  x[$0]++
}