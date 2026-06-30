/*
 * stimulus-use 0.52.3
 */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("hotkeys-js")) : typeof define === "function" && define.amd ? define([ "exports", "hotkeys-js" ], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  factory(global.StimulusUseHotkeys = {}, global.hotkeys));
})(this, (function(exports, hotkeys) {
  "use strict";
  const defaultOptions = {
    debug: false,
    logger: console,
    dispatchEvent: true,
    eventPrefix: true
  };
  class StimulusUse {
    constructor(controller, options = {}) {
      this.log = (functionName, args) => {
        if (!this.debug) return;
        this.logger.groupCollapsed(`%c${this.controller.identifier} %c#${functionName}`, "color: #3B82F6", "color: unset");
        this.logger.log({
          controllerId: this.controllerId,
          ...args
        });
        this.logger.groupEnd();
      };
      this.warn = message => {
        this.logger.warn(`%c${this.controller.identifier} %c${message}`, "color: #3B82F6; font-weight: bold", "color: unset");
      };
      this.dispatch = (eventName, details = {}) => {
        if (this.dispatchEvent) {
          const {event: event, ...eventDetails} = details;
          const customEvent = this.extendedEvent(eventName, event || null, eventDetails);
          this.targetElement.dispatchEvent(customEvent);
          this.log("dispatchEvent", {
            eventName: customEvent.type,
            ...eventDetails
          });
        }
      };
      this.call = (methodName, args = {}) => {
        const method = this.controller[methodName];
        if (typeof method == "function") {
          return method.call(this.controller, args);
        }
      };
      this.extendedEvent = (name, event, detail) => {
        const {bubbles: bubbles, cancelable: cancelable, composed: composed} = event || {
          bubbles: true,
          cancelable: true,
          composed: true
        };
        if (event) {
          Object.assign(detail, {
            originalEvent: event
          });
        }
        const customEvent = new CustomEvent(this.composeEventName(name), {
          bubbles: bubbles,
          cancelable: cancelable,
          composed: composed,
          detail: detail
        });
        return customEvent;
      };
      this.composeEventName = name => {
        let composedName = name;
        if (this.eventPrefix === true) {
          composedName = `${this.controller.identifier}:${name}`;
        } else if (typeof this.eventPrefix === "string") {
          composedName = `${this.eventPrefix}:${name}`;
        }
        return composedName;
      };
      this.debug = options?.debug ?? controller.application.stimulusUseDebug ?? defaultOptions.debug;
      this.logger = options?.logger ?? defaultOptions.logger;
      this.controller = controller;
      this.controllerId = controller.element.id || controller.element.dataset.id;
      this.targetElement = options?.element || controller.element;
      const {dispatchEvent: dispatchEvent, eventPrefix: eventPrefix} = Object.assign({}, defaultOptions, options);
      Object.assign(this, {
        dispatchEvent: dispatchEvent,
        eventPrefix: eventPrefix
      });
      this.controllerInitialize = controller.initialize.bind(controller);
      this.controllerConnect = controller.connect.bind(controller);
      this.controllerDisconnect = controller.disconnect.bind(controller);
    }
  }
  class UseHotkeys extends StimulusUse {
    constructor(controller, hotkeysOptions) {
      super(controller, hotkeysOptions);
      this.bind = () => {
        for (const [hotkey, definition] of Object.entries(this.hotkeysOptions.hotkeys)) {
          const handler = definition.handler.bind(this.controller);
          hotkeys(hotkey, definition.options, (e => handler(e, e)));
        }
      };
      this.unbind = () => {
        for (const hotkey in this.hotkeysOptions.hotkeys) {
          hotkeys.unbind(hotkey);
        }
      };
      this.controller = controller;
      this.hotkeysOptions = hotkeysOptions;
      this.enhanceController();
      this.bind();
    }
    enhanceController() {
      if (this.hotkeysOptions.filter) {
        hotkeys.filter = this.hotkeysOptions.filter;
      }
      const controllerDisconnect = this.controller.disconnect.bind(this.controller);
      const disconnect = () => {
        this.unbind();
        controllerDisconnect();
      };
      Object.assign(this.controller, {
        disconnect: disconnect
      });
    }
  }
  const convertSimpleHotkeyDefinition = definition => ({
    handler: definition[0],
    options: {
      element: definition[1]
    }
  });
  const coerceOptions = options => {
    if (!options.hotkeys) {
      const hotkeys = {};
      Object.entries(options).forEach((([hotkey, definition]) => {
        Object.defineProperty(hotkeys, hotkey, {
          value: convertSimpleHotkeyDefinition(definition),
          writable: false,
          enumerable: true
        });
      }));
      options = {
        hotkeys: hotkeys
      };
    }
    return options;
  };
  const useHotkeys = (controller, options) => new UseHotkeys(controller, coerceOptions(options));
  exports.useHotkeys = useHotkeys;
}));
