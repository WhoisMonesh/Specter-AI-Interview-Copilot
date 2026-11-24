
import { g as getDefaultExportFromCjs, c as commonjsGlobal } from "./index-4UMZ59Qc.js";
import { c as commonjsRequire } from "./_commonjs-dynamic-modules-TGKdzP3c.js";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var mammoth_browser_min$1 = { exports: {} };
(function(module, exports$1) {
  !function(f) {
    module.exports = f();
  }(function() {
    return function e(t, n, r) {
      function s(o2, u) {
        if (!n[o2]) {
          if (!t[o2]) {
            var a = "function" == typeof commonjsRequire && commonjsRequire;
            if (!u && a) return a(o2, true);
            if (i) return i(o2, true);
            var f = new Error("Cannot find module '" + o2 + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o2] = { exports: {} };
          t[o2][0].call(l.exports, function(e2) {
            var n2 = t[o2][1][e2];
            return s(n2 ? n2 : e2);
          }, l, l.exports, e, t, n, r);
        }
        return n[o2].exports;
      }
      for (var i = "function" == typeof commonjsRequire && commonjsRequire, o = 0; o < r.length; o++) s(r[o]);
      return s;
    }({ 1: [function(require2, module2, exports2) {
      function Files() {
        function read(uri) {
          return promises.reject(new Error("could not open external image: '" + uri + "'\ncannot open linked files from a web browser"));
        }
        return { read };
      }
      var promises = require2("../../lib/promises");
      exports2.Files = Files;
    }, { "../../lib/promises": 23 }], 2: [function(require2, module2, exports2) {
      function openZip(options) {
        return options.arrayBuffer ? promises.resolve(zipfile.openArrayBuffer(options.arrayBuffer)) : promises.reject(new Error("Could not find file in options"));
      }
      var promises = require2("../lib/promises"), zipfile = require2("../lib/zipfile");
      exports2.openZip = openZip;
    }, { "../lib/promises": 23, "../lib/zipfile": 40 }], 3: [function(require2, module2, exports2) {
      function DocumentConverter(options) {
        return { convertToHtml: function(element) {
          var comments = _.indexBy(element.type === documents.types.document ? element.comments : [], "commentId"), conversion = new DocumentConversion(options, comments);
          return conversion.convertToHtml(element);
        } };
      }
      function DocumentConversion(options, comments) {
        function convertToHtml(document) {
          var messages = [], html = elementToHtml(document, messages, /* @__PURE__ */ Object.create(null)), deferredNodes = [];
          walkHtml(html, function(node) {
            "deferred" === node.type && deferredNodes.push(node);
          });
          var deferredValues = /* @__PURE__ */ Object.create(null);
          return promises.forEachSeries(deferredNodes, function(deferred) {
            return deferred.value().then(function(value) {
              deferredValues[deferred.id] = value;
            });
          }).then(function() {
            function replaceDeferred(nodes) {
              return flatMap(nodes, function(node) {
                return "deferred" === node.type ? deferredValues[node.id] : node.children ? [_.extend({}, node, { children: replaceDeferred(node.children) })] : [node];
              });
            }
            var writer = writers.writer({ prettyPrint: options.prettyPrint, outputFormat: options.outputFormat });
            return Html.write(writer, Html.simplify(replaceDeferred(html))), new results.Result(writer.asString(), messages);
          });
        }
        function convertElements(elements, messages, context) {
          return flatMap(elements, function(element) {
            return elementToHtml(element, messages, context);
          });
        }
        function elementToHtml(element, messages, context) {
          if (!context) throw new Error("context not set");
          var handler = elementConverters[element.type];
          return handler ? handler(element, messages, context) : [];
        }
        function convertParagraph(element, messages, context) {
          return htmlPathForParagraph(element, messages).wrap(function() {
            var content = convertElements(element.children, messages, context);
            return ignoreEmptyParagraphs ? content : [Html.forceWrite].concat(content);
          });
        }
        function htmlPathForParagraph(element, messages) {
          var style = findStyle(element);
          return style ? style.to : (element.styleId && messages.push(unrecognisedStyleWarning("paragraph", element)), defaultParagraphStyle);
        }
        function convertRun(run, messages, context) {
          var nodes = function() {
            return convertElements(run.children, messages, context);
          }, paths = [];
          if (null !== run.highlight) {
            var path = findHtmlPath({ type: "highlight", color: run.highlight });
            path && paths.push(path);
          }
          run.isSmallCaps && paths.push(findHtmlPathForRunProperty("smallCaps")), run.isAllCaps && paths.push(findHtmlPathForRunProperty("allCaps")), run.isStrikethrough && paths.push(findHtmlPathForRunProperty("strikethrough", "s")), run.isUnderline && paths.push(findHtmlPathForRunProperty("underline")), run.verticalAlignment === documents.verticalAlignment.subscript && paths.push(htmlPaths.element("sub", {}, { fresh: false })), run.verticalAlignment === documents.verticalAlignment.superscript && paths.push(htmlPaths.element("sup", {}, { fresh: false })), run.isItalic && paths.push(findHtmlPathForRunProperty("italic", "em")), run.isBold && paths.push(findHtmlPathForRunProperty("bold", "strong"));
          var stylePath = htmlPaths.empty, style = findStyle(run);
          return style ? stylePath = style.to : run.styleId && messages.push(unrecognisedStyleWarning("run", run)), paths.push(stylePath), paths.forEach(function(path2) {
            nodes = path2.wrap.bind(path2, nodes);
          }), nodes();
        }
        function findHtmlPathForRunProperty(elementType, defaultTagName) {
          var path = findHtmlPath({ type: elementType });
          return path ? path : defaultTagName ? htmlPaths.element(defaultTagName, {}, { fresh: false }) : htmlPaths.empty;
        }
        function findHtmlPath(element, defaultPath) {
          var style = findStyle(element);
          return style ? style.to : defaultPath;
        }
        function findStyle(element) {
          for (var i = 0; i < styleMap.length; i++) if (styleMap[i].from.matches(element)) return styleMap[i];
        }
        function recoveringConvertImage(convertImage) {
          return function(image, messages) {
            return promises["try"](function() {
              return convertImage(image, messages);
            })["catch"](function(error) {
              return messages.push(results.error(error)), [];
            });
          };
        }
        function noteHtmlId(note) {
          return referentHtmlId(note.noteType, note.noteId);
        }
        function noteRefHtmlId(note) {
          return referenceHtmlId(note.noteType, note.noteId);
        }
        function referentHtmlId(referenceType, referenceId) {
          return htmlId(referenceType + "-" + referenceId);
        }
        function referenceHtmlId(referenceType, referenceId) {
          return htmlId(referenceType + "-ref-" + referenceId);
        }
        function htmlId(suffix) {
          return idPrefix + suffix;
        }
        function convertTable(element, messages, context) {
          return findHtmlPath(element, defaultTablePath).wrap(function() {
            return convertTableChildren(element, messages, context);
          });
        }
        function convertTableChildren(element, messages, context) {
          var bodyIndex = _.findIndex(element.children, function(child) {
            return !child.type === documents.types.tableRow || !child.isHeader;
          });
          -1 === bodyIndex && (bodyIndex = element.children.length);
          var children;
          if (0 === bodyIndex) children = convertElements(element.children, messages, _.extend({}, context, { isTableHeader: false }));
          else {
            var headRows = convertElements(element.children.slice(0, bodyIndex), messages, _.extend({}, context, { isTableHeader: true })), bodyRows = convertElements(element.children.slice(bodyIndex), messages, _.extend({}, context, { isTableHeader: false }));
            children = [Html.freshElement("thead", {}, headRows), Html.freshElement("tbody", {}, bodyRows)];
          }
          return [Html.forceWrite].concat(children);
        }
        function convertTableRow(element, messages, context) {
          var children = convertElements(element.children, messages, context);
          return [Html.freshElement("tr", {}, [Html.forceWrite].concat(children))];
        }
        function convertTableCell(element, messages, context) {
          var tagName = context.isTableHeader ? "th" : "td", children = convertElements(element.children, messages, context), attributes = {};
          return 1 !== element.colSpan && (attributes.colspan = element.colSpan.toString()), 1 !== element.rowSpan && (attributes.rowspan = element.rowSpan.toString()), [Html.freshElement(tagName, attributes, [Html.forceWrite].concat(children))];
        }
        function convertCommentReference(reference, messages, context) {
          return findHtmlPath(reference, htmlPaths.ignore).wrap(function() {
            var comment = comments[reference.commentId], count = referencedComments.length + 1, label = "[" + commentAuthorLabel(comment) + count + "]";
            return referencedComments.push({ label, comment }), [Html.freshElement("a", { href: "#" + referentHtmlId("comment", reference.commentId), id: referenceHtmlId("comment", reference.commentId) }, [Html.text(label)])];
          });
        }
        function convertComment(referencedComment, messages, context) {
          var label = referencedComment.label, comment = referencedComment.comment, body = convertElements(comment.body, messages, context).concat([Html.nonFreshElement("p", {}, [Html.text(" "), Html.freshElement("a", { href: "#" + referenceHtmlId("comment", comment.commentId) }, [Html.text("↑")])])]);
          return [Html.freshElement("dt", { id: referentHtmlId("comment", comment.commentId) }, [Html.text("Comment " + label)]), Html.freshElement("dd", {}, body)];
        }
        function convertBreak(element, messages, context) {
          return htmlPathForBreak(element).wrap(function() {
            return [];
          });
        }
        function htmlPathForBreak(element) {
          var style = findStyle(element);
          return style ? style.to : "line" === element.breakType ? htmlPaths.topLevelElement("br") : htmlPaths.empty;
        }
        var noteNumber = 1, noteReferences = [], referencedComments = [];
        options = _.extend({ ignoreEmptyParagraphs: true }, options);
        var idPrefix = void 0 === options.idPrefix ? "" : options.idPrefix, ignoreEmptyParagraphs = options.ignoreEmptyParagraphs, defaultParagraphStyle = htmlPaths.topLevelElement("p"), styleMap = options.styleMap || [], defaultTablePath = htmlPaths.elements([htmlPaths.element("table", {}, { fresh: true })]), elementConverters = { document: function(document, messages, context) {
          var children = convertElements(document.children, messages, context), notes = noteReferences.map(function(noteReference) {
            return document.notes.resolve(noteReference);
          }), notesNodes = convertElements(notes, messages, context);
          return children.concat([Html.freshElement("ol", {}, notesNodes), Html.freshElement("dl", {}, flatMap(referencedComments, function(referencedComment) {
            return convertComment(referencedComment, messages, context);
          }))]);
        }, paragraph: convertParagraph, run: convertRun, text: function(element, messages, context) {
          return [Html.text(element.value)];
        }, tab: function(element, messages, context) {
          return [Html.text("	")];
        }, hyperlink: function(element, messages, context) {
          var href = element.anchor ? "#" + htmlId(element.anchor) : element.href, attributes = { href };
          null != element.targetFrame && (attributes.target = element.targetFrame);
          var children = convertElements(element.children, messages, context);
          return [Html.nonFreshElement("a", attributes, children)];
        }, checkbox: function(element) {
          var attributes = { type: "checkbox" };
          return element.checked && (attributes.checked = "checked"), [Html.freshElement("input", attributes)];
        }, bookmarkStart: function(element, messages, context) {
          var anchor = Html.freshElement("a", { id: htmlId(element.name) }, [Html.forceWrite]);
          return [anchor];
        }, noteReference: function(element, messages, context) {
          noteReferences.push(element);
          var anchor = Html.freshElement("a", { href: "#" + noteHtmlId(element), id: noteRefHtmlId(element) }, [Html.text("[" + noteNumber++ + "]")]);
          return [Html.freshElement("sup", {}, [anchor])];
        }, note: function(element, messages, context) {
          var children = convertElements(element.body, messages, context), backLink = Html.elementWithTag(htmlPaths.element("p", {}, { fresh: false }), [Html.text(" "), Html.freshElement("a", { href: "#" + noteRefHtmlId(element) }, [Html.text("↑")])]), body = children.concat([backLink]);
          return Html.freshElement("li", { id: noteHtmlId(element) }, body);
        }, commentReference: convertCommentReference, comment: convertComment, image: deferredConversion(recoveringConvertImage(options.convertImage || images.dataUri)), table: convertTable, tableRow: convertTableRow, tableCell: convertTableCell, "break": convertBreak };
        return { convertToHtml };
      }
      function deferredConversion(func) {
        return function(element, messages, context) {
          return [{ type: "deferred", id: deferredId++, value: function() {
            return func(element, messages, context);
          } }];
        };
      }
      function unrecognisedStyleWarning(type, element) {
        return results.warning("Unrecognised " + type + " style: '" + element.styleName + "' (Style ID: " + element.styleId + ")");
      }
      function flatMap(values, func) {
        return _.flatten(values.map(func), true);
      }
      function walkHtml(nodes, callback) {
        nodes.forEach(function(node) {
          callback(node), node.children && walkHtml(node.children, callback);
        });
      }
      var _ = require2("underscore"), promises = require2("./promises"), documents = require2("./documents"), htmlPaths = require2("./styles/html-paths"), results = require2("./results"), images = require2("./images"), Html = require2("./html"), writers = require2("./writers");
      exports2.DocumentConverter = DocumentConverter;
      var deferredId = 1, commentAuthorLabel = exports2.commentAuthorLabel = function(comment) {
        return comment.authorInitials || "";
      };
    }, { "./documents": 4, "./html": 18, "./images": 20, "./promises": 23, "./results": 25, "./styles/html-paths": 28, "./writers": 33, underscore: 67 }], 4: [function(require2, module2, exports2) {
      (function(Buffer) {
        function Document(children, options) {
          return options = options || {}, { type: types.document, children, notes: options.notes || new Notes({}), comments: options.comments || [] };
        }
        function Paragraph(children, properties) {
          properties = properties || {};
          var indent = properties.indent || {};
          return { type: types.paragraph, children, styleId: properties.styleId || null, styleName: properties.styleName || null, numbering: properties.numbering || null, alignment: properties.alignment || null, indent: { start: indent.start || null, end: indent.end || null, firstLine: indent.firstLine || null, hanging: indent.hanging || null } };
        }
        function Run(children, properties) {
          return properties = properties || {}, { type: types.run, children, styleId: properties.styleId || null, styleName: properties.styleName || null, isBold: !!properties.isBold, isUnderline: !!properties.isUnderline, isItalic: !!properties.isItalic, isStrikethrough: !!properties.isStrikethrough, isAllCaps: !!properties.isAllCaps, isSmallCaps: !!properties.isSmallCaps, verticalAlignment: properties.verticalAlignment || verticalAlignment.baseline, font: properties.font || null, fontSize: properties.fontSize || null, highlight: properties.highlight || null };
        }
        function Text(value) {
          return { type: types.text, value };
        }
        function Tab() {
          return { type: types.tab };
        }
        function Checkbox(options) {
          return { type: types.checkbox, checked: options.checked };
        }
        function Hyperlink(children, options) {
          return { type: types.hyperlink, children, href: options.href, anchor: options.anchor, targetFrame: options.targetFrame };
        }
        function NoteReference(options) {
          return { type: types.noteReference, noteType: options.noteType, noteId: options.noteId };
        }
        function Notes(notes) {
          this._notes = _.indexBy(notes, function(note) {
            return noteKey(note.noteType, note.noteId);
          });
        }
        function Note(options) {
          return { type: types.note, noteType: options.noteType, noteId: options.noteId, body: options.body };
        }
        function commentReference(options) {
          return { type: types.commentReference, commentId: options.commentId };
        }
        function comment(options) {
          return { type: types.comment, commentId: options.commentId, body: options.body, authorName: options.authorName, authorInitials: options.authorInitials };
        }
        function noteKey(noteType, id) {
          return noteType + "-" + id;
        }
        function Image(options) {
          return { type: types.image, read: function(encoding) {
            return encoding ? options.readImage(encoding) : options.readImage().then(function(arrayBuffer) {
              return Buffer.from(arrayBuffer);
            });
          }, readAsArrayBuffer: function() {
            return options.readImage();
          }, readAsBase64String: function() {
            return options.readImage("base64");
          }, readAsBuffer: function() {
            return options.readImage().then(function(arrayBuffer) {
              return Buffer.from(arrayBuffer);
            });
          }, altText: options.altText, contentType: options.contentType };
        }
        function Table(children, properties) {
          return properties = properties || {}, { type: types.table, children, styleId: properties.styleId || null, styleName: properties.styleName || null };
        }
        function TableRow(children, options) {
          return options = options || {}, { type: types.tableRow, children, isHeader: options.isHeader || false };
        }
        function TableCell(children, options) {
          return options = options || {}, { type: types.tableCell, children, colSpan: null == options.colSpan ? 1 : options.colSpan, rowSpan: null == options.rowSpan ? 1 : options.rowSpan };
        }
        function Break(breakType) {
          return { type: types["break"], breakType };
        }
        function BookmarkStart(options) {
          return { type: types.bookmarkStart, name: options.name };
        }
        var _ = require2("underscore"), types = exports2.types = { document: "document", paragraph: "paragraph", run: "run", text: "text", tab: "tab", checkbox: "checkbox", hyperlink: "hyperlink", noteReference: "noteReference", image: "image", note: "note", commentReference: "commentReference", comment: "comment", table: "table", tableRow: "tableRow", tableCell: "tableCell", "break": "break", bookmarkStart: "bookmarkStart" }, verticalAlignment = { baseline: "baseline", superscript: "superscript", subscript: "subscript" };
        Notes.prototype.resolve = function(reference) {
          return this.findNoteByKey(noteKey(reference.noteType, reference.noteId));
        }, Notes.prototype.findNoteByKey = function(key) {
          return this._notes[key] || null;
        }, exports2.document = exports2.Document = Document, exports2.paragraph = exports2.Paragraph = Paragraph, exports2.run = exports2.Run = Run, exports2.text = exports2.Text = Text, exports2.tab = exports2.Tab = Tab, exports2.checkbox = exports2.Checkbox = Checkbox, exports2.Hyperlink = Hyperlink, exports2.noteReference = exports2.NoteReference = NoteReference, exports2.Notes = Notes, exports2.Note = Note, exports2.commentReference = commentReference, exports2.comment = comment, exports2.Image = Image, exports2.Table = Table, exports2.TableRow = TableRow, exports2.TableCell = TableCell, exports2.lineBreak = Break("line"), exports2.pageBreak = Break("page"), exports2.columnBreak = Break("column"), exports2.BookmarkStart = BookmarkStart, exports2.verticalAlignment = verticalAlignment;
      }).call(this, require2("buffer").Buffer);
    }, { buffer: 48, underscore: 67 }], 5: [function(require2, module2, exports2) {
      function createBodyReader(options) {
        return { readXmlElement: function(element) {
          return new BodyReader(options).readXmlElement(element);
        }, readXmlElements: function(elements) {
          return new BodyReader(options).readXmlElements(elements);
        } };
      }
      function BodyReader(options) {
        function readXmlElements(elements) {
          var results = elements.map(readXmlElement);
          return combineResults(results);
        }
        function readXmlElement(element) {
          if ("element" === element.type) {
            var handler = xmlElementReaders[element.name];
            if (handler) return handler(element);
            if (!Object.prototype.hasOwnProperty.call(ignoreElements, element.name)) {
              var message = warning("An unrecognised element was ignored: " + element.name);
              return emptyResultWithMessages([message]);
            }
          }
          return emptyResult();
        }
        function readParagraphProperties(element) {
          return readParagraphStyle(element).map(function(style) {
            return { type: "paragraphProperties", styleId: style.styleId, styleName: style.name, alignment: element.firstOrEmpty("w:jc").attributes["w:val"], numbering: readNumberingProperties(style.styleId, element.firstOrEmpty("w:numPr"), numbering), indent: readParagraphIndent(element.firstOrEmpty("w:ind")) };
          });
        }
        function readParagraphIndent(element) {
          return { start: element.attributes["w:start"] || element.attributes["w:left"], end: element.attributes["w:end"] || element.attributes["w:right"], firstLine: element.attributes["w:firstLine"], hanging: element.attributes["w:hanging"] };
        }
        function readRunProperties(element) {
          return readRunStyle(element).map(function(style) {
            var fontSizeString = element.firstOrEmpty("w:sz").attributes["w:val"], fontSize = /^[0-9]+$/.test(fontSizeString) ? parseInt(fontSizeString, 10) / 2 : null;
            return { type: "runProperties", styleId: style.styleId, styleName: style.name, verticalAlignment: element.firstOrEmpty("w:vertAlign").attributes["w:val"], font: element.firstOrEmpty("w:rFonts").attributes["w:ascii"], fontSize, isBold: readBooleanElement(element.first("w:b")), isUnderline: readUnderline(element.first("w:u")), isItalic: readBooleanElement(element.first("w:i")), isStrikethrough: readBooleanElement(element.first("w:strike")), isAllCaps: readBooleanElement(element.first("w:caps")), isSmallCaps: readBooleanElement(element.first("w:smallCaps")), highlight: readHighlightValue(element.firstOrEmpty("w:highlight").attributes["w:val"]) };
          });
        }
        function readUnderline(element) {
          if (element) {
            var value = element.attributes["w:val"];
            return void 0 !== value && "false" !== value && "0" !== value && "none" !== value;
          }
          return false;
        }
        function readBooleanElement(element) {
          if (element) {
            var value = element.attributes["w:val"];
            return "false" !== value && "0" !== value;
          }
          return false;
        }
        function readBooleanAttributeValue(value) {
          return "false" !== value && "0" !== value;
        }
        function readHighlightValue(value) {
          return value && "none" !== value ? value : null;
        }
        function readParagraphStyle(element) {
          return readStyle(element, "w:pStyle", "Paragraph", styles.findParagraphStyleById);
        }
        function readRunStyle(element) {
          return readStyle(element, "w:rStyle", "Run", styles.findCharacterStyleById);
        }
        function readTableStyle(element) {
          return readStyle(element, "w:tblStyle", "Table", styles.findTableStyleById);
        }
        function readStyle(element, styleTagName, styleType, findStyleById) {
          var messages = [], styleElement = element.first(styleTagName), styleId = null, name = null;
          if (styleElement && (styleId = styleElement.attributes["w:val"])) {
            var style = findStyleById(styleId);
            style ? name = style.name : messages.push(undefinedStyleWarning(styleType, styleId));
          }
          return elementResultWithMessages({ styleId, name }, messages);
        }
        function readFldChar(element) {
          var type = element.attributes["w:fldCharType"];
          if ("begin" === type) complexFieldStack.push({ type: "begin", fldChar: element }), currentInstrText = [];
          else if ("end" === type) {
            if (0 === complexFieldStack.length) return emptyResultWithMessages([warning("Ignoring complex field end character without corresponding start character")]);
            var complexFieldEnd = complexFieldStack.pop();
            if ("begin" === complexFieldEnd.type && (complexFieldEnd = parseCurrentInstrText(complexFieldEnd)), "checkbox" === complexFieldEnd.type) return elementResult(documents.checkbox({ checked: complexFieldEnd.checked }));
          } else if ("separate" === type) {
            if (0 === complexFieldStack.length) return emptyResultWithMessages([warning("Ignoring complex field separator character without corresponding start character")]);
            var complexFieldSeparate = complexFieldStack.pop(), complexField = parseCurrentInstrText(complexFieldSeparate);
            complexFieldStack.push(complexField);
          }
          return emptyResult();
        }
        function currentHyperlinkOptions() {
          var topHyperlink = _.last(complexFieldStack.filter(function(complexField) {
            return "hyperlink" === complexField.type;
          }));
          return topHyperlink ? topHyperlink.options : null;
        }
        function parseCurrentInstrText(complexField) {
          return parseInstrText(currentInstrText.join(""), "begin" === complexField.type ? complexField.fldChar : xml.emptyElement);
        }
        function parseInstrText(instrText, fldChar) {
          var linkResult = /^\s*HYPERLINK\s+(\\l\s+)?(?:"(.*)"|([^\\]\S*))/.exec(instrText);
          if (linkResult) {
            var location = void 0 === linkResult[2] ? linkResult[3] : linkResult[2], options2 = void 0 === linkResult[1] ? { href: location } : { anchor: location };
            return { type: "hyperlink", options: options2 };
          }
          var checkboxResult = /\s*FORMCHECKBOX\s*/.exec(instrText);
          if (checkboxResult) {
            var checkboxElement = fldChar.firstOrEmpty("w:ffData").firstOrEmpty("w:checkBox"), checkedElement = checkboxElement.first("w:checked"), checked = readBooleanElement(null == checkedElement ? checkboxElement.first("w:default") : checkedElement);
            return { type: "checkbox", checked };
          }
          return { type: "unknown" };
        }
        function readInstrText(element) {
          return currentInstrText.push(element.text()), emptyResult();
        }
        function readSymbol(element) {
          var font = element.attributes["w:font"], char = element.attributes["w:char"], unicodeCharacter = dingbatToUnicode.hex(font, char);
          return null == unicodeCharacter && /^F0..$/.test(char) && (unicodeCharacter = dingbatToUnicode.hex(font, char.substring(2))), null == unicodeCharacter ? emptyResultWithMessages([warning("A w:sym element with an unsupported character was ignored: char " + char + " in font " + font)]) : elementResult(new documents.Text(unicodeCharacter.string));
        }
        function noteReferenceReader(noteType) {
          return function(element) {
            var noteId = element.attributes["w:id"];
            return elementResult(new documents.NoteReference({ noteType, noteId }));
          };
        }
        function readCommentReference(element) {
          return elementResult(documents.commentReference({ commentId: element.attributes["w:id"] }));
        }
        function readChildElements(element) {
          return readXmlElements(element.children);
        }
        function readTable(element) {
          var propertiesResult = readTableProperties(element.firstOrEmpty("w:tblPr"));
          return readXmlElements(element.children).flatMap(calculateRowSpans).flatMap(function(children) {
            return propertiesResult.map(function(properties) {
              return documents.Table(children, properties);
            });
          });
        }
        function readTableProperties(element) {
          return readTableStyle(element).map(function(style) {
            return { styleId: style.styleId, styleName: style.name };
          });
        }
        function readTableRow(element) {
          var properties = element.firstOrEmpty("w:trPr"), isDeleted = !!properties.first("w:del");
          if (isDeleted) return emptyResult();
          var isHeader = !!properties.first("w:tblHeader");
          return readXmlElements(element.children).map(function(children) {
            return documents.TableRow(children, { isHeader });
          });
        }
        function readTableCell(element) {
          return readXmlElements(element.children).map(function(children) {
            var properties = element.firstOrEmpty("w:tcPr"), gridSpan = properties.firstOrEmpty("w:gridSpan").attributes["w:val"], colSpan = gridSpan ? parseInt(gridSpan, 10) : 1, cell = documents.TableCell(children, { colSpan });
            return cell._vMerge = readVMerge(properties), cell;
          });
        }
        function readVMerge(properties) {
          var element = properties.first("w:vMerge");
          if (element) {
            var val = element.attributes["w:val"];
            return "continue" === val || !val;
          }
          return null;
        }
        function calculateRowSpans(rows) {
          var unexpectedNonRows = _.any(rows, function(row) {
            return row.type !== documents.types.tableRow;
          });
          if (unexpectedNonRows) return removeVMergeProperties(rows), elementResultWithMessages(rows, [warning("unexpected non-row element in table, cell merging may be incorrect")]);
          var unexpectedNonCells = _.any(rows, function(row) {
            return _.any(row.children, function(cell) {
              return cell.type !== documents.types.tableCell;
            });
          });
          if (unexpectedNonCells) return removeVMergeProperties(rows), elementResultWithMessages(rows, [warning("unexpected non-cell element in table row, cell merging may be incorrect")]);
          var columns = {};
          return rows.forEach(function(row) {
            var cellIndex = 0;
            row.children.forEach(function(cell) {
              cell._vMerge && columns[cellIndex] ? columns[cellIndex].rowSpan++ : (columns[cellIndex] = cell, cell._vMerge = false), cellIndex += cell.colSpan;
            });
          }), rows.forEach(function(row) {
            row.children = row.children.filter(function(cell) {
              return !cell._vMerge;
            }), row.children.forEach(function(cell) {
              delete cell._vMerge;
            });
          }), elementResult(rows);
        }
        function removeVMergeProperties(rows) {
          rows.forEach(function(row) {
            var cells = transforms.getDescendantsOfType(row, documents.types.tableCell);
            cells.forEach(function(cell) {
              delete cell._vMerge;
            });
          });
        }
        function readDrawingElement(element) {
          var blips = element.getElementsByTagName("a:graphic").getElementsByTagName("a:graphicData").getElementsByTagName("pic:pic").getElementsByTagName("pic:blipFill").getElementsByTagName("a:blip");
          return combineResults(blips.map(readBlip.bind(null, element)));
        }
        function readBlip(element, blip) {
          var propertiesElement = element.firstOrEmpty("wp:docPr"), properties = propertiesElement.attributes, altText = isBlank(properties.descr) ? properties.title : properties.descr, blipImageFile = findBlipImageFile(blip);
          return null === blipImageFile ? emptyResultWithMessages([warning("Could not find image file for a:blip element")]) : readImage(blipImageFile, altText).map(function(imageElement) {
            var hlinkClickElement = propertiesElement.firstOrEmpty("a:hlinkClick"), relationshipId = hlinkClickElement.attributes["r:id"];
            if (relationshipId) {
              var href = relationships.findTargetByRelationshipId(relationshipId);
              return new documents.Hyperlink([imageElement], { href });
            }
            return imageElement;
          });
        }
        function isBlank(value) {
          return null == value || /^\s*$/.test(value);
        }
        function findBlipImageFile(blip) {
          var embedRelationshipId = blip.attributes["r:embed"], linkRelationshipId = blip.attributes["r:link"];
          if (embedRelationshipId) return findEmbeddedImageFile(embedRelationshipId);
          if (linkRelationshipId) {
            var imagePath = relationships.findTargetByRelationshipId(linkRelationshipId);
            return { path: imagePath, read: files.read.bind(files, imagePath) };
          }
          return null;
        }
        function readImageData(element) {
          var relationshipId = element.attributes["r:id"];
          return relationshipId ? readImage(findEmbeddedImageFile(relationshipId), element.attributes["o:title"]) : emptyResultWithMessages([warning("A v:imagedata element without a relationship ID was ignored")]);
        }
        function findEmbeddedImageFile(relationshipId) {
          var path = uris.uriToZipEntryName("word", relationships.findTargetByRelationshipId(relationshipId));
          return { path, read: docxFile.read.bind(docxFile, path) };
        }
        function readImage(imageFile, altText) {
          var contentType = contentTypes.findContentType(imageFile.path), image = documents.Image({ readImage: imageFile.read, altText, contentType }), warnings = supportedImageTypes[contentType] ? [] : warning("Image of type " + contentType + " is unlikely to display in web browsers");
          return elementResultWithMessages(image, warnings);
        }
        function undefinedStyleWarning(type, styleId) {
          return warning(type + " style with ID " + styleId + " was referenced but not defined in the document");
        }
        var complexFieldStack = [], currentInstrText = [], deletedParagraphContents = [], relationships = options.relationships, contentTypes = options.contentTypes, docxFile = options.docxFile, files = options.files, numbering = options.numbering, styles = options.styles, xmlElementReaders = {
          "w:p": function(element) {
            var paragraphPropertiesElement = element.firstOrEmpty("w:pPr"), isDeleted = !!paragraphPropertiesElement.firstOrEmpty("w:rPr").first("w:del");
            if (isDeleted) return element.children.forEach(function(child) {
              deletedParagraphContents.push(child);
            }), emptyResult();
            var childrenXml = element.children;
            return deletedParagraphContents.length > 0 && (childrenXml = deletedParagraphContents.concat(childrenXml), deletedParagraphContents = []), ReadResult.map(readParagraphProperties(paragraphPropertiesElement), readXmlElements(childrenXml), function(properties, children) {
              return new documents.Paragraph(children, properties);
            }).insertExtra();
          },
          "w:r": function(element) {
            return ReadResult.map(readRunProperties(element.firstOrEmpty("w:rPr")), readXmlElements(element.children), function(properties, children) {
              var hyperlinkOptions = currentHyperlinkOptions();
              return null !== hyperlinkOptions && (children = [new documents.Hyperlink(children, hyperlinkOptions)]), new documents.Run(children, properties);
            });
          },
          "w:fldChar": readFldChar,
          "w:instrText": readInstrText,
          "w:t": function(element) {
            return elementResult(new documents.Text(element.text()));
          },
          "w:tab": function(element) {
            return elementResult(new documents.Tab());
          },
          "w:noBreakHyphen": function() {
            return elementResult(new documents.Text("‑"));
          },
          "w:softHyphen": function(element) {
            return elementResult(new documents.Text("­"));
          },
          "w:sym": readSymbol,
          "w:hyperlink": function(element) {
            var relationshipId = element.attributes["r:id"], anchor = element.attributes["w:anchor"];
            return readXmlElements(element.children).map(function(children) {
              function create(options2) {
                var targetFrame = element.attributes["w:tgtFrame"] || null;
                return new documents.Hyperlink(children, _.extend({ targetFrame }, options2));
              }
              if (relationshipId) {
                var href = relationships.findTargetByRelationshipId(relationshipId);
                return anchor && (href = uris.replaceFragment(href, anchor)), create({ href });
              }
              return anchor ? create({ anchor }) : children;
            });
          },
          "w:tbl": readTable,
          "w:tr": readTableRow,
          "w:tc": readTableCell,
          "w:footnoteReference": noteReferenceReader("footnote"),
          "w:endnoteReference": noteReferenceReader("endnote"),
          "w:commentReference": readCommentReference,
          "w:br": function(element) {
            var breakType = element.attributes["w:type"];
            return null == breakType || "textWrapping" === breakType ? elementResult(documents.lineBreak) : "page" === breakType ? elementResult(documents.pageBreak) : "column" === breakType ? elementResult(documents.columnBreak) : emptyResultWithMessages([warning("Unsupported break type: " + breakType)]);
          },
          "w:bookmarkStart": function(element) {
            var name = element.attributes["w:name"];
            return "_GoBack" === name ? emptyResult() : elementResult(new documents.BookmarkStart({ name }));
          },
          "mc:AlternateContent": function(element) {
            return readChildElements(element.firstOrEmpty("mc:Fallback"));
          },
          "w:sdt": function(element) {
            var contentResult = readXmlElements(element.firstOrEmpty("w:sdtContent").children);
            return contentResult.map(function(content) {
              var checkbox = element.firstOrEmpty("w:sdtPr").first("wordml:checkbox");
              if (checkbox) {
                var checkedElement = checkbox.first("wordml:checked"), isChecked = !!checkedElement && readBooleanAttributeValue(checkedElement.attributes["wordml:val"]), documentCheckbox = documents.checkbox({ checked: isChecked }), hasCheckbox = false, replacedContent = content.map(transforms._elementsOfType(documents.types.text, function(text) {
                  return text.value.length > 0 && !hasCheckbox ? (hasCheckbox = true, documentCheckbox) : text;
                }));
                return hasCheckbox ? replacedContent : documentCheckbox;
              }
              return content;
            });
          },
          "w:customXml": readChildElements,
          "w:ins": readChildElements,
          "w:moveFromRangeEnd": readChildElements,
          "w:moveFromRangeStart": readChildElements,
          "w:moveTo": readChildElements,
          "w:moveToRangeEnd": readChildElements,
          "w:moveToRangeStart": readChildElements,
          "w:object": readChildElements,
          "w:smartTag": readChildElements,
          "w:drawing": readChildElements,
          "w:pict": function(element) {
            return readChildElements(element).toExtra();
          },
          "v:roundrect": readChildElements,
          "v:shape": readChildElements,
          "v:textbox": readChildElements,
          "w:txbxContent": readChildElements,
          "wp:inline": readDrawingElement,
          "wp:anchor": readDrawingElement,
          "v:imagedata": readImageData,
          "v:group": readChildElements,
          "v:rect": readChildElements
        };
        return { readXmlElement, readXmlElements };
      }
      function readNumberingProperties(styleId, element, numbering) {
        var level = element.firstOrEmpty("w:ilvl").attributes["w:val"], numId = element.firstOrEmpty("w:numId").attributes["w:val"];
        if (void 0 !== level && void 0 !== numId) return numbering.findLevel(numId, level);
        if (null != styleId) {
          var levelByStyleId = numbering.findLevelByParagraphStyleId(styleId);
          if (null != levelByStyleId) return levelByStyleId;
        }
        return void 0 !== numId ? numbering.findLevel(numId, "0") : null;
      }
      function emptyResultWithMessages(messages) {
        return new ReadResult(null, null, messages);
      }
      function emptyResult() {
        return new ReadResult(null);
      }
      function elementResult(element) {
        return new ReadResult(element);
      }
      function elementResultWithMessages(element, messages) {
        return new ReadResult(element, null, messages);
      }
      function ReadResult(element, extra, messages) {
        this.value = element || [], this.extra = extra || [], this._result = new Result({ element: this.value, extra }, messages), this.messages = this._result.messages;
      }
      function combineResults(results) {
        var result = Result.combine(_.pluck(results, "_result"));
        return new ReadResult(_.flatten(_.pluck(result.value, "element")), _.filter(_.flatten(_.pluck(result.value, "extra")), identity), result.messages);
      }
      function joinElements(first, second) {
        return _.flatten([first, second]);
      }
      function identity(value) {
        return value;
      }
      exports2.createBodyReader = createBodyReader, exports2._readNumberingProperties = readNumberingProperties;
      var dingbatToUnicode = require2("dingbat-to-unicode"), _ = require2("underscore"), documents = require2("../documents"), Result = require2("../results").Result, warning = require2("../results").warning, xml = require2("../xml"), transforms = require2("../transforms"), uris = require2("./uris"), supportedImageTypes = { "image/png": true, "image/gif": true, "image/jpeg": true, "image/svg+xml": true, "image/tiff": true }, ignoreElements = { "office-word:wrap": true, "v:shadow": true, "v:shapetype": true, "w:annotationRef": true, "w:bookmarkEnd": true, "w:sectPr": true, "w:proofErr": true, "w:lastRenderedPageBreak": true, "w:commentRangeStart": true, "w:commentRangeEnd": true, "w:del": true, "w:footnoteRef": true, "w:endnoteRef": true, "w:moveFrom": true, "w:pPr": true, "w:rPr": true, "w:tblPr": true, "w:tblGrid": true, "w:trPr": true, "w:tcPr": true };
      ReadResult.prototype.toExtra = function() {
        return new ReadResult(null, joinElements(this.extra, this.value), this.messages);
      }, ReadResult.prototype.insertExtra = function() {
        var extra = this.extra;
        return extra && extra.length ? new ReadResult(joinElements(this.value, extra), null, this.messages) : this;
      }, ReadResult.prototype.map = function(func) {
        var result = this._result.map(function(value) {
          return func(value.element);
        });
        return new ReadResult(result.value, this.extra, result.messages);
      }, ReadResult.prototype.flatMap = function(func) {
        var result = this._result.flatMap(function(value) {
          return func(value.element)._result;
        });
        return new ReadResult(result.value.element, joinElements(this.extra, result.value.extra), result.messages);
      }, ReadResult.map = function(first, second, func) {
        return new ReadResult(func(first.value, second.value), joinElements(first.extra, second.extra), first.messages.concat(second.messages));
      };
    }, { "../documents": 4, "../results": 25, "../transforms": 30, "../xml": 35, "./uris": 16, "dingbat-to-unicode": 50, underscore: 67 }], 6: [function(require2, module2, exports2) {
      function createCommentsReader(bodyReader) {
        function readCommentsXml(element) {
          return Result.combine(element.getElementsByTagName("w:comment").map(readCommentElement));
        }
        function readCommentElement(element) {
          function readOptionalAttribute(name) {
            return (element.attributes[name] || "").trim() || null;
          }
          var id = element.attributes["w:id"];
          return bodyReader.readXmlElements(element.children).map(function(body) {
            return documents.comment({ commentId: id, body, authorName: readOptionalAttribute("w:author"), authorInitials: readOptionalAttribute("w:initials") });
          });
        }
        return readCommentsXml;
      }
      var documents = require2("../documents"), Result = require2("../results").Result;
      exports2.createCommentsReader = createCommentsReader;
    }, { "../documents": 4, "../results": 25 }], 7: [function(require2, module2, exports2) {
      function readContentTypesFromXml(element) {
        var extensionDefaults = /* @__PURE__ */ Object.create(null), overrides = /* @__PURE__ */ Object.create(null);
        return element.children.forEach(function(child) {
          if ("content-types:Default" === child.name && (extensionDefaults[child.attributes.Extension] = child.attributes.ContentType), "content-types:Override" === child.name) {
            var name = child.attributes.PartName;
            "/" === name.charAt(0) && (name = name.substring(1)), overrides[name] = child.attributes.ContentType;
          }
        }), contentTypes(overrides, extensionDefaults);
      }
      function contentTypes(overrides, extensionDefaults) {
        return { findContentType: function(path) {
          var overrideContentType = overrides[path];
          if (overrideContentType) return overrideContentType;
          var pathParts = path.split("."), extension = pathParts[pathParts.length - 1];
          if (Object.prototype.hasOwnProperty.call(extensionDefaults, extension)) return extensionDefaults[extension];
          var fallback = fallbackContentTypes[extension.toLowerCase()];
          return fallback ? "image/" + fallback : null;
        } };
      }
      exports2.readContentTypesFromXml = readContentTypesFromXml;
      var fallbackContentTypes = { png: "png", gif: "gif", jpeg: "jpeg", jpg: "jpeg", tif: "tiff", tiff: "tiff", bmp: "bmp" };
      exports2.defaultContentTypes = contentTypes({}, {});
    }, {}], 8: [function(require2, module2, exports2) {
      function DocumentXmlReader(options) {
        function convertXmlToDocument(element) {
          var body = element.first("w:body");
          if (null == body) throw new Error("Could not find the body element: are you sure this is a docx file?");
          var result = bodyReader.readXmlElements(body.children).map(function(children) {
            return new documents.Document(children, { notes: options.notes, comments: options.comments });
          });
          return new Result(result.value, result.messages);
        }
        var bodyReader = options.bodyReader;
        return { convertXmlToDocument };
      }
      exports2.DocumentXmlReader = DocumentXmlReader;
      var documents = require2("../documents"), Result = require2("../results").Result;
    }, { "../documents": 4, "../results": 25 }], 9: [function(require2, module2, exports2) {
      function read(docxFile, input, options) {
        input = input || {}, options = options || {};
        var files = new Files({ externalFileAccess: options.externalFileAccess, relativeToFile: input.path });
        return promises.props({ contentTypes: readContentTypesFromZipFile(docxFile), partPaths: findPartPaths(docxFile), docxFile, files }).also(function(result) {
          return { styles: readStylesFromZipFile(docxFile, result.partPaths.styles) };
        }).also(function(result) {
          return { numbering: readNumberingFromZipFile(docxFile, result.partPaths.numbering, result.styles) };
        }).also(function(result) {
          return { footnotes: readXmlFileWithBody(result.partPaths.footnotes, result, function(bodyReader, xml) {
            return xml ? notesReader.createFootnotesReader(bodyReader)(xml) : new Result([]);
          }), endnotes: readXmlFileWithBody(result.partPaths.endnotes, result, function(bodyReader, xml) {
            return xml ? notesReader.createEndnotesReader(bodyReader)(xml) : new Result([]);
          }), comments: readXmlFileWithBody(result.partPaths.comments, result, function(bodyReader, xml) {
            return xml ? commentsReader.createCommentsReader(bodyReader)(xml) : new Result([]);
          }) };
        }).also(function(result) {
          return { notes: result.footnotes.flatMap(function(footnotes) {
            return result.endnotes.map(function(endnotes) {
              return new documents.Notes(footnotes.concat(endnotes));
            });
          }) };
        }).then(function(result) {
          return readXmlFileWithBody(result.partPaths.mainDocument, result, function(bodyReader, xml) {
            return result.notes.flatMap(function(notes) {
              return result.comments.flatMap(function(comments) {
                var reader = new DocumentXmlReader({ bodyReader, notes, comments });
                return reader.convertXmlToDocument(xml);
              });
            });
          });
        });
      }
      function findPartPaths(docxFile) {
        return readPackageRelationships(docxFile).then(function(packageRelationships) {
          var mainDocumentPath = findPartPath({ docxFile, relationships: packageRelationships, relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", basePath: "", fallbackPath: "word/document.xml" });
          if (!docxFile.exists(mainDocumentPath)) throw new Error("Could not find main document part. Are you sure this is a valid .docx file?");
          return xmlFileReader({ filename: relationshipsFilename(mainDocumentPath), readElement: relationshipsReader.readRelationships, defaultValue: relationshipsReader.defaultValue })(docxFile).then(function(documentRelationships) {
            function findPartRelatedToMainDocument(name) {
              return findPartPath({ docxFile, relationships: documentRelationships, relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/" + name, basePath: zipfile.splitPath(mainDocumentPath).dirname, fallbackPath: "word/" + name + ".xml" });
            }
            return { mainDocument: mainDocumentPath, comments: findPartRelatedToMainDocument("comments"), endnotes: findPartRelatedToMainDocument("endnotes"), footnotes: findPartRelatedToMainDocument("footnotes"), numbering: findPartRelatedToMainDocument("numbering"), styles: findPartRelatedToMainDocument("styles") };
          });
        });
      }
      function findPartPath(options) {
        var docxFile = options.docxFile, relationships = options.relationships, relationshipType = options.relationshipType, basePath = options.basePath, fallbackPath = options.fallbackPath, targets = relationships.findTargetsByType(relationshipType), normalisedTargets = targets.map(function(target) {
          return stripPrefix(zipfile.joinPath(basePath, target), "/");
        }), validTargets = normalisedTargets.filter(function(target) {
          return docxFile.exists(target);
        });
        return 0 === validTargets.length ? fallbackPath : validTargets[0];
      }
      function stripPrefix(value, prefix) {
        return value.substring(0, prefix.length) === prefix ? value.substring(prefix.length) : value;
      }
      function xmlFileReader(options) {
        return function(zipFile) {
          return readXmlFromZipFile(zipFile, options.filename).then(function(element) {
            return element ? options.readElement(element) : options.defaultValue;
          });
        };
      }
      function readXmlFileWithBody(filename, options, func) {
        var readRelationshipsFromZipFile = xmlFileReader({ filename: relationshipsFilename(filename), readElement: relationshipsReader.readRelationships, defaultValue: relationshipsReader.defaultValue });
        return readRelationshipsFromZipFile(options.docxFile).then(function(relationships) {
          var bodyReader = new createBodyReader({ relationships, contentTypes: options.contentTypes, docxFile: options.docxFile, numbering: options.numbering, styles: options.styles, files: options.files });
          return readXmlFromZipFile(options.docxFile, filename).then(function(xml) {
            return func(bodyReader, xml);
          });
        });
      }
      function relationshipsFilename(filename) {
        var split = zipfile.splitPath(filename);
        return zipfile.joinPath(split.dirname, "_rels", split.basename + ".rels");
      }
      function readNumberingFromZipFile(zipFile, path, styles) {
        return xmlFileReader({ filename: path, readElement: function(element) {
          return numberingXml.readNumberingXml(element, { styles });
        }, defaultValue: numberingXml.defaultNumbering })(zipFile);
      }
      function readStylesFromZipFile(zipFile, path) {
        return xmlFileReader({ filename: path, readElement: stylesReader.readStylesXml, defaultValue: stylesReader.defaultStyles })(zipFile);
      }
      exports2.read = read, exports2._findPartPaths = findPartPaths;
      var promises = require2("../promises"), documents = require2("../documents"), Result = require2("../results").Result, zipfile = require2("../zipfile"), readXmlFromZipFile = require2("./office-xml-reader").readXmlFromZipFile, createBodyReader = require2("./body-reader").createBodyReader, DocumentXmlReader = require2("./document-xml-reader").DocumentXmlReader, relationshipsReader = require2("./relationships-reader"), contentTypesReader = require2("./content-types-reader"), numberingXml = require2("./numbering-xml"), stylesReader = require2("./styles-reader"), notesReader = require2("./notes-reader"), commentsReader = require2("./comments-reader"), Files = require2("./files").Files, readContentTypesFromZipFile = xmlFileReader({ filename: "[Content_Types].xml", readElement: contentTypesReader.readContentTypesFromXml, defaultValue: contentTypesReader.defaultContentTypes }), readPackageRelationships = xmlFileReader({ filename: "_rels/.rels", readElement: relationshipsReader.readRelationships, defaultValue: relationshipsReader.defaultValue });
    }, { "../documents": 4, "../promises": 23, "../results": 25, "../zipfile": 40, "./body-reader": 5, "./comments-reader": 6, "./content-types-reader": 7, "./document-xml-reader": 8, "./files": 1, "./notes-reader": 10, "./numbering-xml": 11, "./office-xml-reader": 12, "./relationships-reader": 13, "./styles-reader": 15 }], 10: [function(require2, module2, exports2) {
      function createReader(noteType, bodyReader) {
        function readNotesXml(element) {
          return Result.combine(element.getElementsByTagName("w:" + noteType).filter(isFootnoteElement).map(readFootnoteElement));
        }
        function isFootnoteElement(element) {
          var type = element.attributes["w:type"];
          return "continuationSeparator" !== type && "separator" !== type;
        }
        function readFootnoteElement(footnoteElement) {
          var id = footnoteElement.attributes["w:id"];
          return bodyReader.readXmlElements(footnoteElement.children).map(function(body) {
            return documents.Note({ noteType, noteId: id, body });
          });
        }
        return readNotesXml;
      }
      var documents = require2("../documents"), Result = require2("../results").Result;
      exports2.createFootnotesReader = createReader.bind(this, "footnote"), exports2.createEndnotesReader = createReader.bind(this, "endnote");
    }, { "../documents": 4, "../results": 25 }], 11: [function(require2, module2, exports2) {
      function Numbering(nums, abstractNums, styles) {
        function findLevel(numId, level) {
          return findLevelWithSeenNumIds(numId, level, /* @__PURE__ */ Object.create(null));
        }
        function findLevelWithSeenNumIds(numId, level, seenNumIds) {
          if (seenNumIds[numId]) return null;
          seenNumIds[numId] = true;
          var num = nums[numId];
          if (!num) return null;
          var abstractNum = abstractNums[num.abstractNumId];
          if (abstractNum) {
            if (null == abstractNum.numStyleLink) return abstractNums[num.abstractNumId].levels[level];
            var style = styles.findNumberingStyleById(abstractNum.numStyleLink);
            return findLevelWithSeenNumIds(style.numId, level, seenNumIds);
          }
          return null;
        }
        function findLevelByParagraphStyleId(styleId) {
          return levelsByParagraphStyleId[styleId] || null;
        }
        var allLevels = _.flatten(_.values(abstractNums).map(function(abstractNum) {
          return _.values(abstractNum.levels);
        })), levelsByParagraphStyleId = _.indexBy(allLevels.filter(function(level) {
          return null != level.paragraphStyleId;
        }), "paragraphStyleId");
        return { findLevel, findLevelByParagraphStyleId };
      }
      function readNumberingXml(root, options) {
        if (!options || !options.styles) throw new Error("styles is missing");
        var abstractNums = readAbstractNums(root), nums = readNums(root);
        return new Numbering(nums, abstractNums, options.styles);
      }
      function readAbstractNums(root) {
        var abstractNums = /* @__PURE__ */ Object.create(null);
        return root.getElementsByTagName("w:abstractNum").forEach(function(element) {
          var id = element.attributes["w:abstractNumId"];
          abstractNums[id] = readAbstractNum(element);
        }), abstractNums;
      }
      function readAbstractNum(element) {
        var levels = /* @__PURE__ */ Object.create(null), levelWithoutIndex = null;
        element.getElementsByTagName("w:lvl").forEach(function(levelElement) {
          var levelIndex = levelElement.attributes["w:ilvl"], numFmt = levelElement.firstOrEmpty("w:numFmt").attributes["w:val"], isOrdered = "bullet" !== numFmt, paragraphStyleId = levelElement.firstOrEmpty("w:pStyle").attributes["w:val"];
          void 0 === levelIndex ? levelWithoutIndex = { isOrdered, level: "0", paragraphStyleId } : levels[levelIndex] = { isOrdered, level: levelIndex, paragraphStyleId };
        }), null !== levelWithoutIndex && void 0 === levels[levelWithoutIndex.level] && (levels[levelWithoutIndex.level] = levelWithoutIndex);
        var numStyleLink = element.firstOrEmpty("w:numStyleLink").attributes["w:val"];
        return { levels, numStyleLink };
      }
      function readNums(root) {
        var nums = /* @__PURE__ */ Object.create(null);
        return root.getElementsByTagName("w:num").forEach(function(element) {
          var numId = element.attributes["w:numId"], abstractNumId = element.first("w:abstractNumId").attributes["w:val"];
          nums[numId] = { abstractNumId };
        }), nums;
      }
      var _ = require2("underscore");
      exports2.readNumberingXml = readNumberingXml, exports2.Numbering = Numbering, exports2.defaultNumbering = new Numbering({}, {});
    }, { underscore: 67 }], 12: [function(require2, module2, exports2) {
      function read(xmlString) {
        return xml.readString(xmlString, xmlNamespaceMap).then(function(document) {
          return collapseAlternateContent(document)[0];
        });
      }
      function readXmlFromZipFile(docxFile, path) {
        return docxFile.exists(path) ? docxFile.read(path, "utf-8").then(stripUtf8Bom).then(read) : promises.resolve(null);
      }
      function stripUtf8Bom(xmlString) {
        return xmlString.replace(/^\uFEFF/g, "");
      }
      function collapseAlternateContent(node) {
        return "element" === node.type ? "mc:AlternateContent" === node.name ? node.firstOrEmpty("mc:Fallback").children : (node.children = _.flatten(node.children.map(collapseAlternateContent, true)), [node]) : [node];
      }
      var _ = require2("underscore"), promises = require2("../promises"), xml = require2("../xml");
      exports2.read = read, exports2.readXmlFromZipFile = readXmlFromZipFile;
      var xmlNamespaceMap = { "http://schemas.openxmlformats.org/wordprocessingml/2006/main": "w", "http://schemas.openxmlformats.org/officeDocument/2006/relationships": "r", "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing": "wp", "http://schemas.openxmlformats.org/drawingml/2006/main": "a", "http://schemas.openxmlformats.org/drawingml/2006/picture": "pic", "http://purl.oclc.org/ooxml/wordprocessingml/main": "w", "http://purl.oclc.org/ooxml/officeDocument/relationships": "r", "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing": "wp", "http://purl.oclc.org/ooxml/drawingml/main": "a", "http://purl.oclc.org/ooxml/drawingml/picture": "pic", "http://schemas.openxmlformats.org/package/2006/content-types": "content-types", "http://schemas.openxmlformats.org/package/2006/relationships": "relationships", "http://schemas.openxmlformats.org/markup-compatibility/2006": "mc", "urn:schemas-microsoft-com:vml": "v", "urn:schemas-microsoft-com:office:word": "office-word", "http://schemas.microsoft.com/office/word/2010/wordml": "wordml" };
    }, { "../promises": 23, "../xml": 35, underscore: 67 }], 13: [function(require2, module2, exports2) {
      function readRelationships(element) {
        var relationships = [];
        return element.children.forEach(function(child) {
          if ("relationships:Relationship" === child.name) {
            var relationship = { relationshipId: child.attributes.Id, target: child.attributes.Target, type: child.attributes.Type };
            relationships.push(relationship);
          }
        }), new Relationships(relationships);
      }
      function Relationships(relationships) {
        var targetsByRelationshipId = /* @__PURE__ */ Object.create(null);
        relationships.forEach(function(relationship) {
          targetsByRelationshipId[relationship.relationshipId] = relationship.target;
        });
        var targetsByType = /* @__PURE__ */ Object.create(null);
        return relationships.forEach(function(relationship) {
          targetsByType[relationship.type] || (targetsByType[relationship.type] = []), targetsByType[relationship.type].push(relationship.target);
        }), { findTargetByRelationshipId: function(relationshipId) {
          return targetsByRelationshipId[relationshipId];
        }, findTargetsByType: function(type) {
          return targetsByType[type] || [];
        } };
      }
      exports2.readRelationships = readRelationships, exports2.defaultValue = new Relationships([]), exports2.Relationships = Relationships;
    }, {}], 14: [function(require2, module2, exports2) {
      function writeStyleMap(docxFile, styleMap) {
        return docxFile.write(styleMapPath, styleMap), updateRelationships(docxFile).then(function() {
          return updateContentTypes(docxFile);
        });
      }
      function updateRelationships(docxFile) {
        var path = "word/_rels/document.xml.rels", relationshipsUri = "http://schemas.openxmlformats.org/package/2006/relationships", relationshipElementName = "{" + relationshipsUri + "}Relationship";
        return docxFile.read(path, "utf8").then(xml.readString).then(function(relationshipsContainer) {
          var relationships = relationshipsContainer.children;
          addOrUpdateElement(relationships, relationshipElementName, "Id", { Id: "rMammothStyleMap", Type: schema, Target: styleMapAbsolutePath });
          var namespaces = { "": relationshipsUri };
          return docxFile.write(path, xml.writeString(relationshipsContainer, namespaces));
        });
      }
      function updateContentTypes(docxFile) {
        var path = "[Content_Types].xml", contentTypesUri = "http://schemas.openxmlformats.org/package/2006/content-types", overrideName = "{" + contentTypesUri + "}Override";
        return docxFile.read(path, "utf8").then(xml.readString).then(function(typesElement) {
          var children = typesElement.children;
          addOrUpdateElement(children, overrideName, "PartName", { PartName: styleMapAbsolutePath, ContentType: "text/prs.mammoth.style-map" });
          var namespaces = { "": contentTypesUri };
          return docxFile.write(path, xml.writeString(typesElement, namespaces));
        });
      }
      function addOrUpdateElement(elements, name, identifyingAttribute, attributes) {
        var existingElement = _.find(elements, function(element) {
          return element.name === name && element.attributes[identifyingAttribute] === attributes[identifyingAttribute];
        });
        existingElement ? existingElement.attributes = attributes : elements.push(xml.element(name, attributes));
      }
      function readStyleMap(docxFile) {
        return docxFile.exists(styleMapPath) ? docxFile.read(styleMapPath, "utf8") : promises.resolve(null);
      }
      var _ = require2("underscore"), promises = require2("../promises"), xml = require2("../xml");
      exports2.writeStyleMap = writeStyleMap, exports2.readStyleMap = readStyleMap;
      var schema = "http://schemas.zwobble.org/mammoth/style-map", styleMapPath = "mammoth/style-map", styleMapAbsolutePath = "/" + styleMapPath;
    }, { "../promises": 23, "../xml": 35, underscore: 67 }], 15: [function(require2, module2, exports2) {
      function Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles) {
        return { findParagraphStyleById: function(styleId) {
          return paragraphStyles[styleId];
        }, findCharacterStyleById: function(styleId) {
          return characterStyles[styleId];
        }, findTableStyleById: function(styleId) {
          return tableStyles[styleId];
        }, findNumberingStyleById: function(styleId) {
          return numberingStyles[styleId];
        } };
      }
      function readStylesXml(root) {
        var paragraphStyles = /* @__PURE__ */ Object.create(null), characterStyles = /* @__PURE__ */ Object.create(null), tableStyles = /* @__PURE__ */ Object.create(null), numberingStyles = /* @__PURE__ */ Object.create(null);
        return root.getElementsByTagName("w:style").forEach(function(styleElement) {
          var styleSet, style = readStyleElement(styleElement);
          switch (style.type) {
            case "paragraph":
              styleSet = paragraphStyles;
              break;
            case "character":
              styleSet = characterStyles;
              break;
            case "table":
              styleSet = tableStyles;
              break;
            case "numbering":
              styleSet = numberingStyles;
          }
          styleSet && void 0 === styleSet[style.styleId] && (styleSet[style.styleId] = style);
        }), new Styles(paragraphStyles, characterStyles, tableStyles, numberingStyles);
      }
      function readStyleElement(styleElement) {
        var type = styleElement.attributes["w:type"];
        if ("numbering" === type) return readNumberingStyleElement(type, styleElement);
        var styleId = readStyleId(styleElement), name = styleName(styleElement);
        return { type, styleId, name };
      }
      function styleName(styleElement) {
        var nameElement = styleElement.first("w:name");
        return nameElement ? nameElement.attributes["w:val"] : null;
      }
      function readNumberingStyleElement(type, styleElement) {
        var styleId = readStyleId(styleElement), numId = styleElement.firstOrEmpty("w:pPr").firstOrEmpty("w:numPr").firstOrEmpty("w:numId").attributes["w:val"];
        return { type, numId, styleId };
      }
      function readStyleId(styleElement) {
        return styleElement.attributes["w:styleId"];
      }
      exports2.readStylesXml = readStylesXml, exports2.Styles = Styles, exports2.defaultStyles = new Styles({}, {}), Styles.EMPTY = new Styles({}, {}, {}, {});
    }, {}], 16: [function(require2, module2, exports2) {
      function uriToZipEntryName(base, uri) {
        return "/" === uri.charAt(0) ? uri.substr(1) : base + "/" + uri;
      }
      function replaceFragment(uri, fragment) {
        var hashIndex = uri.indexOf("#");
        return -1 !== hashIndex && (uri = uri.substring(0, hashIndex)), uri + "#" + fragment;
      }
      exports2.uriToZipEntryName = uriToZipEntryName, exports2.replaceFragment = replaceFragment;
    }, {}], 17: [function(require2, module2, exports2) {
      function nonFreshElement(tagName, attributes, children) {
        return elementWithTag(htmlPaths.element(tagName, attributes, { fresh: false }), children);
      }
      function freshElement(tagName, attributes, children) {
        var tag = htmlPaths.element(tagName, attributes, { fresh: true });
        return elementWithTag(tag, children);
      }
      function elementWithTag(tag, children) {
        return { type: "element", tag, children: children || [] };
      }
      function text(value) {
        return { type: "text", value };
      }
      function isVoidElement(node) {
        return 0 === node.children.length && voidTagNames[node.tag.tagName];
      }
      var htmlPaths = require2("../styles/html-paths"), forceWrite = { type: "forceWrite" };
      exports2.freshElement = freshElement, exports2.nonFreshElement = nonFreshElement, exports2.elementWithTag = elementWithTag, exports2.text = text, exports2.forceWrite = forceWrite;
      var voidTagNames = { br: true, hr: true, img: true, input: true };
      exports2.isVoidElement = isVoidElement;
    }, { "../styles/html-paths": 28 }], 18: [function(require2, module2, exports2) {
      function write(writer, nodes) {
        nodes.forEach(function(node) {
          writeNode(writer, node);
        });
      }
      function writeNode(writer, node) {
        toStrings[node.type](writer, node);
      }
      function generateElementString(writer, node) {
        ast.isVoidElement(node) ? writer.selfClosing(node.tag.tagName, node.tag.attributes) : (writer.open(node.tag.tagName, node.tag.attributes), write(writer, node.children), writer.close(node.tag.tagName));
      }
      function generateTextString(writer, node) {
        writer.text(node.value);
      }
      var ast = require2("./ast");
      exports2.freshElement = ast.freshElement, exports2.nonFreshElement = ast.nonFreshElement, exports2.elementWithTag = ast.elementWithTag, exports2.text = ast.text, exports2.forceWrite = ast.forceWrite, exports2.simplify = require2("./simplify");
      var toStrings = { element: generateElementString, text: generateTextString, forceWrite: function() {
      } };
      exports2.write = write;
    }, { "./ast": 17, "./simplify": 19 }], 19: [function(require2, module2, exports2) {
      function simplify(nodes) {
        return collapse(removeEmpty(nodes));
      }
      function collapse(nodes) {
        var children = [];
        return nodes.map(collapseNode).forEach(function(child) {
          appendChild(children, child);
        }), children;
      }
      function collapseNode(node) {
        return collapsers[node.type](node);
      }
      function collapseElement(node) {
        return ast.elementWithTag(node.tag, collapse(node.children));
      }
      function identity(value) {
        return value;
      }
      function appendChild(children, child) {
        var lastChild = children[children.length - 1];
        "element" === child.type && !child.tag.fresh && lastChild && "element" === lastChild.type && child.tag.matchesElement(lastChild.tag) ? (child.tag.separator && appendChild(lastChild.children, ast.text(child.tag.separator)), child.children.forEach(function(grandChild) {
          appendChild(lastChild.children, grandChild);
        })) : children.push(child);
      }
      function removeEmpty(nodes) {
        return flatMap(nodes, function(node) {
          return emptiers[node.type](node);
        });
      }
      function flatMap(values, func) {
        return _.flatten(_.map(values, func), true);
      }
      function neverEmpty(node) {
        return [node];
      }
      function elementEmptier(element) {
        var children = removeEmpty(element.children);
        return 0 !== children.length || ast.isVoidElement(element) ? [ast.elementWithTag(element.tag, children)] : [];
      }
      function textEmptier(node) {
        return 0 === node.value.length ? [] : [node];
      }
      var _ = require2("underscore"), ast = require2("./ast"), collapsers = { element: collapseElement, text: identity, forceWrite: identity }, emptiers = { element: elementEmptier, text: textEmptier, forceWrite: neverEmpty };
      module2.exports = simplify;
    }, { "./ast": 17, underscore: 67 }], 20: [function(require2, module2, exports2) {
      function imgElement(func) {
        return function(element, messages) {
          return promises.resolve(func(element)).then(function(result) {
            var attributes = {};
            return element.altText && (attributes.alt = element.altText), _.extend(attributes, result), [Html.freshElement("img", attributes)];
          });
        };
      }
      function imageFilenameExtension(image) {
        return image.contentType.split(/\/|\\/)[1];
      }
      var _ = require2("underscore"), promises = require2("./promises"), Html = require2("./html");
      exports2.imgElement = imgElement, exports2.inline = exports2.imgElement, exports2.dataUri = imgElement(function(element) {
        return element.readAsBase64String().then(function(imageBuffer) {
          return { src: "data:" + element.contentType + ";base64," + imageBuffer };
        });
      }), exports2.imageFilenameExtension = imageFilenameExtension;
    }, { "./html": 18, "./promises": 23, underscore: 67 }], 21: [function(require2, module2, exports2) {
      (function(Buffer) {
        function convertToHtml(input, options) {
          return convert(input, options);
        }
        function convertToMarkdown(input, options) {
          var markdownOptions = Object.create(options || {});
          return markdownOptions.outputFormat = "markdown", convert(input, markdownOptions);
        }
        function convert(input, options) {
          options = readOptions(options);
          var result = unzip.openZip(input).then(function(docxFile) {
            return docxStyleMap.readStyleMap(docxFile).then(function(styleMap) {
              return options.embeddedStyleMap = styleMap, docxFile;
            });
          }).then(function(docxFile) {
            return docxReader.read(docxFile, input, options).then(function(documentResult) {
              return documentResult.map(options.transformDocument);
            }).then(function(documentResult) {
              return convertDocumentToHtml(documentResult, options);
            });
          });
          return promises.toExternalPromise(result);
        }
        function readEmbeddedStyleMap(input) {
          var result = unzip.openZip(input).then(docxStyleMap.readStyleMap);
          return promises.toExternalPromise(result);
        }
        function convertDocumentToHtml(documentResult, options) {
          var styleMapResult = parseStyleMap(options.readStyleMap()), parsedOptions = _.extend({}, options, { styleMap: styleMapResult.value }), documentConverter = new DocumentConverter(parsedOptions);
          return documentResult.flatMapThen(function(document) {
            return styleMapResult.flatMapThen(function(styleMap) {
              return documentConverter.convertToHtml(document);
            });
          });
        }
        function parseStyleMap(styleMap) {
          return Result.combine((styleMap || []).map(readStyle)).map(function(styleMap2) {
            return styleMap2.filter(function(styleMapping) {
              return !!styleMapping;
            });
          });
        }
        function extractRawText(input) {
          var result = unzip.openZip(input).then(docxReader.read).then(function(documentResult) {
            return documentResult.map(convertElementToRawText);
          });
          return promises.toExternalPromise(result);
        }
        function embedStyleMap(input, styleMap) {
          var result = unzip.openZip(input).then(function(docxFile) {
            return docxStyleMap.writeStyleMap(docxFile, styleMap).then(function() {
              return docxFile;
            });
          }).then(function(docxFile) {
            return docxFile.toArrayBuffer();
          }).then(function(arrayBuffer) {
            return { toArrayBuffer: function() {
              return arrayBuffer;
            }, toBuffer: function() {
              return Buffer.from(arrayBuffer);
            } };
          });
          return promises.toExternalPromise(result);
        }
        var _ = require2("underscore"), docxReader = require2("./docx/docx-reader"), docxStyleMap = require2("./docx/style-map"), DocumentConverter = require2("./document-to-html").DocumentConverter, convertElementToRawText = require2("./raw-text").convertElementToRawText, readStyle = require2("./style-reader").readStyle, readOptions = require2("./options-reader").readOptions, promises = require2("./promises"), unzip = require2("./unzip"), Result = require2("./results").Result;
        exports2.convertToHtml = convertToHtml, exports2.convertToMarkdown = convertToMarkdown, exports2.convert = convert, exports2.extractRawText = extractRawText, exports2.images = require2("./images"), exports2.transforms = require2("./transforms"), exports2.underline = require2("./underline"), exports2.embedStyleMap = embedStyleMap, exports2.readEmbeddedStyleMap = readEmbeddedStyleMap, exports2.styleMapping = function() {
          throw new Error(`Use a raw string instead of mammoth.styleMapping e.g. "p[style-name='Title'] => h1" instead of mammoth.styleMapping("p[style-name='Title'] => h1")`);
        };
      }).call(this, require2("buffer").Buffer);
    }, { "./document-to-html": 3, "./docx/docx-reader": 9, "./docx/style-map": 14, "./images": 20, "./options-reader": 22, "./promises": 23, "./raw-text": 24, "./results": 25, "./style-reader": 26, "./transforms": 30, "./underline": 31, "./unzip": 2, buffer: 48, underscore: 67 }], 22: [function(require2, module2, exports2) {
      function readOptions(options) {
        return options = options || {}, _.extend({}, standardOptions, options, { customStyleMap: readStyleMap(options.styleMap), readStyleMap: function() {
          var styleMap = this.customStyleMap;
          return this.includeEmbeddedStyleMap && (styleMap = styleMap.concat(readStyleMap(this.embeddedStyleMap))), this.includeDefaultStyleMap && (styleMap = styleMap.concat(defaultStyleMap)), styleMap;
        } });
      }
      function readStyleMap(styleMap) {
        return styleMap ? _.isString(styleMap) ? styleMap.split("\n").map(function(line) {
          return line.trim();
        }).filter(function(line) {
          return "" !== line && "#" !== line.charAt(0);
        }) : styleMap : [];
      }
      function identity(value) {
        return value;
      }
      exports2.readOptions = readOptions;
      var _ = require2("underscore"), defaultStyleMap = exports2._defaultStyleMap = ["p.Heading1 => h1:fresh", "p.Heading2 => h2:fresh", "p.Heading3 => h3:fresh", "p.Heading4 => h4:fresh", "p.Heading5 => h5:fresh", "p.Heading6 => h6:fresh", "p[style-name='Heading 1'] => h1:fresh", "p[style-name='Heading 2'] => h2:fresh", "p[style-name='Heading 3'] => h3:fresh", "p[style-name='Heading 4'] => h4:fresh", "p[style-name='Heading 5'] => h5:fresh", "p[style-name='Heading 6'] => h6:fresh", "p[style-name='heading 1'] => h1:fresh", "p[style-name='heading 2'] => h2:fresh", "p[style-name='heading 3'] => h3:fresh", "p[style-name='heading 4'] => h4:fresh", "p[style-name='heading 5'] => h5:fresh", "p[style-name='heading 6'] => h6:fresh", "p.Heading => h1:fresh", "p[style-name='Heading'] => h1:fresh", "r[style-name='Strong'] => strong", "p[style-name='footnote text'] => p:fresh", "r[style-name='footnote reference'] =>", "p[style-name='endnote text'] => p:fresh", "r[style-name='endnote reference'] =>", "p[style-name='annotation text'] => p:fresh", "r[style-name='annotation reference'] =>", "p[style-name='Footnote'] => p:fresh", "r[style-name='Footnote anchor'] =>", "p[style-name='Endnote'] => p:fresh", "r[style-name='Endnote anchor'] =>", "p:unordered-list(1) => ul > li:fresh", "p:unordered-list(2) => ul|ol > li > ul > li:fresh", "p:unordered-list(3) => ul|ol > li > ul|ol > li > ul > li:fresh", "p:unordered-list(4) => ul|ol > li > ul|ol > li > ul|ol > li > ul > li:fresh", "p:unordered-list(5) => ul|ol > li > ul|ol > li > ul|ol > li > ul|ol > li > ul > li:fresh", "p:ordered-list(1) => ol > li:fresh", "p:ordered-list(2) => ul|ol > li > ol > li:fresh", "p:ordered-list(3) => ul|ol > li > ul|ol > li > ol > li:fresh", "p:ordered-list(4) => ul|ol > li > ul|ol > li > ul|ol > li > ol > li:fresh", "p:ordered-list(5) => ul|ol > li > ul|ol > li > ul|ol > li > ul|ol > li > ol > li:fresh", "r[style-name='Hyperlink'] =>", "p[style-name='Normal'] => p:fresh", "p.Body => p:fresh", "p[style-name='Body'] => p:fresh"], standardOptions = exports2._standardOptions = {
        externalFileAccess: false,
        transformDocument: identity,
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true
      };
    }, { underscore: 67 }], 23: [function(require2, module2, exports2) {
      (function(process) {
        function addAlsoToPromise(promise) {
          return promise.also = alsoMethod, promise;
        }
        function defer() {
          var resolve, reject, promise = new Promise(function(resolveArg, rejectArg) {
            resolve = resolveArg, reject = rejectArg;
          });
          return { resolve, reject, promise };
        }
        function ExternalPromise(executor) {
          var promise = new Promise(executor);
          return promise.__proto__ = ExternalPromise.prototype, promise;
        }
        function toExternalPromise(promise) {
          return ExternalPromise.resolve(promise);
        }
        function isNode() {
          return "undefined" == typeof process ? false : "[object process]" === {}.toString.call(process).toLowerCase();
        }
        var _ = require2("underscore");
        exports2.defer = defer, exports2.Promise = Promise, exports2.resolve = Promise.resolve.bind(Promise), exports2.reject = Promise.reject.bind(Promise), exports2.forEachSeries = function(array, func) {
          var arrayIndex = 0, deferred = defer(), next = function() {
            if (arrayIndex < array.length) {
              var element = array[arrayIndex];
              arrayIndex++, func(element).then(next, deferred.reject);
            } else deferred.resolve();
          };
          return next(), deferred.promise;
        };
        var props = exports2.props = function(obj) {
          var keys = Object.keys(obj), values = Object.values(obj), result = Promise.all(values).then(function(resolvedValues) {
            for (var resolvedObj = {}, index = 0; index < keys.length; index++) resolvedObj[keys[index]] = resolvedValues[index];
            return resolvedObj;
          });
          return addAlsoToPromise(result);
        }, alsoMethod = function(func) {
          var result = this.then(function(value) {
            var returnValue = _.extend({}, value, func(value));
            return props(returnValue);
          });
          return addAlsoToPromise(result);
        };
        exports2["try"] = function(func) {
          try {
            return Promise.resolve(func());
          } catch (error) {
            return Promise.reject(error);
          }
        }, ExternalPromise.__proto__ = Promise, ExternalPromise.prototype.__proto__ = Promise.prototype, ExternalPromise.prototype.done = function(resolve, reject) {
          return this.then(resolve, reject)["catch"](function(error) {
            if (isNode()) {
              var stack = error instanceof Error ? error.stack : error;
              process.stderr.write("Fatal " + stack + "\n"), process.exit(2);
            } else setTimeout(function() {
              throw error;
            }, 0);
          });
        }, exports2.toExternalPromise = toExternalPromise;
      }).call(this, require2("_process"));
    }, { _process: 66, underscore: 67 }], 24: [function(require2, module2, exports2) {
      function convertElementToRawText(element) {
        if ("text" === element.type) return element.value;
        if (element.type === documents.types.tab) return "	";
        var tail = "paragraph" === element.type ? "\n\n" : "";
        return (element.children || []).map(convertElementToRawText).join("") + tail;
      }
      var documents = require2("./documents");
      exports2.convertElementToRawText = convertElementToRawText;
    }, { "./documents": 4 }], 25: [function(require2, module2, exports2) {
      function Result(value, messages) {
        this.value = value, this.messages = messages || [];
      }
      function success(value) {
        return new Result(value, []);
      }
      function warning(message) {
        return { type: "warning", message };
      }
      function error(exception) {
        return { type: "error", message: exception.message, error: exception };
      }
      function combineMessages(results) {
        var messages = [];
        return _.flatten(_.pluck(results, "messages"), true).forEach(function(message) {
          containsMessage(messages, message) || messages.push(message);
        }), messages;
      }
      function containsMessage(messages, message) {
        return void 0 !== _.find(messages, isSameMessage.bind(null, message));
      }
      function isSameMessage(first, second) {
        return first.type === second.type && first.message === second.message;
      }
      var _ = require2("underscore");
      exports2.Result = Result, exports2.success = success, exports2.warning = warning, exports2.error = error, Result.prototype.map = function(func) {
        return new Result(func(this.value), this.messages);
      }, Result.prototype.flatMap = function(func) {
        var funcResult = func(this.value);
        return new Result(funcResult.value, combineMessages([this, funcResult]));
      }, Result.prototype.flatMapThen = function(func) {
        var that = this;
        return func(this.value).then(function(otherResult) {
          return new Result(otherResult.value, combineMessages([that, otherResult]));
        });
      }, Result.combine = function(results) {
        var values = _.flatten(_.pluck(results, "value")), messages = combineMessages(results);
        return new Result(values, messages);
      };
    }, { underscore: 67 }], 26: [function(require2, module2, exports2) {
      function readStyle(string) {
        return parseString(styleRule, string);
      }
      function createStyleRule() {
        return lop.rules.sequence(lop.rules.sequence.capture(documentMatcherRule()), lop.rules.tokenOfType("whitespace"), lop.rules.tokenOfType("arrow"), lop.rules.sequence.capture(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("whitespace"), lop.rules.sequence.capture(htmlPathRule())).head())), lop.rules.tokenOfType("end")).map(function(documentMatcher, htmlPath) {
          return { from: documentMatcher, to: htmlPath.valueOrElse(htmlPaths.empty) };
        });
      }
      function readDocumentMatcher(string) {
        return parseString(documentMatcherRule(), string);
      }
      function documentMatcherRule() {
        function createMatcherSuffixesRule(rules) {
          var matcherSuffix = lop.rules.firstOf.apply(lop.rules.firstOf, ["matcher suffix"].concat(rules)), matcherSuffixes = lop.rules.zeroOrMore(matcherSuffix);
          return lop.rules.then(matcherSuffixes, function(suffixes) {
            var matcherOptions = {};
            return suffixes.forEach(function(suffix) {
              _.extend(matcherOptions, suffix);
            }), matcherOptions;
          });
        }
        var sequence = lop.rules.sequence, identifierToConstant = function(identifier, constant) {
          return lop.rules.then(lop.rules.token("identifier", identifier), function() {
            return constant;
          });
        }, paragraphRule = identifierToConstant("p", documentMatchers.paragraph), runRule = identifierToConstant("r", documentMatchers.run), elementTypeRule = lop.rules.firstOf("p or r or table", paragraphRule, runRule), styleIdRule = lop.rules.sequence(lop.rules.tokenOfType("dot"), lop.rules.sequence.cut(), lop.rules.sequence.capture(identifierRule)).map(function(styleId) {
          return { styleId };
        }), styleNameMatcherRule = lop.rules.firstOf("style name matcher", lop.rules.then(lop.rules.sequence(lop.rules.tokenOfType("equals"), lop.rules.sequence.cut(), lop.rules.sequence.capture(stringRule)).head(), function(styleName) {
          return { styleName: documentMatchers.equalTo(styleName) };
        }), lop.rules.then(lop.rules.sequence(lop.rules.tokenOfType("startsWith"), lop.rules.sequence.cut(), lop.rules.sequence.capture(stringRule)).head(), function(styleName) {
          return { styleName: documentMatchers.startsWith(styleName) };
        })), styleNameRule = lop.rules.sequence(lop.rules.tokenOfType("open-square-bracket"), lop.rules.sequence.cut(), lop.rules.token("identifier", "style-name"), lop.rules.sequence.capture(styleNameMatcherRule), lop.rules.tokenOfType("close-square-bracket")).head(), listTypeRule = lop.rules.firstOf("list type", identifierToConstant("ordered-list", { isOrdered: true }), identifierToConstant("unordered-list", { isOrdered: false })), listRule = sequence(lop.rules.tokenOfType("colon"), sequence.capture(listTypeRule), sequence.cut(), lop.rules.tokenOfType("open-paren"), sequence.capture(integerRule), lop.rules.tokenOfType("close-paren")).map(function(listType, levelNumber) {
          return { list: { isOrdered: listType.isOrdered, levelIndex: levelNumber - 1 } };
        }), paragraphOrRun = sequence(sequence.capture(elementTypeRule), sequence.capture(createMatcherSuffixesRule([styleIdRule, styleNameRule, listRule]))).map(function(createMatcher, matcherOptions) {
          return createMatcher(matcherOptions);
        }), table = sequence(lop.rules.token("identifier", "table"), sequence.capture(createMatcherSuffixesRule([styleIdRule, styleNameRule]))).map(function(options) {
          return documentMatchers.table(options);
        }), bold = identifierToConstant("b", documentMatchers.bold), italic = identifierToConstant("i", documentMatchers.italic), underline = identifierToConstant("u", documentMatchers.underline), strikethrough = identifierToConstant("strike", documentMatchers.strikethrough), allCaps = identifierToConstant("all-caps", documentMatchers.allCaps), smallCaps = identifierToConstant("small-caps", documentMatchers.smallCaps), highlight = sequence(lop.rules.token("identifier", "highlight"), lop.rules.sequence.capture(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("open-square-bracket"), lop.rules.sequence.cut(), lop.rules.token("identifier", "color"), lop.rules.tokenOfType("equals"), lop.rules.sequence.capture(stringRule), lop.rules.tokenOfType("close-square-bracket")).head()))).map(function(color) {
          return documentMatchers.highlight({ color: color.valueOrElse(void 0) });
        }), commentReference = identifierToConstant("comment-reference", documentMatchers.commentReference), breakMatcher = sequence(lop.rules.token("identifier", "br"), sequence.cut(), lop.rules.tokenOfType("open-square-bracket"), lop.rules.token("identifier", "type"), lop.rules.tokenOfType("equals"), sequence.capture(stringRule), lop.rules.tokenOfType("close-square-bracket")).map(function(breakType) {
          switch (breakType) {
            case "line":
              return documentMatchers.lineBreak;
            case "page":
              return documentMatchers.pageBreak;
            case "column":
              return documentMatchers.columnBreak;
          }
        });
        return lop.rules.firstOf("element type", paragraphOrRun, table, bold, italic, underline, strikethrough, allCaps, smallCaps, highlight, commentReference, breakMatcher);
      }
      function readHtmlPath(string) {
        return parseString(htmlPathRule(), string);
      }
      function htmlPathRule() {
        var capture = lop.rules.sequence.capture, whitespaceRule = lop.rules.tokenOfType("whitespace"), freshRule = lop.rules.then(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("colon"), lop.rules.token("identifier", "fresh"))), function(option) {
          return option.map(function() {
            return true;
          }).valueOrElse(false);
        }), separatorRule = lop.rules.then(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("colon"), lop.rules.token("identifier", "separator"), lop.rules.tokenOfType("open-paren"), capture(stringRule), lop.rules.tokenOfType("close-paren")).head()), function(option) {
          return option.valueOrElse("");
        }), tagNamesRule = lop.rules.oneOrMoreWithSeparator(identifierRule, lop.rules.tokenOfType("choice")), styleElementRule = lop.rules.sequence(capture(tagNamesRule), capture(lop.rules.zeroOrMore(attributeOrClassRule)), capture(freshRule), capture(separatorRule)).map(function(tagName, attributesList, fresh, separator) {
          var attributes = /* @__PURE__ */ Object.create(null), options = {};
          return attributesList.forEach(function(attribute) {
            attribute.append && attributes[attribute.name] ? attributes[attribute.name] += " " + attribute.value : attributes[attribute.name] = attribute.value;
          }), fresh && (options.fresh = true), separator && (options.separator = separator), htmlPaths.element(tagName, attributes, options);
        });
        return lop.rules.firstOf("html path", lop.rules.then(lop.rules.tokenOfType("bang"), function() {
          return htmlPaths.ignore;
        }), lop.rules.then(lop.rules.zeroOrMoreWithSeparator(styleElementRule, lop.rules.sequence(whitespaceRule, lop.rules.tokenOfType("gt"), whitespaceRule)), htmlPaths.elements));
      }
      function decodeEscapeSequences(value) {
        return value.replace(/\\(.)/g, function(match, code) {
          return escapeSequences[code] || code;
        });
      }
      function parseString(rule, string) {
        var tokens = tokenise(string), parser = lop.Parser(), parseResult = parser.parseTokens(rule, tokens);
        return parseResult.isSuccess() ? results.success(parseResult.value()) : new results.Result(null, [results.warning(describeFailure(string, parseResult))]);
      }
      function describeFailure(input, parseResult) {
        return "Did not understand this style mapping, so ignored it: " + input + "\n" + parseResult.errors().map(describeError).join("\n");
      }
      function describeError(error) {
        return "Error was at character number " + error.characterNumber() + ": Expected " + error.expected + " but got " + error.actual;
      }
      var _ = require2("underscore"), lop = require2("lop"), documentMatchers = require2("./styles/document-matchers"), htmlPaths = require2("./styles/html-paths"), tokenise = require2("./styles/parser/tokeniser").tokenise, results = require2("./results");
      exports2.readHtmlPath = readHtmlPath, exports2.readDocumentMatcher = readDocumentMatcher, exports2.readStyle = readStyle;
      var identifierRule = lop.rules.then(lop.rules.tokenOfType("identifier"), decodeEscapeSequences), integerRule = lop.rules.tokenOfType("integer"), stringRule = lop.rules.then(lop.rules.tokenOfType("string"), decodeEscapeSequences), escapeSequences = { n: "\n", r: "\r", t: "	" }, attributeRule = lop.rules.sequence(lop.rules.tokenOfType("open-square-bracket"), lop.rules.sequence.cut(), lop.rules.sequence.capture(identifierRule), lop.rules.tokenOfType("equals"), lop.rules.sequence.capture(stringRule), lop.rules.tokenOfType("close-square-bracket")).map(function(name, value) {
        return { name, value, append: false };
      }), classRule = lop.rules.sequence(lop.rules.tokenOfType("dot"), lop.rules.sequence.cut(), lop.rules.sequence.capture(identifierRule)).map(function(className) {
        return { name: "class", value: className, append: true };
      }), attributeOrClassRule = lop.rules.firstOf("attribute or class", attributeRule, classRule), styleRule = createStyleRule();
    }, { "./results": 25, "./styles/document-matchers": 27, "./styles/html-paths": 28, "./styles/parser/tokeniser": 29, lop: 54, underscore: 67 }], 27: [function(require2, module2, exports2) {
      function paragraph(options) {
        return new Matcher("paragraph", options);
      }
      function run(options) {
        return new Matcher("run", options);
      }
      function table(options) {
        return new Matcher("table", options);
      }
      function highlight(options) {
        return new HighlightMatcher(options);
      }
      function Matcher(elementType, options) {
        options = options || {}, this._elementType = elementType, this._styleId = options.styleId, this._styleName = options.styleName, options.list && (this._listIndex = options.list.levelIndex, this._listIsOrdered = options.list.isOrdered);
      }
      function HighlightMatcher(options) {
        options = options || {}, this._color = options.color;
      }
      function BreakMatcher(options) {
        options = options || {}, this._breakType = options.breakType;
      }
      function isList(element, levelIndex, isOrdered) {
        return element.numbering && element.numbering.level == levelIndex && element.numbering.isOrdered == isOrdered;
      }
      function equalTo(value) {
        return { operator: operatorEqualTo, operand: value };
      }
      function startsWith(value) {
        return { operator: operatorStartsWith, operand: value };
      }
      function operatorEqualTo(first, second) {
        return first.toUpperCase() === second.toUpperCase();
      }
      function operatorStartsWith(first, second) {
        return 0 === second.toUpperCase().indexOf(first.toUpperCase());
      }
      exports2.paragraph = paragraph, exports2.run = run, exports2.table = table, exports2.bold = new Matcher("bold"), exports2.italic = new Matcher("italic"), exports2.underline = new Matcher("underline"), exports2.strikethrough = new Matcher("strikethrough"), exports2.allCaps = new Matcher("allCaps"), exports2.smallCaps = new Matcher("smallCaps"), exports2.highlight = highlight, exports2.commentReference = new Matcher("commentReference"), exports2.lineBreak = new BreakMatcher({ breakType: "line" }), exports2.pageBreak = new BreakMatcher({ breakType: "page" }), exports2.columnBreak = new BreakMatcher({ breakType: "column" }), exports2.equalTo = equalTo, exports2.startsWith = startsWith, Matcher.prototype.matches = function(element) {
        return element.type === this._elementType && (void 0 === this._styleId || element.styleId === this._styleId) && (void 0 === this._styleName || element.styleName && this._styleName.operator(this._styleName.operand, element.styleName)) && (void 0 === this._listIndex || isList(element, this._listIndex, this._listIsOrdered)) && (void 0 === this._breakType || this._breakType === element.breakType);
      }, HighlightMatcher.prototype.matches = function(element) {
        return "highlight" === element.type && (void 0 === this._color || element.color === this._color);
      }, BreakMatcher.prototype.matches = function(element) {
        return "break" === element.type && (void 0 === this._breakType || element.breakType === this._breakType);
      };
    }, {}], 28: [function(require2, module2, exports2) {
      function topLevelElement(tagName, attributes) {
        return elements([element(tagName, attributes, { fresh: true })]);
      }
      function elements(elementStyles) {
        return new HtmlPath(elementStyles.map(function(elementStyle) {
          return _.isString(elementStyle) ? element(elementStyle) : elementStyle;
        }));
      }
      function HtmlPath(elements2) {
        this._elements = elements2;
      }
      function element(tagName, attributes, options) {
        return options = options || {}, new Element(tagName, attributes, options);
      }
      function Element(tagName, attributes, options) {
        var tagNames = /* @__PURE__ */ Object.create(null);
        _.isArray(tagName) ? (tagName.forEach(function(tagName2) {
          tagNames[tagName2] = true;
        }), tagName = tagName[0]) : tagNames[tagName] = true, this.tagName = tagName, this.tagNames = tagNames, this.attributes = attributes || {}, this.fresh = options.fresh, this.separator = options.separator;
      }
      var _ = require2("underscore"), html = require2("../html");
      exports2.topLevelElement = topLevelElement, exports2.elements = elements, exports2.element = element, HtmlPath.prototype.wrap = function(children) {
        for (var result = children(), index = this._elements.length - 1; index >= 0; index--) result = this._elements[index].wrapNodes(result);
        return result;
      }, Element.prototype.matchesElement = function(element2) {
        return this.tagNames[element2.tagName] && _.isEqual(this.attributes || {}, element2.attributes || {});
      }, Element.prototype.wrap = function(generateNodes) {
        return this.wrapNodes(generateNodes());
      }, Element.prototype.wrapNodes = function(nodes) {
        return [html.elementWithTag(this, nodes)];
      }, exports2.empty = elements([]), exports2.ignore = { wrap: function() {
        return [];
      } };
    }, { "../html": 18, underscore: 67 }], 29: [function(require2, module2, exports2) {
      function tokenise(string) {
        var identifierCharacter = "(?:[a-zA-Z\\-_]|\\\\.)", tokeniser = new RegexTokeniser([{ name: "identifier", regex: new RegExp("(" + identifierCharacter + "(?:" + identifierCharacter + "|[0-9])*)") }, { name: "dot", regex: /\./ }, { name: "colon", regex: /:/ }, { name: "gt", regex: />/ }, { name: "whitespace", regex: /\s+/ }, { name: "arrow", regex: /=>/ }, { name: "equals", regex: /=/ }, { name: "startsWith", regex: /\^=/ }, { name: "open-paren", regex: /\(/ }, { name: "close-paren", regex: /\)/ }, { name: "open-square-bracket", regex: /\[/ }, { name: "close-square-bracket", regex: /\]/ }, { name: "string", regex: new RegExp(stringPrefix + "'") }, { name: "unterminated-string", regex: new RegExp(stringPrefix) }, { name: "integer", regex: /([0-9]+)/ }, { name: "choice", regex: /\|/ }, { name: "bang", regex: /(!)/ }]);
        return tokeniser.tokenise(string);
      }
      var lop = require2("lop"), RegexTokeniser = lop.RegexTokeniser;
      exports2.tokenise = tokenise;
      var stringPrefix = "'((?:\\\\(?:.|$)|[^'\\\\])*)";
    }, { lop: 54 }], 30: [function(require2, module2, exports2) {
      function paragraph(transform) {
        return elementsOfType("paragraph", transform);
      }
      function run(transform) {
        return elementsOfType("run", transform);
      }
      function elementsOfType(elementType, transform) {
        return elements(function(element) {
          return element.type === elementType ? transform(element) : element;
        });
      }
      function elements(transform) {
        return function transformElement(element) {
          if (element.children) {
            var children = _.map(element.children, transformElement);
            element = _.extend(element, { children });
          }
          return transform(element);
        };
      }
      function getDescendantsOfType(element, type) {
        return getDescendants(element).filter(function(descendant) {
          return descendant.type === type;
        });
      }
      function getDescendants(element) {
        var descendants = [];
        return visitDescendants(element, function(descendant) {
          descendants.push(descendant);
        }), descendants;
      }
      function visitDescendants(element, visit) {
        element.children && element.children.forEach(function(child) {
          visitDescendants(child, visit), visit(child);
        });
      }
      var _ = require2("underscore");
      exports2.paragraph = paragraph, exports2.run = run, exports2._elements = elements, exports2._elementsOfType = elementsOfType, exports2.getDescendantsOfType = getDescendantsOfType, exports2.getDescendants = getDescendants;
    }, { underscore: 67 }], 31: [function(require2, module2, exports2) {
      function element(name) {
        return function(html) {
          return Html.elementWithTag(htmlPaths.element(name), [html]);
        };
      }
      var htmlPaths = require2("./styles/html-paths"), Html = require2("./html");
      exports2.element = element;
    }, { "./html": 18, "./styles/html-paths": 28 }], 32: [function(require2, module2, exports2) {
      function writer(options) {
        return options = options || {}, options.prettyPrint ? prettyWriter() : simpleWriter();
      }
      function prettyWriter() {
        function open(tagName, attributes) {
          indentedElements[tagName] && indent(), stack.push(tagName), writer2.open(tagName, attributes), indentedElements[tagName] && indentationLevel++, start = false;
        }
        function close(tagName) {
          indentedElements[tagName] && (indentationLevel--, indent()), stack.pop(), writer2.close(tagName);
        }
        function text(value) {
          startText();
          var text2 = isInPre() ? value : value.replace("\n", "\n" + indentation);
          writer2.text(text2);
        }
        function selfClosing(tagName, attributes) {
          indent(), writer2.selfClosing(tagName, attributes);
        }
        function insideIndentedElement() {
          return 0 === stack.length || indentedElements[stack[stack.length - 1]];
        }
        function startText() {
          inText || (indent(), inText = true);
        }
        function indent() {
          if (inText = false, !start && insideIndentedElement() && !isInPre()) {
            writer2._append("\n");
            for (var i = 0; indentationLevel > i; i++) writer2._append(indentation);
          }
        }
        function isInPre() {
          return _.some(stack, function(tagName) {
            return "pre" === tagName;
          });
        }
        var indentationLevel = 0, indentation = "  ", stack = [], start = true, inText = false, writer2 = simpleWriter();
        return { asString: writer2.asString, open, close, text, selfClosing };
      }
      function simpleWriter() {
        function open(tagName, attributes) {
          var attributeString = generateAttributeString(attributes);
          fragments.push("<" + tagName + attributeString + ">");
        }
        function close(tagName) {
          fragments.push("</" + tagName + ">");
        }
        function selfClosing(tagName, attributes) {
          var attributeString = generateAttributeString(attributes);
          fragments.push("<" + tagName + attributeString + " />");
        }
        function generateAttributeString(attributes) {
          return _.map(attributes, function(value, key) {
            return " " + key + '="' + escapeHtmlAttribute(value) + '"';
          }).join("");
        }
        function text(value) {
          fragments.push(escapeHtmlText(value));
        }
        function append(html) {
          fragments.push(html);
        }
        function asString() {
          return fragments.join("");
        }
        var fragments = [];
        return { asString, open, close, text, selfClosing, _append: append };
      }
      function escapeHtmlText(value) {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      function escapeHtmlAttribute(value) {
        return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      var _ = require2("underscore");
      exports2.writer = writer;
      var indentedElements = { div: true, p: true, ul: true, li: true };
    }, { underscore: 67 }], 33: [function(require2, module2, exports2) {
      function writer(options) {
        return options = options || {}, "markdown" === options.outputFormat ? markdownWriter.writer() : htmlWriter.writer(options);
      }
      var htmlWriter = require2("./html-writer"), markdownWriter = require2("./markdown-writer");
      exports2.writer = writer;
    }, { "./html-writer": 32, "./markdown-writer": 34 }], 34: [function(require2, module2, exports2) {
      function symmetricMarkdownElement(end) {
        return markdownElement(end, end);
      }
      function markdownElement(start, end) {
        return function() {
          return { start, end };
        };
      }
      function markdownLink(attributes) {
        var href = attributes.href || "";
        return href ? { start: "[", end: "](" + escapeMarkdown(href) + ")", anchorPosition: "before" } : {};
      }
      function markdownImage(attributes) {
        var src = attributes.src || "", altText = attributes.alt || "";
        return src || altText ? { start: "![" + escapeMarkdown(altText) + "](" + escapeMarkdown(src) + ")" } : {};
      }
      function markdownList(options) {
        return function(attributes, list) {
          return { start: list ? "\n" : "", end: list ? "" : "\n", list: { isOrdered: options.isOrdered, indent: list ? list.indent + 1 : 0, count: 0 } };
        };
      }
      function markdownListItem(attributes, list, listItem) {
        list = list || { indent: 0, isOrdered: false, count: 0 }, list.count++, listItem.hasClosed = false;
        var bullet = list.isOrdered ? list.count + "." : "-", start = repeatString("	", list.indent) + bullet + " ";
        return { start, end: function() {
          return listItem.hasClosed ? void 0 : (listItem.hasClosed = true, "\n");
        } };
      }
      function repeatString(value, count) {
        return new Array(count + 1).join(value);
      }
      function markdownWriter() {
        function open(tagName, attributes) {
          attributes = attributes || {};
          var createElement = htmlToMarkdown[tagName] || function() {
            return {};
          }, element = createElement(attributes, list, listItem);
          elementStack.push({ end: element.end, list }), element.list && (list = element.list);
          var anchorBeforeStart = "before" === element.anchorPosition;
          anchorBeforeStart && writeAnchor(attributes), fragments.push(element.start || ""), anchorBeforeStart || writeAnchor(attributes);
        }
        function writeAnchor(attributes) {
          if (attributes.id) {
            var writer = htmlWriter.writer();
            writer.open("a", { id: attributes.id }), writer.close("a"), fragments.push(writer.asString());
          }
        }
        function close(tagName) {
          var element = elementStack.pop();
          list = element.list;
          var end = _.isFunction(element.end) ? element.end() : element.end;
          fragments.push(end || "");
        }
        function selfClosing(tagName, attributes) {
          open(tagName, attributes), close();
        }
        function text(value) {
          fragments.push(escapeMarkdown(value));
        }
        function asString() {
          return fragments.join("");
        }
        var fragments = [], elementStack = [], list = null, listItem = {};
        return { asString, open, close, text, selfClosing };
      }
      function escapeMarkdown(value) {
        return value.replace(/\\/g, "\\\\").replace(/([\`\*_\{\}\[\]\(\)\#\+\-\.\!])/g, "\\$1");
      }
      var _ = require2("underscore"), htmlWriter = require2("./html-writer"), htmlToMarkdown = { p: markdownElement("", "\n\n"), br: markdownElement("", "  \n"), ul: markdownList({ isOrdered: false }), ol: markdownList({ isOrdered: true }), li: markdownListItem, strong: symmetricMarkdownElement("__"), em: symmetricMarkdownElement("*"), a: markdownLink, img: markdownImage };
      !function() {
        for (var i = 1; 6 >= i; i++) htmlToMarkdown["h" + i] = markdownElement(repeatString("#", i) + " ", "\n\n");
      }(), exports2.writer = markdownWriter;
    }, { "./html-writer": 32, underscore: 67 }], 35: [function(require2, module2, exports2) {
      var nodes = require2("./nodes");
      exports2.Element = nodes.Element, exports2.element = nodes.element, exports2.emptyElement = nodes.emptyElement, exports2.text = nodes.text, exports2.readString = require2("./reader").readString, exports2.writeString = require2("./writer").writeString;
    }, { "./nodes": 36, "./reader": 37, "./writer": 38 }], 36: [function(require2, module2, exports2) {
      function Element(name, attributes, children) {
        this.type = "element", this.name = name, this.attributes = attributes || {}, this.children = children || [];
      }
      function toElementList(array) {
        return _.extend(array, elementListPrototype);
      }
      var _ = require2("underscore");
      exports2.Element = Element, exports2.element = function(name, attributes, children) {
        return new Element(name, attributes, children);
      }, exports2.text = function(value) {
        return { type: "text", value };
      };
      var emptyElement = exports2.emptyElement = { first: function() {
        return null;
      }, firstOrEmpty: function() {
        return emptyElement;
      }, attributes: {}, children: [] };
      Element.prototype.first = function(name) {
        return _.find(this.children, function(child) {
          return child.name === name;
        });
      }, Element.prototype.firstOrEmpty = function(name) {
        return this.first(name) || emptyElement;
      }, Element.prototype.getElementsByTagName = function(name) {
        var elements = _.filter(this.children, function(child) {
          return child.name === name;
        });
        return toElementList(elements);
      }, Element.prototype.text = function() {
        if (0 === this.children.length) return "";
        if (1 !== this.children.length || "text" !== this.children[0].type) throw new Error("Not implemented");
        return this.children[0].value;
      };
      var elementListPrototype = { getElementsByTagName: function(name) {
        return toElementList(_.flatten(this.map(function(element) {
          return element.getElementsByTagName(name);
        }, true)));
      } };
    }, { underscore: 67 }], 37: [function(require2, module2, exports2) {
      function readString(xmlString, namespaceMap) {
        function convertNode(node) {
          switch (node.nodeType) {
            case Node.ELEMENT_NODE:
              return convertElement(node);
            case Node.TEXT_NODE:
              return nodes.text(node.nodeValue);
          }
        }
        function convertElement(element) {
          var convertedName = convertName(element), convertedChildren = [];
          _.forEach(element.childNodes, function(childNode) {
            var convertedNode = convertNode(childNode);
            convertedNode && convertedChildren.push(convertedNode);
          });
          var convertedAttributes = /* @__PURE__ */ Object.create(null);
          return _.forEach(element.attributes, function(attribute) {
            convertedAttributes[convertName(attribute)] = attribute.value;
          }), new Element(convertedName, convertedAttributes, convertedChildren);
        }
        function convertName(node) {
          if (node.namespaceURI) {
            var prefix, mappedPrefix = namespaceMap[node.namespaceURI];
            return prefix = mappedPrefix ? mappedPrefix + ":" : "{" + node.namespaceURI + "}", prefix + node.localName;
          }
          return node.localName;
        }
        namespaceMap = namespaceMap || {};
        try {
          var document = xmldom.parseFromString(xmlString, "text/xml");
        } catch (error) {
          return promises.reject(error);
        }
        return "parsererror" === document.documentElement.tagName ? promises.resolve(new Error(document.documentElement.textContent)) : promises.resolve(convertNode(document.documentElement));
      }
      var promises = require2("../promises"), _ = require2("underscore"), xmldom = require2("./xmldom"), nodes = require2("./nodes"), Element = nodes.Element;
      exports2.readString = readString;
      var Node = xmldom.Node;
    }, { "../promises": 23, "./nodes": 36, "./xmldom": 39, underscore: 67 }], 38: [function(require2, module2, exports2) {
      function writeString(root, namespaces) {
        function writeNode(builder, node) {
          return nodeWriters[node.type](builder, node);
        }
        function writeElement(builder, element) {
          var elementBuilder = builder.element(mapElementName(element.name), element.attributes);
          element.children.forEach(function(child) {
            writeNode(elementBuilder, child);
          });
        }
        function mapElementName(name) {
          var longFormMatch = /^\{(.*)\}(.*)$/.exec(name);
          if (longFormMatch) {
            var prefix = uriToPrefix[longFormMatch[1]];
            return prefix + ("" === prefix ? "" : ":") + longFormMatch[2];
          }
          return name;
        }
        function writeDocument(root2) {
          var builder = xmlbuilder.create(mapElementName(root2.name), { version: "1.0", encoding: "UTF-8", standalone: true });
          return _.forEach(namespaces, function(uri, prefix) {
            var key = "xmlns" + ("" === prefix ? "" : ":" + prefix);
            builder.attribute(key, uri);
          }), root2.children.forEach(function(child) {
            writeNode(builder, child);
          }), builder.end();
        }
        var uriToPrefix = _.invert(namespaces), nodeWriters = { element: writeElement, text: writeTextNode };
        return writeDocument(root);
      }
      function writeTextNode(builder, node) {
        builder.text(node.value);
      }
      var _ = require2("underscore"), xmlbuilder = require2("xmlbuilder");
      exports2.writeString = writeString;
    }, { underscore: 67, xmlbuilder: 89 }], 39: [function(require2, module2, exports2) {
      function parseFromString(string) {
        var error = null, domParser = new xmldom.DOMParser({ errorHandler: function(level, message) {
          error = { level, message };
        } }), document = domParser.parseFromString(string);
        if (null === error) return document;
        throw new Error(error.level + ": " + error.message);
      }
      var xmldom = require2("@xmldom/xmldom"), dom = require2("@xmldom/xmldom/lib/dom");
      exports2.parseFromString = parseFromString, exports2.Node = dom.Node;
    }, { "@xmldom/xmldom": 45, "@xmldom/xmldom/lib/dom": 43 }], 40: [function(require2, module2, exports2) {
      function openArrayBuffer(arrayBuffer) {
        return JSZip.loadAsync(arrayBuffer).then(function(zipFile) {
          function exists(name) {
            return null !== zipFile.file(name);
          }
          function read(name, encoding) {
            return zipFile.file(name).async("uint8array").then(function(array) {
              if ("base64" === encoding) return base64js.fromByteArray(array);
              if (encoding) {
                var decoder = new TextDecoder(encoding);
                return decoder.decode(array);
              }
              return array;
            });
          }
          function write(name, contents) {
            zipFile.file(name, contents);
          }
          function toArrayBuffer() {
            return zipFile.generateAsync({ type: "arraybuffer" });
          }
          return { exists, read, write, toArrayBuffer };
        });
      }
      function splitPath(path) {
        var lastIndex = path.lastIndexOf("/");
        return -1 === lastIndex ? { dirname: "", basename: path } : { dirname: path.substring(0, lastIndex), basename: path.substring(lastIndex + 1) };
      }
      function joinPath() {
        var nonEmptyPaths = Array.prototype.filter.call(arguments, function(path) {
          return path;
        }), relevantPaths = [];
        return nonEmptyPaths.forEach(function(path) {
          /^\//.test(path) ? relevantPaths = [path] : relevantPaths.push(path);
        }), relevantPaths.join("/");
      }
      var base64js = require2("base64-js"), JSZip = require2("jszip");
      exports2.openArrayBuffer = openArrayBuffer, exports2.splitPath = splitPath, exports2.joinPath = joinPath;
    }, { "base64-js": 47, jszip: 53 }], 41: [function(require2, module2, exports2) {
      function find(list, predicate, ac) {
        if (void 0 === ac && (ac = Array.prototype), list && "function" == typeof ac.find) return ac.find.call(list, predicate);
        for (var i = 0; i < list.length; i++) if (Object.prototype.hasOwnProperty.call(list, i)) {
          var item = list[i];
          if (predicate.call(void 0, item, i, list)) return item;
        }
      }
      function freeze(object, oc) {
        return void 0 === oc && (oc = Object), oc && "function" == typeof oc.freeze ? oc.freeze(object) : object;
      }
      function assign(target, source) {
        if (null === target || "object" != typeof target) throw new TypeError("target is not an object");
        for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
        return target;
      }
      var MIME_TYPE = freeze({ HTML: "text/html", isHTML: function(value) {
        return value === MIME_TYPE.HTML;
      }, XML_APPLICATION: "application/xml", XML_TEXT: "text/xml", XML_XHTML_APPLICATION: "application/xhtml+xml", XML_SVG_IMAGE: "image/svg+xml" }), NAMESPACE = freeze({ HTML: "http://www.w3.org/1999/xhtml", isHTML: function(uri) {
        return uri === NAMESPACE.HTML;
      }, SVG: "http://www.w3.org/2000/svg", XML: "http://www.w3.org/XML/1998/namespace", XMLNS: "http://www.w3.org/2000/xmlns/" });
      exports2.assign = assign, exports2.find = find, exports2.freeze = freeze, exports2.MIME_TYPE = MIME_TYPE, exports2.NAMESPACE = NAMESPACE;
    }, {}], 42: [function(require2, module2, exports2) {
      function normalizeLineEndings(input) {
        return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028]/g, "\n");
      }
      function DOMParser(options) {
        this.options = options || { locator: {} };
      }
      function buildErrorHandler(errorImpl, domBuilder, locator) {
        function build(key) {
          var fn = errorImpl[key];
          !fn && isCallback && (fn = 2 == errorImpl.length ? function(msg) {
            errorImpl(key, msg);
          } : errorImpl), errorHandler[key] = fn && function(msg) {
            fn("[xmldom " + key + "]	" + msg + _locator(locator));
          } || function() {
          };
        }
        if (!errorImpl) {
          if (domBuilder instanceof DOMHandler) return domBuilder;
          errorImpl = domBuilder;
        }
        var errorHandler = {}, isCallback = errorImpl instanceof Function;
        return locator = locator || {}, build("warning"), build("error"), build("fatalError"), errorHandler;
      }
      function DOMHandler() {
        this.cdata = false;
      }
      function position(locator, node) {
        node.lineNumber = locator.lineNumber, node.columnNumber = locator.columnNumber;
      }
      function _locator(l) {
        return l ? "\n@" + (l.systemId || "") + "#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]" : void 0;
      }
      function _toString(chars, start, length) {
        return "string" == typeof chars ? chars.substr(start, length) : chars.length >= start + length || start ? new java.lang.String(chars, start, length) + "" : chars;
      }
      function appendElement(hander, node) {
        hander.currentElement ? hander.currentElement.appendChild(node) : hander.doc.appendChild(node);
      }
      var conventions = require2("./conventions"), dom = require2("./dom"), entities = require2("./entities"), sax = require2("./sax"), DOMImplementation = dom.DOMImplementation, NAMESPACE = conventions.NAMESPACE, ParseError = sax.ParseError, XMLReader = sax.XMLReader;
      DOMParser.prototype.parseFromString = function(source, mimeType) {
        var options = this.options, sax2 = new XMLReader(), domBuilder = options.domBuilder || new DOMHandler(), errorHandler = options.errorHandler, locator = options.locator, defaultNSMap = options.xmlns || {}, isHTML = /\/x?html?$/.test(mimeType), entityMap = isHTML ? entities.HTML_ENTITIES : entities.XML_ENTITIES;
        locator && domBuilder.setDocumentLocator(locator), sax2.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator), sax2.domBuilder = options.domBuilder || domBuilder, isHTML && (defaultNSMap[""] = NAMESPACE.HTML), defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
        var normalize = options.normalizeLineEndings || normalizeLineEndings;
        return source && "string" == typeof source ? sax2.parse(normalize(source), defaultNSMap, entityMap) : sax2.errorHandler.error("invalid doc source"), domBuilder.doc;
      }, DOMHandler.prototype = { startDocument: function() {
        this.doc = new DOMImplementation().createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
      }, startElement: function(namespaceURI, localName, qName, attrs) {
        var doc = this.doc, el = doc.createElementNS(namespaceURI, qName || localName), len = attrs.length;
        appendElement(this, el), this.currentElement = el, this.locator && position(this.locator, el);
        for (var i = 0; len > i; i++) {
          var namespaceURI = attrs.getURI(i), value = attrs.getValue(i), qName = attrs.getQName(i), attr = doc.createAttributeNS(namespaceURI, qName);
          this.locator && position(attrs.getLocator(i), attr), attr.value = attr.nodeValue = value, el.setAttributeNode(attr);
        }
      }, endElement: function(namespaceURI, localName, qName) {
        var current = this.currentElement;
        current.tagName;
        this.currentElement = current.parentNode;
      }, startPrefixMapping: function(prefix, uri) {
      }, endPrefixMapping: function(prefix) {
      }, processingInstruction: function(target, data) {
        var ins = this.doc.createProcessingInstruction(target, data);
        this.locator && position(this.locator, ins), appendElement(this, ins);
      }, ignorableWhitespace: function(ch, start, length) {
      }, characters: function(chars, start, length) {
        if (chars = _toString.apply(this, arguments)) {
          if (this.cdata) var charNode = this.doc.createCDATASection(chars);
          else var charNode = this.doc.createTextNode(chars);
          this.currentElement ? this.currentElement.appendChild(charNode) : /^\s*$/.test(chars) && this.doc.appendChild(charNode), this.locator && position(this.locator, charNode);
        }
      }, skippedEntity: function(name) {
      }, endDocument: function() {
        this.doc.normalize();
      }, setDocumentLocator: function(locator) {
        (this.locator = locator) && (locator.lineNumber = 0);
      }, comment: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        var comm = this.doc.createComment(chars);
        this.locator && position(this.locator, comm), appendElement(this, comm);
      }, startCDATA: function() {
        this.cdata = true;
      }, endCDATA: function() {
        this.cdata = false;
      }, startDTD: function(name, publicId, systemId) {
        var impl = this.doc.implementation;
        if (impl && impl.createDocumentType) {
          var dt = impl.createDocumentType(name, publicId, systemId);
          this.locator && position(this.locator, dt), appendElement(this, dt), this.doc.doctype = dt;
        }
      }, warning: function(error) {
        console.warn("[xmldom warning]	" + error, _locator(this.locator));
      }, error: function(error) {
        console.error("[xmldom error]	" + error, _locator(this.locator));
      }, fatalError: function(error) {
        throw new ParseError(error, this.locator);
      } }, "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(key) {
        DOMHandler.prototype[key] = function() {
          return null;
        };
      }), exports2.__DOMHandler = DOMHandler, exports2.normalizeLineEndings = normalizeLineEndings, exports2.DOMParser = DOMParser;
    }, { "./conventions": 41, "./dom": 43, "./entities": 44, "./sax": 46 }], 43: [function(require2, module2, exports2) {
      function notEmptyString(input) {
        return "" !== input;
      }
      function splitOnASCIIWhitespace(input) {
        return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
      }
      function orderedSetReducer(current, element) {
        return current.hasOwnProperty(element) || (current[element] = true), current;
      }
      function toOrderedSet(input) {
        if (!input) return [];
        var list = splitOnASCIIWhitespace(input);
        return Object.keys(list.reduce(orderedSetReducer, {}));
      }
      function arrayIncludes(list) {
        return function(element) {
          return list && -1 !== list.indexOf(element);
        };
      }
      function copy(src, dest) {
        for (var p in src) Object.prototype.hasOwnProperty.call(src, p) && (dest[p] = src[p]);
      }
      function _extends(Class, Super) {
        function t() {
        }
        var pt = Class.prototype;
        pt instanceof Super || (t.prototype = Super.prototype, t = new t(), copy(pt, t), Class.prototype = pt = t), pt.constructor != Class && ("function" != typeof Class && console.error("unknown Class:" + Class), pt.constructor = Class);
      }
      function DOMException(code, message) {
        if (message instanceof Error) var error = message;
        else error = this, Error.call(this, ExceptionMessage[code]), this.message = ExceptionMessage[code], Error.captureStackTrace && Error.captureStackTrace(this, DOMException);
        return error.code = code, message && (this.message = this.message + ": " + message), error;
      }
      function NodeList() {
      }
      function LiveNodeList(node, refresh) {
        this._node = node, this._refresh = refresh, _updateLiveList(this);
      }
      function _updateLiveList(list) {
        var inc = list._node._inc || list._node.ownerDocument._inc;
        if (list._inc != inc) {
          var ls = list._refresh(list._node);
          __set__(list, "length", ls.length), copy(ls, list), list._inc = inc;
        }
      }
      function NamedNodeMap() {
      }
      function _findNodeIndex(list, node) {
        for (var i = list.length; i--; ) if (list[i] === node) return i;
      }
      function _addNamedNode(el, list, newAttr, oldAttr) {
        if (oldAttr ? list[_findNodeIndex(list, oldAttr)] = newAttr : list[list.length++] = newAttr, el) {
          newAttr.ownerElement = el;
          var doc = el.ownerDocument;
          doc && (oldAttr && _onRemoveAttribute(doc, el, oldAttr), _onAddAttribute(doc, el, newAttr));
        }
      }
      function _removeNamedNode(el, list, attr) {
        var i = _findNodeIndex(list, attr);
        if (!(i >= 0)) throw new DOMException(NOT_FOUND_ERR, new Error(el.tagName + "@" + attr));
        for (var lastIndex = list.length - 1; lastIndex > i; ) list[i] = list[++i];
        if (list.length = lastIndex, el) {
          var doc = el.ownerDocument;
          doc && (_onRemoveAttribute(doc, el, attr), attr.ownerElement = null);
        }
      }
      function DOMImplementation() {
      }
      function Node() {
      }
      function _xmlEncoder(c) {
        return "<" == c && "&lt;" || ">" == c && "&gt;" || "&" == c && "&amp;" || '"' == c && "&quot;" || "&#" + c.charCodeAt() + ";";
      }
      function _visitNode(node, callback) {
        if (callback(node)) return true;
        if (node = node.firstChild) do
          if (_visitNode(node, callback)) return true;
        while (node = node.nextSibling);
      }
      function Document() {
        this.ownerDocument = this;
      }
      function _onAddAttribute(doc, el, newAttr) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        ns === NAMESPACE.XMLNS && (el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value);
      }
      function _onRemoveAttribute(doc, el, newAttr, remove) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        ns === NAMESPACE.XMLNS && delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
      }
      function _onUpdateChild(doc, el, newChild) {
        if (doc && doc._inc) {
          doc._inc++;
          var cs = el.childNodes;
          if (newChild) cs[cs.length++] = newChild;
          else {
            for (var child = el.firstChild, i = 0; child; ) cs[i++] = child, child = child.nextSibling;
            cs.length = i, delete cs[cs.length];
          }
        }
      }
      function _removeChild(parentNode, child) {
        var previous = child.previousSibling, next = child.nextSibling;
        return previous ? previous.nextSibling = next : parentNode.firstChild = next, next ? next.previousSibling = previous : parentNode.lastChild = previous, child.parentNode = null, child.previousSibling = null, child.nextSibling = null, _onUpdateChild(parentNode.ownerDocument, parentNode), child;
      }
      function hasValidParentNodeType(node) {
        return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
      }
      function hasInsertableNodeType(node) {
        return node && (isElementNode(node) || isTextNode(node) || isDocTypeNode(node) || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE);
      }
      function isDocTypeNode(node) {
        return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
      }
      function isElementNode(node) {
        return node && node.nodeType === Node.ELEMENT_NODE;
      }
      function isTextNode(node) {
        return node && node.nodeType === Node.TEXT_NODE;
      }
      function isElementInsertionPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) return false;
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function isElementReplacementPossible(doc, child) {
        function hasElementChildThatIsNotChild(node) {
          return isElementNode(node) && node !== child;
        }
        var parentChildNodes = doc.childNodes || [];
        if (find(parentChildNodes, hasElementChildThatIsNotChild)) return false;
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function assertPreInsertionValidity1to5(parent, node, child) {
        if (!hasValidParentNodeType(parent)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
        if (child && child.parentNode !== parent) throw new DOMException(NOT_FOUND_ERR, "child not in parent");
        if (!hasInsertableNodeType(node) || isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE) throw new DOMException(HIERARCHY_REQUEST_ERR, "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType);
      }
      function assertPreInsertionValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [], nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          if (1 === nodeChildElements.length && !isElementInsertionPossible(parent, child)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
        if (isElementNode(node) && !isElementInsertionPossible(parent, child)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        if (isDocTypeNode(node)) {
          if (find(parentChildNodes, isDocTypeNode)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          if (!child && parentElementChild) throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
        }
      }
      function assertPreReplacementValidityInDocument(parent, node, child) {
        function hasDoctypeChildThatIsNotChild(node2) {
          return isDocTypeNode(node2) && node2 !== child;
        }
        var parentChildNodes = parent.childNodes || [], nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          if (1 === nodeChildElements.length && !isElementReplacementPossible(parent, child)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
        if (isElementNode(node) && !isElementReplacementPossible(parent, child)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        if (isDocTypeNode(node)) {
          if (find(parentChildNodes, hasDoctypeChildThatIsNotChild)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
      }
      function _insertBefore(parent, node, child, _inDocumentAssertion) {
        assertPreInsertionValidity1to5(parent, node, child), parent.nodeType === Node.DOCUMENT_NODE && (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
        var cp = node.parentNode;
        if (cp && cp.removeChild(node), node.nodeType === DOCUMENT_FRAGMENT_NODE) {
          var newFirst = node.firstChild;
          if (null == newFirst) return node;
          var newLast = node.lastChild;
        } else newFirst = newLast = node;
        var pre = child ? child.previousSibling : parent.lastChild;
        newFirst.previousSibling = pre, newLast.nextSibling = child, pre ? pre.nextSibling = newFirst : parent.firstChild = newFirst, null == child ? parent.lastChild = newLast : child.previousSibling = newLast;
        do
          newFirst.parentNode = parent;
        while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
        return _onUpdateChild(parent.ownerDocument || parent, parent), node.nodeType == DOCUMENT_FRAGMENT_NODE && (node.firstChild = node.lastChild = null), node;
      }
      function _appendSingleChild(parentNode, newChild) {
        return newChild.parentNode && newChild.parentNode.removeChild(newChild), newChild.parentNode = parentNode, newChild.previousSibling = parentNode.lastChild, newChild.nextSibling = null, newChild.previousSibling ? newChild.previousSibling.nextSibling = newChild : parentNode.firstChild = newChild, parentNode.lastChild = newChild, _onUpdateChild(parentNode.ownerDocument, parentNode, newChild), newChild;
      }
      function Element() {
        this._nsMap = {};
      }
      function Attr() {
      }
      function CharacterData() {
      }
      function Text() {
      }
      function Comment() {
      }
      function CDATASection() {
      }
      function DocumentType() {
      }
      function Notation() {
      }
      function Entity() {
      }
      function EntityReference() {
      }
      function DocumentFragment() {
      }
      function ProcessingInstruction() {
      }
      function XMLSerializer() {
      }
      function nodeSerializeToString(isHtml, nodeFilter) {
        var buf = [], refNode = 9 == this.nodeType && this.documentElement || this, prefix = refNode.prefix, uri = refNode.namespaceURI;
        if (uri && null == prefix) {
          var prefix = refNode.lookupPrefix(uri);
          if (null == prefix) var visibleNamespaces = [{ namespace: uri, prefix: null }];
        }
        return serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces), buf.join("");
      }
      function needNamespaceDefine(node, isHTML, visibleNamespaces) {
        var prefix = node.prefix || "", uri = node.namespaceURI;
        if (!uri) return false;
        if ("xml" === prefix && uri === NAMESPACE.XML || uri === NAMESPACE.XMLNS) return false;
        for (var i = visibleNamespaces.length; i--; ) {
          var ns = visibleNamespaces[i];
          if (ns.prefix === prefix) return ns.namespace !== uri;
        }
        return true;
      }
      function addSerializedAttribute(buf, qualifiedName, value) {
        buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
      }
      function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces) {
        if (visibleNamespaces || (visibleNamespaces = []), nodeFilter) {
          if (node = nodeFilter(node), !node) return;
          if ("string" == typeof node) return void buf.push(node);
        }
        switch (node.nodeType) {
          case ELEMENT_NODE:
            var attrs = node.attributes, len = attrs.length, child = node.firstChild, nodeName = node.tagName;
            isHTML = NAMESPACE.isHTML(node.namespaceURI) || isHTML;
            var prefixedNodeName = nodeName;
            if (!isHTML && !node.prefix && node.namespaceURI) {
              for (var defaultNS, ai = 0; ai < attrs.length; ai++) if ("xmlns" === attrs.item(ai).name) {
                defaultNS = attrs.item(ai).value;
                break;
              }
              if (!defaultNS) for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                var namespace = visibleNamespaces[nsi];
                if ("" === namespace.prefix && namespace.namespace === node.namespaceURI) {
                  defaultNS = namespace.namespace;
                  break;
                }
              }
              if (defaultNS !== node.namespaceURI) for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                var namespace = visibleNamespaces[nsi];
                if (namespace.namespace === node.namespaceURI) {
                  namespace.prefix && (prefixedNodeName = namespace.prefix + ":" + nodeName);
                  break;
                }
              }
            }
            buf.push("<", prefixedNodeName);
            for (var i = 0; len > i; i++) {
              var attr = attrs.item(i);
              "xmlns" == attr.prefix ? visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value }) : "xmlns" == attr.nodeName && visibleNamespaces.push({ prefix: "", namespace: attr.value });
            }
            for (var i = 0; len > i; i++) {
              var attr = attrs.item(i);
              if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
                var prefix = attr.prefix || "", uri = attr.namespaceURI;
                addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri), visibleNamespaces.push({ prefix, namespace: uri });
              }
              serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
            }
            if (nodeName === prefixedNodeName && needNamespaceDefine(node, isHTML, visibleNamespaces)) {
              var prefix = node.prefix || "", uri = node.namespaceURI;
              addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri), visibleNamespaces.push({ prefix, namespace: uri });
            }
            if (child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
              if (buf.push(">"), isHTML && /^script$/i.test(nodeName)) for (; child; ) child.data ? buf.push(child.data) : serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice()), child = child.nextSibling;
              else for (; child; ) serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice()), child = child.nextSibling;
              buf.push("</", prefixedNodeName, ">");
            } else buf.push("/>");
            return;
          case DOCUMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            for (var child = node.firstChild; child; ) serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice()), child = child.nextSibling;
            return;
          case ATTRIBUTE_NODE:
            return addSerializedAttribute(buf, node.name, node.value);
          case TEXT_NODE:
            return buf.push(node.data.replace(/[<&>]/g, _xmlEncoder));
          case CDATA_SECTION_NODE:
            return buf.push("<![CDATA[", node.data, "]]>");
          case COMMENT_NODE:
            return buf.push("<!--", node.data, "-->");
          case DOCUMENT_TYPE_NODE:
            var pubid = node.publicId, sysid = node.systemId;
            if (buf.push("<!DOCTYPE ", node.name), pubid) buf.push(" PUBLIC ", pubid), sysid && "." != sysid && buf.push(" ", sysid), buf.push(">");
            else if (sysid && "." != sysid) buf.push(" SYSTEM ", sysid, ">");
            else {
              var sub = node.internalSubset;
              sub && buf.push(" [", sub, "]"), buf.push(">");
            }
            return;
          case PROCESSING_INSTRUCTION_NODE:
            return buf.push("<?", node.target, " ", node.data, "?>");
          case ENTITY_REFERENCE_NODE:
            return buf.push("&", node.nodeName, ";");
          default:
            buf.push("??", node.nodeName);
        }
      }
      function importNode(doc, node, deep) {
        var node2;
        switch (node.nodeType) {
          case ELEMENT_NODE:
            node2 = node.cloneNode(false), node2.ownerDocument = doc;
          case DOCUMENT_FRAGMENT_NODE:
            break;
          case ATTRIBUTE_NODE:
            deep = true;
        }
        if (node2 || (node2 = node.cloneNode(false)), node2.ownerDocument = doc, node2.parentNode = null, deep) for (var child = node.firstChild; child; ) node2.appendChild(importNode(doc, child, deep)), child = child.nextSibling;
        return node2;
      }
      function cloneNode(doc, node, deep) {
        var node2 = new node.constructor();
        for (var n in node) if (Object.prototype.hasOwnProperty.call(node, n)) {
          var v = node[n];
          "object" != typeof v && v != node2[n] && (node2[n] = v);
        }
        switch (node.childNodes && (node2.childNodes = new NodeList()), node2.ownerDocument = doc, node2.nodeType) {
          case ELEMENT_NODE:
            var attrs = node.attributes, attrs2 = node2.attributes = new NamedNodeMap(), len = attrs.length;
            attrs2._ownerElement = node2;
            for (var i = 0; len > i; i++) node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
            break;
          case ATTRIBUTE_NODE:
            deep = true;
        }
        if (deep) for (var child = node.firstChild; child; ) node2.appendChild(cloneNode(doc, child, deep)), child = child.nextSibling;
        return node2;
      }
      function __set__(object, key, value) {
        object[key] = value;
      }
      function getTextContent(node) {
        switch (node.nodeType) {
          case ELEMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            var buf = [];
            for (node = node.firstChild; node; ) 7 !== node.nodeType && 8 !== node.nodeType && buf.push(getTextContent(node)), node = node.nextSibling;
            return buf.join("");
          default:
            return node.nodeValue;
        }
      }
      var conventions = require2("./conventions"), find = conventions.find, NAMESPACE = conventions.NAMESPACE, NodeType = {}, ELEMENT_NODE = NodeType.ELEMENT_NODE = 1, ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2, TEXT_NODE = NodeType.TEXT_NODE = 3, CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4, ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5, ENTITY_NODE = NodeType.ENTITY_NODE = 6, PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7, COMMENT_NODE = NodeType.COMMENT_NODE = 8, DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9, DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10, DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11, NOTATION_NODE = NodeType.NOTATION_NODE = 12, ExceptionCode = {}, ExceptionMessage = {}, HIERARCHY_REQUEST_ERR = (ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1), ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2), ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3)), NOT_FOUND_ERR = (ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4), ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5), ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6), ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7), ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8)), INUSE_ATTRIBUTE_ERR = (ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9), ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10));
      ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11), ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12), ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13), ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14), ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);
      DOMException.prototype = Error.prototype, copy(ExceptionCode, DOMException), NodeList.prototype = { length: 0, item: function(index) {
        return this[index] || null;
      }, toString: function(isHTML, nodeFilter) {
        for (var buf = [], i = 0; i < this.length; i++) serializeToString(this[i], buf, isHTML, nodeFilter);
        return buf.join("");
      }, filter: function(predicate) {
        return Array.prototype.filter.call(this, predicate);
      }, indexOf: function(item) {
        return Array.prototype.indexOf.call(this, item);
      } }, LiveNodeList.prototype.item = function(i) {
        return _updateLiveList(this), this[i];
      }, _extends(LiveNodeList, NodeList), NamedNodeMap.prototype = { length: 0, item: NodeList.prototype.item, getNamedItem: function(key) {
        for (var i = this.length; i--; ) {
          var attr = this[i];
          if (attr.nodeName == key) return attr;
        }
      }, setNamedItem: function(attr) {
        var el = attr.ownerElement;
        if (el && el != this._ownerElement) throw new DOMException(INUSE_ATTRIBUTE_ERR);
        var oldAttr = this.getNamedItem(attr.nodeName);
        return _addNamedNode(this._ownerElement, this, attr, oldAttr), oldAttr;
      }, setNamedItemNS: function(attr) {
        var oldAttr, el = attr.ownerElement;
        if (el && el != this._ownerElement) throw new DOMException(INUSE_ATTRIBUTE_ERR);
        return oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName), _addNamedNode(this._ownerElement, this, attr, oldAttr), oldAttr;
      }, removeNamedItem: function(key) {
        var attr = this.getNamedItem(key);
        return _removeNamedNode(this._ownerElement, this, attr), attr;
      }, removeNamedItemNS: function(namespaceURI, localName) {
        var attr = this.getNamedItemNS(namespaceURI, localName);
        return _removeNamedNode(this._ownerElement, this, attr), attr;
      }, getNamedItemNS: function(namespaceURI, localName) {
        for (var i = this.length; i--; ) {
          var node = this[i];
          if (node.localName == localName && node.namespaceURI == namespaceURI) return node;
        }
        return null;
      } }, DOMImplementation.prototype = { hasFeature: function(feature, version) {
        return true;
      }, createDocument: function(namespaceURI, qualifiedName, doctype) {
        var doc = new Document();
        if (doc.implementation = this, doc.childNodes = new NodeList(), doc.doctype = doctype || null, doctype && doc.appendChild(doctype), qualifiedName) {
          var root = doc.createElementNS(namespaceURI, qualifiedName);
          doc.appendChild(root);
        }
        return doc;
      }, createDocumentType: function(qualifiedName, publicId, systemId) {
        var node = new DocumentType();
        return node.name = qualifiedName, node.nodeName = qualifiedName, node.publicId = publicId || "", node.systemId = systemId || "", node;
      } }, Node.prototype = { firstChild: null, lastChild: null, previousSibling: null, nextSibling: null, attributes: null, parentNode: null, childNodes: null, ownerDocument: null, nodeValue: null, namespaceURI: null, prefix: null, localName: null, insertBefore: function(newChild, refChild) {
        return _insertBefore(this, newChild, refChild);
      }, replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument), oldChild && this.removeChild(oldChild);
      }, removeChild: function(oldChild) {
        return _removeChild(this, oldChild);
      }, appendChild: function(newChild) {
        return this.insertBefore(newChild, null);
      }, hasChildNodes: function() {
        return null != this.firstChild;
      }, cloneNode: function(deep) {
        return cloneNode(this.ownerDocument || this, this, deep);
      }, normalize: function() {
        for (var child = this.firstChild; child; ) {
          var next = child.nextSibling;
          next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE ? (this.removeChild(next), child.appendData(next.data)) : (child.normalize(), child = next);
        }
      }, isSupported: function(feature, version) {
        return this.ownerDocument.implementation.hasFeature(feature, version);
      }, hasAttributes: function() {
        return this.attributes.length > 0;
      }, lookupPrefix: function(namespaceURI) {
        for (var el = this; el; ) {
          var map = el._nsMap;
          if (map) {
            for (var n in map) if (Object.prototype.hasOwnProperty.call(map, n) && map[n] === namespaceURI) return n;
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      }, lookupNamespaceURI: function(prefix) {
        for (var el = this; el; ) {
          var map = el._nsMap;
          if (map && Object.prototype.hasOwnProperty.call(map, prefix)) return map[prefix];
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      }, isDefaultNamespace: function(namespaceURI) {
        var prefix = this.lookupPrefix(namespaceURI);
        return null == prefix;
      } }, copy(NodeType, Node), copy(NodeType, Node.prototype), Document.prototype = { nodeName: "#document", nodeType: DOCUMENT_NODE, doctype: null, documentElement: null, _inc: 1, insertBefore: function(newChild, refChild) {
        if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
          for (var child = newChild.firstChild; child; ) {
            var next = child.nextSibling;
            this.insertBefore(child, refChild), child = next;
          }
          return newChild;
        }
        return _insertBefore(this, newChild, refChild), newChild.ownerDocument = this, null === this.documentElement && newChild.nodeType === ELEMENT_NODE && (this.documentElement = newChild), newChild;
      }, removeChild: function(oldChild) {
        return this.documentElement == oldChild && (this.documentElement = null), _removeChild(this, oldChild);
      }, replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument), newChild.ownerDocument = this, oldChild && this.removeChild(oldChild), isElementNode(newChild) && (this.documentElement = newChild);
      }, importNode: function(importedNode, deep) {
        return importNode(this, importedNode, deep);
      }, getElementById: function(id) {
        var rtv = null;
        return _visitNode(this.documentElement, function(node) {
          return node.nodeType == ELEMENT_NODE && node.getAttribute("id") == id ? (rtv = node, true) : void 0;
        }), rtv;
      }, getElementsByClassName: function(classNames) {
        var classNamesSet = toOrderedSet(classNames);
        return new LiveNodeList(this, function(base) {
          var ls = [];
          return classNamesSet.length > 0 && _visitNode(base.documentElement, function(node) {
            if (node !== base && node.nodeType === ELEMENT_NODE) {
              var nodeClassNames = node.getAttribute("class");
              if (nodeClassNames) {
                var matches = classNames === nodeClassNames;
                if (!matches) {
                  var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                  matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                }
                matches && ls.push(node);
              }
            }
          }), ls;
        });
      }, createElement: function(tagName) {
        var node = new Element();
        node.ownerDocument = this, node.nodeName = tagName, node.tagName = tagName, node.localName = tagName, node.childNodes = new NodeList();
        var attrs = node.attributes = new NamedNodeMap();
        return attrs._ownerElement = node, node;
      }, createDocumentFragment: function() {
        var node = new DocumentFragment();
        return node.ownerDocument = this, node.childNodes = new NodeList(), node;
      }, createTextNode: function(data) {
        var node = new Text();
        return node.ownerDocument = this, node.appendData(data), node;
      }, createComment: function(data) {
        var node = new Comment();
        return node.ownerDocument = this, node.appendData(data), node;
      }, createCDATASection: function(data) {
        var node = new CDATASection();
        return node.ownerDocument = this, node.appendData(data), node;
      }, createProcessingInstruction: function(target, data) {
        var node = new ProcessingInstruction();
        return node.ownerDocument = this, node.tagName = node.target = target, node.nodeValue = node.data = data, node;
      }, createAttribute: function(name) {
        var node = new Attr();
        return node.ownerDocument = this, node.name = name, node.nodeName = name, node.localName = name, node.specified = true, node;
      }, createEntityReference: function(name) {
        var node = new EntityReference();
        return node.ownerDocument = this, node.nodeName = name, node;
      }, createElementNS: function(namespaceURI, qualifiedName) {
        var node = new Element(), pl = qualifiedName.split(":"), attrs = node.attributes = new NamedNodeMap();
        return node.childNodes = new NodeList(), node.ownerDocument = this, node.nodeName = qualifiedName, node.tagName = qualifiedName, node.namespaceURI = namespaceURI, 2 == pl.length ? (node.prefix = pl[0], node.localName = pl[1]) : node.localName = qualifiedName, attrs._ownerElement = node, node;
      }, createAttributeNS: function(namespaceURI, qualifiedName) {
        var node = new Attr(), pl = qualifiedName.split(":");
        return node.ownerDocument = this, node.nodeName = qualifiedName, node.name = qualifiedName, node.namespaceURI = namespaceURI, node.specified = true, 2 == pl.length ? (node.prefix = pl[0], node.localName = pl[1]) : node.localName = qualifiedName, node;
      } }, _extends(Document, Node), Element.prototype = { nodeType: ELEMENT_NODE, hasAttribute: function(name) {
        return null != this.getAttributeNode(name);
      }, getAttribute: function(name) {
        var attr = this.getAttributeNode(name);
        return attr && attr.value || "";
      }, getAttributeNode: function(name) {
        return this.attributes.getNamedItem(name);
      }, setAttribute: function(name, value) {
        var attr = this.ownerDocument.createAttribute(name);
        attr.value = attr.nodeValue = "" + value, this.setAttributeNode(attr);
      }, removeAttribute: function(name) {
        var attr = this.getAttributeNode(name);
        attr && this.removeAttributeNode(attr);
      }, appendChild: function(newChild) {
        return newChild.nodeType === DOCUMENT_FRAGMENT_NODE ? this.insertBefore(newChild, null) : _appendSingleChild(this, newChild);
      }, setAttributeNode: function(newAttr) {
        return this.attributes.setNamedItem(newAttr);
      }, setAttributeNodeNS: function(newAttr) {
        return this.attributes.setNamedItemNS(newAttr);
      }, removeAttributeNode: function(oldAttr) {
        return this.attributes.removeNamedItem(oldAttr.nodeName);
      }, removeAttributeNS: function(namespaceURI, localName) {
        var old = this.getAttributeNodeNS(namespaceURI, localName);
        old && this.removeAttributeNode(old);
      }, hasAttributeNS: function(namespaceURI, localName) {
        return null != this.getAttributeNodeNS(namespaceURI, localName);
      }, getAttributeNS: function(namespaceURI, localName) {
        var attr = this.getAttributeNodeNS(namespaceURI, localName);
        return attr && attr.value || "";
      }, setAttributeNS: function(namespaceURI, qualifiedName, value) {
        var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
        attr.value = attr.nodeValue = "" + value, this.setAttributeNode(attr);
      }, getAttributeNodeNS: function(namespaceURI, localName) {
        return this.attributes.getNamedItemNS(namespaceURI, localName);
      }, getElementsByTagName: function(tagName) {
        return new LiveNodeList(this, function(base) {
          var ls = [];
          return _visitNode(base, function(node) {
            node === base || node.nodeType != ELEMENT_NODE || "*" !== tagName && node.tagName != tagName || ls.push(node);
          }), ls;
        });
      }, getElementsByTagNameNS: function(namespaceURI, localName) {
        return new LiveNodeList(this, function(base) {
          var ls = [];
          return _visitNode(base, function(node) {
            node === base || node.nodeType !== ELEMENT_NODE || "*" !== namespaceURI && node.namespaceURI !== namespaceURI || "*" !== localName && node.localName != localName || ls.push(node);
          }), ls;
        });
      } }, Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName, Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS, _extends(Element, Node), Attr.prototype.nodeType = ATTRIBUTE_NODE, _extends(Attr, Node), CharacterData.prototype = { data: "", substringData: function(offset, count) {
        return this.data.substring(offset, offset + count);
      }, appendData: function(text) {
        text = this.data + text, this.nodeValue = this.data = text, this.length = text.length;
      }, insertData: function(offset, text) {
        this.replaceData(offset, 0, text);
      }, appendChild: function(newChild) {
        throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
      }, deleteData: function(offset, count) {
        this.replaceData(offset, count, "");
      }, replaceData: function(offset, count, text) {
        var start = this.data.substring(0, offset), end = this.data.substring(offset + count);
        text = start + text + end, this.nodeValue = this.data = text, this.length = text.length;
      } }, _extends(CharacterData, Node), Text.prototype = { nodeName: "#text", nodeType: TEXT_NODE, splitText: function(offset) {
        var text = this.data, newText = text.substring(offset);
        text = text.substring(0, offset), this.data = this.nodeValue = text, this.length = text.length;
        var newNode = this.ownerDocument.createTextNode(newText);
        return this.parentNode && this.parentNode.insertBefore(newNode, this.nextSibling), newNode;
      } }, _extends(Text, CharacterData), Comment.prototype = { nodeName: "#comment", nodeType: COMMENT_NODE }, _extends(Comment, CharacterData), CDATASection.prototype = { nodeName: "#cdata-section", nodeType: CDATA_SECTION_NODE }, _extends(CDATASection, CharacterData), DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE, _extends(DocumentType, Node), Notation.prototype.nodeType = NOTATION_NODE, _extends(Notation, Node), Entity.prototype.nodeType = ENTITY_NODE, _extends(Entity, Node), EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE, _extends(EntityReference, Node), DocumentFragment.prototype.nodeName = "#document-fragment", DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE, _extends(DocumentFragment, Node), ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE, _extends(ProcessingInstruction, Node), XMLSerializer.prototype.serializeToString = function(node, isHtml, nodeFilter) {
        return nodeSerializeToString.call(node, isHtml, nodeFilter);
      }, Node.prototype.toString = nodeSerializeToString;
      try {
        Object.defineProperty && (Object.defineProperty(LiveNodeList.prototype, "length", { get: function() {
          return _updateLiveList(this), this.$$length;
        } }), Object.defineProperty(Node.prototype, "textContent", { get: function() {
          return getTextContent(this);
        }, set: function(data) {
          switch (this.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              for (; this.firstChild; ) this.removeChild(this.firstChild);
              (data || String(data)) && this.appendChild(this.ownerDocument.createTextNode(data));
              break;
            default:
              this.data = data, this.value = data, this.nodeValue = data;
          }
        } }), __set__ = function(object, key, value) {
          object["$$" + key] = value;
        });
      } catch (e) {
      }
      exports2.DocumentType = DocumentType, exports2.DOMException = DOMException, exports2.DOMImplementation = DOMImplementation, exports2.Element = Element, exports2.Node = Node, exports2.NodeList = NodeList, exports2.XMLSerializer = XMLSerializer;
    }, { "./conventions": 41 }], 44: [function(require2, module2, exports2) {
      var freeze = require2("./conventions").freeze;
      exports2.XML_ENTITIES = freeze({ amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }), exports2.HTML_ENTITIES = freeze({ lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", Agrave: "À", Aacute: "Á", Acirc: "Â", Atilde: "Ã", Auml: "Ä", Aring: "Å", AElig: "Æ", Ccedil: "Ç", Egrave: "È", Eacute: "É", Ecirc: "Ê", Euml: "Ë", Igrave: "Ì", Iacute: "Í", Icirc: "Î", Iuml: "Ï", ETH: "Ð", Ntilde: "Ñ", Ograve: "Ò", Oacute: "Ó", Ocirc: "Ô", Otilde: "Õ", Ouml: "Ö", Oslash: "Ø", Ugrave: "Ù", Uacute: "Ú", Ucirc: "Û", Uuml: "Ü", Yacute: "Ý", THORN: "Þ", szlig: "ß", agrave: "à", aacute: "á", acirc: "â", atilde: "ã", auml: "ä", aring: "å", aelig: "æ", ccedil: "ç", egrave: "è", eacute: "é", ecirc: "ê", euml: "ë", igrave: "ì", iacute: "í", icirc: "î", iuml: "ï", eth: "ð", ntilde: "ñ", ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ", ouml: "ö", oslash: "ø", ugrave: "ù", uacute: "ú", ucirc: "û", uuml: "ü", yacute: "ý", thorn: "þ", yuml: "ÿ", nbsp: " ", iexcl: "¡", cent: "¢", pound: "£", curren: "¤", yen: "¥", brvbar: "¦", sect: "§", uml: "¨", copy: "©", ordf: "ª", laquo: "«", not: "¬", shy: "­­", reg: "®", macr: "¯", deg: "°", plusmn: "±", sup2: "²", sup3: "³", acute: "´", micro: "µ", para: "¶", middot: "·", cedil: "¸", sup1: "¹", ordm: "º", raquo: "»", frac14: "¼", frac12: "½", frac34: "¾", iquest: "¿", times: "×", divide: "÷", forall: "∀", part: "∂", exist: "∃", empty: "∅", nabla: "∇", isin: "∈", notin: "∉", ni: "∋", prod: "∏", sum: "∑", minus: "−", lowast: "∗", radic: "√", prop: "∝", infin: "∞", ang: "∠", and: "∧", or: "∨", cap: "∩", cup: "∪", "int": "∫", there4: "∴", sim: "∼", cong: "≅", asymp: "≈", ne: "≠", equiv: "≡", le: "≤", ge: "≥", sub: "⊂", sup: "⊃", nsub: "⊄", sube: "⊆", supe: "⊇", oplus: "⊕", otimes: "⊗", perp: "⊥", sdot: "⋅", Alpha: "Α", Beta: "Β", Gamma: "Γ", Delta: "Δ", Epsilon: "Ε", Zeta: "Ζ", Eta: "Η", Theta: "Θ", Iota: "Ι", Kappa: "Κ", Lambda: "Λ", Mu: "Μ", Nu: "Ν", Xi: "Ξ", Omicron: "Ο", Pi: "Π", Rho: "Ρ", Sigma: "Σ", Tau: "Τ", Upsilon: "Υ", Phi: "Φ", Chi: "Χ", Psi: "Ψ", Omega: "Ω", alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", omicron: "ο", pi: "π", rho: "ρ", sigmaf: "ς", sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", chi: "χ", psi: "ψ", omega: "ω", thetasym: "ϑ", upsih: "ϒ", piv: "ϖ", OElig: "Œ", oelig: "œ", Scaron: "Š", scaron: "š", Yuml: "Ÿ", fnof: "ƒ", circ: "ˆ", tilde: "˜", ensp: " ", emsp: " ", thinsp: " ", zwnj: "‌", zwj: "‍", lrm: "‎", rlm: "‏", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", sbquo: "‚", ldquo: "“", rdquo: "”", bdquo: "„", dagger: "†", Dagger: "‡", bull: "•", hellip: "…", permil: "‰", prime: "′", Prime: "″", lsaquo: "‹", rsaquo: "›", oline: "‾", euro: "€", trade: "™", larr: "←", uarr: "↑", rarr: "→", darr: "↓", harr: "↔", crarr: "↵", lceil: "⌈", rceil: "⌉", lfloor: "⌊", rfloor: "⌋", loz: "◊", spades: "♠", clubs: "♣", hearts: "♥", diams: "♦" }), exports2.entityMap = exports2.HTML_ENTITIES;
    }, { "./conventions": 41 }], 45: [function(require2, module2, exports2) {
      var dom = require2("./dom");
      exports2.DOMImplementation = dom.DOMImplementation, exports2.XMLSerializer = dom.XMLSerializer, exports2.DOMParser = require2("./dom-parser").DOMParser;
    }, { "./dom": 43, "./dom-parser": 42 }], 46: [function(require2, module2, exports2) {
      function ParseError(message, locator) {
        this.message = message, this.locator = locator, Error.captureStackTrace && Error.captureStackTrace(this, ParseError);
      }
      function XMLReader() {
      }
      function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
        function fixedFromCharCode(code) {
          if (code > 65535) {
            code -= 65536;
            var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (1023 & code);
            return String.fromCharCode(surrogate1, surrogate2);
          }
          return String.fromCharCode(code);
        }
        function entityReplacer(a2) {
          var k = a2.slice(1, -1);
          return Object.hasOwnProperty.call(entityMap, k) ? entityMap[k] : "#" === k.charAt(0) ? fixedFromCharCode(parseInt(k.substr(1).replace("x", "0x"))) : (errorHandler.error("entity not found:" + a2), a2);
        }
        function appendText(end2) {
          if (end2 > start) {
            var xt = source.substring(start, end2).replace(/&#?\w+;/g, entityReplacer);
            locator && position(start), domBuilder.characters(xt, 0, end2 - start), start = end2;
          }
        }
        function position(p, m) {
          for (; p >= lineEnd && (m = linePattern.exec(source)); ) lineStart = m.index, lineEnd = lineStart + m[0].length, locator.lineNumber++;
          locator.columnNumber = p - lineStart + 1;
        }
        for (var lineStart = 0, lineEnd = 0, linePattern = /.*(?:\r\n?|\n)|.*$/g, locator = domBuilder.locator, parseStack = [{ currentNSMap: defaultNSMapCopy }], closeMap = {}, start = 0; ; ) {
          try {
            var tagStart = source.indexOf("<", start);
            if (0 > tagStart) {
              if (!source.substr(start).match(/^\s*$/)) {
                var doc = domBuilder.doc, text = doc.createTextNode(source.substr(start));
                doc.appendChild(text), domBuilder.currentElement = text;
              }
              return;
            }
            switch (tagStart > start && appendText(tagStart), source.charAt(tagStart + 1)) {
              case "/":
                var end = source.indexOf(">", tagStart + 3), tagName = source.substring(tagStart + 2, end).replace(/[ \t\n\r]+$/g, ""), config = parseStack.pop();
                0 > end ? (tagName = source.substring(tagStart + 2).replace(/[\s<].*/, ""), errorHandler.error("end tag name: " + tagName + " is not complete:" + config.tagName), end = tagStart + 1 + tagName.length) : tagName.match(/\s</) && (tagName = tagName.replace(/[\s<].*/, ""), errorHandler.error("end tag name: " + tagName + " maybe not complete"), end = tagStart + 1 + tagName.length);
                var localNSMap = config.localNSMap, endMatch = config.tagName == tagName, endIgnoreCaseMach = endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase();
                if (endIgnoreCaseMach) {
                  if (domBuilder.endElement(config.uri, config.localName, tagName), localNSMap) for (var prefix in localNSMap) Object.prototype.hasOwnProperty.call(localNSMap, prefix) && domBuilder.endPrefixMapping(prefix);
                  endMatch || errorHandler.fatalError("end tag name: " + tagName + " is not match the current start tagName:" + config.tagName);
                } else parseStack.push(config);
                end++;
                break;
              case "?":
                locator && position(tagStart), end = parseInstruction(source, tagStart, domBuilder);
                break;
              case "!":
                locator && position(tagStart), end = parseDCC(source, tagStart, domBuilder, errorHandler);
                break;
              default:
                locator && position(tagStart);
                var el = new ElementAttributes(), currentNSMap = parseStack[parseStack.length - 1].currentNSMap, end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler), len = el.length;
                if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap) && (el.closed = true, entityMap.nbsp || errorHandler.warning("unclosed xml attribute")), locator && len) {
                  for (var locator2 = copyLocator(locator, {}), i = 0; len > i; i++) {
                    var a = el[i];
                    position(a.offset), a.locator = copyLocator(locator, {});
                  }
                  domBuilder.locator = locator2, appendElement(el, domBuilder, currentNSMap) && parseStack.push(el), domBuilder.locator = locator;
                } else appendElement(el, domBuilder, currentNSMap) && parseStack.push(el);
                NAMESPACE.isHTML(el.uri) && !el.closed ? end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder) : end++;
            }
          } catch (e) {
            if (e instanceof ParseError) throw e;
            errorHandler.error("element parse error: " + e), end = -1;
          }
          end > start ? start = end : appendText(Math.max(tagStart, start) + 1);
        }
      }
      function copyLocator(f, t) {
        return t.lineNumber = f.lineNumber, t.columnNumber = f.columnNumber, t;
      }
      function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
        function addAttribute(qname, value2, startIndex) {
          el.attributeNames.hasOwnProperty(qname) && errorHandler.fatalError("Attribute " + qname + " redefined"), el.addValue(qname, value2.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, entityReplacer), startIndex);
        }
        for (var attrName, value, p = ++start, s = S_TAG; ; ) {
          var c = source.charAt(p);
          switch (c) {
            case "=":
              if (s === S_ATTR) attrName = source.slice(start, p), s = S_EQ;
              else {
                if (s !== S_ATTR_SPACE) throw new Error("attribute equal must after attrName");
                s = S_EQ;
              }
              break;
            case "'":
            case '"':
              if (s === S_EQ || s === S_ATTR) {
                if (s === S_ATTR && (errorHandler.warning('attribute value must after "="'), attrName = source.slice(start, p)), start = p + 1, p = source.indexOf(c, start), !(p > 0)) throw new Error("attribute value no end '" + c + "' match");
                value = source.slice(start, p), addAttribute(attrName, value, start - 1), s = S_ATTR_END;
              } else {
                if (s != S_ATTR_NOQUOT_VALUE) throw new Error('attribute value must after "="');
                value = source.slice(start, p), addAttribute(attrName, value, start), errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!"), start = p + 1, s = S_ATTR_END;
              }
              break;
            case "/":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  s = S_TAG_CLOSE, el.closed = true;
                case S_ATTR_NOQUOT_VALUE:
                case S_ATTR:
                case S_ATTR_SPACE:
                  break;
                default:
                  throw new Error("attribute invalid close char('/')");
              }
              break;
            case "":
              return errorHandler.error("unexpected end of input"), s == S_TAG && el.setTagName(source.slice(start, p)), p;
            case ">":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  break;
                case S_ATTR_NOQUOT_VALUE:
                case S_ATTR:
                  value = source.slice(start, p), "/" === value.slice(-1) && (el.closed = true, value = value.slice(0, -1));
                case S_ATTR_SPACE:
                  s === S_ATTR_SPACE && (value = attrName), s == S_ATTR_NOQUOT_VALUE ? (errorHandler.warning('attribute "' + value + '" missed quot(")!'), addAttribute(attrName, value, start)) : (NAMESPACE.isHTML(currentNSMap[""]) && value.match(/^(?:disabled|checked|selected)$/i) || errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!'), addAttribute(value, value, start));
                  break;
                case S_EQ:
                  throw new Error("attribute value missed!!");
              }
              return p;
            case "":
              c = " ";
            default:
              if (" " >= c) switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p)), s = S_TAG_SPACE;
                  break;
                case S_ATTR:
                  attrName = source.slice(start, p), s = S_ATTR_SPACE;
                  break;
                case S_ATTR_NOQUOT_VALUE:
                  var value = source.slice(start, p);
                  errorHandler.warning('attribute "' + value + '" missed quot(")!!'), addAttribute(attrName, value, start);
                case S_ATTR_END:
                  s = S_TAG_SPACE;
              }
              else switch (s) {
                case S_ATTR_SPACE:
                  el.tagName;
                  NAMESPACE.isHTML(currentNSMap[""]) && attrName.match(/^(?:disabled|checked|selected)$/i) || errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!'), addAttribute(attrName, attrName, start), start = p, s = S_ATTR;
                  break;
                case S_ATTR_END:
                  errorHandler.warning('attribute space is required"' + attrName + '"!!');
                case S_TAG_SPACE:
                  s = S_ATTR, start = p;
                  break;
                case S_EQ:
                  s = S_ATTR_NOQUOT_VALUE, start = p;
                  break;
                case S_TAG_CLOSE:
                  throw new Error("elements closed character '/' and '>' must be connected to");
              }
          }
          p++;
        }
      }
      function appendElement(el, domBuilder, currentNSMap) {
        for (var tagName = el.tagName, localNSMap = null, i = el.length; i--; ) {
          var a = el[i], qName = a.qName, value = a.value, nsp = qName.indexOf(":");
          if (nsp > 0) var prefix = a.prefix = qName.slice(0, nsp), localName = qName.slice(nsp + 1), nsPrefix = "xmlns" === prefix && localName;
          else localName = qName, prefix = null, nsPrefix = "xmlns" === qName && "";
          a.localName = localName, nsPrefix !== false && (null == localNSMap && (localNSMap = {}, _copy(currentNSMap, currentNSMap = {})), currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value, a.uri = NAMESPACE.XMLNS, domBuilder.startPrefixMapping(nsPrefix, value));
        }
        for (var i = el.length; i--; ) {
          a = el[i];
          var prefix = a.prefix;
          prefix && ("xml" === prefix && (a.uri = NAMESPACE.XML), "xmlns" !== prefix && (a.uri = currentNSMap[prefix || ""]));
        }
        var nsp = tagName.indexOf(":");
        nsp > 0 ? (prefix = el.prefix = tagName.slice(0, nsp), localName = el.localName = tagName.slice(nsp + 1)) : (prefix = null, localName = el.localName = tagName);
        var ns = el.uri = currentNSMap[prefix || ""];
        if (domBuilder.startElement(ns, localName, tagName, el), !el.closed) return el.currentNSMap = currentNSMap, el.localNSMap = localNSMap, true;
        if (domBuilder.endElement(ns, localName, tagName), localNSMap) for (prefix in localNSMap) Object.prototype.hasOwnProperty.call(localNSMap, prefix) && domBuilder.endPrefixMapping(prefix);
      }
      function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
        if (/^(?:script|textarea)$/i.test(tagName)) {
          var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd), text = source.substring(elStartEnd + 1, elEndStart);
          if (/[&<]/.test(text)) return /^script$/i.test(tagName) ? (domBuilder.characters(text, 0, text.length), elEndStart) : (text = text.replace(/&#?\w+;/g, entityReplacer), domBuilder.characters(text, 0, text.length), elEndStart);
        }
        return elStartEnd + 1;
      }
      function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
        var pos = closeMap[tagName];
        return null == pos && (pos = source.lastIndexOf("</" + tagName + ">"), elStartEnd > pos && (pos = source.lastIndexOf("</" + tagName)), closeMap[tagName] = pos), elStartEnd > pos;
      }
      function _copy(source, target) {
        for (var n in source) Object.prototype.hasOwnProperty.call(source, n) && (target[n] = source[n]);
      }
      function parseDCC(source, start, domBuilder, errorHandler) {
        var next = source.charAt(start + 2);
        switch (next) {
          case "-":
            if ("-" === source.charAt(start + 3)) {
              var end = source.indexOf("-->", start + 4);
              return end > start ? (domBuilder.comment(source, start + 4, end - start - 4), end + 3) : (errorHandler.error("Unclosed comment"), -1);
            }
            return -1;
          default:
            if ("CDATA[" == source.substr(start + 3, 6)) {
              var end = source.indexOf("]]>", start + 9);
              return domBuilder.startCDATA(), domBuilder.characters(source, start + 9, end - start - 9), domBuilder.endCDATA(), end + 3;
            }
            var matchs = split(source, start), len = matchs.length;
            if (len > 1 && /!doctype/i.test(matchs[0][0])) {
              var name = matchs[1][0], pubid = false, sysid = false;
              len > 3 && (/^public$/i.test(matchs[2][0]) ? (pubid = matchs[3][0], sysid = len > 4 && matchs[4][0]) : /^system$/i.test(matchs[2][0]) && (sysid = matchs[3][0]));
              var lastMatch = matchs[len - 1];
              return domBuilder.startDTD(name, pubid, sysid), domBuilder.endDTD(), lastMatch.index + lastMatch[0].length;
            }
        }
        return -1;
      }
      function parseInstruction(source, start, domBuilder) {
        var end = source.indexOf("?>", start);
        if (end) {
          var match = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
          if (match) {
            match[0].length;
            return domBuilder.processingInstruction(match[1], match[2]), end + 2;
          }
          return -1;
        }
        return -1;
      }
      function ElementAttributes() {
        this.attributeNames = {};
      }
      function split(source, start) {
        var match, buf = [], reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
        for (reg.lastIndex = start, reg.exec(source); match = reg.exec(source); ) if (buf.push(match), match[1]) return buf;
      }
      var NAMESPACE = require2("./conventions").NAMESPACE, nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), tagNamePattern = new RegExp("^" + nameStartChar.source + nameChar.source + "*(?::" + nameStartChar.source + nameChar.source + "*)?$"), S_TAG = 0, S_ATTR = 1, S_ATTR_SPACE = 2, S_EQ = 3, S_ATTR_NOQUOT_VALUE = 4, S_ATTR_END = 5, S_TAG_SPACE = 6, S_TAG_CLOSE = 7;
      ParseError.prototype = new Error(), ParseError.prototype.name = ParseError.name, XMLReader.prototype = { parse: function(source, defaultNSMap, entityMap) {
        var domBuilder = this.domBuilder;
        domBuilder.startDocument(), _copy(defaultNSMap, defaultNSMap = {}), parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler), domBuilder.endDocument();
      } }, ElementAttributes.prototype = { setTagName: function(tagName) {
        if (!tagNamePattern.test(tagName)) throw new Error("invalid tagName:" + tagName);
        this.tagName = tagName;
      }, addValue: function(qName, value, offset) {
        if (!tagNamePattern.test(qName)) throw new Error("invalid attribute:" + qName);
        this.attributeNames[qName] = this.length, this[this.length++] = { qName, value, offset };
      }, length: 0, getLocalName: function(i) {
        return this[i].localName;
      }, getLocator: function(i) {
        return this[i].locator;
      }, getQName: function(i) {
        return this[i].qName;
      }, getURI: function(i) {
        return this[i].uri;
      }, getValue: function(i) {
        return this[i].value;
      } }, exports2.XMLReader = XMLReader, exports2.ParseError = ParseError;
    }, { "./conventions": 41 }], 47: [function(require2, module2, exports2) {
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
        var validLen = b64.indexOf("=");
        -1 === validLen && (validLen = len2);
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64), validLen = lens[0], placeHoldersLen = lens[1];
        return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp, i2, lens = getLens(b64), validLen = lens[0], placeHoldersLen = lens[1], arr = new Arr(_byteLength(b64, validLen, placeHoldersLen)), curByte = 0, len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        for (i2 = 0; len2 > i2; i2 += 4) tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)], arr[curByte++] = tmp >> 16 & 255, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = 255 & tmp;
        return 2 === placeHoldersLen && (tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4, arr[curByte++] = 255 & tmp), 1 === placeHoldersLen && (tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = 255 & tmp), arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
      }
      function encodeChunk(uint8, start, end) {
        for (var tmp, output = [], i2 = start; end > i2; i2 += 3) tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (255 & uint8[i2 + 2]), output.push(tripletToBase64(tmp));
        return output.join("");
      }
      function fromByteArray(uint8) {
        for (var tmp, len2 = uint8.length, extraBytes = len2 % 3, parts = [], maxChunkLength = 16383, i2 = 0, len22 = len2 - extraBytes; len22 > i2; i2 += maxChunkLength) parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        return 1 === extraBytes ? (tmp = uint8[len2 - 1], parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==")) : 2 === extraBytes && (tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1], parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=")), parts.join("");
      }
      exports2.byteLength = byteLength, exports2.toByteArray = toByteArray, exports2.fromByteArray = fromByteArray;
      for (var lookup = [], revLookup = [], Arr = "undefined" != typeof Uint8Array ? Uint8Array : Array, code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, len = code.length; len > i; ++i) lookup[i] = code[i], revLookup[code.charCodeAt(i)] = i;
      revLookup["-".charCodeAt(0)] = 62, revLookup["_".charCodeAt(0)] = 63;
    }, {}], 48: [function(require2, module2, exports2) {
      (function(global2) {
        function typedArraySupport() {
          try {
            var arr = new Uint8Array(1);
            return arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
              return 42;
            } }, 42 === arr.foo() && "function" == typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
          } catch (e) {
            return false;
          }
        }
        function kMaxLength() {
          return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
        }
        function createBuffer(that, length) {
          if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
          return Buffer.TYPED_ARRAY_SUPPORT ? (that = new Uint8Array(length), that.__proto__ = Buffer.prototype) : (null === that && (that = new Buffer(length)), that.length = length), that;
        }
        function Buffer(arg, encodingOrOffset, length) {
          if (!(Buffer.TYPED_ARRAY_SUPPORT || this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
          if ("number" == typeof arg) {
            if ("string" == typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
            return allocUnsafe(this, arg);
          }
          return from(this, arg, encodingOrOffset, length);
        }
        function from(that, value, encodingOrOffset, length) {
          if ("number" == typeof value) throw new TypeError('"value" argument must not be a number');
          return "undefined" != typeof ArrayBuffer && value instanceof ArrayBuffer ? fromArrayBuffer(that, value, encodingOrOffset, length) : "string" == typeof value ? fromString(that, value, encodingOrOffset) : fromObject(that, value);
        }
        function assertSize(size) {
          if ("number" != typeof size) throw new TypeError('"size" argument must be a number');
          if (0 > size) throw new RangeError('"size" argument must not be negative');
        }
        function alloc(that, size, fill, encoding) {
          return assertSize(size), 0 >= size ? createBuffer(that, size) : void 0 !== fill ? "string" == typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill) : createBuffer(that, size);
        }
        function allocUnsafe(that, size) {
          if (assertSize(size), that = createBuffer(that, 0 > size ? 0 : 0 | checked(size)), !Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; size > i; ++i) that[i] = 0;
          return that;
        }
        function fromString(that, string, encoding) {
          if (("string" != typeof encoding || "" === encoding) && (encoding = "utf8"), !Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
          var length = 0 | byteLength(string, encoding);
          that = createBuffer(that, length);
          var actual = that.write(string, encoding);
          return actual !== length && (that = that.slice(0, actual)), that;
        }
        function fromArrayLike(that, array) {
          var length = array.length < 0 ? 0 : 0 | checked(array.length);
          that = createBuffer(that, length);
          for (var i = 0; length > i; i += 1) that[i] = 255 & array[i];
          return that;
        }
        function fromArrayBuffer(that, array, byteOffset, length) {
          if (array.byteLength, 0 > byteOffset || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
          if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
          return array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length), Buffer.TYPED_ARRAY_SUPPORT ? (that = array, that.__proto__ = Buffer.prototype) : that = fromArrayLike(that, array), that;
        }
        function fromObject(that, obj) {
          if (Buffer.isBuffer(obj)) {
            var len = 0 | checked(obj.length);
            return that = createBuffer(that, len), 0 === that.length ? that : (obj.copy(that, 0, 0, len), that);
          }
          if (obj) {
            if ("undefined" != typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) return "number" != typeof obj.length || isnan(obj.length) ? createBuffer(that, 0) : fromArrayLike(that, obj);
            if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
          }
          throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
        }
        function checked(length) {
          if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
          return 0 | length;
        }
        function SlowBuffer(length) {
          return +length != length && (length = 0), Buffer.alloc(+length);
        }
        function byteLength(string, encoding) {
          if (Buffer.isBuffer(string)) return string.length;
          if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
          "string" != typeof string && (string = "" + string);
          var len = string.length;
          if (0 === len) return 0;
          for (var loweredCase = false; ; ) switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
            case void 0:
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return 2 * len;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) return utf8ToBytes(string).length;
              encoding = ("" + encoding).toLowerCase(), loweredCase = true;
          }
        }
        function slowToString(encoding, start, end) {
          var loweredCase = false;
          if ((void 0 === start || 0 > start) && (start = 0), start > this.length) return "";
          if ((void 0 === end || end > this.length) && (end = this.length), 0 >= end) return "";
          if (end >>>= 0, start >>>= 0, start >= end) return "";
          for (encoding || (encoding = "utf8"); ; ) switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase(), loweredCase = true;
          }
        }
        function swap(b, n, m) {
          var i = b[n];
          b[n] = b[m], b[m] = i;
        }
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
          if (0 === buffer.length) return -1;
          if ("string" == typeof byteOffset ? (encoding = byteOffset, byteOffset = 0) : byteOffset > 2147483647 ? byteOffset = 2147483647 : -2147483648 > byteOffset && (byteOffset = -2147483648), byteOffset = +byteOffset, isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1), 0 > byteOffset && (byteOffset = buffer.length + byteOffset), byteOffset >= buffer.length) {
            if (dir) return -1;
            byteOffset = buffer.length - 1;
          } else if (0 > byteOffset) {
            if (!dir) return -1;
            byteOffset = 0;
          }
          if ("string" == typeof val && (val = Buffer.from(val, encoding)), Buffer.isBuffer(val)) return 0 === val.length ? -1 : arrayIndexOf(buffer, val, byteOffset, encoding, dir);
          if ("number" == typeof val) return val = 255 & val, Buffer.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset) : arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
          throw new TypeError("val must be string, number or Buffer");
        }
        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
          function read(buf, i2) {
            return 1 === indexSize ? buf[i2] : buf.readUInt16BE(i2 * indexSize);
          }
          var indexSize = 1, arrLength = arr.length, valLength = val.length;
          if (void 0 !== encoding && (encoding = String(encoding).toLowerCase(), "ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding)) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2, arrLength /= 2, valLength /= 2, byteOffset /= 2;
          }
          var i;
          if (dir) {
            var foundIndex = -1;
            for (i = byteOffset; arrLength > i; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
              if (-1 === foundIndex && (foundIndex = i), i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else -1 !== foundIndex && (i -= i - foundIndex), foundIndex = -1;
          } else for (byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength), i = byteOffset; i >= 0; i--) {
            for (var found = true, j = 0; valLength > j; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
          return -1;
        }
        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          length ? (length = Number(length), length > remaining && (length = remaining)) : length = remaining;
          var strLen = string.length;
          if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
          length > strLen / 2 && (length = strLen / 2);
          for (var i = 0; length > i; ++i) {
            var parsed = parseInt(string.substr(2 * i, 2), 16);
            if (isNaN(parsed)) return i;
            buf[offset + i] = parsed;
          }
          return i;
        }
        function utf8Write(buf, string, offset, length) {
          return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
        }
        function asciiWrite(buf, string, offset, length) {
          return blitBuffer(asciiToBytes(string), buf, offset, length);
        }
        function latin1Write(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
          return blitBuffer(base64ToBytes(string), buf, offset, length);
        }
        function ucs2Write(buf, string, offset, length) {
          return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
        }
        function base64Slice(buf, start, end) {
          return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
        }
        function utf8Slice(buf, start, end) {
          end = Math.min(buf.length, end);
          for (var res = [], i = start; end > i; ) {
            var firstByte = buf[i], codePoint = null, bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
            if (end >= i + bytesPerSequence) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;
              switch (bytesPerSequence) {
                case 1:
                  128 > firstByte && (codePoint = firstByte);
                  break;
                case 2:
                  secondByte = buf[i + 1], 128 === (192 & secondByte) && (tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte, tempCodePoint > 127 && (codePoint = tempCodePoint));
                  break;
                case 3:
                  secondByte = buf[i + 1], thirdByte = buf[i + 2], 128 === (192 & secondByte) && 128 === (192 & thirdByte) && (tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte, tempCodePoint > 2047 && (55296 > tempCodePoint || tempCodePoint > 57343) && (codePoint = tempCodePoint));
                  break;
                case 4:
                  secondByte = buf[i + 1], thirdByte = buf[i + 2], fourthByte = buf[i + 3], 128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte) && (tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte, tempCodePoint > 65535 && 1114112 > tempCodePoint && (codePoint = tempCodePoint));
              }
            }
            null === codePoint ? (codePoint = 65533, bytesPerSequence = 1) : codePoint > 65535 && (codePoint -= 65536, res.push(codePoint >>> 10 & 1023 | 55296), codePoint = 56320 | 1023 & codePoint), res.push(codePoint), i += bytesPerSequence;
          }
          return decodeCodePointsArray(res);
        }
        function decodeCodePointsArray(codePoints) {
          var len = codePoints.length;
          if (MAX_ARGUMENTS_LENGTH >= len) return String.fromCharCode.apply(String, codePoints);
          for (var res = "", i = 0; len > i; ) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
          return res;
        }
        function asciiSlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; end > i; ++i) ret += String.fromCharCode(127 & buf[i]);
          return ret;
        }
        function latin1Slice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; end > i; ++i) ret += String.fromCharCode(buf[i]);
          return ret;
        }
        function hexSlice(buf, start, end) {
          var len = buf.length;
          (!start || 0 > start) && (start = 0), (!end || 0 > end || end > len) && (end = len);
          for (var out = "", i = start; end > i; ++i) out += toHex(buf[i]);
          return out;
        }
        function utf16leSlice(buf, start, end) {
          for (var bytes = buf.slice(start, end), res = "", i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
          return res;
        }
        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || 0 > offset) throw new RangeError("offset is not uint");
          if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
        }
        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
          if (value > max || min > value) throw new RangeError('"value" argument is out of bounds');
          if (offset + ext > buf.length) throw new RangeError("Index out of range");
        }
        function objectWriteUInt16(buf, value, offset, littleEndian) {
          0 > value && (value = 65535 + value + 1);
          for (var i = 0, j = Math.min(buf.length - offset, 2); j > i; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
        }
        function objectWriteUInt32(buf, value, offset, littleEndian) {
          0 > value && (value = 4294967295 + value + 1);
          for (var i = 0, j = Math.min(buf.length - offset, 4); j > i; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
        }
        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length) throw new RangeError("Index out of range");
          if (0 > offset) throw new RangeError("Index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          return noAssert || checkIEEE754(buf, value, offset, 4), ieee754.write(buf, value, offset, littleEndian, 23, 4), offset + 4;
        }
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          return noAssert || checkIEEE754(buf, value, offset, 8), ieee754.write(buf, value, offset, littleEndian, 52, 8), offset + 8;
        }
        function base64clean(str) {
          if (str = stringtrim(str).replace(INVALID_BASE64_RE, ""), str.length < 2) return "";
          for (; str.length % 4 !== 0; ) str += "=";
          return str;
        }
        function stringtrim(str) {
          return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
        }
        function toHex(n) {
          return 16 > n ? "0" + n.toString(16) : n.toString(16);
        }
        function utf8ToBytes(string, units) {
          units = units || 1 / 0;
          for (var codePoint, length = string.length, leadSurrogate = null, bytes = [], i = 0; length > i; ++i) {
            if (codePoint = string.charCodeAt(i), codePoint > 55295 && 57344 > codePoint) {
              if (!leadSurrogate) {
                if (codePoint > 56319) {
                  (units -= 3) > -1 && bytes.push(239, 191, 189);
                  continue;
                }
                if (i + 1 === length) {
                  (units -= 3) > -1 && bytes.push(239, 191, 189);
                  continue;
                }
                leadSurrogate = codePoint;
                continue;
              }
              if (56320 > codePoint) {
                (units -= 3) > -1 && bytes.push(239, 191, 189), leadSurrogate = codePoint;
                continue;
              }
              codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
            } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
            if (leadSurrogate = null, 128 > codePoint) {
              if ((units -= 1) < 0) break;
              bytes.push(codePoint);
            } else if (2048 > codePoint) {
              if ((units -= 2) < 0) break;
              bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
            } else if (65536 > codePoint) {
              if ((units -= 3) < 0) break;
              bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
            } else {
              if (!(1114112 > codePoint)) throw new Error("Invalid code point");
              if ((units -= 4) < 0) break;
              bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
            }
          }
          return bytes;
        }
        function asciiToBytes(str) {
          for (var byteArray = [], i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
          return byteArray;
        }
        function utf16leToBytes(str, units) {
          for (var c, hi, lo, byteArray = [], i = 0; i < str.length && !((units -= 2) < 0); ++i) c = str.charCodeAt(i), hi = c >> 8, lo = c % 256, byteArray.push(lo), byteArray.push(hi);
          return byteArray;
        }
        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length) {
          for (var i = 0; length > i && !(i + offset >= dst.length || i >= src.length); ++i) dst[i + offset] = src[i];
          return i;
        }
        function isnan(val) {
          return val !== val;
        }
        var base64 = require2("base64-js"), ieee754 = require2("ieee754"), isArray = require2("isarray");
        exports2.Buffer = Buffer, exports2.SlowBuffer = SlowBuffer, exports2.INSPECT_MAX_BYTES = 50, Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global2.TYPED_ARRAY_SUPPORT ? global2.TYPED_ARRAY_SUPPORT : typedArraySupport(), exports2.kMaxLength = kMaxLength(), Buffer.poolSize = 8192, Buffer._augment = function(arr) {
          return arr.__proto__ = Buffer.prototype, arr;
        }, Buffer.from = function(value, encodingOrOffset, length) {
          return from(null, value, encodingOrOffset, length);
        }, Buffer.TYPED_ARRAY_SUPPORT && (Buffer.prototype.__proto__ = Uint8Array.prototype, Buffer.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, { value: null, configurable: true })), Buffer.alloc = function(size, fill, encoding) {
          return alloc(null, size, fill, encoding);
        }, Buffer.allocUnsafe = function(size) {
          return allocUnsafe(null, size);
        }, Buffer.allocUnsafeSlow = function(size) {
          return allocUnsafe(null, size);
        }, Buffer.isBuffer = function(b) {
          return !(null == b || !b._isBuffer);
        }, Buffer.compare = function(a, b) {
          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
          if (a === b) return 0;
          for (var x = a.length, y = b.length, i = 0, len = Math.min(x, y); len > i; ++i) if (a[i] !== b[i]) {
            x = a[i], y = b[i];
            break;
          }
          return y > x ? -1 : x > y ? 1 : 0;
        }, Buffer.isEncoding = function(encoding) {
          switch (String(encoding).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return true;
            default:
              return false;
          }
        }, Buffer.concat = function(list, length) {
          if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
          if (0 === list.length) return Buffer.alloc(0);
          var i;
          if (void 0 === length) for (length = 0, i = 0; i < list.length; ++i) length += list[i].length;
          var buffer = Buffer.allocUnsafe(length), pos = 0;
          for (i = 0; i < list.length; ++i) {
            var buf = list[i];
            if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
            buf.copy(buffer, pos), pos += buf.length;
          }
          return buffer;
        }, Buffer.byteLength = byteLength, Buffer.prototype._isBuffer = true, Buffer.prototype.swap16 = function() {
          var len = this.length;
          if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
          for (var i = 0; len > i; i += 2) swap(this, i, i + 1);
          return this;
        }, Buffer.prototype.swap32 = function() {
          var len = this.length;
          if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
          for (var i = 0; len > i; i += 4) swap(this, i, i + 3), swap(this, i + 1, i + 2);
          return this;
        }, Buffer.prototype.swap64 = function() {
          var len = this.length;
          if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
          for (var i = 0; len > i; i += 8) swap(this, i, i + 7), swap(this, i + 1, i + 6), swap(this, i + 2, i + 5), swap(this, i + 3, i + 4);
          return this;
        }, Buffer.prototype.toString = function() {
          var length = 0 | this.length;
          return 0 === length ? "" : 0 === arguments.length ? utf8Slice(this, 0, length) : slowToString.apply(this, arguments);
        }, Buffer.prototype.equals = function(b) {
          if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
          return this === b ? true : 0 === Buffer.compare(this, b);
        }, Buffer.prototype.inspect = function() {
          var str = "", max = exports2.INSPECT_MAX_BYTES;
          return this.length > 0 && (str = this.toString("hex", 0, max).match(/.{2}/g).join(" "), this.length > max && (str += " ... ")), "<Buffer " + str + ">";
        }, Buffer.prototype.compare = function(target, start, end, thisStart, thisEnd) {
          if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
          if (void 0 === start && (start = 0), void 0 === end && (end = target ? target.length : 0), void 0 === thisStart && (thisStart = 0), void 0 === thisEnd && (thisEnd = this.length), 0 > start || end > target.length || 0 > thisStart || thisEnd > this.length) throw new RangeError("out of range index");
          if (thisStart >= thisEnd && start >= end) return 0;
          if (thisStart >= thisEnd) return -1;
          if (start >= end) return 1;
          if (start >>>= 0, end >>>= 0, thisStart >>>= 0, thisEnd >>>= 0, this === target) return 0;
          for (var x = thisEnd - thisStart, y = end - start, len = Math.min(x, y), thisCopy = this.slice(thisStart, thisEnd), targetCopy = target.slice(start, end), i = 0; len > i; ++i) if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i], y = targetCopy[i];
            break;
          }
          return y > x ? -1 : x > y ? 1 : 0;
        }, Buffer.prototype.includes = function(val, byteOffset, encoding) {
          return -1 !== this.indexOf(val, byteOffset, encoding);
        }, Buffer.prototype.indexOf = function(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
        }, Buffer.prototype.lastIndexOf = function(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
        }, Buffer.prototype.write = function(string, offset, length, encoding) {
          if (void 0 === offset) encoding = "utf8", length = this.length, offset = 0;
          else if (void 0 === length && "string" == typeof offset) encoding = offset, length = this.length, offset = 0;
          else {
            if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
            offset = 0 | offset, isFinite(length) ? (length = 0 | length, void 0 === encoding && (encoding = "utf8")) : (encoding = length, length = void 0);
          }
          var remaining = this.length - offset;
          if ((void 0 === length || length > remaining) && (length = remaining), string.length > 0 && (0 > length || 0 > offset) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
          encoding || (encoding = "utf8");
          for (var loweredCase = false; ; ) switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
              return asciiWrite(this, string, offset, length);
            case "latin1":
            case "binary":
              return latin1Write(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase(), loweredCase = true;
          }
        }, Buffer.prototype.toJSON = function() {
          return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
        };
        var MAX_ARGUMENTS_LENGTH = 4096;
        Buffer.prototype.slice = function(start, end) {
          var len = this.length;
          start = ~~start, end = void 0 === end ? len : ~~end, 0 > start ? (start += len, 0 > start && (start = 0)) : start > len && (start = len), 0 > end ? (end += len, 0 > end && (end = 0)) : end > len && (end = len), start > end && (end = start);
          var newBuf;
          if (Buffer.TYPED_ARRAY_SUPPORT) newBuf = this.subarray(start, end), newBuf.__proto__ = Buffer.prototype;
          else {
            var sliceLen = end - start;
            newBuf = new Buffer(sliceLen, void 0);
            for (var i = 0; sliceLen > i; ++i) newBuf[i] = this[i + start];
          }
          return newBuf;
        }, Buffer.prototype.readUIntLE = function(offset, byteLength2, noAssert) {
          offset = 0 | offset, byteLength2 = 0 | byteLength2, noAssert || checkOffset(offset, byteLength2, this.length);
          for (var val = this[offset], mul = 1, i = 0; ++i < byteLength2 && (mul *= 256); ) val += this[offset + i] * mul;
          return val;
        }, Buffer.prototype.readUIntBE = function(offset, byteLength2, noAssert) {
          offset = 0 | offset, byteLength2 = 0 | byteLength2, noAssert || checkOffset(offset, byteLength2, this.length);
          for (var val = this[offset + --byteLength2], mul = 1; byteLength2 > 0 && (mul *= 256); ) val += this[offset + --byteLength2] * mul;
          return val;
        }, Buffer.prototype.readUInt8 = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 1, this.length), this[offset];
        }, Buffer.prototype.readUInt16LE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 2, this.length), this[offset] | this[offset + 1] << 8;
        }, Buffer.prototype.readUInt16BE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 2, this.length), this[offset] << 8 | this[offset + 1];
        }, Buffer.prototype.readUInt32LE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 4, this.length), (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
        }, Buffer.prototype.readUInt32BE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 4, this.length), 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
        }, Buffer.prototype.readIntLE = function(offset, byteLength2, noAssert) {
          offset = 0 | offset, byteLength2 = 0 | byteLength2, noAssert || checkOffset(offset, byteLength2, this.length);
          for (var val = this[offset], mul = 1, i = 0; ++i < byteLength2 && (mul *= 256); ) val += this[offset + i] * mul;
          return mul *= 128, val >= mul && (val -= Math.pow(2, 8 * byteLength2)), val;
        }, Buffer.prototype.readIntBE = function(offset, byteLength2, noAssert) {
          offset = 0 | offset, byteLength2 = 0 | byteLength2, noAssert || checkOffset(offset, byteLength2, this.length);
          for (var i = byteLength2, mul = 1, val = this[offset + --i]; i > 0 && (mul *= 256); ) val += this[offset + --i] * mul;
          return mul *= 128, val >= mul && (val -= Math.pow(2, 8 * byteLength2)), val;
        }, Buffer.prototype.readInt8 = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 1, this.length), 128 & this[offset] ? -1 * (255 - this[offset] + 1) : this[offset];
        }, Buffer.prototype.readInt16LE = function(offset, noAssert) {
          noAssert || checkOffset(offset, 2, this.length);
          var val = this[offset] | this[offset + 1] << 8;
          return 32768 & val ? 4294901760 | val : val;
        }, Buffer.prototype.readInt16BE = function(offset, noAssert) {
          noAssert || checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | this[offset] << 8;
          return 32768 & val ? 4294901760 | val : val;
        }, Buffer.prototype.readInt32LE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 4, this.length), this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
        }, Buffer.prototype.readInt32BE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 4, this.length), this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
        }, Buffer.prototype.readFloatLE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 4, this.length), ieee754.read(this, offset, true, 23, 4);
        }, Buffer.prototype.readFloatBE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 4, this.length), ieee754.read(this, offset, false, 23, 4);
        }, Buffer.prototype.readDoubleLE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 8, this.length), ieee754.read(this, offset, true, 52, 8);
        }, Buffer.prototype.readDoubleBE = function(offset, noAssert) {
          return noAssert || checkOffset(offset, 8, this.length), ieee754.read(this, offset, false, 52, 8);
        }, Buffer.prototype.writeUIntLE = function(value, offset, byteLength2, noAssert) {
          if (value = +value, offset = 0 | offset, byteLength2 = 0 | byteLength2, !noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
            checkInt(this, value, offset, byteLength2, maxBytes, 0);
          }
          var mul = 1, i = 0;
          for (this[offset] = 255 & value; ++i < byteLength2 && (mul *= 256); ) this[offset + i] = value / mul & 255;
          return offset + byteLength2;
        }, Buffer.prototype.writeUIntBE = function(value, offset, byteLength2, noAssert) {
          if (value = +value, offset = 0 | offset, byteLength2 = 0 | byteLength2, !noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
            checkInt(this, value, offset, byteLength2, maxBytes, 0);
          }
          var i = byteLength2 - 1, mul = 1;
          for (this[offset + i] = 255 & value; --i >= 0 && (mul *= 256); ) this[offset + i] = value / mul & 255;
          return offset + byteLength2;
        }, Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 1, 255, 0), Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value)), this[offset] = 255 & value, offset + 1;
        }, Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 2, 65535, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = 255 & value, this[offset + 1] = value >>> 8) : objectWriteUInt16(this, value, offset, true), offset + 2;
        }, Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 2, 65535, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 8, this[offset + 1] = 255 & value) : objectWriteUInt16(this, value, offset, false), offset + 2;
        }, Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 4, 4294967295, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset + 3] = value >>> 24, this[offset + 2] = value >>> 16, this[offset + 1] = value >>> 8, this[offset] = 255 & value) : objectWriteUInt32(this, value, offset, true), offset + 4;
        }, Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 4, 4294967295, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = 255 & value) : objectWriteUInt32(this, value, offset, false), offset + 4;
        }, Buffer.prototype.writeIntLE = function(value, offset, byteLength2, noAssert) {
          if (value = +value, offset = 0 | offset, !noAssert) {
            var limit = Math.pow(2, 8 * byteLength2 - 1);
            checkInt(this, value, offset, byteLength2, limit - 1, -limit);
          }
          var i = 0, mul = 1, sub = 0;
          for (this[offset] = 255 & value; ++i < byteLength2 && (mul *= 256); ) 0 > value && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1), this[offset + i] = (value / mul >> 0) - sub & 255;
          return offset + byteLength2;
        }, Buffer.prototype.writeIntBE = function(value, offset, byteLength2, noAssert) {
          if (value = +value, offset = 0 | offset, !noAssert) {
            var limit = Math.pow(2, 8 * byteLength2 - 1);
            checkInt(this, value, offset, byteLength2, limit - 1, -limit);
          }
          var i = byteLength2 - 1, mul = 1, sub = 0;
          for (this[offset + i] = 255 & value; --i >= 0 && (mul *= 256); ) 0 > value && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1), this[offset + i] = (value / mul >> 0) - sub & 255;
          return offset + byteLength2;
        }, Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 1, 127, -128), Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value)), 0 > value && (value = 255 + value + 1), this[offset] = 255 & value, offset + 1;
        }, Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 2, 32767, -32768), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = 255 & value, this[offset + 1] = value >>> 8) : objectWriteUInt16(this, value, offset, true), offset + 2;
        }, Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 2, 32767, -32768), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 8, this[offset + 1] = 255 & value) : objectWriteUInt16(this, value, offset, false), offset + 2;
        }, Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = 255 & value, this[offset + 1] = value >>> 8, this[offset + 2] = value >>> 16, this[offset + 3] = value >>> 24) : objectWriteUInt32(this, value, offset, true), offset + 4;
        }, Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
          return value = +value, offset = 0 | offset, noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648), 0 > value && (value = 4294967295 + value + 1), Buffer.TYPED_ARRAY_SUPPORT ? (this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = 255 & value) : objectWriteUInt32(this, value, offset, false), offset + 4;
        }, Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert);
        }, Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert);
        }, Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert);
        }, Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert);
        }, Buffer.prototype.copy = function(target, targetStart, start, end) {
          if (start || (start = 0), end || 0 === end || (end = this.length), targetStart >= target.length && (targetStart = target.length), targetStart || (targetStart = 0), end > 0 && start > end && (end = start), end === start) return 0;
          if (0 === target.length || 0 === this.length) return 0;
          if (0 > targetStart) throw new RangeError("targetStart out of bounds");
          if (0 > start || start >= this.length) throw new RangeError("sourceStart out of bounds");
          if (0 > end) throw new RangeError("sourceEnd out of bounds");
          end > this.length && (end = this.length), target.length - targetStart < end - start && (end = target.length - targetStart + start);
          var i, len = end - start;
          if (this === target && targetStart > start && end > targetStart) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start];
          else if (1e3 > len || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; len > i; ++i) target[i + targetStart] = this[i + start];
          else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
          return len;
        }, Buffer.prototype.fill = function(val, start, end, encoding) {
          if ("string" == typeof val) {
            if ("string" == typeof start ? (encoding = start, start = 0, end = this.length) : "string" == typeof end && (encoding = end, end = this.length), 1 === val.length) {
              var code = val.charCodeAt(0);
              256 > code && (val = code);
            }
            if (void 0 !== encoding && "string" != typeof encoding) throw new TypeError("encoding must be a string");
            if ("string" == typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
          } else "number" == typeof val && (val = 255 & val);
          if (0 > start || this.length < start || this.length < end) throw new RangeError("Out of range index");
          if (start >= end) return this;
          start >>>= 0, end = void 0 === end ? this.length : end >>> 0, val || (val = 0);
          var i;
          if ("number" == typeof val) for (i = start; end > i; ++i) this[i] = val;
          else {
            var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString()), len = bytes.length;
            for (i = 0; end - start > i; ++i) this[i + start] = bytes[i % len];
          }
          return this;
        };
        var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, { "base64-js": 47, ieee754: 51, isarray: 52 }], 49: [function(require2, module2, exports2) {
      Object.defineProperty(exports2, "__esModule", { value: true });
      var dingbats = { SYMBOL: { 32: 32, 33: 33, 34: 8704, 35: 35, 36: 8707, 37: 37, 38: 38, 39: 8717, 40: 40, 41: 41, 42: 42, 43: 43, 44: 44, 45: 8722, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57, 58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 8773, 65: 913, 66: 914, 67: 935, 68: 916, 69: 917, 70: 934, 71: 915, 72: 919, 73: 921, 74: 977, 75: 922, 76: 923, 77: 924, 78: 925, 79: 927, 80: 928, 81: 920, 82: 929, 83: 931, 84: 932, 85: 933, 86: 962, 87: 937, 88: 926, 89: 936, 90: 918, 91: 91, 92: 8756, 93: 93, 94: 8869, 95: 95, 96: 8254, 97: 945, 98: 946, 99: 967, 100: 948, 101: 949, 102: 966, 103: 947, 104: 951, 105: 953, 106: 981, 107: 954, 108: 955, 109: 956, 110: 957, 111: 959, 112: 960, 113: 952, 114: 961, 115: 963, 116: 964, 117: 965, 118: 982, 119: 969, 120: 958, 121: 968, 122: 950, 123: 123, 124: 124, 125: 125, 126: 126, 160: 8364, 161: 978, 162: 8242, 163: 8804, 164: 8260, 165: 8734, 166: 402, 167: 9827, 168: 9830, 169: 9829, 170: 9824, 171: 8596, 172: 8592, 173: 8593, 174: 8594, 175: 8595, 176: 176, 177: 177, 178: 8243, 179: 8805, 180: 215, 181: 8733, 182: 8706, 183: 8226, 184: 247, 185: 8800, 186: 8801, 187: 8776, 188: 8230, 189: 9168, 190: 9135, 191: 8629, 192: 8501, 193: 8465, 194: 8476, 195: 8472, 196: 8855, 197: 8853, 198: 8709, 199: 8745, 200: 8746, 201: 8835, 202: 8839, 203: 8836, 204: 8834, 205: 8838, 206: 8712, 207: 8713, 208: 8736, 209: 8711, 210: 174, 211: 169, 212: 8482, 213: 8719, 214: 8730, 215: 8901, 216: 172, 217: 8743, 218: 8744, 219: 8660, 220: 8656, 221: 8657, 222: 8658, 223: 8659, 224: 9674, 225: 12296, 226: 174, 227: 169, 228: 8482, 229: 8721, 230: 9115, 231: 9116, 232: 9117, 233: 9121, 234: 9122, 235: 9123, 236: 9127, 237: 9128, 238: 9129, 239: 9130, 240: 63743, 241: 12297, 242: 8747, 243: 8992, 244: 9134, 245: 8993, 246: 9118, 247: 9119, 248: 9120, 249: 9124, 250: 9125, 251: 9126, 252: 9131, 253: 9132, 254: 9133 }, WEBDINGS: { 32: 32, 33: 128375, 34: 128376, 35: 128370, 36: 128374, 37: 127942, 38: 127894, 39: 128391, 40: 128488, 41: 128489, 42: 128496, 43: 128497, 44: 127798, 45: 127895, 46: 128638, 47: 128636, 48: 128469, 49: 128470, 50: 128471, 51: 9204, 52: 9205, 53: 9206, 54: 9207, 55: 9194, 56: 9193, 57: 9198, 58: 9197, 59: 9208, 60: 9209, 61: 9210, 62: 128474, 63: 128499, 64: 128736, 65: 127959, 66: 127960, 67: 127961, 68: 127962, 69: 127964, 70: 127981, 71: 127963, 72: 127968, 73: 127958, 74: 127965, 75: 128739, 76: 128269, 77: 127956, 78: 128065, 79: 128066, 80: 127966, 81: 127957, 82: 128740, 83: 127967, 84: 128755, 85: 128364, 86: 128363, 87: 128360, 88: 128264, 89: 127892, 90: 127893, 91: 128492, 92: 128637, 93: 128493, 94: 128490, 95: 128491, 96: 11156, 97: 10004, 98: 128690, 99: 11036, 100: 128737, 101: 128230, 102: 128753, 103: 11035, 104: 128657, 105: 128712, 106: 128745, 107: 128752, 108: 128968, 109: 128372, 110: 11044, 111: 128741, 112: 128660, 113: 128472, 114: 128473, 115: 10067, 116: 128754, 117: 128647, 118: 128653, 119: 9971, 120: 10680, 121: 8854, 122: 128685, 123: 128494, 124: 9168, 125: 128495, 126: 128498, 128: 128697, 129: 128698, 130: 128713, 131: 128714, 132: 128700, 133: 128125, 134: 127947, 135: 9975, 136: 127938, 137: 127948, 138: 127946, 139: 127940, 140: 127949, 141: 127950, 142: 128664, 143: 128480, 144: 128738, 145: 128176, 146: 127991, 147: 128179, 148: 128106, 149: 128481, 150: 128482, 151: 128483, 152: 10031, 153: 128388, 154: 128389, 155: 128387, 156: 128390, 157: 128441, 158: 128442, 159: 128443, 160: 128373, 161: 128368, 162: 128445, 163: 128446, 164: 128203, 165: 128466, 166: 128467, 167: 128366, 168: 128218, 169: 128478, 170: 128479, 171: 128451, 172: 128450, 173: 128444, 174: 127917, 175: 127900, 176: 127896, 177: 127897, 178: 127911, 179: 128191, 180: 127902, 181: 128247, 182: 127903, 183: 127916, 184: 128253, 185: 128249, 186: 128254, 187: 128251, 188: 127898, 189: 127899, 190: 128250, 191: 128187, 192: 128421, 193: 128422, 194: 128423, 195: 128377, 196: 127918, 197: 128379, 198: 128380, 199: 128223, 200: 128385, 201: 128384, 202: 128424, 203: 128425, 204: 128447, 205: 128426, 206: 128476, 207: 128274, 208: 128275, 209: 128477, 210: 128229, 211: 128228, 212: 128371, 213: 127779, 214: 127780, 215: 127781, 216: 127782, 217: 9729, 218: 127784, 219: 127783, 220: 127785, 221: 127786, 222: 127788, 223: 127787, 224: 127772, 225: 127777, 226: 128715, 227: 128719, 228: 127869, 229: 127864, 230: 128718, 231: 128717, 232: 9413, 233: 9855, 234: 128710, 235: 128392, 236: 127891, 237: 128484, 238: 128485, 239: 128486, 240: 128487, 241: 128746, 242: 128063, 243: 128038, 244: 128031, 245: 128021, 246: 128008, 247: 128620, 248: 128622, 249: 128621, 250: 128623, 251: 128506, 252: 127757, 253: 127759, 254: 127758, 255: 128330 }, WINGDINGS: { 32: 32, 33: 128393, 34: 9986, 35: 9985, 36: 128083, 37: 128365, 38: 128366, 39: 128367, 40: 128383, 41: 9990, 42: 128386, 43: 128387, 44: 128234, 45: 128235, 46: 128236, 47: 128237, 48: 128448, 49: 128449, 50: 128462, 51: 128463, 52: 128464, 53: 128452, 54: 8987, 55: 128430, 56: 128432, 57: 128434, 58: 128435, 59: 128436, 60: 128427, 61: 128428, 62: 9991, 63: 9997, 64: 128398, 65: 9996, 66: 128399, 67: 128077, 68: 128078, 69: 9756, 70: 9758, 71: 9757, 72: 9759, 73: 128400, 74: 9786, 75: 128528, 76: 9785, 77: 128163, 78: 128369, 79: 127987, 80: 127985, 81: 9992, 82: 9788, 83: 127778, 84: 10052, 85: 128326, 86: 10014, 87: 128328, 88: 10016, 89: 10017, 90: 9770, 91: 9775, 92: 128329, 93: 9784, 94: 9800, 95: 9801, 96: 9802, 97: 9803, 98: 9804, 99: 9805, 100: 9806, 101: 9807, 102: 9808, 103: 9809, 104: 9810, 105: 9811, 106: 128624, 107: 128629, 108: 9899, 109: 128318, 110: 9724, 111: 128911, 112: 128912, 113: 10065, 114: 10066, 115: 128927, 116: 10731, 117: 9670, 118: 10070, 119: 11049, 120: 8999, 121: 11193, 122: 8984, 123: 127989, 124: 127990, 125: 128630, 126: 128631, 127: 9647, 128: 127243, 129: 10112, 130: 10113, 131: 10114, 132: 10115, 133: 10116, 134: 10117, 135: 10118, 136: 10119, 137: 10120, 138: 10121, 139: 127244, 140: 10122, 141: 10123, 142: 10124, 143: 10125, 144: 10126, 145: 10127, 146: 10128, 147: 10129, 148: 10130, 149: 10131, 150: 128610, 151: 128608, 152: 128609, 153: 128611, 154: 128606, 155: 128604, 156: 128605, 157: 128607, 158: 8729, 159: 8226, 160: 11037, 161: 11096, 162: 128902, 163: 128904, 164: 128906, 165: 128907, 166: 128319, 167: 9642, 168: 128910, 169: 128961, 170: 128965, 171: 9733, 172: 128971, 173: 128975, 174: 128979, 175: 128977, 176: 11216, 177: 8982, 178: 11214, 179: 11215, 180: 11217, 181: 10026, 182: 10032, 183: 128336, 184: 128337, 185: 128338, 186: 128339, 187: 128340, 188: 128341, 189: 128342, 190: 128343, 191: 128344, 192: 128345, 193: 128346, 194: 128347, 195: 11184, 196: 11185, 197: 11186, 198: 11187, 199: 11188, 200: 11189, 201: 11190, 202: 11191, 203: 128618, 204: 128619, 205: 128597, 206: 128596, 207: 128599, 208: 128598, 209: 128592, 210: 128593, 211: 128594, 212: 128595, 213: 9003, 214: 8998, 215: 11160, 216: 11162, 217: 11161, 218: 11163, 219: 11144, 220: 11146, 221: 11145, 222: 11147, 223: 129128, 224: 129130, 225: 129129, 226: 129131, 227: 129132, 228: 129133, 229: 129135, 230: 129134, 231: 129144, 232: 129146, 233: 129145, 234: 129147, 235: 129148, 236: 129149, 237: 129151, 238: 129150, 239: 8678, 240: 8680, 241: 8679, 242: 8681, 243: 11012, 244: 8691, 245: 11009, 246: 11008, 247: 11011, 248: 11010, 249: 129196, 250: 129197, 251: 128502, 252: 10003, 253: 128503, 254: 128505 }, "WINGDINGS 2": { 32: 32, 33: 128394, 34: 128395, 35: 128396, 36: 128397, 37: 9988, 38: 9984, 39: 128382, 40: 128381, 41: 128453, 42: 128454, 43: 128455, 44: 128456, 45: 128457, 46: 128458, 47: 128459, 48: 128460, 49: 128461, 50: 128203, 51: 128465, 52: 128468, 53: 128437, 54: 128438, 55: 128439, 56: 128440, 57: 128429, 58: 128431, 59: 128433, 60: 128402, 61: 128403, 62: 128408, 63: 128409, 64: 128410, 65: 128411, 66: 128072, 67: 128073, 68: 128412, 69: 128413, 70: 128414, 71: 128415, 72: 128416, 73: 128417, 74: 128070, 75: 128071, 76: 128418, 77: 128419, 78: 128401, 79: 128500, 80: 128504, 81: 128501, 82: 9745, 83: 11197, 84: 9746, 85: 11198, 86: 11199, 87: 128711, 88: 10680, 89: 128625, 90: 128628, 91: 128626, 92: 128627, 93: 8253, 94: 128633, 95: 128634, 96: 128635, 97: 128614, 98: 128612, 99: 128613, 100: 128615, 101: 128602, 102: 128600, 103: 128601, 104: 128603, 105: 9450, 106: 9312, 107: 9313, 108: 9314, 109: 9315, 110: 9316, 111: 9317, 112: 9318, 113: 9319, 114: 9320, 115: 9321, 116: 9471, 117: 10102, 118: 10103, 119: 10104, 120: 10105, 121: 10106, 122: 10107, 123: 10108, 124: 10109, 125: 10110, 126: 10111, 128: 9737, 129: 127765, 130: 9789, 131: 9790, 132: 11839, 133: 10013, 134: 128327, 135: 128348, 136: 128349, 137: 128350, 138: 128351, 139: 128352, 140: 128353, 141: 128354, 142: 128355, 143: 128356, 144: 128357, 145: 128358, 146: 128359, 147: 128616, 148: 128617, 149: 8901, 150: 128900, 151: 10625, 152: 9679, 153: 9675, 154: 128901, 155: 128903, 156: 128905, 157: 8857, 158: 10687, 159: 128908, 160: 128909, 161: 9726, 162: 9632, 163: 9633, 164: 128913, 165: 128914, 166: 128915, 167: 128916, 168: 9635, 169: 128917, 170: 128918, 171: 128919, 172: 128920, 173: 11049, 174: 11045, 175: 9671, 176: 128922, 177: 9672, 178: 128923, 179: 128924, 180: 128925, 181: 128926, 182: 11050, 183: 11047, 184: 9674, 185: 128928, 186: 9686, 187: 9687, 188: 11210, 189: 11211, 190: 11200, 191: 11201, 192: 11039, 193: 11202, 194: 11043, 195: 11042, 196: 11203, 197: 11204, 198: 128929, 199: 128930, 200: 128931, 201: 128932, 202: 128933, 203: 128934, 204: 128935, 205: 128936, 206: 128937, 207: 128938, 208: 128939, 209: 128940, 210: 128941, 211: 128942, 212: 128943, 213: 128944, 214: 128945, 215: 128946, 216: 128947, 217: 128948, 218: 128949, 219: 128950, 220: 128951, 221: 128952, 222: 128953, 223: 128954, 224: 128955, 225: 128956, 226: 128957, 227: 128958, 228: 128959, 229: 128960, 230: 128962, 231: 128964, 232: 128966, 233: 128969, 234: 128970, 235: 10038, 236: 128972, 237: 128974, 238: 128976, 239: 128978, 240: 10041, 241: 128963, 242: 128967, 243: 10031, 244: 128973, 245: 128980, 246: 11212, 247: 11213, 248: 8251, 249: 8258 }, "WINGDINGS 3": { 32: 32, 33: 11104, 34: 11106, 35: 11105, 36: 11107, 37: 11110, 38: 11111, 39: 11113, 40: 11112, 41: 11120, 42: 11122, 43: 11121, 44: 11123, 45: 11126, 46: 11128, 47: 11131, 48: 11133, 49: 11108, 50: 11109, 51: 11114, 52: 11116, 53: 11115, 54: 11117, 55: 11085, 56: 11168, 57: 11169, 58: 11170, 59: 11171, 60: 11172, 61: 11173, 62: 11174, 63: 11175, 64: 11152, 65: 11153, 66: 11154, 67: 11155, 68: 11136, 69: 11139, 70: 11134, 71: 11135, 72: 11140, 73: 11142, 74: 11141, 75: 11143, 76: 11151, 77: 11149, 78: 11150, 79: 11148, 80: 11118, 81: 11119, 82: 9099, 83: 8996, 84: 8963, 85: 8997, 86: 9251, 87: 9085, 88: 8682, 89: 11192, 90: 129184, 91: 129185, 92: 129186, 93: 129187, 94: 129188, 95: 129189, 96: 129190, 97: 129191, 98: 129192, 99: 129193, 100: 129194, 101: 129195, 102: 129104, 103: 129106, 104: 129105, 105: 129107, 106: 129108, 107: 129109, 108: 129111, 109: 129110, 110: 129112, 111: 129113, 112: 9650, 113: 9660, 114: 9651, 115: 9661, 116: 9664, 117: 9654, 118: 9665, 119: 9655, 120: 9699, 121: 9698, 122: 9700, 123: 9701, 124: 128896, 125: 128898, 126: 128897, 128: 128899, 129: 11205, 130: 11206, 131: 11207, 132: 11208, 133: 11164, 134: 11166, 135: 11165, 136: 11167, 137: 129040, 138: 129042, 139: 129041, 140: 129043, 141: 129044, 142: 129046, 143: 129045, 144: 129047, 145: 129048, 146: 129050, 147: 129049, 148: 129051, 149: 129052, 150: 129054, 151: 129053, 152: 129055, 153: 129024, 154: 129026, 155: 129025, 156: 129027, 157: 129028, 158: 129030, 159: 129029, 160: 129031, 161: 129032, 162: 129034, 163: 129033, 164: 129035, 165: 129056, 166: 129058, 167: 129060, 168: 129062, 169: 129064, 170: 129066, 171: 129068, 172: 129180, 173: 129181, 174: 129182, 175: 129183, 176: 129070, 177: 129072, 178: 129074, 179: 129076, 180: 129078, 181: 129080, 182: 129082, 183: 129081, 184: 129083, 185: 129176, 186: 129178, 187: 129177, 188: 129179, 189: 129084, 190: 129086, 191: 129085, 192: 129087, 193: 129088, 194: 129090, 195: 129089, 196: 129091, 197: 129092, 198: 129094, 199: 129093, 200: 129095, 201: 11176, 202: 11177, 203: 11178, 204: 11179, 205: 11180, 206: 11181, 207: 11182, 208: 11183, 209: 129120, 210: 129122, 211: 129121, 212: 129123, 213: 129124, 214: 129125, 215: 129127, 216: 129126, 217: 129136, 218: 129138, 219: 129137, 220: 129139, 221: 129140, 222: 129141, 223: 129143, 224: 129142, 225: 129152, 226: 129154, 227: 129153, 228: 129155, 229: 129156, 230: 129157, 231: 129159, 232: 129158, 233: 129168, 234: 129170, 235: 129169, 236: 129171, 237: 129172, 238: 129174, 239: 129173, 240: 129175 } };
      exports2["default"] = dingbats;
    }, {}], 50: [function(require2, module2, exports2) {
      function codePoint(typeface, codePoint2) {
        var codePointMap = dingbats_1["default"][typeface.toUpperCase()];
        if (void 0 === codePointMap) return void 0;
        var unicodeCodePoint = codePointMap[codePoint2];
        return void 0 === unicodeCodePoint ? void 0 : { codePoint: unicodeCodePoint, string: fromCodePoint(unicodeCodePoint) };
      }
      function dec(typeface, dec2) {
        return codePoint(typeface, parseInt(dec2, 10));
      }
      function hex(typeface, hex2) {
        return codePoint(typeface, parseInt(hex2, 16));
      }
      function fromCodePointPolyfill(codePoint2) {
        if (65535 >= codePoint2) return String.fromCharCode(codePoint2);
        var highSurrogate = Math.floor((codePoint2 - 65536) / 1024) + 55296, lowSurrogate = (codePoint2 - 65536) % 1024 + 56320;
        return String.fromCharCode(highSurrogate, lowSurrogate);
      }
      var __importDefault = this && this.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true }), exports2.hex = exports2.dec = exports2.codePoint = void 0;
      var dingbats_1 = __importDefault(require2("./dingbats")), fromCodePoint = String.fromCodePoint ? String.fromCodePoint : fromCodePointPolyfill;
      exports2.codePoint = codePoint, exports2.dec = dec, exports2.hex = hex;
    }, { "./dingbats": 49 }], 51: [function(require2, module2, exports2) {
      exports2.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m, eLen = 8 * nBytes - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, nBits = -7, i = isLE ? nBytes - 1 : 0, d = isLE ? -1 : 1, s = buffer[offset + i];
        for (i += d, e = s & (1 << -nBits) - 1, s >>= -nBits, nBits += eLen; nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
        for (m = e & (1 << -nBits) - 1, e >>= -nBits, nBits += mLen; nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
        if (0 === e) e = 1 - eBias;
        else {
          if (e === eMax) return m ? NaN : (s ? -1 : 1) * (1 / 0);
          m += Math.pow(2, mLen), e -= eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      }, exports2.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c, eLen = 8 * nBytes - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0, i = isLE ? 0 : nBytes - 1, d = isLE ? 1 : -1, s = 0 > value || 0 === value && 0 > 1 / value ? 1 : 0;
        for (value = Math.abs(value), isNaN(value) || value === 1 / 0 ? (m = isNaN(value) ? 1 : 0, e = eMax) : (e = Math.floor(Math.log(value) / Math.LN2), value * (c = Math.pow(2, -e)) < 1 && (e--, c *= 2), value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias), value * c >= 2 && (e++, c /= 2), e + eBias >= eMax ? (m = 0, e = eMax) : e + eBias >= 1 ? (m = (value * c - 1) * Math.pow(2, mLen), e += eBias) : (m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen), e = 0)); mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
        for (e = e << mLen | m, eLen += mLen; eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
        buffer[offset + i - d] |= 128 * s;
      };
    }, {}], 52: [function(require2, module2, exports2) {
      var toString = {}.toString;
      module2.exports = Array.isArray || function(arr) {
        return "[object Array]" == toString.call(arr);
      };
    }, {}], 53: [function(require2, module2, exports2) {
      (function(global2, Buffer) {
        !function(t) {
          "object" == typeof exports2 && "undefined" != typeof module2 ? module2.exports = t() : ("undefined" != typeof window ? window : "undefined" != typeof global2 ? global2 : "undefined" != typeof self ? self : this).JSZip = t();
        }(function() {
          return function s(a, o, h) {
            function u(r, t2) {
              if (!o[r]) {
                if (!a[r]) {
                  var e = "function" == typeof require2 && require2;
                  if (!t2 && e) return e(r, true);
                  if (l) return l(r, true);
                  var i = new Error("Cannot find module '" + r + "'");
                  throw i.code = "MODULE_NOT_FOUND", i;
                }
                var n = o[r] = { exports: {} };
                a[r][0].call(n.exports, function(t3) {
                  var e2 = a[r][1][t3];
                  return u(e2 || t3);
                }, n, n.exports, s, a, o, h);
              }
              return o[r].exports;
            }
            for (var l = "function" == typeof require2 && require2, t = 0; t < h.length; t++) u(h[t]);
            return u;
          }({ 1: [function(t, e, r) {
            var c = t("./utils"), d = t("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            r.encode = function(t2) {
              for (var e2, r2, i, n, s, a, o, h = [], u = 0, l = t2.length, f = l, d2 = "string" !== c.getTypeOf(t2); u < t2.length; ) f = l - u, i = d2 ? (e2 = t2[u++], r2 = l > u ? t2[u++] : 0, l > u ? t2[u++] : 0) : (e2 = t2.charCodeAt(u++), r2 = l > u ? t2.charCodeAt(u++) : 0, l > u ? t2.charCodeAt(u++) : 0), n = e2 >> 2, s = (3 & e2) << 4 | r2 >> 4, a = f > 1 ? (15 & r2) << 2 | i >> 6 : 64, o = f > 2 ? 63 & i : 64, h.push(p.charAt(n) + p.charAt(s) + p.charAt(a) + p.charAt(o));
              return h.join("");
            }, r.decode = function(t2) {
              var e2, r2, i, n, s, a, o = 0, h = 0, u = "data:";
              if (t2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
              var l, f = 3 * (t2 = t2.replace(/[^A-Za-z0-9\+\/\=]/g, "")).length / 4;
              if (t2.charAt(t2.length - 1) === p.charAt(64) && f--, t2.charAt(t2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
              for (l = d.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < t2.length; ) e2 = p.indexOf(t2.charAt(o++)) << 2 | (n = p.indexOf(t2.charAt(o++))) >> 4, r2 = (15 & n) << 4 | (s = p.indexOf(t2.charAt(o++))) >> 2, i = (3 & s) << 6 | (a = p.indexOf(t2.charAt(o++))), l[h++] = e2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = i);
              return l;
            };
          }, { "./support": 30, "./utils": 32 }], 2: [function(t, e, r) {
            function o(t2, e2, r2, i2, n2) {
              this.compressedSize = t2, this.uncompressedSize = e2, this.crc32 = r2, this.compression = i2, this.compressedContent = n2;
            }
            var i = t("./external"), n = t("./stream/DataWorker"), s = t("./stream/Crc32Probe"), a = t("./stream/DataLengthProbe");
            o.prototype = { getContentWorker: function() {
              var t2 = new n(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), e2 = this;
              return t2.on("end", function() {
                if (this.streamInfo.data_length !== e2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
              }), t2;
            }, getCompressedWorker: function() {
              return new n(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
            } }, o.createWorkerFrom = function(t2, e2, r2) {
              return t2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(e2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", e2);
            }, e.exports = o;
          }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(t, e, r) {
            var i = t("./stream/GenericWorker");
            r.STORE = { magic: "\0\0", compressWorker: function(t2) {
              return new i("STORE compression");
            }, uncompressWorker: function() {
              return new i("STORE decompression");
            } }, r.DEFLATE = t("./flate");
          }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(t, e, r) {
            var i = t("./utils"), o = function() {
              for (var t2, e2 = [], r2 = 0; 256 > r2; r2++) {
                t2 = r2;
                for (var i2 = 0; 8 > i2; i2++) t2 = 1 & t2 ? 3988292384 ^ t2 >>> 1 : t2 >>> 1;
                e2[r2] = t2;
              }
              return e2;
            }();
            e.exports = function(t2, e2) {
              return void 0 !== t2 && t2.length ? "string" !== i.getTypeOf(t2) ? function(t3, e3, r2, i2) {
                var n = o, s = i2 + r2;
                t3 ^= -1;
                for (var a = i2; s > a; a++) t3 = t3 >>> 8 ^ n[255 & (t3 ^ e3[a])];
                return -1 ^ t3;
              }(0 | e2, t2, t2.length, 0) : function(t3, e3, r2, i2) {
                var n = o, s = i2 + r2;
                t3 ^= -1;
                for (var a = i2; s > a; a++) t3 = t3 >>> 8 ^ n[255 & (t3 ^ e3.charCodeAt(a))];
                return -1 ^ t3;
              }(0 | e2, t2, t2.length, 0) : 0;
            };
          }, { "./utils": 32 }], 5: [function(t, e, r) {
            r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
          }, {}], 6: [function(t, e, r) {
            var i = null;
            i = "undefined" != typeof Promise ? Promise : t("lie"), e.exports = { Promise: i };
          }, { lie: 37 }], 7: [function(t, e, r) {
            function h(t2, e2) {
              a.call(this, "FlateWorker/" + t2), this._pako = null, this._pakoAction = t2, this._pakoOptions = e2, this.meta = {};
            }
            var i = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, n = t("pako"), s = t("./utils"), a = t("./stream/GenericWorker"), o = i ? "uint8array" : "array";
            r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(t2) {
              this.meta = t2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, t2.data), false);
            }, h.prototype.flush = function() {
              a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
            }, h.prototype.cleanUp = function() {
              a.prototype.cleanUp.call(this), this._pako = null;
            }, h.prototype._createPako = function() {
              this._pako = new n[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
              var e2 = this;
              this._pako.onData = function(t2) {
                e2.push({ data: t2, meta: e2.meta });
              };
            }, r.compressWorker = function(t2) {
              return new h("Deflate", t2);
            }, r.uncompressWorker = function() {
              return new h("Inflate", {});
            };
          }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(t, e, r) {
            function A(t2, e2) {
              var r2, i2 = "";
              for (r2 = 0; e2 > r2; r2++) i2 += String.fromCharCode(255 & t2), t2 >>>= 8;
              return i2;
            }
            function i(t2, e2, r2, i2, n2, s2) {
              var a, o, h = t2.file, u = t2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), d = I.transformTo("string", O.utf8encode(h.name)), c = h.comment, p = I.transformTo("string", s2(c)), m = I.transformTo("string", O.utf8encode(c)), _ = d.length !== h.name.length, g = m.length !== c.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
              e2 && !r2 || (x.crc32 = t2.crc32, x.compressedSize = t2.compressedSize, x.uncompressedSize = t2.uncompressedSize);
              var S = 0;
              e2 && (S |= 8), l || !_ && !g || (S |= 2048);
              var z = 0, C = 0;
              w && (z |= 16), "UNIX" === n2 ? (C = 798, z |= function(t3, e3) {
                var r3 = t3;
                return t3 || (r3 = e3 ? 16893 : 33204), (65535 & r3) << 16;
              }(h.unixPermissions, w)) : (C = 20, z |= function(t3) {
                return 63 & (t3 || 0);
              }(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + d, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
              var E = "";
              return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(i2, 4) + f + b + p };
            }
            function s(t2, e2, r2, i2) {
              n.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = e2, this.zipPlatform = r2, this.encodeFileName = i2, this.streamFiles = t2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
            }
            var I = t("../utils"), n = t("../stream/GenericWorker"), O = t("../utf8"), B = t("../crc32"), R = t("../signature");
            I.inherits(s, n), s.prototype.push = function(t2) {
              var e2 = t2.meta.percent || 0, r2 = this.entriesCount, i2 = this._sources.length;
              this.accumulate ? this.contentBuffer.push(t2) : (this.bytesWritten += t2.data.length, n.prototype.push.call(this, { data: t2.data, meta: { currentFile: this.currentFile, percent: r2 ? (e2 + 100 * (r2 - i2 - 1)) / r2 : 100 } }));
            }, s.prototype.openedSource = function(t2) {
              this.currentSourceOffset = this.bytesWritten, this.currentFile = t2.file.name;
              var e2 = this.streamFiles && !t2.file.dir;
              if (e2) {
                var r2 = i(t2, e2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                this.push({ data: r2.fileRecord, meta: { percent: 0 } });
              } else this.accumulate = true;
            }, s.prototype.closedSource = function(t2) {
              this.accumulate = false;
              var e2 = this.streamFiles && !t2.file.dir, r2 = i(t2, e2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
              if (this.dirRecords.push(r2.dirRecord), e2) this.push({ data: function(t3) {
                return R.DATA_DESCRIPTOR + A(t3.crc32, 4) + A(t3.compressedSize, 4) + A(t3.uncompressedSize, 4);
              }(t2), meta: { percent: 100 } });
              else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
              this.currentFile = null;
            }, s.prototype.flush = function() {
              for (var t2 = this.bytesWritten, e2 = 0; e2 < this.dirRecords.length; e2++) this.push({ data: this.dirRecords[e2], meta: { percent: 100 } });
              var r2 = this.bytesWritten - t2, i2 = function(t3, e3, r3, i3, n2) {
                var s2 = I.transformTo("string", n2(i3));
                return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(t3, 2) + A(t3, 2) + A(e3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
              }(this.dirRecords.length, r2, t2, this.zipComment, this.encodeFileName);
              this.push({ data: i2, meta: { percent: 100 } });
            }, s.prototype.prepareNextSource = function() {
              this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
            }, s.prototype.registerPrevious = function(t2) {
              this._sources.push(t2);
              var e2 = this;
              return t2.on("data", function(t3) {
                e2.processChunk(t3);
              }), t2.on("end", function() {
                e2.closedSource(e2.previous.streamInfo), e2._sources.length ? e2.prepareNextSource() : e2.end();
              }), t2.on("error", function(t3) {
                e2.error(t3);
              }), this;
            }, s.prototype.resume = function() {
              return !!n.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
            }, s.prototype.error = function(t2) {
              var e2 = this._sources;
              if (!n.prototype.error.call(this, t2)) return false;
              for (var r2 = 0; r2 < e2.length; r2++) try {
                e2[r2].error(t2);
              } catch (t3) {
              }
              return true;
            }, s.prototype.lock = function() {
              n.prototype.lock.call(this);
              for (var t2 = this._sources, e2 = 0; e2 < t2.length; e2++) t2[e2].lock();
            }, e.exports = s;
          }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(t, e, r) {
            var u = t("../compressions"), i = t("./ZipFileWorker");
            r.generateWorker = function(t2, a, e2) {
              var o = new i(a.streamFiles, e2, a.platform, a.encodeFileName), h = 0;
              try {
                t2.forEach(function(t3, e3) {
                  h++;
                  var r2 = function(t4, e4) {
                    var r3 = t4 || e4, i3 = u[r3];
                    if (!i3) throw new Error(r3 + " is not a valid compression method !");
                    return i3;
                  }(e3.options.compression, a.compression), i2 = e3.options.compressionOptions || a.compressionOptions || {}, n = e3.dir, s = e3.date;
                  e3._compressWorker(r2, i2).withStreamInfo("file", { name: t3, dir: n, date: s, comment: e3.comment || "", unixPermissions: e3.unixPermissions, dosPermissions: e3.dosPermissions }).pipe(o);
                }), o.entriesCount = h;
              } catch (t3) {
                o.error(t3);
              }
              return o;
            };
          }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(t, e, r) {
            function i() {
              if (!(this instanceof i)) return new i();
              if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
              this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
                var t2 = new i();
                for (var e2 in this) "function" != typeof this[e2] && (t2[e2] = this[e2]);
                return t2;
              };
            }
            (i.prototype = t("./object")).loadAsync = t("./load"), i.support = t("./support"), i.defaults = t("./defaults"), i.version = "3.7.1", i.loadAsync = function(t2, e2) {
              return new i().loadAsync(t2, e2);
            }, i.external = t("./external"), e.exports = i;
          }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(t, e, r) {
            function l(i2) {
              return new n.Promise(function(t2, e2) {
                var r2 = i2.decompressed.getContentWorker().pipe(new s());
                r2.on("error", function(t3) {
                  e2(t3);
                }).on("end", function() {
                  r2.streamInfo.crc32 !== i2.decompressed.crc32 ? e2(new Error("Corrupted zip : CRC32 mismatch")) : t2();
                }).resume();
              });
            }
            var i = t("./utils"), n = t("./external"), o = t("./utf8"), h = t("./zipEntries"), s = t("./stream/Crc32Probe"), u = t("./nodejsUtils");
            e.exports = function(t2, s2) {
              var a = this;
              return s2 = i.extend(s2 || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: o.utf8decode }), u.isNode && u.isStream(t2) ? n.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : i.prepareContent("the loaded zip file", t2, true, s2.optimizedBinaryString, s2.base64).then(function(t3) {
                var e2 = new h(s2);
                return e2.load(t3), e2;
              }).then(function(t3) {
                var e2 = [n.Promise.resolve(t3)], r2 = t3.files;
                if (s2.checkCRC32) for (var i2 = 0; i2 < r2.length; i2++) e2.push(l(r2[i2]));
                return n.Promise.all(e2);
              }).then(function(t3) {
                for (var e2 = t3.shift(), r2 = e2.files, i2 = 0; i2 < r2.length; i2++) {
                  var n2 = r2[i2];
                  a.file(n2.fileNameStr, n2.decompressed, { binary: true, optimizedBinaryString: true, date: n2.date, dir: n2.dir, comment: n2.fileCommentStr.length ? n2.fileCommentStr : null, unixPermissions: n2.unixPermissions, dosPermissions: n2.dosPermissions, createFolders: s2.createFolders });
                }
                return e2.zipComment.length && (a.comment = e2.zipComment), a;
              });
            };
          }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(t, e, r) {
            function s(t2, e2) {
              n.call(this, "Nodejs stream input adapter for " + t2), this._upstreamEnded = false, this._bindStream(e2);
            }
            var i = t("../utils"), n = t("../stream/GenericWorker");
            i.inherits(s, n), s.prototype._bindStream = function(t2) {
              var e2 = this;
              (this._stream = t2).pause(), t2.on("data", function(t3) {
                e2.push({ data: t3, meta: { percent: 0 } });
              }).on("error", function(t3) {
                e2.isPaused ? this.generatedError = t3 : e2.error(t3);
              }).on("end", function() {
                e2.isPaused ? e2._upstreamEnded = true : e2.end();
              });
            }, s.prototype.pause = function() {
              return !!n.prototype.pause.call(this) && (this._stream.pause(), true);
            }, s.prototype.resume = function() {
              return !!n.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
            }, e.exports = s;
          }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(t, e, r) {
            function i(t2, e2, r2) {
              n.call(this, e2), this._helper = t2;
              var i2 = this;
              t2.on("data", function(t3, e3) {
                i2.push(t3) || i2._helper.pause(), r2 && r2(e3);
              }).on("error", function(t3) {
                i2.emit("error", t3);
              }).on("end", function() {
                i2.push(null);
              });
            }
            var n = t("readable-stream").Readable;
            t("../utils").inherits(i, n), i.prototype._read = function() {
              this._helper.resume();
            }, e.exports = i;
          }, { "../utils": 32, "readable-stream": 16 }], 14: [function(t, e, r) {
            e.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(t2, e2) {
              if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(t2, e2);
              if ("number" == typeof t2) throw new Error('The "data" argument must not be a number');
              return new Buffer(t2, e2);
            }, allocBuffer: function(t2) {
              if (Buffer.alloc) return Buffer.alloc(t2);
              var e2 = new Buffer(t2);
              return e2.fill(0), e2;
            }, isBuffer: function(t2) {
              return Buffer.isBuffer(t2);
            }, isStream: function(t2) {
              return t2 && "function" == typeof t2.on && "function" == typeof t2.pause && "function" == typeof t2.resume;
            } };
          }, {}], 15: [function(t, e, r) {
            function s(t2, e2, r2) {
              var i2, n2 = u.getTypeOf(e2), s2 = u.extend(r2 || {}, f);
              s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (t2 = g(t2)), s2.createFolders && (i2 = _(t2)) && b.call(this, i2, true);
              var a2 = "string" === n2 && false === s2.binary && false === s2.base64;
              r2 && void 0 !== r2.binary || (s2.binary = !a2), (e2 instanceof d && 0 === e2.uncompressedSize || s2.dir || !e2 || 0 === e2.length) && (s2.base64 = false, s2.binary = true, e2 = "", s2.compression = "STORE", n2 = "string");
              var o2 = null;
              o2 = e2 instanceof d || e2 instanceof l ? e2 : p.isNode && p.isStream(e2) ? new m(t2, e2) : u.prepareContent(t2, e2, s2.binary, s2.optimizedBinaryString, s2.base64);
              var h2 = new c(t2, o2, s2);
              this.files[t2] = h2;
            }
            function h(t2) {
              return "[object RegExp]" === Object.prototype.toString.call(t2);
            }
            var n = t("./utf8"), u = t("./utils"), l = t("./stream/GenericWorker"), a = t("./stream/StreamHelper"), f = t("./defaults"), d = t("./compressedObject"), c = t("./zipObject"), o = t("./generate"), p = t("./nodejsUtils"), m = t("./nodejs/NodejsStreamInputAdapter"), _ = function(t2) {
              "/" === t2.slice(-1) && (t2 = t2.substring(0, t2.length - 1));
              var e2 = t2.lastIndexOf("/");
              return e2 > 0 ? t2.substring(0, e2) : "";
            }, g = function(t2) {
              return "/" !== t2.slice(-1) && (t2 += "/"), t2;
            }, b = function(t2, e2) {
              return e2 = void 0 !== e2 ? e2 : f.createFolders, t2 = g(t2), this.files[t2] || s.call(this, t2, null, { dir: true, createFolders: e2 }), this.files[t2];
            }, i = { load: function() {
              throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            }, forEach: function(t2) {
              var e2, r2, i2;
              for (e2 in this.files) i2 = this.files[e2], (r2 = e2.slice(this.root.length, e2.length)) && e2.slice(0, this.root.length) === this.root && t2(r2, i2);
            }, filter: function(r2) {
              var i2 = [];
              return this.forEach(function(t2, e2) {
                r2(t2, e2) && i2.push(e2);
              }), i2;
            }, file: function(t2, e2, r2) {
              if (1 !== arguments.length) return t2 = this.root + t2, s.call(this, t2, e2, r2), this;
              if (h(t2)) {
                var i2 = t2;
                return this.filter(function(t3, e3) {
                  return !e3.dir && i2.test(t3);
                });
              }
              var n2 = this.files[this.root + t2];
              return n2 && !n2.dir ? n2 : null;
            }, folder: function(r2) {
              if (!r2) return this;
              if (h(r2)) return this.filter(function(t3, e3) {
                return e3.dir && r2.test(t3);
              });
              var t2 = this.root + r2, e2 = b.call(this, t2), i2 = this.clone();
              return i2.root = e2.name, i2;
            }, remove: function(r2) {
              r2 = this.root + r2;
              var t2 = this.files[r2];
              if (t2 || ("/" !== r2.slice(-1) && (r2 += "/"), t2 = this.files[r2]), t2 && !t2.dir) delete this.files[r2];
              else for (var e2 = this.filter(function(t3, e3) {
                return e3.name.slice(0, r2.length) === r2;
              }), i2 = 0; i2 < e2.length; i2++) delete this.files[e2[i2].name];
              return this;
            }, generate: function(t2) {
              throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            }, generateInternalStream: function(t2) {
              var e2, r2 = {};
              try {
                if ((r2 = u.extend(t2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: n.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
                u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
                var i2 = r2.comment || this.comment || "";
                e2 = o.generateWorker(this, r2, i2);
              } catch (t3) {
                (e2 = new l("error")).error(t3);
              }
              return new a(e2, r2.type || "string", r2.mimeType);
            }, generateAsync: function(t2, e2) {
              return this.generateInternalStream(t2).accumulate(e2);
            }, generateNodeStream: function(t2, e2) {
              return (t2 = t2 || {}).type || (t2.type = "nodebuffer"), this.generateInternalStream(t2).toNodejsStream(e2);
            } };
            e.exports = i;
          }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(t, e, r) {
            e.exports = t("stream");
          }, { stream: void 0 }], 17: [function(t, e, r) {
            function n(t2) {
              i.call(this, t2);
              for (var e2 = 0; e2 < this.data.length; e2++) t2[e2] = 255 & t2[e2];
            }
            var i = t("./DataReader");
            t("../utils").inherits(n, i), n.prototype.byteAt = function(t2) {
              return this.data[this.zero + t2];
            }, n.prototype.lastIndexOfSignature = function(t2) {
              for (var e2 = t2.charCodeAt(0), r2 = t2.charCodeAt(1), i2 = t2.charCodeAt(2), n2 = t2.charCodeAt(3), s = this.length - 4; s >= 0; --s) if (this.data[s] === e2 && this.data[s + 1] === r2 && this.data[s + 2] === i2 && this.data[s + 3] === n2) return s - this.zero;
              return -1;
            }, n.prototype.readAndCheckSignature = function(t2) {
              var e2 = t2.charCodeAt(0), r2 = t2.charCodeAt(1), i2 = t2.charCodeAt(2), n2 = t2.charCodeAt(3), s = this.readData(4);
              return e2 === s[0] && r2 === s[1] && i2 === s[2] && n2 === s[3];
            }, n.prototype.readData = function(t2) {
              if (this.checkOffset(t2), 0 === t2) return [];
              var e2 = this.data.slice(this.zero + this.index, this.zero + this.index + t2);
              return this.index += t2, e2;
            }, e.exports = n;
          }, { "../utils": 32, "./DataReader": 18 }], 18: [function(t, e, r) {
            function n(t2) {
              this.data = t2, this.length = t2.length, this.index = 0, this.zero = 0;
            }
            var i = t("../utils");
            n.prototype = { checkOffset: function(t2) {
              this.checkIndex(this.index + t2);
            }, checkIndex: function(t2) {
              if (this.length < this.zero + t2 || 0 > t2) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + t2 + "). Corrupted zip ?");
            }, setIndex: function(t2) {
              this.checkIndex(t2), this.index = t2;
            }, skip: function(t2) {
              this.setIndex(this.index + t2);
            }, byteAt: function(t2) {
            }, readInt: function(t2) {
              var e2, r2 = 0;
              for (this.checkOffset(t2), e2 = this.index + t2 - 1; e2 >= this.index; e2--) r2 = (r2 << 8) + this.byteAt(e2);
              return this.index += t2, r2;
            }, readString: function(t2) {
              return i.transformTo("string", this.readData(t2));
            }, readData: function(t2) {
            }, lastIndexOfSignature: function(t2) {
            }, readAndCheckSignature: function(t2) {
            }, readDate: function() {
              var t2 = this.readInt(4);
              return new Date(Date.UTC(1980 + (t2 >> 25 & 127), (t2 >> 21 & 15) - 1, t2 >> 16 & 31, t2 >> 11 & 31, t2 >> 5 & 63, (31 & t2) << 1));
            } }, e.exports = n;
          }, { "../utils": 32 }], 19: [function(t, e, r) {
            function n(t2) {
              i.call(this, t2);
            }
            var i = t("./Uint8ArrayReader");
            t("../utils").inherits(n, i), n.prototype.readData = function(t2) {
              this.checkOffset(t2);
              var e2 = this.data.slice(this.zero + this.index, this.zero + this.index + t2);
              return this.index += t2, e2;
            }, e.exports = n;
          }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(t, e, r) {
            function n(t2) {
              i.call(this, t2);
            }
            var i = t("./DataReader");
            t("../utils").inherits(n, i), n.prototype.byteAt = function(t2) {
              return this.data.charCodeAt(this.zero + t2);
            }, n.prototype.lastIndexOfSignature = function(t2) {
              return this.data.lastIndexOf(t2) - this.zero;
            }, n.prototype.readAndCheckSignature = function(t2) {
              return t2 === this.readData(4);
            }, n.prototype.readData = function(t2) {
              this.checkOffset(t2);
              var e2 = this.data.slice(this.zero + this.index, this.zero + this.index + t2);
              return this.index += t2, e2;
            }, e.exports = n;
          }, { "../utils": 32, "./DataReader": 18 }], 21: [function(t, e, r) {
            function n(t2) {
              i.call(this, t2);
            }
            var i = t("./ArrayReader");
            t("../utils").inherits(n, i), n.prototype.readData = function(t2) {
              if (this.checkOffset(t2), 0 === t2) return new Uint8Array(0);
              var e2 = this.data.subarray(this.zero + this.index, this.zero + this.index + t2);
              return this.index += t2, e2;
            }, e.exports = n;
          }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(t, e, r) {
            var i = t("../utils"), n = t("../support"), s = t("./ArrayReader"), a = t("./StringReader"), o = t("./NodeBufferReader"), h = t("./Uint8ArrayReader");
            e.exports = function(t2) {
              var e2 = i.getTypeOf(t2);
              return i.checkSupport(e2), "string" !== e2 || n.uint8array ? "nodebuffer" === e2 ? new o(t2) : n.uint8array ? new h(i.transformTo("uint8array", t2)) : new s(i.transformTo("array", t2)) : new a(t2);
            };
          }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(t, e, r) {
            r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
          }, {}], 24: [function(t, e, r) {
            function s(t2) {
              i.call(this, "ConvertWorker to " + t2), this.destType = t2;
            }
            var i = t("./GenericWorker"), n = t("../utils");
            n.inherits(s, i), s.prototype.processChunk = function(t2) {
              this.push({ data: n.transformTo(this.destType, t2.data), meta: t2.meta });
            }, e.exports = s;
          }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(t, e, r) {
            function s() {
              i.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
            }
            var i = t("./GenericWorker"), n = t("../crc32");
            t("../utils").inherits(s, i), s.prototype.processChunk = function(t2) {
              this.streamInfo.crc32 = n(t2.data, this.streamInfo.crc32 || 0), this.push(t2);
            }, e.exports = s;
          }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(t, e, r) {
            function s(t2) {
              n.call(this, "DataLengthProbe for " + t2), this.propName = t2, this.withStreamInfo(t2, 0);
            }
            var i = t("../utils"), n = t("./GenericWorker");
            i.inherits(s, n), s.prototype.processChunk = function(t2) {
              if (t2) {
                var e2 = this.streamInfo[this.propName] || 0;
                this.streamInfo[this.propName] = e2 + t2.data.length;
              }
              n.prototype.processChunk.call(this, t2);
            }, e.exports = s;
          }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(t, e, r) {
            function s(t2) {
              n.call(this, "DataWorker");
              var e2 = this;
              this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, t2.then(function(t3) {
                e2.dataIsReady = true, e2.data = t3, e2.max = t3 && t3.length || 0, e2.type = i.getTypeOf(t3), e2.isPaused || e2._tickAndRepeat();
              }, function(t3) {
                e2.error(t3);
              });
            }
            var i = t("../utils"), n = t("./GenericWorker");
            i.inherits(s, n), s.prototype.cleanUp = function() {
              n.prototype.cleanUp.call(this), this.data = null;
            }, s.prototype.resume = function() {
              return !!n.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, i.delay(this._tickAndRepeat, [], this)), true);
            }, s.prototype._tickAndRepeat = function() {
              this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (i.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
            }, s.prototype._tick = function() {
              if (this.isPaused || this.isFinished) return false;
              var t2 = null, e2 = Math.min(this.max, this.index + 16384);
              if (this.index >= this.max) return this.end();
              switch (this.type) {
                case "string":
                  t2 = this.data.substring(this.index, e2);
                  break;
                case "uint8array":
                  t2 = this.data.subarray(this.index, e2);
                  break;
                case "array":
                case "nodebuffer":
                  t2 = this.data.slice(this.index, e2);
              }
              return this.index = e2, this.push({ data: t2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
            }, e.exports = s;
          }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(t, e, r) {
            function i(t2) {
              this.name = t2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
            }
            i.prototype = { push: function(t2) {
              this.emit("data", t2);
            }, end: function() {
              if (this.isFinished) return false;
              this.flush();
              try {
                this.emit("end"), this.cleanUp(), this.isFinished = true;
              } catch (t2) {
                this.emit("error", t2);
              }
              return true;
            }, error: function(t2) {
              return !this.isFinished && (this.isPaused ? this.generatedError = t2 : (this.isFinished = true, this.emit("error", t2), this.previous && this.previous.error(t2), this.cleanUp()), true);
            }, on: function(t2, e2) {
              return this._listeners[t2].push(e2), this;
            }, cleanUp: function() {
              this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
            }, emit: function(t2, e2) {
              if (this._listeners[t2]) for (var r2 = 0; r2 < this._listeners[t2].length; r2++) this._listeners[t2][r2].call(this, e2);
            }, pipe: function(t2) {
              return t2.registerPrevious(this);
            }, registerPrevious: function(t2) {
              if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
              this.streamInfo = t2.streamInfo, this.mergeStreamInfo(), this.previous = t2;
              var e2 = this;
              return t2.on("data", function(t3) {
                e2.processChunk(t3);
              }), t2.on("end", function() {
                e2.end();
              }), t2.on("error", function(t3) {
                e2.error(t3);
              }), this;
            }, pause: function() {
              return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
            }, resume: function() {
              if (!this.isPaused || this.isFinished) return false;
              var t2 = this.isPaused = false;
              return this.generatedError && (this.error(this.generatedError), t2 = true), this.previous && this.previous.resume(), !t2;
            }, flush: function() {
            }, processChunk: function(t2) {
              this.push(t2);
            }, withStreamInfo: function(t2, e2) {
              return this.extraStreamInfo[t2] = e2, this.mergeStreamInfo(), this;
            }, mergeStreamInfo: function() {
              for (var t2 in this.extraStreamInfo) this.extraStreamInfo.hasOwnProperty(t2) && (this.streamInfo[t2] = this.extraStreamInfo[t2]);
            }, lock: function() {
              if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
              this.isLocked = true, this.previous && this.previous.lock();
            }, toString: function() {
              var t2 = "Worker " + this.name;
              return this.previous ? this.previous + " -> " + t2 : t2;
            } }, e.exports = i;
          }, {}], 29: [function(t, e, r) {
            function l(t2, o2) {
              return new a.Promise(function(e2, r2) {
                var i2 = [], n2 = t2._internalType, s2 = t2._outputType, a2 = t2._mimeType;
                t2.on("data", function(t3, e3) {
                  i2.push(t3), o2 && o2(e3);
                }).on("error", function(t3) {
                  i2 = [], r2(t3);
                }).on("end", function() {
                  try {
                    var t3 = function(t4, e3, r3) {
                      switch (t4) {
                        case "blob":
                          return h.newBlob(h.transformTo("arraybuffer", e3), r3);
                        case "base64":
                          return u.encode(e3);
                        default:
                          return h.transformTo(t4, e3);
                      }
                    }(s2, function(t4, e3) {
                      var r3, i3 = 0, n3 = null, s3 = 0;
                      for (r3 = 0; r3 < e3.length; r3++) s3 += e3[r3].length;
                      switch (t4) {
                        case "string":
                          return e3.join("");
                        case "array":
                          return Array.prototype.concat.apply([], e3);
                        case "uint8array":
                          for (n3 = new Uint8Array(s3), r3 = 0; r3 < e3.length; r3++) n3.set(e3[r3], i3), i3 += e3[r3].length;
                          return n3;
                        case "nodebuffer":
                          return Buffer.concat(e3);
                        default:
                          throw new Error("concat : unsupported type '" + t4 + "'");
                      }
                    }(n2, i2), a2);
                    e2(t3);
                  } catch (t4) {
                    r2(t4);
                  }
                  i2 = [];
                }).resume();
              });
            }
            function f(t2, e2, r2) {
              var i2 = e2;
              switch (e2) {
                case "blob":
                case "arraybuffer":
                  i2 = "uint8array";
                  break;
                case "base64":
                  i2 = "string";
              }
              try {
                this._internalType = i2, this._outputType = e2, this._mimeType = r2, h.checkSupport(i2), this._worker = t2.pipe(new n(i2)), t2.lock();
              } catch (t3) {
                this._worker = new s("error"), this._worker.error(t3);
              }
            }
            var h = t("../utils"), n = t("./ConvertWorker"), s = t("./GenericWorker"), u = t("../base64"), i = t("../support"), a = t("../external"), o = null;
            if (i.nodestream) try {
              o = t("../nodejs/NodejsStreamOutputAdapter");
            } catch (t2) {
            }
            f.prototype = { accumulate: function(t2) {
              return l(this, t2);
            }, on: function(t2, e2) {
              var r2 = this;
              return "data" === t2 ? this._worker.on(t2, function(t3) {
                e2.call(r2, t3.data, t3.meta);
              }) : this._worker.on(t2, function() {
                h.delay(e2, arguments, r2);
              }), this;
            }, resume: function() {
              return h.delay(this._worker.resume, [], this._worker), this;
            }, pause: function() {
              return this._worker.pause(), this;
            }, toNodejsStream: function(t2) {
              if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
              return new o(this, { objectMode: "nodebuffer" !== this._outputType }, t2);
            } }, e.exports = f;
          }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(t, e, r) {
            if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
            else {
              var i = new ArrayBuffer(0);
              try {
                r.blob = 0 === new Blob([i], { type: "application/zip" }).size;
              } catch (t2) {
                try {
                  var n = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                  n.append(i), r.blob = 0 === n.getBlob("application/zip").size;
                } catch (t3) {
                  r.blob = false;
                }
              }
            }
            try {
              r.nodestream = !!t("readable-stream").Readable;
            } catch (t2) {
              r.nodestream = false;
            }
          }, { "readable-stream": 16 }], 31: [function(t, e, s) {
            function a() {
              i.call(this, "utf-8 decode"), this.leftOver = null;
            }
            function l() {
              i.call(this, "utf-8 encode");
            }
            for (var o = t("./utils"), h = t("./support"), r = t("./nodejsUtils"), i = t("./stream/GenericWorker"), u = new Array(256), n = 0; 256 > n; n++) u[n] = n >= 252 ? 6 : n >= 248 ? 5 : n >= 240 ? 4 : n >= 224 ? 3 : n >= 192 ? 2 : 1;
            u[254] = u[254] = 1, s.utf8encode = function(t2) {
              return h.nodebuffer ? r.newBufferFrom(t2, "utf-8") : function(t3) {
                var e2, r2, i2, n2, s2, a2 = t3.length, o2 = 0;
                for (n2 = 0; a2 > n2; n2++) 55296 == (64512 & (r2 = t3.charCodeAt(n2))) && a2 > n2 + 1 && 56320 == (64512 & (i2 = t3.charCodeAt(n2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (i2 - 56320), n2++), o2 += 128 > r2 ? 1 : 2048 > r2 ? 2 : 65536 > r2 ? 3 : 4;
                for (e2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), n2 = s2 = 0; o2 > s2; n2++) 55296 == (64512 & (r2 = t3.charCodeAt(n2))) && a2 > n2 + 1 && 56320 == (64512 & (i2 = t3.charCodeAt(n2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (i2 - 56320), n2++), 128 > r2 ? e2[s2++] = r2 : (2048 > r2 ? e2[s2++] = 192 | r2 >>> 6 : (65536 > r2 ? e2[s2++] = 224 | r2 >>> 12 : (e2[s2++] = 240 | r2 >>> 18, e2[s2++] = 128 | r2 >>> 12 & 63), e2[s2++] = 128 | r2 >>> 6 & 63), e2[s2++] = 128 | 63 & r2);
                return e2;
              }(t2);
            }, s.utf8decode = function(t2) {
              return h.nodebuffer ? o.transformTo("nodebuffer", t2).toString("utf-8") : function(t3) {
                var e2, r2, i2, n2, s2 = t3.length, a2 = new Array(2 * s2);
                for (e2 = r2 = 0; s2 > e2; ) if ((i2 = t3[e2++]) < 128) a2[r2++] = i2;
                else if (4 < (n2 = u[i2])) a2[r2++] = 65533, e2 += n2 - 1;
                else {
                  for (i2 &= 2 === n2 ? 31 : 3 === n2 ? 15 : 7; n2 > 1 && s2 > e2; ) i2 = i2 << 6 | 63 & t3[e2++], n2--;
                  n2 > 1 ? a2[r2++] = 65533 : 65536 > i2 ? a2[r2++] = i2 : (i2 -= 65536, a2[r2++] = 55296 | i2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & i2);
                }
                return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
              }(t2 = o.transformTo(h.uint8array ? "uint8array" : "array", t2));
            }, o.inherits(a, i), a.prototype.processChunk = function(t2) {
              var e2 = o.transformTo(h.uint8array ? "uint8array" : "array", t2.data);
              if (this.leftOver && this.leftOver.length) {
                if (h.uint8array) {
                  var r2 = e2;
                  (e2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), e2.set(r2, this.leftOver.length);
                } else e2 = this.leftOver.concat(e2);
                this.leftOver = null;
              }
              var i2 = function(t3, e3) {
                var r3;
                for ((e3 = e3 || t3.length) > t3.length && (e3 = t3.length), r3 = e3 - 1; r3 >= 0 && 128 == (192 & t3[r3]); ) r3--;
                return 0 > r3 ? e3 : 0 === r3 ? e3 : r3 + u[t3[r3]] > e3 ? r3 : e3;
              }(e2), n2 = e2;
              i2 !== e2.length && (h.uint8array ? (n2 = e2.subarray(0, i2), this.leftOver = e2.subarray(i2, e2.length)) : (n2 = e2.slice(0, i2), this.leftOver = e2.slice(i2, e2.length))), this.push({ data: s.utf8decode(n2), meta: t2.meta });
            }, a.prototype.flush = function() {
              this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
            }, s.Utf8DecodeWorker = a, o.inherits(l, i), l.prototype.processChunk = function(t2) {
              this.push({ data: s.utf8encode(t2.data), meta: t2.meta });
            }, s.Utf8EncodeWorker = l;
          }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(t, e, a) {
            function n(t2) {
              return t2;
            }
            function l(t2, e2) {
              for (var r2 = 0; r2 < t2.length; ++r2) e2[r2] = 255 & t2.charCodeAt(r2);
              return e2;
            }
            function f(t2) {
              var e2 = 65536, r2 = a.getTypeOf(t2), i2 = true;
              if ("uint8array" === r2 ? i2 = s.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (i2 = s.applyCanBeUsed.nodebuffer), i2) for (; e2 > 1; ) try {
                return s.stringifyByChunk(t2, r2, e2);
              } catch (t3) {
                e2 = Math.floor(e2 / 2);
              }
              return s.stringifyByChar(t2);
            }
            function d(t2, e2) {
              for (var r2 = 0; r2 < t2.length; r2++) e2[r2] = t2[r2];
              return e2;
            }
            var o = t("./support"), h = t("./base64"), r = t("./nodejsUtils"), i = t("set-immediate-shim"), u = t("./external");
            a.newBlob = function(e2, r2) {
              a.checkSupport("blob");
              try {
                return new Blob([e2], { type: r2 });
              } catch (t2) {
                try {
                  var i2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                  return i2.append(e2), i2.getBlob(r2);
                } catch (t3) {
                  throw new Error("Bug : can't construct the Blob.");
                }
              }
            };
            var s = { stringifyByChunk: function(t2, e2, r2) {
              var i2 = [], n2 = 0, s2 = t2.length;
              if (r2 >= s2) return String.fromCharCode.apply(null, t2);
              for (; s2 > n2; ) "array" === e2 || "nodebuffer" === e2 ? i2.push(String.fromCharCode.apply(null, t2.slice(n2, Math.min(n2 + r2, s2)))) : i2.push(String.fromCharCode.apply(null, t2.subarray(n2, Math.min(n2 + r2, s2)))), n2 += r2;
              return i2.join("");
            }, stringifyByChar: function(t2) {
              for (var e2 = "", r2 = 0; r2 < t2.length; r2++) e2 += String.fromCharCode(t2[r2]);
              return e2;
            }, applyCanBeUsed: { uint8array: function() {
              try {
                return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
              } catch (t2) {
                return false;
              }
            }(), nodebuffer: function() {
              try {
                return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
              } catch (t2) {
                return false;
              }
            }() } };
            a.applyFromCharCode = f;
            var c = {};
            c.string = { string: n, array: function(t2) {
              return l(t2, new Array(t2.length));
            }, arraybuffer: function(t2) {
              return c.string.uint8array(t2).buffer;
            }, uint8array: function(t2) {
              return l(t2, new Uint8Array(t2.length));
            }, nodebuffer: function(t2) {
              return l(t2, r.allocBuffer(t2.length));
            } }, c.array = { string: f, array: n, arraybuffer: function(t2) {
              return new Uint8Array(t2).buffer;
            }, uint8array: function(t2) {
              return new Uint8Array(t2);
            }, nodebuffer: function(t2) {
              return r.newBufferFrom(t2);
            } }, c.arraybuffer = { string: function(t2) {
              return f(new Uint8Array(t2));
            }, array: function(t2) {
              return d(new Uint8Array(t2), new Array(t2.byteLength));
            }, arraybuffer: n, uint8array: function(t2) {
              return new Uint8Array(t2);
            }, nodebuffer: function(t2) {
              return r.newBufferFrom(new Uint8Array(t2));
            } }, c.uint8array = { string: f, array: function(t2) {
              return d(t2, new Array(t2.length));
            }, arraybuffer: function(t2) {
              return t2.buffer;
            }, uint8array: n, nodebuffer: function(t2) {
              return r.newBufferFrom(t2);
            } }, c.nodebuffer = { string: f, array: function(t2) {
              return d(t2, new Array(t2.length));
            }, arraybuffer: function(t2) {
              return c.nodebuffer.uint8array(t2).buffer;
            }, uint8array: function(t2) {
              return d(t2, new Uint8Array(t2.length));
            }, nodebuffer: n }, a.transformTo = function(t2, e2) {
              if (e2 = e2 || "", !t2) return e2;
              a.checkSupport(t2);
              var r2 = a.getTypeOf(e2);
              return c[r2][t2](e2);
            }, a.getTypeOf = function(t2) {
              return "string" == typeof t2 ? "string" : "[object Array]" === Object.prototype.toString.call(t2) ? "array" : o.nodebuffer && r.isBuffer(t2) ? "nodebuffer" : o.uint8array && t2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && t2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
            }, a.checkSupport = function(t2) {
              if (!o[t2.toLowerCase()]) throw new Error(t2 + " is not supported by this platform");
            }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(t2) {
              var e2, r2, i2 = "";
              for (r2 = 0; r2 < (t2 || "").length; r2++) i2 += "\\x" + ((e2 = t2.charCodeAt(r2)) < 16 ? "0" : "") + e2.toString(16).toUpperCase();
              return i2;
            }, a.delay = function(t2, e2, r2) {
              i(function() {
                t2.apply(r2 || null, e2 || []);
              });
            }, a.inherits = function(t2, e2) {
              function r2() {
              }
              r2.prototype = e2.prototype, t2.prototype = new r2();
            }, a.extend = function() {
              var t2, e2, r2 = {};
              for (t2 = 0; t2 < arguments.length; t2++) for (e2 in arguments[t2]) arguments[t2].hasOwnProperty(e2) && void 0 === r2[e2] && (r2[e2] = arguments[t2][e2]);
              return r2;
            }, a.prepareContent = function(r2, t2, i2, n2, s2) {
              return u.Promise.resolve(t2).then(function(i3) {
                return o.blob && (i3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(i3))) && "undefined" != typeof FileReader ? new u.Promise(function(e2, r3) {
                  var t3 = new FileReader();
                  t3.onload = function(t4) {
                    e2(t4.target.result);
                  }, t3.onerror = function(t4) {
                    r3(t4.target.error);
                  }, t3.readAsArrayBuffer(i3);
                }) : i3;
              }).then(function(t3) {
                var e2 = a.getTypeOf(t3);
                return e2 ? ("arraybuffer" === e2 ? t3 = a.transformTo("uint8array", t3) : "string" === e2 && (s2 ? t3 = h.decode(t3) : i2 && true !== n2 && (t3 = function(t4) {
                  return l(t4, o.uint8array ? new Uint8Array(t4.length) : new Array(t4.length));
                }(t3))), t3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
              });
            };
          }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, "set-immediate-shim": 54 }], 33: [function(t, e, r) {
            function h(t2) {
              this.files = [], this.loadOptions = t2;
            }
            var i = t("./reader/readerFor"), n = t("./utils"), s = t("./signature"), a = t("./zipEntry"), o = (t("./utf8"), t("./support"));
            h.prototype = { checkSignature: function(t2) {
              if (!this.reader.readAndCheckSignature(t2)) {
                this.reader.index -= 4;
                var e2 = this.reader.readString(4);
                throw new Error("Corrupted zip or bug: unexpected signature (" + n.pretty(e2) + ", expected " + n.pretty(t2) + ")");
              }
            }, isSignature: function(t2, e2) {
              var r2 = this.reader.index;
              this.reader.setIndex(t2);
              var i2 = this.reader.readString(4) === e2;
              return this.reader.setIndex(r2), i2;
            }, readBlockEndOfCentral: function() {
              this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
              var t2 = this.reader.readData(this.zipCommentLength), e2 = o.uint8array ? "uint8array" : "array", r2 = n.transformTo(e2, t2);
              this.zipComment = this.loadOptions.decodeFileName(r2);
            }, readBlockZip64EndOfCentral: function() {
              this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
              for (var t2, e2, r2, i2 = this.zip64EndOfCentralSize - 44; i2 > 0; ) t2 = this.reader.readInt(2), e2 = this.reader.readInt(4), r2 = this.reader.readData(e2), this.zip64ExtensibleData[t2] = { id: t2, length: e2, value: r2 };
            }, readBlockZip64EndOfCentralLocator: function() {
              if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
            }, readLocalFiles: function() {
              var t2, e2;
              for (t2 = 0; t2 < this.files.length; t2++) e2 = this.files[t2], this.reader.setIndex(e2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), e2.readLocalPart(this.reader), e2.handleUTF8(), e2.processAttributes();
            }, readCentralDir: function() {
              var t2;
              for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (t2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(t2);
              if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
            }, readEndOfCentral: function() {
              var t2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
              if (0 > t2) throw this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Corrupted zip: can't find end of central directory") : new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
              this.reader.setIndex(t2);
              var e2 = t2;
              if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === n.MAX_VALUE_16BITS || this.diskWithCentralDirStart === n.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === n.MAX_VALUE_16BITS || this.centralDirRecords === n.MAX_VALUE_16BITS || this.centralDirSize === n.MAX_VALUE_32BITS || this.centralDirOffset === n.MAX_VALUE_32BITS) {
                if (this.zip64 = true, (t2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
                if (this.reader.setIndex(t2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
                this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
              }
              var r2 = this.centralDirOffset + this.centralDirSize;
              this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
              var i2 = e2 - r2;
              if (i2 > 0) this.isSignature(e2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = i2);
              else if (0 > i2) throw new Error("Corrupted zip: missing " + Math.abs(i2) + " bytes.");
            }, prepareReader: function(t2) {
              this.reader = i(t2);
            }, load: function(t2) {
              this.prepareReader(t2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
            } }, e.exports = h;
          }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utf8": 31, "./utils": 32, "./zipEntry": 34 }], 34: [function(t, e, r) {
            function l(t2, e2) {
              this.options = t2, this.loadOptions = e2;
            }
            var i = t("./reader/readerFor"), s = t("./utils"), n = t("./compressedObject"), a = t("./crc32"), o = t("./utf8"), h = t("./compressions"), u = t("./support");
            l.prototype = { isEncrypted: function() {
              return 1 == (1 & this.bitFlag);
            }, useUTF8: function() {
              return 2048 == (2048 & this.bitFlag);
            }, readLocalPart: function(t2) {
              var e2, r2;
              if (t2.skip(22), this.fileNameLength = t2.readInt(2), r2 = t2.readInt(2), this.fileName = t2.readData(this.fileNameLength), t2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
              if (null === (e2 = function(t3) {
                for (var e3 in h) if (h.hasOwnProperty(e3) && h[e3].magic === t3) return h[e3];
                return null;
              }(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
              this.decompressed = new n(this.compressedSize, this.uncompressedSize, this.crc32, e2, t2.readData(this.compressedSize));
            }, readCentralPart: function(t2) {
              this.versionMadeBy = t2.readInt(2), t2.skip(2), this.bitFlag = t2.readInt(2), this.compressionMethod = t2.readString(2), this.date = t2.readDate(), this.crc32 = t2.readInt(4), this.compressedSize = t2.readInt(4), this.uncompressedSize = t2.readInt(4);
              var e2 = t2.readInt(2);
              if (this.extraFieldsLength = t2.readInt(2), this.fileCommentLength = t2.readInt(2), this.diskNumberStart = t2.readInt(2), this.internalFileAttributes = t2.readInt(2), this.externalFileAttributes = t2.readInt(4), this.localHeaderOffset = t2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
              t2.skip(e2), this.readExtraFields(t2), this.parseZIP64ExtraField(t2), this.fileComment = t2.readData(this.fileCommentLength);
            }, processAttributes: function() {
              this.unixPermissions = null, this.dosPermissions = null;
              var t2 = this.versionMadeBy >> 8;
              this.dir = !!(16 & this.externalFileAttributes), 0 == t2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == t2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
            }, parseZIP64ExtraField: function(t2) {
              if (this.extraFields[1]) {
                var e2 = i(this.extraFields[1].value);
                this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
              }
            }, readExtraFields: function(t2) {
              var e2, r2, i2, n2 = t2.index + this.extraFieldsLength;
              for (this.extraFields || (this.extraFields = {}); t2.index + 4 < n2; ) e2 = t2.readInt(2), r2 = t2.readInt(2), i2 = t2.readData(r2), this.extraFields[e2] = { id: e2, length: r2, value: i2 };
              t2.setIndex(n2);
            }, handleUTF8: function() {
              var t2 = u.uint8array ? "uint8array" : "array";
              if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
              else {
                var e2 = this.findExtraFieldUnicodePath();
                if (null !== e2) this.fileNameStr = e2;
                else {
                  var r2 = s.transformTo(t2, this.fileName);
                  this.fileNameStr = this.loadOptions.decodeFileName(r2);
                }
                var i2 = this.findExtraFieldUnicodeComment();
                if (null !== i2) this.fileCommentStr = i2;
                else {
                  var n2 = s.transformTo(t2, this.fileComment);
                  this.fileCommentStr = this.loadOptions.decodeFileName(n2);
                }
              }
            }, findExtraFieldUnicodePath: function() {
              var t2 = this.extraFields[28789];
              if (t2) {
                var e2 = i(t2.value);
                return 1 !== e2.readInt(1) ? null : a(this.fileName) !== e2.readInt(4) ? null : o.utf8decode(e2.readData(t2.length - 5));
              }
              return null;
            }, findExtraFieldUnicodeComment: function() {
              var t2 = this.extraFields[25461];
              if (t2) {
                var e2 = i(t2.value);
                return 1 !== e2.readInt(1) ? null : a(this.fileComment) !== e2.readInt(4) ? null : o.utf8decode(e2.readData(t2.length - 5));
              }
              return null;
            } }, e.exports = l;
          }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(t, e, r) {
            function i(t2, e2, r2) {
              this.name = t2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = e2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
            }
            var s = t("./stream/StreamHelper"), n = t("./stream/DataWorker"), a = t("./utf8"), o = t("./compressedObject"), h = t("./stream/GenericWorker");
            i.prototype = { internalStream: function(t2) {
              var e2 = null, r2 = "string";
              try {
                if (!t2) throw new Error("No output type specified.");
                var i2 = "string" === (r2 = t2.toLowerCase()) || "text" === r2;
                "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), e2 = this._decompressWorker();
                var n2 = !this._dataBinary;
                n2 && !i2 && (e2 = e2.pipe(new a.Utf8EncodeWorker())), !n2 && i2 && (e2 = e2.pipe(new a.Utf8DecodeWorker()));
              } catch (t3) {
                (e2 = new h("error")).error(t3);
              }
              return new s(e2, r2, "");
            }, async: function(t2, e2) {
              return this.internalStream(t2).accumulate(e2);
            }, nodeStream: function(t2, e2) {
              return this.internalStream(t2 || "nodebuffer").toNodejsStream(e2);
            }, _compressWorker: function(t2, e2) {
              if (this._data instanceof o && this._data.compression.magic === t2.magic) return this._data.getCompressedWorker();
              var r2 = this._decompressWorker();
              return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, t2, e2);
            }, _decompressWorker: function() {
              return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new n(this._data);
            } };
            for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
              throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            }, f = 0; f < u.length; f++) i.prototype[u[f]] = l;
            e.exports = i;
          }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(t, l, e) {
            (function(e2) {
              function u() {
                var t3, e3;
                i = true;
                for (var r2 = h.length; r2; ) {
                  for (e3 = h, h = [], t3 = -1; ++t3 < r2; ) e3[t3]();
                  r2 = h.length;
                }
                i = false;
              }
              var r, i, t2 = e2.MutationObserver || e2.WebKitMutationObserver;
              if (t2) {
                var n = 0, s = new t2(u), a = e2.document.createTextNode("");
                s.observe(a, { characterData: true }), r = function() {
                  a.data = n = ++n % 2;
                };
              } else if (e2.setImmediate || void 0 === e2.MessageChannel) r = "document" in e2 && "onreadystatechange" in e2.document.createElement("script") ? function() {
                var t3 = e2.document.createElement("script");
                t3.onreadystatechange = function() {
                  u(), t3.onreadystatechange = null, t3.parentNode.removeChild(t3), t3 = null;
                }, e2.document.documentElement.appendChild(t3);
              } : function() {
                setTimeout(u, 0);
              };
              else {
                var o = new e2.MessageChannel();
                o.port1.onmessage = u, r = function() {
                  o.port2.postMessage(0);
                };
              }
              var h = [];
              l.exports = function(t3) {
                1 !== h.push(t3) || i || r();
              };
            }).call(this, "undefined" != typeof global2 ? global2 : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
          }, {}], 37: [function(t, e, r) {
            function u() {
            }
            function o(t2) {
              if ("function" != typeof t2) throw new TypeError("resolver must be a function");
              this.state = i, this.queue = [], this.outcome = void 0, t2 !== u && c(this, t2);
            }
            function h(t2, e2, r2) {
              this.promise = t2, "function" == typeof e2 && (this.onFulfilled = e2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
            }
            function f(e2, r2, i2) {
              n(function() {
                var t2;
                try {
                  t2 = r2(i2);
                } catch (t3) {
                  return l.reject(e2, t3);
                }
                t2 === e2 ? l.reject(e2, new TypeError("Cannot resolve promise with itself")) : l.resolve(e2, t2);
              });
            }
            function d(t2) {
              var e2 = t2 && t2.then;
              return !t2 || "object" != typeof t2 && "function" != typeof t2 || "function" != typeof e2 ? void 0 : function() {
                e2.apply(t2, arguments);
              };
            }
            function c(e2, t2) {
              function i2(t3) {
                r2 || (r2 = true, l.reject(e2, t3));
              }
              function n2(t3) {
                r2 || (r2 = true, l.resolve(e2, t3));
              }
              var r2 = false, s2 = p(function() {
                t2(n2, i2);
              });
              "error" === s2.status && i2(s2.value);
            }
            function p(t2, e2) {
              var r2 = {};
              try {
                r2.value = t2(e2), r2.status = "success";
              } catch (t3) {
                r2.status = "error", r2.value = t3;
              }
              return r2;
            }
            var n = t("immediate"), l = {}, s = ["REJECTED"], a = ["FULFILLED"], i = ["PENDING"];
            (e.exports = o).prototype["finally"] = function(e2) {
              if ("function" != typeof e2) return this;
              var r2 = this.constructor;
              return this.then(function(t2) {
                return r2.resolve(e2()).then(function() {
                  return t2;
                });
              }, function(t2) {
                return r2.resolve(e2()).then(function() {
                  throw t2;
                });
              });
            }, o.prototype["catch"] = function(t2) {
              return this.then(null, t2);
            }, o.prototype.then = function(t2, e2) {
              if ("function" != typeof t2 && this.state === a || "function" != typeof e2 && this.state === s) return this;
              var r2 = new this.constructor(u);
              return this.state !== i ? f(r2, this.state === a ? t2 : e2, this.outcome) : this.queue.push(new h(r2, t2, e2)), r2;
            }, h.prototype.callFulfilled = function(t2) {
              l.resolve(this.promise, t2);
            }, h.prototype.otherCallFulfilled = function(t2) {
              f(this.promise, this.onFulfilled, t2);
            }, h.prototype.callRejected = function(t2) {
              l.reject(this.promise, t2);
            }, h.prototype.otherCallRejected = function(t2) {
              f(this.promise, this.onRejected, t2);
            }, l.resolve = function(t2, e2) {
              var r2 = p(d, e2);
              if ("error" === r2.status) return l.reject(t2, r2.value);
              var i2 = r2.value;
              if (i2) c(t2, i2);
              else {
                t2.state = a, t2.outcome = e2;
                for (var n2 = -1, s2 = t2.queue.length; ++n2 < s2; ) t2.queue[n2].callFulfilled(e2);
              }
              return t2;
            }, l.reject = function(t2, e2) {
              t2.state = s, t2.outcome = e2;
              for (var r2 = -1, i2 = t2.queue.length; ++r2 < i2; ) t2.queue[r2].callRejected(e2);
              return t2;
            }, o.resolve = function(t2) {
              return t2 instanceof this ? t2 : l.resolve(new this(u), t2);
            }, o.reject = function(t2) {
              var e2 = new this(u);
              return l.reject(e2, t2);
            }, o.all = function(t2) {
              function h2(t3, e3) {
                r2.resolve(t3).then(function(t4) {
                  s2[e3] = t4, ++a2 !== i2 || n2 || (n2 = true, l.resolve(o2, s2));
                }, function(t4) {
                  n2 || (n2 = true, l.reject(o2, t4));
                });
              }
              var r2 = this;
              if ("[object Array]" !== Object.prototype.toString.call(t2)) return this.reject(new TypeError("must be an array"));
              var i2 = t2.length, n2 = false;
              if (!i2) return this.resolve([]);
              for (var s2 = new Array(i2), a2 = 0, e2 = -1, o2 = new this(u); ++e2 < i2; ) h2(t2[e2], e2);
              return o2;
            }, o.race = function(t2) {
              var e2 = this;
              if ("[object Array]" !== Object.prototype.toString.call(t2)) return this.reject(new TypeError("must be an array"));
              var r2 = t2.length, i2 = false;
              if (!r2) return this.resolve([]);
              for (var n2 = -1, s2 = new this(u); ++n2 < r2; ) a2 = t2[n2], e2.resolve(a2).then(function(t3) {
                i2 || (i2 = true, l.resolve(s2, t3));
              }, function(t3) {
                i2 || (i2 = true, l.reject(s2, t3));
              });
              var a2;
              return s2;
            };
          }, { immediate: 36 }], 38: [function(t, e, r) {
            var i = {};
            t("./lib/utils/common").assign(i, t("./lib/deflate"), t("./lib/inflate"), t("./lib/zlib/constants")), e.exports = i;
          }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(t, e, r) {
            function p(t2) {
              if (!(this instanceof p)) return new p(t2);
              this.options = o.assign({ level: f, method: c, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: d, to: "" }, t2 || {});
              var e2 = this.options;
              e2.raw && 0 < e2.windowBits ? e2.windowBits = -e2.windowBits : e2.gzip && 0 < e2.windowBits && e2.windowBits < 16 && (e2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
              var r2 = a.deflateInit2(this.strm, e2.level, e2.method, e2.windowBits, e2.memLevel, e2.strategy);
              if (r2 !== l) throw new Error(n[r2]);
              if (e2.header && a.deflateSetHeader(this.strm, e2.header), e2.dictionary) {
                var i2;
                if (i2 = "string" == typeof e2.dictionary ? h.string2buf(e2.dictionary) : "[object ArrayBuffer]" === u.call(e2.dictionary) ? new Uint8Array(e2.dictionary) : e2.dictionary, (r2 = a.deflateSetDictionary(this.strm, i2)) !== l) throw new Error(n[r2]);
                this._dict_set = true;
              }
            }
            function i(t2, e2) {
              var r2 = new p(e2);
              if (r2.push(t2, true), r2.err) throw r2.msg || n[r2.err];
              return r2.result;
            }
            var a = t("./zlib/deflate"), o = t("./utils/common"), h = t("./utils/strings"), n = t("./zlib/messages"), s = t("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, d = 0, c = 8;
            p.prototype.push = function(t2, e2) {
              var r2, i2, n2 = this.strm, s2 = this.options.chunkSize;
              if (this.ended) return false;
              i2 = e2 === ~~e2 ? e2 : true === e2 ? 4 : 0, "string" == typeof t2 ? n2.input = h.string2buf(t2) : "[object ArrayBuffer]" === u.call(t2) ? n2.input = new Uint8Array(t2) : n2.input = t2, n2.next_in = 0, n2.avail_in = n2.input.length;
              do {
                if (0 === n2.avail_out && (n2.output = new o.Buf8(s2), n2.next_out = 0, n2.avail_out = s2), 1 !== (r2 = a.deflate(n2, i2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
                0 !== n2.avail_out && (0 !== n2.avail_in || 4 !== i2 && 2 !== i2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(n2.output, n2.next_out))) : this.onData(o.shrinkBuf(n2.output, n2.next_out)));
              } while ((0 < n2.avail_in || 0 === n2.avail_out) && 1 !== r2);
              return 4 === i2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== i2 || (this.onEnd(l), !(n2.avail_out = 0));
            }, p.prototype.onData = function(t2) {
              this.chunks.push(t2);
            }, p.prototype.onEnd = function(t2) {
              t2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = t2, this.msg = this.strm.msg;
            }, r.Deflate = p, r.deflate = i, r.deflateRaw = function(t2, e2) {
              return (e2 = e2 || {}).raw = true, i(t2, e2);
            }, r.gzip = function(t2, e2) {
              return (e2 = e2 || {}).gzip = true, i(t2, e2);
            };
          }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(t, e, r) {
            function a(t2) {
              if (!(this instanceof a)) return new a(t2);
              this.options = c.assign({ chunkSize: 16384, windowBits: 0, to: "" }, t2 || {});
              var e2 = this.options;
              e2.raw && 0 <= e2.windowBits && e2.windowBits < 16 && (e2.windowBits = -e2.windowBits, 0 === e2.windowBits && (e2.windowBits = -15)), !(0 <= e2.windowBits && e2.windowBits < 16) || t2 && t2.windowBits || (e2.windowBits += 32), 15 < e2.windowBits && e2.windowBits < 48 && 0 == (15 & e2.windowBits) && (e2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new n(), this.strm.avail_out = 0;
              var r2 = d.inflateInit2(this.strm, e2.windowBits);
              if (r2 !== m.Z_OK) throw new Error(i[r2]);
              this.header = new s(), d.inflateGetHeader(this.strm, this.header);
            }
            function o(t2, e2) {
              var r2 = new a(e2);
              if (r2.push(t2, true), r2.err) throw r2.msg || i[r2.err];
              return r2.result;
            }
            var d = t("./zlib/inflate"), c = t("./utils/common"), p = t("./utils/strings"), m = t("./zlib/constants"), i = t("./zlib/messages"), n = t("./zlib/zstream"), s = t("./zlib/gzheader"), _ = Object.prototype.toString;
            a.prototype.push = function(t2, e2) {
              var r2, i2, n2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
              if (this.ended) return false;
              i2 = e2 === ~~e2 ? e2 : true === e2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof t2 ? h.input = p.binstring2buf(t2) : "[object ArrayBuffer]" === _.call(t2) ? h.input = new Uint8Array(t2) : h.input = t2, h.next_in = 0, h.avail_in = h.input.length;
              do {
                if (0 === h.avail_out && (h.output = new c.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = d.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = d.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
                h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || i2 !== m.Z_FINISH && i2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (n2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - n2, a2 = p.buf2string(h.output, n2), h.next_out = s2, h.avail_out = u - s2, s2 && c.arraySet(h.output, h.output, n2, s2, 0), this.onData(a2)) : this.onData(c.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
              } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
              return r2 === m.Z_STREAM_END && (i2 = m.Z_FINISH), i2 === m.Z_FINISH ? (r2 = d.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : i2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
            }, a.prototype.onData = function(t2) {
              this.chunks.push(t2);
            }, a.prototype.onEnd = function(t2) {
              t2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = c.flattenChunks(this.chunks)), this.chunks = [], this.err = t2, this.msg = this.strm.msg;
            }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(t2, e2) {
              return (e2 = e2 || {}).raw = true, o(t2, e2);
            }, r.ungzip = o;
          }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(t, e, r) {
            var i = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
            r.assign = function(t2) {
              for (var e2 = Array.prototype.slice.call(arguments, 1); e2.length; ) {
                var r2 = e2.shift();
                if (r2) {
                  if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
                  for (var i2 in r2) r2.hasOwnProperty(i2) && (t2[i2] = r2[i2]);
                }
              }
              return t2;
            }, r.shrinkBuf = function(t2, e2) {
              return t2.length === e2 ? t2 : t2.subarray ? t2.subarray(0, e2) : (t2.length = e2, t2);
            };
            var n = { arraySet: function(t2, e2, r2, i2, n2) {
              if (e2.subarray && t2.subarray) t2.set(e2.subarray(r2, r2 + i2), n2);
              else for (var s2 = 0; i2 > s2; s2++) t2[n2 + s2] = e2[r2 + s2];
            }, flattenChunks: function(t2) {
              var e2, r2, i2, n2, s2, a;
              for (e2 = i2 = 0, r2 = t2.length; r2 > e2; e2++) i2 += t2[e2].length;
              for (a = new Uint8Array(i2), e2 = n2 = 0, r2 = t2.length; r2 > e2; e2++) s2 = t2[e2], a.set(s2, n2), n2 += s2.length;
              return a;
            } }, s = { arraySet: function(t2, e2, r2, i2, n2) {
              for (var s2 = 0; i2 > s2; s2++) t2[n2 + s2] = e2[r2 + s2];
            }, flattenChunks: function(t2) {
              return [].concat.apply([], t2);
            } };
            r.setTyped = function(t2) {
              t2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, n)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
            }, r.setTyped(i);
          }, {}], 42: [function(t, e, r) {
            function l(t2, e2) {
              if (65537 > e2 && (t2.subarray && s || !t2.subarray && n)) return String.fromCharCode.apply(null, h.shrinkBuf(t2, e2));
              for (var r2 = "", i2 = 0; e2 > i2; i2++) r2 += String.fromCharCode(t2[i2]);
              return r2;
            }
            var h = t("./common"), n = true, s = true;
            try {
              String.fromCharCode.apply(null, [0]);
            } catch (t2) {
              n = false;
            }
            try {
              String.fromCharCode.apply(null, new Uint8Array(1));
            } catch (t2) {
              s = false;
            }
            for (var u = new h.Buf8(256), i = 0; 256 > i; i++) u[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
            u[254] = u[254] = 1, r.string2buf = function(t2) {
              var e2, r2, i2, n2, s2, a = t2.length, o = 0;
              for (n2 = 0; a > n2; n2++) 55296 == (64512 & (r2 = t2.charCodeAt(n2))) && a > n2 + 1 && 56320 == (64512 & (i2 = t2.charCodeAt(n2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (i2 - 56320), n2++), o += 128 > r2 ? 1 : 2048 > r2 ? 2 : 65536 > r2 ? 3 : 4;
              for (e2 = new h.Buf8(o), n2 = s2 = 0; o > s2; n2++) 55296 == (64512 & (r2 = t2.charCodeAt(n2))) && a > n2 + 1 && 56320 == (64512 & (i2 = t2.charCodeAt(n2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (i2 - 56320), n2++), 128 > r2 ? e2[s2++] = r2 : (2048 > r2 ? e2[s2++] = 192 | r2 >>> 6 : (65536 > r2 ? e2[s2++] = 224 | r2 >>> 12 : (e2[s2++] = 240 | r2 >>> 18, e2[s2++] = 128 | r2 >>> 12 & 63), e2[s2++] = 128 | r2 >>> 6 & 63), e2[s2++] = 128 | 63 & r2);
              return e2;
            }, r.buf2binstring = function(t2) {
              return l(t2, t2.length);
            }, r.binstring2buf = function(t2) {
              for (var e2 = new h.Buf8(t2.length), r2 = 0, i2 = e2.length; i2 > r2; r2++) e2[r2] = t2.charCodeAt(r2);
              return e2;
            }, r.buf2string = function(t2, e2) {
              var r2, i2, n2, s2, a = e2 || t2.length, o = new Array(2 * a);
              for (r2 = i2 = 0; a > r2; ) if ((n2 = t2[r2++]) < 128) o[i2++] = n2;
              else if (4 < (s2 = u[n2])) o[i2++] = 65533, r2 += s2 - 1;
              else {
                for (n2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; s2 > 1 && a > r2; ) n2 = n2 << 6 | 63 & t2[r2++], s2--;
                s2 > 1 ? o[i2++] = 65533 : 65536 > n2 ? o[i2++] = n2 : (n2 -= 65536, o[i2++] = 55296 | n2 >> 10 & 1023, o[i2++] = 56320 | 1023 & n2);
              }
              return l(o, i2);
            }, r.utf8border = function(t2, e2) {
              var r2;
              for ((e2 = e2 || t2.length) > t2.length && (e2 = t2.length), r2 = e2 - 1; r2 >= 0 && 128 == (192 & t2[r2]); ) r2--;
              return 0 > r2 ? e2 : 0 === r2 ? e2 : r2 + u[t2[r2]] > e2 ? r2 : e2;
            };
          }, { "./common": 41 }], 43: [function(t, e, r) {
            e.exports = function(t2, e2, r2, i) {
              for (var n = 65535 & t2 | 0, s = t2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
                for (r2 -= a = r2 > 2e3 ? 2e3 : r2; s = s + (n = n + e2[i++] | 0) | 0, --a; ) ;
                n %= 65521, s %= 65521;
              }
              return n | s << 16 | 0;
            };
          }, {}], 44: [function(t, e, r) {
            e.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
          }, {}], 45: [function(t, e, r) {
            var o = function() {
              for (var t2, e2 = [], r2 = 0; 256 > r2; r2++) {
                t2 = r2;
                for (var i = 0; 8 > i; i++) t2 = 1 & t2 ? 3988292384 ^ t2 >>> 1 : t2 >>> 1;
                e2[r2] = t2;
              }
              return e2;
            }();
            e.exports = function(t2, e2, r2, i) {
              var n = o, s = i + r2;
              t2 ^= -1;
              for (var a = i; s > a; a++) t2 = t2 >>> 8 ^ n[255 & (t2 ^ e2[a])];
              return -1 ^ t2;
            };
          }, {}], 46: [function(t, e, r) {
            function R(t2, e2) {
              return t2.msg = i[e2], e2;
            }
            function T(t2) {
              return (t2 << 1) - (t2 > 4 ? 9 : 0);
            }
            function D(t2) {
              for (var e2 = t2.length; 0 <= --e2; ) t2[e2] = 0;
            }
            function F(t2) {
              var e2 = t2.state, r2 = e2.pending;
              r2 > t2.avail_out && (r2 = t2.avail_out), 0 !== r2 && (d.arraySet(t2.output, e2.pending_buf, e2.pending_out, r2, t2.next_out), t2.next_out += r2, e2.pending_out += r2, t2.total_out += r2, t2.avail_out -= r2, e2.pending -= r2, 0 === e2.pending && (e2.pending_out = 0));
            }
            function N(t2, e2) {
              u._tr_flush_block(t2, 0 <= t2.block_start ? t2.block_start : -1, t2.strstart - t2.block_start, e2), t2.block_start = t2.strstart, F(t2.strm);
            }
            function U(t2, e2) {
              t2.pending_buf[t2.pending++] = e2;
            }
            function P(t2, e2) {
              t2.pending_buf[t2.pending++] = e2 >>> 8 & 255, t2.pending_buf[t2.pending++] = 255 & e2;
            }
            function L(t2, e2) {
              var r2, i2, n2 = t2.max_chain_length, s2 = t2.strstart, a2 = t2.prev_length, o2 = t2.nice_match, h2 = t2.strstart > t2.w_size - z ? t2.strstart - (t2.w_size - z) : 0, u2 = t2.window, l2 = t2.w_mask, f2 = t2.prev, d2 = t2.strstart + S, c2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              t2.prev_length >= t2.good_match && (n2 >>= 2), o2 > t2.lookahead && (o2 = t2.lookahead);
              do
                if (u2[(r2 = e2) + a2] === p2 && u2[r2 + a2 - 1] === c2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
                  s2 += 2, r2++;
                  do
                    ;
                  while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && d2 > s2);
                  if (i2 = S - (d2 - s2), s2 = d2 - S, i2 > a2) {
                    if (t2.match_start = e2, o2 <= (a2 = i2)) break;
                    c2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
                  }
                }
              while ((e2 = f2[e2 & l2]) > h2 && 0 != --n2);
              return a2 <= t2.lookahead ? a2 : t2.lookahead;
            }
            function j(t2) {
              var e2, r2, i2, n2, s2, a2, o2, h2, u2, l2, f2 = t2.w_size;
              do {
                if (n2 = t2.window_size - t2.lookahead - t2.strstart, t2.strstart >= f2 + (f2 - z)) {
                  for (d.arraySet(t2.window, t2.window, f2, f2, 0), t2.match_start -= f2, t2.strstart -= f2, t2.block_start -= f2, e2 = r2 = t2.hash_size; i2 = t2.head[--e2], t2.head[e2] = i2 >= f2 ? i2 - f2 : 0, --r2; ) ;
                  for (e2 = r2 = f2; i2 = t2.prev[--e2], t2.prev[e2] = i2 >= f2 ? i2 - f2 : 0, --r2; ) ;
                  n2 += f2;
                }
                if (0 === t2.strm.avail_in) break;
                if (a2 = t2.strm, o2 = t2.window, h2 = t2.strstart + t2.lookahead, u2 = n2, l2 = void 0, l2 = a2.avail_in, l2 > u2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, d.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = c(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), t2.lookahead += r2, t2.lookahead + t2.insert >= x) for (s2 = t2.strstart - t2.insert, t2.ins_h = t2.window[s2], t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[s2 + 1]) & t2.hash_mask; t2.insert && (t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[s2 + x - 1]) & t2.hash_mask, t2.prev[s2 & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = s2, s2++, t2.insert--, !(t2.lookahead + t2.insert < x)); ) ;
              } while (t2.lookahead < z && 0 !== t2.strm.avail_in);
            }
            function Z(t2, e2) {
              for (var r2, i2; ; ) {
                if (t2.lookahead < z) {
                  if (j(t2), t2.lookahead < z && e2 === l) return A;
                  if (0 === t2.lookahead) break;
                }
                if (r2 = 0, t2.lookahead >= x && (t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[t2.strstart + x - 1]) & t2.hash_mask, r2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart), 0 !== r2 && t2.strstart - r2 <= t2.w_size - z && (t2.match_length = L(t2, r2)), t2.match_length >= x) if (i2 = u._tr_tally(t2, t2.strstart - t2.match_start, t2.match_length - x), t2.lookahead -= t2.match_length, t2.match_length <= t2.max_lazy_match && t2.lookahead >= x) {
                  for (t2.match_length--; t2.strstart++, t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[t2.strstart + x - 1]) & t2.hash_mask, r2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart, 0 != --t2.match_length; ) ;
                  t2.strstart++;
                } else t2.strstart += t2.match_length, t2.match_length = 0, t2.ins_h = t2.window[t2.strstart], t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[t2.strstart + 1]) & t2.hash_mask;
                else i2 = u._tr_tally(t2, 0, t2.window[t2.strstart]), t2.lookahead--, t2.strstart++;
                if (i2 && (N(t2, false), 0 === t2.strm.avail_out)) return A;
              }
              return t2.insert = t2.strstart < x - 1 ? t2.strstart : x - 1, e2 === f ? (N(t2, true), 0 === t2.strm.avail_out ? O : B) : t2.last_lit && (N(t2, false), 0 === t2.strm.avail_out) ? A : I;
            }
            function W(t2, e2) {
              for (var r2, i2, n2; ; ) {
                if (t2.lookahead < z) {
                  if (j(t2), t2.lookahead < z && e2 === l) return A;
                  if (0 === t2.lookahead) break;
                }
                if (r2 = 0, t2.lookahead >= x && (t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[t2.strstart + x - 1]) & t2.hash_mask, r2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart), t2.prev_length = t2.match_length, t2.prev_match = t2.match_start, t2.match_length = x - 1, 0 !== r2 && t2.prev_length < t2.max_lazy_match && t2.strstart - r2 <= t2.w_size - z && (t2.match_length = L(t2, r2), t2.match_length <= 5 && (1 === t2.strategy || t2.match_length === x && 4096 < t2.strstart - t2.match_start) && (t2.match_length = x - 1)), t2.prev_length >= x && t2.match_length <= t2.prev_length) {
                  for (n2 = t2.strstart + t2.lookahead - x, i2 = u._tr_tally(t2, t2.strstart - 1 - t2.prev_match, t2.prev_length - x), t2.lookahead -= t2.prev_length - 1, t2.prev_length -= 2; ++t2.strstart <= n2 && (t2.ins_h = (t2.ins_h << t2.hash_shift ^ t2.window[t2.strstart + x - 1]) & t2.hash_mask, r2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart), 0 != --t2.prev_length; ) ;
                  if (t2.match_available = 0, t2.match_length = x - 1, t2.strstart++, i2 && (N(t2, false), 0 === t2.strm.avail_out)) return A;
                } else if (t2.match_available) {
                  if ((i2 = u._tr_tally(t2, 0, t2.window[t2.strstart - 1])) && N(t2, false), t2.strstart++, t2.lookahead--, 0 === t2.strm.avail_out) return A;
                } else t2.match_available = 1, t2.strstart++, t2.lookahead--;
              }
              return t2.match_available && (i2 = u._tr_tally(t2, 0, t2.window[t2.strstart - 1]), t2.match_available = 0), t2.insert = t2.strstart < x - 1 ? t2.strstart : x - 1, e2 === f ? (N(t2, true), 0 === t2.strm.avail_out ? O : B) : t2.last_lit && (N(t2, false), 0 === t2.strm.avail_out) ? A : I;
            }
            function M(t2, e2, r2, i2, n2) {
              this.good_length = t2, this.max_lazy = e2, this.nice_length = r2, this.max_chain = i2, this.func = n2;
            }
            function H() {
              this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new d.Buf16(2 * w), this.dyn_dtree = new d.Buf16(2 * (2 * a + 1)), this.bl_tree = new d.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new d.Buf16(k + 1), this.heap = new d.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new d.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
            }
            function G(t2) {
              var e2;
              return t2 && t2.state ? (t2.total_in = t2.total_out = 0, t2.data_type = n, (e2 = t2.state).pending = 0, e2.pending_out = 0, e2.wrap < 0 && (e2.wrap = -e2.wrap), e2.status = e2.wrap ? C : E, t2.adler = 2 === e2.wrap ? 0 : 1, e2.last_flush = l, u._tr_init(e2), m) : R(t2, _);
            }
            function K(t2) {
              var e2 = G(t2);
              return e2 === m && function(t3) {
                t3.window_size = 2 * t3.w_size, D(t3.head), t3.max_lazy_match = h[t3.level].max_lazy, t3.good_match = h[t3.level].good_length, t3.nice_match = h[t3.level].nice_length, t3.max_chain_length = h[t3.level].max_chain, t3.strstart = 0, t3.block_start = 0, t3.lookahead = 0, t3.insert = 0, t3.match_length = t3.prev_length = x - 1, t3.match_available = 0, t3.ins_h = 0;
              }(t2.state), e2;
            }
            function Y(t2, e2, r2, i2, n2, s2) {
              if (!t2) return _;
              var a2 = 1;
              if (e2 === g && (e2 = 6), 0 > i2 ? (a2 = 0, i2 = -i2) : i2 > 15 && (a2 = 2, i2 -= 16), 1 > n2 || n2 > y || r2 !== v || 8 > i2 || i2 > 15 || 0 > e2 || e2 > 9 || 0 > s2 || s2 > b) return R(t2, _);
              8 === i2 && (i2 = 9);
              var o2 = new H();
              return (t2.state = o2).strm = t2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = i2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = n2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new d.Buf8(2 * o2.w_size), o2.head = new d.Buf16(o2.hash_size), o2.prev = new d.Buf16(o2.w_size), o2.lit_bufsize = 1 << n2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new d.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = e2, o2.strategy = s2, o2.method = r2, K(t2);
            }
            var h, d = t("../utils/common"), u = t("./trees"), c = t("./adler32"), p = t("./crc32"), i = t("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, n = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
            h = [new M(0, 0, 0, 0, function(t2, e2) {
              var r2 = 65535;
              for (r2 > t2.pending_buf_size - 5 && (r2 = t2.pending_buf_size - 5); ; ) {
                if (t2.lookahead <= 1) {
                  if (j(t2), 0 === t2.lookahead && e2 === l) return A;
                  if (0 === t2.lookahead) break;
                }
                t2.strstart += t2.lookahead, t2.lookahead = 0;
                var i2 = t2.block_start + r2;
                if ((0 === t2.strstart || t2.strstart >= i2) && (t2.lookahead = t2.strstart - i2, t2.strstart = i2, N(t2, false), 0 === t2.strm.avail_out)) return A;
                if (t2.strstart - t2.block_start >= t2.w_size - z && (N(t2, false), 0 === t2.strm.avail_out)) return A;
              }
              return t2.insert = 0, e2 === f ? (N(t2, true), 0 === t2.strm.avail_out ? O : B) : (t2.strstart > t2.block_start && (N(t2, false), t2.strm.avail_out), A);
            }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(t2, e2) {
              return Y(t2, e2, v, 15, 8, 0);
            }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(t2, e2) {
              return t2 && t2.state ? 2 !== t2.state.wrap ? _ : (t2.state.gzhead = e2, m) : _;
            }, r.deflate = function(t2, e2) {
              var r2, i2, n2, s2;
              if (!t2 || !t2.state || e2 > 5 || 0 > e2) return t2 ? R(t2, _) : _;
              if (i2 = t2.state, !t2.output || !t2.input && 0 !== t2.avail_in || 666 === i2.status && e2 !== f) return R(t2, 0 === t2.avail_out ? -5 : _);
              if (i2.strm = t2, r2 = i2.last_flush, i2.last_flush = e2, i2.status === C) if (2 === i2.wrap) t2.adler = 0, U(i2, 31), U(i2, 139), U(i2, 8), i2.gzhead ? (U(i2, (i2.gzhead.text ? 1 : 0) + (i2.gzhead.hcrc ? 2 : 0) + (i2.gzhead.extra ? 4 : 0) + (i2.gzhead.name ? 8 : 0) + (i2.gzhead.comment ? 16 : 0)), U(i2, 255 & i2.gzhead.time), U(i2, i2.gzhead.time >> 8 & 255), U(i2, i2.gzhead.time >> 16 & 255), U(i2, i2.gzhead.time >> 24 & 255), U(i2, 9 === i2.level ? 2 : 2 <= i2.strategy || i2.level < 2 ? 4 : 0), U(i2, 255 & i2.gzhead.os), i2.gzhead.extra && i2.gzhead.extra.length && (U(i2, 255 & i2.gzhead.extra.length), U(i2, i2.gzhead.extra.length >> 8 & 255)), i2.gzhead.hcrc && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending, 0)), i2.gzindex = 0, i2.status = 69) : (U(i2, 0), U(i2, 0), U(i2, 0), U(i2, 0), U(i2, 0), U(i2, 9 === i2.level ? 2 : 2 <= i2.strategy || i2.level < 2 ? 4 : 0), U(i2, 3), i2.status = E);
              else {
                var a2 = v + (i2.w_bits - 8 << 4) << 8;
                a2 |= (2 <= i2.strategy || i2.level < 2 ? 0 : i2.level < 6 ? 1 : 6 === i2.level ? 2 : 3) << 6, 0 !== i2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, i2.status = E, P(i2, a2), 0 !== i2.strstart && (P(i2, t2.adler >>> 16), P(i2, 65535 & t2.adler)), t2.adler = 1;
              }
              if (69 === i2.status) if (i2.gzhead.extra) {
                for (n2 = i2.pending; i2.gzindex < (65535 & i2.gzhead.extra.length) && (i2.pending !== i2.pending_buf_size || (i2.gzhead.hcrc && i2.pending > n2 && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending - n2, n2)), F(t2), n2 = i2.pending, i2.pending !== i2.pending_buf_size)); ) U(i2, 255 & i2.gzhead.extra[i2.gzindex]), i2.gzindex++;
                i2.gzhead.hcrc && i2.pending > n2 && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending - n2, n2)), i2.gzindex === i2.gzhead.extra.length && (i2.gzindex = 0, i2.status = 73);
              } else i2.status = 73;
              if (73 === i2.status) if (i2.gzhead.name) {
                n2 = i2.pending;
                do {
                  if (i2.pending === i2.pending_buf_size && (i2.gzhead.hcrc && i2.pending > n2 && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending - n2, n2)), F(t2), n2 = i2.pending, i2.pending === i2.pending_buf_size)) {
                    s2 = 1;
                    break;
                  }
                  s2 = i2.gzindex < i2.gzhead.name.length ? 255 & i2.gzhead.name.charCodeAt(i2.gzindex++) : 0, U(i2, s2);
                } while (0 !== s2);
                i2.gzhead.hcrc && i2.pending > n2 && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending - n2, n2)), 0 === s2 && (i2.gzindex = 0, i2.status = 91);
              } else i2.status = 91;
              if (91 === i2.status) if (i2.gzhead.comment) {
                n2 = i2.pending;
                do {
                  if (i2.pending === i2.pending_buf_size && (i2.gzhead.hcrc && i2.pending > n2 && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending - n2, n2)), F(t2), n2 = i2.pending, i2.pending === i2.pending_buf_size)) {
                    s2 = 1;
                    break;
                  }
                  s2 = i2.gzindex < i2.gzhead.comment.length ? 255 & i2.gzhead.comment.charCodeAt(i2.gzindex++) : 0, U(i2, s2);
                } while (0 !== s2);
                i2.gzhead.hcrc && i2.pending > n2 && (t2.adler = p(t2.adler, i2.pending_buf, i2.pending - n2, n2)), 0 === s2 && (i2.status = 103);
              } else i2.status = 103;
              if (103 === i2.status && (i2.gzhead.hcrc ? (i2.pending + 2 > i2.pending_buf_size && F(t2), i2.pending + 2 <= i2.pending_buf_size && (U(i2, 255 & t2.adler), U(i2, t2.adler >> 8 & 255), t2.adler = 0, i2.status = E)) : i2.status = E), 0 !== i2.pending) {
                if (F(t2), 0 === t2.avail_out) return i2.last_flush = -1, m;
              } else if (0 === t2.avail_in && T(e2) <= T(r2) && e2 !== f) return R(t2, -5);
              if (666 === i2.status && 0 !== t2.avail_in) return R(t2, -5);
              if (0 !== t2.avail_in || 0 !== i2.lookahead || e2 !== l && 666 !== i2.status) {
                var o2 = 2 === i2.strategy ? function(t3, e3) {
                  for (var r3; ; ) {
                    if (0 === t3.lookahead && (j(t3), 0 === t3.lookahead)) {
                      if (e3 === l) return A;
                      break;
                    }
                    if (t3.match_length = 0, r3 = u._tr_tally(t3, 0, t3.window[t3.strstart]), t3.lookahead--, t3.strstart++, r3 && (N(t3, false), 0 === t3.strm.avail_out)) return A;
                  }
                  return t3.insert = 0, e3 === f ? (N(t3, true), 0 === t3.strm.avail_out ? O : B) : t3.last_lit && (N(t3, false), 0 === t3.strm.avail_out) ? A : I;
                }(i2, e2) : 3 === i2.strategy ? function(t3, e3) {
                  for (var r3, i3, n3, s3, a3 = t3.window; ; ) {
                    if (t3.lookahead <= S) {
                      if (j(t3), t3.lookahead <= S && e3 === l) return A;
                      if (0 === t3.lookahead) break;
                    }
                    if (t3.match_length = 0, t3.lookahead >= x && 0 < t3.strstart && (i3 = a3[n3 = t3.strstart - 1]) === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3]) {
                      s3 = t3.strstart + S;
                      do
                        ;
                      while (i3 === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3] && i3 === a3[++n3] && s3 > n3);
                      t3.match_length = S - (s3 - n3), t3.match_length > t3.lookahead && (t3.match_length = t3.lookahead);
                    }
                    if (t3.match_length >= x ? (r3 = u._tr_tally(t3, 1, t3.match_length - x), t3.lookahead -= t3.match_length, t3.strstart += t3.match_length, t3.match_length = 0) : (r3 = u._tr_tally(t3, 0, t3.window[t3.strstart]), t3.lookahead--, t3.strstart++), r3 && (N(t3, false), 0 === t3.strm.avail_out)) return A;
                  }
                  return t3.insert = 0, e3 === f ? (N(t3, true), 0 === t3.strm.avail_out ? O : B) : t3.last_lit && (N(t3, false), 0 === t3.strm.avail_out) ? A : I;
                }(i2, e2) : h[i2.level].func(i2, e2);
                if (o2 !== O && o2 !== B || (i2.status = 666), o2 === A || o2 === O) return 0 === t2.avail_out && (i2.last_flush = -1), m;
                if (o2 === I && (1 === e2 ? u._tr_align(i2) : 5 !== e2 && (u._tr_stored_block(i2, 0, 0, false), 3 === e2 && (D(i2.head), 0 === i2.lookahead && (i2.strstart = 0, i2.block_start = 0, i2.insert = 0))), F(t2), 0 === t2.avail_out)) return i2.last_flush = -1, m;
              }
              return e2 !== f ? m : i2.wrap <= 0 ? 1 : (2 === i2.wrap ? (U(i2, 255 & t2.adler), U(i2, t2.adler >> 8 & 255), U(i2, t2.adler >> 16 & 255), U(i2, t2.adler >> 24 & 255), U(i2, 255 & t2.total_in), U(i2, t2.total_in >> 8 & 255), U(i2, t2.total_in >> 16 & 255), U(i2, t2.total_in >> 24 & 255)) : (P(i2, t2.adler >>> 16), P(i2, 65535 & t2.adler)), F(t2), 0 < i2.wrap && (i2.wrap = -i2.wrap), 0 !== i2.pending ? m : 1);
            }, r.deflateEnd = function(t2) {
              var e2;
              return t2 && t2.state ? (e2 = t2.state.status) !== C && 69 !== e2 && 73 !== e2 && 91 !== e2 && 103 !== e2 && e2 !== E && 666 !== e2 ? R(t2, _) : (t2.state = null, e2 === E ? R(t2, -3) : m) : _;
            }, r.deflateSetDictionary = function(t2, e2) {
              var r2, i2, n2, s2, a2, o2, h2, u2, l2 = e2.length;
              if (!t2 || !t2.state) return _;
              if (2 === (s2 = (r2 = t2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
              for (1 === s2 && (t2.adler = c(t2.adler, e2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new d.Buf8(r2.w_size), d.arraySet(u2, e2, l2 - r2.w_size, r2.w_size, 0), e2 = u2, l2 = r2.w_size), a2 = t2.avail_in, o2 = t2.next_in, h2 = t2.input, t2.avail_in = l2, t2.next_in = 0, t2.input = e2, j(r2); r2.lookahead >= x; ) {
                for (i2 = r2.strstart, n2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[i2 + x - 1]) & r2.hash_mask, r2.prev[i2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = i2, i2++, --n2; ) ;
                r2.strstart = i2, r2.lookahead = x - 1, j(r2);
              }
              return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, t2.next_in = o2, t2.input = h2, t2.avail_in = a2, r2.wrap = s2, m;
            }, r.deflateInfo = "pako deflate (from Nodeca project)";
          }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(t, e, r) {
            e.exports = function() {
              this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
            };
          }, {}], 48: [function(t, e, r) {
            e.exports = function(t2, e2) {
              var r2, i, n, s, a, o, h, u, l, f, d, c, p, m, _, g, b, v, y, w, k, x, S, z, C;
              r2 = t2.state, i = t2.next_in, z = t2.input, n = i + (t2.avail_in - 5), s = t2.next_out, C = t2.output, a = s - (e2 - t2.avail_out), o = s + (t2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, d = r2.window, c = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
              t: do {
                15 > p && (c += z[i++] << p, p += 8, c += z[i++] << p, p += 8), v = m[c & g];
                e: for (; ; ) {
                  if (c >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
                  else {
                    if (!(16 & y)) {
                      if (0 == (64 & y)) {
                        v = m[(65535 & v) + (c & (1 << y) - 1)];
                        continue e;
                      }
                      if (32 & y) {
                        r2.mode = 12;
                        break t;
                      }
                      t2.msg = "invalid literal/length code", r2.mode = 30;
                      break t;
                    }
                    w = 65535 & v, (y &= 15) && (y > p && (c += z[i++] << p, p += 8), w += c & (1 << y) - 1, c >>>= y, p -= y), 15 > p && (c += z[i++] << p, p += 8, c += z[i++] << p, p += 8), v = _[c & b];
                    r: for (; ; ) {
                      if (c >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                        if (0 == (64 & y)) {
                          v = _[(65535 & v) + (c & (1 << y) - 1)];
                          continue r;
                        }
                        t2.msg = "invalid distance code", r2.mode = 30;
                        break t;
                      }
                      if (k = 65535 & v, p < (y &= 15) && (c += z[i++] << p, (p += 8) < y && (c += z[i++] << p, p += 8)), h < (k += c & (1 << y) - 1)) {
                        t2.msg = "invalid distance too far back", r2.mode = 30;
                        break t;
                      }
                      if (c >>>= y, p -= y, (y = s - a) < k) {
                        if (l < (y = k - y) && r2.sane) {
                          t2.msg = "invalid distance too far back", r2.mode = 30;
                          break t;
                        }
                        if (S = d, (x = 0) === f) {
                          if (x += u - y, w > y) {
                            for (w -= y; C[s++] = d[x++], --y; ) ;
                            x = s - k, S = C;
                          }
                        } else if (y > f) {
                          if (x += u + f - y, (y -= f) < w) {
                            for (w -= y; C[s++] = d[x++], --y; ) ;
                            if (x = 0, w > f) {
                              for (w -= y = f; C[s++] = d[x++], --y; ) ;
                              x = s - k, S = C;
                            }
                          }
                        } else if (x += f - y, w > y) {
                          for (w -= y; C[s++] = d[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                        for (; w > 2; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                        w && (C[s++] = S[x++], w > 1 && (C[s++] = S[x++]));
                      } else {
                        for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                        w && (C[s++] = C[x++], w > 1 && (C[s++] = C[x++]));
                      }
                      break;
                    }
                  }
                  break;
                }
              } while (n > i && o > s);
              i -= w = p >> 3, c &= (1 << (p -= w << 3)) - 1, t2.next_in = i, t2.next_out = s, t2.avail_in = n > i ? n - i + 5 : 5 - (i - n), t2.avail_out = o > s ? o - s + 257 : 257 - (s - o), r2.hold = c, r2.bits = p;
            };
          }, {}], 49: [function(t, e, r) {
            function L(t2) {
              return (t2 >>> 24 & 255) + (t2 >>> 8 & 65280) + ((65280 & t2) << 8) + ((255 & t2) << 24);
            }
            function s() {
              this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
            }
            function a(t2) {
              var e2;
              return t2 && t2.state ? (e2 = t2.state, t2.total_in = t2.total_out = e2.total = 0, t2.msg = "", e2.wrap && (t2.adler = 1 & e2.wrap), e2.mode = P, e2.last = 0, e2.havedict = 0, e2.dmax = 32768, e2.head = null, e2.hold = 0, e2.bits = 0, e2.lencode = e2.lendyn = new I.Buf32(i), e2.distcode = e2.distdyn = new I.Buf32(n), e2.sane = 1, e2.back = -1, N) : U;
            }
            function o(t2) {
              var e2;
              return t2 && t2.state ? ((e2 = t2.state).wsize = 0, e2.whave = 0, e2.wnext = 0, a(t2)) : U;
            }
            function h(t2, e2) {
              var r2, i2;
              return t2 && t2.state ? (i2 = t2.state, 0 > e2 ? (r2 = 0, e2 = -e2) : (r2 = 1 + (e2 >> 4), 48 > e2 && (e2 &= 15)), e2 && (8 > e2 || e2 > 15) ? U : (null !== i2.window && i2.wbits !== e2 && (i2.window = null), i2.wrap = r2, i2.wbits = e2, o(t2))) : U;
            }
            function u(t2, e2) {
              var r2, i2;
              return t2 ? (i2 = new s(), (t2.state = i2).window = null, (r2 = h(t2, e2)) !== N && (t2.state = null), r2) : U;
            }
            function j(t2) {
              if (d) {
                var e2;
                for (l = new I.Buf32(512), f = new I.Buf32(32), e2 = 0; 144 > e2; ) t2.lens[e2++] = 8;
                for (; 256 > e2; ) t2.lens[e2++] = 9;
                for (; 280 > e2; ) t2.lens[e2++] = 7;
                for (; 288 > e2; ) t2.lens[e2++] = 8;
                for (T(D, t2.lens, 0, 288, l, 0, t2.work, { bits: 9 }), e2 = 0; 32 > e2; ) t2.lens[e2++] = 5;
                T(F, t2.lens, 0, 32, f, 0, t2.work, { bits: 5 }), d = false;
              }
              t2.lencode = l, t2.lenbits = 9, t2.distcode = f, t2.distbits = 5;
            }
            function Z(t2, e2, r2, i2) {
              var n2, s2 = t2.state;
              return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), i2 >= s2.wsize ? (I.arraySet(s2.window, e2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (i2 < (n2 = s2.wsize - s2.wnext) && (n2 = i2), I.arraySet(s2.window, e2, r2 - i2, n2, s2.wnext), (i2 -= n2) ? (I.arraySet(s2.window, e2, r2 - i2, i2, 0), s2.wnext = i2, s2.whave = s2.wsize) : (s2.wnext += n2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += n2))), 0;
            }
            var l, f, I = t("../utils/common"), O = t("./adler32"), B = t("./crc32"), R = t("./inffast"), T = t("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, i = 852, n = 592, d = true;
            r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(t2) {
              return u(t2, 15);
            }, r.inflateInit2 = u, r.inflate = function(t2, e2) {
              var r2, i2, n2, s2, a2, o2, h2, u2, l2, f2, d2, c, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
              if (!t2 || !t2.state || !t2.output || !t2.input && 0 !== t2.avail_in) return U;
              12 === (r2 = t2.state).mode && (r2.mode = 13), a2 = t2.next_out, n2 = t2.output, h2 = t2.avail_out, s2 = t2.next_in, i2 = t2.input, o2 = t2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, d2 = h2, x = N;
              t: for (; ; ) switch (r2.mode) {
                case P:
                  if (0 === r2.wrap) {
                    r2.mode = 13;
                    break;
                  }
                  for (; 16 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  if (2 & r2.wrap && 35615 === u2) {
                    E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                    break;
                  }
                  if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                    t2.msg = "incorrect header check", r2.mode = 30;
                    break;
                  }
                  if (8 != (15 & u2)) {
                    t2.msg = "unknown compression method", r2.mode = 30;
                    break;
                  }
                  if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
                  else if (k > r2.wbits) {
                    t2.msg = "invalid window size", r2.mode = 30;
                    break;
                  }
                  r2.dmax = 1 << k, t2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
                  break;
                case 2:
                  for (; 16 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  if (r2.flags = u2, 8 != (255 & r2.flags)) {
                    t2.msg = "unknown compression method", r2.mode = 30;
                    break;
                  }
                  if (57344 & r2.flags) {
                    t2.msg = "unknown header flags set", r2.mode = 30;
                    break;
                  }
                  r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
                case 3:
                  for (; 32 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
                case 4:
                  for (; 16 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
                case 5:
                  if (1024 & r2.flags) {
                    for (; 16 > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
                  } else r2.head && (r2.head.extra = null);
                  r2.mode = 6;
                case 6:
                  if (1024 & r2.flags && (o2 < (c = r2.length) && (c = o2), c && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, i2, s2, c, k)), 512 & r2.flags && (r2.check = B(r2.check, i2, c, s2)), o2 -= c, s2 += c, r2.length -= c), r2.length)) break t;
                  r2.length = 0, r2.mode = 7;
                case 7:
                  if (2048 & r2.flags) {
                    if (0 === o2) break t;
                    for (c = 0; k = i2[s2 + c++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && o2 > c; ) ;
                    if (512 & r2.flags && (r2.check = B(r2.check, i2, c, s2)), o2 -= c, s2 += c, k) break t;
                  } else r2.head && (r2.head.name = null);
                  r2.length = 0, r2.mode = 8;
                case 8:
                  if (4096 & r2.flags) {
                    if (0 === o2) break t;
                    for (c = 0; k = i2[s2 + c++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && o2 > c; ) ;
                    if (512 & r2.flags && (r2.check = B(r2.check, i2, c, s2)), o2 -= c, s2 += c, k) break t;
                  } else r2.head && (r2.head.comment = null);
                  r2.mode = 9;
                case 9:
                  if (512 & r2.flags) {
                    for (; 16 > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    if (u2 !== (65535 & r2.check)) {
                      t2.msg = "header crc mismatch", r2.mode = 30;
                      break;
                    }
                    l2 = u2 = 0;
                  }
                  r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), t2.adler = r2.check = 0, r2.mode = 12;
                  break;
                case 10:
                  for (; 32 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  t2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
                case 11:
                  if (0 === r2.havedict) return t2.next_out = a2, t2.avail_out = h2, t2.next_in = s2, t2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
                  t2.adler = r2.check = 1, r2.mode = 12;
                case 12:
                  if (5 === e2 || 6 === e2) break t;
                case 13:
                  if (r2.last) {
                    u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                    break;
                  }
                  for (; 3 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                    case 0:
                      r2.mode = 14;
                      break;
                    case 1:
                      if (j(r2), r2.mode = 20, 6 !== e2) break;
                      u2 >>>= 2, l2 -= 2;
                      break t;
                    case 2:
                      r2.mode = 17;
                      break;
                    case 3:
                      t2.msg = "invalid block type", r2.mode = 30;
                  }
                  u2 >>>= 2, l2 -= 2;
                  break;
                case 14:
                  for (u2 >>>= 7 & l2, l2 -= 7 & l2; 32 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                    t2.msg = "invalid stored block lengths", r2.mode = 30;
                    break;
                  }
                  if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === e2) break t;
                case 15:
                  r2.mode = 16;
                case 16:
                  if (c = r2.length) {
                    if (c > o2 && (c = o2), c > h2 && (c = h2), 0 === c) break t;
                    I.arraySet(n2, i2, s2, c, a2), o2 -= c, s2 += c, h2 -= c, a2 += c, r2.length -= c;
                    break;
                  }
                  r2.mode = 12;
                  break;
                case 17:
                  for (; 14 > l2; ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                    t2.msg = "too many length or distance symbols", r2.mode = 30;
                    break;
                  }
                  r2.have = 0, r2.mode = 18;
                case 18:
                  for (; r2.have < r2.ncode; ) {
                    for (; 3 > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
                  }
                  for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
                  if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                    t2.msg = "invalid code lengths set", r2.mode = 30;
                    break;
                  }
                  r2.have = 0, r2.mode = 19;
                case 19:
                  for (; r2.have < r2.nlen + r2.ndist; ) {
                    for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    if (16 > b) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                    else {
                      if (16 === b) {
                        for (z = _ + 2; z > l2; ) {
                          if (0 === o2) break t;
                          o2--, u2 += i2[s2++] << l2, l2 += 8;
                        }
                        if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                          t2.msg = "invalid bit length repeat", r2.mode = 30;
                          break;
                        }
                        k = r2.lens[r2.have - 1], c = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                      } else if (17 === b) {
                        for (z = _ + 3; z > l2; ) {
                          if (0 === o2) break t;
                          o2--, u2 += i2[s2++] << l2, l2 += 8;
                        }
                        l2 -= _, k = 0, c = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                      } else {
                        for (z = _ + 7; z > l2; ) {
                          if (0 === o2) break t;
                          o2--, u2 += i2[s2++] << l2, l2 += 8;
                        }
                        l2 -= _, k = 0, c = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                      }
                      if (r2.have + c > r2.nlen + r2.ndist) {
                        t2.msg = "invalid bit length repeat", r2.mode = 30;
                        break;
                      }
                      for (; c--; ) r2.lens[r2.have++] = k;
                    }
                  }
                  if (30 === r2.mode) break;
                  if (0 === r2.lens[256]) {
                    t2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                    break;
                  }
                  if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                    t2.msg = "invalid literal/lengths set", r2.mode = 30;
                    break;
                  }
                  if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                    t2.msg = "invalid distances set", r2.mode = 30;
                    break;
                  }
                  if (r2.mode = 20, 6 === e2) break t;
                case 20:
                  r2.mode = 21;
                case 21:
                  if (o2 >= 6 && h2 >= 258) {
                    t2.next_out = a2, t2.avail_out = h2, t2.next_in = s2, t2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(t2, d2), a2 = t2.next_out, n2 = t2.output, h2 = t2.avail_out, s2 = t2.next_in, i2 = t2.input, o2 = t2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                    break;
                  }
                  for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  if (g && 0 == (240 & g)) {
                    for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    u2 >>>= v, l2 -= v, r2.back += v;
                  }
                  if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                    r2.mode = 26;
                    break;
                  }
                  if (32 & g) {
                    r2.back = -1, r2.mode = 12;
                    break;
                  }
                  if (64 & g) {
                    t2.msg = "invalid literal/length code", r2.mode = 30;
                    break;
                  }
                  r2.extra = 15 & g, r2.mode = 22;
                case 22:
                  if (r2.extra) {
                    for (z = r2.extra; z > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                  }
                  r2.was = r2.length, r2.mode = 23;
                case 23:
                  for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break t;
                    o2--, u2 += i2[s2++] << l2, l2 += 8;
                  }
                  if (0 == (240 & g)) {
                    for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    u2 >>>= v, l2 -= v, r2.back += v;
                  }
                  if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                    t2.msg = "invalid distance code", r2.mode = 30;
                    break;
                  }
                  r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
                case 24:
                  if (r2.extra) {
                    for (z = r2.extra; z > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                  }
                  if (r2.offset > r2.dmax) {
                    t2.msg = "invalid distance too far back", r2.mode = 30;
                    break;
                  }
                  r2.mode = 25;
                case 25:
                  if (0 === h2) break t;
                  if (c = d2 - h2, r2.offset > c) {
                    if ((c = r2.offset - c) > r2.whave && r2.sane) {
                      t2.msg = "invalid distance too far back", r2.mode = 30;
                      break;
                    }
                    p = c > r2.wnext ? (c -= r2.wnext, r2.wsize - c) : r2.wnext - c, c > r2.length && (c = r2.length), m = r2.window;
                  } else m = n2, p = a2 - r2.offset, c = r2.length;
                  for (c > h2 && (c = h2), h2 -= c, r2.length -= c; n2[a2++] = m[p++], --c; ) ;
                  0 === r2.length && (r2.mode = 21);
                  break;
                case 26:
                  if (0 === h2) break t;
                  n2[a2++] = r2.length, h2--, r2.mode = 21;
                  break;
                case 27:
                  if (r2.wrap) {
                    for (; 32 > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 |= i2[s2++] << l2, l2 += 8;
                    }
                    if (d2 -= h2, t2.total_out += d2, r2.total += d2, d2 && (t2.adler = r2.check = r2.flags ? B(r2.check, n2, d2, a2 - d2) : O(r2.check, n2, d2, a2 - d2)), d2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                      t2.msg = "incorrect data check", r2.mode = 30;
                      break;
                    }
                    l2 = u2 = 0;
                  }
                  r2.mode = 28;
                case 28:
                  if (r2.wrap && r2.flags) {
                    for (; 32 > l2; ) {
                      if (0 === o2) break t;
                      o2--, u2 += i2[s2++] << l2, l2 += 8;
                    }
                    if (u2 !== (4294967295 & r2.total)) {
                      t2.msg = "incorrect length check", r2.mode = 30;
                      break;
                    }
                    l2 = u2 = 0;
                  }
                  r2.mode = 29;
                case 29:
                  x = 1;
                  break t;
                case 30:
                  x = -3;
                  break t;
                case 31:
                  return -4;
                case 32:
                default:
                  return U;
              }
              return t2.next_out = a2, t2.avail_out = h2, t2.next_in = s2, t2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || d2 !== t2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== e2)) && Z(t2, t2.output, t2.next_out, d2 - t2.avail_out) ? (r2.mode = 31, -4) : (f2 -= t2.avail_in, d2 -= t2.avail_out, t2.total_in += f2, t2.total_out += d2, r2.total += d2, r2.wrap && d2 && (t2.adler = r2.check = r2.flags ? B(r2.check, n2, d2, t2.next_out - d2) : O(r2.check, n2, d2, t2.next_out - d2)), t2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === d2 || 4 === e2) && x === N && (x = -5), x);
            }, r.inflateEnd = function(t2) {
              if (!t2 || !t2.state) return U;
              var e2 = t2.state;
              return e2.window && (e2.window = null), t2.state = null, N;
            }, r.inflateGetHeader = function(t2, e2) {
              var r2;
              return t2 && t2.state ? 0 == (2 & (r2 = t2.state).wrap) ? U : ((r2.head = e2).done = false, N) : U;
            }, r.inflateSetDictionary = function(t2, e2) {
              var r2, i2 = e2.length;
              return t2 && t2.state ? 0 !== (r2 = t2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, e2, i2, 0) !== r2.check ? -3 : Z(t2, e2, i2, i2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
            }, r.inflateInfo = "pako inflate (from Nodeca project)";
          }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(t, e, r) {
            var D = t("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
            e.exports = function(t2, e2, r2, i, n, s, a, o) {
              var h, u, l, f, d, c, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
              for (b = 0; 15 >= b; b++) O[b] = 0;
              for (v = 0; i > v; v++) O[e2[r2 + v]]++;
              for (k = g, w = 15; w >= 1 && 0 === O[w]; w--) ;
              if (k > w && (k = w), 0 === w) return n[s++] = 20971520, n[s++] = 20971520, o.bits = 1, 0;
              for (y = 1; w > y && 0 === O[y]; y++) ;
              for (y > k && (k = y), b = z = 1; 15 >= b; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
              if (z > 0 && (0 === t2 || 1 !== w)) return -1;
              for (B[1] = 0, b = 1; 15 > b; b++) B[b + 1] = B[b] + O[b];
              for (v = 0; i > v; v++) 0 !== e2[r2 + v] && (a[B[e2[r2 + v]]++] = v);
              if (c = 0 === t2 ? (A = R = a, 19) : 1 === t2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, d = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === t2 && C > 852 || 2 === t2 && C > 592) return 1;
              for (; ; ) {
                for (p = b - S, _ = a[v] < c ? (m = 0, a[v]) : a[v] > c ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; n[d + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
                for (h = 1 << b - 1; E & h; ) h >>= 1;
                if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
                  if (b === w) break;
                  b = e2[r2 + a[v]];
                }
                if (b > k && (E & f) !== l) {
                  for (0 === S && (S = k), d += y, z = 1 << (x = b - S); w > x + S && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
                  if (C += 1 << x, 1 === t2 && C > 852 || 2 === t2 && C > 592) return 1;
                  n[l = E & f] = k << 24 | x << 16 | d - s | 0;
                }
              }
              return 0 !== E && (n[d + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
            };
          }, { "../utils/common": 41 }], 51: [function(t, e, r) {
            e.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
          }, {}], 52: [function(t, e, r) {
            function i(t2) {
              for (var e2 = t2.length; 0 <= --e2; ) t2[e2] = 0;
            }
            function D(t2, e2, r2, i2, n2) {
              this.static_tree = t2, this.extra_bits = e2, this.extra_base = r2, this.elems = i2, this.max_length = n2, this.has_stree = t2 && t2.length;
            }
            function F(t2, e2) {
              this.dyn_tree = t2, this.max_code = 0, this.stat_desc = e2;
            }
            function N(t2) {
              return 256 > t2 ? E[t2] : E[256 + (t2 >>> 7)];
            }
            function U(t2, e2) {
              t2.pending_buf[t2.pending++] = 255 & e2, t2.pending_buf[t2.pending++] = e2 >>> 8 & 255;
            }
            function P(t2, e2, r2) {
              t2.bi_valid > c - r2 ? (t2.bi_buf |= e2 << t2.bi_valid & 65535, U(t2, t2.bi_buf), t2.bi_buf = e2 >> c - t2.bi_valid, t2.bi_valid += r2 - c) : (t2.bi_buf |= e2 << t2.bi_valid & 65535, t2.bi_valid += r2);
            }
            function L(t2, e2, r2) {
              P(t2, r2[2 * e2], r2[2 * e2 + 1]);
            }
            function j(t2, e2) {
              for (var r2 = 0; r2 |= 1 & t2, t2 >>>= 1, r2 <<= 1, 0 < --e2; ) ;
              return r2 >>> 1;
            }
            function Z(t2, e2, r2) {
              var i2, n2, s2 = new Array(g + 1), a2 = 0;
              for (i2 = 1; g >= i2; i2++) s2[i2] = a2 = a2 + r2[i2 - 1] << 1;
              for (n2 = 0; e2 >= n2; n2++) {
                var o2 = t2[2 * n2 + 1];
                0 !== o2 && (t2[2 * n2] = j(s2[o2]++, o2));
              }
            }
            function W(t2) {
              var e2;
              for (e2 = 0; l > e2; e2++) t2.dyn_ltree[2 * e2] = 0;
              for (e2 = 0; f > e2; e2++) t2.dyn_dtree[2 * e2] = 0;
              for (e2 = 0; d > e2; e2++) t2.bl_tree[2 * e2] = 0;
              t2.dyn_ltree[2 * m] = 1, t2.opt_len = t2.static_len = 0, t2.last_lit = t2.matches = 0;
            }
            function M(t2) {
              8 < t2.bi_valid ? U(t2, t2.bi_buf) : 0 < t2.bi_valid && (t2.pending_buf[t2.pending++] = t2.bi_buf), t2.bi_buf = 0, t2.bi_valid = 0;
            }
            function H(t2, e2, r2, i2) {
              var n2 = 2 * e2, s2 = 2 * r2;
              return t2[n2] < t2[s2] || t2[n2] === t2[s2] && i2[e2] <= i2[r2];
            }
            function G(t2, e2, r2) {
              for (var i2 = t2.heap[r2], n2 = r2 << 1; n2 <= t2.heap_len && (n2 < t2.heap_len && H(e2, t2.heap[n2 + 1], t2.heap[n2], t2.depth) && n2++, !H(e2, i2, t2.heap[n2], t2.depth)); ) t2.heap[r2] = t2.heap[n2], r2 = n2, n2 <<= 1;
              t2.heap[r2] = i2;
            }
            function K(t2, e2, r2) {
              var i2, n2, s2, a2, o2 = 0;
              if (0 !== t2.last_lit) for (; i2 = t2.pending_buf[t2.d_buf + 2 * o2] << 8 | t2.pending_buf[t2.d_buf + 2 * o2 + 1], n2 = t2.pending_buf[t2.l_buf + o2], o2++, 0 === i2 ? L(t2, n2, e2) : (L(t2, (s2 = A[n2]) + u + 1, e2), 0 !== (a2 = w[s2]) && P(t2, n2 -= I[s2], a2), L(t2, s2 = N(--i2), r2), 0 !== (a2 = k[s2]) && P(t2, i2 -= T[s2], a2)), o2 < t2.last_lit; ) ;
              L(t2, m, e2);
            }
            function Y(t2, e2) {
              var r2, i2, n2, s2 = e2.dyn_tree, a2 = e2.stat_desc.static_tree, o2 = e2.stat_desc.has_stree, h2 = e2.stat_desc.elems, u2 = -1;
              for (t2.heap_len = 0, t2.heap_max = _, r2 = 0; h2 > r2; r2++) 0 !== s2[2 * r2] ? (t2.heap[++t2.heap_len] = u2 = r2, t2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
              for (; t2.heap_len < 2; ) s2[2 * (n2 = t2.heap[++t2.heap_len] = 2 > u2 ? ++u2 : 0)] = 1, t2.depth[n2] = 0, t2.opt_len--, o2 && (t2.static_len -= a2[2 * n2 + 1]);
              for (e2.max_code = u2, r2 = t2.heap_len >> 1; r2 >= 1; r2--) G(t2, s2, r2);
              for (n2 = h2; r2 = t2.heap[1], t2.heap[1] = t2.heap[t2.heap_len--], G(t2, s2, 1), i2 = t2.heap[1], t2.heap[--t2.heap_max] = r2, t2.heap[--t2.heap_max] = i2, s2[2 * n2] = s2[2 * r2] + s2[2 * i2], t2.depth[n2] = (t2.depth[r2] >= t2.depth[i2] ? t2.depth[r2] : t2.depth[i2]) + 1, s2[2 * r2 + 1] = s2[2 * i2 + 1] = n2, t2.heap[1] = n2++, G(t2, s2, 1), 2 <= t2.heap_len; ) ;
              t2.heap[--t2.heap_max] = t2.heap[1], function(t3, e3) {
                var r3, i3, n3, s3, a3, o3, h3 = e3.dyn_tree, u3 = e3.max_code, l2 = e3.stat_desc.static_tree, f2 = e3.stat_desc.has_stree, d2 = e3.stat_desc.extra_bits, c2 = e3.stat_desc.extra_base, p2 = e3.stat_desc.max_length, m2 = 0;
                for (s3 = 0; g >= s3; s3++) t3.bl_count[s3] = 0;
                for (h3[2 * t3.heap[t3.heap_max] + 1] = 0, r3 = t3.heap_max + 1; _ > r3; r3++) p2 < (s3 = h3[2 * h3[2 * (i3 = t3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * i3 + 1] = s3, i3 > u3 || (t3.bl_count[s3]++, a3 = 0, i3 >= c2 && (a3 = d2[i3 - c2]), o3 = h3[2 * i3], t3.opt_len += o3 * (s3 + a3), f2 && (t3.static_len += o3 * (l2[2 * i3 + 1] + a3)));
                if (0 !== m2) {
                  do {
                    for (s3 = p2 - 1; 0 === t3.bl_count[s3]; ) s3--;
                    t3.bl_count[s3]--, t3.bl_count[s3 + 1] += 2, t3.bl_count[p2]--, m2 -= 2;
                  } while (m2 > 0);
                  for (s3 = p2; 0 !== s3; s3--) for (i3 = t3.bl_count[s3]; 0 !== i3; ) u3 < (n3 = t3.heap[--r3]) || (h3[2 * n3 + 1] !== s3 && (t3.opt_len += (s3 - h3[2 * n3 + 1]) * h3[2 * n3], h3[2 * n3 + 1] = s3), i3--);
                }
              }(t2, e2), Z(s2, u2, t2.bl_count);
            }
            function X(t2, e2, r2) {
              var i2, n2, s2 = -1, a2 = e2[1], o2 = 0, h2 = 7, u2 = 4;
              for (0 === a2 && (h2 = 138, u2 = 3), e2[2 * (r2 + 1) + 1] = 65535, i2 = 0; r2 >= i2; i2++) n2 = a2, a2 = e2[2 * (i2 + 1) + 1], ++o2 < h2 && n2 === a2 || (u2 > o2 ? t2.bl_tree[2 * n2] += o2 : 0 !== n2 ? (n2 !== s2 && t2.bl_tree[2 * n2]++, t2.bl_tree[2 * b]++) : 10 >= o2 ? t2.bl_tree[2 * v]++ : t2.bl_tree[2 * y]++, s2 = n2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : n2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
            }
            function V(t2, e2, r2) {
              var i2, n2, s2 = -1, a2 = e2[1], o2 = 0, h2 = 7, u2 = 4;
              for (0 === a2 && (h2 = 138, u2 = 3), i2 = 0; r2 >= i2; i2++) if (n2 = a2, a2 = e2[2 * (i2 + 1) + 1], !(++o2 < h2 && n2 === a2)) {
                if (u2 > o2) for (; L(t2, n2, t2.bl_tree), 0 != --o2; ) ;
                else 0 !== n2 ? (n2 !== s2 && (L(t2, n2, t2.bl_tree), o2--), L(t2, b, t2.bl_tree), P(t2, o2 - 3, 2)) : 10 >= o2 ? (L(t2, v, t2.bl_tree), P(t2, o2 - 3, 3)) : (L(t2, y, t2.bl_tree), P(t2, o2 - 11, 7));
                s2 = n2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : n2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
              }
            }
            function J(t2, e2, r2, i2) {
              P(t2, (s << 1) + (i2 ? 1 : 0), 3), function(t3, e3, r3, i3) {
                M(t3), U(t3, r3), U(t3, ~r3), n.arraySet(t3.pending_buf, t3.window, e3, r3, t3.pending), t3.pending += r3;
              }(t2, e2, r2);
            }
            var n = t("../utils/common"), o = 0, h = 1, s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, d = 19, _ = 2 * l + 1, g = 15, c = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
            i(z);
            var C = new Array(2 * f);
            i(C);
            var E = new Array(512);
            i(E);
            var A = new Array(256);
            i(A);
            var I = new Array(a);
            i(I);
            var O, B, R, T = new Array(f);
            i(T);
            var q = false;
            r._tr_init = function(t2) {
              q || (function() {
                var t3, e2, r2, i2, n2, s2 = new Array(g + 1);
                for (i2 = r2 = 0; a - 1 > i2; i2++) for (I[i2] = r2, t3 = 0; t3 < 1 << w[i2]; t3++) A[r2++] = i2;
                for (A[r2 - 1] = i2, i2 = n2 = 0; 16 > i2; i2++) for (T[i2] = n2, t3 = 0; t3 < 1 << k[i2]; t3++) E[n2++] = i2;
                for (n2 >>= 7; f > i2; i2++) for (T[i2] = n2 << 7, t3 = 0; t3 < 1 << k[i2] - 7; t3++) E[256 + n2++] = i2;
                for (e2 = 0; g >= e2; e2++) s2[e2] = 0;
                for (t3 = 0; 143 >= t3; ) z[2 * t3 + 1] = 8, t3++, s2[8]++;
                for (; 255 >= t3; ) z[2 * t3 + 1] = 9, t3++, s2[9]++;
                for (; 279 >= t3; ) z[2 * t3 + 1] = 7, t3++, s2[7]++;
                for (; 287 >= t3; ) z[2 * t3 + 1] = 8, t3++, s2[8]++;
                for (Z(z, l + 1, s2), t3 = 0; f > t3; t3++) C[2 * t3 + 1] = 5, C[2 * t3] = j(t3, 5);
                O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, d, p);
              }(), q = true), t2.l_desc = new F(t2.dyn_ltree, O), t2.d_desc = new F(t2.dyn_dtree, B), t2.bl_desc = new F(t2.bl_tree, R), t2.bi_buf = 0, t2.bi_valid = 0, W(t2);
            }, r._tr_stored_block = J, r._tr_flush_block = function(t2, e2, r2, i2) {
              var n2, s2, a2 = 0;
              0 < t2.level ? (2 === t2.strm.data_type && (t2.strm.data_type = function(t3) {
                var e3, r3 = 4093624447;
                for (e3 = 0; 31 >= e3; e3++, r3 >>>= 1) if (1 & r3 && 0 !== t3.dyn_ltree[2 * e3]) return o;
                if (0 !== t3.dyn_ltree[18] || 0 !== t3.dyn_ltree[20] || 0 !== t3.dyn_ltree[26]) return h;
                for (e3 = 32; u > e3; e3++) if (0 !== t3.dyn_ltree[2 * e3]) return h;
                return o;
              }(t2)), Y(t2, t2.l_desc), Y(t2, t2.d_desc), a2 = function(t3) {
                var e3;
                for (X(t3, t3.dyn_ltree, t3.l_desc.max_code), X(t3, t3.dyn_dtree, t3.d_desc.max_code), Y(t3, t3.bl_desc), e3 = d - 1; e3 >= 3 && 0 === t3.bl_tree[2 * S[e3] + 1]; e3--) ;
                return t3.opt_len += 3 * (e3 + 1) + 5 + 5 + 4, e3;
              }(t2), n2 = t2.opt_len + 3 + 7 >>> 3, (s2 = t2.static_len + 3 + 7 >>> 3) <= n2 && (n2 = s2)) : n2 = s2 = r2 + 5, n2 >= r2 + 4 && -1 !== e2 ? J(t2, e2, r2, i2) : 4 === t2.strategy || s2 === n2 ? (P(t2, 2 + (i2 ? 1 : 0), 3), K(t2, z, C)) : (P(t2, 4 + (i2 ? 1 : 0), 3), function(t3, e3, r3, i3) {
                var n3;
                for (P(t3, e3 - 257, 5), P(t3, r3 - 1, 5), P(t3, i3 - 4, 4), n3 = 0; i3 > n3; n3++) P(t3, t3.bl_tree[2 * S[n3] + 1], 3);
                V(t3, t3.dyn_ltree, e3 - 1), V(t3, t3.dyn_dtree, r3 - 1);
              }(t2, t2.l_desc.max_code + 1, t2.d_desc.max_code + 1, a2 + 1), K(t2, t2.dyn_ltree, t2.dyn_dtree)), W(t2), i2 && M(t2);
            }, r._tr_tally = function(t2, e2, r2) {
              return t2.pending_buf[t2.d_buf + 2 * t2.last_lit] = e2 >>> 8 & 255, t2.pending_buf[t2.d_buf + 2 * t2.last_lit + 1] = 255 & e2, t2.pending_buf[t2.l_buf + t2.last_lit] = 255 & r2, t2.last_lit++, 0 === e2 ? t2.dyn_ltree[2 * r2]++ : (t2.matches++, e2--, t2.dyn_ltree[2 * (A[r2] + u + 1)]++, t2.dyn_dtree[2 * N(e2)]++), t2.last_lit === t2.lit_bufsize - 1;
            }, r._tr_align = function(t2) {
              P(t2, 2, 3), L(t2, m, z), function(t3) {
                16 === t3.bi_valid ? (U(t3, t3.bi_buf), t3.bi_buf = 0, t3.bi_valid = 0) : 8 <= t3.bi_valid && (t3.pending_buf[t3.pending++] = 255 & t3.bi_buf, t3.bi_buf >>= 8, t3.bi_valid -= 8);
              }(t2);
            };
          }, { "../utils/common": 41 }], 53: [function(t, e, r) {
            e.exports = function() {
              this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
            };
          }, {}], 54: [function(t, e, r) {
            e.exports = "function" == typeof setImmediate ? setImmediate : function() {
              var t2 = [].slice.apply(arguments);
              t2.splice(1, 0, 0), setTimeout.apply(null, t2);
            };
          }, {}] }, {}, [10])(10);
        });
      }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, require2("buffer").Buffer);
    }, { buffer: 48 }], 54: [function(require2, module2, exports2) {
      exports2.Parser = require2("./lib/parser").Parser, exports2.rules = require2("./lib/rules"), exports2.errors = require2("./lib/errors"), exports2.results = require2("./lib/parsing-results"), exports2.StringSource = require2("./lib/StringSource"), exports2.Token = require2("./lib/Token"), exports2.bottomUp = require2("./lib/bottom-up"), exports2.RegexTokeniser = require2("./lib/regex-tokeniser").RegexTokeniser, exports2.rule = function(ruleBuilder) {
        var rule;
        return function(input) {
          return rule || (rule = ruleBuilder()), rule(input);
        };
      };
    }, { "./lib/StringSource": 55, "./lib/Token": 56, "./lib/bottom-up": 58, "./lib/errors": 59, "./lib/parser": 61, "./lib/parsing-results": 62, "./lib/regex-tokeniser": 63, "./lib/rules": 64 }], 55: [function(require2, module2, exports2) {
      var StringSourceRange = (module2.exports = function(string, description) {
        var self2 = { asString: function() {
          return string;
        }, range: function(startIndex, endIndex) {
          return new StringSourceRange(string, description, startIndex, endIndex);
        } };
        return self2;
      }, function(string, description, startIndex, endIndex) {
        this._string = string, this._description = description, this._startIndex = startIndex, this._endIndex = endIndex;
      });
      StringSourceRange.prototype.to = function(otherRange) {
        return new StringSourceRange(this._string, this._description, this._startIndex, otherRange._endIndex);
      }, StringSourceRange.prototype.describe = function() {
        var position = this._position(), description = this._description ? this._description + "\n" : "";
        return description + "Line number: " + position.lineNumber + "\nCharacter number: " + position.characterNumber;
      }, StringSourceRange.prototype.lineNumber = function() {
        return this._position().lineNumber;
      }, StringSourceRange.prototype.characterNumber = function() {
        return this._position().characterNumber;
      }, StringSourceRange.prototype._position = function() {
        for (var self2 = this, index = 0, nextNewLine = function() {
          return self2._string.indexOf("\n", index);
        }, lineNumber = 1; -1 !== nextNewLine() && nextNewLine() < this._startIndex; ) index = nextNewLine() + 1, lineNumber += 1;
        var characterNumber = this._startIndex - index + 1;
        return { lineNumber, characterNumber };
      };
    }, {}], 56: [function(require2, module2, exports2) {
      module2.exports = function(name, value, source) {
        this.name = name, this.value = value, source && (this.source = source);
      };
    }, {}], 57: [function(require2, module2, exports2) {
      var TokenIterator = module2.exports = function(tokens, startIndex) {
        this._tokens = tokens, this._startIndex = startIndex || 0;
      };
      TokenIterator.prototype.head = function() {
        return this._tokens[this._startIndex];
      }, TokenIterator.prototype.tail = function(startIndex) {
        return new TokenIterator(this._tokens, this._startIndex + 1);
      }, TokenIterator.prototype.toArray = function() {
        return this._tokens.slice(this._startIndex);
      }, TokenIterator.prototype.end = function() {
        return this._tokens[this._tokens.length - 1];
      }, TokenIterator.prototype.to = function(end) {
        var start = this.head().source, endToken = end.head() || end.end();
        return start.to(endToken.source);
      };
    }, {}], 58: [function(require2, module2, exports2) {
      function InfixRules(infixRules) {
        function untilExclusive(name) {
          return new InfixRules(infixRules.slice(0, ruleNames().indexOf(name)));
        }
        function untilInclusive(name) {
          return new InfixRules(infixRules.slice(0, ruleNames().indexOf(name) + 1));
        }
        function ruleNames() {
          return infixRules.map(function(rule) {
            return rule.name;
          });
        }
        function apply(leftResult) {
          for (var currentResult, source; ; ) {
            if (currentResult = applyToTokens(leftResult.remaining()), !currentResult.isSuccess()) return currentResult.isFailure() ? leftResult : currentResult;
            source = leftResult.source().to(currentResult.source()), leftResult = results.success(currentResult.value()(leftResult.value(), source), currentResult.remaining(), source);
          }
        }
        function applyToTokens(tokens) {
          return rules.firstOf("infix", infixRules.map(function(infix) {
            return infix.rule;
          }))(tokens);
        }
        return { apply, untilExclusive, untilInclusive };
      }
      var rules = require2("./rules"), results = require2("./parsing-results");
      exports2.parser = function(name, prefixRules, infixRuleBuilders) {
        function createInfixRule(infixRuleBuilder) {
          return { name: infixRuleBuilder.name, rule: lazyRule(infixRuleBuilder.ruleBuilder.bind(null, self2)) };
        }
        function rule() {
          return createRule(infixRules);
        }
        function leftAssociative(name2) {
          return createRule(infixRules.untilExclusive(name2));
        }
        function rightAssociative(name2) {
          return createRule(infixRules.untilInclusive(name2));
        }
        function createRule(infixRules2) {
          return apply.bind(null, infixRules2);
        }
        function apply(infixRules2, tokens) {
          var leftResult = prefixRule(tokens);
          return leftResult.isSuccess() ? infixRules2.apply(leftResult) : leftResult;
        }
        var self2 = { rule, leftAssociative, rightAssociative }, infixRules = new InfixRules(infixRuleBuilders.map(createInfixRule)), prefixRule = rules.firstOf(name, prefixRules);
        return self2;
      }, exports2.infix = function(name, ruleBuilder) {
        function map(func) {
          return exports2.infix(name, function(parser) {
            var rule = ruleBuilder(parser);
            return function(tokens) {
              var result = rule(tokens);
              return result.map(function(right) {
                return function(left, source) {
                  return func(left, right, source);
                };
              });
            };
          });
        }
        return { name, ruleBuilder, map };
      };
      var lazyRule = function(ruleBuilder) {
        var rule;
        return function(input) {
          return rule || (rule = ruleBuilder()), rule(input);
        };
      };
    }, { "./parsing-results": 62, "./rules": 64 }], 59: [function(require2, module2, exports2) {
      exports2.error = function(options) {
        return new Error2(options);
      };
      var Error2 = function(options) {
        this.expected = options.expected, this.actual = options.actual, this._location = options.location;
      };
      Error2.prototype.describe = function() {
        var locationDescription = this._location ? this._location.describe() + ":\n" : "";
        return locationDescription + "Expected " + this.expected + "\nbut got " + this.actual;
      }, Error2.prototype.lineNumber = function() {
        return this._location.lineNumber();
      }, Error2.prototype.characterNumber = function() {
        return this._location.characterNumber();
      };
    }, {}], 60: [function(require2, module2, exports2) {
      var LazyIterator = (exports2.fromArray = function(array) {
        var index = 0, hasNext = function() {
          return index < array.length;
        };
        return new LazyIterator({ hasNext, next: function() {
          if (hasNext()) return array[index++];
          throw new Error("No more elements");
        } });
      }, function(iterator) {
        this._iterator = iterator;
      });
      LazyIterator.prototype.map = function(func) {
        var iterator = this._iterator;
        return new LazyIterator({ hasNext: function() {
          return iterator.hasNext();
        }, next: function() {
          return func(iterator.next());
        } });
      }, LazyIterator.prototype.filter = function(condition) {
        var next, iterator = this._iterator, moved = false, hasNext = false, moveIfNecessary = function() {
          if (!moved) for (moved = true, hasNext = false; iterator.hasNext() && !hasNext; ) next = iterator.next(), hasNext = condition(next);
        };
        return new LazyIterator({ hasNext: function() {
          return moveIfNecessary(), hasNext;
        }, next: function() {
          moveIfNecessary();
          var toReturn = next;
          return moved = false, toReturn;
        } });
      }, LazyIterator.prototype.first = function() {
        var iterator = this._iterator;
        return this._iterator.hasNext() ? iterator.next() : null;
      }, LazyIterator.prototype.toArray = function() {
        for (var result = []; this._iterator.hasNext(); ) result.push(this._iterator.next());
        return result;
      };
    }, {}], 61: [function(require2, module2, exports2) {
      var TokenIterator = require2("./TokenIterator");
      exports2.Parser = function(options) {
        var parseTokens = function(parser, tokens) {
          return parser(new TokenIterator(tokens));
        };
        return { parseTokens };
      };
    }, { "./TokenIterator": 57 }], 62: [function(require2, module2, exports2) {
      module2.exports = { failure: function(errors, remaining) {
        if (errors.length < 1) throw new Error("Failure must have errors");
        return new Result({ status: "failure", remaining, errors });
      }, error: function(errors, remaining) {
        if (errors.length < 1) throw new Error("Failure must have errors");
        return new Result({ status: "error", remaining, errors });
      }, success: function(value, remaining, source) {
        return new Result({ status: "success", value, source, remaining, errors: [] });
      }, cut: function(remaining) {
        return new Result({ status: "cut", remaining, errors: [] });
      } };
      var Result = function(options) {
        this._value = options.value, this._status = options.status, this._hasValue = void 0 !== options.value, this._remaining = options.remaining, this._source = options.source, this._errors = options.errors;
      };
      Result.prototype.map = function(func) {
        return this._hasValue ? new Result({ value: func(this._value, this._source), status: this._status, remaining: this._remaining, source: this._source, errors: this._errors }) : this;
      }, Result.prototype.changeRemaining = function(remaining) {
        return new Result({ value: this._value, status: this._status, remaining, source: this._source, errors: this._errors });
      }, Result.prototype.isSuccess = function() {
        return "success" === this._status || "cut" === this._status;
      }, Result.prototype.isFailure = function() {
        return "failure" === this._status;
      }, Result.prototype.isError = function() {
        return "error" === this._status;
      }, Result.prototype.isCut = function() {
        return "cut" === this._status;
      }, Result.prototype.value = function() {
        return this._value;
      }, Result.prototype.remaining = function() {
        return this._remaining;
      }, Result.prototype.source = function() {
        return this._source;
      }, Result.prototype.errors = function() {
        return this._errors;
      };
    }, {}], 63: [function(require2, module2, exports2) {
      function RegexTokeniser(rules) {
        function tokenise(input, description) {
          for (var source = new StringSource(input, description), index = 0, tokens = []; index < input.length; ) {
            var result = readNextToken(input, index, source);
            index = result.endIndex, tokens.push(result.token);
          }
          return tokens.push(endToken(input, source)), tokens;
        }
        function readNextToken(string, startIndex, source) {
          for (var i = 0; i < rules.length; i++) {
            var regex = rules[i].regex;
            regex.lastIndex = startIndex;
            var result = regex.exec(string);
            if (result) {
              var endIndex = startIndex + result[0].length;
              if (result.index === startIndex && endIndex > startIndex) {
                var value = result[1], token = new Token(rules[i].name, value, source.range(startIndex, endIndex));
                return { token, endIndex };
              }
            }
          }
          var endIndex = startIndex + 1, token = new Token("unrecognisedCharacter", string.substring(startIndex, endIndex), source.range(startIndex, endIndex));
          return { token, endIndex };
        }
        function endToken(input, source) {
          return new Token("end", null, source.range(input.length, input.length));
        }
        return rules = rules.map(function(rule) {
          return { name: rule.name, regex: new RegExp(rule.regex.source, "g") };
        }), { tokenise };
      }
      var Token = require2("./Token"), StringSource = require2("./StringSource");
      exports2.RegexTokeniser = RegexTokeniser;
    }, { "./StringSource": 55, "./Token": 56 }], 64: [function(require2, module2, exports2) {
      function noOpRule(input) {
        return results.success(null, input);
      }
      function describeTokenMismatch(input, expected) {
        var error, token = input.head();
        return error = token ? errors.error({ expected, actual: describeToken(token), location: token.source }) : errors.error({ expected, actual: "end of tokens" }), results.failure([error], input);
      }
      var _ = require2("underscore"), options = require2("option"), results = require2("./parsing-results"), errors = require2("./errors"), lazyIterators = require2("./lazy-iterators");
      exports2.token = function(tokenType, value) {
        var matchValue = void 0 !== value;
        return function(input) {
          var token = input.head();
          if (!token || token.name !== tokenType || matchValue && token.value !== value) {
            var expected = describeToken({ name: tokenType, value });
            return describeTokenMismatch(input, expected);
          }
          return results.success(token.value, input.tail(), token.source);
        };
      }, exports2.tokenOfType = function(tokenType) {
        return exports2.token(tokenType);
      }, exports2.firstOf = function(name, parsers) {
        return _.isArray(parsers) || (parsers = Array.prototype.slice.call(arguments, 1)), function(input) {
          return lazyIterators.fromArray(parsers).map(function(parser) {
            return parser(input);
          }).filter(function(result) {
            return result.isSuccess() || result.isError();
          }).first() || describeTokenMismatch(input, name);
        };
      }, exports2.then = function(parser, func) {
        return function(input) {
          var result = parser(input);
          return result.map || console.log(result), result.map(func);
        };
      }, exports2.sequence = function() {
        function isCapturedRule(subRule) {
          return subRule.isCaptured;
        }
        var parsers = Array.prototype.slice.call(arguments, 0), rule = function(input) {
          var result = _.foldl(parsers, function(memo, parser) {
            var result2 = memo.result, hasCut = memo.hasCut;
            if (!result2.isSuccess()) return { result: result2, hasCut };
            var subResult = parser(result2.remaining());
            if (subResult.isCut()) return { result: result2, hasCut: true };
            if (subResult.isSuccess()) {
              var values;
              values = parser.isCaptured ? result2.value().withValue(parser, subResult.value()) : result2.value();
              var remaining = subResult.remaining(), source2 = input.to(remaining);
              return { result: results.success(values, remaining, source2), hasCut };
            }
            return hasCut ? { result: results.error(subResult.errors(), subResult.remaining()), hasCut } : { result: subResult, hasCut };
          }, { result: results.success(new SequenceValues(), input), hasCut: false }).result, source = input.to(result.remaining());
          return result.map(function(values) {
            return values.withValue(exports2.sequence.source, source);
          });
        };
        return rule.head = function() {
          var firstCapture = _.find(parsers, isCapturedRule);
          return exports2.then(rule, exports2.sequence.extract(firstCapture));
        }, rule.map = function(func) {
          return exports2.then(rule, function(result) {
            return func.apply(this, result.toArray());
          });
        }, rule;
      };
      var SequenceValues = function(values, valuesArray) {
        this._values = values || {}, this._valuesArray = valuesArray || [];
      };
      SequenceValues.prototype.withValue = function(rule, value) {
        if (rule.captureName && rule.captureName in this._values) throw new Error('Cannot add second value for capture "' + rule.captureName + '"');
        var newValues = _.clone(this._values);
        newValues[rule.captureName] = value;
        var newValuesArray = this._valuesArray.concat([value]);
        return new SequenceValues(newValues, newValuesArray);
      }, SequenceValues.prototype.get = function(rule) {
        if (rule.captureName in this._values) return this._values[rule.captureName];
        throw new Error('No value for capture "' + rule.captureName + '"');
      }, SequenceValues.prototype.toArray = function() {
        return this._valuesArray;
      }, exports2.sequence.capture = function(rule, name) {
        var captureRule = function() {
          return rule.apply(this, arguments);
        };
        return captureRule.captureName = name, captureRule.isCaptured = true, captureRule;
      }, exports2.sequence.extract = function(rule) {
        return function(result) {
          return result.get(rule);
        };
      }, exports2.sequence.applyValues = function(func) {
        var rules = Array.prototype.slice.call(arguments, 1);
        return function(result) {
          var values = rules.map(function(rule) {
            return result.get(rule);
          });
          return func.apply(this, values);
        };
      }, exports2.sequence.source = { captureName: "☃source☃" }, exports2.sequence.cut = function() {
        return function(input) {
          return results.cut(input);
        };
      }, exports2.optional = function(rule) {
        return function(input) {
          var result = rule(input);
          return result.isSuccess() ? result.map(options.some) : result.isFailure() ? results.success(options.none, input) : result;
        };
      }, exports2.zeroOrMoreWithSeparator = function(rule, separator) {
        return repeatedWithSeparator(rule, separator, false);
      }, exports2.oneOrMoreWithSeparator = function(rule, separator) {
        return repeatedWithSeparator(rule, separator, true);
      };
      var zeroOrMore = exports2.zeroOrMore = function(rule) {
        return function(input) {
          for (var result, values = []; (result = rule(input)) && result.isSuccess(); ) input = result.remaining(), values.push(result.value());
          return result.isError() ? result : results.success(values, input);
        };
      };
      exports2.oneOrMore = function(rule) {
        return exports2.oneOrMoreWithSeparator(rule, noOpRule);
      };
      var repeatedWithSeparator = function(rule, separator, isOneOrMore) {
        return function(input) {
          var result = rule(input);
          if (result.isSuccess()) {
            var mainRule = exports2.sequence.capture(rule, "main"), remainingRule = zeroOrMore(exports2.then(exports2.sequence(separator, mainRule), exports2.sequence.extract(mainRule))), remainingResult = remainingRule(result.remaining());
            return results.success([result.value()].concat(remainingResult.value()), remainingResult.remaining());
          }
          return isOneOrMore || result.isError() ? result : results.success([], input);
        };
      };
      exports2.leftAssociative = function(leftRule, rightRule, func) {
        var rights;
        rights = func ? [{ func, rule: rightRule }] : rightRule, rights = rights.map(function(right) {
          return exports2.then(right.rule, function(rightValue) {
            return function(leftValue, source) {
              return right.func(leftValue, rightValue, source);
            };
          });
        });
        var repeatedRule = exports2.firstOf.apply(null, ["rules"].concat(rights));
        return function(input) {
          var start = input, leftResult = leftRule(input);
          if (!leftResult.isSuccess()) return leftResult;
          for (var repeatedResult = repeatedRule(leftResult.remaining()); repeatedResult.isSuccess(); ) {
            var remaining = repeatedResult.remaining(), source = start.to(repeatedResult.remaining()), right = repeatedResult.value();
            leftResult = results.success(right(leftResult.value(), source), remaining, source), repeatedResult = repeatedRule(leftResult.remaining());
          }
          return repeatedResult.isError() ? repeatedResult : leftResult;
        };
      }, exports2.leftAssociative.firstOf = function() {
        return Array.prototype.slice.call(arguments, 0);
      }, exports2.nonConsuming = function(rule) {
        return function(input) {
          return rule(input).changeRemaining(input);
        };
      };
      var describeToken = function(token) {
        return token.value ? token.name + ' "' + token.value + '"' : token.name;
      };
    }, { "./errors": 59, "./lazy-iterators": 60, "./parsing-results": 62, option: 65, underscore: 67 }], 65: [function(require2, module2, exports2) {
      function callOrReturn(value) {
        return "function" == typeof value ? value() : value;
      }
      exports2.none = /* @__PURE__ */ Object.create({ value: function() {
        throw new Error("Called value on none");
      }, isNone: function() {
        return true;
      }, isSome: function() {
        return false;
      }, map: function() {
        return exports2.none;
      }, flatMap: function() {
        return exports2.none;
      }, filter: function() {
        return exports2.none;
      }, toArray: function() {
        return [];
      }, orElse: callOrReturn, valueOrElse: callOrReturn }), exports2.some = function(value) {
        return new Some(value);
      };
      var Some = function(value) {
        this._value = value;
      };
      Some.prototype.value = function() {
        return this._value;
      }, Some.prototype.isNone = function() {
        return false;
      }, Some.prototype.isSome = function() {
        return true;
      }, Some.prototype.map = function(func) {
        return new Some(func(this._value));
      }, Some.prototype.flatMap = function(func) {
        return func(this._value);
      }, Some.prototype.filter = function(predicate) {
        return predicate(this._value) ? this : exports2.none;
      }, Some.prototype.toArray = function() {
        return [this._value];
      }, Some.prototype.orElse = function(value) {
        return this;
      }, Some.prototype.valueOrElse = function(value) {
        return this._value;
      }, exports2.isOption = function(value) {
        return value === exports2.none || value instanceof Some;
      }, exports2.fromNullable = function(value) {
        return null == value ? exports2.none : new Some(value);
      };
    }, {}], 66: [function(require2, module2, exports2) {
      function defaultSetTimout() {
        throw new Error("setTimeout has not been defined");
      }
      function defaultClearTimeout() {
        throw new Error("clearTimeout has not been defined");
      }
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) return cachedSetTimeout = setTimeout, setTimeout(fun, 0);
        try {
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) return cachedClearTimeout = clearTimeout, clearTimeout(marker);
        try {
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            return cachedClearTimeout.call(null, marker);
          } catch (e2) {
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      function cleanUpNextTick() {
        draining && currentQueue && (draining = false, currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1, queue.length && drainQueue());
      }
      function drainQueue() {
        if (!draining) {
          var timeout = runTimeout(cleanUpNextTick);
          draining = true;
          for (var len = queue.length; len; ) {
            for (currentQueue = queue, queue = []; ++queueIndex < len; ) currentQueue && currentQueue[queueIndex].run();
            queueIndex = -1, len = queue.length;
          }
          currentQueue = null, draining = false, runClearTimeout(timeout);
        }
      }
      function Item(fun, array) {
        this.fun = fun, this.array = array;
      }
      function noop() {
      }
      var cachedSetTimeout, cachedClearTimeout, process = module2.exports = {};
      !function() {
        try {
          cachedSetTimeout = "function" == typeof setTimeout ? setTimeout : defaultSetTimout;
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          cachedClearTimeout = "function" == typeof clearTimeout ? clearTimeout : defaultClearTimeout;
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      }();
      var currentQueue, queue = [], draining = false, queueIndex = -1;
      process.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
        queue.push(new Item(fun, args)), 1 !== queue.length || draining || runTimeout(drainQueue);
      }, Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      }, process.title = "browser", process.browser = true, process.env = {}, process.argv = [], process.version = "", process.versions = {}, process.on = noop, process.addListener = noop, process.once = noop, process.off = noop, process.removeListener = noop, process.removeAllListeners = noop, process.emit = noop, process.binding = function(name) {
        throw new Error("process.binding is not supported");
      }, process.cwd = function() {
        return "/";
      }, process.chdir = function(dir) {
        throw new Error("process.chdir is not supported");
      }, process.umask = function() {
        return 0;
      };
    }, {}], 67: [function(require2, module2, exports2) {
      (function(global2) {
        !function(global3, factory) {
          "object" == typeof exports2 && "undefined" != typeof module2 ? module2.exports = factory() : (global3 = "undefined" != typeof globalThis ? globalThis : global3 || self, function() {
            var current = global3._, exports3 = global3._ = factory();
            exports3.noConflict = function() {
              return global3._ = current, exports3;
            };
          }());
        }(this, function() {
          function restArguments(func, startIndex) {
            return startIndex = null == startIndex ? func.length - 1 : +startIndex, function() {
              for (var length = Math.max(arguments.length - startIndex, 0), rest2 = Array(length), index = 0; length > index; index++) rest2[index] = arguments[index + startIndex];
              switch (startIndex) {
                case 0:
                  return func.call(this, rest2);
                case 1:
                  return func.call(this, arguments[0], rest2);
                case 2:
                  return func.call(this, arguments[0], arguments[1], rest2);
              }
              var args = Array(startIndex + 1);
              for (index = 0; startIndex > index; index++) args[index] = arguments[index];
              return args[startIndex] = rest2, func.apply(this, args);
            };
          }
          function isObject(obj) {
            var type = typeof obj;
            return "function" === type || "object" === type && !!obj;
          }
          function isNull(obj) {
            return null === obj;
          }
          function isUndefined(obj) {
            return void 0 === obj;
          }
          function isBoolean(obj) {
            return obj === true || obj === false || "[object Boolean]" === toString.call(obj);
          }
          function isElement(obj) {
            return !(!obj || 1 !== obj.nodeType);
          }
          function tagTester(name) {
            var tag = "[object " + name + "]";
            return function(obj) {
              return toString.call(obj) === tag;
            };
          }
          function ie10IsDataView(obj) {
            return null != obj && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
          }
          function has$1(obj, key) {
            return null != obj && hasOwnProperty.call(obj, key);
          }
          function isFinite$1(obj) {
            return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
          }
          function isNaN$1(obj) {
            return isNumber(obj) && _isNaN(obj);
          }
          function constant(value) {
            return function() {
              return value;
            };
          }
          function createSizePropertyCheck(getSizeProperty) {
            return function(collection) {
              var sizeProperty = getSizeProperty(collection);
              return "number" == typeof sizeProperty && sizeProperty >= 0 && MAX_ARRAY_INDEX >= sizeProperty;
            };
          }
          function shallowProperty(key) {
            return function(obj) {
              return null == obj ? void 0 : obj[key];
            };
          }
          function isTypedArray(obj) {
            return nativeIsView ? nativeIsView(obj) && !isDataView$1(obj) : isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
          }
          function emulatedSet(keys2) {
            for (var hash = {}, l = keys2.length, i = 0; l > i; ++i) hash[keys2[i]] = true;
            return { contains: function(key) {
              return hash[key];
            }, push: function(key) {
              return hash[key] = true, keys2.push(key);
            } };
          }
          function collectNonEnumProps(obj, keys2) {
            keys2 = emulatedSet(keys2);
            var nonEnumIdx = nonEnumerableProps.length, constructor = obj.constructor, proto = isFunction$1(constructor) && constructor.prototype || ObjProto, prop = "constructor";
            for (has$1(obj, prop) && !keys2.contains(prop) && keys2.push(prop); nonEnumIdx--; ) prop = nonEnumerableProps[nonEnumIdx], prop in obj && obj[prop] !== proto[prop] && !keys2.contains(prop) && keys2.push(prop);
          }
          function keys(obj) {
            if (!isObject(obj)) return [];
            if (nativeKeys) return nativeKeys(obj);
            var keys2 = [];
            for (var key in obj) has$1(obj, key) && keys2.push(key);
            return hasEnumBug && collectNonEnumProps(obj, keys2), keys2;
          }
          function isEmpty(obj) {
            if (null == obj) return true;
            var length = getLength(obj);
            return "number" == typeof length && (isArray(obj) || isString(obj) || isArguments$1(obj)) ? 0 === length : 0 === getLength(keys(obj));
          }
          function isMatch(object2, attrs) {
            var _keys = keys(attrs), length = _keys.length;
            if (null == object2) return !length;
            for (var obj = Object(object2), i = 0; length > i; i++) {
              var key = _keys[i];
              if (attrs[key] !== obj[key] || !(key in obj)) return false;
            }
            return true;
          }
          function _$1(obj) {
            return obj instanceof _$1 ? obj : this instanceof _$1 ? void (this._wrapped = obj) : new _$1(obj);
          }
          function toBufferView(bufferSource) {
            return new Uint8Array(bufferSource.buffer || bufferSource, bufferSource.byteOffset || 0, getByteLength(bufferSource));
          }
          function eq(a, b, aStack, bStack) {
            if (a === b) return 0 !== a || 1 / a === 1 / b;
            if (null == a || null == b) return false;
            if (a !== a) return b !== b;
            var type = typeof a;
            return "function" !== type && "object" !== type && "object" != typeof b ? false : deepEq(a, b, aStack, bStack);
          }
          function deepEq(a, b, aStack, bStack) {
            a instanceof _$1 && (a = a._wrapped), b instanceof _$1 && (b = b._wrapped);
            var className = toString.call(a);
            if (className !== toString.call(b)) return false;
            if (hasStringTagBug && "[object Object]" == className && isDataView$1(a)) {
              if (!isDataView$1(b)) return false;
              className = tagDataView;
            }
            switch (className) {
              case "[object RegExp]":
              case "[object String]":
                return "" + a == "" + b;
              case "[object Number]":
                return +a !== +a ? +b !== +b : 0 === +a ? 1 / +a === 1 / b : +a === +b;
              case "[object Date]":
              case "[object Boolean]":
                return +a === +b;
              case "[object Symbol]":
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
              case "[object ArrayBuffer]":
              case tagDataView:
                return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
            }
            var areArrays = "[object Array]" === className;
            if (!areArrays && isTypedArray$1(a)) {
              var byteLength = getByteLength(a);
              if (byteLength !== getByteLength(b)) return false;
              if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
              areArrays = true;
            }
            if (!areArrays) {
              if ("object" != typeof a || "object" != typeof b) return false;
              var aCtor = a.constructor, bCtor = b.constructor;
              if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor && isFunction$1(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) return false;
            }
            aStack = aStack || [], bStack = bStack || [];
            for (var length = aStack.length; length--; ) if (aStack[length] === a) return bStack[length] === b;
            if (aStack.push(a), bStack.push(b), areArrays) {
              if (length = a.length, length !== b.length) return false;
              for (; length--; ) if (!eq(a[length], b[length], aStack, bStack)) return false;
            } else {
              var key, _keys = keys(a);
              if (length = _keys.length, keys(b).length !== length) return false;
              for (; length--; ) if (key = _keys[length], !has$1(b, key) || !eq(a[key], b[key], aStack, bStack)) return false;
            }
            return aStack.pop(), bStack.pop(), true;
          }
          function isEqual(a, b) {
            return eq(a, b);
          }
          function allKeys(obj) {
            if (!isObject(obj)) return [];
            var keys2 = [];
            for (var key in obj) keys2.push(key);
            return hasEnumBug && collectNonEnumProps(obj, keys2), keys2;
          }
          function ie11fingerprint(methods) {
            var length = getLength(methods);
            return function(obj) {
              if (null == obj) return false;
              var keys2 = allKeys(obj);
              if (getLength(keys2)) return false;
              for (var i = 0; length > i; i++) if (!isFunction$1(obj[methods[i]])) return false;
              return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
            };
          }
          function values(obj) {
            for (var _keys = keys(obj), length = _keys.length, values2 = Array(length), i = 0; length > i; i++) values2[i] = obj[_keys[i]];
            return values2;
          }
          function pairs(obj) {
            for (var _keys = keys(obj), length = _keys.length, pairs2 = Array(length), i = 0; length > i; i++) pairs2[i] = [_keys[i], obj[_keys[i]]];
            return pairs2;
          }
          function invert(obj) {
            for (var result2 = {}, _keys = keys(obj), i = 0, length = _keys.length; length > i; i++) result2[obj[_keys[i]]] = _keys[i];
            return result2;
          }
          function functions(obj) {
            var names = [];
            for (var key in obj) isFunction$1(obj[key]) && names.push(key);
            return names.sort();
          }
          function createAssigner(keysFunc, defaults2) {
            return function(obj) {
              var length = arguments.length;
              if (defaults2 && (obj = Object(obj)), 2 > length || null == obj) return obj;
              for (var index = 1; length > index; index++) for (var source = arguments[index], keys2 = keysFunc(source), l = keys2.length, i = 0; l > i; i++) {
                var key = keys2[i];
                defaults2 && void 0 !== obj[key] || (obj[key] = source[key]);
              }
              return obj;
            };
          }
          function ctor() {
            return function() {
            };
          }
          function baseCreate(prototype) {
            if (!isObject(prototype)) return {};
            if (nativeCreate) return nativeCreate(prototype);
            var Ctor = ctor();
            Ctor.prototype = prototype;
            var result2 = new Ctor();
            return Ctor.prototype = null, result2;
          }
          function create(prototype, props) {
            var result2 = baseCreate(prototype);
            return props && extendOwn(result2, props), result2;
          }
          function clone(obj) {
            return isObject(obj) ? isArray(obj) ? obj.slice() : extend({}, obj) : obj;
          }
          function tap(obj, interceptor) {
            return interceptor(obj), obj;
          }
          function toPath$1(path) {
            return isArray(path) ? path : [path];
          }
          function toPath(path) {
            return _$1.toPath(path);
          }
          function deepGet(obj, path) {
            for (var length = path.length, i = 0; length > i; i++) {
              if (null == obj) return void 0;
              obj = obj[path[i]];
            }
            return length ? obj : void 0;
          }
          function get(object2, path, defaultValue) {
            var value = deepGet(object2, toPath(path));
            return isUndefined(value) ? defaultValue : value;
          }
          function has(obj, path) {
            path = toPath(path);
            for (var length = path.length, i = 0; length > i; i++) {
              var key = path[i];
              if (!has$1(obj, key)) return false;
              obj = obj[key];
            }
            return !!length;
          }
          function identity(value) {
            return value;
          }
          function matcher(attrs) {
            return attrs = extendOwn({}, attrs), function(obj) {
              return isMatch(obj, attrs);
            };
          }
          function property(path) {
            return path = toPath(path), function(obj) {
              return deepGet(obj, path);
            };
          }
          function optimizeCb(func, context, argCount) {
            if (void 0 === context) return func;
            switch (null == argCount ? 3 : argCount) {
              case 1:
                return function(value) {
                  return func.call(context, value);
                };
              case 3:
                return function(value, index, collection) {
                  return func.call(context, value, index, collection);
                };
              case 4:
                return function(accumulator, value, index, collection) {
                  return func.call(context, accumulator, value, index, collection);
                };
            }
            return function() {
              return func.apply(context, arguments);
            };
          }
          function baseIteratee(value, context, argCount) {
            return null == value ? identity : isFunction$1(value) ? optimizeCb(value, context, argCount) : isObject(value) && !isArray(value) ? matcher(value) : property(value);
          }
          function iteratee(value, context) {
            return baseIteratee(value, context, 1 / 0);
          }
          function cb(value, context, argCount) {
            return _$1.iteratee !== iteratee ? _$1.iteratee(value, context) : baseIteratee(value, context, argCount);
          }
          function mapObject(obj, iteratee2, context) {
            iteratee2 = cb(iteratee2, context);
            for (var _keys = keys(obj), length = _keys.length, results = {}, index = 0; length > index; index++) {
              var currentKey = _keys[index];
              results[currentKey] = iteratee2(obj[currentKey], currentKey, obj);
            }
            return results;
          }
          function noop() {
          }
          function propertyOf(obj) {
            return null == obj ? noop : function(path) {
              return get(obj, path);
            };
          }
          function times(n, iteratee2, context) {
            var accum = Array(Math.max(0, n));
            iteratee2 = optimizeCb(iteratee2, context, 1);
            for (var i = 0; n > i; i++) accum[i] = iteratee2(i);
            return accum;
          }
          function random(min2, max2) {
            return null == max2 && (max2 = min2, min2 = 0), min2 + Math.floor(Math.random() * (max2 - min2 + 1));
          }
          function createEscaper(map2) {
            var escaper = function(match) {
              return map2[match];
            }, source = "(?:" + keys(map2).join("|") + ")", testRegexp = RegExp(source), replaceRegexp = RegExp(source, "g");
            return function(string) {
              return string = null == string ? "" : "" + string, testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
          }
          function escapeChar(match) {
            return "\\" + escapes[match];
          }
          function template(text, settings, oldSettings) {
            !settings && oldSettings && (settings = oldSettings), settings = defaults({}, settings, _$1.templateSettings);
            var matcher2 = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join("|") + "|$", "g"), index = 0, source = "__p+='";
            text.replace(matcher2, function(match, escape, interpolate, evaluate, offset) {
              return source += text.slice(index, offset).replace(escapeRegExp, escapeChar), index = offset + match.length, escape ? source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" : interpolate ? source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" : evaluate && (source += "';\n" + evaluate + "\n__p+='"), match;
            }), source += "';\n";
            var argument = settings.variable;
            if (argument) {
              if (!bareIdentifier.test(argument)) throw new Error("variable is not a bare identifier: " + argument);
            } else source = "with(obj||{}){\n" + source + "}\n", argument = "obj";
            source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
            var render;
            try {
              render = new Function(argument, "_", source);
            } catch (e) {
              throw e.source = source, e;
            }
            var template2 = function(data) {
              return render.call(this, data, _$1);
            };
            return template2.source = "function(" + argument + "){\n" + source + "}", template2;
          }
          function result(obj, path, fallback) {
            path = toPath(path);
            var length = path.length;
            if (!length) return isFunction$1(fallback) ? fallback.call(obj) : fallback;
            for (var i = 0; length > i; i++) {
              var prop = null == obj ? void 0 : obj[path[i]];
              void 0 === prop && (prop = fallback, i = length), obj = isFunction$1(prop) ? prop.call(obj) : prop;
            }
            return obj;
          }
          function uniqueId(prefix) {
            var id = ++idCounter + "";
            return prefix ? prefix + id : id;
          }
          function chain(obj) {
            var instance = _$1(obj);
            return instance._chain = true, instance;
          }
          function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
            if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
            var self2 = baseCreate(sourceFunc.prototype), result2 = sourceFunc.apply(self2, args);
            return isObject(result2) ? result2 : self2;
          }
          function flatten$1(input, depth, strict, output) {
            if (output = output || [], depth || 0 === depth) {
              if (0 >= depth) return output.concat(input);
            } else depth = 1 / 0;
            for (var idx = output.length, i = 0, length = getLength(input); length > i; i++) {
              var value = input[i];
              if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) if (depth > 1) flatten$1(value, depth - 1, strict, output), idx = output.length;
              else for (var j = 0, len = value.length; len > j; ) output[idx++] = value[j++];
              else strict || (output[idx++] = value);
            }
            return output;
          }
          function memoize(func, hasher) {
            var memoize2 = function(key) {
              var cache = memoize2.cache, address = "" + (hasher ? hasher.apply(this, arguments) : key);
              return has$1(cache, address) || (cache[address] = func.apply(this, arguments)), cache[address];
            };
            return memoize2.cache = {}, memoize2;
          }
          function throttle(func, wait, options) {
            var timeout, context, args, result2, previous = 0;
            options || (options = {});
            var later = function() {
              previous = options.leading === false ? 0 : now(), timeout = null, result2 = func.apply(context, args), timeout || (context = args = null);
            }, throttled = function() {
              var _now = now();
              previous || options.leading !== false || (previous = _now);
              var remaining = wait - (_now - previous);
              return context = this, args = arguments, 0 >= remaining || remaining > wait ? (timeout && (clearTimeout(timeout), timeout = null), previous = _now, result2 = func.apply(context, args), timeout || (context = args = null)) : timeout || options.trailing === false || (timeout = setTimeout(later, remaining)), result2;
            };
            return throttled.cancel = function() {
              clearTimeout(timeout), previous = 0, timeout = context = args = null;
            }, throttled;
          }
          function debounce(func, wait, immediate) {
            var timeout, previous, args, result2, context, later = function() {
              var passed = now() - previous;
              wait > passed ? timeout = setTimeout(later, wait - passed) : (timeout = null, immediate || (result2 = func.apply(context, args)), timeout || (args = context = null));
            }, debounced = restArguments(function(_args) {
              return context = this, args = _args, previous = now(), timeout || (timeout = setTimeout(later, wait), immediate && (result2 = func.apply(context, args))), result2;
            });
            return debounced.cancel = function() {
              clearTimeout(timeout), timeout = args = context = null;
            }, debounced;
          }
          function wrap(func, wrapper) {
            return partial(wrapper, func);
          }
          function negate(predicate) {
            return function() {
              return !predicate.apply(this, arguments);
            };
          }
          function compose() {
            var args = arguments, start = args.length - 1;
            return function() {
              for (var i = start, result2 = args[start].apply(this, arguments); i--; ) result2 = args[i].call(this, result2);
              return result2;
            };
          }
          function after(times2, func) {
            return function() {
              return --times2 < 1 ? func.apply(this, arguments) : void 0;
            };
          }
          function before(times2, func) {
            var memo;
            return function() {
              return --times2 > 0 && (memo = func.apply(this, arguments)), 1 >= times2 && (func = null), memo;
            };
          }
          function findKey(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var key, _keys = keys(obj), i = 0, length = _keys.length; length > i; i++) if (key = _keys[i], predicate(obj[key], key, obj)) return key;
          }
          function createPredicateIndexFinder(dir) {
            return function(array, predicate, context) {
              predicate = cb(predicate, context);
              for (var length = getLength(array), index = dir > 0 ? 0 : length - 1; index >= 0 && length > index; index += dir) if (predicate(array[index], index, array)) return index;
              return -1;
            };
          }
          function sortedIndex(array, obj, iteratee2, context) {
            iteratee2 = cb(iteratee2, context, 1);
            for (var value = iteratee2(obj), low = 0, high = getLength(array); high > low; ) {
              var mid = Math.floor((low + high) / 2);
              iteratee2(array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
          }
          function createIndexFinder(dir, predicateFind, sortedIndex2) {
            return function(array, item, idx) {
              var i = 0, length = getLength(array);
              if ("number" == typeof idx) dir > 0 ? i = idx >= 0 ? idx : Math.max(idx + length, i) : length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
              else if (sortedIndex2 && idx && length) return idx = sortedIndex2(array, item), array[idx] === item ? idx : -1;
              if (item !== item) return idx = predicateFind(slice.call(array, i, length), isNaN$1), idx >= 0 ? idx + i : -1;
              for (idx = dir > 0 ? i : length - 1; idx >= 0 && length > idx; idx += dir) if (array[idx] === item) return idx;
              return -1;
            };
          }
          function find(obj, predicate, context) {
            var keyFinder = isArrayLike(obj) ? findIndex : findKey, key = keyFinder(obj, predicate, context);
            return void 0 !== key && -1 !== key ? obj[key] : void 0;
          }
          function findWhere(obj, attrs) {
            return find(obj, matcher(attrs));
          }
          function each(obj, iteratee2, context) {
            iteratee2 = optimizeCb(iteratee2, context);
            var i, length;
            if (isArrayLike(obj)) for (i = 0, length = obj.length; length > i; i++) iteratee2(obj[i], i, obj);
            else {
              var _keys = keys(obj);
              for (i = 0, length = _keys.length; length > i; i++) iteratee2(obj[_keys[i]], _keys[i], obj);
            }
            return obj;
          }
          function map(obj, iteratee2, context) {
            iteratee2 = cb(iteratee2, context);
            for (var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, results = Array(length), index = 0; length > index; index++) {
              var currentKey = _keys ? _keys[index] : index;
              results[index] = iteratee2(obj[currentKey], currentKey, obj);
            }
            return results;
          }
          function createReduce(dir) {
            var reducer = function(obj, iteratee2, memo, initial2) {
              var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = dir > 0 ? 0 : length - 1;
              for (initial2 || (memo = obj[_keys ? _keys[index] : index], index += dir); index >= 0 && length > index; index += dir) {
                var currentKey = _keys ? _keys[index] : index;
                memo = iteratee2(memo, obj[currentKey], currentKey, obj);
              }
              return memo;
            };
            return function(obj, iteratee2, memo, context) {
              var initial2 = arguments.length >= 3;
              return reducer(obj, optimizeCb(iteratee2, context, 4), memo, initial2);
            };
          }
          function filter(obj, predicate, context) {
            var results = [];
            return predicate = cb(predicate, context), each(obj, function(value, index, list) {
              predicate(value, index, list) && results.push(value);
            }), results;
          }
          function reject(obj, predicate, context) {
            return filter(obj, negate(cb(predicate)), context);
          }
          function every(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = 0; length > index; index++) {
              var currentKey = _keys ? _keys[index] : index;
              if (!predicate(obj[currentKey], currentKey, obj)) return false;
            }
            return true;
          }
          function some(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = 0; length > index; index++) {
              var currentKey = _keys ? _keys[index] : index;
              if (predicate(obj[currentKey], currentKey, obj)) return true;
            }
            return false;
          }
          function contains(obj, item, fromIndex, guard) {
            return isArrayLike(obj) || (obj = values(obj)), ("number" != typeof fromIndex || guard) && (fromIndex = 0), indexOf(obj, item, fromIndex) >= 0;
          }
          function pluck(obj, key) {
            return map(obj, property(key));
          }
          function where(obj, attrs) {
            return filter(obj, matcher(attrs));
          }
          function max(obj, iteratee2, context) {
            var value, computed, result2 = -Infinity, lastComputed = -Infinity;
            if (null == iteratee2 || "number" == typeof iteratee2 && "object" != typeof obj[0] && null != obj) {
              obj = isArrayLike(obj) ? obj : values(obj);
              for (var i = 0, length = obj.length; length > i; i++) value = obj[i], null != value && value > result2 && (result2 = value);
            } else iteratee2 = cb(iteratee2, context), each(obj, function(v, index, list) {
              computed = iteratee2(v, index, list), (computed > lastComputed || computed === -Infinity && result2 === -Infinity) && (result2 = v, lastComputed = computed);
            });
            return result2;
          }
          function min(obj, iteratee2, context) {
            var value, computed, result2 = 1 / 0, lastComputed = 1 / 0;
            if (null == iteratee2 || "number" == typeof iteratee2 && "object" != typeof obj[0] && null != obj) {
              obj = isArrayLike(obj) ? obj : values(obj);
              for (var i = 0, length = obj.length; length > i; i++) value = obj[i], null != value && result2 > value && (result2 = value);
            } else iteratee2 = cb(iteratee2, context), each(obj, function(v, index, list) {
              computed = iteratee2(v, index, list), (lastComputed > computed || computed === 1 / 0 && result2 === 1 / 0) && (result2 = v, lastComputed = computed);
            });
            return result2;
          }
          function sample(obj, n, guard) {
            if (null == n || guard) return isArrayLike(obj) || (obj = values(obj)), obj[random(obj.length - 1)];
            var sample2 = isArrayLike(obj) ? clone(obj) : values(obj), length = getLength(sample2);
            n = Math.max(Math.min(n, length), 0);
            for (var last2 = length - 1, index = 0; n > index; index++) {
              var rand = random(index, last2), temp = sample2[index];
              sample2[index] = sample2[rand], sample2[rand] = temp;
            }
            return sample2.slice(0, n);
          }
          function shuffle(obj) {
            return sample(obj, 1 / 0);
          }
          function sortBy(obj, iteratee2, context) {
            var index = 0;
            return iteratee2 = cb(iteratee2, context), pluck(map(obj, function(value, key, list) {
              return { value, index: index++, criteria: iteratee2(value, key, list) };
            }).sort(function(left, right) {
              var a = left.criteria, b = right.criteria;
              if (a !== b) {
                if (a > b || void 0 === a) return 1;
                if (b > a || void 0 === b) return -1;
              }
              return left.index - right.index;
            }), "value");
          }
          function group(behavior, partition2) {
            return function(obj, iteratee2, context) {
              var result2 = partition2 ? [[], []] : {};
              return iteratee2 = cb(iteratee2, context), each(obj, function(value, index) {
                var key = iteratee2(value, index, obj);
                behavior(result2, value, key);
              }), result2;
            };
          }
          function toArray(obj) {
            return obj ? isArray(obj) ? slice.call(obj) : isString(obj) ? obj.match(reStrSymbol) : isArrayLike(obj) ? map(obj, identity) : values(obj) : [];
          }
          function size(obj) {
            return null == obj ? 0 : isArrayLike(obj) ? obj.length : keys(obj).length;
          }
          function keyInObj(value, key, obj) {
            return key in obj;
          }
          function initial(array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (null == n || guard ? 1 : n)));
          }
          function first(array, n, guard) {
            return null == array || array.length < 1 ? null == n || guard ? void 0 : [] : null == n || guard ? array[0] : initial(array, array.length - n);
          }
          function rest(array, n, guard) {
            return slice.call(array, null == n || guard ? 1 : n);
          }
          function last(array, n, guard) {
            return null == array || array.length < 1 ? null == n || guard ? void 0 : [] : null == n || guard ? array[array.length - 1] : rest(array, Math.max(0, array.length - n));
          }
          function compact(array) {
            return filter(array, Boolean);
          }
          function flatten(array, depth) {
            return flatten$1(array, depth, false);
          }
          function uniq(array, isSorted, iteratee2, context) {
            isBoolean(isSorted) || (context = iteratee2, iteratee2 = isSorted, isSorted = false), null != iteratee2 && (iteratee2 = cb(iteratee2, context));
            for (var result2 = [], seen = [], i = 0, length = getLength(array); length > i; i++) {
              var value = array[i], computed = iteratee2 ? iteratee2(value, i, array) : value;
              isSorted && !iteratee2 ? (i && seen === computed || result2.push(value), seen = computed) : iteratee2 ? contains(seen, computed) || (seen.push(computed), result2.push(value)) : contains(result2, value) || result2.push(value);
            }
            return result2;
          }
          function intersection(array) {
            for (var result2 = [], argsLength = arguments.length, i = 0, length = getLength(array); length > i; i++) {
              var item = array[i];
              if (!contains(result2, item)) {
                var j;
                for (j = 1; argsLength > j && contains(arguments[j], item); j++) ;
                j === argsLength && result2.push(item);
              }
            }
            return result2;
          }
          function unzip(array) {
            for (var length = array && max(array, getLength).length || 0, result2 = Array(length), index = 0; length > index; index++) result2[index] = pluck(array, index);
            return result2;
          }
          function object(list, values2) {
            for (var result2 = {}, i = 0, length = getLength(list); length > i; i++) values2 ? result2[list[i]] = values2[i] : result2[list[i][0]] = list[i][1];
            return result2;
          }
          function range(start, stop, step) {
            null == stop && (stop = start || 0, start = 0), step || (step = start > stop ? -1 : 1);
            for (var length = Math.max(Math.ceil((stop - start) / step), 0), range2 = Array(length), idx = 0; length > idx; idx++, start += step) range2[idx] = start;
            return range2;
          }
          function chunk(array, count) {
            if (null == count || 1 > count) return [];
            for (var result2 = [], i = 0, length = array.length; length > i; ) result2.push(slice.call(array, i, i += count));
            return result2;
          }
          function chainResult(instance, obj) {
            return instance._chain ? _$1(obj).chain() : obj;
          }
          function mixin(obj) {
            return each(functions(obj), function(name) {
              var func = _$1[name] = obj[name];
              _$1.prototype[name] = function() {
                var args = [this._wrapped];
                return push.apply(args, arguments), chainResult(this, func.apply(_$1, args));
              };
            }), _$1;
          }
          var VERSION = "1.13.1", root = "object" == typeof self && self.self === self && self || "object" == typeof global2 && global2.global === global2 && global2 || Function("return this")() || {}, ArrayProto = Array.prototype, ObjProto = Object.prototype, SymbolProto = "undefined" != typeof Symbol ? Symbol.prototype : null, push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty, supportsArrayBuffer = "undefined" != typeof ArrayBuffer, supportsDataView = "undefined" != typeof DataView, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeCreate = Object.create, nativeIsView = supportsArrayBuffer && ArrayBuffer.isView, _isNaN = isNaN, _isFinite = isFinite, hasEnumBug = !{ toString: null }.propertyIsEnumerable("toString"), nonEnumerableProps = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"], MAX_ARRAY_INDEX = Math.pow(2, 53) - 1, isString = tagTester("String"), isNumber = tagTester("Number"), isDate = tagTester("Date"), isRegExp = tagTester("RegExp"), isError = tagTester("Error"), isSymbol = tagTester("Symbol"), isArrayBuffer = tagTester("ArrayBuffer"), isFunction = tagTester("Function"), nodelist = root.document && root.document.childNodes;
          "function" != typeof /./ && "object" != typeof Int8Array && "function" != typeof nodelist && (isFunction = function(obj) {
            return "function" == typeof obj || false;
          });
          var isFunction$1 = isFunction, hasObjectTag = tagTester("Object"), hasStringTagBug = supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8))), isIE11 = "undefined" != typeof Map && hasObjectTag(/* @__PURE__ */ new Map()), isDataView = tagTester("DataView"), isDataView$1 = hasStringTagBug ? ie10IsDataView : isDataView, isArray = nativeIsArray || tagTester("Array"), isArguments = tagTester("Arguments");
          !function() {
            isArguments(arguments) || (isArguments = function(obj) {
              return has$1(obj, "callee");
            });
          }();
          var isArguments$1 = isArguments, getByteLength = shallowProperty("byteLength"), isBufferLike = createSizePropertyCheck(getByteLength), typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/, isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false), getLength = shallowProperty("length");
          _$1.VERSION = VERSION, _$1.prototype.value = function() {
            return this._wrapped;
          }, _$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value, _$1.prototype.toString = function() {
            return String(this._wrapped);
          };
          var tagDataView = "[object DataView]", forEachName = "forEach", hasName = "has", commonInit = ["clear", "delete"], mapTail = ["get", hasName, "set"], mapMethods = commonInit.concat(forEachName, mapTail), weakMapMethods = commonInit.concat(mapTail), setMethods = ["add"].concat(commonInit, forEachName, hasName), isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester("Map"), isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester("WeakMap"), isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester("Set"), isWeakSet = tagTester("WeakSet"), extend = createAssigner(allKeys), extendOwn = createAssigner(keys), defaults = createAssigner(allKeys, true);
          _$1.toPath = toPath$1, _$1.iteratee = iteratee;
          var now = Date.now || function() {
            return (/* @__PURE__ */ new Date()).getTime();
          }, escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" }, _escape = createEscaper(escapeMap), unescapeMap = invert(escapeMap), _unescape = createEscaper(unescapeMap), templateSettings = _$1.templateSettings = { evaluate: /<%([\s\S]+?)%>/g, interpolate: /<%=([\s\S]+?)%>/g, escape: /<%-([\s\S]+?)%>/g }, noMatch = /(.)^/, escapes = { "'": "'", "\\": "\\", "\r": "r", "\n": "n", "\u2028": "u2028", "\u2029": "u2029" }, escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g, bareIdentifier = /^\s*(\w|\$)+\s*$/, idCounter = 0, partial = restArguments(function(func, boundArgs) {
            var placeholder = partial.placeholder, bound = function() {
              for (var position = 0, length = boundArgs.length, args = Array(length), i = 0; length > i; i++) args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
              for (; position < arguments.length; ) args.push(arguments[position++]);
              return executeBound(func, bound, this, this, args);
            };
            return bound;
          });
          partial.placeholder = _$1;
          var bind = restArguments(function(func, context, args) {
            if (!isFunction$1(func)) throw new TypeError("Bind must be called on a function");
            var bound = restArguments(function(callArgs) {
              return executeBound(func, bound, context, this, args.concat(callArgs));
            });
            return bound;
          }), isArrayLike = createSizePropertyCheck(getLength), bindAll = restArguments(function(obj, keys2) {
            keys2 = flatten$1(keys2, false, false);
            var index = keys2.length;
            if (1 > index) throw new Error("bindAll must be passed function names");
            for (; index--; ) {
              var key = keys2[index];
              obj[key] = bind(obj[key], obj);
            }
            return obj;
          }), delay = restArguments(function(func, wait, args) {
            return setTimeout(function() {
              return func.apply(null, args);
            }, wait);
          }), defer = partial(delay, _$1, 1), once = partial(before, 2), findIndex = createPredicateIndexFinder(1), findLastIndex = createPredicateIndexFinder(-1), indexOf = createIndexFinder(1, findIndex, sortedIndex), lastIndexOf = createIndexFinder(-1, findLastIndex), reduce = createReduce(1), reduceRight = createReduce(-1), invoke = restArguments(function(obj, path, args) {
            var contextPath, func;
            return isFunction$1(path) ? func = path : (path = toPath(path), contextPath = path.slice(0, -1), path = path[path.length - 1]), map(obj, function(context) {
              var method = func;
              if (!method) {
                if (contextPath && contextPath.length && (context = deepGet(context, contextPath)), null == context) return void 0;
                method = context[path];
              }
              return null == method ? method : method.apply(context, args);
            });
          }), groupBy = group(function(result2, value, key) {
            has$1(result2, key) ? result2[key].push(value) : result2[key] = [value];
          }), indexBy = group(function(result2, value, key) {
            result2[key] = value;
          }), countBy = group(function(result2, value, key) {
            has$1(result2, key) ? result2[key]++ : result2[key] = 1;
          }), partition = group(function(result2, value, pass) {
            result2[pass ? 0 : 1].push(value);
          }, true), reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g, pick = restArguments(function(obj, keys2) {
            var result2 = {}, iteratee2 = keys2[0];
            if (null == obj) return result2;
            isFunction$1(iteratee2) ? (keys2.length > 1 && (iteratee2 = optimizeCb(iteratee2, keys2[1])), keys2 = allKeys(obj)) : (iteratee2 = keyInObj, keys2 = flatten$1(keys2, false, false), obj = Object(obj));
            for (var i = 0, length = keys2.length; length > i; i++) {
              var key = keys2[i], value = obj[key];
              iteratee2(value, key, obj) && (result2[key] = value);
            }
            return result2;
          }), omit = restArguments(function(obj, keys2) {
            var context, iteratee2 = keys2[0];
            return isFunction$1(iteratee2) ? (iteratee2 = negate(iteratee2), keys2.length > 1 && (context = keys2[1])) : (keys2 = map(flatten$1(keys2, false, false), String), iteratee2 = function(value, key) {
              return !contains(keys2, key);
            }), pick(obj, iteratee2, context);
          }), difference = restArguments(function(array, rest2) {
            return rest2 = flatten$1(rest2, true, true), filter(array, function(value) {
              return !contains(rest2, value);
            });
          }), without = restArguments(function(array, otherArrays) {
            return difference(array, otherArrays);
          }), union = restArguments(function(arrays) {
            return uniq(flatten$1(arrays, true, true));
          }), zip = restArguments(unzip);
          each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(name) {
            var method = ArrayProto[name];
            _$1.prototype[name] = function() {
              var obj = this._wrapped;
              return null != obj && (method.apply(obj, arguments), "shift" !== name && "splice" !== name || 0 !== obj.length || delete obj[0]), chainResult(this, obj);
            };
          }), each(["concat", "join", "slice"], function(name) {
            var method = ArrayProto[name];
            _$1.prototype[name] = function() {
              var obj = this._wrapped;
              return null != obj && (obj = method.apply(obj, arguments)), chainResult(this, obj);
            };
          });
          var allExports = { __proto__: null, VERSION, restArguments, isObject, isNull, isUndefined, isBoolean, isElement, isString, isNumber, isDate, isRegExp, isError, isSymbol, isArrayBuffer, isDataView: isDataView$1, isArray, isFunction: isFunction$1, isArguments: isArguments$1, isFinite: isFinite$1, isNaN: isNaN$1, isTypedArray: isTypedArray$1, isEmpty, isMatch, isEqual, isMap, isWeakMap, isSet, isWeakSet, keys, allKeys, values, pairs, invert, functions, methods: functions, extend, extendOwn, assign: extendOwn, defaults, create, clone, tap, get, has, mapObject, identity, constant, noop, toPath: toPath$1, property, propertyOf, matcher, matches: matcher, times, random, now, escape: _escape, unescape: _unescape, templateSettings, template, result, uniqueId, chain, iteratee, partial, bind, bindAll, memoize, delay, defer, throttle, debounce, wrap, negate, compose, after, before, once, findKey, findIndex, findLastIndex, sortedIndex, indexOf, lastIndexOf, find, detect: find, findWhere, each, forEach: each, map, collect: map, reduce, foldl: reduce, inject: reduce, reduceRight, foldr: reduceRight, filter, select: filter, reject, every, all: every, some, any: some, contains, includes: contains, include: contains, invoke, pluck, where, max, min, shuffle, sample, sortBy, groupBy, indexBy, countBy, partition, toArray, size, pick, omit, first, head: first, take: first, initial, last, rest, tail: rest, drop: rest, compact, flatten, without, uniq, unique: uniq, union, intersection, difference, unzip, transpose: unzip, zip, object, range, chunk, mixin, "default": _$1 }, _ = mixin(allExports);
          return _._ = _, _;
        });
      }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, {}], 68: [function(require2, module2, exports2) {
      (function() {
        var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject, slice = [].slice, hasProp = {}.hasOwnProperty;
        assign = function() {
          var i, key, len, source, sources, target;
          if (target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [], isFunction(Object.assign)) Object.assign.apply(null, arguments);
          else for (i = 0, len = sources.length; len > i; i++) if (source = sources[i], null != source) for (key in source) hasProp.call(source, key) && (target[key] = source[key]);
          return target;
        }, isFunction = function(val) {
          return !!val && "[object Function]" === Object.prototype.toString.call(val);
        }, isObject = function(val) {
          var ref;
          return !!val && ("function" == (ref = typeof val) || "object" === ref);
        }, isArray = function(val) {
          return isFunction(Array.isArray) ? Array.isArray(val) : "[object Array]" === Object.prototype.toString.call(val);
        }, isEmpty = function(val) {
          var key;
          if (isArray(val)) return !val.length;
          for (key in val) if (hasProp.call(val, key)) return false;
          return true;
        }, isPlainObject = function(val) {
          var ctor, proto;
          return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && "function" == typeof ctor && ctor instanceof ctor && Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object);
        }, getValue = function(obj) {
          return isFunction(obj.valueOf) ? obj.valueOf() : obj;
        }, module2.exports.assign = assign, module2.exports.isFunction = isFunction, module2.exports.isObject = isObject, module2.exports.isArray = isArray, module2.exports.isEmpty = isEmpty, module2.exports.isPlainObject = isPlainObject, module2.exports.getValue = getValue;
      }).call(this);
    }, {}], 69: [function(require2, module2, exports2) {
      (function() {
        module2.exports = function() {
          function XMLAttribute2(parent, name, value) {
            if (this.options = parent.options, this.stringify = parent.stringify, this.parent = parent, null == name) throw new Error("Missing attribute name. " + this.debugInfo(name));
            if (null == value) throw new Error("Missing attribute value. " + this.debugInfo(name));
            this.name = this.stringify.attName(name), this.value = this.stringify.attValue(value);
          }
          return XMLAttribute2.prototype.clone = function() {
            return Object.create(this);
          }, XMLAttribute2.prototype.toString = function(options) {
            return this.options.writer.set(options).attribute(this);
          }, XMLAttribute2.prototype.debugInfo = function(name) {
            var ref, ref1;
            return name = name || this.name, null != name || (null != (ref = this.parent) ? ref.name : void 0) ? null == name ? "parent: <" + this.parent.name + ">" : (null != (ref1 = this.parent) ? ref1.name : void 0) ? "attribute: {" + name + "}, parent: <" + this.parent.name + ">" : "attribute: {" + name + "}" : "";
          }, XMLAttribute2;
        }();
      }).call(this);
    }, {}], 70: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLCData2(parent, text) {
            if (XMLCData2.__super__.constructor.call(this, parent), null == text) throw new Error("Missing CDATA text. " + this.debugInfo());
            this.text = this.stringify.cdata(text);
          }
          return extend(XMLCData2, superClass), XMLCData2.prototype.clone = function() {
            return Object.create(this);
          }, XMLCData2.prototype.toString = function(options) {
            return this.options.writer.set(options).cdata(this);
          }, XMLCData2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 71: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLComment2(parent, text) {
            if (XMLComment2.__super__.constructor.call(this, parent), null == text) throw new Error("Missing comment text. " + this.debugInfo());
            this.text = this.stringify.comment(text);
          }
          return extend(XMLComment2, superClass), XMLComment2.prototype.clone = function() {
            return Object.create(this);
          }, XMLComment2.prototype.toString = function(options) {
            return this.options.writer.set(options).comment(this);
          }, XMLComment2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 72: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLDTDAttList2(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
            if (XMLDTDAttList2.__super__.constructor.call(this, parent), null == elementName) throw new Error("Missing DTD element name. " + this.debugInfo());
            if (null == attributeName) throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
            if (!attributeType) throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
            if (!defaultValueType) throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
            if (0 !== defaultValueType.indexOf("#") && (defaultValueType = "#" + defaultValueType), !defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
            if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
            this.elementName = this.stringify.eleName(elementName), this.attributeName = this.stringify.attName(attributeName), this.attributeType = this.stringify.dtdAttType(attributeType), this.defaultValue = this.stringify.dtdAttDefault(defaultValue), this.defaultValueType = defaultValueType;
          }
          return extend(XMLDTDAttList2, superClass), XMLDTDAttList2.prototype.toString = function(options) {
            return this.options.writer.set(options).dtdAttList(this);
          }, XMLDTDAttList2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 73: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLDTDElement2(parent, name, value) {
            if (XMLDTDElement2.__super__.constructor.call(this, parent), null == name) throw new Error("Missing DTD element name. " + this.debugInfo());
            value || (value = "(#PCDATA)"), Array.isArray(value) && (value = "(" + value.join(",") + ")"), this.name = this.stringify.eleName(name), this.value = this.stringify.dtdElementValue(value);
          }
          return extend(XMLDTDElement2, superClass), XMLDTDElement2.prototype.toString = function(options) {
            return this.options.writer.set(options).dtdElement(this);
          }, XMLDTDElement2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 74: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, isObject, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        isObject = require2("./Utility").isObject, XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLDTDEntity2(parent, pe, name, value) {
            if (XMLDTDEntity2.__super__.constructor.call(this, parent), null == name) throw new Error("Missing DTD entity name. " + this.debugInfo(name));
            if (null == value) throw new Error("Missing DTD entity value. " + this.debugInfo(name));
            if (this.pe = !!pe, this.name = this.stringify.eleName(name), isObject(value)) {
              if (!value.pubID && !value.sysID) throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
              if (value.pubID && !value.sysID) throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
              if (null != value.pubID && (this.pubID = this.stringify.dtdPubID(value.pubID)), null != value.sysID && (this.sysID = this.stringify.dtdSysID(value.sysID)), null != value.nData && (this.nData = this.stringify.dtdNData(value.nData)), this.pe && this.nData) throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
            } else this.value = this.stringify.dtdEntityValue(value);
          }
          return extend(XMLDTDEntity2, superClass), XMLDTDEntity2.prototype.toString = function(options) {
            return this.options.writer.set(options).dtdEntity(this);
          }, XMLDTDEntity2;
        }(XMLNode);
      }).call(this);
    }, { "./Utility": 68, "./XMLNode": 81 }], 75: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLDTDNotation2(parent, name, value) {
            if (XMLDTDNotation2.__super__.constructor.call(this, parent), null == name) throw new Error("Missing DTD notation name. " + this.debugInfo(name));
            if (!value.pubID && !value.sysID) throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
            this.name = this.stringify.eleName(name), null != value.pubID && (this.pubID = this.stringify.dtdPubID(value.pubID)), null != value.sysID && (this.sysID = this.stringify.dtdSysID(value.sysID));
          }
          return extend(XMLDTDNotation2, superClass), XMLDTDNotation2.prototype.toString = function(options) {
            return this.options.writer.set(options).dtdNotation(this);
          }, XMLDTDNotation2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 76: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, isObject, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        isObject = require2("./Utility").isObject, XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLDeclaration2(parent, version, encoding, standalone) {
            var ref;
            XMLDeclaration2.__super__.constructor.call(this, parent), isObject(version) && (ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone), version || (version = "1.0"), this.version = this.stringify.xmlVersion(version), null != encoding && (this.encoding = this.stringify.xmlEncoding(encoding)), null != standalone && (this.standalone = this.stringify.xmlStandalone(standalone));
          }
          return extend(XMLDeclaration2, superClass), XMLDeclaration2.prototype.toString = function(options) {
            return this.options.writer.set(options).declaration(this);
          }, XMLDeclaration2;
        }(XMLNode);
      }).call(this);
    }, { "./Utility": 68, "./XMLNode": 81 }], 77: [function(require2, module2, exports2) {
      (function() {
        var XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLNode, isObject, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        isObject = require2("./Utility").isObject, XMLNode = require2("./XMLNode"), XMLDTDAttList = require2("./XMLDTDAttList"), XMLDTDEntity = require2("./XMLDTDEntity"), XMLDTDElement = require2("./XMLDTDElement"), XMLDTDNotation = require2("./XMLDTDNotation"), module2.exports = function(superClass) {
          function XMLDocType2(parent, pubID, sysID) {
            var ref, ref1;
            XMLDocType2.__super__.constructor.call(this, parent), this.name = "!DOCTYPE", this.documentObject = parent, isObject(pubID) && (ref = pubID, pubID = ref.pubID, sysID = ref.sysID), null == sysID && (ref1 = [pubID, sysID], sysID = ref1[0], pubID = ref1[1]), null != pubID && (this.pubID = this.stringify.dtdPubID(pubID)), null != sysID && (this.sysID = this.stringify.dtdSysID(sysID));
          }
          return extend(XMLDocType2, superClass), XMLDocType2.prototype.element = function(name, value) {
            var child;
            return child = new XMLDTDElement(this, name, value), this.children.push(child), this;
          }, XMLDocType2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
            var child;
            return child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue), this.children.push(child), this;
          }, XMLDocType2.prototype.entity = function(name, value) {
            var child;
            return child = new XMLDTDEntity(this, false, name, value), this.children.push(child), this;
          }, XMLDocType2.prototype.pEntity = function(name, value) {
            var child;
            return child = new XMLDTDEntity(this, true, name, value), this.children.push(child), this;
          }, XMLDocType2.prototype.notation = function(name, value) {
            var child;
            return child = new XMLDTDNotation(this, name, value), this.children.push(child), this;
          }, XMLDocType2.prototype.toString = function(options) {
            return this.options.writer.set(options).docType(this);
          }, XMLDocType2.prototype.ele = function(name, value) {
            return this.element(name, value);
          }, XMLDocType2.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
            return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
          }, XMLDocType2.prototype.ent = function(name, value) {
            return this.entity(name, value);
          }, XMLDocType2.prototype.pent = function(name, value) {
            return this.pEntity(name, value);
          }, XMLDocType2.prototype.not = function(name, value) {
            return this.notation(name, value);
          }, XMLDocType2.prototype.up = function() {
            return this.root() || this.documentObject;
          }, XMLDocType2;
        }(XMLNode);
      }).call(this);
    }, { "./Utility": 68, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLNode": 81 }], 78: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, XMLStringWriter, XMLStringifier, isPlainObject, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        isPlainObject = require2("./Utility").isPlainObject, XMLNode = require2("./XMLNode"), XMLStringifier = require2("./XMLStringifier"), XMLStringWriter = require2("./XMLStringWriter"), module2.exports = function(superClass) {
          function XMLDocument2(options) {
            XMLDocument2.__super__.constructor.call(this, null), this.name = "?xml", options || (options = {}), options.writer || (options.writer = new XMLStringWriter()), this.options = options, this.stringify = new XMLStringifier(options), this.isDocument = true;
          }
          return extend(XMLDocument2, superClass), XMLDocument2.prototype.end = function(writer) {
            var writerOptions;
            return writer ? isPlainObject(writer) && (writerOptions = writer, writer = this.options.writer.set(writerOptions)) : writer = this.options.writer, writer.document(this);
          }, XMLDocument2.prototype.toString = function(options) {
            return this.options.writer.set(options).document(this);
          }, XMLDocument2;
        }(XMLNode);
      }).call(this);
    }, { "./Utility": 68, "./XMLNode": 81, "./XMLStringWriter": 85, "./XMLStringifier": 86 }], 79: [function(require2, module2, exports2) {
      (function() {
        var XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject, ref, hasProp = {}.hasOwnProperty;
        ref = require2("./Utility"), isObject = ref.isObject, isFunction = ref.isFunction, isPlainObject = ref.isPlainObject, getValue = ref.getValue, XMLElement = require2("./XMLElement"), XMLCData = require2("./XMLCData"), XMLComment = require2("./XMLComment"), XMLRaw = require2("./XMLRaw"), XMLText = require2("./XMLText"), XMLProcessingInstruction = require2("./XMLProcessingInstruction"), XMLDeclaration = require2("./XMLDeclaration"), XMLDocType = require2("./XMLDocType"), XMLDTDAttList = require2("./XMLDTDAttList"), XMLDTDEntity = require2("./XMLDTDEntity"), XMLDTDElement = require2("./XMLDTDElement"), XMLDTDNotation = require2("./XMLDTDNotation"), XMLAttribute = require2("./XMLAttribute"), XMLStringifier = require2("./XMLStringifier"), XMLStringWriter = require2("./XMLStringWriter"), module2.exports = function() {
          function XMLDocumentCB2(options, onData, onEnd) {
            var writerOptions;
            this.name = "?xml", options || (options = {}), options.writer ? isPlainObject(options.writer) && (writerOptions = options.writer, options.writer = new XMLStringWriter(writerOptions)) : options.writer = new XMLStringWriter(options), this.options = options, this.writer = options.writer, this.stringify = new XMLStringifier(options), this.onDataCallback = onData || function() {
            }, this.onEndCallback = onEnd || function() {
            }, this.currentNode = null, this.currentLevel = -1, this.openTags = {}, this.documentStarted = false, this.documentCompleted = false, this.root = null;
          }
          return XMLDocumentCB2.prototype.node = function(name, attributes, text) {
            var ref1;
            if (null == name) throw new Error("Missing node name.");
            if (this.root && -1 === this.currentLevel) throw new Error("Document can only have one root node. " + this.debugInfo(name));
            return this.openCurrent(), name = getValue(name), null == attributes && (attributes = {}), attributes = getValue(attributes), isObject(attributes) || (ref1 = [attributes, text], text = ref1[0], attributes = ref1[1]), this.currentNode = new XMLElement(this, name, attributes), this.currentNode.children = false, this.currentLevel++, this.openTags[this.currentLevel] = this.currentNode, null != text && this.text(text), this;
          }, XMLDocumentCB2.prototype.element = function(name, attributes, text) {
            return this.currentNode && this.currentNode instanceof XMLDocType ? this.dtdElement.apply(this, arguments) : this.node(name, attributes, text);
          }, XMLDocumentCB2.prototype.attribute = function(name, value) {
            var attName, attValue;
            if (!this.currentNode || this.currentNode.children) throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
            if (null != name && (name = getValue(name)), isObject(name)) for (attName in name) hasProp.call(name, attName) && (attValue = name[attName], this.attribute(attName, attValue));
            else isFunction(value) && (value = value.apply()), this.options.skipNullAttributes && null == value || (this.currentNode.attributes[name] = new XMLAttribute(this, name, value));
            return this;
          }, XMLDocumentCB2.prototype.text = function(value) {
            var node;
            return this.openCurrent(), node = new XMLText(this, value), this.onData(this.writer.text(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.cdata = function(value) {
            var node;
            return this.openCurrent(), node = new XMLCData(this, value), this.onData(this.writer.cdata(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.comment = function(value) {
            var node;
            return this.openCurrent(), node = new XMLComment(this, value), this.onData(this.writer.comment(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.raw = function(value) {
            var node;
            return this.openCurrent(), node = new XMLRaw(this, value), this.onData(this.writer.raw(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.instruction = function(target, value) {
            var i, insTarget, insValue, len, node;
            if (this.openCurrent(), null != target && (target = getValue(target)), null != value && (value = getValue(value)), Array.isArray(target)) for (i = 0, len = target.length; len > i; i++) insTarget = target[i], this.instruction(insTarget);
            else if (isObject(target)) for (insTarget in target) hasProp.call(target, insTarget) && (insValue = target[insTarget], this.instruction(insTarget, insValue));
            else isFunction(value) && (value = value.apply()), node = new XMLProcessingInstruction(this, target, value), this.onData(this.writer.processingInstruction(node, this.currentLevel + 1), this.currentLevel + 1);
            return this;
          }, XMLDocumentCB2.prototype.declaration = function(version, encoding, standalone) {
            var node;
            if (this.openCurrent(), this.documentStarted) throw new Error("declaration() must be the first node.");
            return node = new XMLDeclaration(this, version, encoding, standalone), this.onData(this.writer.declaration(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.doctype = function(root, pubID, sysID) {
            if (this.openCurrent(), null == root) throw new Error("Missing root node name.");
            if (this.root) throw new Error("dtd() must come before the root node.");
            return this.currentNode = new XMLDocType(this, pubID, sysID), this.currentNode.rootNodeName = root, this.currentNode.children = false, this.currentLevel++, this.openTags[this.currentLevel] = this.currentNode, this;
          }, XMLDocumentCB2.prototype.dtdElement = function(name, value) {
            var node;
            return this.openCurrent(), node = new XMLDTDElement(this, name, value), this.onData(this.writer.dtdElement(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
            var node;
            return this.openCurrent(), node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue), this.onData(this.writer.dtdAttList(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.entity = function(name, value) {
            var node;
            return this.openCurrent(), node = new XMLDTDEntity(this, false, name, value), this.onData(this.writer.dtdEntity(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.pEntity = function(name, value) {
            var node;
            return this.openCurrent(), node = new XMLDTDEntity(this, true, name, value), this.onData(this.writer.dtdEntity(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.notation = function(name, value) {
            var node;
            return this.openCurrent(), node = new XMLDTDNotation(this, name, value), this.onData(this.writer.dtdNotation(node, this.currentLevel + 1), this.currentLevel + 1), this;
          }, XMLDocumentCB2.prototype.up = function() {
            if (this.currentLevel < 0) throw new Error("The document node has no parent.");
            return this.currentNode ? (this.currentNode.children ? this.closeNode(this.currentNode) : this.openNode(this.currentNode), this.currentNode = null) : this.closeNode(this.openTags[this.currentLevel]), delete this.openTags[this.currentLevel], this.currentLevel--, this;
          }, XMLDocumentCB2.prototype.end = function() {
            for (; this.currentLevel >= 0; ) this.up();
            return this.onEnd();
          }, XMLDocumentCB2.prototype.openCurrent = function() {
            return this.currentNode ? (this.currentNode.children = true, this.openNode(this.currentNode)) : void 0;
          }, XMLDocumentCB2.prototype.openNode = function(node) {
            return node.isOpen ? void 0 : (!this.root && 0 === this.currentLevel && node instanceof XMLElement && (this.root = node), this.onData(this.writer.openNode(node, this.currentLevel), this.currentLevel), node.isOpen = true);
          }, XMLDocumentCB2.prototype.closeNode = function(node) {
            return node.isClosed ? void 0 : (this.onData(this.writer.closeNode(node, this.currentLevel), this.currentLevel), node.isClosed = true);
          }, XMLDocumentCB2.prototype.onData = function(chunk, level) {
            return this.documentStarted = true, this.onDataCallback(chunk, level + 1);
          }, XMLDocumentCB2.prototype.onEnd = function() {
            return this.documentCompleted = true, this.onEndCallback();
          }, XMLDocumentCB2.prototype.debugInfo = function(name) {
            return null == name ? "" : "node: <" + name + ">";
          }, XMLDocumentCB2.prototype.ele = function() {
            return this.element.apply(this, arguments);
          }, XMLDocumentCB2.prototype.nod = function(name, attributes, text) {
            return this.node(name, attributes, text);
          }, XMLDocumentCB2.prototype.txt = function(value) {
            return this.text(value);
          }, XMLDocumentCB2.prototype.dat = function(value) {
            return this.cdata(value);
          }, XMLDocumentCB2.prototype.com = function(value) {
            return this.comment(value);
          }, XMLDocumentCB2.prototype.ins = function(target, value) {
            return this.instruction(target, value);
          }, XMLDocumentCB2.prototype.dec = function(version, encoding, standalone) {
            return this.declaration(version, encoding, standalone);
          }, XMLDocumentCB2.prototype.dtd = function(root, pubID, sysID) {
            return this.doctype(root, pubID, sysID);
          }, XMLDocumentCB2.prototype.e = function(name, attributes, text) {
            return this.element(name, attributes, text);
          }, XMLDocumentCB2.prototype.n = function(name, attributes, text) {
            return this.node(name, attributes, text);
          }, XMLDocumentCB2.prototype.t = function(value) {
            return this.text(value);
          }, XMLDocumentCB2.prototype.d = function(value) {
            return this.cdata(value);
          }, XMLDocumentCB2.prototype.c = function(value) {
            return this.comment(value);
          }, XMLDocumentCB2.prototype.r = function(value) {
            return this.raw(value);
          }, XMLDocumentCB2.prototype.i = function(target, value) {
            return this.instruction(target, value);
          }, XMLDocumentCB2.prototype.att = function() {
            return this.currentNode && this.currentNode instanceof XMLDocType ? this.attList.apply(this, arguments) : this.attribute.apply(this, arguments);
          }, XMLDocumentCB2.prototype.a = function() {
            return this.currentNode && this.currentNode instanceof XMLDocType ? this.attList.apply(this, arguments) : this.attribute.apply(this, arguments);
          }, XMLDocumentCB2.prototype.ent = function(name, value) {
            return this.entity(name, value);
          }, XMLDocumentCB2.prototype.pent = function(name, value) {
            return this.pEntity(name, value);
          }, XMLDocumentCB2.prototype.not = function(name, value) {
            return this.notation(name, value);
          }, XMLDocumentCB2;
        }();
      }).call(this);
    }, { "./Utility": 68, "./XMLAttribute": 69, "./XMLCData": 70, "./XMLComment": 71, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLStringWriter": 85, "./XMLStringifier": 86, "./XMLText": 87 }], 80: [function(require2, module2, exports2) {
      (function() {
        var XMLAttribute, XMLNode, getValue, isFunction, isObject, ref, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        ref = require2("./Utility"), isObject = ref.isObject, isFunction = ref.isFunction, getValue = ref.getValue, XMLNode = require2("./XMLNode"), XMLAttribute = require2("./XMLAttribute"), module2.exports = function(superClass) {
          function XMLElement2(parent, name, attributes) {
            if (XMLElement2.__super__.constructor.call(this, parent), null == name) throw new Error("Missing element name. " + this.debugInfo());
            this.name = this.stringify.eleName(name), this.attributes = {}, null != attributes && this.attribute(attributes), parent.isDocument && (this.isRoot = true, this.documentObject = parent, parent.rootObject = this);
          }
          return extend(XMLElement2, superClass), XMLElement2.prototype.clone = function() {
            var att, attName, clonedSelf, ref1;
            clonedSelf = Object.create(this), clonedSelf.isRoot && (clonedSelf.documentObject = null), clonedSelf.attributes = {}, ref1 = this.attributes;
            for (attName in ref1) hasProp.call(ref1, attName) && (att = ref1[attName], clonedSelf.attributes[attName] = att.clone());
            return clonedSelf.children = [], this.children.forEach(function(child) {
              var clonedChild;
              return clonedChild = child.clone(), clonedChild.parent = clonedSelf, clonedSelf.children.push(clonedChild);
            }), clonedSelf;
          }, XMLElement2.prototype.attribute = function(name, value) {
            var attName, attValue;
            if (null != name && (name = getValue(name)), isObject(name)) for (attName in name) hasProp.call(name, attName) && (attValue = name[attName], this.attribute(attName, attValue));
            else isFunction(value) && (value = value.apply()), this.options.skipNullAttributes && null == value || (this.attributes[name] = new XMLAttribute(this, name, value));
            return this;
          }, XMLElement2.prototype.removeAttribute = function(name) {
            var attName, i, len;
            if (null == name) throw new Error("Missing attribute name. " + this.debugInfo());
            if (name = getValue(name), Array.isArray(name)) for (i = 0, len = name.length; len > i; i++) attName = name[i], delete this.attributes[attName];
            else delete this.attributes[name];
            return this;
          }, XMLElement2.prototype.toString = function(options) {
            return this.options.writer.set(options).element(this);
          }, XMLElement2.prototype.att = function(name, value) {
            return this.attribute(name, value);
          }, XMLElement2.prototype.a = function(name, value) {
            return this.attribute(name, value);
          }, XMLElement2;
        }(XMLNode);
      }).call(this);
    }, { "./Utility": 68, "./XMLAttribute": 69, "./XMLNode": 81 }], 81: [function(require2, module2, exports2) {
      (function() {
        var XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject, ref, hasProp = {}.hasOwnProperty;
        ref = require2("./Utility"), isObject = ref.isObject, isFunction = ref.isFunction, isEmpty = ref.isEmpty, getValue = ref.getValue, XMLElement = null, XMLCData = null, XMLComment = null, XMLDeclaration = null, XMLDocType = null, XMLRaw = null, XMLText = null, XMLProcessingInstruction = null, module2.exports = function() {
          function XMLNode2(parent) {
            this.parent = parent, this.parent && (this.options = this.parent.options, this.stringify = this.parent.stringify), this.children = [], XMLElement || (XMLElement = require2("./XMLElement"), XMLCData = require2("./XMLCData"), XMLComment = require2("./XMLComment"), XMLDeclaration = require2("./XMLDeclaration"), XMLDocType = require2("./XMLDocType"), XMLRaw = require2("./XMLRaw"), XMLText = require2("./XMLText"), XMLProcessingInstruction = require2("./XMLProcessingInstruction"));
          }
          return XMLNode2.prototype.element = function(name, attributes, text) {
            var childNode, item, j, k, key, lastChild, len, len1, ref1, val;
            if (lastChild = null, null == attributes && (attributes = {}), attributes = getValue(attributes), isObject(attributes) || (ref1 = [attributes, text], text = ref1[0], attributes = ref1[1]), null != name && (name = getValue(name)), Array.isArray(name)) for (j = 0, len = name.length; len > j; j++) item = name[j], lastChild = this.element(item);
            else if (isFunction(name)) lastChild = this.element(name.apply());
            else if (isObject(name)) {
              for (key in name) if (hasProp.call(name, key)) if (val = name[key], isFunction(val) && (val = val.apply()), isObject(val) && isEmpty(val) && (val = null), !this.options.ignoreDecorators && this.stringify.convertAttKey && 0 === key.indexOf(this.stringify.convertAttKey)) lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
              else if (!this.options.separateArrayItems && Array.isArray(val)) for (k = 0, len1 = val.length; len1 > k; k++) item = val[k], childNode = {}, childNode[key] = item, lastChild = this.element(childNode);
              else isObject(val) ? (lastChild = this.element(key), lastChild.element(val)) : lastChild = this.element(key, val);
            } else lastChild = !this.options.ignoreDecorators && this.stringify.convertTextKey && 0 === name.indexOf(this.stringify.convertTextKey) ? this.text(text) : !this.options.ignoreDecorators && this.stringify.convertCDataKey && 0 === name.indexOf(this.stringify.convertCDataKey) ? this.cdata(text) : !this.options.ignoreDecorators && this.stringify.convertCommentKey && 0 === name.indexOf(this.stringify.convertCommentKey) ? this.comment(text) : !this.options.ignoreDecorators && this.stringify.convertRawKey && 0 === name.indexOf(this.stringify.convertRawKey) ? this.raw(text) : !this.options.ignoreDecorators && this.stringify.convertPIKey && 0 === name.indexOf(this.stringify.convertPIKey) ? this.instruction(name.substr(this.stringify.convertPIKey.length), text) : this.node(name, attributes, text);
            if (null == lastChild) throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
            return lastChild;
          }, XMLNode2.prototype.insertBefore = function(name, attributes, text) {
            var child, i, removed;
            if (this.isRoot) throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
            return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i), child = this.parent.element(name, attributes, text), Array.prototype.push.apply(this.parent.children, removed), child;
          }, XMLNode2.prototype.insertAfter = function(name, attributes, text) {
            var child, i, removed;
            if (this.isRoot) throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
            return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i + 1), child = this.parent.element(name, attributes, text), Array.prototype.push.apply(this.parent.children, removed), child;
          }, XMLNode2.prototype.remove = function() {
            var i;
            if (this.isRoot) throw new Error("Cannot remove the root element. " + this.debugInfo());
            return i = this.parent.children.indexOf(this), [].splice.apply(this.parent.children, [i, i - i + 1].concat([])), this.parent;
          }, XMLNode2.prototype.node = function(name, attributes, text) {
            var child, ref1;
            return null != name && (name = getValue(name)), attributes || (attributes = {}), attributes = getValue(attributes), isObject(attributes) || (ref1 = [attributes, text], text = ref1[0], attributes = ref1[1]), child = new XMLElement(this, name, attributes), null != text && child.text(text), this.children.push(child), child;
          }, XMLNode2.prototype.text = function(value) {
            var child;
            return child = new XMLText(this, value), this.children.push(child), this;
          }, XMLNode2.prototype.cdata = function(value) {
            var child;
            return child = new XMLCData(this, value), this.children.push(child), this;
          }, XMLNode2.prototype.comment = function(value) {
            var child;
            return child = new XMLComment(this, value), this.children.push(child), this;
          }, XMLNode2.prototype.commentBefore = function(value) {
            var i, removed;
            return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i), this.parent.comment(value), Array.prototype.push.apply(this.parent.children, removed), this;
          }, XMLNode2.prototype.commentAfter = function(value) {
            var i, removed;
            return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i + 1), this.parent.comment(value), Array.prototype.push.apply(this.parent.children, removed), this;
          }, XMLNode2.prototype.raw = function(value) {
            var child;
            return child = new XMLRaw(this, value), this.children.push(child), this;
          }, XMLNode2.prototype.instruction = function(target, value) {
            var insTarget, insValue, instruction, j, len;
            if (null != target && (target = getValue(target)), null != value && (value = getValue(value)), Array.isArray(target)) for (j = 0, len = target.length; len > j; j++) insTarget = target[j], this.instruction(insTarget);
            else if (isObject(target)) for (insTarget in target) hasProp.call(target, insTarget) && (insValue = target[insTarget], this.instruction(insTarget, insValue));
            else isFunction(value) && (value = value.apply()), instruction = new XMLProcessingInstruction(this, target, value), this.children.push(instruction);
            return this;
          }, XMLNode2.prototype.instructionBefore = function(target, value) {
            var i, removed;
            return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i), this.parent.instruction(target, value), Array.prototype.push.apply(this.parent.children, removed), this;
          }, XMLNode2.prototype.instructionAfter = function(target, value) {
            var i, removed;
            return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i + 1), this.parent.instruction(target, value), Array.prototype.push.apply(this.parent.children, removed), this;
          }, XMLNode2.prototype.declaration = function(version, encoding, standalone) {
            var doc, xmldec;
            return doc = this.document(), xmldec = new XMLDeclaration(doc, version, encoding, standalone), doc.children[0] instanceof XMLDeclaration ? doc.children[0] = xmldec : doc.children.unshift(xmldec), doc.root() || doc;
          }, XMLNode2.prototype.doctype = function(pubID, sysID) {
            var child, doc, doctype, i, j, k, len, len1, ref1, ref2;
            for (doc = this.document(), doctype = new XMLDocType(doc, pubID, sysID), ref1 = doc.children, i = j = 0, len = ref1.length; len > j; i = ++j) if (child = ref1[i], child instanceof XMLDocType) return doc.children[i] = doctype, doctype;
            for (ref2 = doc.children, i = k = 0, len1 = ref2.length; len1 > k; i = ++k) if (child = ref2[i], child.isRoot) return doc.children.splice(i, 0, doctype), doctype;
            return doc.children.push(doctype), doctype;
          }, XMLNode2.prototype.up = function() {
            if (this.isRoot) throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
            return this.parent;
          }, XMLNode2.prototype.root = function() {
            var node;
            for (node = this; node; ) {
              if (node.isDocument) return node.rootObject;
              if (node.isRoot) return node;
              node = node.parent;
            }
          }, XMLNode2.prototype.document = function() {
            var node;
            for (node = this; node; ) {
              if (node.isDocument) return node;
              node = node.parent;
            }
          }, XMLNode2.prototype.end = function(options) {
            return this.document().end(options);
          }, XMLNode2.prototype.prev = function() {
            var i;
            if (i = this.parent.children.indexOf(this), 1 > i) throw new Error("Already at the first node. " + this.debugInfo());
            return this.parent.children[i - 1];
          }, XMLNode2.prototype.next = function() {
            var i;
            if (i = this.parent.children.indexOf(this), -1 === i || i === this.parent.children.length - 1) throw new Error("Already at the last node. " + this.debugInfo());
            return this.parent.children[i + 1];
          }, XMLNode2.prototype.importDocument = function(doc) {
            var clonedRoot;
            return clonedRoot = doc.root().clone(), clonedRoot.parent = this, clonedRoot.isRoot = false, this.children.push(clonedRoot), this;
          }, XMLNode2.prototype.debugInfo = function(name) {
            var ref1, ref2;
            return name = name || this.name, null != name || (null != (ref1 = this.parent) ? ref1.name : void 0) ? null == name ? "parent: <" + this.parent.name + ">" : (null != (ref2 = this.parent) ? ref2.name : void 0) ? "node: <" + name + ">, parent: <" + this.parent.name + ">" : "node: <" + name + ">" : "";
          }, XMLNode2.prototype.ele = function(name, attributes, text) {
            return this.element(name, attributes, text);
          }, XMLNode2.prototype.nod = function(name, attributes, text) {
            return this.node(name, attributes, text);
          }, XMLNode2.prototype.txt = function(value) {
            return this.text(value);
          }, XMLNode2.prototype.dat = function(value) {
            return this.cdata(value);
          }, XMLNode2.prototype.com = function(value) {
            return this.comment(value);
          }, XMLNode2.prototype.ins = function(target, value) {
            return this.instruction(target, value);
          }, XMLNode2.prototype.doc = function() {
            return this.document();
          }, XMLNode2.prototype.dec = function(version, encoding, standalone) {
            return this.declaration(version, encoding, standalone);
          }, XMLNode2.prototype.dtd = function(pubID, sysID) {
            return this.doctype(pubID, sysID);
          }, XMLNode2.prototype.e = function(name, attributes, text) {
            return this.element(name, attributes, text);
          }, XMLNode2.prototype.n = function(name, attributes, text) {
            return this.node(name, attributes, text);
          }, XMLNode2.prototype.t = function(value) {
            return this.text(value);
          }, XMLNode2.prototype.d = function(value) {
            return this.cdata(value);
          }, XMLNode2.prototype.c = function(value) {
            return this.comment(value);
          }, XMLNode2.prototype.r = function(value) {
            return this.raw(value);
          }, XMLNode2.prototype.i = function(target, value) {
            return this.instruction(target, value);
          }, XMLNode2.prototype.u = function() {
            return this.up();
          }, XMLNode2.prototype.importXMLBuilder = function(doc) {
            return this.importDocument(doc);
          }, XMLNode2;
        }();
      }).call(this);
    }, { "./Utility": 68, "./XMLCData": 70, "./XMLComment": 71, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLText": 87 }], 82: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLProcessingInstruction2(parent, target, value) {
            if (XMLProcessingInstruction2.__super__.constructor.call(this, parent), null == target) throw new Error("Missing instruction target. " + this.debugInfo());
            this.target = this.stringify.insTarget(target), value && (this.value = this.stringify.insValue(value));
          }
          return extend(XMLProcessingInstruction2, superClass), XMLProcessingInstruction2.prototype.clone = function() {
            return Object.create(this);
          }, XMLProcessingInstruction2.prototype.toString = function(options) {
            return this.options.writer.set(options).processingInstruction(this);
          }, XMLProcessingInstruction2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 83: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLRaw2(parent, text) {
            if (XMLRaw2.__super__.constructor.call(this, parent), null == text) throw new Error("Missing raw text. " + this.debugInfo());
            this.value = this.stringify.raw(text);
          }
          return extend(XMLRaw2, superClass), XMLRaw2.prototype.clone = function() {
            return Object.create(this);
          }, XMLRaw2.prototype.toString = function(options) {
            return this.options.writer.set(options).raw(this);
          }, XMLRaw2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 84: [function(require2, module2, exports2) {
      (function() {
        var XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLDeclaration = require2("./XMLDeclaration"), XMLDocType = require2("./XMLDocType"), XMLCData = require2("./XMLCData"), XMLComment = require2("./XMLComment"), XMLElement = require2("./XMLElement"), XMLRaw = require2("./XMLRaw"), XMLText = require2("./XMLText"), XMLProcessingInstruction = require2("./XMLProcessingInstruction"), XMLDTDAttList = require2("./XMLDTDAttList"), XMLDTDElement = require2("./XMLDTDElement"), XMLDTDEntity = require2("./XMLDTDEntity"), XMLDTDNotation = require2("./XMLDTDNotation"), XMLWriterBase = require2("./XMLWriterBase"), module2.exports = function(superClass) {
          function XMLStreamWriter2(stream, options) {
            XMLStreamWriter2.__super__.constructor.call(this, options), this.stream = stream;
          }
          return extend(XMLStreamWriter2, superClass), XMLStreamWriter2.prototype.document = function(doc) {
            var child, i, j, len, len1, ref, ref1, results;
            for (ref = doc.children, i = 0, len = ref.length; len > i; i++) child = ref[i], child.isLastRootNode = false;
            for (doc.children[doc.children.length - 1].isLastRootNode = true, ref1 = doc.children, results = [], j = 0, len1 = ref1.length; len1 > j; j++) switch (child = ref1[j], false) {
              case !(child instanceof XMLDeclaration):
                results.push(this.declaration(child));
                break;
              case !(child instanceof XMLDocType):
                results.push(this.docType(child));
                break;
              case !(child instanceof XMLComment):
                results.push(this.comment(child));
                break;
              case !(child instanceof XMLProcessingInstruction):
                results.push(this.processingInstruction(child));
                break;
              default:
                results.push(this.element(child));
            }
            return results;
          }, XMLStreamWriter2.prototype.attribute = function(att) {
            return this.stream.write(" " + att.name + '="' + att.value + '"');
          }, XMLStreamWriter2.prototype.cdata = function(node, level) {
            return this.stream.write(this.space(level) + "<![CDATA[" + node.text + "]]>" + this.endline(node));
          }, XMLStreamWriter2.prototype.comment = function(node, level) {
            return this.stream.write(this.space(level) + "<!-- " + node.text + " -->" + this.endline(node));
          }, XMLStreamWriter2.prototype.declaration = function(node, level) {
            return this.stream.write(this.space(level)), this.stream.write('<?xml version="' + node.version + '"'), null != node.encoding && this.stream.write(' encoding="' + node.encoding + '"'), null != node.standalone && this.stream.write(' standalone="' + node.standalone + '"'), this.stream.write(this.spacebeforeslash + "?>"), this.stream.write(this.endline(node));
          }, XMLStreamWriter2.prototype.docType = function(node, level) {
            var child, i, len, ref;
            if (level || (level = 0), this.stream.write(this.space(level)), this.stream.write("<!DOCTYPE " + node.root().name), node.pubID && node.sysID ? this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"') : node.sysID && this.stream.write(' SYSTEM "' + node.sysID + '"'), node.children.length > 0) {
              for (this.stream.write(" ["), this.stream.write(this.endline(node)), ref = node.children, i = 0, len = ref.length; len > i; i++) switch (child = ref[i], false) {
                case !(child instanceof XMLDTDAttList):
                  this.dtdAttList(child, level + 1);
                  break;
                case !(child instanceof XMLDTDElement):
                  this.dtdElement(child, level + 1);
                  break;
                case !(child instanceof XMLDTDEntity):
                  this.dtdEntity(child, level + 1);
                  break;
                case !(child instanceof XMLDTDNotation):
                  this.dtdNotation(child, level + 1);
                  break;
                case !(child instanceof XMLCData):
                  this.cdata(child, level + 1);
                  break;
                case !(child instanceof XMLComment):
                  this.comment(child, level + 1);
                  break;
                case !(child instanceof XMLProcessingInstruction):
                  this.processingInstruction(child, level + 1);
                  break;
                default:
                  throw new Error("Unknown DTD node type: " + child.constructor.name);
              }
              this.stream.write("]");
            }
            return this.stream.write(this.spacebeforeslash + ">"), this.stream.write(this.endline(node));
          }, XMLStreamWriter2.prototype.element = function(node, level) {
            var att, child, i, len, name, ref, ref1, space;
            level || (level = 0), space = this.space(level), this.stream.write(space + "<" + node.name), ref = node.attributes;
            for (name in ref) hasProp.call(ref, name) && (att = ref[name], this.attribute(att));
            if (0 === node.children.length || node.children.every(function(e) {
              return "" === e.value;
            })) this.allowEmpty ? this.stream.write("></" + node.name + ">") : this.stream.write(this.spacebeforeslash + "/>");
            else if (this.pretty && 1 === node.children.length && null != node.children[0].value) this.stream.write(">"), this.stream.write(node.children[0].value), this.stream.write("</" + node.name + ">");
            else {
              for (this.stream.write(">" + this.newline), ref1 = node.children, i = 0, len = ref1.length; len > i; i++) switch (child = ref1[i], false) {
                case !(child instanceof XMLCData):
                  this.cdata(child, level + 1);
                  break;
                case !(child instanceof XMLComment):
                  this.comment(child, level + 1);
                  break;
                case !(child instanceof XMLElement):
                  this.element(child, level + 1);
                  break;
                case !(child instanceof XMLRaw):
                  this.raw(child, level + 1);
                  break;
                case !(child instanceof XMLText):
                  this.text(child, level + 1);
                  break;
                case !(child instanceof XMLProcessingInstruction):
                  this.processingInstruction(child, level + 1);
                  break;
                default:
                  throw new Error("Unknown XML node type: " + child.constructor.name);
              }
              this.stream.write(space + "</" + node.name + ">");
            }
            return this.stream.write(this.endline(node));
          }, XMLStreamWriter2.prototype.processingInstruction = function(node, level) {
            return this.stream.write(this.space(level) + "<?" + node.target), node.value && this.stream.write(" " + node.value), this.stream.write(this.spacebeforeslash + "?>" + this.endline(node));
          }, XMLStreamWriter2.prototype.raw = function(node, level) {
            return this.stream.write(this.space(level) + node.value + this.endline(node));
          }, XMLStreamWriter2.prototype.text = function(node, level) {
            return this.stream.write(this.space(level) + node.value + this.endline(node));
          }, XMLStreamWriter2.prototype.dtdAttList = function(node, level) {
            return this.stream.write(this.space(level) + "<!ATTLIST " + node.elementName + " " + node.attributeName + " " + node.attributeType), "#DEFAULT" !== node.defaultValueType && this.stream.write(" " + node.defaultValueType), node.defaultValue && this.stream.write(' "' + node.defaultValue + '"'), this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
          }, XMLStreamWriter2.prototype.dtdElement = function(node, level) {
            return this.stream.write(this.space(level) + "<!ELEMENT " + node.name + " " + node.value), this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
          }, XMLStreamWriter2.prototype.dtdEntity = function(node, level) {
            return this.stream.write(this.space(level) + "<!ENTITY"), node.pe && this.stream.write(" %"), this.stream.write(" " + node.name), node.value ? this.stream.write(' "' + node.value + '"') : (node.pubID && node.sysID ? this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"') : node.sysID && this.stream.write(' SYSTEM "' + node.sysID + '"'), node.nData && this.stream.write(" NDATA " + node.nData)), this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
          }, XMLStreamWriter2.prototype.dtdNotation = function(node, level) {
            return this.stream.write(this.space(level) + "<!NOTATION " + node.name), node.pubID && node.sysID ? this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"') : node.pubID ? this.stream.write(' PUBLIC "' + node.pubID + '"') : node.sysID && this.stream.write(' SYSTEM "' + node.sysID + '"'), this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
          }, XMLStreamWriter2.prototype.endline = function(node) {
            return node.isLastRootNode ? "" : this.newline;
          }, XMLStreamWriter2;
        }(XMLWriterBase);
      }).call(this);
    }, { "./XMLCData": 70, "./XMLComment": 71, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLText": 87, "./XMLWriterBase": 88 }], 85: [function(require2, module2, exports2) {
      (function() {
        var XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLDeclaration = require2("./XMLDeclaration"), XMLDocType = require2("./XMLDocType"), XMLCData = require2("./XMLCData"), XMLComment = require2("./XMLComment"), XMLElement = require2("./XMLElement"), XMLRaw = require2("./XMLRaw"), XMLText = require2("./XMLText"), XMLProcessingInstruction = require2("./XMLProcessingInstruction"), XMLDTDAttList = require2("./XMLDTDAttList"), XMLDTDElement = require2("./XMLDTDElement"), XMLDTDEntity = require2("./XMLDTDEntity"), XMLDTDNotation = require2("./XMLDTDNotation"), XMLWriterBase = require2("./XMLWriterBase"), module2.exports = function(superClass) {
          function XMLStringWriter2(options) {
            XMLStringWriter2.__super__.constructor.call(this, options);
          }
          return extend(XMLStringWriter2, superClass), XMLStringWriter2.prototype.document = function(doc) {
            var child, i, len, r, ref;
            for (this.textispresent = false, r = "", ref = doc.children, i = 0, len = ref.length; len > i; i++) child = ref[i], r += function() {
              switch (false) {
                case !(child instanceof XMLDeclaration):
                  return this.declaration(child);
                case !(child instanceof XMLDocType):
                  return this.docType(child);
                case !(child instanceof XMLComment):
                  return this.comment(child);
                case !(child instanceof XMLProcessingInstruction):
                  return this.processingInstruction(child);
                default:
                  return this.element(child, 0);
              }
            }.call(this);
            return this.pretty && r.slice(-this.newline.length) === this.newline && (r = r.slice(0, -this.newline.length)), r;
          }, XMLStringWriter2.prototype.attribute = function(att) {
            return " " + att.name + '="' + att.value + '"';
          }, XMLStringWriter2.prototype.cdata = function(node, level) {
            return this.space(level) + "<![CDATA[" + node.text + "]]>" + this.newline;
          }, XMLStringWriter2.prototype.comment = function(node, level) {
            return this.space(level) + "<!-- " + node.text + " -->" + this.newline;
          }, XMLStringWriter2.prototype.declaration = function(node, level) {
            var r;
            return r = this.space(level), r += '<?xml version="' + node.version + '"', null != node.encoding && (r += ' encoding="' + node.encoding + '"'), null != node.standalone && (r += ' standalone="' + node.standalone + '"'), r += this.spacebeforeslash + "?>", r += this.newline;
          }, XMLStringWriter2.prototype.docType = function(node, level) {
            var child, i, len, r, ref;
            if (level || (level = 0), r = this.space(level), r += "<!DOCTYPE " + node.root().name, node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), node.children.length > 0) {
              for (r += " [", r += this.newline, ref = node.children, i = 0, len = ref.length; len > i; i++) child = ref[i], r += function() {
                switch (false) {
                  case !(child instanceof XMLDTDAttList):
                    return this.dtdAttList(child, level + 1);
                  case !(child instanceof XMLDTDElement):
                    return this.dtdElement(child, level + 1);
                  case !(child instanceof XMLDTDEntity):
                    return this.dtdEntity(child, level + 1);
                  case !(child instanceof XMLDTDNotation):
                    return this.dtdNotation(child, level + 1);
                  case !(child instanceof XMLCData):
                    return this.cdata(child, level + 1);
                  case !(child instanceof XMLComment):
                    return this.comment(child, level + 1);
                  case !(child instanceof XMLProcessingInstruction):
                    return this.processingInstruction(child, level + 1);
                  default:
                    throw new Error("Unknown DTD node type: " + child.constructor.name);
                }
              }.call(this);
              r += "]";
            }
            return r += this.spacebeforeslash + ">", r += this.newline;
          }, XMLStringWriter2.prototype.element = function(node, level) {
            var att, child, i, j, len, len1, name, r, ref, ref1, ref2, space, textispresentwasset;
            level || (level = 0), textispresentwasset = false, this.textispresent ? (this.newline = "", this.pretty = false) : (this.newline = this.newlinedefault, this.pretty = this.prettydefault), space = this.space(level), r = "", r += space + "<" + node.name, ref = node.attributes;
            for (name in ref) hasProp.call(ref, name) && (att = ref[name], r += this.attribute(att));
            if (0 === node.children.length || node.children.every(function(e) {
              return "" === e.value;
            })) r += this.allowEmpty ? "></" + node.name + ">" + this.newline : this.spacebeforeslash + "/>" + this.newline;
            else if (this.pretty && 1 === node.children.length && null != node.children[0].value) r += ">", r += node.children[0].value, r += "</" + node.name + ">" + this.newline;
            else {
              if (this.dontprettytextnodes) {
                for (ref1 = node.children, i = 0, len = ref1.length; len > i; i++) if (child = ref1[i], null != child.value) {
                  this.textispresent++, textispresentwasset = true;
                  break;
                }
              }
              for (this.textispresent && (this.newline = "", this.pretty = false, space = this.space(level)), r += ">" + this.newline, ref2 = node.children, j = 0, len1 = ref2.length; len1 > j; j++) child = ref2[j], r += function() {
                switch (false) {
                  case !(child instanceof XMLCData):
                    return this.cdata(child, level + 1);
                  case !(child instanceof XMLComment):
                    return this.comment(child, level + 1);
                  case !(child instanceof XMLElement):
                    return this.element(child, level + 1);
                  case !(child instanceof XMLRaw):
                    return this.raw(child, level + 1);
                  case !(child instanceof XMLText):
                    return this.text(child, level + 1);
                  case !(child instanceof XMLProcessingInstruction):
                    return this.processingInstruction(child, level + 1);
                  default:
                    throw new Error("Unknown XML node type: " + child.constructor.name);
                }
              }.call(this);
              textispresentwasset && this.textispresent--, this.textispresent || (this.newline = this.newlinedefault, this.pretty = this.prettydefault), r += space + "</" + node.name + ">" + this.newline;
            }
            return r;
          }, XMLStringWriter2.prototype.processingInstruction = function(node, level) {
            var r;
            return r = this.space(level) + "<?" + node.target, node.value && (r += " " + node.value), r += this.spacebeforeslash + "?>" + this.newline;
          }, XMLStringWriter2.prototype.raw = function(node, level) {
            return this.space(level) + node.value + this.newline;
          }, XMLStringWriter2.prototype.text = function(node, level) {
            return this.space(level) + node.value + this.newline;
          }, XMLStringWriter2.prototype.dtdAttList = function(node, level) {
            var r;
            return r = this.space(level) + "<!ATTLIST " + node.elementName + " " + node.attributeName + " " + node.attributeType, "#DEFAULT" !== node.defaultValueType && (r += " " + node.defaultValueType), node.defaultValue && (r += ' "' + node.defaultValue + '"'), r += this.spacebeforeslash + ">" + this.newline;
          }, XMLStringWriter2.prototype.dtdElement = function(node, level) {
            return this.space(level) + "<!ELEMENT " + node.name + " " + node.value + this.spacebeforeslash + ">" + this.newline;
          }, XMLStringWriter2.prototype.dtdEntity = function(node, level) {
            var r;
            return r = this.space(level) + "<!ENTITY", node.pe && (r += " %"), r += " " + node.name, node.value ? r += ' "' + node.value + '"' : (node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), node.nData && (r += " NDATA " + node.nData)), r += this.spacebeforeslash + ">" + this.newline;
          }, XMLStringWriter2.prototype.dtdNotation = function(node, level) {
            var r;
            return r = this.space(level) + "<!NOTATION " + node.name, node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.pubID ? r += ' PUBLIC "' + node.pubID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), r += this.spacebeforeslash + ">" + this.newline;
          }, XMLStringWriter2.prototype.openNode = function(node, level) {
            var att, name, r, ref;
            if (level || (level = 0), node instanceof XMLElement) {
              r = this.space(level) + "<" + node.name, ref = node.attributes;
              for (name in ref) hasProp.call(ref, name) && (att = ref[name], r += this.attribute(att));
              return r += (node.children ? ">" : "/>") + this.newline;
            }
            return r = this.space(level) + "<!DOCTYPE " + node.rootNodeName, node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), r += (node.children ? " [" : ">") + this.newline;
          }, XMLStringWriter2.prototype.closeNode = function(node, level) {
            switch (level || (level = 0), false) {
              case !(node instanceof XMLElement):
                return this.space(level) + "</" + node.name + ">" + this.newline;
              case !(node instanceof XMLDocType):
                return this.space(level) + "]>" + this.newline;
            }
          }, XMLStringWriter2;
        }(XMLWriterBase);
      }).call(this);
    }, { "./XMLCData": 70, "./XMLComment": 71, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLText": 87, "./XMLWriterBase": 88 }], 86: [function(require2, module2, exports2) {
      (function() {
        var bind = function(fn, me) {
          return function() {
            return fn.apply(me, arguments);
          };
        }, hasProp = {}.hasOwnProperty;
        module2.exports = function() {
          function XMLStringifier2(options) {
            this.assertLegalChar = bind(this.assertLegalChar, this);
            var key, ref, value;
            options || (options = {}), this.noDoubleEncoding = options.noDoubleEncoding, ref = options.stringify || {};
            for (key in ref) hasProp.call(ref, key) && (value = ref[key], this[key] = value);
          }
          return XMLStringifier2.prototype.eleName = function(val) {
            return val = "" + val || "", this.assertLegalChar(val);
          }, XMLStringifier2.prototype.eleText = function(val) {
            return val = "" + val || "", this.assertLegalChar(this.elEscape(val));
          }, XMLStringifier2.prototype.cdata = function(val) {
            return val = "" + val || "", val = val.replace("]]>", "]]]]><![CDATA[>"), this.assertLegalChar(val);
          }, XMLStringifier2.prototype.comment = function(val) {
            if (val = "" + val || "", val.match(/--/)) throw new Error("Comment text cannot contain double-hypen: " + val);
            return this.assertLegalChar(val);
          }, XMLStringifier2.prototype.raw = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.attName = function(val) {
            return val = "" + val || "";
          }, XMLStringifier2.prototype.attValue = function(val) {
            return val = "" + val || "", this.attEscape(val);
          }, XMLStringifier2.prototype.insTarget = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.insValue = function(val) {
            if (val = "" + val || "", val.match(/\?>/)) throw new Error("Invalid processing instruction value: " + val);
            return val;
          }, XMLStringifier2.prototype.xmlVersion = function(val) {
            if (val = "" + val || "", !val.match(/1\.[0-9]+/)) throw new Error("Invalid version number: " + val);
            return val;
          }, XMLStringifier2.prototype.xmlEncoding = function(val) {
            if (val = "" + val || "", !val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) throw new Error("Invalid encoding: " + val);
            return val;
          }, XMLStringifier2.prototype.xmlStandalone = function(val) {
            return val ? "yes" : "no";
          }, XMLStringifier2.prototype.dtdPubID = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.dtdSysID = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.dtdElementValue = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.dtdAttType = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.dtdAttDefault = function(val) {
            return null != val ? "" + val || "" : val;
          }, XMLStringifier2.prototype.dtdEntityValue = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.dtdNData = function(val) {
            return "" + val || "";
          }, XMLStringifier2.prototype.convertAttKey = "@", XMLStringifier2.prototype.convertPIKey = "?", XMLStringifier2.prototype.convertTextKey = "#text", XMLStringifier2.prototype.convertCDataKey = "#cdata", XMLStringifier2.prototype.convertCommentKey = "#comment", XMLStringifier2.prototype.convertRawKey = "#raw", XMLStringifier2.prototype.assertLegalChar = function(str) {
            var res;
            if (res = str.match(/[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/)) throw new Error("Invalid character in string: " + str + " at index " + res.index);
            return str;
          }, XMLStringifier2.prototype.elEscape = function(str) {
            var ampregex;
            return ampregex = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g, str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
          }, XMLStringifier2.prototype.attEscape = function(str) {
            var ampregex;
            return ampregex = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g, str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
          }, XMLStringifier2;
        }();
      }).call(this);
    }, {}], 87: [function(require2, module2, exports2) {
      (function() {
        var XMLNode, extend = function(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
          return ctor.prototype = parent.prototype, child.prototype = new ctor(), child.__super__ = parent.prototype, child;
        }, hasProp = {}.hasOwnProperty;
        XMLNode = require2("./XMLNode"), module2.exports = function(superClass) {
          function XMLText2(parent, text) {
            if (XMLText2.__super__.constructor.call(this, parent), null == text) throw new Error("Missing element text. " + this.debugInfo());
            this.value = this.stringify.eleText(text);
          }
          return extend(XMLText2, superClass), XMLText2.prototype.clone = function() {
            return Object.create(this);
          }, XMLText2.prototype.toString = function(options) {
            return this.options.writer.set(options).text(this);
          }, XMLText2;
        }(XMLNode);
      }).call(this);
    }, { "./XMLNode": 81 }], 88: [function(require2, module2, exports2) {
      (function() {
        var hasProp = {}.hasOwnProperty;
        module2.exports = function() {
          function XMLWriterBase2(options) {
            var key, ref, ref1, ref2, ref3, ref4, ref5, ref6, value;
            options || (options = {}), this.pretty = options.pretty || false, this.allowEmpty = null != (ref = options.allowEmpty) ? ref : false, this.pretty ? (this.indent = null != (ref1 = options.indent) ? ref1 : "  ", this.newline = null != (ref2 = options.newline) ? ref2 : "\n", this.offset = null != (ref3 = options.offset) ? ref3 : 0, this.dontprettytextnodes = null != (ref4 = options.dontprettytextnodes) ? ref4 : 0) : (this.indent = "", this.newline = "", this.offset = 0, this.dontprettytextnodes = 0), this.spacebeforeslash = null != (ref5 = options.spacebeforeslash) ? ref5 : "", this.spacebeforeslash === true && (this.spacebeforeslash = " "), this.newlinedefault = this.newline, this.prettydefault = this.pretty, ref6 = options.writer || {};
            for (key in ref6) hasProp.call(ref6, key) && (value = ref6[key], this[key] = value);
          }
          return XMLWriterBase2.prototype.set = function(options) {
            var key, ref, value;
            options || (options = {}), "pretty" in options && (this.pretty = options.pretty), "allowEmpty" in options && (this.allowEmpty = options.allowEmpty), this.pretty ? (this.indent = "indent" in options ? options.indent : "  ", this.newline = "newline" in options ? options.newline : "\n", this.offset = "offset" in options ? options.offset : 0, this.dontprettytextnodes = "dontprettytextnodes" in options ? options.dontprettytextnodes : 0) : (this.indent = "", this.newline = "", this.offset = 0, this.dontprettytextnodes = 0), this.spacebeforeslash = "spacebeforeslash" in options ? options.spacebeforeslash : "", this.spacebeforeslash === true && (this.spacebeforeslash = " "), this.newlinedefault = this.newline, this.prettydefault = this.pretty, ref = options.writer || {};
            for (key in ref) hasProp.call(ref, key) && (value = ref[key], this[key] = value);
            return this;
          }, XMLWriterBase2.prototype.space = function(level) {
            var indent;
            return this.pretty ? (indent = (level || 0) + this.offset + 1, indent > 0 ? new Array(indent).join(this.indent) : "") : "";
          }, XMLWriterBase2;
        }();
      }).call(this);
    }, {}], 89: [function(require2, module2, exports2) {
      (function() {
        var XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;
        ref = require2("./Utility"), assign = ref.assign, isFunction = ref.isFunction, XMLDocument = require2("./XMLDocument"), XMLDocumentCB = require2("./XMLDocumentCB"), XMLStringWriter = require2("./XMLStringWriter"), XMLStreamWriter = require2("./XMLStreamWriter"), module2.exports.create = function(name, xmldec, doctype, options) {
          var doc, root;
          if (null == name) throw new Error("Root element needs a name.");
          return options = assign({}, xmldec, doctype, options), doc = new XMLDocument(options), root = doc.element(name), options.headless || (doc.declaration(options), (null != options.pubID || null != options.sysID) && doc.doctype(options)), root;
        }, module2.exports.begin = function(options, onData, onEnd) {
          var ref1;
          return isFunction(options) && (ref1 = [options, onData], onData = ref1[0], onEnd = ref1[1], options = {}), onData ? new XMLDocumentCB(options, onData, onEnd) : new XMLDocument(options);
        }, module2.exports.stringWriter = function(options) {
          return new XMLStringWriter(options);
        }, module2.exports.streamWriter = function(stream, options) {
          return new XMLStreamWriter(stream, options);
        };
      }).call(this);
    }, { "./Utility": 68, "./XMLDocument": 78, "./XMLDocumentCB": 79, "./XMLStreamWriter": 84, "./XMLStringWriter": 85 }] }, {}, [21])(21);
  });
})(mammoth_browser_min$1);
var mammoth_browser_minExports = mammoth_browser_min$1.exports;
const mammoth_browser_min_default = /* @__PURE__ */ getDefaultExportFromCjs(mammoth_browser_minExports);
const mammoth_browser_min = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: mammoth_browser_min_default
}, [mammoth_browser_minExports]);
export {
  mammoth_browser_min as m
};