import React, {useState} from 'react';
function TopBar()
{

    return(
    <div id="topBarDiv" className="flex bg-main text-black size-12 w-full h-11">
        <button className="border-2 border-black flex-1">Packs</button>
        <button className="border-2 border-black flex-1">Inventory</button>
        <button className="border-2 border-black flex-1">Decks</button>
        <button className="border-2 border-black flex-1">Social</button>
    </div>
    );
}
export default TopBar;