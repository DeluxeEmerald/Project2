import { useLocation, useNavigate } from 'react-router-dom';
import { retrieveToken, retrieveUserID, storeToken } from '../tokenStorage';
import { buildPath } from './Path';
<<<<<<< HEAD
import { useRef, useState } from 'react';
import cardStack from '../assets/cardStack.png';
=======
import { useRef } from 'react';
import deckImage from '../assets/deckImage.png';
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c

function CardDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const card = location.state?.card;

<<<<<<< HEAD
    const [message,setMessage] = useState('');
=======
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    const toAddOrRemove = useRef(false); // true = add, false = remove

    function normalizeDeck(deck: any) {
        if (!deck) return deck;
        return {
            ...deck,
            id: deck.id ?? deck._id,
        };
    }

    function toModifyCard(deck: any) {
        const normalizedDeck = normalizeDeck(deck);
        navigate(`/modifycard/${normalizedDeck.id}`, { state: { deck: normalizedDeck, card: card, addrm: toAddOrRemove.current } });
    }
    
    function createNewDeckDiv(deck: any, text: string, classNames: string): HTMLDivElement {
        const div = document.createElement('div');
<<<<<<< HEAD
        div.className = 'deck-card';
        div.classList.add(classNames);

        const button: HTMLButtonElement = document.createElement('button');
        button.className = 'deck-card-button';
        button.onclick = () => deck ? toModifyCard(deck) : {};

        const imageWrap = document.createElement('div');
        imageWrap.className = 'deck-card-image-wrap';

        const image = document.createElement('img');
        image.src = cardStack;
        image.alt = text;
        image.className = 'deck-card-image';

        const label = document.createElement('span');
        label.textContent = text;
        label.className = 'deck-card-name';

        const meta = document.createElement('span');
        meta.textContent = 'Choose deck';
        meta.className = 'deck-card-meta';

        imageWrap.appendChild(image);
        button.appendChild(imageWrap);
        button.appendChild(label);
        button.appendChild(meta);

        div.appendChild(button);
=======
        div.className = 'm-[25px] flex flex-col items-center w-32 h-80';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'w-32 h-64 flex flex-col items-center justify-center bg-cover bg-center shrink-0';
        if (deck) imageDiv.style.backgroundImage = `url(${deckImage})`;
        // classNames may contain multiple space-separated classes;
        // classList.add() can't take a single multi-class string, so split it
        classNames.split(' ').filter(Boolean).forEach(cls => imageDiv.classList.add(cls));

        const button: HTMLButtonElement = document.createElement('button');
        button.className = 'flex-1 w-32 h-64';
        button.onclick = () => (deck ? toModifyCard(deck) : {});
        imageDiv.appendChild(button);

        const textDiv = document.createElement('div');
        textDiv.textContent = text;
        // Fixed-height slot: same space reserved regardless of line count,
        // clamps to 2 lines and ellipsizes anything longer
        textDiv.className =
            'w-32 h-12 flex items-center justify-center text-center text-sm leading-tight ' +
            'overflow-hidden line-clamp-2 shrink-0';

        div.appendChild(imageDiv);
        div.appendChild(textDiv);
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c

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
                    console.log(res.error);
                }
                else{
                    storeToken(res.jwtToken);
                }
    
                let results = res.results;
                
                const container = document.getElementById("decksContainer");
    
                if (container) container.innerHTML = ``;
                results.forEach((element: any) => {
                    const normalizedDeck = normalizeDeck(element);
                    const div = createNewDeckDiv(normalizedDeck, normalizedDeck.deckName, "deckDiv");
                    container?.appendChild(div);
                });
            }
            catch(error:any)
            {
<<<<<<< HEAD
                setMessage(error.toString());
=======
                console.log(error.toString());
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
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
                    console.log(res.error);
                }
                else{
                    storeToken(res.jwtToken);
                }
    
                let results = res.results;
                
                const container = document.getElementById("decksContainer");
    
                if (container) container.innerHTML = ``;
                results.forEach((element: any) => {
                    const normalizedDeck = normalizeDeck(element);
                    const div = createNewDeckDiv(normalizedDeck, normalizedDeck.deckName, "deckDiv");
                    container?.appendChild(div);
                });
            }
            catch(error:any)
            {
<<<<<<< HEAD
                setMessage(error.toString());
=======
                console.log(error.toString());
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
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
<<<<<<< HEAD
            <div className='card-detail-shell' id="cardUIDiv">
                <div className='card-detail-layout'>
                    <div className='card-figure-panel'>
                        <img src={card.imageUrl} alt={card.name} className='card-detail-image' />
                    </div>

                    <div className='card-info-panel'>
                        <div className='card-header-row'>
                            <div>
                                <p className='brand-mark'>Card Details</p>
                                <h1 className='card-detail-title'>{card.name}</h1>
                                <p className='card-detail-subtitle'>Review this card, then add it to a deck or remove it from one of your existing builds.</p>
                            </div>
                            <span className='card-pill'>{card.rarity}</span>
                        </div>

                        <div className='card-meta-grid'>
                            <div className='card-meta-card'>
                                <span className='card-meta-label'>Type</span>
                                <span className='card-meta-value'>{card.typeLine}</span>
                            </div>
                            <div className='card-meta-card'>
                                <span className='card-meta-label'>Set</span>
                                <span className='card-meta-value'>{card.setName}</span>
                            </div>
                            <div className='card-meta-card'>
                                <span className='card-meta-label'>Artist</span>
                                <span className='card-meta-value'>{card.artist}</span>
                            </div>
                            <div className='card-meta-card'>
                                <span className='card-meta-label'>Mana Value</span>
                                <span className='card-meta-value'>{card.cmc ?? 'N/A'}</span>
                            </div>
                        </div>

                        <div className='card-action-row'>
                            <button className='secondary-button' onClick={() => navigate(`/inventory`)}>Back to Inventory</button>
                            <button className='primary-button' onClick={loadDecksToAdd}>Add to Deck</button>
                            <button className='secondary-button' onClick={loadDecksToRemove}>Remove from Deck</button>
                        </div>

                        <div id='bottomContentContainer' className='card-deck-panel'>
                            <h2 className='card-deck-title'>Deck placement</h2>
                            <p className='card-deck-copy'>Choose a deck below after selecting whether you want to add or remove this card.</p>
                            {message && <p className='text-red-600 mt-4'>{message}</p>}
                            <div id='deckIsInIndicator' className='card-deck-indicator'></div>
                            <div id='decksContainer' className='deck-grid w-full mt-6'></div>
=======
            <div className='rounded-3xl w-full flex flex-col items-center justify-center gap-8 p-6' id="cardUIDiv">
                <div className='flex flex-col items-center justify-center'>
                    <button className="rounded-2xl w-32 h-16 m-4 border-5 bg-main hover:text-black hover:bg-wood color text-white" onClick={() => navigate(`/inventory`)}>Go Back</button>
                    <div className='flex flex-row gap-2'>
                        <img src={card.imageUrl} alt={card.name} className='h-96 rounded-xl' /> 
                        <div className='flex flex-col gap-2 items-center'>
                            <h1 className='text-2xl font-bold text-black'>{card.name}</h1>
                            <p>Type: {card.typeLine}</p>
                            <p>Rarity: {card.rarity}</p>
                            <p>Set: {card.setName}</p>
                            <p>Artist: {card.artist}</p> 
                            <button className="rounded-2xl w-32 h-16 m-4 border-5 bg-main hover:text-black hover:bg-wood color text-white" onClick={loadDecksToAdd}>Add to Deck</button>
                            <button className="rounded-2xl w-32 h-16 m-4 border-5 bg-main hover:text-black hover:bg-wood color text-white" onClick={loadDecksToRemove}>Remove from Deck</button>
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardDetails;