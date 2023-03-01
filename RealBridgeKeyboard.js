// ==UserScript==
// @name         Keyboard RealBridge
// @version      0.08
// @description  Keyboard input for bid/card clicks on RealBridge
// @author       Torsten Ertbjerg Rasmussen <ertbjerg@gmail.com>
// @match        https://play.realbridge.online/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

'use strict';

var buffer = new String();

const bids = ['p', 'x', 'r', '1c', '1d', '1h', '1s', '1n', '2c', '2d', '2h', '2s', '2n', '3c', '3d', '3h', '3s', '3n', '4c', '4d', '4h', '4s', '4n', '5c', '5d', '5h', '5s', '5n', '6c', '6d', '6h', '6s', '6n', '7c', '7d', '7h', '7s', '7n', ]
const spades   = ['sa', 'sk', 'sq', 'sj', 'st', 's9', 's8', 's7', 's6', 's5', 's4', 's3', 's2' ];
const hearts   = ['ha', 'hk', 'hq', 'hj', 'ht', 'h9', 'h8', 'h7', 'h6', 'h5', 'h4', 'h3', 'h2' ];
const diamonds = ['da', 'dk', 'dq', 'dj', 'dt', 'd9', 'd8', 'd7', 'd6', 'd5', 'd4', 'd3', 'd2' ];
const clubs    = ['ca', 'ck', 'cq', 'cj', 'ct', 'c9', 'c8', 'c7', 'c6', 'c5', 'c4', 'c3', 'c2' ];
const cards = spades.concat(hearts).concat(diamonds).concat(clubs);

window.addEventListener("load", (event) => {
    console.log("RealBridge Keyboard for bids+play: v0.08");
    BUI_start();
});

window.addEventListener("bridge-bid", (event) => {
    console.log('BID: ' + JSON.stringify(event.detail));
    BUI_simulateClick('bid_' + event.detail.bid);
}, false);

window.addEventListener("bridge-card", (event) => {
    console.log('CARD: ' + JSON.stringify(event.detail));
    BUI_simulateClick('card_'+event.detail.card);
}, false);

window.addEventListener("keydown", (event) => {
    // let people write on textbox
    if (document.activeElement.type == "text"){return;}

    // we want only the plain keys
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {return;}

    // Clear the buffer with Backspace key
    if (event.key == 'Backspace') { buffer = ''; return;}

    buffer += String(event.key);
    if (cards.includes(buffer)) {
        const card = new CustomEvent("bridge-card",{detail: {card: buffer}});
        window.dispatchEvent(card);
        buffer = '';
    }
    if (bids.includes(buffer)) {
        const bid = new CustomEvent("bridge-bid",{detail: {bid: buffer}});
        window.dispatchEvent(bid);
        buffer = '';
    }
}, false)


function BUI_simulateClick(elem){
    var node = document.getElementById(elem);
    BUI_triggerMouseButtons(node);
}

function BUI_triggerMouseButtons(jNode) {
    BUI_triggerMouseEvent (jNode, "mousemove");
    BUI_triggerMouseEvent (jNode, "mousedown");
    BUI_triggerMouseEvent (jNode, "mouseup");
    BUI_triggerMouseEvent (jNode, "mousemove");
    BUI_triggerMouseEvent (jNode, "click");
}

function BUI_triggerMouseEvent (node, eventType) {
    var rect = node.getBoundingClientRect();
    var l = rect.left;
    var r = rect.right;
    var pos = (r-l)*node.bui_xoffset_pct/100 + l;
    var clickEvent = new MouseEvent(eventType, {
        clientX:pos,
        clientY:rect.top + 5,
        bubbles: true,
        cancelable: true,
        view: window
    });
    node.dispatchEvent (clickEvent);
    document.body.dispatchEvent (clickEvent);
    document.dispatchEvent (clickEvent);
}

function BUI_start(){
    if (window.location.href.indexOf("realbridge") > -1) {
        console.log("BUI_start");

        //give ids to DETAILED cards - todo: SIMPLIFIED
        var divs = document.querySelectorAll("body div");
        for (var divelem in divs)
        {
            if ((typeof divs[divelem].innerHTML !== "undefined") && (divs[divelem].innerHTML.includes("cards_svg")) && (divs[divelem].innerHTML.length < 150) ) //its a card
            {
                for (let suit of ["S", "H", "D", "C"]){
                    for (let rank of ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A" ]){
                        if (divs[divelem].innerHTML.includes(rank+suit+".svg")){
                            let newid = "card_" + suit.toLowerCase() + rank.toLowerCase();
                            divs[divelem].id = newid;
                            divs[divelem].bui_xoffset_pct = 10;
                            console.log(newid);
                        }
                    }
                }
            }
        }

        // give ids to bids
        var imgs = document.querySelectorAll("body div#bb_container img"); 
        for (divelem in imgs)
        {
            if (typeof imgs[divelem].src !== 'undefined') {
                for (let suit of ["S", "H", "D", "C", "N"]){
                    for (let rank of ["1", "2", "3", "4", "5", "6", "7"]){
                        if (imgs[divelem].src.includes(rank+suit)){
                            let offset = 50;
                            if (suit == "N") { offset = 10; }
                            if (suit == "S") { offset = 30; }
                            if (suit == "H") { offset = 50; }
                            if (suit == "D") { offset = 70; }
                            if (suit == "C") { offset = 90; }
                            let newid = "bid_" + rank + suit.toLowerCase();
                            imgs[divelem].id = newid;
                            imgs[divelem].bui_xoffset_pct = offset;
                            console.log(imgs[divelem].id);
                        }
                    }
                }
                if (imgs[divelem].src.includes("XXBB")){
                    imgs[divelem].id = "bid_r";
                    imgs[divelem].bui_xoffset_pct = 20;
                    console.log(imgs[divelem].id);
                }
                else if (imgs[divelem].src.includes("XBB")){
                    imgs[divelem].id = "bid_x";
                    imgs[divelem].bui_xoffset_pct = 80;
                    console.log(imgs[divelem].id);
                }
                if (imgs[divelem].src.includes("PASSBB")){
                    imgs[divelem].id = "bid_p";
                    imgs[divelem].bui_xoffset_pct = 50;
                    console.log(imgs[divelem].id);
                }
            }
        }
    }
}
