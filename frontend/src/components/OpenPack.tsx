import React, { useState, useEffect, useCallback } from 'react';
import { storeToken, retrieveToken, clearToken } from '../tokenStorage';
function OpenPack()
{

    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [showPack, setShowPack] = useState(true);

    const dynamicValue = window.innerWidth / 5; 

    interface cardEntry {
        name: string;
        html: string;
    }

    const app_name = 'cop4331-89.xyz';
    function buildPath(route: string): string
    {
        if (import.meta.env.MODE != 'development')
        {
            return 'http://' + app_name + ':5000/' + route;
        }
        else
        {
            return 'http://localhost:5000/' + route;
        }
    }

    async function searchCard(searchTerm: string, sampleSize: string): Promise<cardEntry[]> {
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
                setResults(res.results);
            }
            let _results = res.results;
            
            if (_results && _results.length > 0) {
                const randomIndex = Math.floor(Math.random() * _results.length);
                _results = [_results[randomIndex]];
            }

            var cardList: cardEntry[] = [];
            if (cardList) {
                _results.forEach((element: any) => {
                    const cardAdd = document.createElement('div');
                    console.log(element.name);
                    console.log("Pulled");
                    cardAdd.className = 'card';
                    cardAdd.innerHTML = `
                        <img src="${element.imageUrl}" alt="${element.name}" class='h-60 w-40 rounded-md'>`;
                    cardList.push({ "name":cardAdd.className, "html":cardAdd.innerHTML });
                });
            }
            return cardList;
        }
        catch (error: any) {
            console.log("Error");
            setResults(error.toString());
            return [];
        }
    }

    function pullCardRarities() {
        const mythic_roll = Math.random() * 100;
        const rare_roll = Math.random() * 100;
        const num_mythics = mythic_roll < 1 ? 1 : 0;
        const num_rares = num_mythics == 1 ? (rare_roll < 27 ? 2 : 1) : (rare_roll < 2 ? 3 : rare_roll < 29 ? 2 : 1);
        const num_uncommons = 5 - num_mythics - num_rares;

        return { "uncommon": num_uncommons, "rare": num_rares, "mythic": num_mythics }
    }

    const cards = pullCardRarities();

   // helper is now just a plain async function, no hooks inside
    async function pullType(cardType: any, cardNum: any): Promise<cardEntry[]> {
        var cardsPulled: cardEntry[] = [];
        for (var i = 0; i < cardNum; i++) {
            var pulledCard = await searchCard(cardType, "1");
            console.log("Pulled a " + cardType + " Card: " + pulledCard);
            cardsPulled = [...cardsPulled, ...pulledCard];
        }
        return cardsPulled;
    }


    const pullCards = useCallback(async () => {
        // Fetch data for card types
        const uncommon = await pullType("uncommon", cards.uncommon);
        const rare = await pullType("rare", cards.rare);
        const mythic = await pullType("mythic", cards.mythic);

        var container = document.getElementById("cardList") as HTMLDivElement;

        if (!container) return;

        const cardHTMLs: HTMLDivElement[] = [];

        // Process Uncommons
        uncommon.forEach((card) => {
            const cardHTMLAdd = document.createElement('div');
            cardHTMLAdd.className = "card";
            cardHTMLAdd.innerHTML = card.html;
            cardHTMLs.push(cardHTMLAdd);
        });

        // Process Rares
        rare.forEach((card) => {
            const cardHTMLAdd = document.createElement('div');
            cardHTMLAdd.className = "card";
            cardHTMLAdd.innerHTML = card.html;
            cardHTMLs.push(cardHTMLAdd);
        });

        // Process Mythic
        if (mythic && mythic[0]) {
            const cardHTMLAdd = document.createElement('div');
            cardHTMLAdd.className = "card";
            cardHTMLAdd.innerHTML = mythic[0].html;
            cardHTMLs.push(cardHTMLAdd);
        }

        // Apply styles/animations
        cardHTMLs.forEach((card, index) => {
            card.style.setProperty('--slide-distance', `${dynamicValue * - (index - 2) / 2}px`);
            card.style.setProperty("animation-name", "unfurlCardsFromCenterAnimation");
            card.style.setProperty("animation-duration", "3s");
            card.style.setProperty("animation-fill-mode", "forwards");
            card.style.setProperty("display", "none");
        });

        container.append(...cardHTMLs);
    }, [cards, dynamicValue]);

    const handleAnimationEnd = async () => {
        setShowPack(false);
        await new Promise(resolve => setTimeout(resolve, 10));
        var container = document.getElementById("cardList") as HTMLDivElement;
        console.log(container);     
        Array.from(container?.children).forEach(child => {
            (child as HTMLElement).style.setProperty("display", "inline");
        });
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
    <div id="cardUIDiv" style={{paddingBottom:"150px"}} className='rounded-3xl w-full flex flex-col items-center justify-center'>
            <h1 style={{color:"black", marginBottom:"126px"}}>These cards were added to your inventory:</h1>
            {showPack && (<img id='packImage' onAnimationEnd={handleAnimationEnd} style={{ animation:"forwards", animationName:"rotatePackAnimation", animationDuration:"3s", transformOrigin:"center center", maxWidth: '20%'}} src='src/assets/pack.png' alt="March of the Machine Epilogue Booster Pack"></img>)}
            <div id='cardList' className='flex flex-wrap gap-2 justify-center'></div>
            {/* <p style={{color:"black"}}>{JSON.stringify(cards)}</p> */}
    </div>
    );
}
export default OpenPack;