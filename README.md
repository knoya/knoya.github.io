# knoya.github.io
Photo sharing website

Tools:
ffmpeg
exiftool

You need to prepare a configuration file for the photos, for ease of local development I have provided it in photos.js, for actually serving your website you can provide it as json.

For iphone 15 pro max photos:

In the folder, run the following:

exiftool -json -r . | jq 'sort_by(.SourceFile)' | jq 'to_entries | map(.value + {Index: .key})' | jq 'map({SourceFile, FileName, FileSize, FileType, Make, Model, Orientation, ExposureTime, FNumber, ISO, CreateDate, ShutterSpeedValue, FocalLength, ImageWidth, ImageHeight, LensModel, Megapixels, GPSAltitude, GPSDateTime, GPSLatitude, GPSLongitude, GPSPosition, Index})' | jq 'to_entries | map(.value + {InfoTitle: "Title", InfoParagraph: "Body text"})' | jq --sort-keys . > photos.js

jq 'to_entries | map(.value + {title: "Title", paragraph: "Body text"})'