/* globals evt, FakeGattServer, uuid, FakeGattService, BluetoothGattService */
'use strict';

(function(exports) {
  var GattService;
  // XXX: detect if we are able to use BluetoothGattService
  // and use FakeGattService if it is not ready
  (function() {
    try {
      new BluetoothGattService(false, uuid.v4());
      GattService = BluetoothGattService;
    } catch (e) {
      GattService = FakeGattService;
    }
  }());

  /**
   * @class GattServerManager
   * @requires  {@link https://github.com/broofa/node-uuid|uuid}
   * @requires  {@link https://github.com/gaia-components/evt|evt}
   * @fires GattServerManager#connection-state-changed
   */
  var GattServerManager = function() {};
  GattServerManager.prototype = evt({
    _bluetoothManager: undefined,
    _gattServer: undefined,

    init: function(bluetoothManager) {
      this._bluetoothManager = bluetoothManager;

      this.handleDefaultAdapterReady = this.onDefaultAdapterReady.bind(this);
      this._bluetoothManager.on('default-adapter-ready',
        this.handleDefaultAdapterReady);
    },

    handleDefaultAdapterReady: undefined,
    onDefaultAdapterReady: function(detail) {
      var adapter = detail.adapter;
      // we'll fake BluetoothGattServer until API is ready
      this._gattServer = adapter.gattServer || FakeGattServer;
      this._gattServer.addEventListener('connectionstatechanged', this);
      this._gattServer.addEventListener('attributereadreq', this);
      this._gattServer.addEventListener('attributewritereq', this);
    },

    uninit: function() {
      if (this._gattServer) {
        this._gattServer.removeEventListener(
          'connectionstatechanged', this);
        this._gattServer.removeEventListener('attributereadreq', this);
        this._gattServer.removeEventListener('attributewritereq', this);
        this._gattServer = undefined;
      }
      if (this._bluetoothManager) {
        this._bluetoothManager.off('default-adapter-ready',
        this.handleDefaultAdapterReady);
      }
    },

    /**
     * Connect BLE device with specific address using BLE Server API.
     * @public
     * @method  GattServerManager#connect
     * @param  {String} address - the address of the device we are going to
     *                          connect
     * @return {Promise}
     */
    connect: function(address) {
      if (!this._gattServer) {
        return Promise.reject('gatt server does not exist');
      }
      return this._gattServer.connect(address);
    },

    /**
     * Disconnect BLE device with specific address using BLE Server API.
     * @public
     * @method  GattServerManager#disconnect
     * @param  {String} address - the address of the device we are going to
     *                          disconnect
     * @return {Promise}
     */
    disconnect: function(address) {
      if (!this._gattServer) {
        return Promise.reject('gatt server does not exist');
      }
      return this._gattServer.disconnect(address);
    },

    handleEvent: function(evt) {
      var type = evt.type;
      console.log('receive ' + type + ' from gatt server');
      switch(type) {
        case 'connectionstatechanged':
          /**
           * @event GattServerManager#connection-state-changed
           * @type {Object}
           * @property {String} address - address of the device which has
           *                            connection state changed
           * @property {Boolean} status - true stands for connected and false
           *                            otherwise
           */
          this.fire('connection-state-changed', {
            address: evt.address,
            status: evt.status
          });
          break;
      }
    },

    createEmptyGattService: function(isPrimary) {
      return new GattService(isPrimary, uuid.v4());
    }

  });

  exports.GattServerManager = GattServerManager;
}(window));
