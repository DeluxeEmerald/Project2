import {useEffect, useRef, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useLocation, useNavigate } from 'react-router-dom';

function normalizeObjectId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && typeof value.$oid === 'string') return value.$oid;
    if (typeof value.toHexString === 'function') return value.toHexString();
    const asString = String(value);
    return asString === '[object Object]' ? '' : asString;
}

function AddedCardToDeck() {

    const location = useLocation();
    const navigate = useNavigate();

    const [message,setMessage] = useState('');
    const [isFinishedLoading,setFinishedLoading] = useState(false);
    const [newDeck,setNewDeck] = useState('');

    const deck = location.state?.deck;
    const card = location.state?.card;
    const addrm = location.state?.addrm;

    const hasAdded = useRef(false);

    async function addToDeck() : Promise<string> {
        const deckID = normalizeObjectId(deck._id ? deck._id : deck.id);
        const cardID = normalizeObjectId(card.id);
        let obj2 = {jwtToken: retrieveToken(), deckId: deckID, cardId: cardID, quantity:"1"};
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
        const deckID = normalizeObjectId(deck._id ? deck._id : deck.id);
        const cardID = normalizeObjectId(card.id);
        let obj2 = {jwtToken: retrieveToken(), deckId: deckID, cardId: cardID, quantity:"1"};
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
            let obj = {jwtToken: retrieveToken(), userId: JSON.parse(retrieveUserID()).id, search:normalizeObjectId(deckID)};
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
        if (addrm) {
            const error = await addToDeck();
            await getDecks();
            if (error.length > 0)
                setMessage(error);
            else
                setMessage(`${card.name} has been added to ${deck.deckName}.`);
        }
        else {
            const error = await removeFromDeck();
            await getDecks();
            if (error.length > 0)
                setMessage(`${card.name} was not in ${deck.deckName}.`);
            else
                setMessage(`${card.name} was successfully removed from ${deck.deckName}!`);
        }

        setFinishedLoading(true);
    }

    useEffect(() => {
        if (hasAdded.current) return;
        hasAdded.current = true;
        awaitUpdate();
    }, []);

    const ret = (<div className='card-update-shell text-black' id="cardUIDiv">
            <div className='card-update-panel'>
                <p className='brand-mark'>Deck Update</p>
                <h1 className='card-update-title'>{addrm ? 'Card added to deck' : 'Card removed from deck'}</h1>
                <p className='card-update-copy'>{message}</p>
                {isFinishedLoading && (<div className='card-update-actions'>
                    <button onClick={() => navigate(`/card/${card.id}`, {state: { card:card }})} className='secondary-button'>Go Back to Card</button>
                    <button onClick={() => navigate(`/deckdetails/${deck.id}`, { state: { deck:newDeck, card:null } })} className='primary-button'>Go to Deck</button>
                </div>)}
            </div>
        </div>);

    return ret;
}

export default AddedCardToDeck;