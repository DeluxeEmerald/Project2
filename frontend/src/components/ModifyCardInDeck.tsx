import React, {useEffect, useRef, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID, storeUserID } from '../tokenStorage';
import { useLocation, useNavigate } from 'react-router-dom';

function AddedCardToDeck() {

    const location = useLocation();
    const navigate = useNavigate();

    const [message,setMessage] = useState('');
    const [newDeck,setNewDeck] = useState('');

    const deck = location.state?.deck;
    const card = location.state?.card;
    const addrm = location.state?.addrm;

    const hasAdded = useRef(false);

    async function addToDeck() : Promise<string> {
        const deckID = deck._id ? deck._id : deck.id;
        let obj2 = {jwtToken: retrieveToken(), deckId: deckID, cardId: card.id, quantity:"1"};
        let js2 = JSON.stringify(obj2);
        
        try
        {
            let response = null;

            response = await fetch(buildPath('api/addcardtodeck'),
            {method:'POST',body:js2,headers:{'Content-Type':
            'application/json'}});
            
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                return res.error;
            }
            else{
                storeToken(res.jwtToken);
            }
            return "";
        }
        catch(error:any)
        {
            return error.toString();
        }
    }

    async function removeFromDeck() : Promise<string> {
        const deckID = deck._id ? deck._id : deck.id;
        let obj2 = {jwtToken: retrieveToken(), deckId: deckID, cardId: card.id, quantity:"1"};
        let js2 = JSON.stringify(obj2);
        
        try
        {
            let response = null;

            response = await fetch(buildPath('api/removecardfromdeck'),
            {method:'POST',body:js2,headers:{'Content-Type':
            'application/json'}});
            
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                return res.error;
            }
            else{
                storeToken(res.jwtToken);
            }
            return "";
        }
        catch(error:any)
        {
            return error.toString();
        }
    }

    async function getDecks() : Promise<void>
        {
            const deckID = deck._id ? deck._id : deck.id;
            let obj = {jwtToken: retrieveToken(), userId: JSON.parse(retrieveUserID()).id, search:deckID};
            let js = JSON.stringify(obj);
            
            try
            {
                const response = await fetch(buildPath('api/getdecks'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
                
                let txt = await response.text();
                let res = JSON.parse(txt);
                if(res.error && res.error.length > 0){
                    setMessage(res.error);
                }
                else{
                    storeToken(res.jwtToken);
                }
    
                let results = res.results;
                
                const container = document.getElementById("decksContainer");
    
                results.forEach((element: any) => {
                    setNewDeck(element);
                });
    
            }
            catch(error:any)
            {
                // setResults(error.toString());
                console.log(error.toString());
            }
        };

    async function awaitUpdate() {
        setMessage("Loading...");
        console.log(deck);
        if (addrm) {
            const error = await addToDeck();
            await getDecks();
            if (error.length > 0)
                setMessage(`${card.name} is already in ${deck.deckName}!`);
            else
                setMessage(`${card.name} has been added to ${deck.deckName}.`);
        }
        else {
            // EXTEND THIS. IN THIS CASE, WE REMOVE A CARD FROM THE DECK
            const error = await removeFromDeck();
            await getDecks();
            if (error.length > 0)
                setMessage(`${card.name} was not in ${deck.deckName}.`);
            else
                setMessage(`${card.name} was successfully removed from ${deck.deckName}!`);
        }
    }

    useEffect(() => {
        if (hasAdded.current) return;
        hasAdded.current = true;
        awaitUpdate();
    }, []);

    const ret = (<div className='flex flex-col items-center gap-4 text-black p-8 font-grover' id="cardUIDiv">
            {message}
            <button onClick={() => navigate(`/card/:cardId`, {state: { card:card }})} className='bg-main w-32'>Go Back to Card</button>
            <button onClick={() => navigate(`/deckdetails/${deck.id}`, { state: { deck:newDeck, card:null } })} className='bg-main w-32'>Go to Deck</button>
        </div>);

    return ret;
}

export default AddedCardToDeck;