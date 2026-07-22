import {useEffect, useRef} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useLocation, useNavigate } from 'react-router-dom';
import Inventory from './Inventory';
import RemoveDeck from './DeleteDeck';


function DeckDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const deck = location.state?.deck;
    const cardIDs = deck.cards;

    const hasLoaded = useRef(false);


    if (!deck) {
        return (
            <div className='flex flex-col items-center gap-4 text-black p-8 font-grover' id="cardUIDiv">
                <p>No deck data available. Please go back and select a deck.</p>
                <button onClick={() => navigate('/decks')} className='bg-main w-32'>Go Back</button>
            </div>
        );
    }

    const handleDelete = (card: any) => {
        const confirmed = window.confirm('Are you sure you want to remove this card from the deck?');
        if (confirmed) {
            toCardRemoval(card);
        }
    };

    function ImageButton(imageSrc:string, cardName:string) : string {
    return `
        <button class="h-60 w-40 p-0 border-0 overflow-hidden rounded-[23px]" >
        <img src="${imageSrc}" alt="${cardName}" class="h-full w-full object-contain" />
        </button>
        `;
    }

    function toCardRemoval(card: any) {
        navigate(`/modifycard/${deck._id}`, { state: { deck:deck, card:card, addrm:false } });
    }

    async function searchCard(search: string) : Promise<void>
    {
        let obj2 = {jwtToken: retrieveToken(), userID: retrieveUserID(), search: search};
        let js2 = JSON.stringify(obj2);
        
        try
        {
            let response = null;

            response = await fetch(buildPath('api/searchcards'),
            {method:'POST',body:js2,headers:{'Content-Type':
            'application/json'}});
            
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                console.log(res.error);
            }
            else{
                storeToken(res.jwtToken);
            }

            let _results = res.results;

            _results = _results.map((element: any) => ({
                ...element,
                id: element.id ?? element.cardId
            }));

            const container = document.getElementById('deckCardsList');
            if (container) {
                _results.forEach((element: any) => {
                    const cardAdd = document.createElement('div');
                    cardAdd.className = 'card';
                    cardAdd.innerHTML = ImageButton(element.imageUrl, element.name);

                    cardAdd.querySelector('button')?.addEventListener('click', () => {
                        handleDelete(element);
                    });

                    container.appendChild(cardAdd);
                });
            }
        }
        catch(error:any)
        {
            console.log(error.toString());
        }
    };

    useEffect(() => {
    if (hasLoaded.current || !cardIDs) return;
    hasLoaded.current = true;

    async function loadDeckCards() {
        const container = document.getElementById('deckCardsList');
        if (container) container.innerHTML = 'Loading...';
        if (container) container.innerHTML = '';
        cardIDs.forEach((element: string) => {
            searchCard(element);
        });
    }
    loadDeckCards();
    }, []);

    return (
        <div className='flex flex-col justify-center text-black'>
            <div className='rounded-3xl w-full flex flex-col items-center justify-center gap-8 
            p-6' id="cardUIDiv">
                <div className='flex flex-row gap-8 justify-center'>   
                    <button className="mt-5 w-48 h-8 rounded-full text-white bg-main 
                    hover:bg-wood hover:text-black font-grover border-2 border-black" 
                    onClick={() => navigate("/decks")}>Go Back</button>
                    <RemoveDeck deckId={deck.deckID} />
                </div>
                <div className='flex flex-col items-center justify-center'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-4xl'>Deck Name: {deck.deckName}</p>
                            <div>Click on a card to remove it!</div>
                            <div id='deckCardsList' className='flex flex-wrap gap-2 
                            justify-center mb-4'></div>
                        </div>
                </div>
                <p className='text-black text-xl'>Add cards to deck</p>
                <Inventory inventoryOnly onCardClick={(card) => navigate(`/modifycard/${deck.ID}`, 
                    { state: { deck, card, addrm: true } })} />
            </div>
        </div>
    );
}

export default DeckDetails;