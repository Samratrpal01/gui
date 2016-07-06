var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var ImagesApi = require('../api/images-api');
var DeploymentsApi = require('../api/deployments-api');
var DevicesApi = require('../api/devices-api');
var rootUrl = "http://192.168.99.100";
var deploymentsRoot = rootUrl + ":9080";
var deploymentsApiUrl = deploymentsRoot + "/deployments/api/0.0.1";
var devicesRoot = rootUrl + ":8082";
var devicesApiUrl = devicesRoot + "/api/0.1.0";


var AppActions = {
 
  selectGroup: function(groupId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      groupId: groupId
    })
  },

  selectDevices: function(deviceList) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_DEVICES,
      devices: deviceList
    })
  },

  addToGroup: function(group, deviceList) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_TO_GROUP,
      group: group,
      devices: deviceList
    })
  },

  removeGroup: function(groupId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.REMOVE_GROUP,
      groupId: groupId
    })
  },

  addGroup: function(group, idx) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_GROUP,
      group: group,
      index: idx
    })
  },


  /* General */
  setSnackbar: function(message, duration) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_SNACKBAR,
      message: message,
      duration: duration
    })
  },


  /* Devices */
  getDevices: function () {
    DevicesApi
      .get(devicesApiUrl+"/devices")
      .then(function(devices) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_DEVICES,
          devices: devices
        });
      });
  },

  acceptDevice: function (device, callback) {
    DevicesApi
      .put(devicesApiUrl+"/devices/"+device.id +"/status", {"status":"accepted"})
      .then(function(data) {
        callback();
      })
      .catch(function(err) {
        callback(err);
      });;
  },
  rejectDevice: function (device, callback) {
    DevicesApi
      .put(devicesApiUrl+"/devices/"+device.id +"/status", {"status":"rejected"})
      .then(function(data) {
        callback(data);
      })
      .catch(function(err) {
        callback(err);
      });
  },




  /* Images */
  getImages: function() {
    ImagesApi
      .get(deploymentsApiUrl+'/images')
      .then(function(images) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_IMAGES,
          images: images
        });
      });
  },

  uploadImage: function(meta, callback) {
    ImagesApi
      .post(deploymentsApiUrl+'/images', meta)
      .then(function(data) {
        // inserted image meta data, got ID in return 
        callback(data.location);
      });
  },

  getUploadUri: function(id_url, callback) {
    ImagesApi
      .get(deploymentsRoot + id_url + "/upload?expire=60")
      .then(function(data) {
        var uri = data.uri;
        callback(uri);
      });
  },
  
  doFileUpload: function(uri, image, callback) {
    // got upload uri, finish uploading file
    ImagesApi
      .putImage(uri, image)
      .then(function(data) {
        callback();
      });
  },

  editImage: function(image, callback) {
    ImagesApi
      .putJSON(deploymentsApiUrl + "/images/" + image.id, image)
      .then(function(res) {
        callback();
      });
  },




  /*Deployments */
  getDeployments: function() {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments')
      .then(function(deployments) {
        AppDispatcher.handleViewAction({
          actionType: AppConstants.RECEIVE_DEPLOYMENTS,
          deployments: deployments
        });
      });
  },
  createDeployment: function(deployment, callback) {
    DeploymentsApi
    .post(deploymentsApiUrl+'/deployments', deployment)
    .then(function(data) {
      callback(deploymentsRoot + data.location);
    });
  },
  getSingleDeployment: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id)
      .then(function(data) {
        callback(data);
      });
  },
  getSingleDeploymentStats: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id +'/statistics')
      .then(function(data) {
        callback(data);
      });
  },
  getSingleDeploymentDevices: function(id, callback) {
    DeploymentsApi
      .get(deploymentsApiUrl+'/deployments/'+id +'/devices')
      .then(function(data) {
        callback(data);
      });
  },
  getDeviceLog: function(deploymentId, deviceId, callback) {
    DeploymentsApi
      .getText(deploymentsApiUrl+'/deployments/'+deploymentId +'/devices/'+deviceId +"/log")
      .then(function(data) {
        callback(data);
      });
  },
     
  saveSchedule: function(schedule, single) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SAVE_SCHEDULE,
      schedule: schedule,
      single: single
    })
  },





  removeDeployment: function(deploymentId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.REMOVE_DEPLOYMENT,
      id: deploymentId
    })
  },

  updateFilters: function(filters) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_FILTERS,
      filters: filters
    })
  },

  updateDeviceTags: function(id, tags) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_DEVICE_TAGS,
      id: id,
      tags: tags
    })
  },

  sortTable: function(table, column, direction) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SORT_TABLE,
      table: table,
      column: column,
      direction: direction 
    })
  },


setLocalStorage: function(key, value) {
  AppDispatcher.handleViewAction({
      actionType: AppConstants.SET_LOCAL_STORAGE,
      key: key,
      value: value
    })
  }
}

module.exports = AppActions;