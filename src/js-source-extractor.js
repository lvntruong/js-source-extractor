#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var source_map_1 = require("source-map");
var httpsClient = __importStar(require("https"));
var httpClient = __importStar(require("http"));
var util = __importStar(require("util"));
var url_1 = require("url");
var fs_1 = require("fs");
var fs_2 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var url_2 = __importDefault(require("url"));
var mime_1 = __importDefault(require("mime"));
/* ********************** */
/* utilities              */
/* ********************** */
function mkdirPathSync(targetDir) {
    var sep = path_1.default.sep;
    var initDir = path_1.default.isAbsolute(targetDir) ? sep : '';
    var baseDir = '.';
    targetDir.split(sep).reduce(function (parentDir, childDir) {
        var curDir = path_1.default.resolve(baseDir, parentDir, childDir);
        try {
            fs_2.default.mkdirSync(curDir);
        }
        catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }
        return curDir;
    }, initDir);
}
function loadResource(resourceUrl) {
    console.info(util.format("Reading contents of %s", resourceUrl));
    return new Promise(function (resolve, reject) {
        var httpFn = function (res) {
            var responseBody = "";
            res.on("data", function (chunk) {
                responseBody += chunk;
            });
            res.on("end", function () {
                console.debug("source map response complete");
                resolve(responseBody);
            });
        };
        if (resourceUrl.protocol === 'https:') {
            httpsClient.request(resourceUrl, httpFn).end();
        }
        else if (resourceUrl.protocol === 'http:') {
            httpClient.request(resourceUrl, httpFn).end();
        }
        else if (resourceUrl.protocol === 'file:') {
            try {
                var result = fs_1.readFileSync(resourceUrl).toString('UTF-8');
                resolve(result);
            }
            catch (error) {
                console.error(util.format('Problem reading %s: %s', resourceUrl, error.message ? error.message : error));
                reject(error);
            }
        }
    });
}
function loadMap(resourceUrl, resourceType) {
    return __awaiter(this, void 0, void 0, function () {
        var guessedType, resourceContent, sourceMapPrefix, mapUrlIndex_1, mapUrl, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.info(util.format("Loading resource %s to examine (expecting javascript or source map)", resourceUrl));
                    if (!resourceType) {
                        guessedType = mime_1.default.getType(resourceUrl.pathname);
                        if (guessedType === 'application/javascript') {
                            resourceType = ResourceType.JAVASCRIPT;
                        }
                        else if (guessedType === 'application/json') {
                            resourceType = ResourceType.SOURCE_MAP;
                        }
                        else {
                            throw Error(util.format('No resource type specified and the guessed one \'%s\' is unrecognized.', guessedType));
                        }
                    }
                    console.info(util.format('Resource will be treated as a %s', resourceType.valueOf()));
                    return [4 /*yield*/, loadResource(resourceUrl)];
                case 1:
                    resourceContent = _a.sent();
                    if (!(resourceType === ResourceType.JAVASCRIPT)) return [3 /*break*/, 4];
                    sourceMapPrefix = ['//@ sourceMappingURL=', '//# sourceMappingURL='];
                    mapUrlIndex_1 = -1;
                    sourceMapPrefix.some(function (prefix) {
                        mapUrlIndex_1 = resourceContent.indexOf(prefix);
                        return mapUrlIndex_1 !== -1;
                    });
                    // locate //@ sourceMappingURL= and examine the string afterwards
                    if (mapUrlIndex_1 === -1) {
                        throw Error('No embedded source map url has been found. Is the source map in a separate file?');
                    }
                    console.info('Found source map url');
                    mapUrl = resourceContent.substring(mapUrlIndex_1 + '//@ sourceMappingURL='.length);
                    if (!mapUrl.startsWith('data:application/json;base64,')) return [3 /*break*/, 2];
                    console.info('Extracting embedded source map');
                    buf = Buffer.from(mapUrl.substring('data:application/json;base64,'.length), "base64");
                    resourceContent = buf.toString('UTF-8');
                    return [3 /*break*/, 4];
                case 2:
                    // load source map from url
                    console.info("Found source map url inside javascript file.");
                    return [4 /*yield*/, loadResource(new url_1.URL(mapUrl, resourceUrl))];
                case 3:
                    resourceContent = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, resourceContent];
            }
        });
    });
}
/* ********************** */
/* main exported functionalities */
/* ********************** */
/**
 * Type of resource. Required if not automatically determinable.
 */
var ResourceType;
(function (ResourceType) {
    ResourceType["JAVASCRIPT"] = "Javascript";
    ResourceType["SOURCE_MAP"] = "Source Map";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
/**
 * Extract source code from either a provided Javascript file containing a source map information, a Source Map file or a source map in string form.
 * Source code files must either be referenced and accessible via information in the source map or be contained in the source map (embedded).
 *
 * The extracted source code is stored in the file system. The directory structure that is provided with the source file path information in the source map will be created automatically.
 *
 * Example:
 * ```js
 * const baseDir = __dirname + "/../resources";
 * const outDir = tmpdir() + path.sep + 'js-source-extractor-test'; // directory to store source files in
 * await extractSrcToDir(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), outDir);
 * ```
 *
 * @param {module:url.URL | null} resourceUrl An url (http(s):// or file:// for local file access) to retrieve either a Javascript file or a Source Map file. If null, sourceMap must be specified.
 * @param {string | null} sourceMap Source Map JSON in string form to use directly. Must contain source code or refer with absolute urls to source files. If null, resourceUrl must be specified.
 * @param {string} outDir Directory where the source files should be stored into.
 * @param {ResourceType} resourceType Optional type describing whether the resourceUrl references a Javascript or a Source Map file. Automatic detection (according to the file name extensions) is attempted if not specified.
 * @param {RegExp} srcInclude Optional pattern to test a source code path against before sending it to the receiver. Defaults to .*
 * @param {RegExp} srcExclude Optional pattern to test a source code path against to exclude from sending it to the receiver. Exclude pattern is tested after the include pattern.
 * @returns {Promise<void>} Async function without a direct result (use receiver to receive information)
 */
function extractSrcToDir(resourceUrl, sourceMap, outDir, resourceType, srcInclude, srcExclude) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir;
        return __generator(this, function (_a) {
            baseDir = process.cwd() + path_1.default.sep + 'extract';
            if (typeof outDir !== 'undefined') {
                baseDir = outDir;
            }
            return [2 /*return*/, extractSrc(resourceUrl, null, function (path, sourceName, source) {
                    mkdirPathSync(baseDir + path);
                    try {
                        fs_2.default.writeFileSync(baseDir + path + sourceName, source);
                    }
                    catch (error) {
                        console.error(util.format("Problem while writing file %s: %s", baseDir + path + sourceName, error));
                    }
                    console.info(util.format("Source %s written", baseDir + path + sourceName));
                }, resourceType, srcInclude, srcExclude)];
        });
    });
}
exports.extractSrcToDir = extractSrcToDir;
/**
 * Extract source code from either a provided Javascript file containing a source map information, a Source Map file or a source map in string form.
 * Source code files must either be referenced and accessible via information in the source map or be contained in the source map (embedded).
 *
 * Example:
 * ```js
 * const baseDir = __dirname + "/../resources";
 * extractSrc(new URL(util.format('file://%s/embedded-sourcemap-test.js', baseDir)), null, (path: string, sourceName: string, source: string | null) => {
 *   console.log("Path: " + path);              // '/src'
 *   console.log("SourceName: " + sourceName);  // '/embedded-sourcemap-test.ts'
 *   console.log("Source: " + source);          // 'console.log(\'Hello World!\');'
 * });
 * ```
 *
 * Note: Either resourceUrl or sourceMap must be specified.
 *
 * @param {module:url.URL | null} resourceUrl An url (http(s):// or file:// for local file access) to retrieve either a Javascript file or a Source Map file. If null, sourceMap must be specified.
 * @param {string | null} sourceMap Source Map JSON in string form to use directly. Must contain source code or refer with absolute urls to source files. If null, resourceUrl must be specified.
 * @param {(path: string, sourceName: string, source: (string | null)) => void} receiver A callback function called for each source file referenced in the source map.
 *                                                                              Path is the base path of the source file, sourceName the file name, source the source code, if the file was found
 * @param {ResourceType} resourceType Optional type describing whether the resourceUrl references a Javascript or a Source Map file. Automatic detection (according to the file name extensions) is attempted if not specified.
 * @param {RegExp} srcInclude Optional pattern to test a source code path against before sending it to the receiver. Defaults to .*
 * @param {RegExp} srcExclude Optional pattern to test a source code path against to exclude from sending it to the receiver. Exclude pattern is tested after the include pattern.
 * @returns {Promise<void>} Async function without a direct result (use receiver to receive information)
 */
function extractSrc(resourceUrl, sourceMap, receiver, resourceType, srcInclude, srcExclude) {
    return __awaiter(this, void 0, void 0, function () {
        var rawMap, srcIncludeEff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rawMap = sourceMap;
                    if (!(rawMap === null)) return [3 /*break*/, 2];
                    if (resourceUrl === null) {
                        throw Error('No or invalid sourceMap and no or invalid resourceUrl provided');
                    }
                    return [4 /*yield*/, loadMap(resourceUrl)];
                case 1:
                    rawMap = _a.sent();
                    _a.label = 2;
                case 2:
                    if (typeof srcInclude !== 'undefined') {
                        srcIncludeEff = srcInclude;
                    }
                    else {
                        srcIncludeEff = /.*/;
                    }
                    return [4 /*yield*/, source_map_1.SourceMapConsumer.with(rawMap, null, function (consumer) {
                            console.info(util.format("Source map references %d source files", consumer.sources.length));
                            consumer.sources.forEach(function (sourceRef) {
                                if (!srcIncludeEff.test(sourceRef)) {
                                    console.log(util.format('Skipping %s: does not match include pattern'), sourceRef);
                                    return;
                                }
                                if (typeof srcExclude !== 'undefined' && srcExclude.test(sourceRef)) {
                                    console.log(util.format('Skipping %s: matched exclude pattern', sourceRef));
                                    return;
                                }
                                var sourceRefUrl = url_2.default.parse(sourceRef);
                                var pathName = sourceRefUrl.pathname + (sourceRefUrl.query ? sourceRefUrl.query : '') + (sourceRefUrl.hash ? sourceRefUrl.hash : '');
                                var fileName = pathName;
                                var source = consumer.sourceContentFor(sourceRef, true);
                                if (pathName.lastIndexOf(path_1.default.sep) != -1) {
                                    fileName = pathName.substring(pathName.lastIndexOf(path_1.default.sep));
                                    pathName = pathName.substring(0, pathName.lastIndexOf(path_1.default.sep));
                                    // drop any leading relative path constructs
                                    pathName = pathName.replace(/[\\]+/g, '/');
                                    pathName = path_1.default.sep + pathName.replace(/^[./]+/, '');
                                }
                                else {
                                    // for the sake of consistency with absolute path cases, we empty path and append a slash on fileName
                                    pathName = '';
                                    fileName = '/' + fileName;
                                }
                                receiver(pathName, fileName, source);
                            });
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.extractSrc = extractSrc;
/* ********************** */
/* exports                */
/* ********************** */
exports.ResourceType = ResourceType;
exports.extractSrcToDir = extractSrcToDir;
exports.extractSrc = extractSrc;
/**
 * Command line interface - wrapped in a function for better testability
 *
 * ```js
 * process.exit(cli(process.argv));
 * ```
 * @param {string[]} args command line arguments
 * @returns {number} non-zero numbers indicate an error
 */
function cli(args) {
    var packageJSON;
    try {
        var pkgPath = __dirname + "/../";
        var contents = fs_2.default.readFileSync(pkgPath + 'package.json').toString('utf-8');
        packageJSON = JSON.parse(contents);
    }
    catch (error) {
        // ignore for now - no version to specify in this case
    }
    var program = require('commander');
    if (packageJSON && packageJSON.version) {
        program.version(packageJSON.version, '-v, --version');
        program.description(packageJSON.description);
    }
    return new Promise(function (resolve, reject) {
        var resourceUrlPresent = false;
        program
            .arguments('<resourceUrl>')
            .option('-o, --outDir <outDir>', 'Base output directory where source files should be output to')
            .option('-i, --include <includePattern>', 'Include pattern to apply when selecting source files for extraction')
            .option('-e, --exclude <excludePattern>', 'Exclude pattern to apply when selecting source files for extraction (executed after include pattern)')
            .action(function (resourceUrl, options) {
            resourceUrlPresent = true;
            var realResourceUrl;
            try {
                realResourceUrl = new url_1.URL(resourceUrl);
            }
            catch (error) {
                reject(new Error("Invalid resourceUrl provided: " + error));
                return;
            }
            extractSrcToDir(realResourceUrl, null, options.outDir, undefined, options.include ? new RegExp(options.include) : undefined, options.exclude ? new RegExp(options.exclude) : undefined).then(function () { return resolve(0); });
        });
        program.parse(args);
        if (!resourceUrlPresent) {
            console.error('No resource url provided');
            program.outputHelp();
            reject(new Error('No resource url provided'));
            return;
        }
    });
}
exports.cli = cli;
// are we "required/imported" or called from command line?
if (require.main === module) {
    cli(process.argv)
        .then(function (result) {
        process.exit(result);
    })
        .catch(function (error) {
        process.exit(1);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtc291cmNlLWV4dHJhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImpzLXNvdXJjZS1leHRyYWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEseUNBQThDO0FBQzlDLGlEQUFxQztBQUNyQywrQ0FBbUM7QUFDbkMseUNBQTZCO0FBQzdCLDJCQUF3QjtBQUV4Qix5QkFBZ0M7QUFDaEMsMENBQW9CO0FBQ3BCLDhDQUF3QjtBQUN4Qiw0Q0FBc0I7QUFDdEIsOENBQXdCO0FBRXhCLDRCQUE0QjtBQUM1Qiw0QkFBNEI7QUFDNUIsNEJBQTRCO0FBRzVCLHVCQUF1QixTQUFpQjtJQUNwQyxJQUFNLEdBQUcsR0FBRyxjQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3JCLElBQU0sT0FBTyxHQUFHLGNBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3RELElBQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUVwQixTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLFNBQVMsRUFBRSxRQUFRO1FBQzVDLElBQU0sTUFBTSxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxRCxJQUFJO1lBQ0EsWUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4QjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDdkIsTUFBTSxHQUFHLENBQUM7YUFDYjtTQUNKO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hCLENBQUM7QUFFRCxzQkFBc0IsV0FBZ0I7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