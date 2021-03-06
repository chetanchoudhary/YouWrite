/*! firebase-admin v5.10.0 */
"use strict";
/*!
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var deep_copy_1 = require("./deep-copy");
var error_1 = require("./error");
var https = require("https");
/**
 * Base class for handling HTTP requests.
 */
var HttpRequestHandler = /** @class */ (function () {
    function HttpRequestHandler() {
    }
    /**
     * Sends HTTP requests and returns a promise that resolves with the result.
     * Will retry once if the first attempt encounters an AppErrorCodes.NETWORK_ERROR.
     *
     * @param {string} host The HTTP host.
     * @param {number} port The port number.
     * @param {string} path The endpoint path.
     * @param {HttpMethod} httpMethod The http method.
     * @param {object} [data] The request JSON.
     * @param {object} [headers] The request headers.
     * @param {number} [timeout] The request timeout in milliseconds.
     * @return {Promise<object>} A promise that resolves with the response.
     */
    HttpRequestHandler.prototype.sendRequest = function (host, port, path, httpMethod, data, headers, timeout) {
        var _this = this;
        // Convenience for calling the real _sendRequest() method with the original params.
        var sendOneRequest = function () {
            return _this._sendRequest(host, port, path, httpMethod, data, headers, timeout);
        };
        return sendOneRequest()
            .catch(function (response) {
            // Retry if the request failed due to a network error.
            if (response.error instanceof error_1.FirebaseAppError) {
                if (response.error.hasCode(error_1.AppErrorCodes.NETWORK_ERROR)) {
                    return sendOneRequest();
                }
            }
            return Promise.reject(response);
        });
    };
    /**
     * Sends HTTP requests and returns a promise that resolves with the result.
     *
     * @param {string} host The HTTP host.
     * @param {number} port The port number.
     * @param {string} path The endpoint path.
     * @param {HttpMethod} httpMethod The http method.
     * @param {object} [data] The request JSON.
     * @param {object} [headers] The request headers.
     * @param {number} [timeout] The request timeout in milliseconds.
     * @return {Promise<object>} A promise that resolves with the response.
     */
    HttpRequestHandler.prototype._sendRequest = function (host, port, path, httpMethod, data, headers, timeout) {
        var requestData;
        if (data) {
            try {
                requestData = JSON.stringify(data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        var options = {
            method: httpMethod,
            host: host,
            port: port,
            path: path,
            headers: headers,
        };
        // Only https endpoints.
        return new Promise(function (resolve, reject) {
            var req = https.request(options, function (res) {
                var buffers = [];
                res.on('data', function (buffer) { return buffers.push(buffer); });
                res.on('end', function () {
                    var response = Buffer.concat(buffers).toString();
                    var statusCode = res.statusCode || 200;
                    var responseHeaders = res.headers || {};
                    var contentType = responseHeaders['content-type'] || 'application/json';
                    if (contentType.indexOf('text/html') !== -1 || contentType.indexOf('text/plain') !== -1) {
                        // Text response
                        if (statusCode >= 200 && statusCode < 300) {
                            resolve(response);
                        }
                        else {
                            reject({
                                statusCode: statusCode,
                                error: response,
                            });
                        }
                    }
                    else {
                        // JSON response
                        try {
                            var json = JSON.parse(response);
                            if (statusCode >= 200 && statusCode < 300) {
                                resolve(json);
                            }
                            else {
                                reject({
                                    statusCode: statusCode,
                                    error: json,
                                });
                            }
                        }
                        catch (error) {
                            var parsingError = new error_1.FirebaseAppError(error_1.AppErrorCodes.UNABLE_TO_PARSE_RESPONSE, "Failed to parse response data: \"" + error.toString() + "\". Raw server" +
                                ("response: \"" + response + "\". Status code: \"" + res.statusCode + "\". Outgoing ") +
                                ("request: \"" + options.method + " " + options.host + options.path + "\""));
                            reject({
                                statusCode: statusCode,
                                error: parsingError,
                            });
                        }
                    }
                });
            });
            if (timeout) {
                // Listen to timeouts and throw a network error.
                req.on('socket', function (socket) {
                    socket.setTimeout(timeout);
                    socket.on('timeout', function () {
                        req.abort();
                        var networkTimeoutError = new error_1.FirebaseAppError(error_1.AppErrorCodes.NETWORK_TIMEOUT, host + " network timeout. Please try again.");
                        reject({
                            statusCode: 408,
                            error: networkTimeoutError,
                        });
                    });
                });
            }
            req.on('error', function (error) {
                var networkRequestError = new error_1.FirebaseAppError(error_1.AppErrorCodes.NETWORK_ERROR, "A network request error has occurred: " + (error && error.message));
                reject({
                    statusCode: 502,
                    error: networkRequestError,
                });
            });
            if (requestData) {
                req.write(requestData);
            }
            req.end();
        });
    };
    return HttpRequestHandler;
}());
exports.HttpRequestHandler = HttpRequestHandler;
/**
 * Class that extends HttpRequestHandler and signs HTTP requests with a service
 * credential access token.
 *
 * @param {Credential} credential The service account credential used to
 *     sign HTTP requests.
 * @constructor
 */
var SignedApiRequestHandler = /** @class */ (function (_super) {
    __extends(SignedApiRequestHandler, _super);
    function SignedApiRequestHandler(app_) {
        var _this = _super.call(this) || this;
        _this.app_ = app_;
        return _this;
    }
    /**
     * Sends HTTP requests and returns a promise that resolves with the result.
     *
     * @param {string} host The HTTP host.
     * @param {number} port The port number.
     * @param {string} path The endpoint path.
     * @param {HttpMethod} httpMethod The http method.
     * @param {object} data The request JSON.
     * @param {object} headers The request headers.
     * @param {number} timeout The request timeout in milliseconds.
     * @return {Promise} A promise that resolves with the response.
     */
    SignedApiRequestHandler.prototype.sendRequest = function (host, port, path, httpMethod, data, headers, timeout) {
        var _this = this;
        return this.app_.INTERNAL.getToken().then(function (accessTokenObj) {
            var headersCopy = (headers && deep_copy_1.deepCopy(headers)) || {};
            var authorizationHeaderKey = 'Authorization';
            headersCopy[authorizationHeaderKey] = 'Bearer ' + accessTokenObj.accessToken;
            return _super.prototype.sendRequest.call(_this, host, port, path, httpMethod, data, headersCopy, timeout);
        });
    };
    return SignedApiRequestHandler;
}(HttpRequestHandler));
exports.SignedApiRequestHandler = SignedApiRequestHandler;
/**
 * Class that defines all the settings for the backend API endpoint.
 *
 * @param {string} endpoint The Firebase Auth backend endpoint.
 * @param {HttpMethod} httpMethod The http method for that endpoint.
 * @constructor
 */
var ApiSettings = /** @class */ (function () {
    function ApiSettings(endpoint, httpMethod) {
        if (httpMethod === void 0) { httpMethod = 'POST'; }
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
        this.setRequestValidator(null)
            .setResponseValidator(null);
    }
    /** @return {string} The backend API endpoint. */
    ApiSettings.prototype.getEndpoint = function () {
        return this.endpoint;
    };
    /** @return {HttpMethod} The request HTTP method. */
    ApiSettings.prototype.getHttpMethod = function () {
        return this.httpMethod;
    };
    /**
     * @param {ApiCallbackFunction} requestValidator The request validator.
     * @return {ApiSettings} The current API settings instance.
     */
    ApiSettings.prototype.setRequestValidator = function (requestValidator) {
        var nullFunction = function (request) { return undefined; };
        this.requestValidator = requestValidator || nullFunction;
        return this;
    };
    /** @return {ApiCallbackFunction} The request validator. */
    ApiSettings.prototype.getRequestValidator = function () {
        return this.requestValidator;
    };
    /**
     * @param {ApiCallbackFunction} responseValidator The response validator.
     * @return {ApiSettings} The current API settings instance.
     */
    ApiSettings.prototype.setResponseValidator = function (responseValidator) {
        var nullFunction = function (request) { return undefined; };
        this.responseValidator = responseValidator || nullFunction;
        return this;
    };
    /** @return {ApiCallbackFunction} The response validator. */
    ApiSettings.prototype.getResponseValidator = function () {
        return this.responseValidator;
    };
    return ApiSettings;
}());
exports.ApiSettings = ApiSettings;
