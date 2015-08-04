(function(exports) {
  'use strict';

  // XXX: this module is copied and modified from
  // apps/settings/js/modules/bluetooth/bluetooth_cod_mapper.js
  // because it is not exposed as shared library and is in AMD style.
  // We might need to consolidate them in the future.
  var MinorDeviceClasses = {
    Computer: {
      0: 'computer',             // Uncategorized, code for device not assigned
      1: 'computer',             // Desktop workstation
      2: 'computer',             // Server-class computer
      3: 'computer',             // Laptop
      4: 'pda',                  // Handheld PC/PDA (clamshell)
      5: 'pda',                  // Palm-size PC/PDA
      6: 'computer',             // Wearable computer (watch size)
      7: 'computer',             // Tablet
      reserved: 'computer'       // All other values reserved. Default type
                                 // 'computer' given for reserved case.
    },

    Phone: {
      0: 'phone',                // Uncategorized, code for device not assigned
      1: 'phone',                // Cellular
      2: 'phone',                // Cordless
      3: 'phone',                // Smartphone
      4: 'modem',                // Wired modem or voice gateway
      5: 'phone',                // Common ISDN access
      reserved: 'phone'          // All other values reserved. Default type
                                 // 'phone' given for reserved case.
    },

    AudioVideo: {
      0: 'audio-card',           // Uncategorized, code not assigned
      1: 'audio-card',           // Wearable Headset Device
      2: 'audio-card',           // Hands-free Device
      4: 'audio-input-microphone', // Microphone
      5: 'audio-card',           // Loudspeaker
      6: 'audio-card',           // Headphones
      7: 'audio-card',           // Portable Audio
      8: 'audio-card',           // Car audio
      9: 'audio-card',           // Set-top box
      10: 'audio-card',          // HiFi Audio Device
      11: 'camera-video',        // VCR
      12: 'camera-video',        // Video Camera
      13: 'camera-video',        // Camcorder
      14: 'video-display',       // Video Monitor
      15: 'video-display',       // Video Display and Loudspeaker
      16: 'video-display',       // Video Conferencing
      18: 'audio-card',          // Gameing/Toy
      reserved: 'audio-card'     // All other values reserved. Default type
                                 // 'audio-card' given for reserved case.
    },

    Peripheral: {
      1: 'input-gaming',         // Joystick
      2: 'input-gaming',         // Gamepad
      16: 'input-keyboard',      // Keyboard
      17: 'input-keyboard',      // Keyboard
      18: 'input-keyboard',      // Keyboard
      19: 'input-keyboard',      // Keyboard
      20: 'input-keyboard',      // Keyboard
      21: 'input-keyboard',      // Keyboard
      22: 'input-keyboard',      // Keyboard
      23: 'input-keyboard',      // Keyboard
      24: 'input-keyboard',      // Keyboard
      25: 'input-keyboard',      // Keyboard
      26: 'input-keyboard',      // Keyboard
      27: 'input-keyboard',      // Keyboard
      28: 'input-keyboard',      // Keyboard
      29: 'input-keyboard',      // Keyboard
      30: 'input-keyboard',      // Keyboard
      31: 'input-keyboard',      // Keyboard
      32: 'input-mouse',         // Pointing device
      33: 'input-mouse',         // Pointing device
      34: 'input-mouse',         // Pointing device
      35: 'input-mouse',         // Pointing device
      36: 'input-mouse',         // Pointing device
      37: 'input-tablet',        // Digitizer tablet
      38: 'input-mouse',         // Pointing device
      39: 'input-mouse',         // Pointing device
      40: 'input-mouse',         // Pointing device
      41: 'input-mouse',         // Pointing device
      42: 'input-mouse',         // Pointing device
      43: 'input-mouse',         // Pointing device
      44: 'input-mouse',         // Pointing device
      45: 'input-mouse',         // Pointing device
      46: 'input-mouse',         // Pointing device
      47: 'input-mouse'          // Pointing device
    },

    Imaging: {
      4: 'video-display',        // Display, bit: XXX1XX
      8: 'camera-photo',         // Camera, bit: XX1XXX
      16: 'scanner',             // Scanner, bit: X1XXXX
      32: 'printer'              // Printer, bit: 1XXXXX
    }
  };

  var MajorDeviceClasses = {
    1: MinorDeviceClasses.Computer,
    2: MinorDeviceClasses.Phone,
    3: 'network-wireless',       // LAN/Network Access Point Major Class
    4: MinorDeviceClasses.AudioVideo,
    5: MinorDeviceClasses.Peripheral,
    6: MinorDeviceClasses.Imaging
  };

  var DeviceIconTable = {
    'computer': 'laptop',
    'pda': 'phone',
    'phone': 'phone',
    'modem': 'bluetooth', // need icon
    'audio-card': 'speaker',
    'audio-input-microphone': 'mic',
    'camera-video': 'recorder',
    'video-display': 'tv',
    'input-gaming': 'game',
    'input-keyboard': 'keyboard',
    'input-mouse': 'mouse',
    'input-tablet': 'bluetooth', // need icon
    'camera-photo': 'bluetooth', // need icon
    'scanner': 'bluetooth', // need icon
    'printer': 'bluetooth' // need icon
  };

  exports.BluetoothCodMapper = {
    getDeviceType: function btcodm_getDeviceType(cod) {
      // Given an empty string to be default type.
      // Then, we won't show any icon for empty type.
      var deviceType = '';
      var majorDeviceClass = MajorDeviceClasses[cod.majorDeviceClass];
      if (typeof(majorDeviceClass) === 'object') {
        // drop in other Major Class
        deviceType = majorDeviceClass[cod.minorDeviceClass] ||
                     majorDeviceClass.reserved || '';
        return deviceType;
      } else if (typeof(majorDeviceClass) === 'string') {
        // drop in LAN/Network Access Point Major Class
        return majorDeviceClass;
      } else if (cod.majorServiceClass & 0x100) {
        // Not in any Major Device Class which is defined in Gaia.
        // Ex: Wearable, Toy, Health.

        // Since there is no icon to display wearable, toy, health devices,
        // file a bug 1163479[2] to define them for specification needed.
        // But some of these devices probably service 'Audio' per Bluetooth
        // specification[1].
        // Property 'type' may be missed due to CoD of major class is TOY(0x08).
        // But we need to assign 'type' as 'audio-card' if service class
        // is 'Audio'. This is for PTS test case TC_AG_COD_BV_02_I.
        // As HFP specification defines that service class is 'Audio' can
        // be considered as HFP HF.
        // [1]: HFP_SPEC_V16.pdf: A device implementing the HF role of HFP shall
        //      set the "Audio" bit in the Service Class field.
        // [2]: Bug 1163479 - [Gaia][Bluetooth] Device icon definition for
        //      wearable, toy, health(Major Device Class) devices.
        //      (https://bugzilla.mozilla.org/show_bug.cgi?id=1163479)

        // Major Service Class: Audio(Speaker, Microphone, Headset service, ...)
        deviceType = 'audio-card';
        return deviceType;
      } else {
        // Not in any Class which is defined in Gaia.
        return deviceType;
      }
    },

    getIconName: function btcodm_getIconName(cod) {
      var humanReadableCod = this.getDeviceType(cod);
      return (DeviceIconTable[humanReadableCod] ?
        DeviceIconTable[humanReadableCod] : 'bluetooth');
    }
  };
}(window));

(function (exports) {
  'use strict';
  exports.BluetoothLoader = {
    // on b2g-desktop, we don't have mozBluetooth API, so we inject fake one
    // just to make sure we won't break TV build on b2g-desktop
    _fakeMozBluetooth: {
      addEventListener: function() {},
      defaultAdapter: {
        _discoveryHandle: {
          addEventListener: function() {}
        },
        state: 'disabled',
        enable: function() {
          return Promise.resolve();
        },
        disable: function() {
          return Promise.resolve();
        },
        startDiscovery: function() {
          return Promise.resolve(this._discoveryHandle);
        },
        stopDiscovery: function() {
          return Promise.resolve();
        },
        addEventListener: function() {},
        removeEventListener: function() {}
      }
    },

    getMozBluetooth: function() {
      if (navigator.mozBluetooth) {
        return navigator.mozBluetooth;
      } else {
        return this._fakeMozBluetooth;
      }
    }
  };

}(window));

/* globals evt */
'use strict';

(function(exports) {
  var FakeGattServer = {
    isFake: true,
    services: [],
    connect: function(address) {
      console.log('invoke FakeGattServer.connect');
      return Promise.resolve();
    },
    disconnect: function(address) {
      console.log('invoke FakeGattServer.disconnect');
      return Promise.resolve();
    },
    addService: function(service) {
      console.log('invoke FakeGattServer.addService');
      return Promise.resolve();
    },
    removeService: function(service) {
      console.log('invoke FakeGattServer.removeService');
      return Promise.resolve();
    },
    notifyCharacteristicChanged:
      function(address, uuid, instanceId, confirm) {
        console.log('invoke FakeGattServer.notifyCharacteristicChanged');
        return Promise.resolve();
      },
    sendResponse: function(address, status, requestId, value) {
      console.log('invoke FakeGattServer.sendResponse');
      return Promise.resolve();
    },
    addEventListener: function() {
      console.log('invoke FakeGattServer.addEventListener');
    },
    removeEventListener: function() {
      console.log('invoke FakeGattServer.removeEventListener');
    }
  };

  var GattServerManager = function() {};

  GattServerManager.prototype = evt({
    _bluetoothManager: undefined,
    _gattServer: undefined,

    init: function(bluetoothManager) {
      this._bluetoothManager = bluetoothManager;
      this._bluetoothManager.on('default-adapter-ready',
        this.onDefaultAdapterReady.bind(this));
    },

    onDefaultAdapterReady: function(detail) {
      var adapter = detail.adapter;
      // we'll fake BluetoothGattServer until API is ready
      this._gattServer = adapter.gattServer || FakeGattServer;
      this._gattServer.addEventListener('deviceconnectionstatechanged', this);
      this._gattServer.addEventListener('attributereadreq', this);
      this._gattServer.addEventListener('attributewritereq', this);
    },

    connect: function(address) {
      if (!this._gattServer) {
        return Promise.reject('gatt server does not exist');
      }
      return this._gattServer.connect(address);
    },

    disconnect: function(address) {
      if (!this._gattServer) {
        return Promise.reject('gatt server does not exist');
      }
      return this._gattServer.disonnect(address);
    },

    handleEvent: function(evt) {
      var type = evt.type;
      console.log('receive ' + type + ' from gatt server');
      switch(type) {
        case 'deviceconnectionstatechanged':
          this.fire('device-connection-state-changed', {
            address: evt.address,
            connected: evt.connected
          });
          break;
      }
    }

  });

  exports.GattServerManager = GattServerManager;
}(window));

/* globals evt, BluetoothLoader, GattServerManager */
(function(exports) {
  'use strict';

  var BluetoothManager = function() {};

  BluetoothManager.prototype = evt({
    _mozBluetooth: undefined,

    _defaultAdapter: undefined,

    _discoveryHandle: undefined,

    _deviceDeck: undefined,

    _gattServerManager: undefined,

    _discovering: false,

    get discovering () {
      return this._discovering;
    },

    set discovering (value) {
      if (value !== this._discovering) {
        this._discovering = value;
        this.fire('discovering-state-changed', value);
        if (value) {
          this.fire('start-discovering');
        } else {
          this.fire('stop-discovering');
        }
      }
    },

    _state: 'disabled',
    get state () {
      return this._state;
    },

    set state (value) {
      if (value !== this._state) {
        this._state = value;

        this.fire('state-changed', value);
        if (value === 'enabled') {
          this.fire('enabled');
        } else if (value === 'disabled') {
          this.fire('disabled');
        }
      }
    },

    init: function bm_init() {
      this._mozBluetooth = BluetoothLoader.getMozBluetooth();
      this._gattServerManager = new GattServerManager();
      this._gattServerManager.init(this);
      this._mozBluetooth.addEventListener('attributechanged', this);
      this.setDefaultAdapter(this._mozBluetooth.defaultAdapter);
    },

    setDefaultAdapter: function bm_setDefaultAdapter(adapter) {
      if (!adapter) {
        return;
      }

      if (this._defaultAdapter) {
        // reset default adapter, remove event handler on it
        this._defaultAdapter.removeEventListener('attributechanged', this);
      }
      this._defaultAdapter = adapter;
      this._defaultAdapter.addEventListener('attributechanged', this);
      this.fire('default-adapter-ready', {adapter: this._defaultAdapter});
    },

    onAttributeChanged: function bm_onAttributeChanged(evt) {
      var that = this;
      [].forEach.call(evt.attrs, function(attr, index) {
        console.log('attribute: ' + attr + ' changed');
        switch(attr) {
          case 'defaultAdapter':
            that.setDefaultAdapter(that._mozBluetooth.defaultAdapter);
            break;
          case 'discovering':
            that.discovering = that._defaultAdapter.discovering;
            break;
          case 'state':
            that.state = that._defaultAdapter.state;
            break;
        }
      });
    },

    handleEvent: function bm_handleEvent(evt) {
      switch(evt.type) {
        case 'attributechanged':
          this.onAttributeChanged(evt);
          break;
        case 'devicefound':
          this.onDeviceFound(evt);
          break;
      }
    },

    _keepDiscoveryHandle: function bm_keepDiscoveryHandle(handle) {
      this._discoveryHandle = handle;
      this._discoveryHandle.addEventListener('devicefound', this);
    },

    _removeDiscoveryHandleIfAny: function bm_removeDiscoveryHandleIfAny() {
      if (this._discoveryHandle) {
        this._discoveryHandle.removeEventListener('devicefound', this);
        this._discoveryHandle = undefined;
      }
    },

    _startDiscovery: function bm_startDiscovery() {
      var that = this;

      this._removeDiscoveryHandleIfAny();

      if (!this._defaultAdapter) {
        return Promise.reject('default adapter does not exist');
      }

      if (this._defaultAdapter.state !== 'enabled') {
        return this._defaultAdapter.enable().then(function() {
          return that._defaultAdapter.startDiscovery();
        }).then(this._keepDiscoveryHandle.bind(this));
      }

      return this._defaultAdapter.startDiscovery().then(
        this._keepDiscoveryHandle.bind(this));
    },

    _stopDiscovery: function bm_stopDiscovery() {
      if (!this._defaultAdapter) {
        return Promise.reject('default adapter does not exist');
      }

      // force to stop anyway
      return this._defaultAdapter.stopDiscovery();
    },

    _waitForAdapterReadyThen: function(callback, context, args) {
      var that = this;
      return new Promise(function(resolve, reject) {
        that.on('default-adapter-ready', function() {
          resolve(callback.apply(context, args));
        });
      });
    },

    safelyStartDiscovery: function bm_safelyStartDiscovery() {
      if (!this._defaultAdapter) {
        return this._waitForAdapterReadyThen(this._startDiscovery, this);
      }
      return this.safelyStopDiscovery().then(this._startDiscovery.bind(this));
    },

    safelyStopDiscovery: function bn_safelyStopDiscovery() {
      return this._stopDiscovery().catch(function(reason) {
        console.warn('failed to stop discovery: ' + reason);
      });
    },

    safelyDisable: function bm_safelyDisable() {
      if (!this._defaultAdapter) {
        return this._waitForAdapterReadyThen(
          this._disable, this);
      }
      return this.disable().catch(function(reason) {
        console.warn('failed to disable: ' + reason);
      });
    },

    _disable: function bm_disable() {
      return this._defaultAdapter.disable();
    },

    _startLeScan: function bm_startLeScan(uuids) {
      // TODO: consolidate with _startDiscovery maybe
      var that = this;
      if (!this._defaultAdapter) {
        return Promise.reject('default adapter does not exist');
      }

      if (this._defaultAdapter.state !== 'enabled') {
        return this._defaultAdapter.enable().then(function() {
          return that._defaultAdapter.startLeScan(uuids);
        }).then(this._keepDiscoveryHandle.bind(this));
      }

      return this._defaultAdapter.startLeScan(uuids).then(
        this._keepDiscoveryHandle.bind(this));
    },

    _stopLeScan: function bm_stopLeScan() {
      if (!this._defaultAdapter) {
        return Promise.reject('default adapter does not exist');
      }

      if (!this._discoveryHandle) {
        return Promise.reject('discovery handle does not exist');
      }

      // force to stop anyway
      return this._defaultAdapter.stopLeScan(this._discoveryHandle);
    },

    safelyStartLeScan: function bm_safelyStartLeScan(uuids) {
      uuids = uuids || [];
      if (!this._defaultAdapter) {
        return this._waitForAdapterReadyThen(
          this._startLeScan, this, [uuids]);
      }
      // TODO: should invoke stopLeScan before startLeScan
      return this._startLeScan(uuids);
    },

    safelyStopLeScan: function bm_safelyStopLeScan() {
      if (!this._defaultAdapter) {
        return this._waitForAdapterReadyThen(this._stopLeScan, this);
      }
      return this._stopLeScan().catch(function(reason) {
        console.warn('failed to stop le scan: ' + reason);
      });
    },

    onDeviceFound: function bm_onDeviceFound(evt) {
      var device = evt.device;
      this.fire('device-found', device);
    },

    // TODO: should have a better name
    gattServerConnect: function bm_gattServerConnect(address) {
      return this._gattServerManager.connect(address);
    },

    gattServerDisconnect: function bm_gattServerDisconnect(address) {
      return this._gattServerManager.disconnect(address);
    }
  });

  exports.BluetoothManager = BluetoothManager;
}(window));