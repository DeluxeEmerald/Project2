<<<<<<< HEAD
import {useEffect, useRef, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';
import cardStack from '../assets/cardStack.png';

interface DeckItem {
    id?: string;
    _id?: string;
    deckID?: string;
    deckName: string;
}

function Decks()
{

    // let firstName : string = ud.firstName;
    // let lastName : string = ud.lastName;
    const [message,setMessage] = useState('');
    const [decks, setDecks] = useState<DeckItem[]>([]);
    const [showCreateDeck, setShowCreateDeck] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);
    const [deletingDeckId, setDeletingDeckId] = useState('');
=======
import {useEffect, useRef} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';
import deckImage from '../assets/deckImage.png';
import deckAddImage from '../assets/deckAddImage.png';

function Decks()
{
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    const hasLoaded = useRef(false);

    const navigate = useNavigate();

    function toDeckDetails(deck: any) {
        navigate(`/deckdetails/${deck.id}`, { state: { deck:deck } });
    }

<<<<<<< HEAD
    function normalizeDeck(deck: DeckItem): DeckItem {
        return {
            ...deck,
            id: deck.id ?? deck._id,
        };
    }

    function toDeckAdd() {
        setNewDeckName('');
        setShowCreateDeck(true);
    }

    async function createDeck(): Promise<void> {
        const deckName = newDeckName.trim();
        if (!deckName) {
            setMessage('Enter a deck name before creating it.');
            return;
        }

        const obj = {
            jwtToken: retrieveToken(),
            userId: JSON.parse(retrieveUserID()).id,
            deckName: deckName,
            public: false,
        };

        try {
            setIsCreatingDeck(true);
            const response = await fetch(buildPath('api/createdeck'), {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' },
            });

            const txt = await response.text();
            const res = JSON.parse(txt);
            if (res.error && res.error.length > 0) {
                setMessage(res.error);
                return;
            }

            storeToken(res.jwtToken);
            setMessage(`Created deck: ${deckName}`);
            setShowCreateDeck(false);
            setNewDeckName('');
            await getDecks(null);
        }
        catch (error:any)
        {
            setMessage(error.toString());
        }
        finally {
            setIsCreatingDeck(false);
        }
    }

    async function removeDeck(deck: DeckItem): Promise<void> {
        const deckName = deck.deckName || 'this deck';
        const resolvedDeckId = (deck.deckID ?? deck.id ?? '').toString();

        if (!resolvedDeckId) {
            setMessage('Could not determine which deck to remove.');
            return;
        }

        const confirmed = window.confirm(`Remove ${deckName}? This cannot be undone.`);
        if (!confirmed) {
            return;
        }

        const obj = {
            jwtToken: retrieveToken(),
            deckId: resolvedDeckId,
        };

        try {
            setDeletingDeckId(resolvedDeckId);
            const response = await fetch(buildPath('api/removedeck'), {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' },
            });

            const txt = await response.text();
            const res = JSON.parse(txt);

            if (res.error && res.error.length > 0) {
                setMessage(res.error);
                return;
            }

            storeToken(res.jwtToken);
            setMessage(`Removed deck: ${deckName}`);
            await getDecks(null);
        }
        catch (error:any)
        {
            setMessage(error.toString());
        }
        finally {
            setDeletingDeckId('');
        }
    }
=======
    function toDeckAdd() {
        navigate(`/createdeck`)
    }

function createNewDeckDiv(deck: any, text: string, classNames: string): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'm-[25px] flex flex-col items-center w-32 h-80';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'w-32 h-64 flex flex-col items-center justify-center bg-cover bg-center shrink-0';
    if (deck)
        imageDiv.style.backgroundImage = `url(${deckImage})`;
    else
        imageDiv.style.backgroundImage = `url(${deckAddImage})`;
    // classNames may contain multiple space-separated classes;
    // classList.add() can't take a single multi-class string, so split it
    classNames.split(' ').filter(Boolean).forEach(cls => imageDiv.classList.add(cls));

    const button: HTMLButtonElement = document.createElement('button');
    button.className = 'flex-1 w-32 h-64';
    button.onclick = () => (deck ? toDeckDetails(deck) : toDeckAdd());
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

    return div;
}
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c

    async function getDecks(e:any) : Promise<void>
    {
        if (e) e.preventDefault();
        let obj = {jwtToken: retrieveToken(), userId: JSON.parse(retrieveUserID()).id};
        let js = JSON.stringify(obj);
        
        try
        {
            const response = await fetch(buildPath('api/getdecks'),
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

            const results = (res.results || []).map((element: DeckItem) => normalizeDeck(element));
            setDecks(results);
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

    const loadDecks = async (e: any): Promise<void> => {
        try {
            await getDecks(e);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;
        loadDecks(null);
    }, []);
    
    return(
    <div id="cardUIDiv" className='deck-shell flex-col items-center justify-center gap-6'>
        <div className='deck-header w-full'>
            <div>
                <p className='brand-mark'>Decks</p>
                <h2 className='deck-title'>Organize your deck library</h2>
            </div>
            <p className='deck-subtitle'>Browse your saved decks, jump into deck details, or start a new build from the same collection workspace.</p>
        </div>

        {message && <p className='text-center text-red-600'>{message}</p>}
        <div id="decksContainer" className='deck-grid w-full'>
            {decks.map((deck) => (
                <div key={deck.id ?? deck.deckName} className='deck-card deckDiv'>
                    <div className='deck-card-button deck-card-content'>
                        <button type='button' className='deck-open-button' onClick={() => toDeckDetails(deck)}>
                            <div className='deck-card-image-wrap'>
                                <img src={cardStack} alt={deck.deckName} className='deck-card-image' />
                            </div>
                            <span className='deck-card-name block'>{deck.deckName}</span>
                            <span className='deck-card-meta block'>Open deck details</span>
                        </button>
                        <button
                            type='button'
                            className='secondary-button mt-3 w-full'
                            onClick={() => void removeDeck(deck)}
                            disabled={deletingDeckId === ((deck.deckID ?? deck.id ?? '').toString())}
                        >
                            {deletingDeckId === ((deck.deckID ?? deck.id ?? '').toString()) ? 'Removing...' : 'Remove deck'}
                        </button>
                    </div>
                </div>
            ))}

            <div className='deck-card deck-card-add deckDiv'>
                <button className='deck-card-button' onClick={toDeckAdd}>
                    <div className='deck-card-image-wrap'>
                        <img src={cardStack} alt='Add new deck' className='deck-card-image' />
                    </div>
                    <span className='deck-card-name'>Add new deck</span>
                    <span className='deck-card-meta'>Create a new deck</span>
                </button>
            </div>
        </div>

        {showCreateDeck && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                <div className='w-full max-w-md rounded-[28px] border border-[rgba(91,63,128,0.16)] bg-[rgba(255,252,255,0.96)] p-6 text-left shadow-[0_16px_28px_rgba(53,30,90,0.12)] backdrop-blur'>
                    <p className='brand-mark'>Create Deck</p>
                    <h2 className='mt-4 text-3xl text-[var(--text-h)]'>Name your new deck</h2>
                    <p className='mt-3 text-[var(--text-soft)]'>Create a new empty deck and it will appear in your deck grid immediately.</p>
                    <label className='mt-5 block'>
                        <span className='field-label'>Deck name</span>
                        <input
                            type='text'
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    void createDeck();
                                }
                            }}
                            className='text-input'
                            placeholder='Esper Artifacts'
                            autoFocus
                        />
                    </label>
                    <div className='mt-6 flex flex-wrap gap-3'>
                        <button type='button' className='secondary-button' onClick={() => setShowCreateDeck(false)} disabled={isCreatingDeck}>Cancel</button>
                        <button type='button' className='primary-button' onClick={() => void createDeck()} disabled={isCreatingDeck}>
                            {isCreatingDeck ? 'Creating...' : 'Create Deck'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}
export default Decks;