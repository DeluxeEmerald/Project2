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

    return(
    <div id="topBarDiv" className="flex bg-main text-white size-12 w-full h-11 font-grover text-xl">
        <button className="border-2 border-black flex-1 hover:bg-wood hover:text-black" onClick={() => toPacks()}>Packs</button>
        <button className="border-2 border-black flex-1 hover:bg-wood hover:text-black" onClick={() => toInventory()}>Inventory</button>
        <button className="border-2 border-black flex-1 hover:bg-wood hover:text-black" onClick={() => toDecks()}>Decks</button>
    </div>
    );
}
export default TopBar;