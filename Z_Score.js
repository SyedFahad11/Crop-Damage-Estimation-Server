// Functions to compute baseline statistics from S1 time series
var ee = require('@google/earthengine');

// Source: Ben DeVries, DeVries et al. (2020)

// Reference:

// DeVries, B., Huang, C-Q., Armston, J. Huang, W., Jones, J.W. and Lang M.W. 2020. 
//     Rapid and robust monitoring of floods using Sentinel-1 and Landsat data on the Google Earth Engine. 
//     Remote Sensing of Environment, 24:111664, doi:10.1016/j.rse.2020.111664.
//    */

   

function filterOrbit(x, direction) {
    return x.filter(ee.Filter.equals('orbitProperties_pass', direction))
}

function filterMode(x, mode) {
    return x.filter(ee.Filter.equals('instrumentMode', mode))
}
var mode="IW";
var direction='DESCENDING';

function calc_basemean(x, start, end) {

    /* 
    Computes the mean backscatter for a baseline period, given an acquisition mode and orbital direction
    
    Args:
    =====
    x:          A Sentinel-1 ee.ImageCollection
    start:      Start date of baseline period ("YYYY-MM-DD")
    end:        End date of baseline period ("YYYY-MM-DD")
    mode:       Acquisition mode. Can be one of "IW" (default) or "SM"
    direction:  Orbital direction. Can be either "DESCENDING" (default) or "ASCENDING"
    
    Returns:
    ========
    An ee.Image object that represents the mean backscatter for the given baseline period.
    */
    return x
        .filter(ee.Filter.equals('orbitProperties_pass', direction))
        .filter(ee.Filter.equals('instrumentMode', mode))
        .filterDate(start, end)
        .mean()
}

function calc_basesd(x, start, end) {

    /* 
    Computes the standard deviation backscatter for a baseline period, given an acquisition mode and orbital direction
    
    Args:
    =====
    x:          A Sentinel-1 ee.ImageCollection
    start:      Start date of baseline period ("YYYY-MM-DD")
    end:        End date of baseline period ("YYYY-MM-DD")
    mode:       Acquisition mode. Can be one of "IW" (default) or "SM"
    direction:  Orbital direction. Can be either "DESCENDING" (default) or "ASCENDING"
    
    Returns:
    ========
    An ee.Image object that represents the standard deviation backscatter for the given baseline period.
    */
    return x
        .filter(ee.Filter.equals('orbitProperties_pass', direction))
        .filter(ee.Filter.equals('instrumentMode', mode))
        .filterDate(start, end)
        .reduce(ee.Reducer.stdDev())
        .rename(['VV', 'VH', 'angle'])

}
function calc_anomaly(x, start, end) {

    /* 
    Computes the backscatter anomaly for each image in a collection, given a baseline period, acquisition mode and orbital direction
    
    Args:
    =====
    x:          A Sentinel-1 ee.ImageCollection
    start:      Start date of baseline period ("YYYY-MM-DD")
    end:        End date of baseline period ("YYYY-MM-DD")
    mode:       Acquisition mode. Can be one of "IW" (default) or "SM"
    direction:  Orbital direction. Can be either "DESCENDING" (default) or "ASCENDING"
    
    Returns:
    ========
    An ee.ImageCollection object that represents the backscatter anomaly for each image in the input ImageCollection
    */
    var basemean = calc_basemean(x, start, end, mode, direction)
    function _calcanom(y) {

        return y
            .subtract(basemean)
            .set({ 'system:time_start': y.get('system:time_start') })
    }
    return x
        .filter(ee.Filter.equals('orbitProperties_pass', direction))
        .filter(ee.Filter.equals('instrumentMode', mode))
        .map(_calcanom)

}
function calc_zscore(x, start, end) {

    /* 
    Computes the pixelwise backscatter Z-scores for each image in a collection, given a baseline period, acquisition mode and orbital direction
    
    Args:
    =====
    x:          A Sentinel-1 ee.ImageCollection
    start:      Start date of baseline period ("YYYY-MM-DD")
    end:        End date of baseline period ("YYYY-MM-DD")
    mode:       Acquisition mode. Can be one of "IW" (default) or "SM"
    direction:  Orbital direction. Can be either "DESCENDING" (default) or "ASCENDING"
    
    Returns:
    ========
    An ee.ImageCollection object that represents the pixelwise backscatter Z-scores for each image in the input ImageCollection
    */
    var anom = calc_anomaly(x, start, end)
    var basesd = calc_basesd(x, start, end)

    function _calcz(y) {

        return y
            .divide(basesd)
            .set({ 'system:time_start': y.get('system:time_start') })
    }
    return anom.map(_calcz)

}

module.exports={filterOrbit,filterMode,calc_basemean,calc_basesd,calc_anomaly,calc_zscore}
