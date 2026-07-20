import { useLocation, useNavigate } from 'react-router-dom';
import { retrieveToken, retrieveUserID, storeToken } from '../tokenStorage';
import { buildPath } from './Path';
import { useRef, useState } from 'react';

function CardDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const card = location.state?.card;

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const toAddOrRemove = useRef(false); // true = add, false = remove

    function toModifyCard(deck: any) {
        navigate(`/modifycard/${deck._id}`, { state: { deck:deck, card:card, addrm:toAddOrRemove.current } });
    }
    
    function createNewDeckDiv(deck:any, text:string, classNames:string) : HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'rounded-2xl m-4 border-5 bg-black flex items-center justify-center';
        div.classList.add(classNames);

        const button: HTMLButtonElement = document.createElement('button');
        button.textContent = text;
        button.className = 'flex-1 w-32 h-48 text-white'
        // console.log(deck)
        button.onclick = () => deck ? toModifyCard(deck) : {};

        div.appendChild(button);

        return div;
    }

    if (!card) {
        return (
            <div className='flex flex-col items-center gap-4 text-black p-8 font-grover' id="cardUIDiv">
                <p>No card data available. Please go back and select a card.</p>
                <button onClick={() => navigate(-1)} className='bg-main w-32'>Go Back</button>
            </div>
        );
    }

    async function getDecksByCardIn(e:any) : Promise<void>
        {
            e.preventDefault();
            let obj = {jwtToken: retrieveToken(), userId: JSON.parse(retrieveUserID()).id, cardId:card.id};
            let js = JSON.stringify(obj);
            
            try
            {
                const response = await fetch(buildPath('api/getdecksbycardin'),
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
    
                if (container) container.innerHTML = ``;
                results.forEach((element: any) => {
                    const div = createNewDeckDiv(element, element.deckName, "deckDiv");
                    container?.appendChild(div);
                });
            }
            catch(error:any)
            {
                setResults(error.toString());
            }
        };

    async function getDecksByCardOut(e:any) : Promise<void>
        {
            e.preventDefault();
            let obj = {jwtToken: retrieveToken(), userId: JSON.parse(retrieveUserID()).id, cardId:card.id};
            let js = JSON.stringify(obj);
            
            try
            {
                const response = await fetch(buildPath('api/getdecksbycardout'),
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
    
                if (container) container.innerHTML = ``;
                results.forEach((element: any) => {
                    const div = createNewDeckDiv(element, element.deckName, "deckDiv");
                    container?.appendChild(div);
                });
            }
            catch(error:any)
            {
                setResults(error.toString());
            }
        };

    const loadDecksToAdd = async (e: any): Promise<void> => {
        const container = document.getElementById("deckIsInIndicator");
        if (container) container.textContent = `${card.name} is not in these decks:`;
        toAddOrRemove.current = true;
        try {
            await getDecksByCardOut(e);
        } catch (err) {
            console.log(err);
        }
    };

    const loadDecksToRemove = async (e: any): Promise<void> => {
        const container = document.getElementById("deckIsInIndicator");
        if (container) container.textContent = `${card.name} is in these decks:`;
        toAddOrRemove.current = false;
        try {
            await getDecksByCardIn(e);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='flex justify-center text-black'>
            <div className='rounded-3xl w-full flex flex-col items-center justify-center gap-8 p-6' id="cardUIDiv">
                <div className='flex flex-col items-center justify-center'>
                    <button className="rounded-2xl w-32 h-16 m-4 border-5 bg-black color text-white" onClick={() => navigate(-1)}>Go Back</button>
                    <div className='flex flex-row gap-2'>
                        <img src={card.imageUrl} alt={card.name} className='h-96 rounded-xl' /> 
                        <div className='flex flex-col gap-2 items-center'>
                            <h1 className='text-2xl font-bold text-black'>{card.name}</h1>
                            <p>Type: {card.typeLine}</p>
                            <p>Rarity: {card.rarity}</p>
                            <p>Set: {card.setName}</p>
                            <p>Artist: {card.artist}</p> 
                            <button className="rounded-2xl w-32 h-16 m-4 border-5 bg-black color text-white" onClick={loadDecksToAdd}>Add to Deck</button>
                            <button className="rounded-2xl w-32 h-16 m-4 border-5 bg-black color text-white" onClick={loadDecksToRemove}>Remove from Deck</button>
                        </div>
                    </div>
                </div>
                <div id='bottomContentContainer' className='flex flex-col items-center justify-center'>
                    <div id='deckIsInIndicator'></div>
                    <div id='decksContainer' className='flex flex-row'></div>
                </div>
            </div>
        </div>
    );
}

export default CardDetails;