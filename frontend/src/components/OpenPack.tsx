import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storeToken, retrieveToken, retrieveUserID } from '../tokenStorage';
import { buildPath } from './Path';
import packImage from '../assets/pack.png';
import { useNavigate } from 'react-router-dom';

interface PulledCard {
    id: string;
    name: string;
    imageUrl: string;
    rarity: string;
    typeLine: string;
    decision: 'pending' | 'accepted' | 'rejected';
}

function OpenPack()
{
    const navigate = useNavigate();

    const [message,setMessage] = useState('');
    const [showPack, setShowPack] = useState(true);
    const [pulledCards, setPulledCards] = useState<PulledCard[]>([]);

    const dynamicValue = window.innerWidth / 5; 
    const userId = JSON.parse(retrieveUserID()).id;
    const packBreakdownRef = useRef(pullCardRarities());

    function pullCardRarities() {
        const mythic_roll = Math.random() * 100;
        const rare_roll = Math.random() * 100;
        const num_mythics = mythic_roll < 1 ? 1 : 0;
        const num_rares = num_mythics == 1 ? (rare_roll < 27 ? 2 : 1) : (rare_roll < 2 ? 3 : rare_roll < 29 ? 2 : 1);
        const num_uncommons = 5 - num_mythics - num_rares;

        return { uncommon: num_uncommons, rare: num_rares, mythic: num_mythics };
    }

    async function searchCard(searchTerm: string, sampleSize: string): Promise<PulledCard[]> {
        let obj = {jwtToken: retrieveToken(), search: searchTerm, sample: sampleSize };
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('api/searchcards'),
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
            let _results = res.results;
            
            if (_results && _results.length > 0) {
                const randomIndex = Math.floor(Math.random() * _results.length);
                _results = [_results[randomIndex]];
            }

            return (_results || []).map((element: any) => ({
                id: String(element.id),
                name: element.name,
                imageUrl: element.imageUrl,
                rarity: element.rarity,
                typeLine: element.typeLine,
                decision: 'pending' as const,
            }));
        }
        catch (error: any) {
            console.log("Error");
            setMessage(error.toString());
            return [];
        }
    }

    const cards = packBreakdownRef.current;
    const totalCards = cards.uncommon + cards.rare + cards.mythic;
    const pendingCount = pulledCards.filter((card) => card.decision === 'pending').length;
    const showRarityBreakdown = !showPack && pendingCount > 0;

    async function pullType(cardType: string, cardNum: number): Promise<PulledCard[]> {
        let cardsPulled: PulledCard[] = [];
        for (var i = 0; i < cardNum; i++) {
            const pulledCard = await searchCard(cardType, "1");
            cardsPulled = [...cardsPulled, ...pulledCard];
        }
        return cardsPulled;
    }


    const pullCards = useCallback(async () => {
        const uncommon = await pullType("uncommon", cards.uncommon);
        const rare = await pullType("rare", cards.rare);
        const mythic = await pullType("mythic", cards.mythic);
        const nextCards = [...uncommon, ...rare, ...mythic].map((card, index) => ({
            ...card,
            slideDistance: `${dynamicValue * - (index - 2) / 2}px`,
        }));

        setPulledCards(nextCards as any);
    }, [cards, dynamicValue]);

    async function addToInventory(card: PulledCard): Promise<void> {
        const obj = {
            jwtToken: retrieveToken(),
            userID: userId,
            cardID: card.id,
            total: 1,
            CardName: card.name,
        };

        try {
            const response = await fetch(buildPath('api/addinventory'), {
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
            setPulledCards((current) => current.map((entry) => entry.id === card.id ? { ...entry, decision: 'accepted' } : entry));
            setMessage(`${card.name} added to inventory.`);
        }
        catch (error: any) {
            setMessage(error.toString());
        }
    }

    function rejectCard(card: PulledCard): void {
        setPulledCards((current) => current.map((entry) => entry.id === card.id ? { ...entry, decision: 'rejected' } : entry));
        setMessage(`${card.name} rejected.`);
    }

    const handleAnimationEnd = async () => {
        setShowPack(false);
    };

    const hasPulled = React.useRef(false);

    useEffect(() => {
        if (hasPulled.current) {
        return;
        }
        hasPulled.current = true;
        pullCards();
    }, []);
        
    return(
    <div id="cardUIDiv" className='pack-results-shell flex flex-col items-center justify-center gap-8'>
            <div className='pack-results-header w-full'>
                <div>
                    <p className='brand-mark'>Pack Reveal</p>
                    <h2 className='pack-results-title'>These cards were added to your inventory</h2>
                </div>
                <p className='pack-results-subtitle'>The pack reveal unfolds first, then your pulled cards settle into a cleaner results grid for quick review.</p>
            </div>
            {message && <p className='text-red-600'>{message}</p>}

            <div className='pack-results-layout w-full'>
                <div className='pack-reveal-panel'>
                    <div className='pack-reveal-stage w-full'>
                        {showPack && (<img id='packImage' className='pack-reveal-image' onAnimationEnd={handleAnimationEnd} style={{ animation:"forwards", animationName:"rotatePackAnimation", animationDuration:"3s", transformOrigin:"center center"}} src={packImage} alt="March of the Machine Epilogue Booster Pack"></img>)}
                        {!showPack && <div className='pack-opened-state'>Pack opened. Cards added to inventory.</div>}
                    </div>
                </div>

                <aside className='pack-summary-panel'>
                    <p className='pack-summary-label'>Pack Breakdown</p>
                    <div className='pack-summary-grid'>
                        <div className='pack-summary-card'>
                            <strong>{totalCards}</strong>
                            <span>Total Cards</span>
                        </div>
                        {showRarityBreakdown && (
                            <div className='pack-summary-card'>
                                <strong>{cards.uncommon}</strong>
                                <span>Uncommons</span>
                            </div>
                        )}
                        {showRarityBreakdown && (
                            <div className='pack-summary-card'>
                                <strong>{cards.rare}</strong>
                                <span>Rares</span>
                            </div>
                        )}
                        <div className='pack-summary-card'>
                            <strong>{showPack ? 0 : pendingCount}</strong>
                            <span>Pending</span>
                        </div>
                    </div>
                    <p className='pack-summary-copy'>Accept a card to add it to inventory, or reject it to skip adding it from this pack.</p>
                    <div className='pack-summary-actions'>
                        <button type='button' className='secondary-button' onClick={() => navigate('/packs')}>Back to Packs</button>
                        <button type='button' className='primary-button' onClick={() => window.location.reload()}>Open Another</button>
                    </div>
                </aside>
            </div>

            <div id='cardList' className='pack-results-grid w-full'>
                {!showPack && pulledCards.map((card, index) => (
                    <div
                        key={`${card.id}-${index}`}
                        className='pack-card'
                        style={{
                            ['--slide-distance' as any]: `${dynamicValue * - (index - 2) / 2}px`,
                            animationName: 'unfurlCardsFromCenterAnimation',
                            animationDuration: '3s',
                            animationFillMode: 'forwards',
                        }}
                    >
                        <img src={card.imageUrl} alt={card.name} className='pack-card-image' />
                        <div className='pack-card-name'>{card.name}</div>
                        <div className='pack-card-rarity'>{card.rarity}</div>
                        <div className='pack-card-type'>{card.typeLine}</div>
                        <div className='pack-card-actions'>
                            <button
                                type='button'
                                className='primary-button pack-action-button'
                                onClick={() => addToInventory(card)}
                                disabled={card.decision !== 'pending'}
                            >
                                Accept
                            </button>
                            <button
                                type='button'
                                className='secondary-button pack-action-button'
                                onClick={() => rejectCard(card)}
                                disabled={card.decision !== 'pending'}
                            >
                                Reject
                            </button>
                        </div>
                        <div className={`pack-card-status pack-card-status-${card.decision}`}>
                            {card.decision === 'pending' ? 'Awaiting decision' : card.decision}
                        </div>
                    </div>
                ))}
            </div>
            {/* <p style={{color:"black"}}>{JSON.stringify(cards)}</p> */}
    </div>
    );
}
export default OpenPack;