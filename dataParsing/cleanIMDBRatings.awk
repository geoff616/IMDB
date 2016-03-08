#usr/bin/awk -f 
# start parsing at begininng of report
NR == 1, /MOVIE RATINGS REPORT/ { next } {
  # if at end of report, exit script
  if (/^---*/) {
    exit
  }
  gsub(/ {6}[0-9\.\*]{10}/, ""); # get rid of rating distribution
  gsub(/  +/, "|"); # insert sep between name and value
  gsub(/{.*}/, ""); # get rid of episode info inside {}'s
  gsub(/\(V\)/, ""); # get rid of "(V)"
  gsub(/ +/, ""); # get rid of all spaces
  gsub(/"/, ""); # get rid of all "
  gsub(/'/, ""); # get rid of all '
  gsub(/^\|/, ""); # remove leading |

  print;
}

