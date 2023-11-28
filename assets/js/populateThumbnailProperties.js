import { getSourcePhoto } from "./source-photo-data.js";
import { readAndParseExifData, importconfig, getExifPropertyValue, getFlickrPhotoInfo, getFlickrPropertyValue } from "./properties.js";

/**
 * populate properties from the configured datasource for the given thumbnail
 * @param {*} id thumbnail-group-grid id
 */

export async function populateThumbnailProperties(id) {
    // If we have not already stored data for this image then store it now
    if (imageData === null || !imageData.hasOwnProperty(id)) {
        const imageObj = {};
        imageObj["id"] = id;

        const photo = getSourcePhoto(id);
        imageObj["sourceImage"] = photo.file;

        if (photo instanceof File) {
            // Read the photo file and parse EXIF data once
            const exifData = await readAndParseExifData(photo);

            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
                    // Use the parsed EXIF data for each Calscape table column
                    if (column.hasOwnProperty("valuemap")) {
                        const value = getExifPropertyValue(column.name, column.datasources, column.userinterface.multivalue, exifData);
                        if (column.valuemap.hasOwnProperty(value)) {
                            imageObj[column.name] = column.valuemap[value];
                        }
                        else {
                            imageObj[column.name] = value;
                        }
                    }
                    else {
                        imageObj[column.name] = getExifPropertyValue(column.name, column.datasources, column.userinterface.multivalue, exifData);
                    }
                    console.log(column.name + ": " + imageObj[column.name]);
                }
            }
        }
        else {
            console.log(`photo ${id} is from Flickr`);
            const flickrData = await getFlickrPhotoInfo(id, 'flickr.photos.getInfo');
            const flickrExifData = await getFlickrPhotoInfo(id, 'flickr.photos.getExif');
            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
                    if (column.hasOwnProperty("valuemap")) {
                        const value = await getFlickrPropertyValue(column.name, column.datasources, column.userinterface.multivalue, flickrData, flickrExifData);
                        if (column.valuemap.hasOwnProperty(value)) {
                            imageObj[column.name] = column.valuemap[value];
                        }
                        else {
                            imageObj[column.name] = value;
                        }
                    }
                    else {
                        imageObj[column.name] = await getFlickrPropertyValue(column.name, column.datasources, column.userinterface.multivalue, flickrData, flickrExifData);
                    }
                }
            }
        }

        imageData[id] = imageObj;
    } else {
        console.log(`Photo data for selected item ${id} already exists`);
    }
    console.log('Populated image data: ');
    for (const key in imageData) {
        if (imageData.hasOwnProperty(key)) {
            const value = imageData[key];
            console.log(`Key: ${key}, Value:`, value);
        }
    }
}
