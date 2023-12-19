var ee = require('@google/earthengine');
const { json } = require('body-parser');
const {make_map_image}=require('./map_images');

async function calculateArea(districtName) {
    return new Promise(async (resolve, reject) => {
      try {
        if(districtName){

        
    var districts =  ee.FeatureCollection("users/karanknit/india_dist_sorted");
    var ROI =  districts.filter(ee.Filter.eq('DISTRICT',districtName));
    var landarea = ROI.geometry().area().divide(10000).getInfo();
    console.log("land area "+landarea);
    
    var start = '2018-08-10';
    var end = '2018-08-23';
    var scale = 10
    var export_folder = 'FloodMapping'
    
    var flooded= make_map_image(ROI, start, end, scale, export_folder)
    
    
                    //B. Mask out permanent/semi-permanent water bodies
                    var permanentWater = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select('seasonality').gte(10).clip(ROI)
    
                    flooded = flooded.where(permanentWater, 0).selfMask()
    
                    //C. Mask out areas with steep slopes
                    var slopeThreshold = 5
                    var terrain = ee.Algorithms.Terrain(ee.Image("WWF/HydroSHEDS/03VFDEM"))
                    var slope = terrain.select('slope')
                    flooded = flooded.updateMask(slope.lt(slopeThreshold))
    
                    //D. Remove isolated pixels
                    var connectedPixelThreshold = 8
                    var connections = flooded.connectedPixelCount()
                    flooded = flooded.updateMask(connections.gt(connectedPixelThreshold))
                    var stats = flooded.multiply(ee.Image.pixelArea()).multiply(0.0001).reduceRegion({
                      
                        reducer : ee.Reducer.sum(),
                        geometry :ROI,
                        scale :10,
                        maxPixels :1e12,
                    }
                    )
                    
                    var ret=stats.get('flood_sum').getInfo();
                    console.log(ret)
        resolve({"landarea":landarea,"floodAreaHa":ret})};
    } catch (error) {
      // If an error occurs during execution, reject the promise with the error.
      reject(error);
    }
  }
  );
}

module.exports = calculateArea;