#!/usr/bin/env ts-node
"use strict";
/**
 * Advanced Gemini API Evaluation Framework in TypeScript
 *
 * This module provides a comprehensive evaluation framework for Gemini models
 * with advanced features like streaming, batch processing, metrics collection,
 * and comprehensive error handling.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var node_fetch_1 = require("node-fetch");
var fs = require("fs/promises");
var events_1 = require("events");
var AdvancedGeminiEvaluator = /** @class */ (function (_super) {
    __extends(AdvancedGeminiEvaluator, _super);
    function AdvancedGeminiEvaluator(apiKey, model, defaultConfig, safetySettings) {
        if (model === void 0) { model = 'gemini-2.5-pro'; }
        if (defaultConfig === void 0) { defaultConfig = {}; }
        if (safetySettings === void 0) { safetySettings = []; }
        var _this = _super.call(this) || this;
        _this.results = [];
        _this.startTime = null;
        _this.apiKey = apiKey;
        _this.model = model;
        _this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        _this.defaultConfig = __assign({ temperature: 0.7, maxOutputTokens: 1024, topP: 0.9 }, defaultConfig);
        _this.defaultSafetySettings = safetySettings;
        return _this;
    }
    /**
     * Evaluate a single text prompt with comprehensive error handling
     */
    AdvancedGeminiEvaluator.prototype.evaluateText = function (prompt, config, metadata) {
        if (config === void 0) { config = {}; }
        if (metadata === void 0) { metadata = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var id, startTime, mergedConfig, payload, response, latencyMs, responseText, safetyRatings, candidate, result, error_1, latencyMs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.generateId();
                        startTime = Date.now();
                        if (!this.startTime) {
                            this.startTime = new Date();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        mergedConfig = __assign(__assign({}, this.defaultConfig), config);
                        payload = __assign({ contents: [
                                {
                                    role: "user",
                                    parts: [{ text: prompt }]
                                }
                            ], generationConfig: mergedConfig }, (this.defaultSafetySettings.length > 0 && {
                            safetySettings: this.defaultSafetySettings
                        }));
                        return [4 /*yield*/, this.makeRequest(payload)];
                    case 2:
                        response = _a.sent();
                        latencyMs = Date.now() - startTime;
                        responseText = '';
                        safetyRatings = [];
                        if (response.candidates && response.candidates.length > 0) {
                            candidate = response.candidates[0];
                            if (candidate.content && candidate.content.parts) {
                                responseText = candidate.content.parts[0].text || '';
                            }
                            safetyRatings = candidate.safetyRatings || [];
                        }
                        result = {
                            id: id,
                            prompt: prompt,
                            response: responseText,
                            model: this.model,
                            config: mergedConfig,
                            usage: response.usageMetadata || {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: __assign(__assign({}, metadata), { type: 'text' }),
                            safetyRatings: safetyRatings
                        };
                        this.results.push(result);
                        this.emit('evaluation:complete', result);
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        latencyMs = Date.now() - startTime;
                        result = {
                            id: id,
                            prompt: prompt,
                            response: '',
                            model: this.model,
                            config: __assign(__assign({}, this.defaultConfig), config),
                            usage: {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: __assign(__assign({}, metadata), { type: 'text' }),
                            error: error_1 instanceof Error ? error_1.message : String(error_1)
                        };
                        this.results.push(result);
                        this.emit('evaluation:error', error_1, result);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate with multimodal inputs (text + images/videos/audio)
     */
    AdvancedGeminiEvaluator.prototype.evaluateMultimodal = function (text, mediaFiles, config, metadata) {
        if (config === void 0) { config = {}; }
        if (metadata === void 0) { metadata = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var id, startTime, parts, _i, mediaFiles_1, media, mediaData, buffer, payload, response, latencyMs, responseText, candidate, result, error_2, latencyMs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.generateId();
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        parts = [{ text: text }];
                        _i = 0, mediaFiles_1 = mediaFiles;
                        _a.label = 2;
                    case 2:
                        if (!(_i < mediaFiles_1.length)) return [3 /*break*/, 7];
                        media = mediaFiles_1[_i];
                        if (!(media.type === 'image' || media.type === 'audio')) return [3 /*break*/, 5];
                        mediaData = media.data;
                        if (!(!mediaData && media.path)) return [3 /*break*/, 4];
                        return [4 /*yield*/, fs.readFile(media.path)];
                    case 3:
                        buffer = _a.sent();
                        mediaData = buffer.toString('base64');
                        _a.label = 4;
                    case 4:
                        if (mediaData) {
                            parts.push({
                                inline_data: {
                                    mime_type: media.mimeType,
                                    data: mediaData
                                }
                            });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        if (media.type === 'video' && media.fileUri) {
                            parts.push({
                                file_data: {
                                    mime_type: media.mimeType,
                                    file_uri: media.fileUri
                                }
                            });
                        }
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        payload = __assign({ contents: [
                                {
                                    role: "user",
                                    parts: parts
                                }
                            ], generationConfig: __assign(__assign({}, this.defaultConfig), config) }, (this.defaultSafetySettings.length > 0 && {
                            safetySettings: this.defaultSafetySettings
                        }));
                        return [4 /*yield*/, this.makeRequest(payload)];
                    case 8:
                        response = _a.sent();
                        latencyMs = Date.now() - startTime;
                        responseText = '';
                        if (response.candidates && response.candidates.length > 0) {
                            candidate = response.candidates[0];
                            if (candidate.content && candidate.content.parts) {
                                responseText = candidate.content.parts[0].text || '';
                            }
                        }
                        result = {
                            id: id,
                            prompt: "[MULTIMODAL] ".concat(text),
                            response: responseText,
                            model: this.model,
                            config: __assign(__assign({}, this.defaultConfig), config),
                            usage: response.usageMetadata || {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: __assign(__assign({}, metadata), { type: 'multimodal', mediaCount: mediaFiles.length, mediaTypes: mediaFiles.map(function (m) { return m.type; }) })
                        };
                        this.results.push(result);
                        this.emit('evaluation:complete', result);
                        return [2 /*return*/, result];
                    case 9:
                        error_2 = _a.sent();
                        latencyMs = Date.now() - startTime;
                        result = {
                            id: id,
                            prompt: "[MULTIMODAL] ".concat(text),
                            response: '',
                            model: this.model,
                            config: __assign(__assign({}, this.defaultConfig), config),
                            usage: {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: __assign(__assign({}, metadata), { type: 'multimodal' }),
                            error: error_2 instanceof Error ? error_2.message : String(error_2)
                        };
                        this.results.push(result);
                        this.emit('evaluation:error', error_2, result);
                        throw error_2;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate with function calling capabilities
     */
    AdvancedGeminiEvaluator.prototype.evaluateWithFunctions = function (prompt, functions, functionExecutor, config, metadata) {
        if (config === void 0) { config = {}; }
        if (metadata === void 0) { metadata = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var id, startTime, initialPayload, response, candidate, functionCalls, functionResults, _i, functionCalls_1, call, result_1, funcError_1, followUpPayload, latencyMs, responseText, candidate_1, textPart, result, error_3, latencyMs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.generateId();
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 12]);
                        initialPayload = {
                            contents: [
                                {
                                    role: "user",
                                    parts: [{ text: prompt }]
                                }
                            ],
                            tools: [
                                {
                                    function_declarations: functions
                                }
                            ],
                            toolConfig: {
                                functionCallingConfig: {
                                    mode: "AUTO"
                                }
                            },
                            generationConfig: __assign(__assign({}, this.defaultConfig), config)
                        };
                        return [4 /*yield*/, this.makeRequest(initialPayload)];
                    case 2:
                        response = _a.sent();
                        candidate = response.candidates[0];
                        if (!(candidate.content && candidate.content.parts)) return [3 /*break*/, 10];
                        functionCalls = candidate.content.parts.filter(function (part) { return part.functionCall; });
                        if (!(functionCalls.length > 0)) return [3 /*break*/, 10];
                        functionResults = [];
                        _i = 0, functionCalls_1 = functionCalls;
                        _a.label = 3;
                    case 3:
                        if (!(_i < functionCalls_1.length)) return [3 /*break*/, 8];
                        call = functionCalls_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, functionExecutor(call.functionCall.name, call.functionCall.args)];
                    case 5:
                        result_1 = _a.sent();
                        functionResults.push({
                            functionResponse: {
                                name: call.functionCall.name,
                                response: result_1
                            }
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        funcError_1 = _a.sent();
                        functionResults.push({
                            functionResponse: {
                                name: call.functionCall.name,
                                response: {
                                    error: funcError_1 instanceof Error
                                        ? funcError_1.message
                                        : String(funcError_1)
                                }
                            }
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        followUpPayload = {
                            contents: [
                                {
                                    role: "user",
                                    parts: [{ text: prompt }]
                                },
                                {
                                    role: "model",
                                    parts: candidate.content.parts
                                },
                                {
                                    role: "user",
                                    parts: functionResults
                                }
                            ],
                            tools: initialPayload.tools,
                            toolConfig: initialPayload.toolConfig,
                            generationConfig: initialPayload.generationConfig
                        };
                        return [4 /*yield*/, this.makeRequest(followUpPayload)];
                    case 9:
                        response = _a.sent();
                        _a.label = 10;
                    case 10:
                        latencyMs = Date.now() - startTime;
                        responseText = '';
                        if (response.candidates && response.candidates.length > 0) {
                            candidate_1 = response.candidates[0];
                            if (candidate_1.content && candidate_1.content.parts) {
                                textPart = candidate_1.content.parts.find(function (p) { return p.text; });
                                responseText = (textPart === null || textPart === void 0 ? void 0 : textPart.text) || '';
                            }
                        }
                        result = {
                            id: id,
                            prompt: "[FUNCTION] ".concat(prompt),
                            response: responseText,
                            model: this.model,
                            config: __assign(__assign({}, this.defaultConfig), config),
                            usage: response.usageMetadata || {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: __assign(__assign({}, metadata), { type: 'function_calling', functionsAvailable: functions.length })
                        };
                        this.results.push(result);
                        this.emit('evaluation:complete', result);
                        return [2 /*return*/, result];
                    case 11:
                        error_3 = _a.sent();
                        latencyMs = Date.now() - startTime;
                        result = {
                            id: id,
                            prompt: "[FUNCTION] ".concat(prompt),
                            response: '',
                            model: this.model,
                            config: __assign(__assign({}, this.defaultConfig), config),
                            usage: {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: __assign(__assign({}, metadata), { type: 'function_calling' }),
                            error: error_3 instanceof Error ? error_3.message : String(error_3)
                        };
                        this.results.push(result);
                        this.emit('evaluation:error', error_3, result);
                        throw error_3;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Streaming evaluation with real-time response chunks
     */
    AdvancedGeminiEvaluator.prototype.evaluateStreaming = function (prompt, config, options) {
        var _a;
        if (config === void 0) { config = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var id, startTime, payload, response, _b, _c, _d, fullResponse_1, totalTokens_1, body_1, error_4, latencyMs, result;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        id = this.generateId();
                        startTime = Date.now();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        payload = {
                            contents: [
                                {
                                    role: "user",
                                    parts: [{ text: prompt }]
                                }
                            ],
                            generationConfig: __assign(__assign({}, this.defaultConfig), config)
                        };
                        return [4 /*yield*/, (0, node_fetch_1["default"])("".concat(this.baseUrl, "/").concat(this.model, ":streamGenerateContent?key=").concat(this.apiKey), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(payload)
                            })];
                    case 2:
                        response = _e.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        _b = Error.bind;
                        _d = (_c = "HTTP ".concat(response.status, ": ")).concat;
                        return [4 /*yield*/, response.text()];
                    case 3: throw new (_b.apply(Error, [void 0, _d.apply(_c, [_e.sent()])]))();
                    case 4:
                        fullResponse_1 = '';
                        totalTokens_1 = 0;
                        if (!response.body) {
                            throw new Error('No readable stream available');
                        }
                        body_1 = response.body;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var buffer = '';
                                body_1.on('data', function (chunk) {
                                    var _a, _b;
                                    buffer += chunk.toString();
                                    var lines = buffer.split('\n');
                                    buffer = lines.pop() || '';
                                    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                        var line = lines_1[_i];
                                        if (line.startsWith('data: ')) {
                                            try {
                                                var data = JSON.parse(line.slice(6));
                                                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                                                    var text = ((_a = data.candidates[0].content.parts[0]) === null || _a === void 0 ? void 0 : _a.text) || '';
                                                    fullResponse_1 += text;
                                                    (_b = options.onChunk) === null || _b === void 0 ? void 0 : _b.call(options, text, fullResponse_1);
                                                    if (data.usageMetadata) {
                                                        totalTokens_1 = data.usageMetadata.totalTokenCount || 0;
                                                    }
                                                }
                                            }
                                            catch (e) {
                                                // Skip invalid JSON
                                            }
                                        }
                                    }
                                });
                                body_1.on('end', function () {
                                    var _a;
                                    (_a = options.onComplete) === null || _a === void 0 ? void 0 : _a.call(options, fullResponse_1);
                                    var latencyMs = Date.now() - startTime;
                                    var result = {
                                        id: id,
                                        prompt: prompt,
                                        response: fullResponse_1,
                                        model: _this.model,
                                        config: __assign(__assign({}, _this.defaultConfig), config),
                                        usage: { totalTokenCount: totalTokens_1 },
                                        timestamp: new Date().toISOString(),
                                        latencyMs: latencyMs,
                                        metadata: { type: 'streaming' }
                                    };
                                    _this.results.push(result);
                                    _this.emit('evaluation:complete', result);
                                    resolve(result);
                                });
                                body_1.on('error', function (err) {
                                    var _a;
                                    (_a = options.onError) === null || _a === void 0 ? void 0 : _a.call(options, err);
                                    var latencyMs = Date.now() - startTime;
                                    var result = {
                                        id: id,
                                        prompt: prompt,
                                        response: '',
                                        model: _this.model,
                                        config: __assign(__assign({}, _this.defaultConfig), config),
                                        usage: {},
                                        timestamp: new Date().toISOString(),
                                        latencyMs: latencyMs,
                                        metadata: { type: 'streaming' },
                                        error: err.message
                                    };
                                    _this.results.push(result);
                                    _this.emit('evaluation:error', err, result);
                                    reject(err);
                                });
                            })];
                    case 5:
                        error_4 = _e.sent();
                        (_a = options.onError) === null || _a === void 0 ? void 0 : _a.call(options, error_4 instanceof Error ? error_4 : new Error(String(error_4)));
                        latencyMs = Date.now() - startTime;
                        result = {
                            id: id,
                            prompt: prompt,
                            response: '',
                            model: this.model,
                            config: __assign(__assign({}, this.defaultConfig), config),
                            usage: {},
                            timestamp: new Date().toISOString(),
                            latencyMs: latencyMs,
                            metadata: { type: 'streaming' },
                            error: error_4 instanceof Error ? error_4.message : String(error_4)
                        };
                        this.results.push(result);
                        this.emit('evaluation:error', error_4, result);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Advanced batch evaluation with concurrency control and retry logic
     */
    AdvancedGeminiEvaluator.prototype.batchEvaluate = function (prompts, config, options) {
        if (config === void 0) { config = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, concurrency, _b, retryAttempts, _c, retryDelayMs, onProgress, onError, results, completed, chunks, _i, chunks_1, chunk, chunkPromises, chunkResults;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = options.concurrency, concurrency = _a === void 0 ? 5 : _a, _b = options.retryAttempts, retryAttempts = _b === void 0 ? 3 : _b, _c = options.retryDelayMs, retryDelayMs = _c === void 0 ? 1000 : _c, onProgress = options.onProgress, onError = options.onError;
                        results = [];
                        completed = 0;
                        chunks = this.chunkArray(prompts, concurrency);
                        _i = 0, chunks_1 = chunks;
                        _d.label = 1;
                    case 1:
                        if (!(_i < chunks_1.length)) return [3 /*break*/, 5];
                        chunk = chunks_1[_i];
                        chunkPromises = chunk.map(function (prompt) { return __awaiter(_this, void 0, void 0, function () {
                            var lastError, attempt, result, error_5;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        lastError = null;
                                        attempt = 1;
                                        _a.label = 1;
                                    case 1:
                                        if (!(attempt <= retryAttempts)) return [3 /*break*/, 8];
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 4, , 7]);
                                        return [4 /*yield*/, this.evaluateText(prompt, config, { attempt: attempt, batchSize: prompts.length })];
                                    case 3:
                                        result = _a.sent();
                                        completed++;
                                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(completed, prompts.length);
                                        return [2 /*return*/, result];
                                    case 4:
                                        error_5 = _a.sent();
                                        lastError = error_5 instanceof Error ? error_5 : new Error(String(error_5));
                                        if (!(attempt < retryAttempts)) return [3 /*break*/, 6];
                                        return [4 /*yield*/, this.delay(retryDelayMs * attempt)];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6: return [3 /*break*/, 7];
                                    case 7:
                                        attempt++;
                                        return [3 /*break*/, 1];
                                    case 8:
                                        onError === null || onError === void 0 ? void 0 : onError(lastError, prompt);
                                        completed++;
                                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(completed, prompts.length);
                                        return [2 /*return*/, {
                                                id: this.generateId(),
                                                prompt: prompt,
                                                response: '',
                                                model: this.model,
                                                config: config,
                                                usage: {},
                                                timestamp: new Date().toISOString(),
                                                latencyMs: 0,
                                                metadata: { type: 'batch', failed: true },
                                                error: lastError.message
                                            }];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(chunkPromises)];
                    case 2:
                        chunkResults = _d.sent();
                        results.push.apply(results, chunkResults);
                        if (!(chunks.indexOf(chunk) < chunks.length - 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.delay(500)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Calculate comprehensive evaluation metrics
     */
    AdvancedGeminiEvaluator.prototype.calculateMetrics = function () {
        var _this = this;
        if (this.results.length === 0) {
            throw new Error('No evaluations to calculate metrics from');
        }
        var successful = this.results.filter(function (r) { return !r.error; });
        var failed = this.results.filter(function (r) { return r.error; });
        var latencies = this.results.map(function (r) { return r.latencyMs; }).sort(function (a, b) { return a - b; });
        var totalTokens = successful.reduce(function (sum, r) { return sum + (r.usage.totalTokenCount || 0); }, 0);
        var p95Index = Math.floor(latencies.length * 0.95);
        var medianIndex = Math.floor(latencies.length * 0.5);
        var errorBreakdown = {};
        failed.forEach(function (result) {
            var errorType = _this.categorizeError(result.error || 'Unknown');
            errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
        });
        var endTime = new Date();
        var startTime = this.startTime || endTime;
        var durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
        return {
            totalEvaluations: this.results.length,
            successCount: successful.length,
            failureCount: failed.length,
            successRate: (successful.length / this.results.length) * 100,
            averageLatency: latencies.length > 0 ? latencies.reduce(function (a, b) { return a + b; }, 0) / latencies.length : 0,
            medianLatency: latencies.length > 0 ? latencies[medianIndex] : 0,
            p95Latency: latencies.length > 0 ? latencies[p95Index] : 0,
            totalTokensUsed: totalTokens,
            averageTokensPerRequest: successful.length > 0 ? totalTokens / successful.length : 0,
            costEstimate: this.estimateCost(totalTokens),
            errorBreakdown: errorBreakdown,
            throughput: this.results.length / Math.max(durationSeconds, 1),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationSeconds: durationSeconds
        };
    };
    /**
     * Export evaluation results in various formats
     */
    AdvancedGeminiEvaluator.prototype.exportResults = function (filename, format, includeMetrics) {
        if (format === void 0) { format = 'json'; }
        if (includeMetrics === void 0) { includeMetrics = true; }
        return __awaiter(this, void 0, void 0, function () {
            var data, _a, csv;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = __assign(__assign({}, (includeMetrics && { metrics: this.calculateMetrics() })), { metadata: {
                                model: this.model,
                                exportedAt: new Date().toISOString(),
                                totalEvaluations: this.results.length
                            }, results: this.results });
                        _a = format;
                        switch (_a) {
                            case 'json': return [3 /*break*/, 1];
                            case 'csv': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, fs.writeFile(filename, JSON.stringify(data, null, 2))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        csv = this.convertToCSV(this.results);
                        return [4 /*yield*/, fs.writeFile(filename, csv)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5: throw new Error("Unsupported format: ".concat(format));
                    case 6:
                        console.log("Results exported to ".concat(filename));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate comprehensive evaluation report
     */
    AdvancedGeminiEvaluator.prototype.generateReport = function () {
        var metrics = this.calculateMetrics();
        var report = '\n';
        report += '='.repeat(60) + '\n';
        report += 'GEMINI EVALUATION REPORT\n';
        report += '='.repeat(60) + '\n\n';
        report += "Model: ".concat(this.model, "\n");
        report += "Evaluation Period: ".concat(metrics.startTime, " to ").concat(metrics.endTime, "\n");
        report += "Duration: ".concat(metrics.durationSeconds.toFixed(2), " seconds\n\n");
        report += 'PERFORMANCE METRICS:\n';
        report += '-'.repeat(30) + '\n';
        report += "Total Evaluations: ".concat(metrics.totalEvaluations, "\n");
        report += "Success Rate: ".concat(metrics.successRate.toFixed(1), "%\n");
        report += "Throughput: ".concat(metrics.throughput.toFixed(2), " requests/second\n");
        report += "Average Latency: ".concat(metrics.averageLatency.toFixed(2), "ms\n");
        report += "Median Latency: ".concat(metrics.medianLatency.toFixed(2), "ms\n");
        report += "95th Percentile Latency: ".concat(metrics.p95Latency.toFixed(2), "ms\n\n");
        report += 'TOKEN USAGE:\n';
        report += '-'.repeat(30) + '\n';
        report += "Total Tokens: ".concat(metrics.totalTokensUsed.toLocaleString(), "\n");
        report += "Average Tokens per Request: ".concat(metrics.averageTokensPerRequest.toFixed(2), "\n");
        report += "Estimated Cost: $".concat(metrics.costEstimate.toFixed(4), "\n\n");
        if (Object.keys(metrics.errorBreakdown).length > 0) {
            report += 'ERROR BREAKDOWN:\n';
            report += '-'.repeat(30) + '\n';
            Object.entries(metrics.errorBreakdown).forEach(function (_a) {
                var error = _a[0], count = _a[1];
                report += "".concat(error, ": ").concat(count, "\n");
            });
            report += '\n';
        }
        report += 'SAMPLE RESULTS:\n';
        report += '-'.repeat(30) + '\n';
        var sampleResults = this.results.slice(0, 3);
        sampleResults.forEach(function (result, index) {
            var status = result.error ? 'ERROR' : 'SUCCESS';
            report += "".concat(index + 1, ". ").concat(status, " - ").concat(result.prompt.substring(0, 50), "...\n");
            report += "   Response: ".concat(result.response.substring(0, 80), "...\n");
            report += "   Latency: ".concat(result.latencyMs, "ms\n\n");
        });
        return report;
    };
    AdvancedGeminiEvaluator.prototype.makeRequest = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, node_fetch_1["default"])("".concat(this.baseUrl, "/").concat(this.model, ":generateContent?key=").concat(this.apiKey), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _a.sent();
                        throw new Error("HTTP ".concat(response.status, ": ").concat(errorText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AdvancedGeminiEvaluator.prototype.generateId = function () {
        return "eval_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    AdvancedGeminiEvaluator.prototype.chunkArray = function (array, size) {
        var chunks = [];
        for (var i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };
    AdvancedGeminiEvaluator.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    AdvancedGeminiEvaluator.prototype.categorizeError = function (error) {
        if (error.includes('401'))
            return 'Authentication Error';
        if (error.includes('403'))
            return 'Permission Denied';
        if (error.includes('429'))
            return 'Rate Limit Exceeded';
        if (error.includes('500'))
            return 'Server Error';
        if (error.includes('timeout'))
            return 'Timeout Error';
        return 'Unknown Error';
    };
    AdvancedGeminiEvaluator.prototype.estimateCost = function (totalTokens) {
        var costPerMillionTokens = {
            'gemini-2.5-pro': 3.5,
            'gemini-2.5-flash': 0.15,
            'gemini-2.5-flash-8b': 0.075,
            'gemini-1.5-pro': 1.25,
            'gemini-1.5-flash': 0.075
        };
        var rate = costPerMillionTokens[this.model] || 1.0;
        return (totalTokens / 1000000) * rate;
    };
    AdvancedGeminiEvaluator.prototype.convertToCSV = function (results) {
        var headers = [
            'id',
            'timestamp',
            'prompt',
            'response',
            'model',
            'latencyMs',
            'totalTokens',
            'type',
            'error'
        ];
        var rows = results.map(function (result) { return [
            result.id,
            result.timestamp,
            "\"".concat(result.prompt.replace(/"/g, '""'), "\""),
            "\"".concat(result.response.replace(/"/g, '""'), "\""),
            result.model,
            result.latencyMs,
            result.usage.totalTokenCount || 0,
            result.metadata.type || 'text',
            result.error || ''
        ]; });
        return __spreadArray([headers], rows, true).map(function (row) { return row.join(','); }).join('\n');
    };
    AdvancedGeminiEvaluator.prototype.clearResults = function () {
        this.results = [];
        this.startTime = null;
    };
    AdvancedGeminiEvaluator.prototype.getResults = function () {
        return __spreadArray([], this.results, true);
    };
    return AdvancedGeminiEvaluator;
}(events_1.EventEmitter));
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, evaluator, prompts, batchResults, mathFunctions, functionExecutor, report, error_6;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = process.env.GOOGLE_API_KEY;
                    if (!apiKey) {
                        console.error('Please set the GOOGLE_API_KEY environment variable');
                        process.exit(1);
                    }
                    evaluator = new AdvancedGeminiEvaluator(apiKey, 'gemini-2.0-flash-exp', {
                        temperature: 0.3,
                        maxOutputTokens: 1024
                    }, [
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_NONE'
                        }
                    ]);
                    evaluator.on('evaluation:complete', function (result) {
                        console.log("Completed: ".concat(result.prompt.substring(0, 30), "..."));
                    });
                    evaluator.on('evaluation:error', function (error, result) {
                        console.log("Failed: ".concat(result.prompt.substring(0, 30), "... (").concat(error.message, ")"));
                    });
                    console.log('Starting advanced Gemini evaluation...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    prompts = [
                        'Explain quantum computing principles'
                    ];
                    console.log('Running batch evaluation...');
                    return [4 /*yield*/, evaluator.batchEvaluate(prompts, { temperature: 0.2 }, {
                            concurrency: 3,
                            onProgress: function (completed, total) {
                                console.log("Progress: ".concat(completed, "/").concat(total, " (").concat((completed / total * 100).toFixed(1), "%)"));
                            }
                        })];
                case 2:
                    batchResults = _a.sent();
                    console.log('\nTesting function calling...');
                    mathFunctions = [
                        {
                            name: 'calculate',
                            description: 'Perform mathematical calculations',
                            parameters: {
                                type: 'object',
                                properties: {
                                    expression: {
                                        type: 'string',
                                        description: 'Mathematical expression to evaluate'
                                    }
                                },
                                required: ['expression']
                            }
                        }
                    ];
                    functionExecutor = function (name, args) { return __awaiter(_this, void 0, void 0, function () {
                        var sanitized, result;
                        return __generator(this, function (_a) {
                            if (name === 'calculate') {
                                try {
                                    sanitized = args.expression.replace(/[^0-9+\-*/().\s]/g, '');
                                    result = eval(sanitized);
                                    return [2 /*return*/, { result: result }];
                                }
                                catch (error) {
                                    return [2 /*return*/, { error: 'Invalid expression' }];
                                }
                            }
                            return [2 /*return*/, { error: 'Unknown function' }];
                        });
                    }); };
                    return [4 /*yield*/, evaluator.evaluateWithFunctions('Calculate the area of a circle with radius 7. Use pi equals 3.14159', mathFunctions, functionExecutor)];
                case 3:
                    _a.sent();
                    console.log('\nStarting streaming evaluation...');
                    console.log('Response: ');
                    return [4 /*yield*/, evaluator.evaluateStreaming('Write a very short haiku about artificial intelligence', { temperature: 0.8, maxOutputTokens: 100 }, {
                            onChunk: function (chunk) {
                                process.stdout.write(chunk);
                            },
                            onComplete: function (fullResponse) {
                                console.log('\n\nStreaming complete');
                            }
                        })];
                case 4:
                    _a.sent();
                    console.log('\n' + '='.repeat(60));
                    report = evaluator.generateReport();
                    console.log(report);
                    console.log('Exporting results...');
                    return [4 /*yield*/, evaluator.exportResults('advanced_evaluation_results.json')];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, evaluator.exportResults('advanced_evaluation_results.csv', 'csv')];
                case 6:
                    _a.sent();
                    console.log('\nEvaluation complete. Results exported successfully.');
                    return [3 /*break*/, 8];
                case 7:
                    error_6 = _a.sent();
                    console.error('\nEvaluation failed:', error_6);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = AdvancedGeminiEvaluator;
if (require.main === module) {
    main()["catch"](console.error);
}
