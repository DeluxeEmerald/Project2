// import React, {useState} from 'react';
function TopBar()
{

    function toPacks(){
        window.location.href = '/packs';
    }
    function toInventory(){
        window.location.href = '/inventory';
    }
    function toDecks(){
        window.location.href = '/decks';
    }
    function toSocial(){
        window.location.href = '/social';
    }

    return(
    <div id="topBarDiv" className="flex bg-main text-black size-12 w-full h-11">
        <button className="border-2 border-black flex-1" onClick={() => toPacks()}>Packs</button>
        <button className="border-2 border-black flex-1" onClick={() => toInventory()}>Inventory</button>
        <button className="border-2 border-black flex-1" onClick={() => toDecks()}>Decks</button>
        <button className="border-2 border-black flex-1" onClick={() => toSocial()}>Social</button>
    </div>
    );
}
export default TopBar;