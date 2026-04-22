import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function createElement$1(tagName, options) {
    return document.createElement(tagName, options);
}
function createElementNS(namespaceURI, qualifiedName, options) {
    return document.createElementNS(namespaceURI, qualifiedName, options);
}
function createDocumentFragment() {
    return parseFragment(document.createDocumentFragment());
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createComment(text) {
    return document.createComment(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
    if (isDocumentFragment$1(parentNode)) {
        let node = parentNode;
        while (node && isDocumentFragment$1(node)) {
            const fragment = parseFragment(node);
            node = fragment.parent;
        }
        parentNode = node !== null && node !== void 0 ? node : parentNode;
    }
    if (isDocumentFragment$1(newNode)) {
        newNode = parseFragment(newNode, parentNode);
    }
    if (referenceNode && isDocumentFragment$1(referenceNode)) {
        referenceNode = parseFragment(referenceNode).firstChildNode;
    }
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
    node.removeChild(child);
}
function appendChild(node, child) {
    if (isDocumentFragment$1(child)) {
        child = parseFragment(child, node);
    }
    node.appendChild(child);
}
function parentNode(node) {
    if (isDocumentFragment$1(node)) {
        while (node && isDocumentFragment$1(node)) {
            const fragment = parseFragment(node);
            node = fragment.parent;
        }
        return node !== null && node !== void 0 ? node : null;
    }
    return node.parentNode;
}
function nextSibling(node) {
    var _a;
    if (isDocumentFragment$1(node)) {
        const fragment = parseFragment(node);
        const parent = parentNode(fragment);
        if (parent && fragment.lastChildNode) {
            const children = Array.from(parent.childNodes);
            const index = children.indexOf(fragment.lastChildNode);
            return (_a = children[index + 1]) !== null && _a !== void 0 ? _a : null;
        }
        return null;
    }
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement$2(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
function isDocumentFragment$1(node) {
    return node.nodeType === 11;
}
function parseFragment(fragmentNode, parentNode) {
    var _a, _b, _c;
    const fragment = fragmentNode;
    (_a = fragment.parent) !== null && _a !== void 0 ? _a : (fragment.parent = parentNode !== null && parentNode !== void 0 ? parentNode : null);
    (_b = fragment.firstChildNode) !== null && _b !== void 0 ? _b : (fragment.firstChildNode = fragmentNode.firstChild);
    (_c = fragment.lastChildNode) !== null && _c !== void 0 ? _c : (fragment.lastChildNode = fragmentNode.lastChild);
    return fragment;
}
const htmlDomApi = {
    createElement: createElement$1,
    createElementNS,
    createTextNode,
    createDocumentFragment,
    createComment,
    insertBefore,
    removeChild,
    appendChild,
    parentNode,
    nextSibling,
    tagName,
    setTextContent,
    getTextContent,
    isElement: isElement$2,
    isText,
    isComment,
    isDocumentFragment: isDocumentFragment$1
};

function vnode(sel, data, children, text, elm) {
    const key = data === undefined ? undefined : data.key;
    return { sel, data, children, text, elm, key };
}

const array = Array.isArray;
function primitive(s) {
    return (typeof s === "string" ||
        typeof s === "number" ||
        s instanceof String ||
        s instanceof Number);
}

function isUndef(s) {
    return s === undefined;
}
function isDef(s) {
    return s !== undefined;
}
const emptyNode = vnode("", {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
    var _a, _b;
    const isSameKey = vnode1.key === vnode2.key;
    const isSameIs = ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) === ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
    const isSameSel = vnode1.sel === vnode2.sel;
    const isSameTextOrFragment = !vnode1.sel && vnode1.sel === vnode2.sel
        ? typeof vnode1.text === typeof vnode2.text
        : true;
    return isSameSel && isSameKey && isSameIs && isSameTextOrFragment;
}
/**
 * @todo Remove this function when the document fragment is considered stable.
 */
function documentFragmentIsNotSupported() {
    throw new Error("The document fragment is not supported on this platform.");
}
function isElement$1(api, vnode) {
    return api.isElement(vnode);
}
function isDocumentFragment(api, vnode) {
    return api.isDocumentFragment(vnode);
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var _a;
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
        const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
        if (key !== undefined) {
            map[key] = i;
        }
    }
    return map;
}
const hooks = [
    "create",
    "update",
    "remove",
    "destroy",
    "pre",
    "post"
];
function init(modules, domApi, options) {
    const cbs = {
        create: [],
        update: [],
        remove: [],
        destroy: [],
        pre: [],
        post: []
    };
    const api = htmlDomApi;
    for (const hook of hooks) {
        for (const module of modules) {
            const currentHook = module[hook];
            if (currentHook !== undefined) {
                cbs[hook].push(currentHook);
            }
        }
    }
    function emptyNodeAt(elm) {
        const id = elm.id ? "#" + elm.id : "";
        // elm.className doesn't return a string when elm is an SVG element inside a shadowRoot.
        // https://stackoverflow.com/questions/29454340/detecting-classname-of-svganimatedstring
        const classes = elm.getAttribute("class");
        const c = classes ? "." + classes.split(" ").join(".") : "";
        return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }
    function emptyDocumentFragmentAt(frag) {
        return vnode(undefined, {}, [], undefined, frag);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                const parent = api.parentNode(childElm);
                if (parent !== null) {
                    api.removeChild(parent, childElm);
                }
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var _a, _b, _c, _d;
        let i;
        let data = vnode.data;
        if (data !== undefined) {
            const init = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
            if (isDef(init)) {
                init(vnode);
                data = vnode.data;
            }
        }
        const children = vnode.children;
        const sel = vnode.sel;
        if (sel === "!") {
            if (isUndef(vnode.text)) {
                vnode.text = "";
            }
            vnode.elm = api.createComment(vnode.text);
        }
        else if (sel === "") {
            // textNode has no selector
            vnode.elm = api.createTextNode(vnode.text);
        }
        else if (sel !== undefined) {
            // Parse selector
            const hashIdx = sel.indexOf("#");
            const dotIdx = sel.indexOf(".", hashIdx);
            const hash = hashIdx > 0 ? hashIdx : sel.length;
            const dot = dotIdx > 0 ? dotIdx : sel.length;
            const tag = hashIdx !== -1 || dotIdx !== -1
                ? sel.slice(0, Math.min(hash, dot))
                : sel;
            const elm = (vnode.elm =
                isDef(data) && isDef((i = data.ns))
                    ? api.createElementNS(i, tag, data)
                    : api.createElement(tag, data));
            if (hash < dot)
                elm.setAttribute("id", sel.slice(hash + 1, dot));
            if (dotIdx > 0)
                elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " "));
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            if (primitive(vnode.text) &&
                (!array(children) || children.length === 0)) {
                // allow h1 and similar nodes to be created w/ text and empty child list
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            if (array(children)) {
                for (i = 0; i < children.length; ++i) {
                    const ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            const hook = vnode.data.hook;
            if (isDef(hook)) {
                (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode);
                if (hook.insert) {
                    insertedVnodeQueue.push(vnode);
                }
            }
        }
        else if (((_c = void 0 ) === null || _c === void 0 ? void 0 : _c.fragments) && vnode.children) {
            vnode.elm = ((_d = api.createDocumentFragment) !== null && _d !== void 0 ? _d : documentFragmentIsNotSupported)();
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            for (i = 0; i < vnode.children.length; ++i) {
                const ch = vnode.children[i];
                if (ch != null) {
                    api.appendChild(vnode.elm, createElm(ch, insertedVnodeQueue));
                }
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var _a, _b;
        const data = vnode.data;
        if (data !== undefined) {
            (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode);
            for (let i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (let j = 0; j < vnode.children.length; ++j) {
                    const child = vnode.children[j];
                    if (child != null && typeof child !== "string") {
                        invokeDestroyHook(child);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        var _a, _b;
        for (; startIdx <= endIdx; ++startIdx) {
            let listeners;
            let rm;
            const ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (let i = 0; i < cbs.remove.length; ++i)
                        cbs.remove[i](ch, rm);
                    const removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
                    if (isDef(removeHook)) {
                        removeHook(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else if (ch.children) {
                    // Fragment node
                    invokeDestroyHook(ch);
                    removeVnodes(parentElm, ch.children, 0, ch.children.length - 1);
                }
                else {
                    // Text node
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        let oldStartIdx = 0;
        let newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let oldKeyToIdx;
        let idxInOld;
        let elmToMove;
        let before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) {
                // Vnode moved right
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    // `newStartVnode` is new, create and insert it in beginning
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (isUndef(oldKeyToIdx[newEndVnode.key])) {
                    // `newEndVnode` is new, create and insert it in the end
                    api.insertBefore(parentElm, createElm(newEndVnode, insertedVnodeQueue), api.nextSibling(oldEndVnode.elm));
                    newEndVnode = newCh[--newEndIdx];
                }
                else {
                    // Neither of the new endpoints are new vnodes, so we make progress by
                    // moving `newStartVnode` into position
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (newStartIdx <= newEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        }
        if (oldStartIdx <= oldEndIdx) {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const hook = (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.hook;
        (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode);
        const elm = (vnode.elm = oldVnode.elm);
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined ||
            (isDef(vnode.text) && vnode.text !== oldVnode.text)) {
            (_c = vnode.data) !== null && _c !== void 0 ? _c : (vnode.data = {});
            (_d = oldVnode.data) !== null && _d !== void 0 ? _d : (oldVnode.data = {});
            for (let i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            (_g = (_f = (_e = vnode.data) === null || _e === void 0 ? void 0 : _e.hook) === null || _f === void 0 ? void 0 : _f.update) === null || _g === void 0 ? void 0 : _g.call(_f, oldVnode, vnode);
        }
        const oldCh = oldVnode.children;
        const ch = vnode.children;
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, "");
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            }
            else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, "");
            }
        }
        else if (oldVnode.text !== vnode.text) {
            if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            api.setTextContent(elm, vnode.text);
        }
        (_h = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _h === void 0 ? void 0 : _h.call(hook, oldVnode, vnode);
    }
    return function patch(oldVnode, vnode) {
        let i, elm, parent;
        const insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i)
            cbs.pre[i]();
        if (isElement$1(api, oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        else if (isDocumentFragment(api, oldVnode)) {
            oldVnode = emptyDocumentFragmentAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}

function addNS(data, children, sel) {
    data.ns = "http://www.w3.org/2000/svg";
    if (sel !== "foreignObject" && children !== undefined) {
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            if (typeof child === "string")
                continue;
            const childData = child.data;
            if (childData !== undefined) {
                addNS(childData, child.children, child.sel);
            }
        }
    }
}
function h(sel, b, c) {
    let data = {};
    let children;
    let text;
    let i;
    if (c !== undefined) {
        if (b !== null) {
            data = b;
        }
        if (array(c)) {
            children = c;
        }
        else if (primitive(c)) {
            text = c.toString();
        }
        else if (c && c.sel) {
            children = [c];
        }
    }
    else if (b !== undefined && b !== null) {
        if (array(b)) {
            children = b;
        }
        else if (primitive(b)) {
            text = b.toString();
        }
        else if (b && b.sel) {
            children = [b];
        }
        else {
            data = b;
        }
    }
    if (children !== undefined) {
        for (i = 0; i < children.length; ++i) {
            if (primitive(children[i]))
                children[i] = vnode(undefined, undefined, undefined, children[i], undefined);
        }
    }
    if (sel.startsWith("svg") &&
        (sel.length === 3 || sel[3] === "." || sel[3] === "#")) {
        addNS(data, children, sel);
    }
    return vnode(sel, data, children, text, undefined);
}

const xlinkNS = "http://www.w3.org/1999/xlink";
const xmlnsNS = "http://www.w3.org/2000/xmlns/";
const xmlNS = "http://www.w3.org/XML/1998/namespace";
const colonChar = 58;
const xChar = 120;
const mChar = 109;
function updateAttrs(oldVnode, vnode) {
    let key;
    const elm = vnode.elm;
    let oldAttrs = oldVnode.data.attrs;
    let attrs = vnode.data.attrs;
    if (!oldAttrs && !attrs)
        return;
    if (oldAttrs === attrs)
        return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            }
            else if (cur === false) {
                elm.removeAttribute(key);
            }
            else {
                if (key.charCodeAt(0) !== xChar) {
                    elm.setAttribute(key, cur);
                }
                else if (key.charCodeAt(3) === colonChar) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                }
                else if (key.charCodeAt(5) === colonChar) {
                    // Assume 'xmlns' or 'xlink' namespace
                    key.charCodeAt(1) === mChar
                        ? elm.setAttributeNS(xmlnsNS, key, cur)
                        : elm.setAttributeNS(xlinkNS, key, cur);
                }
                else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
    // remove removed attributes
    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
    // the other option is to remove all attributes with value == undefined
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}
const attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

function updateClass(oldVnode, vnode) {
    let cur;
    let name;
    const elm = vnode.elm;
    let oldClass = oldVnode.data.class;
    let klass = vnode.data.class;
    if (!oldClass && !klass)
        return;
    if (oldClass === klass)
        return;
    oldClass = oldClass || {};
    klass = klass || {};
    for (name in oldClass) {
        if (oldClass[name] && !Object.prototype.hasOwnProperty.call(klass, name)) {
            // was `true` and now not provided
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        cur = klass[name];
        if (cur !== oldClass[name]) {
            elm.classList[cur ? "add" : "remove"](name);
        }
    }
}
const classModule = { create: updateClass, update: updateClass };

function invokeHandler(handler, vnode, event) {
    if (typeof handler === "function") {
        // call function handler
        handler.call(vnode, event, vnode);
    }
    else if (typeof handler === "object") {
        // call multiple handlers
        for (let i = 0; i < handler.length; i++) {
            invokeHandler(handler[i], vnode, event);
        }
    }
}
function handleEvent(event, vnode) {
    const name = event.type;
    const on = vnode.data.on;
    // call event handler(s) if exists
    if (on && on[name]) {
        invokeHandler(on[name], vnode, event);
    }
}
function createListener() {
    return function handler(event) {
        handleEvent(event, handler.vnode);
    };
}
function updateEventListeners(oldVnode, vnode) {
    const oldOn = oldVnode.data.on;
    const oldListener = oldVnode.listener;
    const oldElm = oldVnode.elm;
    const on = vnode && vnode.data.on;
    const elm = (vnode && vnode.elm);
    let name;
    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }
    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                oldElm.removeEventListener(name, oldListener, false);
            }
        }
        else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }
    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        const listener = (vnode.listener =
            oldVnode.listener || createListener());
        // update vnode for listener
        listener.vnode = vnode;
        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        }
        else {
            for (name in on) {
                // add listener if new listener added
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}
const eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners
};

/**
 * An implementation of rfc6749#section-4.1 and rfc7636.
 */
/**
 * A list of OAuth2AuthCodePKCE errors.
 */
// To "namespace" all errors.
class ErrorOAuth2 {
    toString() { return 'ErrorOAuth2'; }
}
// For really unknown errors.
class ErrorUnknown extends ErrorOAuth2 {
    toString() { return 'ErrorUnknown'; }
}
// Some generic, internal errors that can happen.
class ErrorNoAuthCode extends ErrorOAuth2 {
    toString() { return 'ErrorNoAuthCode'; }
}
class ErrorInvalidReturnedStateParam extends ErrorOAuth2 {
    toString() { return 'ErrorInvalidReturnedStateParam'; }
}
class ErrorInvalidJson extends ErrorOAuth2 {
    toString() { return 'ErrorInvalidJson'; }
}
// Errors that occur across many endpoints
class ErrorInvalidScope extends ErrorOAuth2 {
    toString() { return 'ErrorInvalidScope'; }
}
class ErrorInvalidRequest extends ErrorOAuth2 {
    toString() { return 'ErrorInvalidRequest'; }
}
class ErrorInvalidToken extends ErrorOAuth2 {
    toString() { return 'ErrorInvalidToken'; }
}
/**
 * Possible authorization grant errors given by the redirection from the
 * authorization server.
 */
class ErrorAuthenticationGrant extends ErrorOAuth2 {
    toString() { return 'ErrorAuthenticationGrant'; }
}
class ErrorUnauthorizedClient extends ErrorAuthenticationGrant {
    toString() { return 'ErrorUnauthorizedClient'; }
}
class ErrorAccessDenied extends ErrorAuthenticationGrant {
    toString() { return 'ErrorAccessDenied'; }
}
class ErrorUnsupportedResponseType extends ErrorAuthenticationGrant {
    toString() { return 'ErrorUnsupportedResponseType'; }
}
class ErrorServerError extends ErrorAuthenticationGrant {
    toString() { return 'ErrorServerError'; }
}
class ErrorTemporarilyUnavailable extends ErrorAuthenticationGrant {
    toString() { return 'ErrorTemporarilyUnavailable'; }
}
/**
 * A list of possible access token response errors.
 */
class ErrorAccessTokenResponse extends ErrorOAuth2 {
    toString() { return 'ErrorAccessTokenResponse'; }
}
class ErrorInvalidClient extends ErrorAccessTokenResponse {
    toString() { return 'ErrorInvalidClient'; }
}
class ErrorInvalidGrant extends ErrorAccessTokenResponse {
    toString() { return 'ErrorInvalidGrant'; }
}
class ErrorUnsupportedGrantType extends ErrorAccessTokenResponse {
    toString() { return 'ErrorUnsupportedGrantType'; }
}
const RawErrorToErrorClassMap = {
    invalid_request: ErrorInvalidRequest,
    invalid_grant: ErrorInvalidGrant,
    unauthorized_client: ErrorUnauthorizedClient,
    access_denied: ErrorAccessDenied,
    unsupported_response_type: ErrorUnsupportedResponseType,
    invalid_scope: ErrorInvalidScope,
    server_error: ErrorServerError,
    temporarily_unavailable: ErrorTemporarilyUnavailable,
    invalid_client: ErrorInvalidClient,
    unsupported_grant_type: ErrorUnsupportedGrantType,
    invalid_json: ErrorInvalidJson,
    invalid_token: ErrorInvalidToken,
};
/**
 * Translate the raw error strings returned from the server into error classes.
 */
function toErrorClass(rawError) {
    return new (RawErrorToErrorClassMap[rawError] || ErrorUnknown)();
}
/**
 * A convience function to turn, for example, `Bearer realm="bity.com",
 * error="invalid_client"` into `{ realm: "bity.com", error: "invalid_client"
 * }`.
 */
function fromWWWAuthenticateHeaderStringToObject(a) {
    const obj = a
        .slice("Bearer ".length)
        .replace(/"/g, '')
        .split(', ')
        .map(tokens => { const [k, v] = tokens.split('='); return { [k]: v }; })
        .reduce((a, c) => (Object.assign(Object.assign({}, a), c)), {});
    return { realm: obj.realm, error: obj.error };
}
/**
 * HTTP headers that we need to access.
 */
const HEADER_AUTHORIZATION = "Authorization";
const HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";
/**
 * To store the OAuth client's data between websites due to redirection.
 */
const LOCALSTORAGE_ID = `oauth2authcodepkce`;
const LOCALSTORAGE_STATE = `${LOCALSTORAGE_ID}-state`;
/**
 * The maximum length for a code verifier for the best security we can offer.
 * Please note the NOTE section of RFC 7636 § 4.1 - the length must be >= 43,
 * but <= 128, **after** base64 url encoding. This means 32 code verifier bytes
 * encoded will be 43 bytes, or 96 bytes encoded will be 128 bytes. So 96 bytes
 * is the highest valid value that can be used.
 */
const RECOMMENDED_CODE_VERIFIER_LENGTH = 96;
/**
 * A sensible length for the state's length, for anti-csrf.
 */
const RECOMMENDED_STATE_LENGTH = 32;
/**
 * Character set to generate code verifier defined in rfc7636.
 */
const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
/**
 * OAuth 2.0 client that ONLY supports authorization code flow, with PKCE.
 *
 * Many applications structure their OAuth usage in different ways. This class
 * aims to provide both flexible and easy ways to use this configuration of
 * OAuth.
 *
 * See `example.ts` for how you'd typically use this.
 *
 * For others, review this class's methods.
 */
class OAuth2AuthCodePKCE {
    constructor(config) {
        this.state = {};
        this.config = config;
        this.recoverState();
        return this;
    }
    /**
     * Attach the OAuth logic to all fetch requests and translate errors (either
     * returned as json or through the WWW-Authenticate header) into nice error
     * classes.
     */
    decorateFetchHTTPClient(fetch) {
        return (url, config, ...rest) => {
            if (!this.state.isHTTPDecoratorActive) {
                return fetch(url, config, ...rest);
            }
            return this
                .getAccessToken()
                .then(({ token }) => {
                const configNew = Object.assign({}, config);
                if (!configNew.headers) {
                    configNew.headers = {};
                }
                configNew.headers[HEADER_AUTHORIZATION] = `Bearer ${token.value}`;
                return fetch(url, configNew, ...rest);
            })
                .then((res) => {
                if (res.ok) {
                    return res;
                }
                if (!res.headers.has(HEADER_WWW_AUTHENTICATE.toLowerCase())) {
                    return res;
                }
                const error = toErrorClass(fromWWWAuthenticateHeaderStringToObject(res.headers.get(HEADER_WWW_AUTHENTICATE.toLowerCase())).error);
                if (error instanceof ErrorInvalidToken) {
                    this.config
                        .onAccessTokenExpiry(() => this.exchangeRefreshTokenForAccessToken());
                }
                return Promise.reject(error);
            });
        };
    }
    /**
     * If there is an error, it will be passed back as a rejected Promise.
     * If there is no code, the user should be redirected via
     * [fetchAuthorizationCode].
     */
    isReturningFromAuthServer() {
        const error = OAuth2AuthCodePKCE.extractParamFromUrl(location.href, 'error');
        if (error) {
            return Promise.reject(toErrorClass(error));
        }
        const code = OAuth2AuthCodePKCE.extractParamFromUrl(location.href, 'code');
        if (!code) {
            return Promise.resolve(false);
        }
        const state = JSON.parse(localStorage.getItem(LOCALSTORAGE_STATE) || '{}');
        const stateQueryParam = OAuth2AuthCodePKCE.extractParamFromUrl(location.href, 'state');
        if (stateQueryParam !== state.stateQueryParam) {
            console.warn("state query string parameter doesn't match the one sent! Possible malicious activity somewhere.");
            return Promise.reject(new ErrorInvalidReturnedStateParam());
        }
        state.authorizationCode = code;
        state.hasAuthCodeBeenExchangedForAccessToken = false;
        localStorage.setItem(LOCALSTORAGE_STATE, JSON.stringify(state));
        this.setState(state);
        return Promise.resolve(true);
    }
    /**
     * Fetch an authorization grant via redirection. In a sense this function
     * doesn't return because of the redirect behavior (uses `location.replace`).
     *
     * @param oneTimeParams A way to specify "one time" used query string
     * parameters during the authorization code fetching process, usually for
     * values which need to change at run-time.
     */
    async fetchAuthorizationCode(oneTimeParams) {
        this.assertStateAndConfigArePresent();
        const { clientId, extraAuthorizationParams, redirectUrl, scopes } = this.config;
        const { codeChallenge, codeVerifier } = await OAuth2AuthCodePKCE
            .generatePKCECodes();
        const stateQueryParam = OAuth2AuthCodePKCE
            .generateRandomState(RECOMMENDED_STATE_LENGTH);
        this.state = Object.assign(Object.assign({}, this.state), { codeChallenge,
            codeVerifier,
            stateQueryParam, isHTTPDecoratorActive: true });
        localStorage.setItem(LOCALSTORAGE_STATE, JSON.stringify(this.state));
        let url = this.config.authorizationUrl
            + `?response_type=code&`
            + `client_id=${encodeURIComponent(clientId)}&`
            + `redirect_uri=${encodeURIComponent(redirectUrl)}&`
            + `scope=${encodeURIComponent(scopes.join(' '))}&`
            + `state=${stateQueryParam}&`
            + `code_challenge=${encodeURIComponent(codeChallenge)}&`
            + `code_challenge_method=S256`;
        if (extraAuthorizationParams || oneTimeParams) {
            const extraParameters = Object.assign(Object.assign({}, extraAuthorizationParams), oneTimeParams);
            url = `${url}&${OAuth2AuthCodePKCE.objectToQueryString(extraParameters)}`;
        }
        location.replace(url);
    }
    /**
     * Tries to get the current access token. If there is none
     * it will fetch another one. If it is expired, it will fire
     * [onAccessTokenExpiry] but it's up to the user to call the refresh token
     * function. This is because sometimes not using the refresh token facilities
     * is easier.
     */
    getAccessToken() {
        this.assertStateAndConfigArePresent();
        const { onAccessTokenExpiry } = this.config;
        const { accessToken, authorizationCode, explicitlyExposedTokens, hasAuthCodeBeenExchangedForAccessToken, refreshToken, scopes } = this.state;
        if (!authorizationCode) {
            return Promise.reject(new ErrorNoAuthCode());
        }
        if (this.authCodeForAccessTokenRequest) {
            return this.authCodeForAccessTokenRequest;
        }
        if (!this.isAuthorized() || !hasAuthCodeBeenExchangedForAccessToken) {
            this.authCodeForAccessTokenRequest = this.exchangeAuthCodeForAccessToken();
            return this.authCodeForAccessTokenRequest;
        }
        // Depending on the server (and config), refreshToken may not be available.
        if (refreshToken && this.isAccessTokenExpired()) {
            return onAccessTokenExpiry(() => this.exchangeRefreshTokenForAccessToken());
        }
        return Promise.resolve({
            token: accessToken,
            explicitlyExposedTokens,
            scopes,
            refreshToken
        });
    }
    /**
     * Refresh an access token from the remote service.
     */
    exchangeRefreshTokenForAccessToken() {
        this.assertStateAndConfigArePresent();
        const { extraRefreshParams, clientId, tokenUrl } = this.config;
        const { refreshToken } = this.state;
        if (!refreshToken) {
            console.warn('No refresh token is present.');
        }
        const url = tokenUrl;
        let body = `grant_type=refresh_token&`
            + `refresh_token=${refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.value}&`
            + `client_id=${clientId}`;
        if (extraRefreshParams) {
            body = `${url}&${OAuth2AuthCodePKCE.objectToQueryString(extraRefreshParams)}`;
        }
        return fetch(url, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(res => res.status >= 400 ? res.json().then(data => Promise.reject(data)) : res.json())
            .then((json) => {
            const { access_token, expires_in, refresh_token, scope } = json;
            const { explicitlyExposedTokens } = this.config;
            let scopes = [];
            let tokensToExpose = {};
            const accessToken = {
                value: access_token,
                expiry: (new Date(Date.now() + (parseInt(expires_in) * 1000))).toString()
            };
            this.state.accessToken = accessToken;
            if (refresh_token) {
                const refreshToken = {
                    value: refresh_token
                };
                this.state.refreshToken = refreshToken;
            }
            if (explicitlyExposedTokens) {
                tokensToExpose = Object.fromEntries(explicitlyExposedTokens
                    .map((tokenName) => [tokenName, json[tokenName]])
                    .filter(([_, tokenValue]) => tokenValue !== undefined));
                this.state.explicitlyExposedTokens = tokensToExpose;
            }
            if (scope) {
                // Multiple scopes are passed and delimited by spaces,
                // despite using the singular name "scope".
                scopes = scope.split(' ');
                this.state.scopes = scopes;
            }
            localStorage.setItem(LOCALSTORAGE_STATE, JSON.stringify(this.state));
            let accessContext = { token: accessToken, scopes };
            if (explicitlyExposedTokens) {
                accessContext.explicitlyExposedTokens = tokensToExpose;
            }
            return accessContext;
        })
            .catch(data => {
            const { onInvalidGrant } = this.config;
            const error = data.error || 'There was a network error.';
            switch (error) {
                case 'invalid_grant':
                    onInvalidGrant(() => this.fetchAuthorizationCode());
                    break;
            }
            return Promise.reject(toErrorClass(error));
        });
    }
    /**
     * Get the scopes that were granted by the authorization server.
     */
    getGrantedScopes() {
        return this.state.scopes;
    }
    /**
     * Signals if OAuth HTTP decorating should be active or not.
     */
    isHTTPDecoratorActive(isActive) {
        this.state.isHTTPDecoratorActive = isActive;
        localStorage.setItem(LOCALSTORAGE_STATE, JSON.stringify(this.state));
    }
    /**
     * Tells if the client is authorized or not. This means the client has at
     * least once successfully fetched an access token. The access token could be
     * expired.
     */
    isAuthorized() {
        return !!this.state.accessToken;
    }
    /**
     * Checks to see if the access token has expired.
     */
    isAccessTokenExpired() {
        const { accessToken } = this.state;
        return Boolean(accessToken && (new Date()) >= (new Date(accessToken.expiry)));
    }
    /**
     * Resets the state of the client. Equivalent to "logging out" the user.
     */
    reset() {
        this.setState({});
        this.authCodeForAccessTokenRequest = undefined;
    }
    /**
     * If the state or config are missing, it means the client is in a bad state.
     * This should never happen, but the check is there just in case.
     */
    assertStateAndConfigArePresent() {
        if (!this.state || !this.config) {
            console.error('state:', this.state, 'config:', this.config);
            throw new Error('state or config is not set.');
        }
    }
    /**
     * Fetch an access token from the remote service. You may pass a custom
     * authorization grant code for any reason, but this is non-standard usage.
     */
    exchangeAuthCodeForAccessToken(codeOverride) {
        this.assertStateAndConfigArePresent();
        const { authorizationCode = codeOverride, codeVerifier = '' } = this.state;
        const { clientId, onInvalidGrant, redirectUrl } = this.config;
        if (!codeVerifier) {
            console.warn('No code verifier is being sent.');
        }
        else if (!authorizationCode) {
            console.warn('No authorization grant code is being passed.');
        }
        const url = this.config.tokenUrl;
        const body = `grant_type=authorization_code&`
            + `code=${encodeURIComponent(authorizationCode || '')}&`
            + `redirect_uri=${encodeURIComponent(redirectUrl)}&`
            + `client_id=${encodeURIComponent(clientId)}&`
            + `code_verifier=${codeVerifier}`;
        return fetch(url, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(res => {
            const jsonPromise = res.json()
                .catch(_ => ({ error: 'invalid_json' }));
            if (!res.ok) {
                return jsonPromise.then(({ error }) => {
                    switch (error) {
                        case 'invalid_grant':
                            onInvalidGrant(() => this.fetchAuthorizationCode());
                            break;
                    }
                    return Promise.reject(toErrorClass(error));
                });
            }
            return jsonPromise.then((json) => {
                const { access_token, expires_in, refresh_token, scope } = json;
                const { explicitlyExposedTokens } = this.config;
                let scopes = [];
                let tokensToExpose = {};
                this.state.hasAuthCodeBeenExchangedForAccessToken = true;
                this.authCodeForAccessTokenRequest = undefined;
                const accessToken = {
                    value: access_token,
                    expiry: (new Date(Date.now() + (parseInt(expires_in) * 1000))).toString()
                };
                this.state.accessToken = accessToken;
                if (refresh_token) {
                    const refreshToken = {
                        value: refresh_token
                    };
                    this.state.refreshToken = refreshToken;
                }
                if (explicitlyExposedTokens) {
                    tokensToExpose = Object.fromEntries(explicitlyExposedTokens
                        .map((tokenName) => [tokenName, json[tokenName]])
                        .filter(([_, tokenValue]) => tokenValue !== undefined));
                    this.state.explicitlyExposedTokens = tokensToExpose;
                }
                if (scope) {
                    // Multiple scopes are passed and delimited by spaces,
                    // despite using the singular name "scope".
                    scopes = scope.split(' ');
                    this.state.scopes = scopes;
                }
                localStorage.setItem(LOCALSTORAGE_STATE, JSON.stringify(this.state));
                let accessContext = { token: accessToken, scopes };
                if (explicitlyExposedTokens) {
                    accessContext.explicitlyExposedTokens = tokensToExpose;
                }
                return accessContext;
            });
        });
    }
    recoverState() {
        this.state = JSON.parse(localStorage.getItem(LOCALSTORAGE_STATE) || '{}');
        return this;
    }
    setState(state) {
        this.state = state;
        localStorage.setItem(LOCALSTORAGE_STATE, JSON.stringify(state));
        return this;
    }
    /**
     * Implements *base64url-encode* (RFC 4648 § 5) without padding, which is NOT
     * the same as regular base64 encoding.
     */
    static base64urlEncode(value) {
        let base64 = btoa(value);
        base64 = base64.replace(/\+/g, '-');
        base64 = base64.replace(/\//g, '_');
        base64 = base64.replace(/=/g, '');
        return base64;
    }
    /**
     * Extracts a query string parameter.
     */
    static extractParamFromUrl(url, param) {
        let queryString = url.split('?');
        if (queryString.length < 2) {
            return '';
        }
        // Account for hash URLs that SPAs usually use.
        queryString = queryString[1].split('#');
        const parts = queryString[0]
            .split('&')
            .reduce((a, s) => a.concat(s.split('=')), []);
        if (parts.length < 2) {
            return '';
        }
        const paramIdx = parts.indexOf(param);
        return decodeURIComponent(paramIdx >= 0 ? parts[paramIdx + 1] : '');
    }
    /**
     * Converts the keys and values of an object to a url query string
     */
    static objectToQueryString(dict) {
        return Object.entries(dict).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
    }
    /**
     * Generates a code_verifier and code_challenge, as specified in rfc7636.
     */
    static generatePKCECodes() {
        const output = new Uint32Array(RECOMMENDED_CODE_VERIFIER_LENGTH);
        crypto.getRandomValues(output);
        const codeVerifier = OAuth2AuthCodePKCE.base64urlEncode(Array
            .from(output)
            .map((num) => PKCE_CHARSET[num % PKCE_CHARSET.length])
            .join(''));
        return crypto
            .subtle
            .digest('SHA-256', (new TextEncoder()).encode(codeVerifier))
            .then((buffer) => {
            let hash = new Uint8Array(buffer);
            let binary = '';
            let hashLength = hash.byteLength;
            for (let i = 0; i < hashLength; i++) {
                binary += String.fromCharCode(hash[i]);
            }
            return binary;
        })
            .then(OAuth2AuthCodePKCE.base64urlEncode)
            .then((codeChallenge) => ({ codeChallenge, codeVerifier }));
    }
    /**
     * Generates random state to be passed for anti-csrf.
     */
    static generateRandomState(lengthOfState) {
        const output = new Uint32Array(lengthOfState);
        crypto.getRandomValues(output);
        return Array
            .from(output)
            .map((num) => PKCE_CHARSET[num % PKCE_CHARSET.length])
            .join('');
    }
}

// ND-JSON response streamer
// See https://lichess.org/api#section/Introduction/Streaming-with-ND-JSON
const readStream = (name, response, handler) => {
    const stream = response.body.getReader();
    const matcher = /\r?\n/;
    const decoder = new TextDecoder();
    let buf = '';
    const process = (json) => {
        const msg = JSON.parse(json);
        console.log(name, msg);
        handler(msg);
    };
    const loop = () => stream.read().then(({ done, value }) => {
        if (done) {
            if (buf.length > 0)
                process(buf);
            return;
        }
        else {
            const chunk = decoder.decode(value, {
                stream: true,
            });
            buf += chunk;
            const parts = buf.split(matcher);
            buf = parts.pop() || '';
            for (const i of parts.filter(p => p))
                process(i);
            return loop();
        }
    });
    return {
        closePromise: loop(),
        close: () => stream.cancel(),
    };
};

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var suffix = res[6];
    var asterisk = res[7];

    var repeat = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';
    var delimiter = prefix || '/';
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$');
    }
  }

  return function (obj) {
    var path = '';
    var data = obj || {};

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = encodeURIComponent(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path);
  var re = tokensToRegExp(tokens, options);

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i]);
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';
  var lastToken = tokens[tokens.length - 1];
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = token.pattern;

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || [];

  if (!isarray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

/**
   * Module dependencies.
   */

  

  /**
   * Short-cuts for global-object checks
   */

  var hasDocument = ('undefined' !== typeof document);
  var hasWindow = ('undefined' !== typeof window);
  var hasHistory = ('undefined' !== typeof history);
  var hasProcess = typeof process !== 'undefined';

  /**
   * Detect click event
   */
  var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var isLocation = hasWindow && !!(window.history.location || window.location);

  /**
   * The page instance
   * @api private
   */
  function Page() {
    // public things
    this.callbacks = [];
    this.exits = [];
    this.current = '';
    this.len = 0;

    // private things
    this._decodeURLComponents = true;
    this._base = '';
    this._strict = false;
    this._running = false;
    this._hashbang = false;

    // bound functions
    this.clickHandler = this.clickHandler.bind(this);
    this._onpopstate = this._onpopstate.bind(this);
  }

  /**
   * Configure the instance of page. This can be called multiple times.
   *
   * @param {Object} options
   * @api public
   */

  Page.prototype.configure = function(options) {
    var opts = options || {};

    this._window = opts.window || (hasWindow && window);
    this._decodeURLComponents = opts.decodeURLComponents !== false;
    this._popstate = opts.popstate !== false && hasWindow;
    this._click = opts.click !== false && hasDocument;
    this._hashbang = !!opts.hashbang;

    var _window = this._window;
    if(this._popstate) {
      _window.addEventListener('popstate', this._onpopstate, false);
    } else if(hasWindow) {
      _window.removeEventListener('popstate', this._onpopstate, false);
    }

    if (this._click) {
      _window.document.addEventListener(clickEvent, this.clickHandler, false);
    } else if(hasDocument) {
      _window.document.removeEventListener(clickEvent, this.clickHandler, false);
    }

    if(this._hashbang && hasWindow && !hasHistory) {
      _window.addEventListener('hashchange', this._onpopstate, false);
    } else if(hasWindow) {
      _window.removeEventListener('hashchange', this._onpopstate, false);
    }
  };

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  Page.prototype.base = function(path) {
    if (0 === arguments.length) return this._base;
    this._base = path;
  };

  /**
   * Gets the `base`, which depends on whether we are using History or
   * hashbang routing.

   * @api private
   */
  Page.prototype._getBase = function() {
    var base = this._base;
    if(!!base) return base;
    var loc = hasWindow && this._window && this._window.location;

    if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
      base = loc.pathname;
    }

    return base;
  };

  /**
   * Get or set strict path matching to `enable`
   *
   * @param {boolean} enable
   * @api public
   */

  Page.prototype.strict = function(enable) {
    if (0 === arguments.length) return this._strict;
    this._strict = enable;
  };


  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  Page.prototype.start = function(options) {
    var opts = options || {};
    this.configure(opts);

    if (false === opts.dispatch) return;
    this._running = true;

    var url;
    if(isLocation) {
      var window = this._window;
      var loc = window.location;

      if(this._hashbang && ~loc.hash.indexOf('#!')) {
        url = loc.hash.substr(2) + loc.search;
      } else if (this._hashbang) {
        url = loc.search + loc.hash;
      } else {
        url = loc.pathname + loc.search + loc.hash;
      }
    }

    this.replace(url, null, true, opts.dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  Page.prototype.stop = function() {
    if (!this._running) return;
    this.current = '';
    this.len = 0;
    this._running = false;

    var window = this._window;
    this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
    hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
    hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  Page.prototype.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state, this),
      prev = this.prevContext;
    this.prevContext = ctx;
    this.current = ctx.path;
    if (false !== dispatch) this.dispatch(ctx, prev);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  Page.prototype.back = function(path, state) {
    var page = this;
    if (this.len > 0) {
      var window = this._window;
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      hasHistory && window.history.back();
      this.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    } else {
      setTimeout(function() {
        page.show(page._getBase(), state);
      });
    }
  };

  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  Page.prototype.redirect = function(from, to) {
    var inst = this;

    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page.call(this, from, function(e) {
        setTimeout(function() {
          inst.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        inst.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  Page.prototype.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state, this),
      prev = this.prevContext;
    this.prevContext = ctx;
    this.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) this.dispatch(ctx, prev);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */

  Page.prototype.dispatch = function(ctx, prev) {
    var i = 0, j = 0, page = this;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled.call(page, ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  Page.prototype.exit = function(path, fn) {
    if (typeof path === 'function') {
      return this.exit('*', path);
    }

    var route = new Route(path, null, this);
    for (var i = 1; i < arguments.length; ++i) {
      this.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Handle "click" events.
   */

  /* jshint +W054 */
  Page.prototype.clickHandler = function(e) {
    if (1 !== this._which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    // use shadow dom when available if not, fall back to composedPath()
    // for browsers that only have shady
    var el = e.target;
    var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

    if(eventPath) {
      for (var i = 0; i < eventPath.length; i++) {
        if (!eventPath[i].nodeName) continue;
        if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
        if (!eventPath[i].href) continue;

        el = eventPath[i];
        break;
      }
    }

    // continue ensure link
    // el.nodeName for svg links are 'a' instead of 'A'
    while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
    if (!el || 'A' !== el.nodeName.toUpperCase()) return;

    // check if link is inside an svg
    // in this case, both href and target are always inside an object
    var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    // svg target is an object and its desired value is in .baseVal property
    if (svg ? el.target.baseVal : el.target) return;

    // x-origin
    // note: svg links that are not relative don't call click events (and skip page.js)
    // consequently, all svg links tested inside page.js are relative and in the same origin
    if (!svg && !this.sameOrigin(el.href)) return;

    // rebuild path
    // There aren't .pathname and .search properties in svg links, so we use href
    // Also, svg href is an object and its desired value is in .baseVal property
    var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

    path = path[0] !== '/' ? '/' + path : path;

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;
    var pageBase = this._getBase();

    if (path.indexOf(pageBase) === 0) {
      path = path.substr(pageBase.length);
    }

    if (this._hashbang) path = path.replace('#!', '');

    if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
      return;
    }

    e.preventDefault();
    this.show(orig);
  };

  /**
   * Handle "populate" events.
   * @api private
   */

  Page.prototype._onpopstate = (function () {
    var loaded = false;
    if ( ! hasWindow ) {
      return function () {};
    }
    if (hasDocument && document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      var page = this;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else if (isLocation) {
        var loc = page._window.location;
        page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
      }
    };
  })();

  /**
   * Event button.
   */
  Page.prototype._which = function(e) {
    e = e || (hasWindow && this._window.event);
    return null == e.which ? e.button : e.which;
  };

  /**
   * Convert to a URL object
   * @api private
   */
  Page.prototype._toURL = function(href) {
    var window = this._window;
    if(typeof URL === 'function' && isLocation) {
      return new URL(href, window.location.toString());
    } else if (hasDocument) {
      var anc = window.document.createElement('a');
      anc.href = href;
      return anc;
    }
  };

  /**
   * Check if `href` is the same origin.
   * @param {string} href
   * @api public
   */
  Page.prototype.sameOrigin = function(href) {
    if(!href || !isLocation) return false;

    var url = this._toURL(href);
    var window = this._window;

    var loc = window.location;

    /*
       When the port is the default http port 80 for http, or 443 for
       https, internet explorer 11 returns an empty string for loc.port,
       so we need to compare loc.port with an empty string if url.port
       is the default port 80 or 443.
       Also the comparition with `port` is changed from `===` to `==` because
       `port` can be a string sometimes. This only applies to ie11.
    */
    return loc.protocol === url.protocol &&
      loc.hostname === url.hostname &&
      (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
  };

  /**
   * @api private
   */
  Page.prototype._samePath = function(url) {
    if(!isLocation) return false;
    var window = this._window;
    var loc = window.location;
    return url.pathname === loc.pathname &&
      url.search === loc.search;
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   * @api private
   */
  Page.prototype._decodeURLEncodedURIComponent = function(val) {
    if (typeof val !== 'string') { return val; }
    return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  };

  /**
   * Create a new `page` instance and function
   */
  function createPage() {
    var pageInstance = new Page();

    function pageFn(/* args */) {
      return page.apply(pageInstance, arguments);
    }

    // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
    pageFn.callbacks = pageInstance.callbacks;
    pageFn.exits = pageInstance.exits;
    pageFn.base = pageInstance.base.bind(pageInstance);
    pageFn.strict = pageInstance.strict.bind(pageInstance);
    pageFn.start = pageInstance.start.bind(pageInstance);
    pageFn.stop = pageInstance.stop.bind(pageInstance);
    pageFn.show = pageInstance.show.bind(pageInstance);
    pageFn.back = pageInstance.back.bind(pageInstance);
    pageFn.redirect = pageInstance.redirect.bind(pageInstance);
    pageFn.replace = pageInstance.replace.bind(pageInstance);
    pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
    pageFn.exit = pageInstance.exit.bind(pageInstance);
    pageFn.configure = pageInstance.configure.bind(pageInstance);
    pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
    pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

    pageFn.create = createPage;

    Object.defineProperty(pageFn, 'len', {
      get: function(){
        return pageInstance.len;
      },
      set: function(val) {
        pageInstance.len = val;
      }
    });

    Object.defineProperty(pageFn, 'current', {
      get: function(){
        return pageInstance.current;
      },
      set: function(val) {
        pageInstance.current = val;
      }
    });

    // In 2.0 these can be named exports
    pageFn.Context = Context;
    pageFn.Route = Route;

    return pageFn;
  }

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page.call(this, '*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path), null, this);
      for (var i = 1; i < arguments.length; ++i) {
        this.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      this.start(path);
    }
  }

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;
    var page = this;
    var window = page._window;

    if (page._hashbang) {
      current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
    } else {
      current = isLocation && window.location.pathname + window.location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    isLocation && (window.location.href = ctx.canonicalPath);
  }

  /**
   * Escapes RegExp characters in the given string.
   *
   * @param {string} s
   * @api private
   */
  function escapeRegExp(s) {
    return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state, pageInstance) {
    var _page = this.page = pageInstance || page;
    var window = _page._window;
    var hashbang = _page._hashbang;

    var pageBase = _page._getBase();
    if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    var re = new RegExp('^' + escapeRegExp(pageBase));
    this.path = path.replace(re, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = (hasDocument && window.document.title);
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = this.pathname = parts[0];
      this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    var page = this.page;
    var window = page._window;
    var hashbang = page._hashbang;

    page.len++;
    if (hasHistory) {
        window.history.pushState(this.state, this.title,
          hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    }
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    var page = this.page;
    if (hasHistory) {
        page._window.history.replaceState(this.state, this.title,
          page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    }
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options, page) {
    var _page = this.page = page || globalPage;
    var opts = options || {};
    opts.strict = opts.strict || _page._strict;
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
  }

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) {
        ctx.routePath = self.path;
        return fn(ctx, next);
      }
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    delete params[0];

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = this.page._decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Module exports.
   */

  var globalPage = createPage();
  var page_js = globalPage;
  var default_1 = globalPage;

page_js.default = default_1;

function routing (ctrl) {
    page_js.base(BASE_PATH);
    page_js('/', async (ctx) => {
        if (ctx.querystring.includes('code=liu_'))
            history.pushState({}, '', BASE_PATH || '/');
        ctrl.openHome();
    });
    page_js('/login', async (_) => {
        if (ctrl.auth.me)
            return page_js('/');
        await ctrl.auth.login();
    });
    page_js('/logout', async (_) => {
        await ctrl.auth.logout();
        location.href = BASE_PATH;
    });
    page_js('/game/:id', ctx => {
        ctrl.openGame(ctx.params.id);
    });
    page_js('/tv', ctx => ctrl.watchTv());
    page_js({ hashbang: true });
}
const BASE_PATH = location.pathname.replace(/\/$/, '');
const url = (path) => `${BASE_PATH}${path}`;
const href = (path) => ({ href: url(path) });

const lichessHost = 'https://lichess.org';
// export const lichessHost = 'http://l.org';
const scopes = ['board:play', 'puzzle:read', 'puzzle:write'];
const clientId = 'lichess-api-demo';
const clientUrl = `${location.protocol}//${location.host}${BASE_PATH || '/'}`;
class Auth {
    constructor() {
        this.oauth = new OAuth2AuthCodePKCE({
            authorizationUrl: `${lichessHost}/oauth`,
            tokenUrl: `${lichessHost}/api/token`,
            clientId,
            scopes,
            redirectUrl: clientUrl,
            onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
            onInvalidGrant: console.warn,
        });
        this.authenticate = async () => {
            const httpClient = this.oauth.decorateFetchHTTPClient(window.fetch);
            const res = await httpClient(`${lichessHost}/api/account`);
            const me = Object.assign(Object.assign({}, (await res.json())), { httpClient });
            if (me.error)
                throw me.error;
            this.me = me;
        };
        this.openStream = async (path, config, handler) => {
            const stream = await this.fetchResponse(path, config);
            return readStream(`STREAM ${path}`, stream, handler);
        };
        this.fetchBody = async (path, config = {}) => {
            const res = await this.fetchResponse(path, config);
            const body = await res.json();
            return body;
        };
        this.fetchResponse = async (path, config = {}) => {
            var _a;
            const res = await (((_a = this.me) === null || _a === void 0 ? void 0 : _a.httpClient) || window.fetch)(`${lichessHost}${path}`, config);
            if (res.error || !res.ok) {
                const err = `${res.error} ${res.status} ${res.statusText}`;
                alert(err);
                throw err;
            }
            return res;
        };
    }
    async init() {
        try {
            const accessContext = await this.oauth.getAccessToken();
            if (accessContext)
                await this.authenticate();
        }
        catch (err) {
            console.error(err);
        }
        if (!this.me) {
            try {
                const hasAuthCode = await this.oauth.isReturningFromAuthServer();
                if (hasAuthCode)
                    await this.authenticate();
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    async login() {
        await this.oauth.fetchAuthorizationCode();
    }
    async logout() {
        if (this.me)
            await this.me.httpClient(`${lichessHost}/api/token`, { method: 'DELETE' });
        localStorage.clear();
        this.me = undefined;
    }
}

const formData = (data) => {
    const formData = new FormData();
    for (const k of Object.keys(data))
        formData.append(k, data[k]);
    return formData;
};

class ChallengeCtrl {
    constructor(stream, root) {
        this.stream = stream;
        this.root = root;
        this.awaitClose = async () => {
            await this.stream.closePromise;
            if (this.root.page == 'challenge')
                page_js('/');
        };
        this.onUnmount = () => this.stream.close();
        this.awaitClose();
    }
}
ChallengeCtrl.make = async (config, root) => {
    const stream = await root.auth.openStream(`/api/challenge/${config.username}`, {
        method: 'post',
        body: formData(Object.assign(Object.assign({}, config), { keepAliveStream: true })),
    }, _ => { });
    return new ChallengeCtrl(stream, root);
};

const FILE_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const COLORS = ['white', 'black'];
const ROLES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const CASTLING_SIDES = ['a', 'h'];
function isDrop(v) {
    return 'role' in v;
}

function defined(v) {
    return v !== undefined;
}
function opposite$1(color) {
    return color === 'white' ? 'black' : 'white';
}
function squareRank(square) {
    return square >> 3;
}
function squareFile(square) {
    return square & 0x7;
}
function roleToChar(role) {
    switch (role) {
        case 'pawn':
            return 'p';
        case 'knight':
            return 'n';
        case 'bishop':
            return 'b';
        case 'rook':
            return 'r';
        case 'queen':
            return 'q';
        case 'king':
            return 'k';
    }
}
function charToRole(ch) {
    switch (ch) {
        case 'P':
        case 'p':
            return 'pawn';
        case 'N':
        case 'n':
            return 'knight';
        case 'B':
        case 'b':
            return 'bishop';
        case 'R':
        case 'r':
            return 'rook';
        case 'Q':
        case 'q':
            return 'queen';
        case 'K':
        case 'k':
            return 'king';
        default:
            return;
    }
}
function parseSquare(str) {
    if (str.length !== 2)
        return;
    const file = str.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = str.charCodeAt(1) - '1'.charCodeAt(0);
    if (file < 0 || file >= 8 || rank < 0 || rank >= 8)
        return;
    return file + 8 * rank;
}
function makeSquare(square) {
    return (FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)]);
}
function parseUci(str) {
    if (str[1] === '@' && str.length === 4) {
        const role = charToRole(str[0]);
        const to = parseSquare(str.slice(2));
        if (role && defined(to))
            return { role, to };
    }
    else if (str.length === 4 || str.length === 5) {
        const from = parseSquare(str.slice(0, 2));
        const to = parseSquare(str.slice(2, 4));
        let promotion;
        if (str.length === 5) {
            promotion = charToRole(str[4]);
            if (!promotion)
                return;
        }
        if (defined(from) && defined(to))
            return { from, to, promotion };
    }
    return;
}
/**
 * Converts a move to UCI notation, like `g1f3` for a normal move,
 * `a7a8q` for promotion to a queen, and `Q@f7` for a Crazyhouse drop.
 */
function makeUci(move) {
    if (isDrop(move))
        return `${roleToChar(move.role).toUpperCase()}@${makeSquare(move.to)}`;
    return makeSquare(move.from) + makeSquare(move.to) + (move.promotion ? roleToChar(move.promotion) : '');
}
function kingCastlesTo(color, side) {
    return color === 'white' ? (side === 'a' ? 2 : 6) : side === 'a' ? 58 : 62;
}

function popcnt32(n) {
    n = n - ((n >>> 1) & 1431655765);
    n = (n & 858993459) + ((n >>> 2) & 858993459);
    return Math.imul((n + (n >>> 4)) & 252645135, 16843009) >> 24;
}
function bswap32(n) {
    n = ((n >>> 8) & 16711935) | ((n & 16711935) << 8);
    return ((n >>> 16) & 0xffff) | ((n & 0xffff) << 16);
}
function rbit32(n) {
    n = ((n >>> 1) & 1431655765) | ((n & 1431655765) << 1);
    n = ((n >>> 2) & 858993459) | ((n & 858993459) << 2);
    n = ((n >>> 4) & 252645135) | ((n & 252645135) << 4);
    return bswap32(n);
}
class SquareSet {
    constructor(lo, hi) {
        this.lo = lo;
        this.hi = hi;
        this.lo = lo | 0;
        this.hi = hi | 0;
    }
    static fromSquare(square) {
        return square >= 32 ? new SquareSet(0, 1 << (square - 32)) : new SquareSet(1 << square, 0);
    }
    static fromRank(rank) {
        return new SquareSet(0xff, 0).shl64(8 * rank);
    }
    static fromFile(file) {
        return new SquareSet(16843009 << file, 16843009 << file);
    }
    static empty() {
        return new SquareSet(0, 0);
    }
    static full() {
        return new SquareSet(4294967295, 4294967295);
    }
    static corners() {
        return new SquareSet(0x81, 2164260864);
    }
    static center() {
        return new SquareSet(402653184, 0x18);
    }
    static backranks() {
        return new SquareSet(0xff, 4278190080);
    }
    static backrank(color) {
        return color === 'white' ? new SquareSet(0xff, 0) : new SquareSet(0, 4278190080);
    }
    static lightSquares() {
        return new SquareSet(1437226410, 1437226410);
    }
    static darkSquares() {
        return new SquareSet(2857740885, 2857740885);
    }
    complement() {
        return new SquareSet(~this.lo, ~this.hi);
    }
    xor(other) {
        return new SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
    }
    union(other) {
        return new SquareSet(this.lo | other.lo, this.hi | other.hi);
    }
    intersect(other) {
        return new SquareSet(this.lo & other.lo, this.hi & other.hi);
    }
    diff(other) {
        return new SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
    }
    intersects(other) {
        return this.intersect(other).nonEmpty();
    }
    isDisjoint(other) {
        return this.intersect(other).isEmpty();
    }
    supersetOf(other) {
        return other.diff(this).isEmpty();
    }
    subsetOf(other) {
        return this.diff(other).isEmpty();
    }
    shr64(shift) {
        if (shift >= 64)
            return SquareSet.empty();
        if (shift >= 32)
            return new SquareSet(this.hi >>> (shift - 32), 0);
        if (shift > 0)
            return new SquareSet((this.lo >>> shift) ^ (this.hi << (32 - shift)), this.hi >>> shift);
        return this;
    }
    shl64(shift) {
        if (shift >= 64)
            return SquareSet.empty();
        if (shift >= 32)
            return new SquareSet(0, this.lo << (shift - 32));
        if (shift > 0)
            return new SquareSet(this.lo << shift, (this.hi << shift) ^ (this.lo >>> (32 - shift)));
        return this;
    }
    bswap64() {
        return new SquareSet(bswap32(this.hi), bswap32(this.lo));
    }
    rbit64() {
        return new SquareSet(rbit32(this.hi), rbit32(this.lo));
    }
    minus64(other) {
        const lo = this.lo - other.lo;
        const c = ((lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1)) >>> 31;
        return new SquareSet(lo, this.hi - (other.hi + c));
    }
    equals(other) {
        return this.lo === other.lo && this.hi === other.hi;
    }
    size() {
        return popcnt32(this.lo) + popcnt32(this.hi);
    }
    isEmpty() {
        return this.lo === 0 && this.hi === 0;
    }
    nonEmpty() {
        return this.lo !== 0 || this.hi !== 0;
    }
    has(square) {
        return (square >= 32 ? this.hi & (1 << (square - 32)) : this.lo & (1 << square)) !== 0;
    }
    set(square, on) {
        return on ? this.with(square) : this.without(square);
    }
    with(square) {
        return square >= 32
            ? new SquareSet(this.lo, this.hi | (1 << (square - 32)))
            : new SquareSet(this.lo | (1 << square), this.hi);
    }
    without(square) {
        return square >= 32
            ? new SquareSet(this.lo, this.hi & ~(1 << (square - 32)))
            : new SquareSet(this.lo & ~(1 << square), this.hi);
    }
    toggle(square) {
        return square >= 32
            ? new SquareSet(this.lo, this.hi ^ (1 << (square - 32)))
            : new SquareSet(this.lo ^ (1 << square), this.hi);
    }
    last() {
        if (this.hi !== 0)
            return 63 - Math.clz32(this.hi);
        if (this.lo !== 0)
            return 31 - Math.clz32(this.lo);
        return;
    }
    first() {
        if (this.lo !== 0)
            return 31 - Math.clz32(this.lo & -this.lo);
        if (this.hi !== 0)
            return 63 - Math.clz32(this.hi & -this.hi);
        return;
    }
    withoutFirst() {
        if (this.lo !== 0)
            return new SquareSet(this.lo & (this.lo - 1), this.hi);
        return new SquareSet(0, this.hi & (this.hi - 1));
    }
    moreThanOne() {
        return (this.hi !== 0 && this.lo !== 0) || (this.lo & (this.lo - 1)) !== 0 || (this.hi & (this.hi - 1)) !== 0;
    }
    singleSquare() {
        return this.moreThanOne() ? undefined : this.last();
    }
    isSingleSquare() {
        return this.nonEmpty() && !this.moreThanOne();
    }
    *[Symbol.iterator]() {
        let lo = this.lo;
        let hi = this.hi;
        while (lo !== 0) {
            const idx = 31 - Math.clz32(lo & -lo);
            lo ^= 1 << idx;
            yield idx;
        }
        while (hi !== 0) {
            const idx = 31 - Math.clz32(hi & -hi);
            hi ^= 1 << idx;
            yield 32 + idx;
        }
    }
    *reversed() {
        let lo = this.lo;
        let hi = this.hi;
        while (hi !== 0) {
            const idx = 31 - Math.clz32(hi);
            hi ^= 1 << idx;
            yield 32 + idx;
        }
        while (lo !== 0) {
            const idx = 31 - Math.clz32(lo);
            lo ^= 1 << idx;
            yield idx;
        }
    }
}

/**
 * Compute attacks and rays.
 *
 * These are low-level functions that can be used to implement chess rules.
 *
 * Implementation notes: Sliding attacks are computed using
 * [hyperbola quintessence](https://www.chessprogramming.org/Hyperbola_Quintessence).
 * Magic bitboards would deliver faster lookups, but also require
 * initializing considerably larger attack tables. On the web, initialization
 * time is important, so the chosen method may strike a better balance.
 *
 * @packageDocumentation
 */
function computeRange(square, deltas) {
    let range = SquareSet.empty();
    for (const delta of deltas) {
        const sq = square + delta;
        if (0 <= sq && sq < 64 && Math.abs(squareFile(square) - squareFile(sq)) <= 2) {
            range = range.with(sq);
        }
    }
    return range;
}
function tabulate(f) {
    const table = [];
    for (let square = 0; square < 64; square++)
        table[square] = f(square);
    return table;
}
const KING_ATTACKS = tabulate(sq => computeRange(sq, [-9, -8, -7, -1, 1, 7, 8, 9]));
const KNIGHT_ATTACKS = tabulate(sq => computeRange(sq, [-17, -15, -10, -6, 6, 10, 15, 17]));
const PAWN_ATTACKS = {
    white: tabulate(sq => computeRange(sq, [7, 9])),
    black: tabulate(sq => computeRange(sq, [-7, -9])),
};
/**
 * Gets squares attacked or defended by a king on `square`.
 */
function kingAttacks(square) {
    return KING_ATTACKS[square];
}
/**
 * Gets squares attacked or defended by a knight on `square`.
 */
function knightAttacks(square) {
    return KNIGHT_ATTACKS[square];
}
/**
 * Gets squares attacked or defended by a pawn of the given `color`
 * on `square`.
 */
function pawnAttacks(color, square) {
    return PAWN_ATTACKS[color][square];
}
const FILE_RANGE = tabulate(sq => SquareSet.fromFile(squareFile(sq)).without(sq));
const RANK_RANGE = tabulate(sq => SquareSet.fromRank(squareRank(sq)).without(sq));
const DIAG_RANGE = tabulate(sq => {
    const diag = new SquareSet(134480385, 2151686160);
    const shift = 8 * (squareRank(sq) - squareFile(sq));
    return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
});
const ANTI_DIAG_RANGE = tabulate(sq => {
    const diag = new SquareSet(270549120, 16909320);
    const shift = 8 * (squareRank(sq) + squareFile(sq) - 7);
    return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
});
function hyperbola(bit, range, occupied) {
    let forward = occupied.intersect(range);
    let reverse = forward.bswap64(); // Assumes no more than 1 bit per rank
    forward = forward.minus64(bit);
    reverse = reverse.minus64(bit.bswap64());
    return forward.xor(reverse.bswap64()).intersect(range);
}
function fileAttacks(square, occupied) {
    return hyperbola(SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
}
function rankAttacks(square, occupied) {
    const range = RANK_RANGE[square];
    let forward = occupied.intersect(range);
    let reverse = forward.rbit64();
    forward = forward.minus64(SquareSet.fromSquare(square));
    reverse = reverse.minus64(SquareSet.fromSquare(63 - square));
    return forward.xor(reverse.rbit64()).intersect(range);
}
/**
 * Gets squares attacked or defended by a bishop on `square`, given `occupied`
 * squares.
 */
function bishopAttacks(square, occupied) {
    const bit = SquareSet.fromSquare(square);
    return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
}
/**
 * Gets squares attacked or defended by a rook on `square`, given `occupied`
 * squares.
 */
function rookAttacks(square, occupied) {
    return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
}
/**
 * Gets squares attacked or defended by a queen on `square`, given `occupied`
 * squares.
 */
function queenAttacks(square, occupied) {
    return bishopAttacks(square, occupied).xor(rookAttacks(square, occupied));
}
/**
 * Gets squares attacked or defended by a `piece` on `square`, given
 * `occupied` squares.
 */
function attacks(piece, square, occupied) {
    switch (piece.role) {
        case 'pawn':
            return pawnAttacks(piece.color, square);
        case 'knight':
            return knightAttacks(square);
        case 'bishop':
            return bishopAttacks(square, occupied);
        case 'rook':
            return rookAttacks(square, occupied);
        case 'queen':
            return queenAttacks(square, occupied);
        case 'king':
            return kingAttacks(square);
    }
}
/**
 * Gets all squares of the rank, file or diagonal with the two squares
 * `a` and `b`, or an empty set if they are not aligned.
 */
function ray(a, b) {
    const other = SquareSet.fromSquare(b);
    if (RANK_RANGE[a].intersects(other))
        return RANK_RANGE[a].with(a);
    if (ANTI_DIAG_RANGE[a].intersects(other))
        return ANTI_DIAG_RANGE[a].with(a);
    if (DIAG_RANGE[a].intersects(other))
        return DIAG_RANGE[a].with(a);
    if (FILE_RANGE[a].intersects(other))
        return FILE_RANGE[a].with(a);
    return SquareSet.empty();
}
/**
 * Gets all squares between `a` and `b` (bounds not included), or an empty set
 * if they are not on the same rank, file or diagonal.
 */
function between(a, b) {
    return ray(a, b)
        .intersect(SquareSet.full().shl64(a).xor(SquareSet.full().shl64(b)))
        .withoutFirst();
}

/**
 * Piece positions on a board.
 *
 * Properties are sets of squares, like `board.occupied` for all occupied
 * squares, `board[color]` for all pieces of that color, and `board[role]`
 * for all pieces of that role. When modifying the properties directly, take
 * care to keep them consistent.
 */
class Board {
    constructor() { }
    static default() {
        const board = new Board();
        board.reset();
        return board;
    }
    static racingKings() {
        const board = new Board();
        board.occupied = new SquareSet(0xffff, 0);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(0xf0f0, 0);
        board.black = new SquareSet(0x0f0f, 0);
        board.pawn = SquareSet.empty();
        board.knight = new SquareSet(0x1818, 0);
        board.bishop = new SquareSet(0x2424, 0);
        board.rook = new SquareSet(0x4242, 0);
        board.queen = new SquareSet(0x0081, 0);
        board.king = new SquareSet(0x8100, 0);
        return board;
    }
    static horde() {
        const board = new Board();
        board.occupied = new SquareSet(4294967295, 4294901862);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(4294967295, 102);
        board.black = new SquareSet(0, 4294901760);
        board.pawn = new SquareSet(4294967295, 16711782);
        board.knight = new SquareSet(0, 1107296256);
        board.bishop = new SquareSet(0, 603979776);
        board.rook = new SquareSet(0, 2164260864);
        board.queen = new SquareSet(0, 134217728);
        board.king = new SquareSet(0, 268435456);
        return board;
    }
    /**
     * Resets all pieces to the default starting position for standard chess.
     */
    reset() {
        this.occupied = new SquareSet(0xffff, 4294901760);
        this.promoted = SquareSet.empty();
        this.white = new SquareSet(0xffff, 0);
        this.black = new SquareSet(0, 4294901760);
        this.pawn = new SquareSet(0xff00, 16711680);
        this.knight = new SquareSet(0x42, 1107296256);
        this.bishop = new SquareSet(0x24, 603979776);
        this.rook = new SquareSet(0x81, 2164260864);
        this.queen = new SquareSet(0x8, 134217728);
        this.king = new SquareSet(0x10, 268435456);
    }
    static empty() {
        const board = new Board();
        board.clear();
        return board;
    }
    clear() {
        this.occupied = SquareSet.empty();
        this.promoted = SquareSet.empty();
        for (const color of COLORS)
            this[color] = SquareSet.empty();
        for (const role of ROLES)
            this[role] = SquareSet.empty();
    }
    clone() {
        const board = new Board();
        board.occupied = this.occupied;
        board.promoted = this.promoted;
        for (const color of COLORS)
            board[color] = this[color];
        for (const role of ROLES)
            board[role] = this[role];
        return board;
    }
    equalsIgnorePromoted(other) {
        if (!this.white.equals(other.white))
            return false;
        return ROLES.every(role => this[role].equals(other[role]));
    }
    equals(other) {
        return this.equalsIgnorePromoted(other) && this.promoted.equals(other.promoted);
    }
    getColor(square) {
        if (this.white.has(square))
            return 'white';
        if (this.black.has(square))
            return 'black';
        return;
    }
    getRole(square) {
        for (const role of ROLES) {
            if (this[role].has(square))
                return role;
        }
        return;
    }
    get(square) {
        const color = this.getColor(square);
        if (!color)
            return;
        const role = this.getRole(square);
        const promoted = this.promoted.has(square);
        return { color, role, promoted };
    }
    /**
     * Removes and returns the piece from the given `square`, if any.
     */
    take(square) {
        const piece = this.get(square);
        if (piece) {
            this.occupied = this.occupied.without(square);
            this[piece.color] = this[piece.color].without(square);
            this[piece.role] = this[piece.role].without(square);
            if (piece.promoted)
                this.promoted = this.promoted.without(square);
        }
        return piece;
    }
    /**
     * Put `piece` onto `square`, potentially replacing an existing piece.
     * Returns the existing piece, if any.
     */
    set(square, piece) {
        const old = this.take(square);
        this.occupied = this.occupied.with(square);
        this[piece.color] = this[piece.color].with(square);
        this[piece.role] = this[piece.role].with(square);
        if (piece.promoted)
            this.promoted = this.promoted.with(square);
        return old;
    }
    has(square) {
        return this.occupied.has(square);
    }
    *[Symbol.iterator]() {
        for (const square of this.occupied) {
            yield [square, this.get(square)];
        }
    }
    pieces(color, role) {
        return this[color].intersect(this[role]);
    }
    rooksAndQueens() {
        return this.rook.union(this.queen);
    }
    bishopsAndQueens() {
        return this.bishop.union(this.queen);
    }
    /**
     * Finds the unique unpromoted king of the given `color`, if any.
     */
    kingOf(color) {
        return this.king.intersect(this[color]).diff(this.promoted).singleSquare();
    }
}

class MaterialSide {
    constructor() { }
    static empty() {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = 0;
        return m;
    }
    static fromBoard(board, color) {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = board.pieces(color, role).size();
        return m;
    }
    clone() {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = this[role];
        return m;
    }
    equals(other) {
        return ROLES.every(role => this[role] === other[role]);
    }
    add(other) {
        const m = new MaterialSide();
        for (const role of ROLES)
            m[role] = this[role] + other[role];
        return m;
    }
    nonEmpty() {
        return ROLES.some(role => this[role] > 0);
    }
    isEmpty() {
        return !this.nonEmpty();
    }
    hasPawns() {
        return this.pawn > 0;
    }
    hasNonPawns() {
        return this.knight > 0 || this.bishop > 0 || this.rook > 0 || this.queen > 0 || this.king > 0;
    }
    count() {
        return this.pawn + this.knight + this.bishop + this.rook + this.queen + this.king;
    }
}
class Material {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static empty() {
        return new Material(MaterialSide.empty(), MaterialSide.empty());
    }
    static fromBoard(board) {
        return new Material(MaterialSide.fromBoard(board, 'white'), MaterialSide.fromBoard(board, 'black'));
    }
    clone() {
        return new Material(this.white.clone(), this.black.clone());
    }
    equals(other) {
        return this.white.equals(other.white) && this.black.equals(other.black);
    }
    add(other) {
        return new Material(this.white.add(other.white), this.black.add(other.black));
    }
    count() {
        return this.white.count() + this.black.count();
    }
    isEmpty() {
        return this.white.isEmpty() && this.black.isEmpty();
    }
    nonEmpty() {
        return !this.isEmpty();
    }
    hasPawns() {
        return this.white.hasPawns() || this.black.hasPawns();
    }
    hasNonPawns() {
        return this.white.hasNonPawns() || this.black.hasNonPawns();
    }
}
class RemainingChecks {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static default() {
        return new RemainingChecks(3, 3);
    }
    clone() {
        return new RemainingChecks(this.white, this.black);
    }
    equals(other) {
        return this.white === other.white && this.black === other.black;
    }
}
function defaultSetup() {
    return {
        board: Board.default(),
        pockets: undefined,
        turn: 'white',
        unmovedRooks: SquareSet.corners(),
        epSquare: undefined,
        remainingChecks: undefined,
        halfmoves: 0,
        fullmoves: 1,
    };
}

class r{unwrap(r,t){const e=this._chain(t=>n.ok(r?r(t):t),r=>t?n.ok(t(r)):n.err(r));if(e.isErr)throw e.error;return e.value}map(r,t){return this._chain(t=>n.ok(r(t)),r=>n.err(t?t(r):r))}chain(r,t){return this._chain(r,t||(r=>n.err(r)))}}class t extends r{constructor(r){super(),this.value=void 0,this.isOk=true,this.isErr=false,this.value=r;}_chain(r,t){return r(this.value)}}class e extends r{constructor(r){super(),this.error=void 0,this.isOk=false,this.isErr=true,this.error=r;}_chain(r,t){return t(this.error)}}var n;!function(r){r.ok=function(r){return new t(r)},r.err=function(r){return new e(r||new Error)},r.all=function(t){if(Array.isArray(t)){const e=[];for(let r=0;r<t.length;r++){const n=t[r];if(n.isErr)return n;e.push(n.value);}return r.ok(e)}const e={},n=Object.keys(t);for(let r=0;r<n.length;r++){const s=t[n[r]];if(s.isErr)return s;e[n[r]]=s.value;}return r.ok(e)};}(n||(n={}));

var IllegalSetup;
(function (IllegalSetup) {
    IllegalSetup["Empty"] = "ERR_EMPTY";
    IllegalSetup["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
    IllegalSetup["ImpossibleCheck"] = "ERR_IMPOSSIBLE_CHECK";
    IllegalSetup["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
    IllegalSetup["Kings"] = "ERR_KINGS";
    IllegalSetup["Variant"] = "ERR_VARIANT";
})(IllegalSetup || (IllegalSetup = {}));
class PositionError extends Error {
}
function attacksTo(square, attacker, board, occupied) {
    return board[attacker].intersect(rookAttacks(square, occupied)
        .intersect(board.rooksAndQueens())
        .union(bishopAttacks(square, occupied).intersect(board.bishopsAndQueens()))
        .union(knightAttacks(square).intersect(board.knight))
        .union(kingAttacks(square).intersect(board.king))
        .union(pawnAttacks(opposite$1(attacker), square).intersect(board.pawn)));
}
function rookCastlesTo(color, side) {
    return color === 'white' ? (side === 'a' ? 3 : 5) : side === 'a' ? 59 : 61;
}
class Castles {
    constructor() { }
    static default() {
        const castles = new Castles();
        castles.unmovedRooks = SquareSet.corners();
        castles.rook = {
            white: { a: 0, h: 7 },
            black: { a: 56, h: 63 },
        };
        castles.path = {
            white: { a: new SquareSet(0xe, 0), h: new SquareSet(0x60, 0) },
            black: { a: new SquareSet(0, 0x0e000000), h: new SquareSet(0, 0x60000000) },
        };
        return castles;
    }
    static empty() {
        const castles = new Castles();
        castles.unmovedRooks = SquareSet.empty();
        castles.rook = {
            white: { a: undefined, h: undefined },
            black: { a: undefined, h: undefined },
        };
        castles.path = {
            white: { a: SquareSet.empty(), h: SquareSet.empty() },
            black: { a: SquareSet.empty(), h: SquareSet.empty() },
        };
        return castles;
    }
    clone() {
        const castles = new Castles();
        castles.unmovedRooks = this.unmovedRooks;
        castles.rook = {
            white: { a: this.rook.white.a, h: this.rook.white.h },
            black: { a: this.rook.black.a, h: this.rook.black.h },
        };
        castles.path = {
            white: { a: this.path.white.a, h: this.path.white.h },
            black: { a: this.path.black.a, h: this.path.black.h },
        };
        return castles;
    }
    add(color, side, king, rook) {
        const kingTo = kingCastlesTo(color, side);
        const rookTo = rookCastlesTo(color, side);
        this.unmovedRooks = this.unmovedRooks.with(rook);
        this.rook[color][side] = rook;
        this.path[color][side] = between(rook, rookTo)
            .with(rookTo)
            .union(between(king, kingTo).with(kingTo))
            .without(king)
            .without(rook);
    }
    static fromSetup(setup) {
        const castles = Castles.empty();
        const rooks = setup.unmovedRooks.intersect(setup.board.rook);
        for (const color of COLORS) {
            const backrank = SquareSet.backrank(color);
            const king = setup.board.kingOf(color);
            if (!defined(king) || !backrank.has(king))
                continue;
            const side = rooks.intersect(setup.board[color]).intersect(backrank);
            const aSide = side.first();
            if (defined(aSide) && aSide < king)
                castles.add(color, 'a', king, aSide);
            const hSide = side.last();
            if (defined(hSide) && king < hSide)
                castles.add(color, 'h', king, hSide);
        }
        return castles;
    }
    discardRook(square) {
        if (this.unmovedRooks.has(square)) {
            this.unmovedRooks = this.unmovedRooks.without(square);
            for (const color of COLORS) {
                for (const side of CASTLING_SIDES) {
                    if (this.rook[color][side] === square)
                        this.rook[color][side] = undefined;
                }
            }
        }
    }
    discardSide(color) {
        this.unmovedRooks = this.unmovedRooks.diff(SquareSet.backrank(color));
        this.rook[color].a = undefined;
        this.rook[color].h = undefined;
    }
}
class Position {
    constructor(rules) {
        this.rules = rules;
    }
    kingAttackers(square, attacker, occupied) {
        return attacksTo(square, attacker, this.board, occupied);
    }
    dropDests(_ctx) {
        return SquareSet.empty();
    }
    playCaptureAt(square, captured) {
        this.halfmoves = 0;
        if (captured.role === 'rook')
            this.castles.discardRook(square);
        if (this.pockets)
            this.pockets[opposite$1(captured.color)][captured.role]++;
    }
    ctx() {
        const variantEnd = this.isVariantEnd();
        const king = this.board.kingOf(this.turn);
        if (!defined(king))
            return { king, blockers: SquareSet.empty(), checkers: SquareSet.empty(), variantEnd, mustCapture: false };
        const snipers = rookAttacks(king, SquareSet.empty())
            .intersect(this.board.rooksAndQueens())
            .union(bishopAttacks(king, SquareSet.empty()).intersect(this.board.bishopsAndQueens()))
            .intersect(this.board[opposite$1(this.turn)]);
        let blockers = SquareSet.empty();
        for (const sniper of snipers) {
            const b = between(king, sniper).intersect(this.board.occupied);
            if (!b.moreThanOne())
                blockers = blockers.union(b);
        }
        const checkers = this.kingAttackers(king, opposite$1(this.turn), this.board.occupied);
        return {
            king,
            blockers,
            checkers,
            variantEnd,
            mustCapture: false,
        };
    }
    // The following should be identical in all subclasses
    clone() {
        var _a, _b;
        const pos = new this.constructor();
        pos.board = this.board.clone();
        pos.pockets = (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone();
        pos.turn = this.turn;
        pos.castles = this.castles.clone();
        pos.epSquare = this.epSquare;
        pos.remainingChecks = (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone();
        pos.halfmoves = this.halfmoves;
        pos.fullmoves = this.fullmoves;
        return pos;
    }
    equalsIgnoreMoves(other) {
        var _a, _b;
        return (this.rules === other.rules &&
            (this.pockets ? this.board.equals(other.board) : this.board.equalsIgnorePromoted(other.board)) &&
            ((other.pockets && ((_a = this.pockets) === null || _a === void 0 ? void 0 : _a.equals(other.pockets))) || (!this.pockets && !other.pockets)) &&
            this.turn === other.turn &&
            this.castles.unmovedRooks.equals(other.castles.unmovedRooks) &&
            this.legalEpSquare() === other.legalEpSquare() &&
            ((other.remainingChecks && ((_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.equals(other.remainingChecks))) ||
                (!this.remainingChecks && !other.remainingChecks)));
    }
    toSetup() {
        var _a, _b;
        return {
            board: this.board.clone(),
            pockets: (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
            turn: this.turn,
            unmovedRooks: this.castles.unmovedRooks,
            epSquare: this.legalEpSquare(),
            remainingChecks: (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
            halfmoves: Math.min(this.halfmoves, 150),
            fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999),
        };
    }
    isInsufficientMaterial() {
        return COLORS.every(color => this.hasInsufficientMaterial(color));
    }
    hasDests(ctx) {
        ctx = ctx || this.ctx();
        for (const square of this.board[this.turn]) {
            if (this.dests(square, ctx).nonEmpty())
                return true;
        }
        return this.dropDests(ctx).nonEmpty();
    }
    isLegal(move, ctx) {
        if (isDrop(move)) {
            if (!this.pockets || this.pockets[this.turn][move.role] <= 0)
                return false;
            if (move.role === 'pawn' && SquareSet.backranks().has(move.to))
                return false;
            return this.dropDests(ctx).has(move.to);
        }
        else {
            if (move.promotion === 'pawn')
                return false;
            if (move.promotion === 'king' && this.rules !== 'antichess')
                return false;
            if (!!move.promotion !== (this.board.pawn.has(move.from) && SquareSet.backranks().has(move.to)))
                return false;
            const dests = this.dests(move.from, ctx);
            return dests.has(move.to) || dests.has(this.normalizeMove(move).to);
        }
    }
    isCheck() {
        const king = this.board.kingOf(this.turn);
        return defined(king) && this.kingAttackers(king, opposite$1(this.turn), this.board.occupied).nonEmpty();
    }
    isEnd(ctx) {
        if (ctx ? ctx.variantEnd : this.isVariantEnd())
            return true;
        return this.isInsufficientMaterial() || !this.hasDests(ctx);
    }
    isCheckmate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx);
    }
    isStalemate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
    }
    outcome(ctx) {
        const variantOutcome = this.variantOutcome(ctx);
        if (variantOutcome)
            return variantOutcome;
        ctx = ctx || this.ctx();
        if (this.isCheckmate(ctx))
            return { winner: opposite$1(this.turn) };
        else if (this.isInsufficientMaterial() || this.isStalemate(ctx))
            return { winner: undefined };
        else
            return;
    }
    allDests(ctx) {
        ctx = ctx || this.ctx();
        const d = new Map();
        if (ctx.variantEnd)
            return d;
        for (const square of this.board[this.turn]) {
            d.set(square, this.dests(square, ctx));
        }
        return d;
    }
    castlingSide(move) {
        if (isDrop(move))
            return;
        const delta = move.to - move.from;
        if (Math.abs(delta) !== 2 && !this.board[this.turn].has(move.to))
            return;
        if (!this.board.king.has(move.from))
            return;
        return delta > 0 ? 'h' : 'a';
    }
    normalizeMove(move) {
        const castlingSide = this.castlingSide(move);
        if (!castlingSide)
            return move;
        const rookFrom = this.castles.rook[this.turn][castlingSide];
        return {
            from: move.from,
            to: defined(rookFrom) ? rookFrom : move.to,
        };
    }
    play(move) {
        const turn = this.turn;
        const epSquare = this.epSquare;
        const castlingSide = this.castlingSide(move);
        this.epSquare = undefined;
        this.halfmoves += 1;
        if (turn === 'black')
            this.fullmoves += 1;
        this.turn = opposite$1(turn);
        if (isDrop(move)) {
            this.board.set(move.to, { role: move.role, color: turn });
            if (this.pockets)
                this.pockets[turn][move.role]--;
            if (move.role === 'pawn')
                this.halfmoves = 0;
        }
        else {
            const piece = this.board.take(move.from);
            if (!piece)
                return;
            let epCapture;
            if (piece.role === 'pawn') {
                this.halfmoves = 0;
                if (move.to === epSquare) {
                    epCapture = this.board.take(move.to + (turn === 'white' ? -8 : 8));
                }
                const delta = move.from - move.to;
                if (Math.abs(delta) === 16 && 8 <= move.from && move.from <= 55) {
                    this.epSquare = (move.from + move.to) >> 1;
                }
                if (move.promotion) {
                    piece.role = move.promotion;
                    piece.promoted = true;
                }
            }
            else if (piece.role === 'rook') {
                this.castles.discardRook(move.from);
            }
            else if (piece.role === 'king') {
                if (castlingSide) {
                    const rookFrom = this.castles.rook[turn][castlingSide];
                    if (defined(rookFrom)) {
                        const rook = this.board.take(rookFrom);
                        this.board.set(kingCastlesTo(turn, castlingSide), piece);
                        if (rook)
                            this.board.set(rookCastlesTo(turn, castlingSide), rook);
                    }
                }
                this.castles.discardSide(turn);
            }
            if (!castlingSide) {
                const capture = this.board.set(move.to, piece) || epCapture;
                if (capture)
                    this.playCaptureAt(move.to, capture);
            }
        }
        if (this.remainingChecks) {
            if (this.isCheck())
                this.remainingChecks[turn] = Math.max(this.remainingChecks[turn] - 1, 0);
        }
    }
    legalEpSquare(ctx) {
        if (!defined(this.epSquare))
            return;
        ctx = ctx || this.ctx();
        const ourPawns = this.board.pieces(this.turn, 'pawn');
        const candidates = ourPawns.intersect(pawnAttacks(opposite$1(this.turn), this.epSquare));
        for (const candidate of candidates) {
            if (this.dests(candidate, ctx).has(this.epSquare))
                return this.epSquare;
        }
        return;
    }
}
class Chess extends Position {
    constructor(rules) {
        super(rules || 'chess');
    }
    static default() {
        const pos = new this();
        pos.board = Board.default();
        pos.pockets = undefined;
        pos.turn = 'white';
        pos.castles = Castles.default();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
    }
    static fromSetup(setup, opts) {
        const pos = new this();
        pos.board = setup.board.clone();
        pos.pockets = undefined;
        pos.turn = setup.turn;
        pos.castles = Castles.fromSetup(setup);
        pos.epSquare = pos.validEpSquare(setup.epSquare);
        pos.remainingChecks = undefined;
        pos.halfmoves = setup.halfmoves;
        pos.fullmoves = setup.fullmoves;
        return pos.validate(opts).map(_ => pos);
    }
    clone() {
        return super.clone();
    }
    validate(opts) {
        if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
        if (this.board.king.size() !== 2)
            return n.err(new PositionError(IllegalSetup.Kings));
        if (!defined(this.board.kingOf(this.turn)))
            return n.err(new PositionError(IllegalSetup.Kings));
        const otherKing = this.board.kingOf(opposite$1(this.turn));
        if (!defined(otherKing))
            return n.err(new PositionError(IllegalSetup.Kings));
        if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty())
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
        if (SquareSet.backranks().intersects(this.board.pawn))
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
        return (opts === null || opts === void 0 ? void 0 : opts.ignoreImpossibleCheck) ? n.ok(undefined) : this.validateCheckers();
    }
    validateCheckers() {
        const ourKing = this.board.kingOf(this.turn);
        if (defined(ourKing)) {
            const checkers = this.kingAttackers(ourKing, opposite$1(this.turn), this.board.occupied);
            if (checkers.nonEmpty()) {
                if (defined(this.epSquare)) {
                    // The pushed pawn must be the only checker, or it has uncovered
                    // check by a single sliding piece.
                    const pushedTo = this.epSquare ^ 8;
                    const pushedFrom = this.epSquare ^ 24;
                    if (checkers.moreThanOne() ||
                        (checkers.first() != pushedTo &&
                            this.kingAttackers(ourKing, opposite$1(this.turn), this.board.occupied.without(pushedTo).with(pushedFrom)).nonEmpty()))
                        return n.err(new PositionError(IllegalSetup.ImpossibleCheck));
                }
                else {
                    // Multiple sliding checkers aligned with king.
                    if (checkers.size() > 2 || (checkers.size() === 2 && ray(checkers.first(), checkers.last()).has(ourKing)))
                        return n.err(new PositionError(IllegalSetup.ImpossibleCheck));
                }
            }
        }
        return n.ok(undefined);
    }
    validEpSquare(square) {
        if (!defined(square))
            return;
        const epRank = this.turn === 'white' ? 5 : 2;
        const forward = this.turn === 'white' ? 8 : -8;
        if (squareRank(square) !== epRank)
            return;
        if (this.board.occupied.has(square + forward))
            return;
        const pawn = square - forward;
        if (!this.board.pawn.has(pawn) || !this.board[opposite$1(this.turn)].has(pawn))
            return;
        return square;
    }
    castlingDest(side, ctx) {
        if (!defined(ctx.king) || ctx.checkers.nonEmpty())
            return SquareSet.empty();
        const rook = this.castles.rook[this.turn][side];
        if (!defined(rook))
            return SquareSet.empty();
        if (this.castles.path[this.turn][side].intersects(this.board.occupied))
            return SquareSet.empty();
        const kingTo = kingCastlesTo(this.turn, side);
        const kingPath = between(ctx.king, kingTo);
        const occ = this.board.occupied.without(ctx.king);
        for (const sq of kingPath) {
            if (this.kingAttackers(sq, opposite$1(this.turn), occ).nonEmpty())
                return SquareSet.empty();
        }
        const rookTo = rookCastlesTo(this.turn, side);
        const after = this.board.occupied.toggle(ctx.king).toggle(rook).toggle(rookTo);
        if (this.kingAttackers(kingTo, opposite$1(this.turn), after).nonEmpty())
            return SquareSet.empty();
        return SquareSet.fromSquare(rook);
    }
    canCaptureEp(pawn, ctx) {
        if (!defined(this.epSquare))
            return false;
        if (!pawnAttacks(this.turn, pawn).has(this.epSquare))
            return false;
        if (!defined(ctx.king))
            return true;
        const captured = this.epSquare + (this.turn === 'white' ? -8 : 8);
        const occupied = this.board.occupied.toggle(pawn).toggle(this.epSquare).toggle(captured);
        return !this.kingAttackers(ctx.king, opposite$1(this.turn), occupied).intersects(occupied);
    }
    pseudoDests(square, ctx) {
        if (ctx.variantEnd)
            return SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return SquareSet.empty();
        let pseudo = attacks(piece, square, this.board.occupied);
        if (piece.role === 'pawn') {
            let captureTargets = this.board[opposite$1(this.turn)];
            if (defined(this.epSquare))
                captureTargets = captureTargets.with(this.epSquare);
            pseudo = pseudo.intersect(captureTargets);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? square < 16 : square >= 64 - 16;
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            return pseudo;
        }
        else {
            pseudo = pseudo.diff(this.board[this.turn]);
        }
        if (square === ctx.king)
            return pseudo.union(this.castlingDest('a', ctx)).union(this.castlingDest('h', ctx));
        else
            return pseudo;
    }
    dests(square, ctx) {
        ctx = ctx || this.ctx();
        if (ctx.variantEnd)
            return SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return SquareSet.empty();
        let pseudo, legal;
        if (piece.role === 'pawn') {
            pseudo = pawnAttacks(this.turn, square).intersect(this.board[opposite$1(this.turn)]);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? square < 16 : square >= 64 - 16;
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            if (defined(this.epSquare) && this.canCaptureEp(square, ctx)) {
                const pawn = this.epSquare - delta;
                if (ctx.checkers.isEmpty() || ctx.checkers.singleSquare() === pawn) {
                    legal = SquareSet.fromSquare(this.epSquare);
                }
            }
        }
        else if (piece.role === 'bishop')
            pseudo = bishopAttacks(square, this.board.occupied);
        else if (piece.role === 'knight')
            pseudo = knightAttacks(square);
        else if (piece.role === 'rook')
            pseudo = rookAttacks(square, this.board.occupied);
        else if (piece.role === 'queen')
            pseudo = queenAttacks(square, this.board.occupied);
        else
            pseudo = kingAttacks(square);
        pseudo = pseudo.diff(this.board[this.turn]);
        if (defined(ctx.king)) {
            if (piece.role === 'king') {
                const occ = this.board.occupied.without(square);
                for (const to of pseudo) {
                    if (this.kingAttackers(to, opposite$1(this.turn), occ).nonEmpty())
                        pseudo = pseudo.without(to);
                }
                return pseudo.union(this.castlingDest('a', ctx)).union(this.castlingDest('h', ctx));
            }
            if (ctx.checkers.nonEmpty()) {
                const checker = ctx.checkers.singleSquare();
                if (!defined(checker))
                    return SquareSet.empty();
                pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
            }
            if (ctx.blockers.has(square))
                pseudo = pseudo.intersect(ray(square, ctx.king));
        }
        if (legal)
            pseudo = pseudo.union(legal);
        return pseudo;
    }
    isVariantEnd() {
        return false;
    }
    variantOutcome(_ctx) {
        return;
    }
    hasInsufficientMaterial(color) {
        if (this.board[color].intersect(this.board.pawn.union(this.board.rooksAndQueens())).nonEmpty())
            return false;
        if (this.board[color].intersects(this.board.knight)) {
            return (this.board[color].size() <= 2 &&
                this.board[opposite$1(color)].diff(this.board.king).diff(this.board.queen).isEmpty());
        }
        if (this.board[color].intersects(this.board.bishop)) {
            const sameColor = !this.board.bishop.intersects(SquareSet.darkSquares()) ||
                !this.board.bishop.intersects(SquareSet.lightSquares());
            return sameColor && this.board.pawn.isEmpty() && this.board.knight.isEmpty();
        }
        return true;
    }
}

function chessgroundDests(pos, opts) {
    const result = new Map();
    const ctx = pos.ctx();
    for (const [from, squares] of pos.allDests(ctx)) {
        if (squares.nonEmpty()) {
            const d = Array.from(squares, makeSquare);
            if (from === ctx.king && squareFile(from) === 4) {
                // Chessground needs both types of castling dests and filters based on
                // a rookCastles setting.
                if (squares.has(0))
                    d.push('c1');
                else if (squares.has(56))
                    d.push('c8');
                if (squares.has(7))
                    d.push('g1');
                else if (squares.has(63))
                    d.push('g8');
            }
            result.set(makeSquare(from), d);
        }
    }
    return result;
}

var InvalidFen;
(function (InvalidFen) {
    InvalidFen["Fen"] = "ERR_FEN";
    InvalidFen["Board"] = "ERR_BOARD";
    InvalidFen["Pockets"] = "ERR_POCKETS";
    InvalidFen["Turn"] = "ERR_TURN";
    InvalidFen["Castling"] = "ERR_CASTLING";
    InvalidFen["EpSquare"] = "ERR_EP_SQUARE";
    InvalidFen["RemainingChecks"] = "ERR_REMAINING_CHECKS";
    InvalidFen["Halfmoves"] = "ERR_HALFMOVES";
    InvalidFen["Fullmoves"] = "ERR_FULLMOVES";
})(InvalidFen || (InvalidFen = {}));
class FenError extends Error {
}
function nthIndexOf(haystack, needle, n) {
    let index = haystack.indexOf(needle);
    while (n-- > 0) {
        if (index === -1)
            break;
        index = haystack.indexOf(needle, index + needle.length);
    }
    return index;
}
function parseSmallUint(str) {
    return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}
function charToPiece(ch) {
    const role = charToRole(ch);
    return role && { role, color: ch.toLowerCase() === ch ? 'black' : 'white' };
}
function parseBoardFen(boardPart) {
    const board = Board.empty();
    let rank = 7;
    let file = 0;
    for (let i = 0; i < boardPart.length; i++) {
        const c = boardPart[i];
        if (c === '/' && file === 8) {
            file = 0;
            rank--;
        }
        else {
            const step = parseInt(c, 10);
            if (step > 0)
                file += step;
            else {
                if (file >= 8 || rank < 0)
                    return n.err(new FenError(InvalidFen.Board));
                const square = file + rank * 8;
                const piece = charToPiece(c);
                if (!piece)
                    return n.err(new FenError(InvalidFen.Board));
                if (boardPart[i + 1] === '~') {
                    piece.promoted = true;
                    i++;
                }
                board.set(square, piece);
                file++;
            }
        }
    }
    if (rank !== 0 || file !== 8)
        return n.err(new FenError(InvalidFen.Board));
    return n.ok(board);
}
function parsePockets(pocketPart) {
    if (pocketPart.length > 64)
        return n.err(new FenError(InvalidFen.Pockets));
    const pockets = Material.empty();
    for (const c of pocketPart) {
        const piece = charToPiece(c);
        if (!piece)
            return n.err(new FenError(InvalidFen.Pockets));
        pockets[piece.color][piece.role]++;
    }
    return n.ok(pockets);
}
function parseCastlingFen(board, castlingPart) {
    let unmovedRooks = SquareSet.empty();
    if (castlingPart === '-')
        return n.ok(unmovedRooks);
    for (const c of castlingPart) {
        const lower = c.toLowerCase();
        const color = c === lower ? 'black' : 'white';
        const backrank = SquareSet.backrank(color).intersect(board[color]);
        let candidates;
        if (lower === 'q')
            candidates = backrank;
        else if (lower === 'k')
            candidates = backrank.reversed();
        else if ('a' <= lower && lower <= 'h')
            candidates = SquareSet.fromSquare(lower.charCodeAt(0) - 'a'.charCodeAt(0)).intersect(backrank);
        else
            return n.err(new FenError(InvalidFen.Castling));
        for (const square of candidates) {
            if (board.king.has(square) && !board.promoted.has(square))
                break;
            if (board.rook.has(square)) {
                unmovedRooks = unmovedRooks.with(square);
                break;
            }
        }
    }
    if (COLORS.some(color => SquareSet.backrank(color).intersect(unmovedRooks).size() > 2))
        return n.err(new FenError(InvalidFen.Castling));
    return n.ok(unmovedRooks);
}
function parseRemainingChecks(part) {
    const parts = part.split('+');
    if (parts.length === 3 && parts[0] === '') {
        const white = parseSmallUint(parts[1]);
        const black = parseSmallUint(parts[2]);
        if (!defined(white) || white > 3 || !defined(black) || black > 3)
            return n.err(new FenError(InvalidFen.RemainingChecks));
        return n.ok(new RemainingChecks(3 - white, 3 - black));
    }
    else if (parts.length === 2) {
        const white = parseSmallUint(parts[0]);
        const black = parseSmallUint(parts[1]);
        if (!defined(white) || white > 3 || !defined(black) || black > 3)
            return n.err(new FenError(InvalidFen.RemainingChecks));
        return n.ok(new RemainingChecks(white, black));
    }
    else
        return n.err(new FenError(InvalidFen.RemainingChecks));
}
function parseFen(fen) {
    const parts = fen.split(/[\s_]+/);
    const boardPart = parts.shift();
    // Board and pockets
    let board, pockets = n.ok(undefined);
    if (boardPart.endsWith(']')) {
        const pocketStart = boardPart.indexOf('[');
        if (pocketStart === -1)
            return n.err(new FenError(InvalidFen.Fen));
        board = parseBoardFen(boardPart.substr(0, pocketStart));
        pockets = parsePockets(boardPart.substr(pocketStart + 1, boardPart.length - 1 - pocketStart - 1));
    }
    else {
        const pocketStart = nthIndexOf(boardPart, '/', 7);
        if (pocketStart === -1)
            board = parseBoardFen(boardPart);
        else {
            board = parseBoardFen(boardPart.substr(0, pocketStart));
            pockets = parsePockets(boardPart.substr(pocketStart + 1));
        }
    }
    // Turn
    let turn;
    const turnPart = parts.shift();
    if (!defined(turnPart) || turnPart === 'w')
        turn = 'white';
    else if (turnPart === 'b')
        turn = 'black';
    else
        return n.err(new FenError(InvalidFen.Turn));
    return board.chain(board => {
        // Castling
        const castlingPart = parts.shift();
        const unmovedRooks = defined(castlingPart) ? parseCastlingFen(board, castlingPart) : n.ok(SquareSet.empty());
        // En passant square
        const epPart = parts.shift();
        let epSquare;
        if (defined(epPart) && epPart !== '-') {
            epSquare = parseSquare(epPart);
            if (!defined(epSquare))
                return n.err(new FenError(InvalidFen.EpSquare));
        }
        // Halfmoves or remaining checks
        let halfmovePart = parts.shift();
        let earlyRemainingChecks;
        if (defined(halfmovePart) && halfmovePart.includes('+')) {
            earlyRemainingChecks = parseRemainingChecks(halfmovePart);
            halfmovePart = parts.shift();
        }
        const halfmoves = defined(halfmovePart) ? parseSmallUint(halfmovePart) : 0;
        if (!defined(halfmoves))
            return n.err(new FenError(InvalidFen.Halfmoves));
        const fullmovesPart = parts.shift();
        const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
        if (!defined(fullmoves))
            return n.err(new FenError(InvalidFen.Fullmoves));
        const remainingChecksPart = parts.shift();
        let remainingChecks = n.ok(undefined);
        if (defined(remainingChecksPart)) {
            if (defined(earlyRemainingChecks))
                return n.err(new FenError(InvalidFen.RemainingChecks));
            remainingChecks = parseRemainingChecks(remainingChecksPart);
        }
        else if (defined(earlyRemainingChecks)) {
            remainingChecks = earlyRemainingChecks;
        }
        if (parts.length > 0)
            return n.err(new FenError(InvalidFen.Fen));
        return pockets.chain(pockets => unmovedRooks.chain(unmovedRooks => remainingChecks.map(remainingChecks => {
            return {
                board,
                pockets,
                turn,
                unmovedRooks,
                remainingChecks,
                epSquare,
                halfmoves,
                fullmoves: Math.max(1, fullmoves),
            };
        })));
    });
}
function makePiece$1(piece, opts) {
    let r = roleToChar(piece.role);
    if (piece.color === 'white')
        r = r.toUpperCase();
    return r;
}
function makeBoardFen(board, opts) {
    let fen = '';
    let empty = 0;
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = file + rank * 8;
            const piece = board.get(square);
            if (!piece)
                empty++;
            else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                fen += makePiece$1(piece);
            }
            if (file === 7) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                if (rank !== 0)
                    fen += '/';
            }
        }
    }
    return fen;
}
function makePocket(material) {
    return ROLES.map(role => roleToChar(role).repeat(material[role])).join('');
}
function makePockets(pocket) {
    return makePocket(pocket.white).toUpperCase() + makePocket(pocket.black);
}
function makeCastlingFen(board, unmovedRooks, opts) {
    let fen = '';
    for (const color of COLORS) {
        const backrank = SquareSet.backrank(color);
        const king = board.kingOf(color);
        if (!defined(king) || !backrank.has(king))
            continue;
        const candidates = board.pieces(color, 'rook').intersect(backrank);
        for (const rook of unmovedRooks.intersect(candidates).reversed()) {
            if (rook === candidates.first() && rook < king) {
                fen += color === 'white' ? 'Q' : 'q';
            }
            else if (rook === candidates.last() && king < rook) {
                fen += color === 'white' ? 'K' : 'k';
            }
            else {
                const file = FILE_NAMES[squareFile(rook)];
                fen += color === 'white' ? file.toUpperCase() : file;
            }
        }
    }
    return fen || '-';
}
function makeRemainingChecks(checks) {
    return `${checks.white}+${checks.black}`;
}
function makeFen(setup, opts) {
    return [
        makeBoardFen(setup.board) + (setup.pockets ? `[${makePockets(setup.pockets)}]` : ''),
        setup.turn[0],
        makeCastlingFen(setup.board, setup.unmovedRooks),
        defined(setup.epSquare) ? makeSquare(setup.epSquare) : '-',
        ...(setup.remainingChecks ? [makeRemainingChecks(setup.remainingChecks)] : []),
        ...([Math.max(0, Math.min(setup.halfmoves, 9999)), Math.max(1, Math.min(setup.fullmoves, 9999))]),
    ].join(' ');
}

function parseSan(pos, san) {
    const ctx = pos.ctx();
    // Castling
    let castlingSide;
    if (san === 'O-O' || san === 'O-O+' || san === 'O-O#')
        castlingSide = 'h';
    else if (san === 'O-O-O' || san === 'O-O-O+' || san === 'O-O-O#')
        castlingSide = 'a';
    if (castlingSide) {
        const rook = pos.castles.rook[pos.turn][castlingSide];
        if (!defined(ctx.king) || !defined(rook) || !pos.dests(ctx.king, ctx).has(rook))
            return;
        return {
            from: ctx.king,
            to: rook,
        };
    }
    // Normal move
    const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/);
    if (!match) {
        // Drop
        const match = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[+#]?$/);
        if (!match)
            return;
        const move = {
            role: charToRole(match[1]) || 'pawn',
            to: parseSquare(match[2]),
        };
        return pos.isLegal(move, ctx) ? move : undefined;
    }
    const role = charToRole(match[1]) || 'pawn';
    const to = parseSquare(match[4]);
    const promotion = charToRole(match[5]);
    if (!!promotion !== (role === 'pawn' && SquareSet.backranks().has(to)))
        return;
    if (promotion === 'king' && pos.rules !== 'antichess')
        return;
    let candidates = pos.board.pieces(pos.turn, role);
    if (match[2])
        candidates = candidates.intersect(SquareSet.fromFile(match[2].charCodeAt(0) - 'a'.charCodeAt(0)));
    if (match[3])
        candidates = candidates.intersect(SquareSet.fromRank(match[3].charCodeAt(0) - '1'.charCodeAt(0)));
    // Optimization: Reduce set of candidates
    const pawnAdvance = role === 'pawn' ? SquareSet.fromFile(squareFile(to)) : SquareSet.empty();
    candidates = candidates.intersect(pawnAdvance.union(attacks({ color: opposite$1(pos.turn), role }, to, pos.board.occupied)));
    // Check uniqueness and legality
    let from;
    for (const candidate of candidates) {
        if (pos.dests(candidate, ctx).has(to)) {
            if (defined(from))
                return; // Ambiguous
            from = candidate;
        }
    }
    if (!defined(from))
        return; // Illegal
    return {
        from,
        to,
        promotion,
    };
}

class GameCtrl {
    constructor(game, stream, root) {
        var _b;
        this.stream = stream;
        this.root = root;
        this.chess = Chess.default();
        this.lastUpdateAt = Date.now();
        this.onUnmount = () => {
            this.stream.close();
            clearInterval(this.redrawInterval);
        };
        this.onUpdate = () => {
            var _b, _c;
            const setup = this.game.initialFen == 'startpos' ? defaultSetup() : parseFen(this.game.initialFen).unwrap();
            this.chess = Chess.fromSetup(setup).unwrap();
            const moves = this.game.state.moves.split(' ').filter((m) => m);
            moves.forEach((uci) => this.chess.play(parseUci(uci)));
            const lastMove = moves[moves.length - 1];
            this.lastMove = lastMove && [lastMove.substr(0, 2), lastMove.substr(2, 2)];
            this.lastUpdateAt = Date.now();
            (_b = this.ground) === null || _b === void 0 ? void 0 : _b.set(this.chessgroundConfig());
            if (this.chess.turn == this.pov)
                (_c = this.ground) === null || _c === void 0 ? void 0 : _c.playPremove();
        };
        this.timeOf = (color) => this.game.state[`${color[0]}time`];
        this.userMove = async (orig, dest) => {
            var _b;
            (_b = this.ground) === null || _b === void 0 ? void 0 : _b.set({ turnColor: opposite$1(this.pov) });
            await this.root.auth.fetchBody(`/api/board/game/${this.game.id}/move/${orig}${dest}`, {
                method: 'post',
            });
        };
        this.resign = async () => {
            await this.root.auth.fetchBody(`/api/board/game/${this.game.id}/resign`, { method: 'post' });
        };
        this.playing = () => this.game.state.status == 'started';
        this.chessgroundConfig = () => ({
            real3D: {
                sceneAssetUrl: 'scene.glb',
            },
            orientation: this.pov,
            fen: makeFen(this.chess.toSetup()),
            lastMove: this.lastMove,
            turnColor: this.chess.turn,
            check: !!this.chess.isCheck(),
            movable: {
                free: false,
                color: this.playing() ? this.pov : undefined,
                dests: chessgroundDests(this.chess),
            },
            events: {
                move: this.userMove,
            },
        });
        this.setGround = (cg) => (this.ground = cg);
        this.handle = (msg) => {
            switch (msg.type) {
                case 'gameFull':
                    this.game = msg;
                    this.onUpdate();
                    this.root.redraw();
                    break;
                case 'gameState':
                    this.game.state = msg;
                    this.onUpdate();
                    this.root.redraw();
                    break;
                default:
                    console.error(`Unknown message type: ${msg.type}`, msg);
            }
        };
        this.game = game;
        this.pov = this.game.black.id == ((_b = this.root.auth.me) === null || _b === void 0 ? void 0 : _b.id) ? 'black' : 'white';
        this.onUpdate();
        this.redrawInterval = setInterval(root.redraw, 100);
    }
}
GameCtrl.open = (root, id) => new Promise(async (resolve) => {
    let ctrl;
    let stream;
    const handler = (msg) => {
        if (ctrl)
            ctrl.handle(msg);
        else {
            // Gets the gameFull object from the first message of the stream,
            // make a GameCtrl from it, then forward the next messages to the ctrl
            ctrl = new GameCtrl(msg, stream, root);
            resolve(ctrl);
        }
    };
    stream = await root.auth.openStream(`/api/board/game/stream/${id}`, {}, handler);
});

class OngoingGames {
    constructor() {
        this.games = [];
        this.autoStart = new Set();
        this.onStart = (game) => {
            this.remove(game);
            if (game.compat.board) {
                this.games.push(game);
                if (!this.autoStart.has(game.id)) {
                    if (!game.hasMoved)
                        page_js(`/game/${game.gameId}`);
                }
                this.autoStart.add(game.id);
            }
            else
                console.log(`Skipping game ${game.gameId}, not board compatible`);
        };
        this.onFinish = (game) => this.remove(game);
        this.empty = () => {
            this.games = [];
        };
        this.remove = (game) => {
            this.games = this.games.filter(g => g.gameId != game.id);
        };
    }
}

class PuzzleCtrl {
    constructor(root) {
        this.root = root;
        this.chess = Chess.default();
        this.puzzleId = '';
        this.canMove = false;
        this.solutionIndex = 0;
        this.onUpdate = () => {
            var _a;
            (_a = this.ground) === null || _a === void 0 ? void 0 : _a.set(this.chessgroundConfig());
        };
        this.chessgroundConfig = () => ({
            real3D: {
                sceneAssetUrl: 'scene.glb',
            },
            orientation: this.puzzle ? this.puzzle.pov : 'white',
            fen: makeFen(this.chess.toSetup()),
            lastMove: this.lastMove,
            turnColor: this.chess.turn,
            check: !!this.chess.isCheck(),
            viewOnly: !this.canMove,
            movable: {
                free: false,
                color: this.canMove ? this.chess.turn : undefined,
                dests: chessgroundDests(this.chess),
            },
            events: {
                move: this.userMove,
            },
        });
        this.userMove = async (orig, dest) => {
            var _a;
            console.log(`User move: ${orig} -> ${dest}`);
            console.log('Solution:', (_a = this.puzzle) === null || _a === void 0 ? void 0 : _a.solution);
            const beforeMoveFen = makeFen(this.chess.toSetup());
            const beforeMoveLastMove = this.lastMove;
            const move = parseUci(`${orig}${dest}`);
            if (!move)
                return;
            this.chess.play(move);
            this.lastMove = [orig, dest];
            this.canMove = false;
            this.onUpdate();
            // Compare move to solution after 200ms
            setTimeout(() => {
                if (!this.puzzle)
                    return;
                const userMoveUci = `${orig}${dest}`;
                const expectedMove = this.puzzle.solution[this.solutionIndex];
                if (userMoveUci === expectedMove) {
                    console.log('Correct move!');
                    if (this.solutionIndex + 2 < this.puzzle.solution.length) {
                        const opponentMove = this.puzzle.solution[this.solutionIndex + 1];
                        const opponentMoveParsed = parseUci(opponentMove);
                        if (opponentMoveParsed) {
                            this.chess.play(opponentMoveParsed);
                            this.lastMove = [opponentMove.slice(0, 2), opponentMove.slice(2, 4)];
                        }
                        this.solutionIndex += 2;
                        this.canMove = true;
                        setTimeout(() => {
                            this.onUpdate();
                        }, 200);
                    }
                    else {
                        this.markAsSolved(true);
                        alert('Puzzle solved!');
                    }
                }
                else {
                    console.log(`Incorrect move. Expected: ${expectedMove}, but got: ${userMoveUci}`);
                    const restoredSetup = parseFen(beforeMoveFen).unwrap();
                    this.chess = Chess.fromSetup(restoredSetup).unwrap();
                    this.lastMove = beforeMoveLastMove;
                    this.canMove = true;
                    this.onUpdate();
                }
            }, 200);
        };
        this.pgnMoves = (pgn) => pgn
            .replace(/\{[^}]*\}|\([^)]*\)|\$\d+/g, ' ')
            .split(/\s+/)
            .filter(token => token && !/^\d+\.(\.\.)?$/.test(token) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));
        this.lastMoveFromPgn = (pgn, initialPly) => {
            const chess = Chess.default();
            const moves = this.pgnMoves(pgn);
            const firstMoveOfPuzzle = Math.max(0, initialPly + 1);
            let lastMove;
            for (let i = 0; i < Math.min(firstMoveOfPuzzle, moves.length); i++) {
                const move = parseSan(chess, moves[i]);
                if (!move)
                    return [undefined, chess];
                const uci = makeUci(move);
                if (uci.length >= 4 && uci[1] !== '@') {
                    lastMove = [uci.slice(0, 2), uci.slice(2, 4)];
                }
                chess.play(move);
            }
            return [lastMove, chess];
        };
        this.setGround = (cg) => (this.ground = cg);
        this.setPuzzleId = (id) => {
            this.puzzleId = id;
        };
        this.initPuzzle = async (puzzleResponse) => {
            this.puzzle = puzzleResponse.puzzle;
            if (this.puzzle) {
                this.setPuzzleId(this.puzzle.id);
                [this.lastMove, this.chess] = this.lastMoveFromPgn(puzzleResponse.game.pgn, this.puzzle.initialPly);
                this.canMove = true;
                this.solutionIndex = 0;
                this.puzzle.pov = this.chess.turn;
                console.log('Initialized puzzle:', this.puzzle);
                this.onUpdate();
            }
        };
        this.dailyPuzzle = async () => {
            this.initPuzzle(await this.root.auth.fetchBody(`/api/puzzle/daily`, { method: 'get' }));
        };
        this.puzzleById = async (id) => {
            this.initPuzzle(await this.root.auth.fetchBody(`/api/puzzle/${id}`, { method: 'get' }));
        };
        this.nextPuzzle = async () => {
            console.log('Loading next puzzle...');
            this.initPuzzle(await this.root.auth.fetchBody(`/api/puzzle/next?angle=mateIn2`, { method: 'get' }));
        };
        this.markAsSolved = async (solved) => {
            if (!this.puzzle)
                return;
            await this.root.auth.fetchBody(`/api/puzzle/batch/mateIn2`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ solutions: [{ id: this.puzzleId, win: solved, rated: false }] }),
            });
        };
        this.onUpdate();
    }
}

class SeekCtrl {
    constructor(stream, root) {
        this.stream = stream;
        this.root = root;
        this.awaitClose = async () => {
            await this.stream.closePromise;
            if (this.root.page == 'seek')
                page_js('/');
        };
        this.onUnmount = () => this.stream.close();
        this.awaitClose();
    }
}
SeekCtrl.make = async (config, root) => {
    const stream = await root.auth.openStream('/api/board/seek', {
        method: 'post',
        body: formData(config),
    }, _ => { });
    return new SeekCtrl(stream, root);
};

class TvCtrl {
    constructor(stream, game, root) {
        this.stream = stream;
        this.game = game;
        this.root = root;
        this.chess = Chess.default();
        this.lastUpdateAt = Date.now();
        this.awaitClose = async () => {
            await this.stream.closePromise;
        };
        this.onUnmount = () => {
            this.stream.close();
            clearInterval(this.redrawInterval);
        };
        this.player = (color) => this.game.players[this.game.players[0].color == color ? 0 : 1];
        this.chessgroundConfig = () => {
            const chess = Chess.fromSetup(parseFen(this.game.fen).unwrap()).unwrap();
            const lm = this.game.lastMove;
            const lastMove = (lm ? (lm[1] === '@' ? [lm.slice(2)] : [lm[0] + lm[1], lm[2] + lm[3]]) : []);
            return {
                orientation: this.game.orientation,
                fen: this.game.fen,
                lastMove,
                turnColor: chess.turn,
                check: !!chess.isCheck(),
                viewOnly: true,
                movable: { free: false },
                drawable: { visible: false },
                coordinates: false,
            };
        };
        this.setGround = (cg) => (this.ground = cg);
        this.onUpdate = () => {
            this.chess = Chess.fromSetup(parseFen(this.game.fen).unwrap()).unwrap();
            this.lastUpdateAt = Date.now();
        };
        this.handle = (msg) => {
            var _b;
            switch (msg.t) {
                case 'featured':
                    this.game = msg.d;
                    this.onUpdate();
                    this.root.redraw();
                    break;
                case 'fen':
                    this.game.fen = msg.d.fen;
                    this.game.lastMove = msg.d.lm;
                    this.player('white').seconds = msg.d.wc;
                    this.player('black').seconds = msg.d.bc;
                    this.onUpdate();
                    (_b = this.ground) === null || _b === void 0 ? void 0 : _b.set(this.chessgroundConfig());
                    break;
            }
        };
        this.onUpdate();
        this.redrawInterval = setInterval(root.redraw, 100);
        this.awaitClose();
    }
}
TvCtrl.open = (root) => new Promise(async (resolve) => {
    let ctrl;
    let stream;
    const handler = (msg) => {
        if (ctrl)
            ctrl.handle(msg);
        else {
            // Gets the first game object from the first message of the stream,
            // make a TvCtrl from it, then forward the next messages to the ctrl
            ctrl = new TvCtrl(stream, msg.d, root);
            resolve(ctrl);
        }
    };
    stream = await root.auth.openStream('/api/tv/feed', {}, handler);
});

class Ctrl {
    constructor(redraw) {
        this.redraw = redraw;
        this.auth = new Auth();
        this.page = 'home';
        this.games = new OngoingGames();
        this.openHome = async () => {
            var _a;
            this.page = 'home';
            if (this.auth.me) {
                await ((_a = this.stream) === null || _a === void 0 ? void 0 : _a.close());
                this.games.empty();
                this.stream = await this.auth.openStream('/api/stream/event', {}, msg => {
                    switch (msg.type) {
                        case 'gameStart':
                            this.games.onStart(msg.game);
                            break;
                        case 'gameFinish':
                            this.games.onFinish(msg.game);
                            break;
                        default:
                            console.warn(`Unprocessed message of type ${msg.type}`, msg);
                    }
                    this.redraw();
                });
            }
            this.redraw();
        };
        this.openPuzzle = async () => {
            this.page = 'puzzle';
            this.puzzle = new PuzzleCtrl(this);
            this.redraw();
        };
        this.openGame = async (id) => {
            this.page = 'game';
            this.game = undefined;
            this.redraw();
            this.game = await GameCtrl.open(this, id);
            this.redraw();
        };
        this.playAi = async () => {
            this.game = undefined;
            this.page = 'game';
            this.redraw();
            await this.auth.fetchBody('/api/challenge/ai', {
                method: 'post',
                body: formData({
                    level: 1,
                    'clock.limit': 60 * 3,
                    'clock.increment': 2,
                }),
            });
        };
        this.playPool = async (minutes, increment) => {
            this.seek = await SeekCtrl.make({
                rated: true,
                time: minutes,
                increment: increment,
            }, this);
            this.page = 'seek';
            this.redraw();
        };
        this.playMaia = async (minutes, increment) => {
            this.challenge = await ChallengeCtrl.make({
                username: 'maia1',
                rated: false,
                'clock.limit': minutes * 60,
                'clock.increment': increment,
            }, this);
            this.page = 'challenge';
            this.redraw();
        };
        this.watchTv = async () => {
            this.page = 'tv';
            this.redraw();
            this.tv = await TvCtrl.open(this);
            this.redraw();
        };
    }
}

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			var isInstance = false;
      try {
        isInstance = this instanceof a;
      } catch {}
			if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var dropdown$1 = {exports: {}};

var top = 'top';
var bottom = 'bottom';
var right = 'right';
var left = 'left';
var auto = 'auto';
var basePlacements = [top, bottom, right, left];
var start$3 = 'start';
var end$2 = 'end';
var clippingParents = 'clippingParents';
var viewport = 'viewport';
var popper = 'popper';
var reference = 'reference';
var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
  return acc.concat([placement + "-" + start$3, placement + "-" + end$2]);
}, []);
var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
  return acc.concat([placement, placement + "-" + start$3, placement + "-" + end$2]);
}, []); // modifiers that need to read the DOM

var beforeRead = 'beforeRead';
var read$1 = 'read';
var afterRead = 'afterRead'; // pure-logic modifiers

var beforeMain = 'beforeMain';
var main$1 = 'main';
var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

var beforeWrite = 'beforeWrite';
var write$1 = 'write';
var afterWrite = 'afterWrite';
var modifierPhases = [beforeRead, read$1, afterRead, beforeMain, main$1, afterMain, beforeWrite, write$1, afterWrite];

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getWindow(node) {
  if (node == null) {
    return window;
  }

  if (node.toString() !== '[object Window]') {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
}

function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// and applies them to the HTMLElements such as popper and arrow

function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function (name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name]; // arrow is optional + virtual elements

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    } // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]


    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];

      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: '0',
      top: '0',
      margin: '0'
    },
    arrow: {
      position: 'absolute'
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(function (name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

      var style = styleProperties.reduce(function (style, property) {
        style[property] = '';
        return style;
      }, {}); // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
} // eslint-disable-next-line import/no-unused-modules


var applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$2,
  requires: ['computeStyles']
};

function getBasePlacement(placement) {
  return placement.split('-')[0];
}

var max = Math.max;
var min = Math.min;
var round = Math.round;

function getUAString() {
  var uaData = navigator.userAgentData;

  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function (item) {
      return item.brand + "/" + item.version;
    }).join(' ');
  }

  return navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }

  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }

  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;

  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }

  var _ref = isElement(element) ? getWindow(element) : window,
      visualViewport = _ref.visualViewport;

  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width: width,
    height: height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x: x,
    y: y
  };
}

// means it doesn't take into account transforms.

function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
  // Fixes https://github.com/popperjs/popper-core/issues/1223

  var width = element.offsetWidth;
  var height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }

  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: width,
    height: height
  };
}

function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

  if (parent.contains(child)) {
    return true;
  } // then fallback to custom implementation with Shadow DOM support
  else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...


        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false


  return false;
}

function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getDocumentElement(element) {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
  element.document) || window.document).documentElement;
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || ( // DOM Element detected
    isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element) // fallback

  );
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle$1(element).position === 'fixed') {
    return null;
  }

  return element.offsetParent;
} // `.offsetParent` reports `null` for fixed elements, while absolute elements
// return the containing block


function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
    var elementCss = getComputedStyle$1(element);

    if (elementCss.position === 'fixed') {
      return null;
    }
  }

  var currentNode = getParentNode(element);

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return null;
} // Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.


function getOffsetParent(element) {
  var window = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
}

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}

function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce(function (hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

var toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow(_ref) {
  var _state$modifiersData$;

  var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === 'y' ? top : left;
  var maxProp = axis === 'y' ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  var min = paddingObject[minProp];
  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect$1(_ref2) {
  var state = _ref2.state,
      options = _ref2.options;
  var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


var arrow$1 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect$1,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getVariation(placement) {
  return placement.split('-')[1];
}

var unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
}; // Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.

function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x,
      y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles(_ref2) {
  var _Object$assign2;

  var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;

  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty('x');
  var hasY = offsets.hasOwnProperty('y');
  var sideX = left;
  var sideY = top;
  var win = window;

  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = 'clientHeight';
    var widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


    offsetParent = offsetParent;

    if (placement === top || (placement === left || placement === right) && variation === end$2) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
      offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left || (placement === top || placement === bottom) && variation === end$2) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
      offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  var commonStyles = Object.assign({
    position: position
  }, adaptive && unsetSides);

  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x,
    y: y
  }, getWindow(popper)) : {
    x: x,
    y: y
  };

  x = _ref4.x;
  y = _ref4.y;

  if (gpuAcceleration) {
    var _Object$assign;

    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }

  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
}

function computeStyles(_ref5) {
  var state = _ref5.state,
      options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration: gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive: adaptive,
      roundOffsets: roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets: roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

var passive = {
  passive: true
};

function effect(_ref) {
  var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
  var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
  var window = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(function (scrollParent) {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
} // eslint-disable-next-line import/no-unused-modules


var eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function fn() {},
  effect: effect,
  data: {}
};

var hash$2 = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash$2[matched];
  });
}

var hash$1 = {
  start: 'end',
  end: 'start'
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function (matched) {
    return hash$1[matched];
  });
}

function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  };
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  // Popper 1 is broken in this case and never had a bug report so let's assume
  // it's not an issue. I don't think anyone ever specifies width on <html>
  // anyway.
  // Browsers where the left scrollbar doesn't cause an issue report `0` for
  // this (e.g. Edge 2019, IE11, Safari)
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;

  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();

    if (layoutViewport || !layoutViewport && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

// of the `<html>` and `<body>` rect bounds if horizontally scrollable

function getDocumentRect(element) {
  var _element$ownerDocumen;

  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;

  if (getComputedStyle$1(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

function isScrollParent(element) {
  // Firefox wants us to check `-x` and `-y` variations as well
  var _getComputedStyle = getComputedStyle$1(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return node.ownerDocument.body;
  }

  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }

  return getScrollParent(getParentNode(node));
}

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function listScrollParents(element, list) {
  var _element$ownerDocumen;

  if (list === void 0) {
    list = [];
  }

  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
  updatedList.concat(listScrollParents(getParentNode(target)));
}

function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === 'fixed');
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
} // A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`


function getClippingParents(element) {
  var clippingParents = listScrollParents(getParentNode(element));
  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement(clipperElement)) {
    return [];
  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


  return clippingParents.filter(function (clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
  });
} // Gets the maximum area that the element is visible in due to any number of
// clipping parents


function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents[0];
  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function computeOffsets(_ref) {
  var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;

  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;

    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;

    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;

    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;

    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }

  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

  if (mainAxis != null) {
    var len = mainAxis === 'y' ? 'height' : 'width';

    switch (variation) {
      case start$3:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;

      case end$2:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }

  return offsets;
}

function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$strategy = _options.strategy,
      strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    placement: placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function (key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}

function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
    return getVariation(placement) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function (placement) {
    return allowedAutoPlacements.indexOf(placement) >= 0;
  });

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


  var overflows = allowedPlacements.reduce(function (acc, placement) {
    acc[placement] = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding
    })[getBasePlacement(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function (a, b) {
    return overflows[a] - overflows[b];
  });
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }

  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;

  if (state.modifiersData[name]._skip) {
    return;
  }

  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
    return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      flipVariations: flipVariations,
      allowedAutoPlacements: allowedAutoPlacements
    }) : placement);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements[0];

  for (var i = 0; i < placements.length; i++) {
    var placement = placements[i];

    var _basePlacement = getBasePlacement(placement);

    var isStartVariation = getVariation(placement) === start$3;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? 'width' : 'height';
    var overflow = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      altBoundary: altBoundary,
      padding: padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];

    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }

    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }

    if (checks.every(function (check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    var numberOfChecks = flipVariations ? 3 : 1;

    var _loop = function _loop(_i) {
      var fittingPlacement = placements.find(function (placement) {
        var checks = checksMap.get(placement);

        if (checks) {
          return checks.slice(0, _i).every(function (check) {
            return check;
          });
        }
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };

    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);

      if (_ret === "break") break;
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
} // eslint-disable-next-line import/no-unused-modules


var flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: {
    _skip: false
  }
};

function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }

  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function (side) {
    return overflow[side] >= 0;
  });
}

function hide(_ref) {
  var state = _ref.state,
      name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: 'reference'
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets: referenceClippingOffsets,
    popperEscapeOffsets: popperEscapeOffsets,
    isReferenceHidden: isReferenceHidden,
    hasPopperEscaped: hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  });
} // eslint-disable-next-line import/no-unused-modules


var hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
    placement: placement
  })) : offset,
      skidding = _ref[0],
      distance = _ref[1];

  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}

function offset(_ref2) {
  var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
  var _options$offset = options.offset,
      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function (acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

function popperOffsets(_ref) {
  var state = _ref.state,
      name = _ref.name;
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    placement: state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function preventOverflow(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    var _offsetModifierState$;

    var mainSide = mainAxis === 'y' ? top : left;
    var altSide = mainAxis === 'y' ? bottom : right;
    var len = mainAxis === 'y' ? 'height' : 'width';
    var offset = popperOffsets[mainAxis];
    var min$1 = offset + overflow[mainSide];
    var max$1 = offset - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start$3 ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start$3 ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    var _offsetModifierState$2;

    var _mainSide = mainAxis === 'x' ? top : left;

    var _altSide = mainAxis === 'x' ? bottom : right;

    var _offset = popperOffsets[altAxis];

    var _len = altAxis === 'y' ? 'height' : 'width';

    var _min = _offset + overflow[_mainSide];

    var _max = _offset - overflow[_altSide];

    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
} // Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.


function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }

  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function (modifier) {
    map.set(modifier.name, modifier);
  }); // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function (dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);

        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(function (modifier) {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier);
    }
  });
  return result;
}

function orderModifiers(modifiers) {
  // order based on dependencies
  var orderedModifiers = order(modifiers); // order based on phase

  return modifierPhases.reduce(function (acc, phase) {
    return acc.concat(orderedModifiers.filter(function (modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

function debounce(fn) {
  var pending;
  return function () {
    if (!pending) {
      pending = new Promise(function (resolve) {
        Promise.resolve().then(function () {
          pending = undefined;
          resolve(fn());
        });
      });
    }

    return pending;
  };
}

function mergeByName(modifiers) {
  var merged = modifiers.reduce(function (merged, current) {
    var existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {}); // IE11 does not support Object.values

  return Object.keys(merged).map(function (key) {
    return merged[key];
  });
}

var DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return !args.some(function (element) {
    return !(element && typeof element.getBoundingClientRect === 'function');
  });
}

function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }

  var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference, popper, options) {
    if (options === void 0) {
      options = defaultOptions;
    }

    var state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference,
        popper: popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state,
      setOptions: function setOptions(setOptionsAction) {
        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        }; // Orders the modifiers based on their dependencies and `phase`
        // properties

        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

        state.orderedModifiers = orderedModifiers.filter(function (m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }

        var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          return;
        } // Store the reference and popper rects to be read by modifiers


        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        }; // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect

        state.reset = false;
        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`

        state.orderedModifiers.forEach(function (modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });

        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;

          if (typeof fn === 'function') {
            state = fn({
              state: state,
              options: _options,
              name: name,
              instance: instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function () {
        return new Promise(function (resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      return instance;
    }

    instance.setOptions(options).then(function (state) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.

    function runModifierEffects() {
      state.orderedModifiers.forEach(function (_ref) {
        var name = _ref.name,
            _ref$options = _ref.options,
            options = _ref$options === void 0 ? {} : _ref$options,
            effect = _ref.effect;

        if (typeof effect === 'function') {
          var cleanupFn = effect({
            state: state,
            name: name,
            instance: instance,
            options: options
          });

          var noopFn = function noopFn() {};

          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function (fn) {
        return fn();
      });
      effectCleanupFns = [];
    }

    return instance;
  };
}
var createPopper$2 = /*#__PURE__*/popperGenerator(); // eslint-disable-next-line import/no-unused-modules

var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
var createPopper$1 = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers$1
}); // eslint-disable-next-line import/no-unused-modules

var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers
}); // eslint-disable-next-line import/no-unused-modules

var lib = /*#__PURE__*/Object.freeze({
    __proto__: null,
    afterMain: afterMain,
    afterRead: afterRead,
    afterWrite: afterWrite,
    applyStyles: applyStyles$1,
    arrow: arrow$1,
    auto: auto,
    basePlacements: basePlacements,
    beforeMain: beforeMain,
    beforeRead: beforeRead,
    beforeWrite: beforeWrite,
    bottom: bottom,
    clippingParents: clippingParents,
    computeStyles: computeStyles$1,
    createPopper: createPopper,
    createPopperBase: createPopper$2,
    createPopperLite: createPopper$1,
    detectOverflow: detectOverflow,
    end: end$2,
    eventListeners: eventListeners,
    flip: flip$1,
    hide: hide$1,
    left: left,
    main: main$1,
    modifierPhases: modifierPhases,
    offset: offset$1,
    placements: placements,
    popper: popper,
    popperGenerator: popperGenerator,
    popperOffsets: popperOffsets$1,
    preventOverflow: preventOverflow$1,
    read: read$1,
    reference: reference,
    right: right,
    start: start$3,
    top: top,
    variationPlacements: variationPlacements,
    viewport: viewport,
    write: write$1
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(lib);

var baseComponent$1 = {exports: {}};

var data$1 = {exports: {}};

/*!
  * Bootstrap data.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var data = data$1.exports;

var hasRequiredData;

function requireData () {
	if (hasRequiredData) return data$1.exports;
	hasRequiredData = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory() ;
		})(data, (function () {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap dom/data.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */

		  /**
		   * Constants
		   */

		  const elementMap = new Map();
		  const data = {
		    set(element, key, instance) {
		      if (!elementMap.has(element)) {
		        elementMap.set(element, new Map());
		      }
		      const instanceMap = elementMap.get(element);

		      // make it clear we only want one instance per element
		      // can be removed later when multiple key/instances are fine to be used
		      if (!instanceMap.has(key) && instanceMap.size !== 0) {
		        // eslint-disable-next-line no-console
		        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
		        return;
		      }
		      instanceMap.set(key, instance);
		    },
		    get(element, key) {
		      if (elementMap.has(element)) {
		        return elementMap.get(element).get(key) || null;
		      }
		      return null;
		    },
		    remove(element, key) {
		      if (!elementMap.has(element)) {
		        return;
		      }
		      const instanceMap = elementMap.get(element);
		      instanceMap.delete(key);

		      // free up element references if there are no instances left for an element
		      if (instanceMap.size === 0) {
		        elementMap.delete(element);
		      }
		    }
		  };

		  return data;

		}));
		
	} (data$1));
	return data$1.exports;
}

var eventHandler$1 = {exports: {}};

var util$1 = {exports: {}};

/*!
  * Bootstrap index.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var util = util$1.exports;

var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util$1.exports;
	hasRequiredUtil = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		})(util, (function (exports$1) {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap util/index.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */

		  const MAX_UID = 1000000;
		  const MILLISECONDS_MULTIPLIER = 1000;
		  const TRANSITION_END = 'transitionend';

		  /**
		   * Properly escape IDs selectors to handle weird IDs
		   * @param {string} selector
		   * @returns {string}
		   */
		  const parseSelector = selector => {
		    if (selector && window.CSS && window.CSS.escape) {
		      // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
		      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
		    }
		    return selector;
		  };

		  // Shout-out Angus Croll (https://goo.gl/pxwQGp)
		  const toType = object => {
		    if (object === null || object === undefined) {
		      return `${object}`;
		    }
		    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
		  };

		  /**
		   * Public Util API
		   */

		  const getUID = prefix => {
		    do {
		      prefix += Math.floor(Math.random() * MAX_UID);
		    } while (document.getElementById(prefix));
		    return prefix;
		  };
		  const getTransitionDurationFromElement = element => {
		    if (!element) {
		      return 0;
		    }

		    // Get transition-duration of the element
		    let {
		      transitionDuration,
		      transitionDelay
		    } = window.getComputedStyle(element);
		    const floatTransitionDuration = Number.parseFloat(transitionDuration);
		    const floatTransitionDelay = Number.parseFloat(transitionDelay);

		    // Return 0 if element or transition duration is not found
		    if (!floatTransitionDuration && !floatTransitionDelay) {
		      return 0;
		    }

		    // If multiple durations are defined, take the first
		    transitionDuration = transitionDuration.split(',')[0];
		    transitionDelay = transitionDelay.split(',')[0];
		    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
		  };
		  const triggerTransitionEnd = element => {
		    element.dispatchEvent(new Event(TRANSITION_END));
		  };
		  const isElement = object => {
		    if (!object || typeof object !== 'object') {
		      return false;
		    }
		    if (typeof object.jquery !== 'undefined') {
		      object = object[0];
		    }
		    return typeof object.nodeType !== 'undefined';
		  };
		  const getElement = object => {
		    // it's a jQuery object or a node element
		    if (isElement(object)) {
		      return object.jquery ? object[0] : object;
		    }
		    if (typeof object === 'string' && object.length > 0) {
		      return document.querySelector(parseSelector(object));
		    }
		    return null;
		  };
		  const isVisible = element => {
		    if (!isElement(element) || element.getClientRects().length === 0) {
		      return false;
		    }
		    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
		    // Handle `details` element as its content may falsie appear visible when it is closed
		    const closedDetails = element.closest('details:not([open])');
		    if (!closedDetails) {
		      return elementIsVisible;
		    }
		    if (closedDetails !== element) {
		      const summary = element.closest('summary');
		      if (summary && summary.parentNode !== closedDetails) {
		        return false;
		      }
		      if (summary === null) {
		        return false;
		      }
		    }
		    return elementIsVisible;
		  };
		  const isDisabled = element => {
		    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
		      return true;
		    }
		    if (element.classList.contains('disabled')) {
		      return true;
		    }
		    if (typeof element.disabled !== 'undefined') {
		      return element.disabled;
		    }
		    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
		  };
		  const findShadowRoot = element => {
		    if (!document.documentElement.attachShadow) {
		      return null;
		    }

		    // Can find the shadow root otherwise it'll return the document
		    if (typeof element.getRootNode === 'function') {
		      const root = element.getRootNode();
		      return root instanceof ShadowRoot ? root : null;
		    }
		    if (element instanceof ShadowRoot) {
		      return element;
		    }

		    // when we don't find a shadow root
		    if (!element.parentNode) {
		      return null;
		    }
		    return findShadowRoot(element.parentNode);
		  };
		  const noop = () => {};

		  /**
		   * Trick to restart an element's animation
		   *
		   * @param {HTMLElement} element
		   * @return void
		   *
		   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
		   */
		  const reflow = element => {
		    element.offsetHeight; // eslint-disable-line no-unused-expressions
		  };
		  const getjQuery = () => {
		    if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
		      return window.jQuery;
		    }
		    return null;
		  };
		  const DOMContentLoadedCallbacks = [];
		  const onDOMContentLoaded = callback => {
		    if (document.readyState === 'loading') {
		      // add listener on the first call when the document is in loading state
		      if (!DOMContentLoadedCallbacks.length) {
		        document.addEventListener('DOMContentLoaded', () => {
		          for (const callback of DOMContentLoadedCallbacks) {
		            callback();
		          }
		        });
		      }
		      DOMContentLoadedCallbacks.push(callback);
		    } else {
		      callback();
		    }
		  };
		  const isRTL = () => document.documentElement.dir === 'rtl';
		  const defineJQueryPlugin = plugin => {
		    onDOMContentLoaded(() => {
		      const $ = getjQuery();
		      /* istanbul ignore if */
		      if ($) {
		        const name = plugin.NAME;
		        const JQUERY_NO_CONFLICT = $.fn[name];
		        $.fn[name] = plugin.jQueryInterface;
		        $.fn[name].Constructor = plugin;
		        $.fn[name].noConflict = () => {
		          $.fn[name] = JQUERY_NO_CONFLICT;
		          return plugin.jQueryInterface;
		        };
		      }
		    });
		  };
		  const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
		    return typeof possibleCallback === 'function' ? possibleCallback(...args) : defaultValue;
		  };
		  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
		    if (!waitForTransition) {
		      execute(callback);
		      return;
		    }
		    const durationPadding = 5;
		    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
		    let called = false;
		    const handler = ({
		      target
		    }) => {
		      if (target !== transitionElement) {
		        return;
		      }
		      called = true;
		      transitionElement.removeEventListener(TRANSITION_END, handler);
		      execute(callback);
		    };
		    transitionElement.addEventListener(TRANSITION_END, handler);
		    setTimeout(() => {
		      if (!called) {
		        triggerTransitionEnd(transitionElement);
		      }
		    }, emulatedDuration);
		  };

		  /**
		   * Return the previous/next element of a list.
		   *
		   * @param {array} list    The list of elements
		   * @param activeElement   The active element
		   * @param shouldGetNext   Choose to get next or previous element
		   * @param isCycleAllowed
		   * @return {Element|elem} The proper element
		   */
		  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
		    const listLength = list.length;
		    let index = list.indexOf(activeElement);

		    // if the element does not exist in the list return an element
		    // depending on the direction and if cycle is allowed
		    if (index === -1) {
		      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
		    }
		    index += shouldGetNext ? 1 : -1;
		    if (isCycleAllowed) {
		      index = (index + listLength) % listLength;
		    }
		    return list[Math.max(0, Math.min(index, listLength - 1))];
		  };

		  exports$1.defineJQueryPlugin = defineJQueryPlugin;
		  exports$1.execute = execute;
		  exports$1.executeAfterTransition = executeAfterTransition;
		  exports$1.findShadowRoot = findShadowRoot;
		  exports$1.getElement = getElement;
		  exports$1.getNextActiveElement = getNextActiveElement;
		  exports$1.getTransitionDurationFromElement = getTransitionDurationFromElement;
		  exports$1.getUID = getUID;
		  exports$1.getjQuery = getjQuery;
		  exports$1.isDisabled = isDisabled;
		  exports$1.isElement = isElement;
		  exports$1.isRTL = isRTL;
		  exports$1.isVisible = isVisible;
		  exports$1.noop = noop;
		  exports$1.onDOMContentLoaded = onDOMContentLoaded;
		  exports$1.parseSelector = parseSelector;
		  exports$1.reflow = reflow;
		  exports$1.toType = toType;
		  exports$1.triggerTransitionEnd = triggerTransitionEnd;

		  Object.defineProperty(exports$1, Symbol.toStringTag, { value: 'Module' });

		}));
		
	} (util$1, util$1.exports));
	return util$1.exports;
}

/*!
  * Bootstrap event-handler.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var eventHandler = eventHandler$1.exports;

var hasRequiredEventHandler;

function requireEventHandler () {
	if (hasRequiredEventHandler) return eventHandler$1.exports;
	hasRequiredEventHandler = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory(requireUtil()) ;
		})(eventHandler, (function (index_js) {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap dom/event-handler.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */


		  /**
		   * Constants
		   */

		  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
		  const stripNameRegex = /\..*/;
		  const stripUidRegex = /::\d+$/;
		  const eventRegistry = {}; // Events storage
		  let uidEvent = 1;
		  const customEvents = {
		    mouseenter: 'mouseover',
		    mouseleave: 'mouseout'
		  };
		  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

		  /**
		   * Private methods
		   */

		  function makeEventUid(element, uid) {
		    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
		  }
		  function getElementEvents(element) {
		    const uid = makeEventUid(element);
		    element.uidEvent = uid;
		    eventRegistry[uid] = eventRegistry[uid] || {};
		    return eventRegistry[uid];
		  }
		  function bootstrapHandler(element, fn) {
		    return function handler(event) {
		      hydrateObj(event, {
		        delegateTarget: element
		      });
		      if (handler.oneOff) {
		        EventHandler.off(element, event.type, fn);
		      }
		      return fn.apply(element, [event]);
		    };
		  }
		  function bootstrapDelegationHandler(element, selector, fn) {
		    return function handler(event) {
		      const domElements = element.querySelectorAll(selector);
		      for (let {
		        target
		      } = event; target && target !== this; target = target.parentNode) {
		        for (const domElement of domElements) {
		          if (domElement !== target) {
		            continue;
		          }
		          hydrateObj(event, {
		            delegateTarget: target
		          });
		          if (handler.oneOff) {
		            EventHandler.off(element, event.type, selector, fn);
		          }
		          return fn.apply(target, [event]);
		        }
		      }
		    };
		  }
		  function findHandler(events, callable, delegationSelector = null) {
		    return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
		  }
		  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
		    const isDelegated = typeof handler === 'string';
		    // TODO: tooltip passes `false` instead of selector, so we need to check
		    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
		    let typeEvent = getTypeEvent(originalTypeEvent);
		    if (!nativeEvents.has(typeEvent)) {
		      typeEvent = originalTypeEvent;
		    }
		    return [isDelegated, callable, typeEvent];
		  }
		  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
		    if (typeof originalTypeEvent !== 'string' || !element) {
		      return;
		    }
		    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

		    // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
		    // this prevents the handler from being dispatched the same way as mouseover or mouseout does
		    if (originalTypeEvent in customEvents) {
		      const wrapFunction = fn => {
		        return function (event) {
		          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
		            return fn.call(this, event);
		          }
		        };
		      };
		      callable = wrapFunction(callable);
		    }
		    const events = getElementEvents(element);
		    const handlers = events[typeEvent] || (events[typeEvent] = {});
		    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
		    if (previousFunction) {
		      previousFunction.oneOff = previousFunction.oneOff && oneOff;
		      return;
		    }
		    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
		    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
		    fn.delegationSelector = isDelegated ? handler : null;
		    fn.callable = callable;
		    fn.oneOff = oneOff;
		    fn.uidEvent = uid;
		    handlers[uid] = fn;
		    element.addEventListener(typeEvent, fn, isDelegated);
		  }
		  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
		    const fn = findHandler(events[typeEvent], handler, delegationSelector);
		    if (!fn) {
		      return;
		    }
		    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
		    delete events[typeEvent][fn.uidEvent];
		  }
		  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
		    const storeElementEvent = events[typeEvent] || {};
		    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
		      if (handlerKey.includes(namespace)) {
		        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
		      }
		    }
		  }
		  function getTypeEvent(event) {
		    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
		    event = event.replace(stripNameRegex, '');
		    return customEvents[event] || event;
		  }
		  const EventHandler = {
		    on(element, event, handler, delegationFunction) {
		      addHandler(element, event, handler, delegationFunction, false);
		    },
		    one(element, event, handler, delegationFunction) {
		      addHandler(element, event, handler, delegationFunction, true);
		    },
		    off(element, originalTypeEvent, handler, delegationFunction) {
		      if (typeof originalTypeEvent !== 'string' || !element) {
		        return;
		      }
		      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
		      const inNamespace = typeEvent !== originalTypeEvent;
		      const events = getElementEvents(element);
		      const storeElementEvent = events[typeEvent] || {};
		      const isNamespace = originalTypeEvent.startsWith('.');
		      if (typeof callable !== 'undefined') {
		        // Simplest case: handler is passed, remove that listener ONLY.
		        if (!Object.keys(storeElementEvent).length) {
		          return;
		        }
		        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
		        return;
		      }
		      if (isNamespace) {
		        for (const elementEvent of Object.keys(events)) {
		          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
		        }
		      }
		      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
		        const handlerKey = keyHandlers.replace(stripUidRegex, '');
		        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
		          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
		        }
		      }
		    },
		    trigger(element, event, args) {
		      if (typeof event !== 'string' || !element) {
		        return null;
		      }
		      const $ = index_js.getjQuery();
		      const typeEvent = getTypeEvent(event);
		      const inNamespace = event !== typeEvent;
		      let jQueryEvent = null;
		      let bubbles = true;
		      let nativeDispatch = true;
		      let defaultPrevented = false;
		      if (inNamespace && $) {
		        jQueryEvent = $.Event(event, args);
		        $(element).trigger(jQueryEvent);
		        bubbles = !jQueryEvent.isPropagationStopped();
		        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
		        defaultPrevented = jQueryEvent.isDefaultPrevented();
		      }
		      const evt = hydrateObj(new Event(event, {
		        bubbles,
		        cancelable: true
		      }), args);
		      if (defaultPrevented) {
		        evt.preventDefault();
		      }
		      if (nativeDispatch) {
		        element.dispatchEvent(evt);
		      }
		      if (evt.defaultPrevented && jQueryEvent) {
		        jQueryEvent.preventDefault();
		      }
		      return evt;
		    }
		  };
		  function hydrateObj(obj, meta = {}) {
		    for (const [key, value] of Object.entries(meta)) {
		      try {
		        obj[key] = value;
		      } catch (_unused) {
		        Object.defineProperty(obj, key, {
		          configurable: true,
		          get() {
		            return value;
		          }
		        });
		      }
		    }
		    return obj;
		  }

		  return EventHandler;

		}));
		
	} (eventHandler$1));
	return eventHandler$1.exports;
}

var config$1 = {exports: {}};

var manipulator$1 = {exports: {}};

/*!
  * Bootstrap manipulator.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var manipulator = manipulator$1.exports;

var hasRequiredManipulator;

function requireManipulator () {
	if (hasRequiredManipulator) return manipulator$1.exports;
	hasRequiredManipulator = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory() ;
		})(manipulator, (function () {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap dom/manipulator.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */

		  function normalizeData(value) {
		    if (value === 'true') {
		      return true;
		    }
		    if (value === 'false') {
		      return false;
		    }
		    if (value === Number(value).toString()) {
		      return Number(value);
		    }
		    if (value === '' || value === 'null') {
		      return null;
		    }
		    if (typeof value !== 'string') {
		      return value;
		    }
		    try {
		      return JSON.parse(decodeURIComponent(value));
		    } catch (_unused) {
		      return value;
		    }
		  }
		  function normalizeDataKey(key) {
		    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
		  }
		  const Manipulator = {
		    setDataAttribute(element, key, value) {
		      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
		    },
		    removeDataAttribute(element, key) {
		      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
		    },
		    getDataAttributes(element) {
		      if (!element) {
		        return {};
		      }
		      const attributes = {};
		      const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
		      for (const key of bsKeys) {
		        let pureKey = key.replace(/^bs/, '');
		        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
		        attributes[pureKey] = normalizeData(element.dataset[key]);
		      }
		      return attributes;
		    },
		    getDataAttribute(element, key) {
		      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
		    }
		  };

		  return Manipulator;

		}));
		
	} (manipulator$1));
	return manipulator$1.exports;
}

/*!
  * Bootstrap config.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var config = config$1.exports;

var hasRequiredConfig;

function requireConfig () {
	if (hasRequiredConfig) return config$1.exports;
	hasRequiredConfig = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory(requireManipulator(), requireUtil()) ;
		})(config, (function (Manipulator, index_js) {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap util/config.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */


		  /**
		   * Class definition
		   */

		  class Config {
		    // Getters
		    static get Default() {
		      return {};
		    }
		    static get DefaultType() {
		      return {};
		    }
		    static get NAME() {
		      throw new Error('You have to implement the static method "NAME", for each component!');
		    }
		    _getConfig(config) {
		      config = this._mergeConfigObj(config);
		      config = this._configAfterMerge(config);
		      this._typeCheckConfig(config);
		      return config;
		    }
		    _configAfterMerge(config) {
		      return config;
		    }
		    _mergeConfigObj(config, element) {
		      const jsonConfig = index_js.isElement(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

		      return {
		        ...this.constructor.Default,
		        ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
		        ...(index_js.isElement(element) ? Manipulator.getDataAttributes(element) : {}),
		        ...(typeof config === 'object' ? config : {})
		      };
		    }
		    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
		      for (const [property, expectedTypes] of Object.entries(configTypes)) {
		        const value = config[property];
		        const valueType = index_js.isElement(value) ? 'element' : index_js.toType(value);
		        if (!new RegExp(expectedTypes).test(valueType)) {
		          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
		        }
		      }
		    }
		  }

		  return Config;

		}));
		
	} (config$1));
	return config$1.exports;
}

/*!
  * Bootstrap base-component.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var baseComponent = baseComponent$1.exports;

var hasRequiredBaseComponent;

function requireBaseComponent () {
	if (hasRequiredBaseComponent) return baseComponent$1.exports;
	hasRequiredBaseComponent = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory(requireData(), requireEventHandler(), requireConfig(), requireUtil()) ;
		})(baseComponent, (function (Data, EventHandler, Config, index_js) {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap base-component.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */


		  /**
		   * Constants
		   */

		  const VERSION = '5.3.3';

		  /**
		   * Class definition
		   */

		  class BaseComponent extends Config {
		    constructor(element, config) {
		      super();
		      element = index_js.getElement(element);
		      if (!element) {
		        return;
		      }
		      this._element = element;
		      this._config = this._getConfig(config);
		      Data.set(this._element, this.constructor.DATA_KEY, this);
		    }

		    // Public
		    dispose() {
		      Data.remove(this._element, this.constructor.DATA_KEY);
		      EventHandler.off(this._element, this.constructor.EVENT_KEY);
		      for (const propertyName of Object.getOwnPropertyNames(this)) {
		        this[propertyName] = null;
		      }
		    }
		    _queueCallback(callback, element, isAnimated = true) {
		      index_js.executeAfterTransition(callback, element, isAnimated);
		    }
		    _getConfig(config) {
		      config = this._mergeConfigObj(config, this._element);
		      config = this._configAfterMerge(config);
		      this._typeCheckConfig(config);
		      return config;
		    }

		    // Static
		    static getInstance(element) {
		      return Data.get(index_js.getElement(element), this.DATA_KEY);
		    }
		    static getOrCreateInstance(element, config = {}) {
		      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
		    }
		    static get VERSION() {
		      return VERSION;
		    }
		    static get DATA_KEY() {
		      return `bs.${this.NAME}`;
		    }
		    static get EVENT_KEY() {
		      return `.${this.DATA_KEY}`;
		    }
		    static eventName(name) {
		      return `${name}${this.EVENT_KEY}`;
		    }
		  }

		  return BaseComponent;

		}));
		
	} (baseComponent$1));
	return baseComponent$1.exports;
}

var selectorEngine$1 = {exports: {}};

/*!
  * Bootstrap selector-engine.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var selectorEngine = selectorEngine$1.exports;

var hasRequiredSelectorEngine;

function requireSelectorEngine () {
	if (hasRequiredSelectorEngine) return selectorEngine$1.exports;
	hasRequiredSelectorEngine = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory(requireUtil()) ;
		})(selectorEngine, (function (index_js) {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap dom/selector-engine.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */

		  const getSelector = element => {
		    let selector = element.getAttribute('data-bs-target');
		    if (!selector || selector === '#') {
		      let hrefAttribute = element.getAttribute('href');

		      // The only valid content that could double as a selector are IDs or classes,
		      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
		      // `document.querySelector` will rightfully complain it is invalid.
		      // See https://github.com/twbs/bootstrap/issues/32273
		      if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
		        return null;
		      }

		      // Just in case some CMS puts out a full URL with the anchor appended
		      if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
		        hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
		      }
		      selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
		    }
		    return selector ? selector.split(',').map(sel => index_js.parseSelector(sel)).join(',') : null;
		  };
		  const SelectorEngine = {
		    find(selector, element = document.documentElement) {
		      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
		    },
		    findOne(selector, element = document.documentElement) {
		      return Element.prototype.querySelector.call(element, selector);
		    },
		    children(element, selector) {
		      return [].concat(...element.children).filter(child => child.matches(selector));
		    },
		    parents(element, selector) {
		      const parents = [];
		      let ancestor = element.parentNode.closest(selector);
		      while (ancestor) {
		        parents.push(ancestor);
		        ancestor = ancestor.parentNode.closest(selector);
		      }
		      return parents;
		    },
		    prev(element, selector) {
		      let previous = element.previousElementSibling;
		      while (previous) {
		        if (previous.matches(selector)) {
		          return [previous];
		        }
		        previous = previous.previousElementSibling;
		      }
		      return [];
		    },
		    // TODO: this is now unused; remove later along with prev()
		    next(element, selector) {
		      let next = element.nextElementSibling;
		      while (next) {
		        if (next.matches(selector)) {
		          return [next];
		        }
		        next = next.nextElementSibling;
		      }
		      return [];
		    },
		    focusableChildren(element) {
		      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
		      return this.find(focusables, element).filter(el => !index_js.isDisabled(el) && index_js.isVisible(el));
		    },
		    getSelectorFromElement(element) {
		      const selector = getSelector(element);
		      if (selector) {
		        return SelectorEngine.findOne(selector) ? selector : null;
		      }
		      return null;
		    },
		    getElementFromSelector(element) {
		      const selector = getSelector(element);
		      return selector ? SelectorEngine.findOne(selector) : null;
		    },
		    getMultipleElementsFromSelector(element) {
		      const selector = getSelector(element);
		      return selector ? SelectorEngine.find(selector) : [];
		    }
		  };

		  return SelectorEngine;

		}));
		
	} (selectorEngine$1));
	return selectorEngine$1.exports;
}

/*!
  * Bootstrap dropdown.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var dropdown = dropdown$1.exports;

var hasRequiredDropdown;

function requireDropdown () {
	if (hasRequiredDropdown) return dropdown$1.exports;
	hasRequiredDropdown = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory(require$$0, requireBaseComponent(), requireEventHandler(), requireManipulator(), requireSelectorEngine(), requireUtil()) ;
		})(dropdown, (function (Popper, BaseComponent, EventHandler, Manipulator, SelectorEngine, index_js) {
		  function _interopNamespaceDefault(e) {
		    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
		    if (e) {
		      for (const k in e) {
		        if (k !== 'default') {
		          const d = Object.getOwnPropertyDescriptor(e, k);
		          Object.defineProperty(n, k, d.get ? d : {
		            enumerable: true,
		            get: () => e[k]
		          });
		        }
		      }
		    }
		    n.default = e;
		    return Object.freeze(n);
		  }

		  const Popper__namespace = /*#__PURE__*/_interopNamespaceDefault(Popper);

		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap dropdown.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */


		  /**
		   * Constants
		   */

		  const NAME = 'dropdown';
		  const DATA_KEY = 'bs.dropdown';
		  const EVENT_KEY = `.${DATA_KEY}`;
		  const DATA_API_KEY = '.data-api';
		  const ESCAPE_KEY = 'Escape';
		  const TAB_KEY = 'Tab';
		  const ARROW_UP_KEY = 'ArrowUp';
		  const ARROW_DOWN_KEY = 'ArrowDown';
		  const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

		  const EVENT_HIDE = `hide${EVENT_KEY}`;
		  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
		  const EVENT_SHOW = `show${EVENT_KEY}`;
		  const EVENT_SHOWN = `shown${EVENT_KEY}`;
		  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
		  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`;
		  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`;
		  const CLASS_NAME_SHOW = 'show';
		  const CLASS_NAME_DROPUP = 'dropup';
		  const CLASS_NAME_DROPEND = 'dropend';
		  const CLASS_NAME_DROPSTART = 'dropstart';
		  const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
		  const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
		  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
		  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE}.${CLASS_NAME_SHOW}`;
		  const SELECTOR_MENU = '.dropdown-menu';
		  const SELECTOR_NAVBAR = '.navbar';
		  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
		  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
		  const PLACEMENT_TOP = index_js.isRTL() ? 'top-end' : 'top-start';
		  const PLACEMENT_TOPEND = index_js.isRTL() ? 'top-start' : 'top-end';
		  const PLACEMENT_BOTTOM = index_js.isRTL() ? 'bottom-end' : 'bottom-start';
		  const PLACEMENT_BOTTOMEND = index_js.isRTL() ? 'bottom-start' : 'bottom-end';
		  const PLACEMENT_RIGHT = index_js.isRTL() ? 'left-start' : 'right-start';
		  const PLACEMENT_LEFT = index_js.isRTL() ? 'right-start' : 'left-start';
		  const PLACEMENT_TOPCENTER = 'top';
		  const PLACEMENT_BOTTOMCENTER = 'bottom';
		  const Default = {
		    autoClose: true,
		    boundary: 'clippingParents',
		    display: 'dynamic',
		    offset: [0, 2],
		    popperConfig: null,
		    reference: 'toggle'
		  };
		  const DefaultType = {
		    autoClose: '(boolean|string)',
		    boundary: '(string|element)',
		    display: 'string',
		    offset: '(array|string|function)',
		    popperConfig: '(null|object|function)',
		    reference: '(string|element|object)'
		  };

		  /**
		   * Class definition
		   */

		  class Dropdown extends BaseComponent {
		    constructor(element, config) {
		      super(element, config);
		      this._popper = null;
		      this._parent = this._element.parentNode; // dropdown wrapper
		      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
		      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
		      this._inNavbar = this._detectNavbar();
		    }

		    // Getters
		    static get Default() {
		      return Default;
		    }
		    static get DefaultType() {
		      return DefaultType;
		    }
		    static get NAME() {
		      return NAME;
		    }

		    // Public
		    toggle() {
		      return this._isShown() ? this.hide() : this.show();
		    }
		    show() {
		      if (index_js.isDisabled(this._element) || this._isShown()) {
		        return;
		      }
		      const relatedTarget = {
		        relatedTarget: this._element
		      };
		      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW, relatedTarget);
		      if (showEvent.defaultPrevented) {
		        return;
		      }
		      this._createPopper();

		      // If this is a touch-enabled device we add extra
		      // empty mouseover listeners to the body's immediate children;
		      // only needed because of broken event delegation on iOS
		      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
		      if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
		        for (const element of [].concat(...document.body.children)) {
		          EventHandler.on(element, 'mouseover', index_js.noop);
		        }
		      }
		      this._element.focus();
		      this._element.setAttribute('aria-expanded', true);
		      this._menu.classList.add(CLASS_NAME_SHOW);
		      this._element.classList.add(CLASS_NAME_SHOW);
		      EventHandler.trigger(this._element, EVENT_SHOWN, relatedTarget);
		    }
		    hide() {
		      if (index_js.isDisabled(this._element) || !this._isShown()) {
		        return;
		      }
		      const relatedTarget = {
		        relatedTarget: this._element
		      };
		      this._completeHide(relatedTarget);
		    }
		    dispose() {
		      if (this._popper) {
		        this._popper.destroy();
		      }
		      super.dispose();
		    }
		    update() {
		      this._inNavbar = this._detectNavbar();
		      if (this._popper) {
		        this._popper.update();
		      }
		    }

		    // Private
		    _completeHide(relatedTarget) {
		      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE, relatedTarget);
		      if (hideEvent.defaultPrevented) {
		        return;
		      }

		      // If this is a touch-enabled device we remove the extra
		      // empty mouseover listeners we added for iOS support
		      if ('ontouchstart' in document.documentElement) {
		        for (const element of [].concat(...document.body.children)) {
		          EventHandler.off(element, 'mouseover', index_js.noop);
		        }
		      }
		      if (this._popper) {
		        this._popper.destroy();
		      }
		      this._menu.classList.remove(CLASS_NAME_SHOW);
		      this._element.classList.remove(CLASS_NAME_SHOW);
		      this._element.setAttribute('aria-expanded', 'false');
		      Manipulator.removeDataAttribute(this._menu, 'popper');
		      EventHandler.trigger(this._element, EVENT_HIDDEN, relatedTarget);
		    }
		    _getConfig(config) {
		      config = super._getConfig(config);
		      if (typeof config.reference === 'object' && !index_js.isElement(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
		        // Popper virtual elements require a getBoundingClientRect method
		        throw new TypeError(`${NAME.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
		      }
		      return config;
		    }
		    _createPopper() {
		      if (typeof Popper__namespace === 'undefined') {
		        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
		      }
		      let referenceElement = this._element;
		      if (this._config.reference === 'parent') {
		        referenceElement = this._parent;
		      } else if (index_js.isElement(this._config.reference)) {
		        referenceElement = index_js.getElement(this._config.reference);
		      } else if (typeof this._config.reference === 'object') {
		        referenceElement = this._config.reference;
		      }
		      const popperConfig = this._getPopperConfig();
		      this._popper = Popper__namespace.createPopper(referenceElement, this._menu, popperConfig);
		    }
		    _isShown() {
		      return this._menu.classList.contains(CLASS_NAME_SHOW);
		    }
		    _getPlacement() {
		      const parentDropdown = this._parent;
		      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
		        return PLACEMENT_RIGHT;
		      }
		      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
		        return PLACEMENT_LEFT;
		      }
		      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
		        return PLACEMENT_TOPCENTER;
		      }
		      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
		        return PLACEMENT_BOTTOMCENTER;
		      }

		      // We need to trim the value because custom properties can also include spaces
		      const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';
		      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
		        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
		      }
		      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
		    }
		    _detectNavbar() {
		      return this._element.closest(SELECTOR_NAVBAR) !== null;
		    }
		    _getOffset() {
		      const {
		        offset
		      } = this._config;
		      if (typeof offset === 'string') {
		        return offset.split(',').map(value => Number.parseInt(value, 10));
		      }
		      if (typeof offset === 'function') {
		        return popperData => offset(popperData, this._element);
		      }
		      return offset;
		    }
		    _getPopperConfig() {
		      const defaultBsPopperConfig = {
		        placement: this._getPlacement(),
		        modifiers: [{
		          name: 'preventOverflow',
		          options: {
		            boundary: this._config.boundary
		          }
		        }, {
		          name: 'offset',
		          options: {
		            offset: this._getOffset()
		          }
		        }]
		      };

		      // Disable Popper if we have a static display or Dropdown is in Navbar
		      if (this._inNavbar || this._config.display === 'static') {
		        Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // TODO: v6 remove
		        defaultBsPopperConfig.modifiers = [{
		          name: 'applyStyles',
		          enabled: false
		        }];
		      }
		      return {
		        ...defaultBsPopperConfig,
		        ...index_js.execute(this._config.popperConfig, [defaultBsPopperConfig])
		      };
		    }
		    _selectMenuItem({
		      key,
		      target
		    }) {
		      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => index_js.isVisible(element));
		      if (!items.length) {
		        return;
		      }

		      // if target isn't included in items (e.g. when expanding the dropdown)
		      // allow cycling to get the last item in case key equals ARROW_UP_KEY
		      index_js.getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus();
		    }

		    // Static
		    static jQueryInterface(config) {
		      return this.each(function () {
		        const data = Dropdown.getOrCreateInstance(this, config);
		        if (typeof config !== 'string') {
		          return;
		        }
		        if (typeof data[config] === 'undefined') {
		          throw new TypeError(`No method named "${config}"`);
		        }
		        data[config]();
		      });
		    }
		    static clearMenus(event) {
		      if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY) {
		        return;
		      }
		      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
		      for (const toggle of openToggles) {
		        const context = Dropdown.getInstance(toggle);
		        if (!context || context._config.autoClose === false) {
		          continue;
		        }
		        const composedPath = event.composedPath();
		        const isMenuTarget = composedPath.includes(context._menu);
		        if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
		          continue;
		        }

		        // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
		        if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY || /input|select|option|textarea|form/i.test(event.target.tagName))) {
		          continue;
		        }
		        const relatedTarget = {
		          relatedTarget: context._element
		        };
		        if (event.type === 'click') {
		          relatedTarget.clickEvent = event;
		        }
		        context._completeHide(relatedTarget);
		      }
		    }
		    static dataApiKeydownHandler(event) {
		      // If not an UP | DOWN | ESCAPE key => not a dropdown command
		      // If input/textarea && if key is other than ESCAPE => not a dropdown command

		      const isInput = /input|textarea/i.test(event.target.tagName);
		      const isEscapeEvent = event.key === ESCAPE_KEY;
		      const isUpOrDownEvent = [ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key);
		      if (!isUpOrDownEvent && !isEscapeEvent) {
		        return;
		      }
		      if (isInput && !isEscapeEvent) {
		        return;
		      }
		      event.preventDefault();

		      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
		      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE, event.delegateTarget.parentNode);
		      const instance = Dropdown.getOrCreateInstance(getToggleButton);
		      if (isUpOrDownEvent) {
		        event.stopPropagation();
		        instance.show();
		        instance._selectMenuItem(event);
		        return;
		      }
		      if (instance._isShown()) {
		        // else is escape and we check if it is shown
		        event.stopPropagation();
		        instance.hide();
		        getToggleButton.focus();
		      }
		    }
		  }

		  /**
		   * Data API implementation
		   */

		  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE, Dropdown.dataApiKeydownHandler);
		  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
		  EventHandler.on(document, EVENT_CLICK_DATA_API, Dropdown.clearMenus);
		  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
		  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
		    event.preventDefault();
		    Dropdown.getOrCreateInstance(this).toggle();
		  });

		  /**
		   * jQuery
		   */

		  index_js.defineJQueryPlugin(Dropdown);

		  return Dropdown;

		}));
		
	} (dropdown$1));
	return dropdown$1.exports;
}

requireDropdown();

var collapse$1 = {exports: {}};

/*!
  * Bootstrap collapse.js v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
var collapse = collapse$1.exports;

var hasRequiredCollapse;

function requireCollapse () {
	if (hasRequiredCollapse) return collapse$1.exports;
	hasRequiredCollapse = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  module.exports = factory(requireBaseComponent(), requireEventHandler(), requireSelectorEngine(), requireUtil()) ;
		})(collapse, (function (BaseComponent, EventHandler, SelectorEngine, index_js) {
		  /**
		   * --------------------------------------------------------------------------
		   * Bootstrap collapse.js
		   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
		   * --------------------------------------------------------------------------
		   */


		  /**
		   * Constants
		   */

		  const NAME = 'collapse';
		  const DATA_KEY = 'bs.collapse';
		  const EVENT_KEY = `.${DATA_KEY}`;
		  const DATA_API_KEY = '.data-api';
		  const EVENT_SHOW = `show${EVENT_KEY}`;
		  const EVENT_SHOWN = `shown${EVENT_KEY}`;
		  const EVENT_HIDE = `hide${EVENT_KEY}`;
		  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
		  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
		  const CLASS_NAME_SHOW = 'show';
		  const CLASS_NAME_COLLAPSE = 'collapse';
		  const CLASS_NAME_COLLAPSING = 'collapsing';
		  const CLASS_NAME_COLLAPSED = 'collapsed';
		  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
		  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
		  const WIDTH = 'width';
		  const HEIGHT = 'height';
		  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
		  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="collapse"]';
		  const Default = {
		    parent: null,
		    toggle: true
		  };
		  const DefaultType = {
		    parent: '(null|element)',
		    toggle: 'boolean'
		  };

		  /**
		   * Class definition
		   */

		  class Collapse extends BaseComponent {
		    constructor(element, config) {
		      super(element, config);
		      this._isTransitioning = false;
		      this._triggerArray = [];
		      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE);
		      for (const elem of toggleList) {
		        const selector = SelectorEngine.getSelectorFromElement(elem);
		        const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
		        if (selector !== null && filterElement.length) {
		          this._triggerArray.push(elem);
		        }
		      }
		      this._initializeChildren();
		      if (!this._config.parent) {
		        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
		      }
		      if (this._config.toggle) {
		        this.toggle();
		      }
		    }

		    // Getters
		    static get Default() {
		      return Default;
		    }
		    static get DefaultType() {
		      return DefaultType;
		    }
		    static get NAME() {
		      return NAME;
		    }

		    // Public
		    toggle() {
		      if (this._isShown()) {
		        this.hide();
		      } else {
		        this.show();
		      }
		    }
		    show() {
		      if (this._isTransitioning || this._isShown()) {
		        return;
		      }
		      let activeChildren = [];

		      // find active children
		      if (this._config.parent) {
		        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
		          toggle: false
		        }));
		      }
		      if (activeChildren.length && activeChildren[0]._isTransitioning) {
		        return;
		      }
		      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW);
		      if (startEvent.defaultPrevented) {
		        return;
		      }
		      for (const activeInstance of activeChildren) {
		        activeInstance.hide();
		      }
		      const dimension = this._getDimension();
		      this._element.classList.remove(CLASS_NAME_COLLAPSE);
		      this._element.classList.add(CLASS_NAME_COLLAPSING);
		      this._element.style[dimension] = 0;
		      this._addAriaAndCollapsedClass(this._triggerArray, true);
		      this._isTransitioning = true;
		      const complete = () => {
		        this._isTransitioning = false;
		        this._element.classList.remove(CLASS_NAME_COLLAPSING);
		        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW);
		        this._element.style[dimension] = '';
		        EventHandler.trigger(this._element, EVENT_SHOWN);
		      };
		      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
		      const scrollSize = `scroll${capitalizedDimension}`;
		      this._queueCallback(complete, this._element, true);
		      this._element.style[dimension] = `${this._element[scrollSize]}px`;
		    }
		    hide() {
		      if (this._isTransitioning || !this._isShown()) {
		        return;
		      }
		      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE);
		      if (startEvent.defaultPrevented) {
		        return;
		      }
		      const dimension = this._getDimension();
		      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
		      index_js.reflow(this._element);
		      this._element.classList.add(CLASS_NAME_COLLAPSING);
		      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW);
		      for (const trigger of this._triggerArray) {
		        const element = SelectorEngine.getElementFromSelector(trigger);
		        if (element && !this._isShown(element)) {
		          this._addAriaAndCollapsedClass([trigger], false);
		        }
		      }
		      this._isTransitioning = true;
		      const complete = () => {
		        this._isTransitioning = false;
		        this._element.classList.remove(CLASS_NAME_COLLAPSING);
		        this._element.classList.add(CLASS_NAME_COLLAPSE);
		        EventHandler.trigger(this._element, EVENT_HIDDEN);
		      };
		      this._element.style[dimension] = '';
		      this._queueCallback(complete, this._element, true);
		    }
		    _isShown(element = this._element) {
		      return element.classList.contains(CLASS_NAME_SHOW);
		    }

		    // Private
		    _configAfterMerge(config) {
		      config.toggle = Boolean(config.toggle); // Coerce string values
		      config.parent = index_js.getElement(config.parent);
		      return config;
		    }
		    _getDimension() {
		      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
		    }
		    _initializeChildren() {
		      if (!this._config.parent) {
		        return;
		      }
		      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE);
		      for (const element of children) {
		        const selected = SelectorEngine.getElementFromSelector(element);
		        if (selected) {
		          this._addAriaAndCollapsedClass([element], this._isShown(selected));
		        }
		      }
		    }
		    _getFirstLevelChildren(selector) {
		      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
		      // remove children if greater depth
		      return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
		    }
		    _addAriaAndCollapsedClass(triggerArray, isOpen) {
		      if (!triggerArray.length) {
		        return;
		      }
		      for (const element of triggerArray) {
		        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
		        element.setAttribute('aria-expanded', isOpen);
		      }
		    }

		    // Static
		    static jQueryInterface(config) {
		      const _config = {};
		      if (typeof config === 'string' && /show|hide/.test(config)) {
		        _config.toggle = false;
		      }
		      return this.each(function () {
		        const data = Collapse.getOrCreateInstance(this, _config);
		        if (typeof config === 'string') {
		          if (typeof data[config] === 'undefined') {
		            throw new TypeError(`No method named "${config}"`);
		          }
		          data[config]();
		        }
		      });
		    }
		  }

		  /**
		   * Data API implementation
		   */

		  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
		    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
		    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
		      event.preventDefault();
		    }
		    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
		      Collapse.getOrCreateInstance(element, {
		        toggle: false
		      }).toggle();
		    }
		  });

		  /**
		   * jQuery
		   */

		  index_js.defineJQueryPlugin(Collapse);

		  return Collapse;

		}));
		
	} (collapse$1));
	return collapse$1.exports;
}

requireCollapse();

const renderChallenge = ctrl => _ => [
    h('div.challenge-page', {
        hook: {
            destroy: ctrl.onUnmount,
        },
    }, [
        h('div.challenge-page__awaiting', [spinner(), h('span.ms-3', 'Awaiting the opponent...')]),
        h('a.btn.btn-secondary', {
            attrs: { href: url('/') },
        }, 'Cancel'),
    ]),
];

const colors = ['white', 'black'];
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

const invRanks = [...ranks].reverse();
const allKeys = files.flatMap(f => ranks.map(r => (f + r)));
const pos2key = (pos) => pos.every(x => x >= 0 && x <= 7) ? allKeys[8 * pos[0] + pos[1]] : undefined;
const pos2keyUnsafe = (pos) => pos2key(pos);
const key2pos = (k) => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];
const allPos = allKeys.map(key2pos);
const allPosAndKey = allKeys.map((key, i) => ({ key, pos: allPos[i] }));
function memo(f) {
    let v;
    const ret = () => {
        if (v === undefined)
            v = f();
        return v;
    };
    ret.clear = () => {
        v = undefined;
    };
    return ret;
}
const timer = () => {
    let startAt;
    return {
        start() {
            startAt = performance.now();
        },
        cancel() {
            startAt = undefined;
        },
        stop() {
            if (!startAt)
                return 0;
            const time = performance.now() - startAt;
            startAt = undefined;
            return time;
        },
    };
};
const opposite = (c) => (c === 'white' ? 'black' : 'white');
const distanceSq = (pos1, pos2) => (pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2;
const samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
const samePos = (p1, p2) => p1[0] === p2[0] && p1[1] === p2[1];
const posToTranslate = (bounds) => (pos, asWhite) => [
    ((asWhite ? pos[0] : 7 - pos[0]) * bounds.width) / 8,
    ((asWhite ? 7 - pos[1] : pos[1]) * bounds.height) / 8,
];
const translate = (el, pos) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};
const translateAndScale = (el, pos, scale = 1) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
};
const setVisible = (el, v) => {
    el.style.display = v ? '' : 'none';
};
const eventPosition = (e) => {
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if (e.targetTouches?.[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return undefined; // touchend has no position!
};
const isFireMac = memo(() => !('ontouchstart' in window) &&
    ['macintosh', 'firefox'].every(x => navigator.userAgent.toLowerCase().includes(x)));
const isRightButton = (e) => e.button === 2 && !(e.ctrlKey && isFireMac());
const createEl = (tagName, className) => {
    const el = document.createElement(tagName);
    if (className)
        el.className = className;
    return el;
};
function computeSquareCenter(key, asWhite, bounds) {
    const pos = key2pos(key);
    if (!asWhite) {
        pos[0] = 7 - pos[0];
        pos[1] = 7 - pos[1];
    }
    return [
        bounds.left + (bounds.width * pos[0]) / 8 + bounds.width / 16,
        bounds.top + (bounds.height * (7 - pos[1])) / 8 + bounds.height / 16,
    ];
}
const diff = (a, b) => Math.abs(a - b);
const knightDir = (x1, y1, x2, y2) => diff(x1, x2) * diff(y1, y2) === 2;
const rookDir = (x1, y1, x2, y2) => (x1 === x2) !== (y1 === y2);
const bishopDir = (x1, y1, x2, y2) => diff(x1, x2) === diff(y1, y2) && x1 !== x2;
const queenDir = (x1, y1, x2, y2) => rookDir(x1, y1, x2, y2) || bishopDir(x1, y1, x2, y2);
const kingDirNonCastling = (x1, y1, x2, y2) => Math.max(diff(x1, x2), diff(y1, y2)) === 1;
const pawnDirAdvance = (x1, y1, x2, y2, isDirectionUp) => {
    const step = isDirectionUp ? 1 : -1;
    return (x1 === x2 &&
        (y2 === y1 + step ||
            // allow 2 squares from first two ranks, for horde
            (y2 === y1 + 2 * step && (isDirectionUp ? y1 <= 1 : y1 >= 6))));
};
/** Returns all board squares between (x1, y1) and (x2, y2) exclusive,
 *  along a straight line (rook or bishop path). Returns [] if not aligned, or none between.
 */
const squaresBetween = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    // Must be a straight or diagonal line
    if (dx && dy && Math.abs(dx) !== Math.abs(dy))
        return [];
    const stepX = Math.sign(dx), stepY = Math.sign(dy);
    const squares = [];
    let x = x1 + stepX, y = y1 + stepY;
    while (x !== x2 || y !== y2) {
        squares.push([x, y]);
        x += stepX;
        y += stepY;
    }
    return squares.map(pos2key).filter(k => k !== undefined);
};

const anim = (mutation, state) => state.animation.enabled ? animate(mutation, state) : render$2(mutation, state);
function render$2(mutation, state) {
    const result = mutation(state);
    state.dom.redraw();
    return result;
}
const makePiece = (key, piece) => ({
    key: key,
    pos: key2pos(key),
    piece: piece,
});
const closer = (piece, pieces) => pieces.sort((p1, p2) => distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos))[0];
function computePlan(prevPieces, current) {
    const anims = new Map(), animedOrigs = [], fadings = new Map(), missings = [], news = [], prePieces = new Map();
    let curP, preP, vector;
    for (const [k, p] of prevPieces) {
        prePieces.set(k, makePiece(k, p));
    }
    for (const key of allKeys) {
        curP = current.pieces.get(key);
        preP = prePieces.get(key);
        if (curP) {
            if (preP) {
                if (!samePiece(curP, preP.piece)) {
                    missings.push(preP);
                    news.push(makePiece(key, curP));
                }
            }
            else
                news.push(makePiece(key, curP));
        }
        else if (preP)
            missings.push(preP);
    }
    for (const newP of news) {
        preP = closer(newP, missings.filter(p => samePiece(newP.piece, p.piece)));
        if (preP) {
            vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
            anims.set(newP.key, vector.concat(vector));
            animedOrigs.push(preP.key);
        }
    }
    for (const p of missings) {
        if (!animedOrigs.includes(p.key))
            fadings.set(p.key, p.piece);
    }
    return {
        anims: anims,
        fadings: fadings,
    };
}
function step(state, now) {
    const cur = state.animation.current;
    if (cur === undefined) {
        // animation was canceled :(
        if (!state.dom.destroyed)
            state.dom.redrawNow();
        return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
        state.animation.current = undefined;
        state.dom.redrawNow();
    }
    else {
        const ease = easing(rest);
        for (const cfg of cur.plan.anims.values()) {
            cfg[2] = cfg[0] * ease;
            cfg[3] = cfg[1] * ease;
        }
        state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
        requestAnimationFrame((now = performance.now()) => step(state, now));
    }
}
function animate(mutation, state) {
    // clone state before mutating it
    const prevPieces = new Map(state.pieces);
    const result = mutation(state);
    const plan = computePlan(prevPieces, state);
    if (plan.anims.size || plan.fadings.size) {
        const alreadyRunning = state.animation.current && state.animation.current.start;
        state.animation.current = {
            start: performance.now(),
            frequency: 1 / state.animation.duration,
            plan: plan,
        };
        if (!alreadyRunning)
            step(state, performance.now());
    }
    else {
        // don't animate, just render right away
        state.dom.redraw();
    }
    return result;
}
// https://gist.github.com/gre/1650294
const easing = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

const pawn = (ctx) => diff(ctx.orig.pos[0], ctx.dest.pos[0]) <= 1 &&
    (diff(ctx.orig.pos[0], ctx.dest.pos[0]) === 1
        ? ctx.dest.pos[1] === ctx.orig.pos[1] + (ctx.color === 'white' ? 1 : -1)
        : pawnDirAdvance(...ctx.orig.pos, ...ctx.dest.pos, ctx.color === 'white'));
const knight = (ctx) => knightDir(...ctx.orig.pos, ...ctx.dest.pos);
const bishop = (ctx) => bishopDir(...ctx.orig.pos, ...ctx.dest.pos);
const rook = (ctx) => rookDir(...ctx.orig.pos, ...ctx.dest.pos);
const queen = (ctx) => bishop(ctx) || rook(ctx);
const king = (ctx) => kingDirNonCastling(...ctx.orig.pos, ...ctx.dest.pos) ||
    (ctx.orig.pos[1] === ctx.dest.pos[1] &&
        ctx.orig.pos[1] === (ctx.color === 'white' ? 0 : 7) &&
        ((ctx.orig.pos[0] === 4 &&
            ((ctx.dest.pos[0] === 2 && ctx.rookFilesFriendlies.includes(0)) ||
                (ctx.dest.pos[0] === 6 && ctx.rookFilesFriendlies.includes(7)))) ||
            ctx.rookFilesFriendlies.includes(ctx.dest.pos[0])));
const mobilityByRole = { pawn, knight, bishop, rook, queen, king };
function premove(state, key) {
    const pieces = state.pieces;
    const piece = pieces.get(key);
    if (!piece || piece.color === state.turnColor)
        return [];
    const color = piece.color, friendlies = new Map([...pieces].filter(([_, p]) => p.color === color)), enemies = new Map([...pieces].filter(([_, p]) => p.color === opposite(color))), orig = { key, pos: key2pos(key) }, mobility = (ctx) => mobilityByRole[piece.role](ctx) && state.premovable.additionalPremoveRequirements(ctx), partialCtx = {
        orig,
        role: piece.role,
        allPieces: pieces,
        friendlies: friendlies,
        enemies: enemies,
        color: color,
        rookFilesFriendlies: Array.from(pieces)
            .filter(([k, p]) => k[1] === (color === 'white' ? '1' : '8') && p.color === color && p.role === 'rook')
            .map(([k]) => key2pos(k)[0]),
        lastMove: state.lastMove,
    };
    // todo - remove more properties from MobilityContext that aren't used in this file, and adjust as needed in lila.
    return allPosAndKey.filter(dest => mobility({ ...partialCtx, dest })).map(pk => pk.key);
}

function callUserFunction(f, ...args) {
    if (f)
        setTimeout(() => f(...args), 1);
}
function toggleOrientation(state) {
    state.orientation = opposite(state.orientation);
    state.animation.current = state.draggable.current = state.selected = undefined;
}
function setPieces(state, pieces) {
    for (const [key, piece] of pieces) {
        if (piece)
            state.pieces.set(key, piece);
        else
            state.pieces.delete(key);
    }
}
function setCheck(state, color) {
    state.check = undefined;
    if (color === true)
        color = state.turnColor;
    if (color)
        for (const [k, p] of state.pieces) {
            if (p.role === 'king' && p.color === color) {
                state.check = k;
            }
        }
}
function setPremove(state, orig, dest, meta) {
    unsetPredrop(state);
    state.premovable.current = [orig, dest];
    callUserFunction(state.premovable.events.set, orig, dest, meta);
}
function unsetPremove(state) {
    if (state.premovable.current) {
        state.premovable.current = undefined;
        callUserFunction(state.premovable.events.unset);
    }
}
function setPredrop(state, role, key) {
    unsetPremove(state);
    state.predroppable.current = { role, key };
    callUserFunction(state.predroppable.events.set, role, key);
}
function unsetPredrop(state) {
    const pd = state.predroppable;
    if (pd.current) {
        pd.current = undefined;
        callUserFunction(pd.events.unset);
    }
}
function tryAutoCastle(state, orig, dest) {
    if (!state.autoCastle)
        return false;
    const king = state.pieces.get(orig);
    if (!king || king.role !== 'king')
        return false;
    const origPos = key2pos(orig);
    const destPos = key2pos(dest);
    if ((origPos[1] !== 0 && origPos[1] !== 7) || origPos[1] !== destPos[1])
        return false;
    if (origPos[0] === 4 && !state.pieces.has(dest)) {
        if (destPos[0] === 6)
            dest = pos2keyUnsafe([7, destPos[1]]);
        else if (destPos[0] === 2)
            dest = pos2keyUnsafe([0, destPos[1]]);
    }
    const rook = state.pieces.get(dest);
    if (!rook || rook.color !== king.color || rook.role !== 'rook')
        return false;
    state.pieces.delete(orig);
    state.pieces.delete(dest);
    if (origPos[0] < destPos[0]) {
        state.pieces.set(pos2keyUnsafe([6, destPos[1]]), king);
        state.pieces.set(pos2keyUnsafe([5, destPos[1]]), rook);
    }
    else {
        state.pieces.set(pos2keyUnsafe([2, destPos[1]]), king);
        state.pieces.set(pos2keyUnsafe([3, destPos[1]]), rook);
    }
    return true;
}
function baseMove(state, orig, dest) {
    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece)
        return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
    if (dest === state.selected)
        unselect(state);
    callUserFunction(state.events.move, orig, dest, captured);
    if (!tryAutoCastle(state, orig, dest)) {
        state.pieces.set(dest, origPiece);
        state.pieces.delete(orig);
    }
    state.lastMove = [orig, dest];
    state.check = undefined;
    callUserFunction(state.events.change);
    return captured || true;
}
function baseNewPiece(state, piece, key, force) {
    if (state.pieces.has(key)) {
        if (force)
            state.pieces.delete(key);
        else
            return false;
    }
    callUserFunction(state.events.dropNewPiece, piece, key);
    state.pieces.set(key, piece);
    state.lastMove = [key];
    state.check = undefined;
    callUserFunction(state.events.change);
    state.movable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    return true;
}
function baseUserMove(state, orig, dest) {
    const result = baseMove(state, orig, dest);
    if (result) {
        state.movable.dests = undefined;
        state.turnColor = opposite(state.turnColor);
        state.animation.current = undefined;
    }
    return result;
}
function userMove(state, orig, dest) {
    if (canMove(state, orig, dest)) {
        const result = baseUserMove(state, orig, dest);
        if (result) {
            const holdTime = state.hold.stop();
            unselect(state);
            const metadata = {
                premove: false,
                ctrlKey: state.stats.ctrlKey,
                holdTime,
            };
            if (result !== true)
                metadata.captured = result;
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            return true;
        }
    }
    else if (canPremove(state, orig, dest)) {
        setPremove(state, orig, dest, {
            ctrlKey: state.stats.ctrlKey,
        });
        unselect(state);
        return true;
    }
    unselect(state);
    return false;
}
function dropNewPiece(state, orig, dest, force) {
    const piece = state.pieces.get(orig);
    if (piece && (canDrop(state, orig, dest) || force)) {
        state.pieces.delete(orig);
        baseNewPiece(state, piece, dest, force);
        callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
            premove: false,
            predrop: false,
        });
    }
    else if (piece && canPredrop(state, orig, dest)) {
        setPredrop(state, piece.role, dest);
    }
    else {
        unsetPremove(state);
        unsetPredrop(state);
    }
    state.pieces.delete(orig);
    unselect(state);
}
function selectSquare(state, key, force) {
    callUserFunction(state.events.select, key);
    if (state.selected) {
        if (state.selected === key && !state.draggable.enabled) {
            unselect(state);
            state.hold.cancel();
            return;
        }
        else if ((state.selectable.enabled || force) && state.selected !== key) {
            if (userMove(state, state.selected, key)) {
                state.stats.dragged = false;
                return;
            }
        }
    }
    if ((state.selectable.enabled || state.draggable.enabled) &&
        (isMovable(state, key) || isPremovable(state, key))) {
        setSelected(state, key);
        state.hold.start();
    }
}
function setSelected(state, key) {
    state.selected = key;
    if (!isPremovable(state, key))
        state.premovable.dests = undefined;
    else if (!state.premovable.customDests)
        state.premovable.dests = premove(state, key);
    // calculate chess premoves if custom premoves are not passed
}
function unselect(state) {
    state.selected = undefined;
    state.premovable.dests = undefined;
    state.hold.cancel();
}
function isMovable(state, orig) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        (state.movable.color === 'both' ||
            (state.movable.color === piece.color && state.turnColor === piece.color)));
}
const canMove = (state, orig, dest) => orig !== dest &&
    isMovable(state, orig) &&
    (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest));
function canDrop(state, orig, dest) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        (orig === dest || !state.pieces.has(dest)) &&
        (state.movable.color === 'both' ||
            (state.movable.color === piece.color && state.turnColor === piece.color)));
}
function isPremovable(state, orig) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        state.premovable.enabled &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color);
}
const canPremove = (state, orig, dest) => orig !== dest &&
    isPremovable(state, orig) &&
    (state.premovable.customDests?.get(orig) ?? premove(state, orig)).includes(dest);
function canPredrop(state, orig, dest) {
    const piece = state.pieces.get(orig);
    const destPiece = state.pieces.get(dest);
    return (!!piece &&
        (!destPiece || destPiece.color !== state.movable.color) &&
        state.predroppable.enabled &&
        (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color);
}
function isDraggable(state, orig) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        state.draggable.enabled &&
        (state.movable.color === 'both' ||
            (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled))));
}
function playPremove(state) {
    const move = state.premovable.current;
    if (!move)
        return false;
    const orig = move[0], dest = move[1];
    let success = false;
    if (canMove(state, orig, dest)) {
        const result = baseUserMove(state, orig, dest);
        if (result) {
            const metadata = { premove: true };
            if (result !== true)
                metadata.captured = result;
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            success = true;
        }
    }
    unsetPremove(state);
    return success;
}
function playPredrop(state, validate) {
    const drop = state.predroppable.current;
    let success = false;
    if (!drop)
        return false;
    if (validate(drop)) {
        const piece = {
            role: drop.role,
            color: state.movable.color,
        };
        if (baseNewPiece(state, piece, drop.key)) {
            callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
                premove: false,
                predrop: true,
            });
            success = true;
        }
    }
    unsetPredrop(state);
    return success;
}
function cancelMove(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
}
function stop(state) {
    state.movable.color = state.movable.dests = state.animation.current = undefined;
    cancelMove(state);
}
function getKeyAtDomPos(pos, asWhite, bounds) {
    let file = Math.floor((8 * (pos[0] - bounds.left)) / bounds.width);
    if (!asWhite)
        file = 7 - file;
    let rank = 7 - Math.floor((8 * (pos[1] - bounds.top)) / bounds.height);
    if (!asWhite)
        rank = 7 - rank;
    return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? pos2key([file, rank]) : undefined;
}
function getSnappedKeyAtDomPos(orig, pos, asWhite, bounds) {
    const origPos = key2pos(orig);
    const validSnapPos = allPos.filter(pos2 => samePos(origPos, pos2) ||
        queenDir(origPos[0], origPos[1], pos2[0], pos2[1]) ||
        knightDir(origPos[0], origPos[1], pos2[0], pos2[1]));
    const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2keyUnsafe(pos2), asWhite, bounds));
    const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
    const [, closestSnapIndex] = validSnapDistances.reduce((a, b, index) => (a[0] < b ? a : [b, index]), [validSnapDistances[0], 0]);
    return pos2key(validSnapPos[closestSnapIndex]);
}
const whitePov = (s) => s.orientation === 'white';

const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const roles = {
    p: 'pawn',
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
};
const letters = {
    pawn: 'p',
    rook: 'r',
    knight: 'n',
    bishop: 'b',
    queen: 'q',
    king: 'k',
};
function read(fen) {
    if (fen === 'start')
        fen = initial;
    const pieces = new Map();
    let row = 7, col = 0;
    for (const c of fen) {
        switch (c) {
            case ' ':
            case '[':
                return pieces;
            case '/':
                --row;
                if (row < 0)
                    return pieces;
                col = 0;
                break;
            case '~': {
                const k = pos2key([col - 1, row]);
                const piece = k && pieces.get(k);
                if (piece)
                    piece.promoted = true;
                break;
            }
            default: {
                const nb = c.charCodeAt(0);
                if (nb < 57)
                    col += nb - 48;
                else {
                    const role = c.toLowerCase();
                    const key = pos2key([col, row]);
                    if (key)
                        pieces.set(key, {
                            role: roles[role],
                            color: c === role ? 'black' : 'white',
                        });
                    ++col;
                }
            }
        }
    }
    return pieces;
}
function write(pieces) {
    return invRanks
        .map(y => files
        .map(x => {
        const piece = pieces.get((x + y));
        if (piece) {
            let p = letters[piece.role];
            if (piece.color === 'white')
                p = p.toUpperCase();
            if (piece.promoted)
                p += '~';
            return p;
        }
        else
            return '1';
    })
        .join(''))
        .join('/')
        .replace(/1{2,}/g, s => s.length.toString());
}

function applyAnimation(state, config) {
    if (config.animation) {
        deepMerge(state.animation, config.animation);
        // no need for such short animations
        if ((state.animation.duration || 0) < 70)
            state.animation.enabled = false;
    }
}
function configure(state, config) {
    // don't merge destinations and autoShapes. Just override.
    if (config.movable?.dests)
        state.movable.dests = undefined;
    if (config.drawable?.autoShapes)
        state.drawable.autoShapes = [];
    deepMerge(state, config);
    // if a fen was provided, replace the pieces
    if (config.fen) {
        state.pieces = read(config.fen);
        state.drawable.shapes = config.drawable?.shapes || [];
    }
    // apply config values that could be undefined yet meaningful
    if ('check' in config)
        setCheck(state, config.check || false);
    if ('lastMove' in config && !config.lastMove)
        state.lastMove = undefined;
    // in case of ZH drop last move, there's a single square.
    // if the previous last move had two squares,
    // the merge algorithm will incorrectly keep the second square.
    else if (config.lastMove)
        state.lastMove = config.lastMove;
    // fix move/premove dests
    if (state.selected)
        setSelected(state, state.selected);
    applyAnimation(state, config);
    if (!state.movable.rookCastle && state.movable.dests) {
        const rank = state.movable.color === 'white' ? '1' : '8', kingStartPos = ('e' + rank), dests = state.movable.dests.get(kingStartPos), king = state.pieces.get(kingStartPos);
        if (!dests || !king || king.role !== 'king')
            return;
        state.movable.dests.set(kingStartPos, dests.filter(d => !(d === 'a' + rank && dests.includes(('c' + rank))) &&
            !(d === 'h' + rank && dests.includes(('g' + rank)))));
    }
}
function deepMerge(base, extend) {
    for (const key in extend) {
        if (key === '__proto__' || key === 'constructor' || !Object.prototype.hasOwnProperty.call(extend, key))
            continue;
        if (Object.prototype.hasOwnProperty.call(base, key) &&
            isPlainObject(base[key]) &&
            isPlainObject(extend[key]))
            deepMerge(base[key], extend[key]);
        else
            base[key] = extend[key];
    }
}
function isPlainObject(o) {
    if (typeof o !== 'object' || o === null)
        return false;
    const proto = Object.getPrototypeOf(o);
    return proto === Object.prototype || proto === null;
}

const brushes = ['green', 'red', 'blue', 'yellow'];
function start$2(state, e) {
    // support one finger touch only
    if (e.touches && e.touches.length > 1)
        return;
    e.stopPropagation();
    e.preventDefault();
    if (e.ctrlKey) {
        unselect(state);
    }
    else {
        cancelMove(state);
    }
    const pos = eventPosition(e), orig = getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
    if (!orig)
        return;
    state.drawable.current = {
        orig,
        pos,
        brush: eventBrush(e),
        snapToValidMove: state.drawable.defaultSnapToValidMove,
    };
    processDraw(state);
}
function processDraw(state) {
    requestAnimationFrame(() => {
        const cur = state.drawable.current;
        if (cur) {
            const keyAtDomPos = getKeyAtDomPos(cur.pos, whitePov(state), state.dom.bounds());
            if (!keyAtDomPos) {
                cur.snapToValidMove = false;
            }
            const mouseSq = cur.snapToValidMove
                ? getSnappedKeyAtDomPos(cur.orig, cur.pos, whitePov(state), state.dom.bounds())
                : keyAtDomPos;
            if (mouseSq !== cur.mouseSq) {
                cur.mouseSq = mouseSq;
                cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
                state.dom.redrawNow();
            }
            processDraw(state);
        }
    });
}
function move$1(state, e) {
    if (state.drawable.current)
        state.drawable.current.pos = eventPosition(e);
}
function end$1(state) {
    const cur = state.drawable.current;
    if (cur) {
        if (cur.mouseSq)
            addShape(state.drawable, cur);
        cancel$1(state);
    }
}
function cancel$1(state) {
    if (state.drawable.current) {
        state.drawable.current = undefined;
        state.dom.redraw();
    }
}
function clear(state) {
    if (state.drawable.shapes.length) {
        state.drawable.shapes = [];
        state.dom.redraw();
        onChange(state.drawable);
    }
}
const sameEndpoints = (s1, s2) => s1.orig === s2.orig && s1.dest === s2.dest;
const sameColor = (s1, s2) => s1.brush === s2.brush;
function eventBrush(e) {
    const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
    const modB = e.altKey || e.metaKey || e.getModifierState?.('AltGraph');
    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
}
function addShape(drawable, cur) {
    const similar = drawable.shapes.find(s => sameEndpoints(s, cur));
    if (similar)
        drawable.shapes = drawable.shapes.filter(s => !sameEndpoints(s, cur));
    if (!similar || !sameColor(similar, cur))
        drawable.shapes.push({
            orig: cur.orig,
            dest: cur.dest,
            brush: cur.brush,
        });
    onChange(drawable);
}
function onChange(drawable) {
    if (drawable.onChange)
        drawable.onChange(drawable.shapes);
}

function start$1(s, e) {
    if (!(s.trustAllEvents || e.isTrusted))
        return; // only trust when trustAllEvents is enabled
    if (e.buttons !== undefined && e.buttons > 1)
        return; // only touch or left click
    if (e.touches && e.touches.length > 1)
        return; // support one finger touch only
    const bounds = s.dom.bounds(), position = eventPosition(e), orig = getKeyAtDomPos(position, whitePov(s), bounds);
    if (!orig)
        return;
    const piece = s.pieces.get(orig);
    const previouslySelected = s.selected;
    if (!previouslySelected &&
        s.drawable.enabled &&
        (s.drawable.eraseOnMovablePieceClick || !piece || piece.color !== s.turnColor))
        clear(s);
    // Prevent touch scroll and create no corresponding mouse event, if there
    // is an intent to interact with the board.
    if (e.cancelable !== false &&
        (!e.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position)))
        e.preventDefault();
    else if (e.touches)
        return; // Handle only corresponding mouse event https://github.com/lichess-org/chessground/pull/268
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    s.stats.ctrlKey = e.ctrlKey;
    if (s.selected && canMove(s, s.selected, orig)) {
        anim(state => selectSquare(state, orig), s);
    }
    else {
        selectSquare(s, orig);
    }
    const stillSelected = s.selected === orig;
    const element = pieceElementByKey(s, orig);
    if (piece && element && stillSelected && isDraggable(s, orig)) {
        s.draggable.current = {
            orig,
            piece,
            origPos: position,
            pos: position,
            started: s.draggable.autoDistance && s.stats.dragged,
            element,
            previouslySelected,
            originTarget: e.target,
            keyHasChanged: false,
        };
        element.cgDragging = true;
        element.classList.add('dragging');
        // place ghost
        const ghost = s.dom.elements.ghost;
        if (ghost) {
            ghost.className = `ghost ${piece.color} ${piece.role}`;
            translate(ghost, posToTranslate(bounds)(key2pos(orig), whitePov(s)));
            setVisible(ghost, true);
        }
        processDrag(s);
    }
    else {
        if (hadPremove)
            unsetPremove(s);
        if (hadPredrop)
            unsetPredrop(s);
    }
    s.dom.redraw();
}
function pieceCloseTo(s, pos) {
    const asWhite = whitePov(s), bounds = s.dom.bounds(), radiusSq = Math.pow((s.touchIgnoreRadius * bounds.width) / 16, 2) * 2;
    for (const key of s.pieces.keys()) {
        const center = computeSquareCenter(key, asWhite, bounds);
        if (distanceSq(center, pos) <= radiusSq)
            return true;
    }
    return false;
}
function dragNewPiece(s, piece, e, force) {
    const key = 'a0';
    s.pieces.set(key, piece);
    s.dom.redraw();
    const position = eventPosition(e);
    s.draggable.current = {
        orig: key,
        piece,
        origPos: position,
        pos: position,
        started: true,
        element: () => pieceElementByKey(s, key),
        originTarget: e.target,
        newPiece: true,
        force: !!force,
        keyHasChanged: false,
    };
    processDrag(s);
}
function processDrag(s) {
    requestAnimationFrame(() => {
        const cur = s.draggable.current;
        if (!cur)
            return;
        // cancel animations while dragging
        if (s.animation.current?.plan.anims.has(cur.orig))
            s.animation.current = undefined;
        // if moving piece is gone, cancel
        const origPiece = s.pieces.get(cur.orig);
        if (!origPiece || !samePiece(origPiece, cur.piece))
            cancel(s);
        else {
            if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2))
                cur.started = true;
            if (cur.started) {
                // support lazy elements
                if (typeof cur.element === 'function') {
                    const found = cur.element();
                    if (!found)
                        return;
                    found.cgDragging = true;
                    found.classList.add('dragging');
                    cur.element = found;
                }
                const bounds = s.dom.bounds();
                translate(cur.element, [
                    cur.pos[0] - bounds.left - bounds.width / 16,
                    cur.pos[1] - bounds.top - bounds.height / 16,
                ]);
                if (s.jsHover)
                    handleJsHover(s, cur);
                else
                    cur.keyHasChanged || (cur.keyHasChanged = cur.orig !== getKeyAtDomPos(cur.pos, whitePov(s), bounds));
            }
        }
        processDrag(s);
    });
}
function handleJsHover(s, cur) {
    const hoveredKey = getKeyAtDomPos(cur.pos, whitePov(s), s.dom.bounds());
    if (cur.orig !== hoveredKey) {
        cur.keyHasChanged = true;
        if (hoveredKey) {
            const isValidMove = s.movable.dests?.get(cur.orig)?.includes(hoveredKey) ?? s.premovable.dests?.includes(hoveredKey);
            if (isValidMove) {
                const hoveredValidDestSquare = s.dom.elements.board.querySelector(`.move-dest[data-key="${hoveredKey}"], .premove-dest[data-key="${hoveredKey}"]`);
                if (hoveredValidDestSquare && !hoveredValidDestSquare.classList.contains('hover')) {
                    resetHoverState(s);
                    hoveredValidDestSquare.classList.add('hover');
                }
            }
            else {
                resetHoverState(s);
            }
        }
    }
    else {
        resetHoverState(s);
    }
}
function resetHoverState(s) {
    const squares = s.dom.elements.board.querySelectorAll(`.move-dest, .premove-dest`);
    if (squares.length > 0) {
        squares.forEach(sq => sq.classList.remove('hover'));
    }
}
function move(s, e) {
    // support one finger touch only
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
        s.draggable.current.pos = eventPosition(e);
    }
}
function end(s, e) {
    const cur = s.draggable.current;
    if (!cur)
        return;
    // create no corresponding mouse event
    if (e.type === 'touchend' && e.cancelable !== false)
        e.preventDefault();
    // comparing with the origin target is an easy way to test that the end event
    // has the same touch origin
    if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.newPiece) {
        s.draggable.current = undefined;
        return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    // touchend has no position; so use the last touchmove position instead
    const eventPos = eventPosition(e) || cur.pos;
    const dest = getKeyAtDomPos(eventPos, whitePov(s), s.dom.bounds());
    if (dest && cur.started && cur.orig !== dest) {
        if (cur.newPiece)
            dropNewPiece(s, cur.orig, dest, cur.force);
        else {
            s.stats.ctrlKey = e.ctrlKey;
            if (userMove(s, cur.orig, dest))
                s.stats.dragged = true;
        }
    }
    else if (cur.newPiece) {
        s.pieces.delete(cur.orig);
    }
    else if (s.draggable.deleteOnDropOff && !dest) {
        s.pieces.delete(cur.orig);
        callUserFunction(s.events.change);
    }
    if ((cur.orig === cur.previouslySelected || cur.keyHasChanged) && (cur.orig === dest || !dest))
        unselect(s);
    else if (!s.selectable.enabled)
        unselect(s);
    removeDragElements(s);
    s.draggable.current = undefined;
    s.dom.redraw();
}
function cancel(s) {
    const cur = s.draggable.current;
    if (cur) {
        if (cur.newPiece)
            s.pieces.delete(cur.orig);
        s.draggable.current = undefined;
        unselect(s);
        removeDragElements(s);
        s.dom.redraw();
    }
}
function removeDragElements(s) {
    const e = s.dom.elements;
    if (e.ghost)
        setVisible(e.ghost, false);
}
function pieceElementByKey(s, key) {
    let el = s.dom.elements.board.firstChild;
    while (el) {
        if (el.cgKey === key && el.tagName === 'PIECE')
            return el;
        el = el.nextSibling;
    }
    return undefined;
}

function explosion(state, keys) {
    state.exploding = { stage: 1, keys };
    state.dom.redraw();
    setTimeout(() => {
        setStage(state, 2);
        setTimeout(() => setStage(state, undefined), 120);
    }, 120);
}
function setStage(state, stage) {
    if (state.exploding) {
        if (stage)
            state.exploding.stage = stage;
        else
            state.exploding = undefined;
        state.dom.redraw();
    }
}

// see API types and documentations in dts/api.d.ts
function start(state, redrawAll) {
    function toggleOrientation$1() {
        toggleOrientation(state);
        redrawAll();
    }
    return {
        set(config) {
            if (config.orientation && config.orientation !== state.orientation)
                toggleOrientation$1();
            applyAnimation(state, config);
            (config.fen ? anim : render$2)(state => configure(state, config), state);
        },
        state,
        getFen: () => write(state.pieces),
        toggleOrientation: toggleOrientation$1,
        setPieces(pieces) {
            anim(state => setPieces(state, pieces), state);
        },
        selectSquare(key, force) {
            if (key)
                anim(state => selectSquare(state, key, force), state);
            else if (state.selected) {
                unselect(state);
                state.dom.redraw();
            }
        },
        move(orig, dest) {
            anim(state => baseMove(state, orig, dest), state);
        },
        newPiece(piece, key) {
            anim(state => baseNewPiece(state, piece, key), state);
        },
        playPremove() {
            if (state.premovable.current) {
                if (anim(playPremove, state))
                    return true;
                // if the premove couldn't be played, redraw to clear it up
                state.dom.redraw();
            }
            return false;
        },
        playPredrop(validate) {
            if (state.predroppable.current) {
                const result = playPredrop(state, validate);
                state.dom.redraw();
                return result;
            }
            return false;
        },
        cancelPremove() {
            render$2(unsetPremove, state);
        },
        cancelPredrop() {
            render$2(unsetPredrop, state);
        },
        cancelMove() {
            render$2(state => {
                cancelMove(state);
                cancel(state);
            }, state);
        },
        stop() {
            render$2(state => {
                stop(state);
                cancel(state);
            }, state);
        },
        explode(keys) {
            explosion(state, keys);
        },
        setAutoShapes(shapes) {
            render$2(state => (state.drawable.autoShapes = shapes), state);
        },
        setShapes(shapes) {
            render$2(state => (state.drawable.shapes = shapes.slice()), state);
        },
        getKeyAtDomPos(pos) {
            return getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
        },
        redrawAll,
        dragNewPiece(piece, event, force) {
            dragNewPiece(state, piece, event, force);
        },
        destroy() {
            stop(state);
            state.dom.unbind?.();
            state.dom.destroyed = true;
        },
    };
}

// append and remove only. No updates.
function syncShapes$1(shapes, root, renderShape) {
    const hashesInDom = new Map(), // by hash
    toRemove = [];
    for (const sc of shapes)
        hashesInDom.set(sc.hash, false);
    let el = root.firstElementChild, elHash;
    while (el) {
        elHash = el.getAttribute('cgHash');
        // found a shape element that's here to stay
        if (hashesInDom.has(elHash))
            hashesInDom.set(elHash, true);
        // or remove it
        else
            toRemove.push(el);
        el = el.nextElementSibling;
    }
    // remove old shapes
    for (const el of toRemove)
        root.removeChild(el);
    // insert shapes that are not yet in dom
    for (const sc of shapes) {
        if (!hashesInDom.get(sc.hash))
            root.appendChild(renderShape(sc));
    }
}

function render$1(state, autoPieceEl) {
    const autoPieces = state.drawable.autoShapes.filter(autoShape => autoShape.piece);
    const autoPieceShapes = autoPieces.map((s) => {
        return {
            shape: s,
            hash: hash(s),
            current: false,
            pendingErase: false,
        };
    });
    syncShapes$1(autoPieceShapes, autoPieceEl, shape => renderShape$1(state, shape, state.dom.bounds()));
}
function renderResized$1(state) {
    const asWhite = whitePov(state), posToTranslate$1 = posToTranslate(state.dom.bounds());
    let el = state.dom.elements.autoPieces?.firstChild;
    while (el) {
        translateAndScale(el, posToTranslate$1(key2pos(el.cgKey), asWhite), el.cgScale);
        el = el.nextSibling;
    }
}
function renderShape$1(state, { shape, hash }, bounds) {
    const orig = shape.orig;
    const role = shape.piece?.role;
    const color = shape.piece?.color;
    const scale = shape.piece?.scale;
    const pieceEl = createEl('piece', `${role} ${color}`);
    pieceEl.setAttribute('cgHash', hash);
    pieceEl.cgKey = orig;
    pieceEl.cgScale = scale;
    translateAndScale(pieceEl, posToTranslate(bounds)(key2pos(orig), whitePov(state)), scale);
    return pieceEl;
}
const hash = (autoPiece) => [autoPiece.orig, autoPiece.piece?.role, autoPiece.piece?.color, autoPiece.piece?.scale].join(',');

function drop(s, e) {
    if (!s.dropmode.active)
        return;
    unsetPremove(s);
    unsetPredrop(s);
    const piece = s.dropmode.piece;
    if (piece) {
        s.pieces.set('a0', piece);
        const position = eventPosition(e);
        const dest = position && getKeyAtDomPos(position, whitePov(s), s.dom.bounds());
        if (dest)
            dropNewPiece(s, 'a0', dest);
    }
    s.dom.redraw();
}

function bindBoard(s, onResize) {
    const boardEl = s.dom.elements.board;
    if ('ResizeObserver' in window)
        new ResizeObserver(onResize).observe(s.dom.elements.wrap);
    if (s.disableContextMenu || s.drawable.enabled) {
        boardEl.addEventListener('contextmenu', e => e.preventDefault());
    }
    if (s.viewOnly)
        return;
    // Cannot be passive, because we prevent touch scrolling and dragging of
    // selected elements.
    const onStart = startDragOrDraw(s);
    boardEl.addEventListener('touchstart', onStart, {
        passive: false,
    });
    boardEl.addEventListener('mousedown', onStart, {
        passive: false,
    });
}
// returns the unbind function
function bindDocument(s, onResize) {
    const unbinds = [];
    // Old versions of Edge and Safari do not support ResizeObserver. Send
    // chessground.resize if a user action has changed the bounds of the board.
    if (!('ResizeObserver' in window))
        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
    if (!s.viewOnly) {
        const onmove = dragOrDraw(s, move, move$1);
        const onend = dragOrDraw(s, end, end$1);
        for (const ev of ['touchmove', 'mousemove'])
            unbinds.push(unbindable(document, ev, onmove));
        for (const ev of ['touchend', 'mouseup'])
            unbinds.push(unbindable(document, ev, onend));
        const onScroll = () => s.dom.bounds.clear();
        unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
        unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
    }
    return () => unbinds.forEach(f => f());
}
function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback, options);
}
const startDragOrDraw = (s) => e => {
    if (s.draggable.current)
        cancel(s);
    else if (s.drawable.current)
        cancel$1(s);
    else if (e.shiftKey || isRightButton(e)) {
        if (s.drawable.enabled)
            start$2(s, e);
    }
    else if (!s.viewOnly) {
        if (s.dropmode.active)
            drop(s, e);
        else
            start$1(s, e);
    }
};
const dragOrDraw = (s, withDrag, withDraw) => e => {
    if (s.drawable.current) {
        if (s.drawable.enabled)
            withDraw(s, e);
    }
    else if (!s.viewOnly)
        withDrag(s, e);
};

const pieceMap = {
    P: 'Pawn',
    N: 'Knight',
    B: 'Bishop',
    R: 'Rook',
    Q: 'Queen',
    K: 'King',
};
function fenToScene(fen, scene, pieces, materials) {
    // Remove clones previously created.
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const child = scene.children[i];
        if (child.userData?.isFenClone) {
            scene.remove(child);
        }
    }
    // Parse FEN and add pieces to the scene (creating clones of the original meshes)
    const rows = fen.split(' ')[0].split('/');
    for (let r = 0; r < 8; r++) {
        let c = 0;
        for (const char of rows[r]) {
            if (char >= '1' && char <= '8') {
                c += Number.parseInt(char, 10);
            }
            else {
                const pieceMesh = pieces.get(pieceMap[char.toUpperCase()]);
                if (pieceMesh) {
                    const clone = pieceMesh.clone();
                    clone.userData.isFenClone = true;
                    clone.position.set(c - 3.5, 0, r - 3.5);
                    clone.name = `${char}`; // Name the piece for later reference (e.g., "P" for white pawn, "p" for black pawn)
                    // Reminder: X: horizontal positive to the right, Y: vertical positive up, Z: horizontal positive towards the camera
                    const materialName = char === char.toUpperCase() ? 'white piece' : 'black piece';
                    const material = materials.get(materialName);
                    if (material) {
                        clone.material = material.clone();
                    }
                    else if (Array.isArray(clone.material)) {
                        clone.material = clone.material.map(m => m.clone());
                    }
                    else {
                        clone.material = clone.material.clone();
                    }
                    clone.visible = true;
                    scene.add(clone);
                }
                c++;
            }
        }
    }
}

const pieceCodes$1 = new Set(['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p']);
const hoverHighlightColor = new THREE.Color(9425919);
const pinnedHighlightColor = new THREE.Color(3108863);
function getColorMaterial(mesh) {
    const material = mesh.material;
    if (Array.isArray(material)) {
        return null;
    }
    const candidate = material;
    return candidate.color instanceof THREE.Color
        ? material
        : null;
}
function getPieceMeshFromObject(object) {
    let current = object;
    while (current) {
        if (current instanceof THREE.Mesh && pieceCodes$1.has(current.name)) {
            return current;
        }
        current = current.parent;
    }
    return null;
}
function getPieceAtSquare(scene, x, z) {
    let pieceAtSquare = null;
    scene.traverse(obj => {
        if (pieceAtSquare || !(obj instanceof THREE.Mesh) || !pieceCodes$1.has(obj.name)) {
            return;
        }
        if (Math.abs(obj.position.x - x) < 0.001 && Math.abs(obj.position.z - z) < 0.001) {
            pieceAtSquare = obj;
        }
    });
    return pieceAtSquare;
}
function createPieceHoverController(scene, camera, domElement) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const boardPoint = new THREE.Vector3();
    let enabled = true;
    let hasPointerPosition = false;
    let hovered = null;
    let hoveredMode = null;
    let draggedPiece = null;
    let pinnedPiece = null;
    let ignoredPiece = null;
    let pieceHighlightFilter = () => true;
    const squareHighlight = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
        color: 16245375,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide,
    }));
    squareHighlight.rotation.x = -Math.PI / 2;
    squareHighlight.position.y = 0.01;
    squareHighlight.visible = false;
    squareHighlight.renderOrder = 10;
    scene.add(squareHighlight);
    function clearHoveredState() {
        if (hovered) {
            const hoveredMaterial = getColorMaterial(hovered);
            if (hoveredMaterial && hovered.userData.originalColor instanceof THREE.Color) {
                hoveredMaterial.color.copy(hovered.userData.originalColor);
            }
            hovered = null;
            hoveredMode = null;
        }
        squareHighlight.visible = false;
    }
    function highlightPiece(piece, mode) {
        if (hovered === piece && hoveredMode === mode) {
            return;
        }
        clearHoveredState();
        const material = getColorMaterial(piece);
        if (!material) {
            return;
        }
        hovered = piece;
        hoveredMode = mode;
        hovered.userData.originalColor = material.color.clone();
        const highlightColor = mode === 'pinned' ? pinnedHighlightColor : hoverHighlightColor;
        material.color.copy(highlightColor);
    }
    return {
        setEnabled(nextEnabled) {
            enabled = nextEnabled;
            if (!enabled) {
                if ((pinnedPiece && hovered === pinnedPiece) || (draggedPiece && hovered === draggedPiece)) {
                    squareHighlight.visible = false;
                }
                else {
                    clearHoveredState();
                }
            }
        },
        setDraggedPiece(piece) {
            draggedPiece = piece;
            if (draggedPiece) {
                highlightPiece(draggedPiece, 'drag');
                return;
            }
            if (pinnedPiece) {
                highlightPiece(pinnedPiece, 'pinned');
                return;
            }
            clearHoveredState();
        },
        setPinnedPiece(piece) {
            pinnedPiece = piece;
            if (!pinnedPiece) {
                if (draggedPiece) {
                    highlightPiece(draggedPiece, 'drag');
                    return;
                }
                clearHoveredState();
                return;
            }
            highlightPiece(pinnedPiece, 'pinned');
        },
        setIgnoredPiece(piece) {
            ignoredPiece = piece;
        },
        setPieceHighlightFilter(filter) {
            pieceHighlightFilter = filter;
            if (hovered && !pieceHighlightFilter(hovered)) {
                clearHoveredState();
            }
        },
        updateFromPointerEvent(event) {
            const rect = domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            hasPointerPosition = true;
        },
        update() {
            if (!enabled) {
                return;
            }
            // Avoid highlighting a square at startup before any pointer input exists.
            if (!hasPointerPosition) {
                clearHoveredState();
                return;
            }
            if (pinnedPiece && !pinnedPiece.parent) {
                pinnedPiece = null;
                clearHoveredState();
            }
            if (draggedPiece && !draggedPiece.parent) {
                draggedPiece = null;
                clearHoveredState();
            }
            raycaster.setFromCamera(mouse, camera);
            let targetPiece = null;
            let hasHighlightedSquare = false;
            const hits = raycaster.intersectObjects(scene.children, true);
            let hitPiece = null;
            for (const intersection of hits) {
                const candidate = getPieceMeshFromObject(intersection.object);
                if (candidate && ignoredPiece && candidate === ignoredPiece) {
                    continue;
                }
                if (candidate && !pieceHighlightFilter(candidate)) {
                    continue;
                }
                if (candidate) {
                    hitPiece = candidate;
                    break;
                }
            }
            if (hitPiece) {
                squareHighlight.position.x = hitPiece.position.x;
                squareHighlight.position.z = hitPiece.position.z;
                squareHighlight.visible = true;
                hasHighlightedSquare = true;
                targetPiece = hitPiece;
            }
            else {
                const hasBoardIntersection = raycaster.ray.intersectPlane(boardPlane, boardPoint) !== null;
                if (hasBoardIntersection && Math.abs(boardPoint.x) <= 4 && Math.abs(boardPoint.z) <= 4) {
                    squareHighlight.position.x = Math.round(boardPoint.x + 3.5) - 3.5;
                    squareHighlight.position.z = Math.round(boardPoint.z + 3.5) - 3.5;
                    squareHighlight.visible = true;
                    hasHighlightedSquare = true;
                    const pieceAtSquare = getPieceAtSquare(scene, squareHighlight.position.x, squareHighlight.position.z);
                    targetPiece = pieceAtSquare && pieceHighlightFilter(pieceAtSquare) ? pieceAtSquare : null;
                }
                else {
                    squareHighlight.visible = false;
                }
            }
            if (draggedPiece) {
                highlightPiece(draggedPiece, 'drag');
                return;
            }
            if (pinnedPiece) {
                highlightPiece(pinnedPiece, 'pinned');
                return;
            }
            if (hovered && hovered !== targetPiece) {
                clearHoveredState();
            }
            if (!hasHighlightedSquare || !targetPiece || hovered === targetPiece) {
                return;
            }
            highlightPiece(targetPiece, 'hover');
        },
    };
}

const pieceCodes = new Set(['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p']);
function setupPieceInteraction({ scene, camera, renderer, controls, hoverController, allowWhiteInteraction: initialAllowWhiteInteraction = true, allowBlackInteraction: initialAllowBlackInteraction = true, }) {
    const pointerRaycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const boardPoint = new THREE.Vector3();
    const dragThresholdPx = 4;
    const lastMoveFromHighlight = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
        color: 16770140,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide,
    }));
    const lastMoveToHighlight = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
        color: 16770140,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        side: THREE.DoubleSide,
    }));
    lastMoveFromHighlight.rotation.x = -Math.PI / 2;
    lastMoveToHighlight.rotation.x = -Math.PI / 2;
    lastMoveFromHighlight.position.y = 0.005;
    lastMoveToHighlight.position.y = 0.006;
    lastMoveFromHighlight.visible = false;
    lastMoveToHighlight.visible = false;
    lastMoveFromHighlight.renderOrder = 8;
    lastMoveToHighlight.renderOrder = 9;
    scene.add(lastMoveFromHighlight);
    scene.add(lastMoveToHighlight);
    let dragState = null;
    let selectedPiece = null;
    let activeMouseButton = null;
    let hoverDisabledForOrbit = false;
    let onMoveAttempt = undefined;
    let allowWhiteInteraction = initialAllowWhiteInteraction;
    let allowBlackInteraction = initialAllowBlackInteraction;
    let interactionEnabled = true;
    function getPieceMeshFromObject(object) {
        let current = object;
        while (current) {
            if (current instanceof THREE.Mesh && pieceCodes.has(current.name)) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }
    function updatePointerNdc(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    function getSquareCoordinate(value) {
        return Math.round(value + 3.5) - 3.5;
    }
    function isWithinBoard(x, z) {
        return Math.abs(x) <= 4 && Math.abs(z) <= 4;
    }
    function getPieceAtSquare(x, z, ignorePiece) {
        let pieceAtSquare = null;
        scene.traverse(obj => {
            if (pieceAtSquare || !(obj instanceof THREE.Mesh) || !pieceCodes.has(obj.name) || obj === ignorePiece) {
                return;
            }
            if (Math.abs(obj.position.x - x) < 0.001 && Math.abs(obj.position.z - z) < 0.001) {
                pieceAtSquare = obj;
            }
        });
        return pieceAtSquare;
    }
    function isWhitePiece(piece) {
        return piece.name === piece.name.toUpperCase();
    }
    function isOppositeColor(a, b) {
        return isWhitePiece(a) !== isWhitePiece(b);
    }
    function canInteractWithPiece(piece) {
        return isWhitePiece(piece) ? allowWhiteInteraction : allowBlackInteraction;
    }
    hoverController.setPieceHighlightFilter(canInteractWithPiece);
    function parseSquare(square) {
        const normalized = square.trim().toLowerCase();
        if (!/^[a-h][1-8]$/.test(normalized)) {
            return null;
        }
        const fileIndex = normalized.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = Number.parseInt(normalized[1], 10);
        return {
            x: fileIndex - 3.5,
            z: 4.5 - rank,
        };
    }
    function coordinatesToUci(fromX, fromZ, toX, toZ) {
        // Convert board coordinates to square notation (a1-h8)
        const coordToSquare = (x, z) => {
            const fileIndex = Math.round(x + 3.5);
            const rank = Math.round(4.5 - z);
            return String.fromCharCode('a'.charCodeAt(0) + fileIndex) + rank;
        };
        return coordToSquare(fromX, fromZ) + coordToSquare(toX, toZ);
    }
    function setLastMoveHighlights(fromX, fromZ, toX, toZ) {
        lastMoveFromHighlight.position.x = fromX;
        lastMoveFromHighlight.position.z = fromZ;
        lastMoveToHighlight.position.x = toX;
        lastMoveToHighlight.position.z = toZ;
        lastMoveFromHighlight.visible = true;
        lastMoveToHighlight.visible = true;
    }
    function clearLastMoveHighlights() {
        lastMoveFromHighlight.visible = false;
        lastMoveToHighlight.visible = false;
    }
    function setLastMoveSquares(squares) {
        if (!squares || squares.length === 0) {
            clearLastMoveHighlights();
            return;
        }
        const from = parseSquare(squares[0]);
        if (!from) {
            clearLastMoveHighlights();
            return;
        }
        if (squares.length === 1) {
            lastMoveFromHighlight.visible = false;
            lastMoveToHighlight.position.x = from.x;
            lastMoveToHighlight.position.z = from.z;
            lastMoveToHighlight.visible = true;
            return;
        }
        const to = parseSquare(squares[1]);
        if (!to) {
            clearLastMoveHighlights();
            return;
        }
        setLastMoveHighlights(from.x, from.z, to.x, to.z);
    }
    function getPieceUnderPointer(event) {
        updatePointerNdc(event);
        pointerRaycaster.setFromCamera(pointerNdc, camera);
        const hits = pointerRaycaster.intersectObjects(scene.children, true);
        for (const hit of hits) {
            const piece = getPieceMeshFromObject(hit.object);
            if (piece) {
                return piece;
            }
        }
        return null;
    }
    function clearSelection() {
        selectedPiece = null;
        hoverController.setPinnedPiece(null);
    }
    function selectPiece(piece) {
        if (!canInteractWithPiece(piece)) {
            return;
        }
        selectedPiece = piece;
        hoverController.setPinnedPiece(piece);
    }
    function applyMoveOrCapture(movingPiece, targetX, targetZ, fromX = movingPiece.position.x, fromZ = movingPiece.position.z, validateWithCallback = true) {
        // Validate move through callback if provided
        if (validateWithCallback && onMoveAttempt) {
            const normalizedFromX = getSquareCoordinate(fromX);
            const normalizedFromZ = getSquareCoordinate(fromZ);
            const uci = coordinatesToUci(normalizedFromX, normalizedFromZ, targetX, targetZ);
            if (!onMoveAttempt(uci)) {
                return false; // Move rejected by validation callback
            }
        }
        const fromSquareX = getSquareCoordinate(fromX);
        const fromSquareZ = getSquareCoordinate(fromZ);
        const occupyingPiece = getPieceAtSquare(targetX, targetZ, movingPiece);
        if (!occupyingPiece) {
            movingPiece.position.set(targetX, movingPiece.position.y, targetZ);
            setLastMoveHighlights(fromSquareX, fromSquareZ, targetX, targetZ);
            return true;
        }
        if (!isOppositeColor(movingPiece, occupyingPiece)) {
            return false;
        }
        scene.remove(occupyingPiece);
        movingPiece.position.set(targetX, movingPiece.position.y, targetZ);
        setLastMoveHighlights(fromSquareX, fromSquareZ, targetX, targetZ);
        return true;
    }
    function setMoveAttemptCallback(callback) {
        onMoveAttempt = callback;
    }
    function setInteractionEnabled(enabled) {
        interactionEnabled = enabled;
        if (!interactionEnabled) {
            if (dragState) {
                dragState.piece.position.copy(dragState.startPosition);
                dragState.piece.position.y = dragState.startPosition.y;
                hoverController.setDraggedPiece(null);
                hoverController.setIgnoredPiece(null);
                if (renderer.domElement.hasPointerCapture(dragState.pointerId)) {
                    renderer.domElement.releasePointerCapture(dragState.pointerId);
                }
                dragState = null;
            }
            clearSelection();
            hoverController.setEnabled(false);
            controls.enabled = true;
            return;
        }
        hoverController.setEnabled(true);
    }
    function setAllowWhiteInteraction(allow) {
        allowWhiteInteraction = allow;
        hoverController.setPieceHighlightFilter(canInteractWithPiece);
        if (selectedPiece && !canInteractWithPiece(selectedPiece)) {
            clearSelection();
        }
    }
    function setAllowBlackInteraction(allow) {
        allowBlackInteraction = allow;
        hoverController.setPieceHighlightFilter(canInteractWithPiece);
        if (selectedPiece && !canInteractWithPiece(selectedPiece)) {
            clearSelection();
        }
    }
    function moveProgrammatically(fromX, fromZ, toX, toZ) {
        if (dragState) {
            return false;
        }
        const sourceX = getSquareCoordinate(fromX);
        const sourceZ = getSquareCoordinate(fromZ);
        const targetX = getSquareCoordinate(toX);
        const targetZ = getSquareCoordinate(toZ);
        if (!isWithinBoard(sourceX, sourceZ) || !isWithinBoard(targetX, targetZ)) {
            return false;
        }
        const movingPiece = getPieceAtSquare(sourceX, sourceZ);
        if (!movingPiece) {
            return false;
        }
        const moved = applyMoveOrCapture(movingPiece, targetX, targetZ, sourceX, sourceZ, false);
        if (!moved) {
            return false;
        }
        clearSelection();
        return true;
    }
    function moveProgrammaticallyBySquare(from, to) {
        const source = parseSquare(from);
        const target = parseSquare(to);
        if (!source || !target) {
            return false;
        }
        return moveProgrammatically(source.x, source.z, target.x, target.z);
    }
    function handleSelectedPieceClickTarget(event) {
        if (!selectedPiece || event.button !== 0) {
            return false;
        }
        updatePointerNdc(event);
        pointerRaycaster.setFromCamera(pointerNdc, camera);
        const targetPiece = getPieceUnderPointer(event);
        if (targetPiece) {
            if (targetPiece === selectedPiece) {
                clearSelection();
                return true;
            }
            if (isOppositeColor(selectedPiece, targetPiece)) {
                const targetX = targetPiece.position.x;
                const targetZ = targetPiece.position.z;
                if (applyMoveOrCapture(selectedPiece, targetX, targetZ)) {
                    clearSelection();
                    return true;
                }
            }
            if (!canInteractWithPiece(targetPiece)) {
                return true;
            }
            selectPiece(targetPiece);
            return true;
        }
        const hasBoardIntersection = pointerRaycaster.ray.intersectPlane(boardPlane, boardPoint) !== null;
        if (!hasBoardIntersection || !isWithinBoard(boardPoint.x, boardPoint.z)) {
            return false;
        }
        const targetX = getSquareCoordinate(boardPoint.x);
        const targetZ = getSquareCoordinate(boardPoint.z);
        if (applyMoveOrCapture(selectedPiece, targetX, targetZ)) {
            clearSelection();
        }
        return true;
    }
    function dragPieceToPointer(event) {
        if (!dragState) {
            return;
        }
        updatePointerNdc(event);
        pointerRaycaster.setFromCamera(pointerNdc, camera);
        const hasBoardIntersection = pointerRaycaster.ray.intersectPlane(boardPlane, boardPoint) !== null;
        if (!hasBoardIntersection || !isWithinBoard(boardPoint.x, boardPoint.z)) {
            return;
        }
        dragState.piece.position.x = boardPoint.x;
        dragState.piece.position.z = boardPoint.z;
        dragState.piece.position.y = dragState.startPosition.y + 0.2;
    }
    function finishDrag(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return;
        }
        const { piece, startPosition } = dragState;
        if (!dragState.hasMoved) {
            piece.position.copy(startPosition);
            piece.position.y = startPosition.y;
            dragState = null;
            hoverController.setDraggedPiece(null);
            hoverController.setIgnoredPiece(null);
            controls.enabled = true;
            hoverController.setEnabled(true);
            if (selectedPiece === piece) {
                clearSelection();
            }
            else {
                selectPiece(piece);
            }
            if (renderer.domElement.hasPointerCapture(event.pointerId)) {
                renderer.domElement.releasePointerCapture(event.pointerId);
            }
            return;
        }
        updatePointerNdc(event);
        pointerRaycaster.setFromCamera(pointerNdc, camera);
        const hasBoardIntersection = pointerRaycaster.ray.intersectPlane(boardPlane, boardPoint) !== null;
        let dropApplied = false;
        if (hasBoardIntersection && isWithinBoard(boardPoint.x, boardPoint.z)) {
            const targetX = getSquareCoordinate(boardPoint.x);
            const targetZ = getSquareCoordinate(boardPoint.z);
            dropApplied = applyMoveOrCapture(piece, targetX, targetZ, startPosition.x, startPosition.z);
        }
        if (!dropApplied) {
            piece.position.copy(startPosition);
        }
        piece.position.y = startPosition.y;
        hoverController.setDraggedPiece(null);
        clearSelection();
        dragState = null;
        hoverController.setIgnoredPiece(null);
        controls.enabled = true;
        hoverController.setEnabled(true);
        if (renderer.domElement.hasPointerCapture(event.pointerId)) {
            renderer.domElement.releasePointerCapture(event.pointerId);
        }
    }
    renderer.domElement.addEventListener('pointerdown', event => {
        if (!interactionEnabled) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        const piece = getPieceUnderPointer(event);
        if (!piece) {
            if (selectedPiece) {
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }
        if (!canInteractWithPiece(piece)) {
            return;
        }
        // If a piece is pinned, clicking another piece should act as a click target,
        // not start a drag on the clicked piece.
        if (selectedPiece && piece !== selectedPiece) {
            event.preventDefault();
            event.stopPropagation();
            if (isOppositeColor(selectedPiece, piece)) {
                const targetX = piece.position.x;
                const targetZ = piece.position.z;
                if (applyMoveOrCapture(selectedPiece, targetX, targetZ)) {
                    clearSelection();
                    return;
                }
            }
            selectPiece(piece);
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        dragState = {
            piece,
            pointerId: event.pointerId,
            startPosition: piece.position.clone(),
            startClientX: event.clientX,
            startClientY: event.clientY,
            hasMoved: false,
        };
        controls.enabled = false;
        hoverController.setIgnoredPiece(piece);
        hoverController.updateFromPointerEvent(event);
        renderer.domElement.setPointerCapture(event.pointerId);
    }, { capture: true });
    renderer.domElement.addEventListener('pointermove', event => {
        if (!interactionEnabled) {
            return;
        }
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return;
        }
        hoverController.updateFromPointerEvent(event);
        if (!dragState.hasMoved) {
            const deltaX = event.clientX - dragState.startClientX;
            const deltaY = event.clientY - dragState.startClientY;
            const movement = Math.hypot(deltaX, deltaY);
            if (movement < dragThresholdPx) {
                return;
            }
            dragState.hasMoved = true;
            if (selectedPiece === dragState.piece) {
                clearSelection();
            }
            hoverController.setDraggedPiece(dragState.piece);
        }
        dragPieceToPointer(event);
    });
    renderer.domElement.addEventListener('pointerup', event => {
        if (!interactionEnabled) {
            return;
        }
        if (dragState && event.pointerId === dragState.pointerId) {
            finishDrag(event);
            return;
        }
        handleSelectedPieceClickTarget(event);
    });
    renderer.domElement.addEventListener('pointercancel', event => {
        if (!interactionEnabled) {
            return;
        }
        finishDrag(event);
    });
    renderer.domElement.addEventListener('pointerdown', event => {
        activeMouseButton = event.pointerType === 'mouse' ? event.button : null;
    });
    renderer.domElement.addEventListener('pointerup', () => {
        activeMouseButton = null;
    });
    renderer.domElement.addEventListener('pointercancel', () => {
        activeMouseButton = null;
    });
    controls.addEventListener('start', () => {
        if (!interactionEnabled) {
            return;
        }
        if (activeMouseButton === 0) {
            hoverController.setEnabled(false);
            hoverDisabledForOrbit = true;
        }
    });
    controls.addEventListener('end', () => {
        activeMouseButton = null;
        if (!interactionEnabled) {
            return;
        }
        if (hoverDisabledForOrbit) {
            hoverController.setEnabled(true);
            hoverDisabledForOrbit = false;
        }
    });
    return {
        moveProgrammatically,
        moveProgrammaticallyBySquare,
        setLastMoveSquares,
        setMoveAttemptCallback,
        setAllowWhiteInteraction,
        setAllowBlackInteraction,
        setInteractionEnabled,
    };
}

function start3D(sceneRoot, config) {
    // Scene setup
    const scene = new THREE.Scene();
    scene.visible = false;
    scene.background = new THREE.Color(4210752);
    const loader = new GLTFLoader();
    const materials = new Map();
    const pieces = new Map();
    const sceneAssetUrl = config.real3D.sceneAssetUrl; // config.real3D is the reason we are here.
    const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    let currentOrientation = config.orientation;
    let isViewOnly = !!config.viewOnly;
    // Camera
    const { width: initialWidth, height: initialHeight } = getSceneRootSize();
    const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 100);
    camera.position.set(0, 15, 8);
    camera.zoom = 1.5;
    camera.updateProjectionMatrix();
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(initialWidth, initialHeight);
    sceneRoot.appendChild(renderer.domElement);
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Lighting
    const ambientLight = new THREE.HemisphereLight(16777215, 4473924, 2);
    scene.add(ambientLight);
    const light = new THREE.DirectionalLight(16777215, 0.5);
    light.position.set(0, 1, 1);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    const light2 = new THREE.DirectionalLight(16777215, 0.5);
    light2.position.set(0, 1, -1);
    light2.target.position.set(0, 0, 0);
    scene.add(light2);
    function setOrientation(orientation) {
        currentOrientation = orientation;
        const side = orientation === 'black' ? -1 : 1;
        camera.position.set(0, 15, 8 * side);
        controls.target.set(0, 0, 0);
        camera.updateProjectionMatrix();
        controls.update();
    }
    setOrientation(config.orientation);
    // Resize event
    window.addEventListener('resize', () => {
        const { width, height } = getSceneRootSize();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    // Set up piece hover and interaction
    const hoverController = createPieceHoverController(scene, camera, renderer.domElement);
    sceneRoot.addEventListener('pointermove', hoverController.updateFromPointerEvent);
    // Set up interactions
    const interactionController = setupPieceInteraction({
        scene,
        camera,
        renderer,
        controls,
        hoverController,
    });
    let allowedMoveDests = config.movable?.dests;
    if (config?.events?.move) {
        interactionController.setMoveAttemptCallback(uci => {
            const from = uci.slice(0, 2);
            const to = uci.slice(2, 4);
            if (allowedMoveDests && !allowedMoveDests.get(from)?.includes(to))
                return false;
            config.events?.move?.(from, to);
            return true;
        });
    }
    function setAllowInteractionForColors(config) {
        interactionController.setInteractionEnabled(!isViewOnly);
        if (isViewOnly) {
            interactionController.setAllowWhiteInteraction(false);
            interactionController.setAllowBlackInteraction(false);
            return;
        }
        console.log('Setting allow interaction for colors based on config:', config);
        if (config?.turnColor) {
            const isWhiteTurn = config.turnColor === 'white';
            const isMyTurn = (isWhiteTurn && config.movable?.color === 'white') ||
                (!isWhiteTurn && config.movable?.color === 'black') ||
                config.movable?.color === 'both';
            interactionController.setAllowWhiteInteraction(isWhiteTurn && isMyTurn);
            interactionController.setAllowBlackInteraction(!isWhiteTurn && isMyTurn);
            console.log(`Turn color: ${config.turnColor}, isMyTurn: ${isMyTurn}, allowWhiteInteraction: ${isWhiteTurn && isMyTurn}, allowBlackInteraction: ${!isWhiteTurn && isMyTurn}`);
        }
    }
    setAllowInteractionForColors(config);
    // Load the scene and pieces
    loader.load(sceneAssetUrl, (gltf) => {
        scene.add(gltf.scene);
        gltf.scene.scale.set(1, 1, 1);
        scene.traverse(obj => {
            if (obj instanceof THREE.Mesh &&
                ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'].includes(obj.name)) {
                obj.visible = false;
                pieces.set(obj.name, obj);
                if (obj.material &&
                    !Array.isArray(obj.material) &&
                    ['white piece', 'black piece'].includes(obj.material.name)) {
                    materials.set(obj.material.name, obj.material);
                }
            }
        });
        fenToScene(config?.fen || defaultFen, scene, pieces, materials);
        interactionController.setLastMoveSquares(config?.lastMove);
        scene.visible = true;
    });
    // Main loop
    function animate() {
        hoverController.update();
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    // Utils
    function getSceneRootSize() {
        return {
            width: sceneRoot.clientWidth || window.innerWidth,
            height: sceneRoot.clientHeight || window.innerHeight,
        };
    }
    // API implementation
    return {
        state: {}, // No internal state needed for now
        set(config) {
            if ('lastMove' in config) {
                interactionController.setLastMoveSquares(config.lastMove);
            }
            if (config.fen) {
                fenToScene(config.fen, scene, pieces, materials);
            }
            if ('movable' in config) {
                allowedMoveDests = config.movable?.dests;
            }
            if ('viewOnly' in config) {
                isViewOnly = !!config.viewOnly;
            }
            if ('orientation' in config && config.orientation && config.orientation !== currentOrientation) {
                setOrientation(config.orientation);
            }
            setAllowInteractionForColors(config);
        },
        getFen() {
            console.warn('Getting FEN from the 3D scene is not implemented.');
            return '';
        },
        toggleOrientation() {
            console.warn('Toggling orientation is not implemented in this 3D scene.');
        },
        move(_orig, _dest) {
            console.warn('Moving pieces programmatically is not implemented in this 3D scene. Please update the FEN instead.');
        },
        setPieces(_piecesDiff) {
            console.warn('Setting pieces programmatically is not implemented in this 3D scene. Please update the FEN instead.');
        },
        selectSquare(_key, _force) {
            console.warn('Selecting squares programmatically is not implemented in this 3D scene.');
        },
        newPiece(_piece, _key) {
            console.warn('Adding new pieces programmatically is not implemented in this 3D scene. Please update the FEN instead.');
        },
        playPremove() {
            console.warn('Premoves are not supported in this 3D scene implementation.');
            return false;
        },
        cancelPremove() {
            console.warn('Premoves are not supported in this 3D scene implementation.');
        },
        playPredrop(_validate) {
            console.warn('Predrops are not supported in this 3D scene implementation.');
            return false;
        },
        cancelPredrop() {
            console.warn('Predrops are not supported in this 3D scene implementation.');
        },
        cancelMove() {
            console.warn('Cancelling moves is not supported in this 3D scene implementation.');
        },
        stop() {
            console.warn('Stopping the 3D scene is not implemented. You may want to remove the canvas from the DOM instead.');
        },
        explode(_keys) {
            console.warn('Exploding squares is not implemented in this 3D scene.');
        },
        setShapes(_shapes) {
            console.warn('Drawing shapes is not implemented in this 3D scene.');
        },
        setAutoShapes(_shapes) {
            console.warn('Auto-shapes are not implemented in this 3D scene.');
        },
        getKeyAtDomPos(_pos) {
            console.warn('Getting key at DOM position is not implemented in this 3D scene.');
            return undefined;
        },
        dragNewPiece(_piece, _event, _force) {
            console.warn('Dragging new pieces is not implemented in this 3D scene.');
        },
        destroy() {
            console.warn('Destroying the 3D scene is not implemented. You may want to remove the canvas from the DOM instead.');
        },
        redrawAll() {
            // No internal state to redraw, but we can trigger a render if needed
        },
    };
}

// ported from https://github.com/lichess-org/lichobile/blob/master/src/chessground/render.ts
// in case of bugs, blame @veloce
function render(s) {
    const asWhite = whitePov(s), posToTranslate$1 = posToTranslate(s.dom.bounds()), boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : new Map(), fadings = curAnim ? curAnim.plan.fadings : new Map(), curDrag = s.draggable.current, samePieces = new Set(), movedPieces = new Map(), desiredSquares = computeSquareClasses(s), availableSquares = new Map(); // by class name
    let k, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sAvail;
    // walk over all board dom elements, apply animations and flag moved pieces
    el = boardEl.firstChild;
    while (el) {
        k = el.cgKey;
        if (isPieceNode(el)) {
            pieceAtKey = pieces.get(k);
            anim = anims.get(k);
            fading = fadings.get(k);
            elPieceName = el.cgPiece;
            // if piece not being dragged anymore, remove dragging style
            if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
                el.classList.remove('dragging');
                translate(el, posToTranslate$1(key2pos(k), asWhite));
                el.cgDragging = false;
            }
            // remove fading class if it still remains
            if (!fading && el.cgFading) {
                el.cgFading = false;
                el.classList.remove('fading');
            }
            // there is now a piece at this dom key
            if (pieceAtKey) {
                // continue animation if already animating and same piece
                // (otherwise it could animate a captured piece)
                if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
                    const pos = key2pos(k);
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                    el.classList.add('anim');
                    translate(el, posToTranslate$1(pos, asWhite));
                }
                else if (el.cgAnimating) {
                    el.cgAnimating = false;
                    el.classList.remove('anim');
                    translate(el, posToTranslate$1(key2pos(k), asWhite));
                    if (s.addPieceZIndex)
                        el.style.zIndex = posZIndex(key2pos(k), asWhite);
                }
                // same piece: flag as same
                if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading))
                    samePieces.add(k);
                // different piece: flag as moved unless it is a fading piece
                else if (fading && elPieceName === pieceNameOf(fading)) {
                    el.classList.add('fading');
                    el.cgFading = true;
                }
                else
                    appendValue(movedPieces, elPieceName, el);
            }
            // no piece: flag as moved
            else
                appendValue(movedPieces, elPieceName, el);
        }
        else if (isSquareNode(el)) {
            const cls = el.className;
            if (desiredSquares.get(k) === cls) {
                setVisible(el, true);
                desiredSquares.delete(k);
            }
            else
                appendValue(availableSquares, cls, el);
        }
        el = el.nextSibling;
    }
    // walk over all squares in current set, apply dom changes to moved squares
    // or append new squares
    for (const [sk, className] of desiredSquares) {
        sAvail = availableSquares.get(className)?.pop();
        const translation = posToTranslate$1(key2pos(sk), asWhite);
        if (sAvail) {
            // repurpose an available square
            sAvail.cgKey = sk;
            if (s.jsHover)
                sAvail.dataset['key'] = sk;
            translate(sAvail, translation);
            setVisible(sAvail, true);
        }
        else {
            const squareNode = createEl('square', className);
            squareNode.cgKey = sk;
            if (s.jsHover)
                squareNode.dataset['key'] = sk;
            translate(squareNode, translation);
            boardEl.insertBefore(squareNode, boardEl.firstChild);
        }
    }
    // hide remaining available, therefore unused, squares
    for (const [, nodes] of availableSquares.entries()) {
        for (const node of nodes)
            setVisible(node, false);
    }
    // walk over all pieces in current set, apply dom changes to moved pieces
    // or append new pieces
    for (const [k, p] of pieces) {
        anim = anims.get(k);
        if (!samePieces.has(k)) {
            pMvdset = movedPieces.get(pieceNameOf(p));
            pMvd = pMvdset && pMvdset.pop();
            // a same piece was moved
            if (pMvd) {
                // apply dom changes
                pMvd.cgKey = k;
                if (pMvd.cgFading) {
                    pMvd.classList.remove('fading');
                    pMvd.cgFading = false;
                }
                const pos = key2pos(k);
                if (s.addPieceZIndex)
                    pMvd.style.zIndex = posZIndex(pos, asWhite);
                if (anim) {
                    pMvd.cgAnimating = true;
                    pMvd.classList.add('anim');
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pMvd, posToTranslate$1(pos, asWhite));
            }
            // no piece in moved obj: insert the new piece
            // assumes the new piece is not being dragged
            else {
                const pieceName = pieceNameOf(p), pieceNode = createEl('piece', pieceName), pos = key2pos(k);
                pieceNode.cgPiece = pieceName;
                pieceNode.cgKey = k;
                if (anim) {
                    pieceNode.cgAnimating = true;
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pieceNode, posToTranslate$1(pos, asWhite));
                if (s.addPieceZIndex)
                    pieceNode.style.zIndex = posZIndex(pos, asWhite);
                boardEl.appendChild(pieceNode);
            }
        }
    }
    // remove any piece that remains in the moved sets
    for (const nodes of movedPieces.values())
        removeNodes(s, nodes);
}
function renderResized(s) {
    const asWhite = whitePov(s), posToTranslate$1 = posToTranslate(s.dom.bounds());
    let el = s.dom.elements.board.firstChild;
    while (el) {
        if ((isPieceNode(el) && !el.cgAnimating) || isSquareNode(el)) {
            translate(el, posToTranslate$1(key2pos(el.cgKey), asWhite));
        }
        el = el.nextSibling;
    }
}
function updateBounds(s) {
    const bounds = s.dom.elements.wrap.getBoundingClientRect();
    const container = s.dom.elements.container;
    const ratio = bounds.height / bounds.width;
    const width = (Math.floor((bounds.width * window.devicePixelRatio) / 8) * 8) / window.devicePixelRatio;
    const height = width * ratio;
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    s.dom.bounds.clear();
    s.addDimensionsCssVarsTo?.style.setProperty('---cg-width', width + 'px');
    s.addDimensionsCssVarsTo?.style.setProperty('---cg-height', height + 'px');
}
const isPieceNode = (el) => el.tagName === 'PIECE';
const isSquareNode = (el) => el.tagName === 'SQUARE';
function removeNodes(s, nodes) {
    for (const node of nodes)
        s.dom.elements.board.removeChild(node);
}
function posZIndex(pos, asWhite) {
    const minZ = 3;
    const rank = pos[1];
    const z = asWhite ? minZ + 7 - rank : minZ + rank;
    return `${z}`;
}
const pieceNameOf = (piece) => `${piece.color} ${piece.role}`;
const normalizeLastMoveStandardRookCastle = (s, k) => !!s.lastMove?.[1] &&
    !s.pieces.has(s.lastMove[1]) &&
    s.lastMove[0][0] === 'e' &&
    ['h', 'a'].includes(s.lastMove[1][0]) &&
    s.lastMove[0][1] === s.lastMove[1][1] &&
    squaresBetween(...key2pos(s.lastMove[0]), ...key2pos(s.lastMove[1])).some(sq => s.pieces.has(sq))
    ? ((k > s.lastMove[0] ? 'g' : 'c') + k[1])
    : k;
function computeSquareClasses(s) {
    const squares = new Map();
    if (s.lastMove && s.highlight.lastMove)
        for (const [i, k] of s.lastMove.entries())
            addSquare(squares, i === 1 ? normalizeLastMoveStandardRookCastle(s, k) : k, 'last-move');
    if (s.check && s.highlight.check)
        addSquare(squares, s.check, 'check');
    if (s.selected) {
        addSquare(squares, s.selected, 'selected');
        if (s.movable.showDests) {
            for (const k of s.movable.dests?.get(s.selected) ?? [])
                addSquare(squares, k, 'move-dest' + (s.pieces.has(k) ? ' oc' : ''));
            for (const k of s.premovable.customDests?.get(s.selected) ?? s.premovable.dests ?? [])
                addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
    }
    const premove = s.premovable.current;
    if (premove)
        for (const k of premove)
            addSquare(squares, k, 'current-premove');
    else if (s.predroppable.current)
        addSquare(squares, s.predroppable.current.key, 'current-premove');
    const o = s.exploding;
    if (o)
        for (const k of o.keys)
            addSquare(squares, k, 'exploding' + o.stage);
    if (s.highlight.custom) {
        s.highlight.custom.forEach((v, k) => {
            addSquare(squares, k, v);
        });
    }
    return squares;
}
function addSquare(squares, key, klass) {
    const classes = squares.get(key);
    if (classes)
        squares.set(key, `${classes} ${klass}`);
    else
        squares.set(key, klass);
}
function appendValue(map, key, value) {
    const arr = map.get(key);
    if (arr)
        arr.push(value);
    else
        map.set(key, [value]);
}

function defaults() {
    return {
        pieces: read(initial),
        orientation: 'white',
        turnColor: 'white',
        coordinates: true,
        coordinatesOnSquares: false,
        ranksPosition: 'right',
        autoCastle: true,
        viewOnly: false,
        disableContextMenu: false,
        addPieceZIndex: false,
        blockTouchScroll: false,
        touchIgnoreRadius: 1,
        pieceKey: false,
        trustAllEvents: false,
        jsHover: false,
        highlight: {
            lastMove: true,
            check: true,
        },
        animation: {
            enabled: true,
            duration: 200,
        },
        movable: {
            free: true,
            color: 'both',
            showDests: true,
            events: {},
            rookCastle: true,
        },
        premovable: {
            enabled: true,
            showDests: true,
            castle: true,
            additionalPremoveRequirements: _ => true,
            events: {},
        },
        predroppable: {
            enabled: false,
            events: {},
        },
        draggable: {
            enabled: true,
            distance: 3,
            autoDistance: true,
            showGhost: true,
            deleteOnDropOff: false,
        },
        dropmode: {
            active: false,
        },
        selectable: {
            enabled: true,
        },
        stats: {
            // on touchscreen, default to "tap-tap" moves
            // instead of drag
            dragged: !('ontouchstart' in window),
        },
        events: {},
        drawable: {
            enabled: true, // can draw
            visible: true, // can view
            defaultSnapToValidMove: true,
            eraseOnMovablePieceClick: true,
            shapes: [],
            autoShapes: [],
            brushes: {
                green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
                red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
                blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
                yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
                paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
                paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
                paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
                paleGrey: {
                    key: 'pgr',
                    color: '#4a4a4a',
                    opacity: 0.35,
                    lineWidth: 15,
                },
                purple: { key: 'purple', color: '#68217a', opacity: 0.65, lineWidth: 10 },
                pink: { key: 'pink', color: '#ee2080', opacity: 0.5, lineWidth: 10 },
                white: { key: 'white', color: 'white', opacity: 1, lineWidth: 10 },
                paleWhite: { key: 'pwhite', color: 'white', opacity: 0.6, lineWidth: 10 },
            },
            prevSvgHash: '',
        },
        hold: timer(),
    };
}

function createDefs() {
    const defs = createElement('defs');
    const filter = setAttributes(createElement('filter'), { id: 'cg-filter-blur' });
    filter.appendChild(setAttributes(createElement('feGaussianBlur'), { stdDeviation: '0.013' }));
    defs.appendChild(filter);
    return defs;
}
function renderSvg(state, els) {
    const d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined, dests = new Map(), bounds = state.dom.bounds(), nonPieceAutoShapes = d.autoShapes.filter(autoShape => !autoShape.piece);
    for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
        if (!s.dest)
            continue;
        const sources = dests.get(s.dest) ?? new Set(), from = pos2user(orient(key2pos(s.orig), state.orientation), bounds), to = pos2user(orient(key2pos(s.dest), state.orientation), bounds);
        sources.add(angleToSlot(moveAngle(from, to)));
        dests.set(s.dest, sources);
    }
    const shapes = [];
    const pendingEraseIdx = cur ? d.shapes.findIndex(s => sameEndpoints(s, cur) && sameColor(s, cur)) : -1;
    for (const [idx, s] of d.shapes.concat(nonPieceAutoShapes).entries()) {
        const isPendingErase = pendingEraseIdx !== -1 && pendingEraseIdx === idx;
        shapes.push({
            shape: s,
            current: false,
            pendingErase: isPendingErase,
            hash: shapeHash(s, isShort(s.dest, dests), false, bounds, isPendingErase, angleCount(s.dest, dests)),
        });
    }
    if (cur && pendingEraseIdx === -1)
        shapes.push({
            shape: cur,
            current: true,
            hash: shapeHash(cur, isShort(cur.dest, dests), true, bounds, false, angleCount(cur.dest, dests)),
            pendingErase: false,
        });
    const fullHash = shapes.map(sc => sc.hash).join(';');
    if (fullHash === state.drawable.prevSvgHash)
        return;
    state.drawable.prevSvgHash = fullHash;
    syncDefs(d, shapes, els);
    syncShapes(shapes, els, s => renderShape(state, s, d.brushes, dests, bounds));
}
// append only. Don't try to update/remove.
function syncDefs(d, shapes, els) {
    for (const shapesEl of [els.shapes, els.shapesBelow]) {
        const defsEl = shapesEl.querySelector('defs');
        const thisPlane = shapes.filter(s => (shapesEl === els.shapesBelow) === !!s.shape.below);
        const brushes = new Map();
        for (const s of thisPlane.filter(s => s.shape.dest && s.shape.brush)) {
            const brush = makeCustomBrush(d.brushes[s.shape.brush], s.shape.modifiers);
            const { key, color } = hiliteOf(s.shape);
            if (key && color)
                brushes.set(key, { key, color, opacity: 1, lineWidth: 1 });
            brushes.set(brush.key, brush);
        }
        const keysInDom = new Set();
        let el = defsEl.firstElementChild;
        while (el) {
            keysInDom.add(el.getAttribute('cgKey'));
            el = el.nextElementSibling;
        }
        for (const [key, brush] of brushes.entries()) {
            if (!keysInDom.has(key))
                defsEl.appendChild(renderMarker(brush));
        }
    }
}
function syncShapes(shapes, els, renderShape) {
    for (const [shapesEl, customEl] of [
        [els.shapes, els.custom],
        [els.shapesBelow, els.customBelow],
    ]) {
        const [shapesG, customG] = [shapesEl, customEl].map(el => el.querySelector('g'));
        const thisPlane = shapes.filter(s => (shapesEl === els.shapesBelow) === !!s.shape.below);
        const hashesInDom = new Map();
        for (const sc of thisPlane)
            hashesInDom.set(sc.hash, false);
        for (const root of [shapesG, customG]) {
            const toRemove = [];
            let el = root.firstElementChild, elHash;
            while (el) {
                elHash = el.getAttribute('cgHash');
                if (hashesInDom.has(elHash))
                    hashesInDom.set(elHash, true);
                else
                    toRemove.push(el);
                el = el.nextElementSibling;
            }
            for (const el of toRemove)
                root.removeChild(el);
        }
        // insert shapes that are not yet in dom
        for (const sc of thisPlane.filter(s => !hashesInDom.get(s.hash))) {
            for (const svg of renderShape(sc)) {
                if (svg.isCustom)
                    customG.appendChild(svg.el);
                else
                    shapesG.appendChild(svg.el);
            }
        }
    }
}
function shapeHash({ orig, dest, brush, piece, modifiers, customSvg, label, below }, shorten, current, bounds, pendingErase, angleCountOfDest) {
    // a shape and an overlay svg share a lifetime and have the same cgHash attribute
    return [
        bounds.width,
        bounds.height,
        current,
        pendingErase && 'pendingErase',
        angleCountOfDest,
        orig,
        dest,
        brush,
        shorten && '-',
        piece && pieceHash(piece),
        modifiers && modifiersHash(modifiers),
        customSvg && `custom-${textHash(customSvg.html)},${customSvg.center?.[0] ?? 'o'}`,
        label && `label-${textHash(label.text)}`,
        below && 'below',
    ]
        .filter(Boolean)
        .join(',');
}
const pieceHash = (piece) => [piece.color, piece.role, piece.scale].filter(Boolean).join(',');
const modifiersHash = (m) => [m.lineWidth, m.hilite].filter(Boolean).join(',');
function textHash(s) {
    // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
    }
    return h.toString();
}
function renderShape(state, { shape, current, pendingErase, hash }, brushes, dests, bounds) {
    const from = pos2user(orient(key2pos(shape.orig), state.orientation), bounds), to = shape.dest ? pos2user(orient(key2pos(shape.dest), state.orientation), bounds) : from, brush = shape.brush && makeCustomBrush(brushes[shape.brush], shape.modifiers), slots = dests.get(shape.dest), svgs = [];
    if (brush) {
        const el = setAttributes(createElement('g'), { cgHash: hash });
        svgs.push({ el });
        if (from[0] !== to[0] || from[1] !== to[1])
            el.appendChild(renderArrow(shape, brush, from, to, current, isShort(shape.dest, dests), pendingErase));
        else
            el.appendChild(renderCircle(brushes[shape.brush], from, current, bounds, pendingErase));
    }
    if (shape.label) {
        const label = shape.label;
        label.fill ?? (label.fill = shape.brush && brushes[shape.brush].color);
        const corner = shape.brush ? undefined : 'tr';
        svgs.push({ el: renderLabel(label, hash, from, to, slots, corner), isCustom: true });
    }
    if (shape.customSvg) {
        const on = shape.customSvg.center ?? 'orig';
        const [x, y] = on === 'label' ? labelCoords(from, to, slots).map(c => c - 0.5) : on === 'dest' ? to : from;
        const el = setAttributes(createElement('g'), { transform: `translate(${x},${y})`, cgHash: hash });
        el.innerHTML = `<svg width="1" height="1" viewBox="0 0 100 100">${shape.customSvg.html}</svg>`;
        svgs.push({ el, isCustom: true });
    }
    return svgs;
}
function renderCircle(brush, at, current, bounds, pendingErase) {
    const widths = circleWidth(), radius = (bounds.width + bounds.height) / (4 * Math.max(bounds.width, bounds.height));
    return setAttributes(createElement('circle'), {
        stroke: brush.color,
        'stroke-width': widths[current ? 0 : 1],
        fill: 'none',
        opacity: opacity(brush, current, pendingErase),
        cx: at[0],
        cy: at[1],
        r: radius - widths[1] / 2,
    });
}
function renderArrow(s, brush, from, to, current, shorten, pendingErase) {
    function renderLine(isHilite) {
        const m = arrowMargin(shorten && !current), dx = to[0] - from[0], dy = to[1] - from[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
        const hilite = hiliteOf(s);
        return setAttributes(createElement('line'), {
            stroke: isHilite ? hilite.color : brush.color,
            'stroke-width': lineWidth(brush, current) * (isHilite ? 1.14 : 1),
            'stroke-linecap': 'round',
            'marker-end': `url(#arrowhead-${isHilite ? hilite.key : brush.key})`,
            opacity: s.modifiers?.hilite && !pendingErase ? 1 : opacity(brush, current, pendingErase),
            x1: from[0],
            y1: from[1],
            x2: to[0] - xo,
            y2: to[1] - yo,
        });
    }
    if (!s.modifiers?.hilite)
        return renderLine(false);
    const g = setAttributes(createElement('g'), { opacity: brush.opacity });
    const blurred = setAttributes(createElement('g'), { filter: 'url(#cg-filter-blur)' });
    blurred.appendChild(filterBox(from, to));
    blurred.appendChild(renderLine(true));
    g.appendChild(blurred);
    g.appendChild(renderLine(false));
    return g;
}
function renderMarker(brush) {
    const marker = setAttributes(createElement('marker'), {
        id: 'arrowhead-' + brush.key,
        orient: 'auto',
        overflow: 'visible',
        markerWidth: 4,
        markerHeight: 4,
        refX: brush.key.startsWith('hilite') ? 1.86 : 2.05,
        refY: 2,
    });
    marker.appendChild(setAttributes(createElement('path'), {
        d: 'M0,0 V4 L3,2 Z',
        fill: brush.color,
    }));
    marker.setAttribute('cgKey', brush.key);
    return marker;
}
function renderLabel(label, hash, from, to, slots, corner) {
    const labelSize = 0.4, fontSize = labelSize * 0.75 ** label.text.length, at = labelCoords(from, to, slots), cornerOff = corner === 'tr' ? 0.4 : 0, g = setAttributes(createElement('g'), {
        transform: `translate(${at[0] + cornerOff},${at[1] - cornerOff})`,
        cgHash: hash,
    });
    g.appendChild(setAttributes(createElement('circle'), {
        r: labelSize / 2,
        'fill-opacity': corner ? 1.0 : 0.8,
        'stroke-opacity': corner ? 1.0 : 0.7,
        'stroke-width': 0.03,
        fill: label.fill ?? '#666',
        stroke: 'white',
    }));
    const labelEl = setAttributes(createElement('text'), {
        'font-size': fontSize,
        'font-family': 'Noto Sans',
        'text-anchor': 'middle',
        fill: 'white',
        y: 0.13 * 0.75 ** label.text.length,
    });
    labelEl.innerHTML = label.text;
    g.appendChild(labelEl);
    return g;
}
const orient = (pos, color) => (color === 'white' ? pos : [7 - pos[0], 7 - pos[1]]);
const mod = (n, m) => ((n % m) + m) % m;
const rotateAngleSlot = (slot, steps) => mod(slot + steps, 16);
const anyTwoCloserThan90Degrees = (slots) => [...slots].some(slot => [-3, -2, -1, 1, 2, 3].some(i => slots.has(rotateAngleSlot(slot, i))));
const isShort = (dest, dests) => !!dest && dests.has(dest) && anyTwoCloserThan90Degrees(dests.get(dest));
const createElement = (tagName) => document.createElementNS('http://www.w3.org/2000/svg', tagName);
const angleCount = (dest, dests) => dest && dests.has(dest) ? dests.get(dest).size : 0;
function setAttributes(el, attrs) {
    for (const key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key))
            el.setAttribute(key, attrs[key]);
    }
    return el;
}
const makeCustomBrush = (base, modifiers) => !modifiers
    ? base
    : {
        color: base.color,
        opacity: Math.round(base.opacity * 10) / 10,
        lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
        key: [base.key, modifiers.lineWidth].filter(Boolean).join(''),
    };
const circleWidth = () => [3 / 64, 4 / 64];
const lineWidth = (brush, current) => ((brush.lineWidth || 10) * (current ? 0.85 : 1)) / 64;
function hiliteOf(shape) {
    const hilite = shape.modifiers?.hilite;
    return { key: hilite && `hilite-${hilite.replace('#', '')}`, color: hilite };
}
const opacity = (brush, current, pendingErase) => (brush.opacity || 1) * (pendingErase ? 0.6 : current ? 0.9 : 1);
const arrowMargin = (shorten) => (shorten ? 20 : 10) / 64;
function pos2user(pos, bounds) {
    const xScale = Math.min(1, bounds.width / bounds.height);
    const yScale = Math.min(1, bounds.height / bounds.width);
    return [(pos[0] - 3.5) * xScale, (3.5 - pos[1]) * yScale];
}
function filterBox(from, to) {
    // lines/arrows are considered to be one dimensional for the purposes of SVG filters,
    // so we add a transparent bounding box to ensure they apply to the 2nd dimension
    const box = {
        from: [Math.floor(Math.min(from[0], to[0])), Math.floor(Math.min(from[1], to[1]))],
        to: [Math.ceil(Math.max(from[0], to[0])), Math.ceil(Math.max(from[1], to[1]))],
    };
    return setAttributes(createElement('rect'), {
        x: box.from[0],
        y: box.from[1],
        width: box.to[0] - box.from[0],
        height: box.to[1] - box.from[1],
        fill: 'none',
        stroke: 'none',
    });
}
const angleToSlot = (angle) => mod(Math.round((angle * 8) / Math.PI), 16);
const moveAngle = (from, to) => Math.atan2(to[1] - from[1], to[0] - from[0]) + Math.PI;
const dist = (from, to) => Math.sqrt([from[0] - to[0], from[1] - to[1]].reduce((acc, x) => acc + x * x, 0));
/*
 try to place label at the junction of the destination shaft and arrowhead. if there's more than
 1 arrow pointing to a square, the arrow shortens by 10 / 64 units so the label must move as well.

 if the angle between two incoming arrows is pi / 8, such as when an adjacent knight and bishop
 attack the same square, the knight's label is slid further down the shaft by an amount equal to
 our label size to avoid collision
*/
function labelCoords(from, to, slots) {
    let mag = dist(from, to);
    //if (mag === 0) return [from[0], from[1]];
    const angle = moveAngle(from, to);
    if (slots) {
        mag -= 33 / 64; // reduce by arrowhead length
        if (anyTwoCloserThan90Degrees(slots)) {
            mag -= 10 / 64; // reduce by shortening factor
            const slot = angleToSlot(angle);
            // reduce by label size for the knight if another arrow is within pi / 8:
            if (slot & 1 && [-1, 1].some(s => slots.has(rotateAngleSlot(slot, s))))
                mag -= 0.4;
        }
    }
    return [from[0] - Math.cos(angle) * mag, from[1] - Math.sin(angle) * mag].map(c => c + 0.5);
}

function renderWrap(element, s) {
    // .cg-wrap (element passed to Chessground)
    //   cg-container
    //     cg-board
    //     svg.cg-shapes
    //       defs
    //       g
    //     svg.cg-custom-svgs
    //       g
    //     cg-auto-pieces
    //     coords.ranks
    //     coords.files
    //     piece.ghost
    element.innerHTML = '';
    // ensure the cg-wrap class is set
    // so bounds calculation can use the CSS width/height values
    // add that class yourself to the element before calling chessground
    // for a slight performance improvement! (avoids recomputing style)
    element.classList.add('cg-wrap');
    for (const c of colors)
        element.classList.toggle('orientation-' + c, s.orientation === c);
    element.classList.toggle('manipulable', !s.viewOnly);
    const container = createEl('cg-container');
    element.appendChild(container);
    const board = createEl('cg-board');
    container.appendChild(board);
    let shapesBelow;
    let shapes;
    let customBelow;
    let custom;
    let autoPieces;
    if (s.drawable.visible) {
        [shapesBelow, shapes] = ['cg-shapes-below', 'cg-shapes'].map(cls => svgContainer(cls, true));
        [customBelow, custom] = ['cg-custom-below', 'cg-custom-svgs'].map(cls => svgContainer(cls, false));
        autoPieces = createEl('cg-auto-pieces');
        container.appendChild(shapesBelow);
        container.appendChild(customBelow);
        container.appendChild(shapes);
        container.appendChild(custom);
        container.appendChild(autoPieces);
    }
    if (s.coordinates) {
        const orientClass = s.orientation === 'black' ? ' black' : '';
        const ranksPositionClass = s.ranksPosition === 'left' ? ' left' : '';
        if (s.coordinatesOnSquares) {
            const rankN = s.orientation === 'white' ? i => i + 1 : i => 8 - i;
            files.forEach((f, i) => container.appendChild(renderCoords(ranks.map(r => f + r), 'squares rank' + rankN(i) + orientClass + ranksPositionClass, i % 2 === 0 ? 'black' : 'white')));
        }
        else {
            container.appendChild(renderCoords(ranks, 'ranks' + orientClass + ranksPositionClass, (s.ranksPosition === 'right') === (s.orientation === 'white') ? 'white' : 'black'));
            container.appendChild(renderCoords(files, 'files' + orientClass, opposite(s.orientation)));
        }
    }
    let ghost;
    if (!s.viewOnly && s.draggable.enabled && s.draggable.showGhost) {
        ghost = createEl('piece', 'ghost');
        setVisible(ghost, false);
        container.appendChild(ghost);
    }
    return { board, container, wrap: element, ghost, shapes, shapesBelow, custom, customBelow, autoPieces };
}
function svgContainer(cls, isShapes) {
    const svg = setAttributes(createElement('svg'), {
        class: cls,
        viewBox: isShapes ? '-4 -4 8 8' : '-3.5 -3.5 8 8',
        preserveAspectRatio: 'xMidYMid slice',
    });
    if (isShapes)
        svg.appendChild(createDefs());
    svg.appendChild(createElement('g'));
    return svg;
}
function renderCoords(elems, className, firstColor) {
    const el = createEl('coords', className);
    let f;
    elems.forEach((elem, i) => {
        const light = i % 2 === (firstColor === 'white' ? 0 : 1);
        f = createEl('coord', `coord-${light ? 'light' : 'dark'}`);
        f.textContent = elem;
        el.appendChild(f);
    });
    return el;
}

function Chessground(element, config) {
    const maybeState = defaults();
    configure(maybeState, config || {});
    function redrawAll() {
        const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
        // compute bounds from existing board element if possible
        // this allows non-square boards from CSS to be handled (for 3D)
        const elements = renderWrap(element, maybeState), bounds = memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
            render(state);
            if (elements.autoPieces)
                render$1(state, elements.autoPieces);
            if (!skipSvg && elements.shapes)
                renderSvg(state, elements);
        }, onResize = () => {
            updateBounds(state);
            renderResized(state);
            if (elements.autoPieces)
                renderResized$1(state);
        };
        const state = maybeState;
        state.dom = {
            elements,
            bounds,
            redraw: debounceRedraw(redrawNow),
            redrawNow,
            unbind: prevUnbind,
        };
        state.drawable.prevSvgHash = '';
        updateBounds(state);
        redrawNow(false);
        bindBoard(state, onResize);
        if (!prevUnbind)
            state.dom.unbind = bindDocument(state, onResize);
        state.events.insert?.(elements);
        return state;
    }
    if (config?.real3D) {
        return start3D(element, config);
    }
    else {
        return start(redrawAll(), redrawAll);
    }
}
function debounceRedraw(redrawNow) {
    let redrawing = false;
    return () => {
        if (redrawing)
            return;
        redrawing = true;
        requestAnimationFrame(() => {
            redrawNow();
            redrawing = false;
        });
    };
}

const renderBoard = (ctrl) => h('div.game-page__board', h('div.cg-wrap', {
    hook: {
        insert(vnode) {
            ctrl.setGround(Chessground(vnode.elm, ctrl.chessgroundConfig()));
        },
    },
}));
const renderPlayer = (ctrl, color, clock, name, title, rating, aiLevel) => {
    return h('div.game-page__player', {
        class: {
            turn: ctrl.chess.turn == color,
        },
    }, [
        h('div.game-page__player__user', [
            title && h('span.game-page__player__user__title.display-5', title),
            h('span.game-page__player__user__name.display-5', aiLevel ? `Stockfish level ${aiLevel}` : name || 'Anon'),
            h('span.game-page__player__user__rating', rating || ''),
        ]),
        h('div.game-page__player__clock.display-6', clock),
    ]);
};

function clockContent(time, decay) {
    if (!time && time !== 0)
        return h('span', '-');
    if (time == 2147483647)
        return h('span');
    const millis = time + (decay || 0);
    return millis > 1000 * 60 * 60 * 24 ? correspondence(millis) : realTime(millis);
}
const realTime = (millis) => {
    const date = new Date(millis);
    return h('span.clock--realtime.font-monospace', [
        pad2(date.getUTCMinutes()) + ':' + pad2(date.getUTCSeconds()),
        h('tenths', '.' + Math.floor(date.getUTCMilliseconds() / 100).toString()),
    ]);
};
const correspondence = (ms) => {
    const date = new Date(ms), minutes = prefixInteger(date.getUTCMinutes(), 2), seconds = prefixInteger(date.getSeconds(), 2);
    let hours, str = '';
    if (ms >= 86400 * 1000) {
        // days : hours
        const days = date.getUTCDate() - 1;
        hours = date.getUTCHours();
        str += (days === 1 ? 'One day' : `${days} days`) + ' ';
        if (hours !== 0)
            str += `${hours} hours`;
    }
    else if (ms >= 3600 * 1000) {
        // hours : minutes
        hours = date.getUTCHours();
        str += bold(prefixInteger(hours, 2)) + ':' + bold(minutes);
    }
    else {
        // minutes : seconds
        str += bold(minutes) + ':' + bold(seconds);
    }
    return h('span.clock--correspondence', str);
};
const pad2 = (num) => (num < 10 ? '0' : '') + num;
const prefixInteger = (num, length) => (num / Math.pow(10, length)).toFixed(length).slice(2);
const bold = (x) => `<b>${x}</b>`;

const renderGame = ctrl => _ => [
    h(`div.game-page.game-page--${ctrl.game.id}`, {
        hook: {
            destroy: ctrl.onUnmount,
        },
    }, [
        h('aside.game-page__left-float', [
            renderGamePlayer(ctrl, opposite(ctrl.pov)),
            renderGamePlayer(ctrl, ctrl.pov),
            ctrl.playing() ? renderButtons$1(ctrl) : renderState(ctrl),
        ]),
        renderBoard(ctrl),
    ]),
];
const renderButtons$1 = (ctrl) => h('div.btn-group.mt-4', [
    h('button.btn.btn-secondary', {
        attrs: { type: 'button', disabled: !ctrl.playing() },
        on: {
            click() {
                if (confirm('Confirm?'))
                    ctrl.resign();
            },
        },
    }, ctrl.chess.fullmoves > 1 ? 'Resign' : 'Abort'),
]);
const renderState = (ctrl) => h('div.game-page__state', ctrl.game.state.status);
const renderGamePlayer = (ctrl, color) => {
    const p = ctrl.game[color];
    const clock = clockContent(ctrl.timeOf(color), color == ctrl.chess.turn && ctrl.chess.fullmoves > 1 && ctrl.playing()
        ? ctrl.lastUpdateAt - Date.now()
        : 0);
    return renderPlayer(ctrl, color, clock, p.name, p.title, p.rating, p.aiLevel);
};

const renderHome = ctrl => (ctrl.auth.me ? userHome(ctrl) : anonHome());
const userHome = (ctrl) => [
    h('div', [
        h('div.btn-group.mt-5', [
            h('button.btn.btn-outline-primary.btn-lg', {
                attrs: { type: 'button' },
                on: { click: ctrl.openPuzzle },
            }, 'Puzzles'),
            h('button.btn.btn-outline-primary.btn-lg', {
                attrs: { type: 'button' },
                on: { click: ctrl.playAi },
            }, 'Play the Lichess AI'),
            h('button.btn.btn-outline-primary.btn-lg', {
                attrs: { type: 'button' },
                on: { click: () => ctrl.playMaia(10, 0) },
            }, 'Play a casual 10+0 game with the maia1 BOT'),
        ]),
        h('h2.mt-5', 'Games in progress'),
        h('div.games', renderGames(ctrl.games)),
        h('h2.mt-5.mb-3', 'About'),
        renderAbout(),
    ]),
];
const renderGames = (ongoing) => ongoing.games.length ? ongoing.games.map(renderGameWidget) : [h('p', 'No ongoing games at the moment')];
const renderGameWidget = (game) => h(`a.game-widget.text-decoration-none.game-widget--${game.id}`, {
    attrs: href(`/game/${game.gameId}`),
}, [
    h('span.game-widget__opponent', [
        h('span.game-widget__opponent__name', game.opponent.username || 'Anon'),
        game.opponent.rating && h('span.game-widget__opponent__rating', game.opponent.rating),
    ]),
    h('span.game-widget__board.cg-wrap', {
        hook: {
            insert(vnode) {
                const el = vnode.elm;
                Chessground(el, {
                    fen: game.fen,
                    orientation: game.color,
                    lastMove: game.lastMove.match(/.{1,2}/g),
                    viewOnly: true,
                    movable: { free: false },
                    drawable: { visible: false },
                    coordinates: false,
                });
            },
        },
    }, 'board'),
]);
const anonHome = () => [
    h('div.login.text-center', [
        renderAbout(),
        h('div.big', [h('p', 'Please log in to continue.')]),
        h('a.btn.btn-primary.btn-lg.mt-5', {
            attrs: href('/login'),
        }, 'Login with Lichess'),
    ]),
];
const renderAbout = () => h('div.about', [
    h('p', 'Play games on Lichess using a 3D board and Lichess public API.'),
    h('p', 'WORK IN PROGRESS ...'),
    h('ul', [
        h('li', h('a', {
            attrs: { href: 'https://github.com/yafred/lichess3D' },
        }, 'Source code')),
        h('li', h('a', {
            attrs: { href: 'https://lichess-org.github.io/api-demo/' },
        }, 'Lichess API demo')),
        h('li', h('a', {
            attrs: { href: 'https://lichess.org/api' },
        }, 'Lichess.org API documentation')),
    ]),
    h('p', [
        'Press ',
        h('code', '<Ctrl+Shift+j>'),
        ' to open your browser console and view incoming events.',
        h('br'),
        'Check out the network tab as well to view API calls.',
    ]),
]);

function layout (ctrl, body) {
    const fullBleed = ctrl.page == 'game' || ctrl.page == 'tv' || ctrl.page == 'puzzle';
    return h('body', [
        renderNavBar(ctrl),
        h(`div.app-shell__content.app-shell__content--${ctrl.page}`, fullBleed ? body : [h('div.container', body)]),
    ]);
}
const renderNavBar = (ctrl) => h('header.navbar.navbar-expand-md.navbar-dark.bg-dark', [
    h('div.container', [
        h('a.navbar-brand', {
            attrs: href('/'),
        }, 'Lichess 3D'),
        h('button.navbar-toggler', {
            attrs: {
                type: 'button',
                'data-bs-toggle': 'collapse',
                'data-bs-target': '#navbarSupportedContent',
                'aria-controls': 'navbarSupportedContent',
                'aria-expanded': false,
                'aria-label': 'Toggle navigation',
            },
        }, h('span.navbar-toggler-icon')),
        h('div#navbarSupportedContent.collapse.navbar-collapse', [
            h('ul.navbar-nav.me-auto.mb-lg-0"'),
            h('ul.navbar-nav', [ctrl.auth.me ? userNav(ctrl.auth.me) : anonNav()]),
        ]),
    ]),
]);
const userNav = (me) => h('li.nav-item.dropdown', [
    h('a#navbarDropdown.nav-link.dropdown-toggle', {
        attrs: {
            href: '#',
            role: 'button',
            'data-bs-toggle': 'dropdown',
            'aria-expanded': false,
        },
    }, me.username),
    h('ul.dropdown-menu', {
        attrs: {
            'aria-labelledby': 'navbarDropdown',
        },
    }, [
        h('li', h('a.dropdown-item', {
            attrs: href('/logout'),
        }, 'Log out')),
    ]),
]);
const anonNav = () => h('li.nav-item', h('a.btn.btn-primary.text-nowrap', {
    attrs: href('/login'),
}, 'Login with Lichess'));

const renderPuzzle = ctrl => _ => [
    h(`div.game-page.game-page`, [h('aside.game-page__left-float', [renderButtons(ctrl)]), renderBoard(ctrl)]),
];
const renderButtons = (ctrl) => h('div.d-flex.flex-column.gap-2.mt-4', [
    h('button.btn.btn-secondary', {
        attrs: { type: 'button' },
        on: {
            click() {
                ctrl.dailyPuzzle();
            },
        },
    }, 'daily puzzle'),
    h('button.btn.btn-secondary', {
        attrs: { type: 'button' },
        on: {
            click() {
                ctrl.nextPuzzle();
            },
        },
    }, 'next puzzle (Mate in 2)'),
    h('div.input-group', [
        h('input.form-control', {
            attrs: {
                type: 'text',
                placeholder: 'Puzzle ID',
                value: ctrl.puzzleId,
            },
            on: {
                input(event) {
                    ctrl.setPuzzleId(event.target.value);
                },
            },
        }),
        h('button.btn.btn-secondary', {
            attrs: { type: 'button' },
            on: {
                click() {
                    const id = ctrl.puzzleId.trim();
                    if (id)
                        ctrl.puzzleById(id);
                },
            },
        }, 'load puzzle'),
    ]),
]);

const renderSeek = ctrl => _ => [
    h('div.seek-page', {
        hook: {
            destroy: ctrl.onUnmount,
        },
    }, [
        h('div.seek-page__awaiting', [spinner(), h('span.ms-3', 'Awaiting a game...')]),
        h('a.btn.btn-secondary', {
            attrs: { href: url('/') },
        }, 'Cancel'),
    ]),
];

const renderTv = ctrl => _ => [
    h(`div.game-page.game-page--${ctrl.game.id}`, {
        hook: {
            destroy: ctrl.onUnmount,
        },
    }, [
        renderTvPlayer(ctrl, opposite(ctrl.game.orientation)),
        renderBoard(ctrl),
        renderTvPlayer(ctrl, ctrl.game.orientation),
    ]),
];
const renderTvPlayer = (ctrl, color) => {
    const p = ctrl.player(color);
    const clock = clockContent(p.seconds && p.seconds * 1000, color == ctrl.chess.turn ? ctrl.lastUpdateAt - Date.now() : 0);
    return renderPlayer(ctrl, color, clock, p.user.name, p.user.title, p.rating);
};

function view(ctrl) {
    return layout(ctrl, selectRenderer(ctrl)(ctrl));
}
const selectRenderer = (ctrl) => {
    if (ctrl.page == 'puzzle')
        return ctrl.puzzle ? renderPuzzle(ctrl.puzzle) : renderLoading;
    if (ctrl.page == 'game')
        return ctrl.game ? renderGame(ctrl.game) : renderLoading;
    if (ctrl.page == 'home')
        return renderHome;
    if (ctrl.page == 'seek' && ctrl.seek)
        return renderSeek(ctrl.seek);
    if (ctrl.page == 'challenge' && ctrl.challenge)
        return renderChallenge(ctrl.challenge);
    if (ctrl.page == 'tv')
        return ctrl.tv ? renderTv(ctrl.tv) : renderLoading;
    return renderNotFound;
};
const renderLoading = _ => [loadingBody()];
const renderNotFound = _ => [h('h1', 'Not found')];
const loadingBody = () => h('div.loading', spinner());
const spinner = () => h('div.spinner-border.text-primary', { attrs: { role: 'status' } }, h('span.visually-hidden', 'Loading...'));

async function main (element) {
    const patch = init([attributesModule, eventListenersModule, classModule]);
    const ctrl = new Ctrl(redraw);
    let vnode = patch(element, loadingBody());
    function redraw() {
        vnode = patch(vnode, view(ctrl));
    }
    await ctrl.auth.init();
    routing(ctrl);
}

export { main as default };
