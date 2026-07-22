import { useLocation, useNavigate } from "react-router-dom";

// import React, {useState} from 'react';
function TopBar()
{
    const navigate = useNavigate();
    const location = useLocation();

    function toPacks(){
        navigate('/packs');
    }
    function toInventory(){
        navigate('/inventory');
    }
    function toDecks(){
        navigate('/decks');
    }

    function navClass(path: string): string {
        return location.pathname === path ? 'nav-button nav-button-active' : 'nav-button';
    }

    return(
<<<<<<< HEAD
    <div id="topBarDiv" className='topbar-shell'>
        <div className='topbar-brand'>
            <strong>Collection Tools</strong>
            <span>Switch contexts without losing your place.</span>
        </div>
        <div className='topbar-nav'>
            <button className={navClass('/packs')} onClick={() => toPacks()}>Packs</button>
            <button className={navClass('/inventory')} onClick={() => toInventory()}>Inventory</button>
            <button className={navClass('/decks')} onClick={() => toDecks()}>Decks</button>
        </div>
=======
    <div id="topBarDiv" className="flex bg-main text-white size-12 w-full h-11 font-grover text-xl">
        <button className="border-2 border-black flex-1 hover:bg-wood hover:text-black" onClick={() => toPacks()}>Packs</button>
        <button className="border-2 border-black flex-1 hover:bg-wood hover:text-black" onClick={() => toInventory()}>Inventory</button>
        <button className="border-2 border-black flex-1 hover:bg-wood hover:text-black" onClick={() => toDecks()}>Decks</button>
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    </div>
    );
}
export default TopBar;