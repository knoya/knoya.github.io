# knoya.github.io
Photo sharing website

Tools:
ffmpeg
exiftool

You need to prepare a configuration file for the photos, for ease of local development I have provided it in photos.js, for actually serving your website you can provide it as json.

For iphone 15 pro max photos:

put your photos into the static/img directory

From the base directory, run the following:

exiftool -json -r ./static/img | jq 'sort_by(.CreateDate)' | jq 'to_entries | map(.value + {Index: .key})' | jq 'map({SourceFile, FileName, FileSize, FileType, Make, Model, Orientation, ExposureTime, FNumber, ISO, CreateDate, ShutterSpeedValue, FocalLength, ImageWidth, ImageHeight, LensModel, Megapixels, GPSAltitude, GPSDateTime, GPSLatitude, GPSLongitude, GPSPosition, Index})' | jq 'to_entries | map(.value + {InfoTitle: "Title", InfoParagraph: "Body text"})' | jq --sort-keys . > photos.js

This generates a configuration based on your photos. There is an entry per photo with which you can manage various parameters like info, display, etc.

Next you probably want to resize your photos to fit the 1gb size limit, run the following and see if the result is acceptable. If not, change the noted value.

if [ ! -d processed ]; then     mkdir -p processed; else echo folder exists; fi && mogrify -path processed -verbose -quality 60 *.JPG;

This results in new smaller (bytes, not dimensions) images in a folder "/processed". Metadata such as EXIF data is preserved. You now can delete the original large photos and copy the new photos from /processed to the base img folder, then delete /processed.

