import { useNavigate } from "react-router-dom";

// import React, {useState} from 'react';
function TopBar()
{
    const navigate = useNavigate();

    function toPacks(){
        navigate('/packs');
    }
    function toInventory(){
        navigate('/inventory');
    }
    function toDecks(){
        navigate('/decks');
    }
    function toSocial(){
        navigate('/social');
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