/* PrismJS 1.29.0
https://prismjs.com/download.html#themes=prism-okaidia&languages=clike+c&plugins=line-numbers+normalize-whitespace+toolbar+copy-to-clipboard */
var _self = "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {},
	Prism = function(e) {
		var n = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,
			t = 0,
			r = {},
			a = {
				manual: e.Prism && e.Prism.manual,
				disableWorkerMessageHandler: e.Prism && e.Prism.disableWorkerMessageHandler,
				util: {
					encode: function e(n) {
						return n instanceof i ? new i(n.type, e(n.content), n.alias) : Array.isArray(n) ? n.map(e) : n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ")
					},
					type: function(e) {
						return Object.prototype.toString.call(e).slice(8, -1)
					},
					objId: function(e) {
						return e.__id || Object.defineProperty(e, "__id", {
							value: ++t
						}), e.__id
					},
					clone: function e(n, t) {
						var r, i;
						switch (t = t || {}, a.util.type(n)) {
							case "Object":
								if (i = a.util.objId(n), t[i]) return t[i];
								for (var l in r = {}, t[i] = r, n) n.hasOwnProperty(l) && (r[l] = e(n[l], t));
								return r;
							case "Array":
								return i = a.util.objId(n), t[i] ? t[i] : (r = [], t[i] = r, n.forEach((function(n, a) {
									r[a] = e(n, t)
								})), r);
							default:
								return n
						}
					},
					getLanguage: function(e) {
						for (; e;) {
							var t = n.exec(e.className);
							if (t) return t[1].toLowerCase();
							e = e.parentElement
						}
						return "none"
					},
					setLanguage: function(e, t) {
						e.className = e.className.replace(RegExp(n, "gi"), ""), e.classList.add("language-" + t)
					},
					currentScript: function() {
						if ("undefined" == typeof document) return null;
						if ("currentScript" in document) return document.currentScript;
						try {
							throw new Error
						} catch (r) {
							var e = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(r.stack) || [])[1];
							if (e) {
								var n = document.getElementsByTagName("script");
								for (var t in n)
									if (n[t].src == e) return n[t]
							}
							return null
						}
					},
					isActive: function(e, n, t) {
						for (var r = "no-" + n; e;) {
							var a = e.classList;
							if (a.contains(n)) return !0;
							if (a.contains(r)) return !1;
							e = e.parentElement
						}
						return !!t
					}
				},
				languages: {
					plain: r,
					plaintext: r,
					text: r,
					txt: r,
					extend: function(e, n) {
						var t = a.util.clone(a.languages[e]);
						for (var r in n) t[r] = n[r];
						return t
					},
					insertBefore: function(e, n, t, r) {
						var i = (r = r || a.languages)[e],
							l = {};
						for (var o in i)
							if (i.hasOwnProperty(o)) {
								if (o == n)
									for (var s in t) t.hasOwnProperty(s) && (l[s] = t[s]);
								t.hasOwnProperty(o) || (l[o] = i[o])
							} var u = r[e];
						return r[e] = l, a.languages.DFS(a.languages, (function(n, t) {
							t === u && n != e && (this[n] = l)
						})), l
					},
					DFS: function e(n, t, r, i) {
						i = i || {};
						var l = a.util.objId;
						for (var o in n)
							if (n.hasOwnProperty(o)) {
								t.call(n, o, n[o], r || o);
								var s = n[o],
									u = a.util.type(s);
								"Object" !== u || i[l(s)] ? "Array" !== u || i[l(s)] || (i[l(s)] = !0, e(s, t, o, i)) : (i[l(s)] = !0, e(s, t, null, i))
							}
					}
				},
				plugins: {},
				highlightAll: function(e, n) {
					a.highlightAllUnder(document, e, n)
				},
				highlightAllUnder: function(e, n, t) {
					var r = {
						callback: t,
						container: e,
						selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
					};
					a.hooks.run("before-highlightall", r), r.elements = Array.prototype.slice.apply(r.container.querySelectorAll(r.selector)), a.hooks.run("before-all-elements-highlight", r);
					for (var i, l = 0; i = r.elements[l++];) a.highlightElement(i, !0 === n, r.callback)
				},
				highlightElement: function(n, t, r) {
					var i = a.util.getLanguage(n),
						l = a.languages[i];
					a.util.setLanguage(n, i);
					var o = n.parentElement;
					o && "pre" === o.nodeName.toLowerCase() && a.util.setLanguage(o, i);
					var s = {
						element: n,
						language: i,
						grammar: l,
						code: n.textContent
					};

					function u(e) {
						s.highlightedCode = e, a.hooks.run("before-insert", s), s.element.innerHTML = s.highlightedCode, a.hooks.run("after-highlight", s), a.hooks.run("complete", s), r && r.call(s.element)
					}
					if (a.hooks.run("before-sanity-check", s), (o = s.element.parentElement) && "pre" === o.nodeName.toLowerCase() && !o.hasAttribute("tabindex") && o.setAttribute("tabindex", "0"), !s.code) return a.hooks.run("complete", s), void(r && r.call(s.element));
					if (a.hooks.run("before-highlight", s), s.grammar)
						if (t && e.Worker) {
							var c = new Worker(a.filename);
							c.onmessage = function(e) {
								u(e.data)
							}, c.postMessage(JSON.stringify({
								language: s.language,
								code: s.code,
								immediateClose: !0
							}))
						} else u(a.highlight(s.code, s.grammar, s.language));
					else u(a.util.encode(s.code))
				},
				highlight: function(e, n, t) {
					var r = {
						code: e,
						grammar: n,
						language: t
					};
					if (a.hooks.run("before-tokenize", r), !r.grammar) throw new Error('The language "' + r.language + '" has no grammar.');
					return r.tokens = a.tokenize(r.code, r.grammar), a.hooks.run("after-tokenize", r), i.stringify(a.util.encode(r.tokens), r.language)
				},
				tokenize: function(e, n) {
					var t = n.rest;
					if (t) {
						for (var r in t) n[r] = t[r];
						delete n.rest
					}
					var a = new s;
					return u(a, a.head, e), o(e, a, n, a.head, 0),
						function(e) {
							for (var n = [], t = e.head.next; t !== e.tail;) n.push(t.value), t = t.next;
							return n
						}(a)
				},
				hooks: {
					all: {},
					add: function(e, n) {
						var t = a.hooks.all;
						t[e] = t[e] || [], t[e].push(n)
					},
					run: function(e, n) {
						var t = a.hooks.all[e];
						if (t && t.length)
							for (var r, i = 0; r = t[i++];) r(n)
					}
				},
				Token: i
			};

		function i(e, n, t, r) {
			this.type = e, this.content = n, this.alias = t, this.length = 0 | (r || "").length
		}

		function l(e, n, t, r) {
			e.lastIndex = n;
			var a = e.exec(t);
			if (a && r && a[1]) {
				var i = a[1].length;
				a.index += i, a[0] = a[0].slice(i)
			}
			return a
		}

		function o(e, n, t, r, s, g) {
			for (var f in t)
				if (t.hasOwnProperty(f) && t[f]) {
					var h = t[f];
					h = Array.isArray(h) ? h : [h];
					for (var d = 0; d < h.length; ++d) {
						if (g && g.cause == f + "," + d) return;
						var v = h[d],
							p = v.inside,
							m = !!v.lookbehind,
							y = !!v.greedy,
							k = v.alias;
						if (y && !v.pattern.global) {
							var x = v.pattern.toString().match(/[imsuy]*$/)[0];
							v.pattern = RegExp(v.pattern.source, x + "g")
						}
						for (var b = v.pattern || v, w = r.next, A = s; w !== n.tail && !(g && A >= g.reach); A += w.value.length, w = w.next) {
							var E = w.value;
							if (n.length > e.length) return;
							if (!(E instanceof i)) {
								var P, L = 1;
								if (y) {
									if (!(P = l(b, A, e, m)) || P.index >= e.length) break;
									var S = P.index,
										O = P.index + P[0].length,
										j = A;
									for (j += w.value.length; S >= j;) j += (w = w.next).value.length;
									if (A = j -= w.value.length, w.value instanceof i) continue;
									for (var C = w; C !== n.tail && (j < O || "string" == typeof C.value); C = C.next) L++, j += C.value.length;
									L--, E = e.slice(A, j), P.index -= A
								} else if (!(P = l(b, 0, E, m))) continue;
								S = P.index;
								var N = P[0],
									_ = E.slice(0, S),
									M = E.slice(S + N.length),
									W = A + E.length;
								g && W > g.reach && (g.reach = W);
								var z = w.prev;
								if (_ && (z = u(n, z, _), A += _.length), c(n, z, L), w = u(n, z, new i(f, p ? a.tokenize(N, p) : N, k, N)), M && u(n, w, M), L > 1) {
									var I = {
										cause: f + "," + d,
										reach: W
									};
									o(e, n, t, w.prev, A, I), g && I.reach > g.reach && (g.reach = I.reach)
								}
							}
						}
					}
				}
		}

		function s() {
			var e = {
					value: null,
					prev: null,
					next: null
				},
				n = {
					value: null,
					prev: e,
					next: null
				};
			e.next = n, this.head = e, this.tail = n, this.length = 0
		}

		function u(e, n, t) {
			var r = n.next,
				a = {
					value: t,
					prev: n,
					next: r
				};
			return n.next = a, r.prev = a, e.length++, a
		}

		function c(e, n, t) {
			for (var r = n.next, a = 0; a < t && r !== e.tail; a++) r = r.next;
			n.next = r, r.prev = n, e.length -= a
		}
		if (e.Prism = a, i.stringify = function e(n, t) {
				if ("string" == typeof n) return n;
				if (Array.isArray(n)) {
					var r = "";
					return n.forEach((function(n) {
						r += e(n, t)
					})), r
				}
				var i = {
						type: n.type,
						content: e(n.content, t),
						tag: "span",
						classes: ["token", n.type],
						attributes: {},
						language: t
					},
					l = n.alias;
				l && (Array.isArray(l) ? Array.prototype.push.apply(i.classes, l) : i.classes.push(l)), a.hooks.run("wrap", i);
				var o = "";
				for (var s in i.attributes) o += " " + s + '="' + (i.attributes[s] || "").replace(/"/g, "&quot;") + '"';
				return "<" + i.tag + ' class="' + i.classes.join(" ") + '"' + o + ">" + i.content + "</" + i.tag + ">"
			}, !e.document) return e.addEventListener ? (a.disableWorkerMessageHandler || e.addEventListener("message", (function(n) {
			var t = JSON.parse(n.data),
				r = t.language,
				i = t.code,
				l = t.immediateClose;
			e.postMessage(a.highlight(i, a.languages[r], r)), l && e.close()
		}), !1), a) : a;
		var g = a.util.currentScript();

		function f() {
			a.manual || a.highlightAll()
		}
		if (g && (a.filename = g.src, g.hasAttribute("data-manual") && (a.manual = !0)), !a.manual) {
			var h = document.readyState;
			"loading" === h || "interactive" === h && g && g.defer ? document.addEventListener("DOMContentLoaded", f) : window.requestAnimationFrame ? window.requestAnimationFrame(f) : window.setTimeout(f, 16)
		}
		return a
	}(_self);
"undefined" != typeof module && module.exports && (module.exports = Prism), "undefined" != typeof global && (global.Prism = Prism);
Prism.languages.clike = {
	'comment': [{
		pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
		lookbehind: !0,
		greedy: !0
	}, {
		pattern: /(^|[^\\:])\/\/.*/,
		lookbehind: !0,
		greedy: !0
	}],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: !0
	},
	'class-name': {
		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: !0,
		inside: {
			punctuation: /[.\\]/
		}
	},
	'control': /\b(?:break|continue|else|for|switch|case|default|goto|typedef|do|if|return|while|true|false|main)\b/,
	'boolean': /\b(?:false|true)\b/,
	'function': /\b\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};
Prism.languages.c = Prism.languages.extend("clike", {
	'comment': {
		pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
		greedy: !0
	},
	'string': {
		pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
		greedy: !0
	},
	'class-name': {
		pattern: /(\b(?:enum|struct|union)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
		lookbehind: !0
	},
	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'keyword': /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|const|double|float|int|short|struct|unsigned|long|signed|void|enum|register|volatile|char|extern|static|union|_Static_assert|FILE|size_t|bool|pthread_t|Vector2|Vector3|Vector4|Quaternion|Matrix|Color|Rectangle|Image|Texture|Texture2D|RenderTexture|RenderTexture2D|TextureCubemap|NPatchInfo|GlyphInfo|Font|Camera|Camera3D|Camera2D|Mesh|Shader|MaterialMap|Material|Transform|BoneInfo|Model|ModelAnimation|Ray|RayCollision|BoundingBox|Wave|Sound|Music|AudioStream|VrDeviceInfo|VrStereoConfig|FilePathList|AutomationEvent|AutomationEventList|rlVertexBuffer|rlDrawCall|rlRenderBatch|int8_t|int16_t|int32_t|int64_t|intptr_t|uint8_t|uint16_t|uint32_t|uint64_t|uintptr_t|atomic_bool|atomic_int)\b/,
	'number': /(?:\b(?:0b|0x)(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
	'operator': />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/
}), Prism.languages.insertBefore("c", "string", {
	'char': {
		pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,
		greedy: !0
	}
}), Prism.languages.insertBefore("c", "string", {
	'macro': {
		pattern: /(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,
		lookbehind: !0,
		greedy: !0,
		inside: {
			string: [{
				pattern: /^(#\s*include\s*)<[^>]+>/,
				lookbehind: !0
			}, Prism.languages.c.string],
			char: Prism.languages.c.char,
			comment: Prism.languages.c.comment,
			"macro-name": [{
				pattern: /(^#\s*define\s+)\w+\b(?!\()/i,
				lookbehind: !0
			}, {
				pattern: /(^#\s*define\s+)\w+\b(?=\()/i,
				lookbehind: !0,
				alias: "function"
			}],
			"directive-hash": /^#/,
			punctuation: /##|\\(?=[\r\n])/,
			expression: {
				pattern: /\S[\s\S]*/,
				inside: Prism.languages.c
			}
		}
	}
}), Prism.languages.insertBefore("c", "function", {
	'constant': /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout|LIGHTGRAY|GRAY|DARKGRAY|YELLOW|GOLD|ORANGE|PINK|RED|MAROON|GREEN|LIME|DARKGREEN|SKYBLUE|BLUE|DARKBLUE|PURPLE|VIOLET|DARKPURPLE|BEIGE|BROWN|DARKBROWN|WHITE|BLACK|BLANK|MAGENTA|RAYWHITE|FLAG_VSYNC_HINT|FLAG_FULLSCREEN_MODE|FLAG_WINDOW_RESIZABLE|FLAG_WINDOW_UNDECORATED|FLAG_WINDOW_HIDDEN|FLAG_WINDOW_MINIMIZED|FLAG_WINDOW_MAXIMIZED|FLAG_WINDOW_UNFOCUSED|FLAG_WINDOW_TOPMOST|FLAG_WINDOW_ALWAYS_RUN|FLAG_WINDOW_TRANSPARENT|FLAG_WINDOW_HIGHDPI|FLAG_WINDOW_MOUSE_PASSTHROUGH|FLAG_BORDERLESS_WINDOWED_MODE|FLAG_MSAA_4X_HINT|FLAG_INTERLACED_HINT|LOG_ALL|LOG_TRACE|LOG_DEBUG|LOG_INFO|LOG_WARNING|LOG_ERROR|LOG_FATAL|LOG_NONE|KEY_APOSTROPHE|KEY_COMMA|KEY_MINUS|KEY_PERIOD|KEY_SLASH|KEY_ZERO|KEY_ONE|KEY_TWO|KEY_THREE|KEY_FOUR|KEY_FIVE|KEY_SIX|KEY_SEVEN|KEY_EIGHT|KEY_NINE|KEY_SEMICOLON|KEY_EQUAL|KEY_A|KEY_B|KEY_C|KEY_D|KEY_E|KEY_F|KEY_G|KEY_H|KEY_I|KEY_J|KEY_K|KEY_L|KEY_M|KEY_N|KEY_O|KEY_P|KEY_Q|KEY_R|KEY_S|KEY_T|KEY_U|KEY_V|KEY_W|KEY_X|KEY_Y|KEY_Z|KEY_LEFT_BRACKET|KEY_BACKSLASH|KEY_RIGHT_BRACKET|KEY_GRAVE|KEY_SPACE|KEY_ESCAPE|KEY_ENTER|KEY_TAB|KEY_BACKSPACE|KEY_INSERT|KEY_DELETE|KEY_RIGHT|KEY_LEFT|KEY_DOWN|KEY_UP|KEY_PAGE_UP|KEY_PAGE_DOWN|KEY_HOME|KEY_END|KEY_CAPS_LOCK|KEY_SCROLL_LOCK|KEY_NUM_LOCK|KEY_PRINT_SCREEN|KEY_PAUSE|KEY_F1|KEY_F2|KEY_F3|KEY_F4|KEY_F5|KEY_F6|KEY_F7|KEY_F8|KEY_F9|KEY_F10|KEY_F11|KEY_F12|KEY_LEFT_SHIFT|KEY_LEFT_CONTROL|KEY_LEFT_ALT|KEY_LEFT_SUPER|KEY_RIGHT_SHIFT|KEY_RIGHT_CONTROL|KEY_RIGHT_ALT|KEY_RIGHT_SUPER|KEY_KB_MENU|KEY_KP_0|KEY_KP_1|KEY_KP_2|KEY_KP_3|KEY_KP_4|KEY_KP_5|KEY_KP_6|KEY_KP_7|KEY_KP_8|KEY_KP_9|KEY_KP_DECIMAL|KEY_KP_DIVIDE|KEY_KP_MULTIPLY|KEY_KP_SUBTRACT|KEY_KP_ADD|KEY_KP_ENTER|KEY_KP_EQUAL|KEY_BACK|KEY_MENU|KEY_VOLUME_UP|KEY_VOLUME_DOWN|KEY_NULL|MOUSE_BUTTON_LEFT|MOUSE_BUTTON_RIGHT|MOUSE_BUTTON_MIDDLE|MOUSE_BUTTON_SIDE|MOUSE_BUTTON_EXTRA|MOUSE_BUTTON_FORWARD|MOUSE_BUTTON_BACK|CAMERA_CUSTOM|CAMERA_FREE|CAMERA_ORBITAL|CAMERA_FIRST_PERSON|CAMERA_THIRD_PERSON|CAMERA_PERSPECTIVE|CAMERA_ORTHOGRAPHIC)\b/
}), delete Prism.languages.c.boolean;
! function() {
	if ("undefined" != typeof Prism && "undefined" != typeof document) {
		var e = "line-numbers",
			n = /\n(?!$)/g,
			t = Prism.plugins.lineNumbers = {
				getLine: function(n, t) {
					if ("PRE" === n.tagName && n.classList.contains(e)) {
						var i = n.querySelector(".line-numbers-rows");
						if (i) {
							var r = parseInt(n.getAttribute("data-start"), 10) || 1,
								s = r + (i.children.length - 1);
							t < r && (t = r), t > s && (t = s);
							var l = t - r;
							return i.children[l]
						}
					}
				},
				resize: function(e) {
					r([e])
				},
				assumeViewportIndependence: !0
			},
			i = void 0;
		window.addEventListener("resize", (function() {
			t.assumeViewportIndependence && i === window.innerWidth || (i = window.innerWidth, r(Array.prototype.slice.call(document.querySelectorAll("pre.line-numbers"))))
		})), Prism.hooks.add("complete", (function(t) {
			if (t.code) {
				var i = t.element,
					s = i.parentNode;
				if (s && /pre/i.test(s.nodeName) && !i.querySelector(".line-numbers-rows") && Prism.util.isActive(i, e)) {
					i.classList.remove(e), s.classList.add(e);
					var l, o = t.code.match(n),
						a = o ? o.length + 1 : 1,
						u = new Array(a + 1).join("<span></span>");
					(l = document.createElement("span")).setAttribute("aria-hidden", "true"), l.className = "line-numbers-rows", l.innerHTML = u, s.hasAttribute("data-start") && (s.style.counterReset = "linenumber " + (parseInt(s.getAttribute("data-start"), 10) - 1)), t.element.appendChild(l), r([s]), Prism.hooks.run("line-numbers", t)
				}
			}
		})), Prism.hooks.add("line-numbers", (function(e) {
			e.plugins = e.plugins || {}, e.plugins.lineNumbers = !0
		}))
	}

	function r(e) {
		if (0 != (e = e.filter((function(e) {
				var n, t = (n = e, n ? window.getComputedStyle ? getComputedStyle(n) : n.currentStyle || null : null)["white-space"];
				return "pre-wrap" === t || "pre-line" === t
			}))).length) {
			var t = e.map((function(e) {
				var t = e.querySelector("code"),
					i = e.querySelector(".line-numbers-rows");
				if (t && i) {
					var r = e.querySelector(".line-numbers-sizer"),
						s = t.textContent.split(n);
					r || ((r = document.createElement("span")).className = "line-numbers-sizer", t.appendChild(r)), r.innerHTML = "0", r.style.display = "block";
					var l = r.getBoundingClientRect().height;
					return r.innerHTML = "", {
						element: e,
						lines: s,
						lineHeights: [],
						oneLinerHeight: l,
						sizer: r
					}
				}
			})).filter(Boolean);
			t.forEach((function(e) {
				var n = e.sizer,
					t = e.lines,
					i = e.lineHeights,
					r = e.oneLinerHeight;
				i[t.length - 1] = void 0, t.forEach((function(e, t) {
					if (e && e.length > 1) {
						var s = n.appendChild(document.createElement("span"));
						s.style.display = "block", s.textContent = e
					} else i[t] = r
				}))
			})), t.forEach((function(e) {
				for (var n = e.sizer, t = e.lineHeights, i = 0, r = 0; r < t.length; r++) void 0 === t[r] && (t[r] = n.children[i++].getBoundingClientRect().height)
			})), t.forEach((function(e) {
				var n = e.sizer,
					t = e.element.querySelector(".line-numbers-rows");
				n.style.display = "none", n.innerHTML = "", e.lineHeights.forEach((function(e, n) {
					t.children[n].style.height = e + "px"
				}))
			}))
		}
	}
}();
! function() {
	if ("undefined" != typeof Prism) {
		var e = Object.assign || function(e, t) {
				for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
				return e
			},
			t = {
				"remove-trailing": "boolean",
				"remove-indent": "boolean",
				"left-trim": "boolean",
				"right-trim": "boolean",
				"break-lines": "number",
				indent: "number",
				"remove-initial-line-feed": "boolean",
				"tabs-to-spaces": "number",
				"spaces-to-tabs": "number"
			};
		n.prototype = {
			setDefaults: function(t) {
				this.defaults = e(this.defaults, t)
			},
			normalize: function(t, n) {
				for (var r in n = e(this.defaults, n)) {
					var i = r.replace(/-(\w)/g, (function(e, t) {
						return t.toUpperCase()
					}));
					"normalize" !== r && "setDefaults" !== i && n[r] && this[i] && (t = this[i].call(this, t, n[r]))
				}
				return t
			},
			leftTrim: function(e) {
				return e.replace(/^\s+/, "")
			},
			rightTrim: function(e) {
				return e.replace(/\s+$/, "")
			},
			tabsToSpaces: function(e, t) {
				return t = 0 | t || 4, e.replace(/\t/g, new Array(++t).join(" "))
			},
			spacesToTabs: function(e, t) {
				return t = 0 | t || 4, e.replace(RegExp(" {" + t + "}", "g"), "\t")
			},
			removeTrailing: function(e) {
				return e.replace(/\s*?$/gm, "")
			},
			removeInitialLineFeed: function(e) {
				return e.replace(/^(?:\r?\n|\r)/, "")
			},
			removeIndent: function(e) {
				var t = e.match(/^[^\S\n\r]*(?=\S)/gm);
				return t && t[0].length ? (t.sort((function(e, t) {
					return e.length - t.length
				})), t[0].length ? e.replace(RegExp("^" + t[0], "gm"), "") : e) : e
			},
			indent: function(e, t) {
				return e.replace(/^[^\S\n\r]*(?=\S)/gm, new Array(++t).join("\t") + "$&")
			},
			breakLines: function(e, t) {
				t = !0 === t ? 80 : 0 | t || 80;
				for (var n = e.split("\n"), i = 0; i < n.length; ++i)
					if (!(r(n[i]) <= t)) {
						for (var o = n[i].split(/(\s+)/g), a = 0, l = 0; l < o.length; ++l) {
							var s = r(o[l]);
							(a += s) > t && (o[l] = "\n" + o[l], a = s)
						}
						n[i] = o.join("")
					} return n.join("\n")
			}
		}, "undefined" != typeof module && module.exports && (module.exports = n), Prism.plugins.NormalizeWhitespace = new n({
			"remove-trailing": !0,
			"remove-indent": !0,
			"left-trim": !0,
			"right-trim": !0
		}), Prism.hooks.add("before-sanity-check", (function(e) {
			var n = Prism.plugins.NormalizeWhitespace;
			if ((!e.settings || !1 !== e.settings["whitespace-normalization"]) && Prism.util.isActive(e.element, "whitespace-normalization", !0))
				if (e.element && e.element.parentNode || !e.code) {
					var r = e.element.parentNode;
					if (e.code && r && "pre" === r.nodeName.toLowerCase()) {
						for (var i in null == e.settings && (e.settings = {}), t)
							if (Object.hasOwnProperty.call(t, i)) {
								var o = t[i];
								if (r.hasAttribute("data-" + i)) try {
									var a = JSON.parse(r.getAttribute("data-" + i) || "true");
									typeof a === o && (e.settings[i] = a)
								} catch (e) {}
							} for (var l = r.childNodes, s = "", c = "", u = !1, m = 0; m < l.length; ++m) {
							var f = l[m];
							f == e.element ? u = !0 : "#text" === f.nodeName && (u ? c += f.nodeValue : s += f.nodeValue, r.removeChild(f), --m)
						}
						if (e.element.children.length && Prism.plugins.KeepMarkup) {
							var d = s + e.element.innerHTML + c;
							e.element.innerHTML = n.normalize(d, e.settings), e.code = e.element.textContent
						} else e.code = s + e.code + c, e.code = n.normalize(e.code, e.settings)
					}
				} else e.code = n.normalize(e.code, e.settings)
		}))
	}

	function n(t) {
		this.defaults = e({}, t)
	}

	function r(e) {
		for (var t = 0, n = 0; n < e.length; ++n) e.charCodeAt(n) == "\t".charCodeAt(0) && (t += 3);
		return e.length + t
	}
}();
! function() {
	if ("undefined" != typeof Prism && "undefined" != typeof document) {
		var e = [],
			t = {},
			n = function() {};
		Prism.plugins.toolbar = {};
		var a = Prism.plugins.toolbar.registerButton = function(n, a) {
				var r;
				r = "function" == typeof a ? a : function(e) {
					var t;
					return "function" == typeof a.onClick ? ((t = document.createElement("button")).type = "button", t.addEventListener("click", (function() {
						a.onClick.call(this, e)
					}))) : "string" == typeof a.url ? (t = document.createElement("a")).href = a.url : t = document.createElement("span"), a.className && t.classList.add(a.className), t.textContent = a.text, t
				}, n in t ? console.warn('There is a button with the key "' + n + '" registered already.') : e.push(t[n] = r)
			},
			r = Prism.plugins.toolbar.hook = function(a) {
				var r = a.element.parentNode;
				if (r && /pre/i.test(r.nodeName) && !r.parentNode.classList.contains("code-toolbar")) {
					var o = document.createElement("div");
					o.classList.add("code-toolbar"), r.parentNode.insertBefore(o, r), o.appendChild(r);
					var i = document.createElement("div");
					i.classList.add("toolbar");
					var l = e,
						d = function(e) {
							for (; e;) {
								var t = e.getAttribute("data-toolbar-order");
								if (null != t) return (t = t.trim()).length ? t.split(/\s*,\s*/g) : [];
								e = e.parentElement
							}
						}(a.element);
					d && (l = d.map((function(e) {
						return t[e] || n
					}))), l.forEach((function(e) {
						var t = e(a);
						if (t) {
							var n = document.createElement("div");
							n.classList.add("toolbar-item"), n.appendChild(t), i.appendChild(n)
						}
					})), o.appendChild(i)
				}
			};
		a("label", (function(e) {
			var t = e.element.parentNode;
			if (t && /pre/i.test(t.nodeName) && t.hasAttribute("data-label")) {
				var n, a, r = t.getAttribute("data-label");
				try {
					a = document.querySelector("template#" + r)
				} catch (e) {}
				return a ? n = a.content : (t.hasAttribute("data-url") ? (n = document.createElement("a")).href = t.getAttribute("data-url") : n = document.createElement("span"), n.textContent = r), n
			}
		})), Prism.hooks.add("complete", r)
	}
}();
! function() {
	function t(t) {
		var e = document.createElement("textarea");
		e.value = t.getText(), e.style.top = "0", e.style.left = "0", e.style.position = "fixed", document.body.appendChild(e), e.focus(), e.select();
		try {
			var o = document.execCommand("copy");
			setTimeout((function() {
				o ? t.success() : t.error()
			}), 1)
		} catch (e) {
			setTimeout((function() {
				t.error(e)
			}), 1)
		}
		document.body.removeChild(e)
	}
	"undefined" != typeof Prism && "undefined" != typeof document && (Prism.plugins.toolbar ? Prism.plugins.toolbar.registerButton("copy-to-clipboard", (function(e) {
		var o = e.element,
			n = function(t) {
				var e = {
					copy: "Copy",
					"copy-error": "Press Ctrl+C to copy",
					"copy-success": "Copied!",
					"copy-timeout": 5e3
				};
				for (var o in e) {
					for (var n = "data-prismjs-" + o, c = t; c && !c.hasAttribute(n);) c = c.parentElement;
					c && (e[o] = c.getAttribute(n))
				}
				return e
			}(o),
			c = document.createElement("button");
		c.className = "copy-to-clipboard-button", c.setAttribute("type", "button");
		var r = document.createElement("span");
		return c.appendChild(r), u("copy"),
			function(e, o) {
				e.addEventListener("click", (function() {
					! function(e) {
						navigator.clipboard ? navigator.clipboard.writeText(e.getText()).then(e.success, (function() {
							t(e)
						})) : t(e)
					}(o)
				}))
			}(c, {
				getText: function() {
					return o.textContent
				},
				success: function() {
					u("copy-success"), i()
				},
				error: function() {
					u("copy-error"), setTimeout((function() {
						! function(t) {
							window.getSelection().selectAllChildren(t)
						}(o)
					}), 1), i()
				}
			}), c;

		function i() {
			setTimeout((function() {
				u("copy")
			}), n["copy-timeout"])
		}

		function u(t) {
			r.textContent = n[t], c.setAttribute("data-copy-state", t)
		}
	})) : console.warn("Copy to Clipboard plugin loaded before Toolbar plugin."))
}();