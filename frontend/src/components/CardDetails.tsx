import { useLocation, useNavigate } from 'react-router-dom';
import { retrieveToken, retrieveUserID, storeToken } from '../tokenStorage';
import { buildPath } from './Path';
import { parseApiJson } from './apiResponse';
import { useRef, useState } from 'react';
import cardStack from '../assets/cardStack.png';

function CardDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const card = location.state?.card;

    const [message,setMessage] = useState('');
    const toAddOrRemove = useRef(false);

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
                
                let res = await parseApiJson(response);
                if(res.error && res.error.length > 0){
                    setMessage(res.error);
                }
                else{
                    storeToken(res.jwtToken);
                }
    
                let results = res.results;
                
                const container = document.getElementById('decksContainer');
    
                if (container) container.innerHTML = '';
                results.forEach((element: any) => {
                    const normalizedDeck = normalizeDeck(element);
                    const div = createNewDeckDiv(normalizedDeck, normalizedDeck.deckName, 'deckDiv');
                    container?.appendChild(div);
                });
            }
            catch(error:any)
            {
                setMessage(error.toString());
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
                
                let res = await parseApiJson(response);
                if(res.error && res.error.length > 0){
                    setMessage(res.error);
                }
                else{
                    storeToken(res.jwtToken);
                }
    
                let results = res.results;
                
                const container = document.getElementById('decksContainer');
    
                if (container) container.innerHTML = '';
                results.forEach((element: any) => {
                    const normalizedDeck = normalizeDeck(element);
                    const div = createNewDeckDiv(normalizedDeck, normalizedDeck.deckName, 'deckDiv');
                    container?.appendChild(div);
                });
            }
            catch(error:any)
            {
                setMessage(error.toString());
            }
        };

    const loadDecksToAdd = async (e: any): Promise<void> => {
        const container = document.getElementById('deckIsInIndicator');
        if (container) container.textContent = `${card.name} is not in these decks:`;
        toAddOrRemove.current = true;
        try {
            await getDecksByCardOut(e);
        } catch (err) {
            console.log(err);
        }
    };

    const loadDecksToRemove = async (e: any): Promise<void> => {
        const container = document.getElementById('deckIsInIndicator');
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
                            <button className='secondary-button' onClick={() => navigate('/inventory')}>Back to Inventory</button>
                            <button className='primary-button' onClick={loadDecksToAdd}>Add to Deck</button>
                            <button className='secondary-button' onClick={loadDecksToRemove}>Remove from Deck</button>
                        </div>

                        <div id='bottomContentContainer' className='card-deck-panel'>
                            <h2 className='card-deck-title'>Deck placement</h2>
                            <p className='card-deck-copy'>Choose a deck below after selecting whether you want to add or remove this card.</p>
                            {message && <p className='text-red-600 mt-4'>{message}</p>}
                            <div id='deckIsInIndicator' className='card-deck-indicator'></div>
                            <div id='decksContainer' className='deck-grid w-full mt-6'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardDetails;