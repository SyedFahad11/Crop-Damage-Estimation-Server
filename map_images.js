var ee = require('@google/earthengine');
const {calc_zscore}=require('./Z_Score.js');
var zvv_thd = -2.0
var zvh_thd = -2.0
var rawvh_thd = -22
var smoothing_radius = 50 //(meters)
var smoothing_threshold = 0.6
function make_collections (geom, targstart, targend, basestart, baseend){
    
    //Load S1 collection with filters
    var filters = [
        ee.Filter.listContains("transmitterReceiverPolarisation", "VV"),
        ee.Filter.listContains("transmitterReceiverPolarisation", "VH"),
        ee.Filter.equals("instrumentMode", "IW"),
    ]
    var s1 = ee.ImageCollection('COPERNICUS/S1_GRD').filter(filters).filterBounds(geom)

   

    //function to correct border inaccuracies
    function correctBorders  (image) {

        var maskedImage = (image.updateMask(image.select('VV').gt(-45)))
        return maskedImage
    }

    //create and merge baseline and target period stacks
  var s1_combined = (s1.filterDate(basestart, baseend)
        .merge(s1.filterDate(targstart, targend))
        .map(correctBorders)).sort('system:time_start')
    //    create list of dates and times where images occur

    // filter s1 by ascending and descending
    var s1_asc = s1_combined.filter(ee.Filter.equals('orbitProperties_pass', 'ASCENDING'))
    var s1_dsc = s1_combined.filter(ee.Filter.equals('orbitProperties_pass', 'DESCENDING'))
    //Compute Z-scores per orbital direction and merge into zscore
    var z_iwasc = calc_zscore(s1_asc, basestart, baseend, 'IW', 'ASCENDING')
    var z_iwdsc = calc_zscore(s1_dsc, basestart, baseend, 'IW', 'DESCENDING')

    var z_collection = ee.ImageCollection(z_iwasc.merge(z_iwdsc)).sort('system:time_start')

    return [z_collection, s1_combined]
}

function classify_image(z_image, s1_image){
  


    var vvflag = z_image.select('VV').lte(zvv_thd)
    var vhflag = z_image.select('VH').lte(zvh_thd)

    var rawvhflag = s1_image.select('VH').lte(rawvh_thd)

    var flood_class = (vvflag).add(vhflag).add(rawvhflag).rename(['flood_sum'])
    var bool_map = flood_class.gte(1)

    var smooth = bool_map.focalMean(smoothing_radius,'circle','meters').gt(smoothing_threshold)

    return smooth
}

function make_map_image (roi, start, end, scale, export_folder) {
    var baseline_len=45;
    var basestart = '2018-06-27';
    var baseend = '2018-08-10';

    // console.log('Base Start: ' + basestart + ' Base End: ' + baseend)

    var z_collection, s1_collection;
    //make z and raw s1 collections
     var f_collection= make_collections(roi, start, end, basestart, baseend)
    // z_collecru
    z_collection=f_collection[0];
    s1_collection=f_collection[1];
    var z_image= z_collection.filterDate(start, end).mosaic()
    var s1_image  =s1_collection.filterDate(start, end).mosaic()
    
   

    //classify a flood image
    var flooded = classify_image(z_image, s1_image)
    
    return flooded;


}
module.exports={make_map_image}
