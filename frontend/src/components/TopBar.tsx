import React, {useState} from 'react';
function TopBar()
{

    return(
    <div id="topBarDiv" className="flex">
        <div className="topBarButton">Packs</div>
        <div>Inventory</div>
        <div>Decks</div>
        <div>Social</div>
    </div>
    );
}
export default TopBar;