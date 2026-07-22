<<<<<<< HEAD
import {useEffect, useMemo, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, retrieveUserID, storeToken } from '../tokenStorage';
import { useLocation, useNavigate } from 'react-router-dom';

interface DeckData {
    id?: string;
    _id?: string;
    deckName?: string;
    name?: string;
    cards?: string[];
}

interface CardData {
    id: string;
    name: string;
    imageUrl: string;
    rarity?: string;
    cmc?: number;
    colors?: string[];
    typeLine?: string;
}

type SortOption = 'none' | 'alphabet' | 'manaCost' | 'rarity' | 'color';

const TYPE_OPTIONS = ['creature', 'land', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker'];
const RARITY_OPTIONS = ['common', 'uncommon', 'rare', 'mythic'];

function normalizeObjectId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && typeof value.$oid === 'string') return value.$oid;
    if (typeof value.toHexString === 'function') return value.toHexString();
    const asString = String(value);
    return asString === '[object Object]' ? '' : asString;
}

function normalizeCard(card: any): CardData {
    return {
        ...card,
        id: normalizeObjectId(card.id ?? card.cardId ?? card._id),
        name: card.name ?? 'Unknown card',
        imageUrl: card.imageUrl ?? '',
    };
}
=======
import {useEffect, useRef} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useLocation, useNavigate } from 'react-router-dom';
import Inventory from './Inventory';
import RemoveDeck from './DeleteDeck';
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c


function DeckDetails() {
    const location = useLocation();
    const navigate = useNavigate();
<<<<<<< HEAD
    const deck = location.state?.deck as DeckData | undefined;
    const deckId = normalizeObjectId(deck?.id ?? deck?._id);
    const deckTitle = deck?.deckName ?? deck?.name ?? 'Deck';

    const [message,setMessage] = useState('');
    const [search,setSearchValue] = useState('');
    const [deckCards, setDeckCards] = useState<CardData[]>([]);
    const [searchResults, setSearchResults] = useState<CardData[]>([]);
    const [isLoadingDeckCards, setIsLoadingDeckCards] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('none');
    const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({});
    const [selectedRarities, setSelectedRarities] = useState<Record<string, boolean>>({});
    const [inventoryCardIds, setInventoryCardIds] = useState<Set<string>>(new Set());
    const [inventoryOnly, setInventoryOnly] = useState(false);

    function toCardAdd(card: CardData) {
        navigate(`/modifycard/${deckId}`, { state: { deck: deck, card: card, addrm: true } });
    }

    function toCardRemoval(card: CardData) {
        navigate(`/modifycard/${deckId}`, { state: { deck: deck, card: card, addrm: false } });
    }

    function getSortComparator(): (a: CardData, b: CardData) => number {
        const rarityOrder: Record<string, number> = {
            common: 0, uncommon: 1, rare: 2, mythic: 3
        };
        const colorOrder: Record<string, number> = {
            W: 0, U: 1, B: 2, R: 3, G: 4
        };

        if (sortOption === 'alphabet') {
            return (a, b) => a.name.localeCompare(b.name);
        }

        if (sortOption === 'manaCost') {
            return (a, b) => (a.cmc ?? 0) - (b.cmc ?? 0);
        }

        if (sortOption === 'rarity') {
            return (a, b) => (rarityOrder[(a.rarity ?? '').toLowerCase()] ?? 99) -
                            (rarityOrder[(b.rarity ?? '').toLowerCase()] ?? 99);
        }

        if (sortOption === 'color') {
            return (a, b) => {
                const aColor = a.colors?.[0] ? colorOrder[a.colors[0]] : 99;
                const bColor = b.colors?.[0] ? colorOrder[b.colors[0]] : 99;
                return aColor - bColor;
            };
        }

        return () => 0;
    }

    function passesFilter(card: CardData): boolean {
        const activeTypes = TYPE_OPTIONS.filter((option) => selectedTypes[option]);
        const activeRarities = RARITY_OPTIONS.filter((option) => selectedRarities[option]);

        const typeLine = (card.typeLine ?? '').toLowerCase();
        const rarity = (card.rarity ?? '').toLowerCase();

        const typeMatch = activeTypes.length === 0 || activeTypes.some((option) => typeLine.includes(option));
        const rarityMatch = activeRarities.length === 0 || activeRarities.includes(rarity);

        return typeMatch && rarityMatch;
    }
=======
    const deck = location.state?.deck;
    const cardIDs = deck.cards;

    const hasLoaded = useRef(false);

>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c

    if (!deck) {
        return (
            <div className='flex flex-col items-center gap-4 text-black p-8 font-grover' id="cardUIDiv">
                <p>No deck data available. Please go back and select a deck.</p>
                <button onClick={() => navigate('/decks')} className='bg-main w-32'>Go Back</button>
            </div>
        );
    }

<<<<<<< HEAD
    const sortedFilteredSearchResults = useMemo(() => {
        return [...searchResults]
            .filter((card) => passesFilter(card))
            .filter((card) => !inventoryOnly || inventoryCardIds.has(card.id))
            .sort(getSortComparator());
    }, [searchResults, selectedTypes, selectedRarities, sortOption, inventoryOnly, inventoryCardIds]);

    function cardIsInInventory(card: CardData): boolean {
        return inventoryCardIds.has(card.id);
    }

    function handleAddCardClick(card: CardData): void {
        if (!cardIsInInventory(card)) {
            setMessage('You can only add cards that are in your inventory.');
            return;
=======
    const handleDelete = (card: any) => {
        const confirmed = window.confirm('Are you sure you want to remove this card from the deck?');
        if (confirmed) {
            toCardRemoval(card);
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
        }

        setMessage('');
        toCardAdd(card);
    }

    async function searchCardAdd(e:any) : Promise<void>
    {
        e.preventDefault();

        const endpoint = 'api/searchcards';
        const obj = { jwtToken: retrieveToken(), search: search };

        try
        {
            setIsSearching(true);
            const response = await fetch(buildPath(endpoint),
            {method:'POST',body:JSON.stringify(obj),headers:{'Content-Type':
            'application/json'}});

            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                console.log(res.error);
            }
            else{
                storeToken(res.jwtToken);
                setMessage('');
            }

            const normalized = (res.results || []).map((element: any) => normalizeCard(element));
            setSearchResults(normalized.filter((card: CardData) => card.id.length > 0));
        }
        catch(error:any)
        {
<<<<<<< HEAD
            setMessage(error.toString());
        }
        finally {
            setIsSearching(false);
        }
    };

    function toggleType(option: string) {
        setSelectedTypes((previous) => ({ ...previous, [option]: !previous[option] }));
=======
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
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    }

    function toggleRarity(option: string) {
        setSelectedRarities((previous) => ({ ...previous, [option]: !previous[option] }));
    }

    useEffect(() => {
        let isActive = true;

        async function loadInventoryCardIds() {
            try {
                const userId = JSON.parse(retrieveUserID()).id;
                const payload = { jwtToken: retrieveToken(), userID: userId };
                const response = await fetch(buildPath('api/getinventory'), {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                });

                const txt = await response.text();
                const res = JSON.parse(txt);
                if (res.error && res.error.length > 0) {
                    throw new Error(res.error);
                }

                storeToken(res.jwtToken);

                const inventoryIds = new Set<string>(
                    (res.results || [])
                        .map((element: any) => normalizeObjectId(element.id ?? element.cardId ?? element._id))
                        .filter((id: string) => id.length > 0)
                );

                if (isActive) {
                    setInventoryCardIds(inventoryIds);
                }
            } catch (error:any) {
                if (isActive) {
                    setMessage(error.toString());
                }
            }
        }

        void loadInventoryCardIds();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const cardIDs = (deck.cards || []).map((id) => normalizeObjectId(id)).filter((id) => id.length > 0);
        if (cardIDs.length === 0) {
            setDeckCards([]);
            return;
        }

        let isActive = true;

        async function loadDeckCards() {
            try {
                setIsLoadingDeckCards(true);
                const loadedCards = await Promise.all(
                    cardIDs.map(async (cardId) => {
                        const payload = { jwtToken: retrieveToken(), search: cardId };
                        const response = await fetch(buildPath('api/searchcards'), {
                            method: 'POST',
                            body: JSON.stringify(payload),
                            headers: { 'Content-Type': 'application/json' },
                        });

                        const txt = await response.text();
                        const res = JSON.parse(txt);
                        if (res.error && res.error.length > 0) {
                            throw new Error(res.error);
                        }

                        storeToken(res.jwtToken);
                        const firstMatch = (res.results || [])[0];
                        return firstMatch ? normalizeCard(firstMatch) : null;
                    })
                );

                if (isActive) {
                    setDeckCards(loadedCards.filter((card): card is CardData => card !== null));
                }
            } catch (error:any) {
                if (isActive) {
                    setMessage(error.toString());
                }
            } finally {
                if (isActive) {
                    setIsLoadingDeckCards(false);
                }
            }
        }

        void loadDeckCards();

        return () => {
            isActive = false;
        };
    }, [deck.cards]);

    return (
<<<<<<< HEAD
        <div className='deck-detail-shell text-black' id="cardUIDiv">
            <div className='deck-detail-header'>
                <div>
                    <p className='brand-mark'>Deck Details</p>
                    <h1 className='deck-detail-title'>{deckTitle}</h1>
                    <p className='deck-detail-copy'>Manage cards already in this deck and search for new cards to add.</p>
                </div>
                <button className='secondary-button' onClick={() => navigate('/decks')}>Back to Decks</button>
=======
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
                <Inventory inventoryOnly onCardClick={(card) => navigate(`/modifycard/${deck.id}`, 
                    { state: { deck:deck, card:card, addrm: true } })} />
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
            </div>

            <div className='deck-detail-grid'>
                <section className='deck-detail-panel'>
                    <div className='deck-detail-panel-head'>
                        <h2 className='deck-detail-section-title'>Cards in deck</h2>
                        <span className='deck-detail-pill'>{deckCards.length} cards</span>
                    </div>
                    <p className='deck-detail-subtle'>Click a card to remove it from this deck.</p>
                    {isLoadingDeckCards ? (
                        <p className='deck-detail-subtle'>Loading deck cards...</p>
                    ) : (
                        <div className='deck-detail-cards-grid'>
                            {deckCards.map((card) => (
                                <button key={card.id} className='deck-detail-card' type='button' onClick={() => toCardRemoval(card)}>
                                    <img src={card.imageUrl} alt={card.name} className='deck-detail-card-image' />
                                    <span className='deck-detail-card-name'>{card.name}</span>
                                </button>
                            ))}
                            {deckCards.length === 0 && <p className='deck-detail-subtle'>No cards found in this deck yet.</p>}
                        </div>
                    )}
                </section>

                <section className='deck-detail-panel'>
                    <div className='deck-detail-panel-head'>
                        <h2 className='deck-detail-section-title'>Add cards</h2>
                        <span className='deck-detail-pill'>{sortedFilteredSearchResults.length} results</span>
                    </div>

                    <form className='deck-detail-search-row' onSubmit={searchCardAdd}>
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className='text-input'
                            placeholder='Search cards by name, type, or id'
                        />
                        <button type='submit' className='primary-button' disabled={isSearching}>
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div className='deck-detail-control-row'>
                        <button type='button' className='secondary-button' onClick={() => setShowSort((previous) => !previous)}>Sort</button>
                        <button type='button' className='secondary-button' onClick={() => setShowFilters((previous) => !previous)}>Filters</button>
                        <label className='deck-detail-toggle'>
                            <input type='checkbox' checked={inventoryOnly} onChange={(e) => setInventoryOnly(e.target.checked)} />
                            Inventory only
                        </label>
                        <span className='deck-detail-pill'>Add requires inventory match</span>
                    </div>

                    {showSort && (
                        <div className='deck-detail-options-card'>
                            <p className='deck-detail-options-title'>Sort by</p>
                            <div className='deck-detail-options-grid'>
                                <label className='deck-detail-toggle'><input type='radio' name='sortOption' checked={sortOption === 'alphabet'} onChange={() => setSortOption('alphabet')} />Alphabet</label>
                                <label className='deck-detail-toggle'><input type='radio' name='sortOption' checked={sortOption === 'manaCost'} onChange={() => setSortOption('manaCost')} />Mana Cost</label>
                                <label className='deck-detail-toggle'><input type='radio' name='sortOption' checked={sortOption === 'rarity'} onChange={() => setSortOption('rarity')} />Rarity</label>
                                <label className='deck-detail-toggle'><input type='radio' name='sortOption' checked={sortOption === 'color'} onChange={() => setSortOption('color')} />Color</label>
                                <label className='deck-detail-toggle'><input type='radio' name='sortOption' checked={sortOption === 'none'} onChange={() => setSortOption('none')} />None</label>
                            </div>
                        </div>
                    )}

                    {showFilters && (
                        <div className='deck-detail-options-card'>
                            <p className='deck-detail-options-title'>Type</p>
                            <div className='deck-detail-options-grid'>
                                {TYPE_OPTIONS.map((option) => (
                                    <label key={option} className='deck-detail-toggle'>
                                        <input type='checkbox' checked={!!selectedTypes[option]} onChange={() => toggleType(option)} />
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </label>
                                ))}
                            </div>
                            <p className='deck-detail-options-title'>Rarity</p>
                            <div className='deck-detail-options-grid'>
                                {RARITY_OPTIONS.map((option) => (
                                    <label key={option} className='deck-detail-toggle'>
                                        <input type='checkbox' checked={!!selectedRarities[option]} onChange={() => toggleRarity(option)} />
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='deck-detail-cards-grid'>
                        {sortedFilteredSearchResults.map((card) => {
                            const isOwned = cardIsInInventory(card);

                            return (
                            <button
                                key={`${card.id}-add`}
                                className={`deck-detail-card ${isOwned ? '' : 'deck-detail-card-disabled'}`}
                                type='button'
                                onClick={() => handleAddCardClick(card)}
                                title={isOwned ? 'Add to deck' : 'This card is not in your inventory'}
                            >
                                <img src={card.imageUrl} alt={card.name} className='deck-detail-card-image' />
                                <span className='deck-detail-card-name'>{card.name}</span>
                                <span className={`deck-detail-card-status ${isOwned ? 'deck-detail-card-status-owned' : 'deck-detail-card-status-locked'}`}>
                                    {isOwned ? 'In inventory' : 'Not in inventory'}
                                </span>
                            </button>
                            );
                        })}
                        {!isSearching && sortedFilteredSearchResults.length === 0 && (
                            <p className='deck-detail-subtle'>Search for cards and click one to add it to this deck.</p>
                        )}
                    </div>
                </section>
            </div>

            {message && (
                <div className='deck-detail-message'>
                    {message}
                </div>
            )}
        </div>
    );
}

export default DeckDetails;